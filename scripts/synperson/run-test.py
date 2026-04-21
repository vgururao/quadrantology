#!/usr/bin/env /opt/homebrew/bin/python3
"""
run-test.py — Simulate a single synperson taking the Quadrantology test.

Fetches a balanced question sample from /api/sample-questions, builds a
prompt from the synperson's profile and active memories, calls the Claude
API, parses A/B answers, scores, and (in --logged mode) writes the result
to D1.

Usage:
    python3 run-test.py --id C1 --logged    # canonical run, persisted to D1
    python3 run-test.py --id C1 --qa        # validation run, printed only
    python3 run-test.py --id C1 --qa --verbose  # also print the full prompt

Environment variables required:
    ANTHROPIC_API_KEY   — Claude API key
    SYNPERSON_BASE_URL  — base URL for the Quadrantology API
                          e.g. https://quadrantology.pages.dev  (staging)
                               http://localhost:8788            (wrangler dev)

D1 access uses `wrangler d1 execute` for writes (no direct HTTP access to D1).

Requirements:
    pip install anthropic pyyaml requests
"""

import argparse
import json
import os
import re
import subprocess
import sys
import tempfile
from datetime import date, datetime, timezone
from pathlib import Path

import anthropic
import requests
import yaml
from dotenv import load_dotenv

# Load .env from repo root (quadrantology/.env)
load_dotenv(Path(__file__).resolve().parent.parent.parent / ".env")

# Add scripts/synperson/ to path for sibling module imports
sys.path.insert(0, str(Path(__file__).parent))
from memory import select_events
from scoring import score

REPO_ROOT  = Path(__file__).resolve().parent.parent.parent
SYNPERSONS = REPO_ROOT / "synpersons"
DB_NAME    = "quadrantology"
MODEL      = "claude-sonnet-4-6"


# ── Synperson loading ──────────────────────────────────────────────────────────

def find_directory(synperson_id: str) -> Path:
    prefix = synperson_id.upper() + "_"
    for d in SYNPERSONS.iterdir():
        if d.is_dir() and d.name.upper().startswith(prefix):
            return d
    raise FileNotFoundError(f"No synperson directory for ID {synperson_id!r}")


def load_rig(sid: str) -> dict:
    d = find_directory(sid)
    with open(d / "rig.yaml") as f:
        return yaml.safe_load(f)


def load_events(sid: str) -> list[dict]:
    d = find_directory(sid)
    events_path = d / "events.md"
    if not events_path.exists():
        return []
    # Reuse the parser from sync-to-d1.py
    sys.path.insert(0, str(Path(__file__).parent))
    from sync_to_d1_parser import parse_events
    return parse_events(events_path)


def _parse_events_inline(path: Path) -> list[dict]:
    """Inline event parser (avoids import-name collision with sync-to-d1)."""
    text = path.read_text()
    events = []
    pattern = re.compile(
        r'^## (E\d+[a-z]?)\s*·\s*([^·\n]+?)\s*·\s*intensity:\s*(\d+)\s*\n'
        r'\*\*(.+?)\*\*\s*\n'
        r'(.*?)'
        r'^---\s*$',
        re.MULTILINE | re.DOTALL,
    )
    for m in pattern.finditer(text):
        body_raw = m.group(5).strip()
        body     = re.sub(r'<!--.*?-->', '', body_raw, flags=re.DOTALL).strip()
        retcons_m = re.search(r'<!--\s*retcon:\s*([^>]+)\s*-->', body_raw)
        retcons   = retcons_m.group(1).strip() if retcons_m else None
        events.append({
            "event_key":      m.group(1).strip(),
            "narrative_date": m.group(2).strip(),
            "title":          m.group(4).strip(),
            "body":           body,
            "intensity":      int(m.group(3)),
            "retcons":        retcons,
            "generated_by":   "human",
        })
    return events


# ── D1 interaction ─────────────────────────────────────────────────────────────

def _sql_str(v) -> str:
    if v is None:
        return "NULL"
    return "'" + str(v).replace("'", "''") + "'"


def d1_query(sql: str) -> list[dict]:
    """Run a SELECT via wrangler and return rows as list of dicts."""
    with tempfile.NamedTemporaryFile(mode="w", suffix=".sql", delete=False) as f:
        f.write(sql)
        fname = f.name
    try:
        result = subprocess.run(
            ["wrangler", "d1", "execute", DB_NAME, "--file", fname,
             "--remote", "--json"],
            capture_output=True, text=True,
        )
        if result.returncode != 0:
            raise RuntimeError(result.stderr or result.stdout)
        data = json.loads(result.stdout)
        # wrangler --json returns a list; first element has .results
        return data[0].get("results", []) if data else []
    finally:
        os.unlink(fname)


def d1_execute(sql: str) -> None:
    """Run a DML statement via wrangler."""
    with tempfile.NamedTemporaryFile(mode="w", suffix=".sql", delete=False) as f:
        f.write(sql)
        fname = f.name
    try:
        result = subprocess.run(
            ["wrangler", "d1", "execute", DB_NAME, "--file", fname, "--remote"],
            capture_output=True, text=True,
        )
        if result.returncode != 0:
            raise RuntimeError(result.stderr or result.stdout)
    finally:
        os.unlink(fname)


def fetch_synperson_from_d1(sid: str) -> dict | None:
    rows = d1_query(f"SELECT * FROM synpersons WHERE id = {_sql_str(sid)};")
    return rows[0] if rows else None


def fetch_previous_run_qids(sid: str, last_n: int = 3) -> list[list[str]]:
    """Return the last N logged runs' qid arrays, newest first."""
    rows = d1_query(
        f"SELECT run_data FROM synperson_runs "
        f"WHERE synperson_id = {_sql_str(sid)} AND run_type = 'logged' "
        f"ORDER BY run_number DESC LIMIT {last_n};"
    )
    result = []
    for row in rows:
        try:
            rd = json.loads(row["run_data"])
            qids = [r["qid"] for r in rd.get("run", [])]
            result.append(qids)
        except (json.JSONDecodeError, KeyError):
            pass
    return result


def fetch_next_run_number(sid: str) -> int:
    rows = d1_query(
        f"SELECT COALESCE(MAX(run_number), 0) AS max_rn FROM synperson_runs "
        f"WHERE synperson_id = {_sql_str(sid)};"
    )
    return (rows[0]["max_rn"] if rows else 0) + 1


def store_run(sid: str, run_number: int, run_data: dict,
              prompt_text: str, events_sampled: list[str],
              run_type: str) -> None:
    now = datetime.now(timezone.utc).isoformat()
    sql = (
        "INSERT INTO synperson_runs "
        "(synperson_id, run_number, run_data, prompt_text, events_sampled, model_used, run_type, created_at) "
        f"VALUES ({_sql_str(sid)}, {run_number}, {_sql_str(json.dumps(run_data))}, "
        f"{_sql_str(prompt_text)}, {_sql_str(','.join(events_sampled))}, "
        f"{_sql_str(MODEL)}, {_sql_str(run_type)}, {_sql_str(now)});"
    )
    d1_execute(sql)

    # Mark first_run_at if this is the first logged run
    if run_type == "logged":
        d1_execute(
            f"UPDATE synpersons SET first_run_at = {_sql_str(now)} "
            f"WHERE id = {_sql_str(sid)} AND first_run_at IS NULL;"
        )


# ── Sample questions from API ──────────────────────────────────────────────────

def fetch_questions(base_url: str, previous_runs: list[list[str]]) -> list[dict]:
    url = base_url.rstrip("/") + "/api/sample-questions"
    for attempt in range(3):
        try:
            resp = requests.post(url, json={"previous_runs": previous_runs}, timeout=15)
            resp.raise_for_status()
            return resp.json()["questions"]
        except Exception as e:
            if attempt == 2:
                raise
            import time; time.sleep(3)
    raise RuntimeError("unreachable")


# ── Prompt construction ────────────────────────────────────────────────────────

def build_prompt(rig: dict, active_events: list[dict], questions: list[dict]) -> str:
    identity = rig.get("identity", {})
    demo     = rig.get("demographics", {})
    work     = rig.get("work", {})
    loc      = rig.get("location", {})
    finances = rig.get("finances", {})
    politics = rig.get("politics", {})
    health   = rig.get("health", {})

    name      = identity.get("name", "Unknown")
    archetype = identity.get("archetype", "")

    # Build a concise character summary from structured YAML fields
    age = ""
    if birth := demo.get("birth_date"):
        try:
            born = datetime.strptime(birth, "%Y-%m-%d").date()
            age  = f", {(date.today() - born).days // 365} years old"
        except ValueError:
            pass

    char_lines = [
        f"You are {name}{age}.",
        f"You live in {loc.get('city', '')}, {loc.get('country', '')}.",
        f"You work as {work.get('role', '')} at {work.get('employer', '')} ({work.get('industry', '')}).",
    ]

    if leaning := politics.get("leaning"):
        char_lines.append(f"Political/personal outlook: {leaning}")
    if religion := politics.get("religion"):
        char_lines.append(f"Religion/worldview: {religion}")

    # Key relationships (compressed)
    rels = rig.get("relationships", [])
    if rels:
        rel_stubs = [
            f"{r['name']} ({r['relation']}): {r.get('stub','')}"
            for r in rels[:4]
        ]
        char_lines.append("Key relationships: " + " | ".join(rel_stubs))

    # Active memories
    memory_section = ""
    if active_events:
        memory_lines = []
        for ev in active_events:
            memory_lines.append(
                f"[{ev['event_key']} · {ev['narrative_date']} · intensity {ev['intensity']}] "
                f"{ev['title']}\n{ev['body']}"
            )
        memory_section = (
            "\n\nYour relevant memories (formative experiences that shape how you see the world):\n\n"
            + "\n\n".join(memory_lines)
        )

    # Questions
    q_lines = []
    for i, q in enumerate(questions, 1):
        q_lines.append(f"Q{i} [{q['id']}]: A) {q['a']}  |  B) {q['b']}")

    questions_section = "\n".join(q_lines)

    prompt = (
        "\n".join(char_lines)
        + memory_section
        + f"""

You are taking a personality questionnaire about how you experience your professional and organisational life. Answer each question as yourself — honestly and instinctively, based on your actual experiences and values. Do not try to appear a particular way.

For each question choose A or B (whichever feels more true, even if neither is perfect). Do not explain your answers.

{questions_section}

Respond with ONLY a JSON object in this exact format, with one key per question ID:
{{"Q001": "a", "Q002": "b", ...}}

Use lowercase 'a' or 'b' only. Include every question listed above."""
    )

    return prompt


# ── Claude API call ────────────────────────────────────────────────────────────

def call_claude(prompt: str) -> str:
    """Call Claude and return the raw response text."""
    client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    msg = client.messages.create(
        model=MODEL,
        max_tokens=512,
        messages=[{"role": "user", "content": prompt}],
    )
    return msg.content[0].text


def parse_answers(response_text: str, questions: list[dict]) -> list[str]:
    """
    Extract answers from Claude's JSON response.
    Returns a list of 'a'/'b' strings in the same order as questions.
    """
    # Find the JSON object in the response
    m = re.search(r'\{[^}]+\}', response_text, re.DOTALL)
    if not m:
        raise ValueError(f"No JSON object found in Claude response:\n{response_text}")

    try:
        raw = json.loads(m.group(0))
    except json.JSONDecodeError as e:
        raise ValueError(f"Could not parse JSON from Claude response: {e}\n{response_text}")

    answers = []
    for q in questions:
        ans = raw.get(q["id"], "").lower().strip()
        if ans not in ("a", "b"):
            raise ValueError(
                f"Missing or invalid answer for {q['id']!r} in Claude response. "
                f"Got: {ans!r}\nFull response: {response_text}"
            )
        answers.append(ans)
    return answers


# ── Main ───────────────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(
        description="Run a Quadrantology test for a synperson."
    )
    parser.add_argument("--id",      required=True, help="Synperson ID, e.g. C1")
    mode_grp = parser.add_mutually_exclusive_group(required=True)
    mode_grp.add_argument("--logged", action="store_true",
                          help="Canonical run — persisted to D1")
    mode_grp.add_argument("--qa",    action="store_true",
                          help="Validation run — printed only, not stored")
    parser.add_argument("--verbose", action="store_true",
                        help="Print the full prompt before calling Claude")
    parser.add_argument("--base-url",
                        default=os.environ.get("SYNPERSON_BASE_URL",
                                               "https://quadrantology.pages.dev"),
                        help="Base URL for the Quadrantology API")
    args = parser.parse_args()

    sid       = args.id.upper()
    run_mode  = "logged" if args.logged else "qa"

    print(f"[{sid}] Loading profile…")
    rig = load_rig(sid)
    name = rig.get("identity", {}).get("name", sid)

    # Load events from local markdown
    events_path = find_directory(sid) / "events.md"
    all_events  = _parse_events_inline(events_path) if events_path.exists() else []
    print(f"[{sid}] {len(all_events)} events loaded from events.md")

    # Fetch memory params from D1 (fall back to defaults if synperson not yet synced)
    try:
        d1_row = fetch_synperson_from_d1(sid)
        mem_params = json.loads(d1_row["memory_params"]) if d1_row else {}
    except Exception:
        mem_params = {}

    defaults = {"alpha": 0.5, "lambda": 0.004, "intensity_floor": 8, "max_events": 10}
    params   = {**defaults, **mem_params}

    # Select active events using memory model
    memory_mode  = "qa" if args.qa else "logged"
    active_events = select_events(all_events, params, mode=memory_mode)
    event_keys   = [ev["event_key"] for ev in active_events]
    print(f"[{sid}] Memory: {len(active_events)}/{len(all_events)} events active "
          f"({', '.join(event_keys)})")

    # Fetch previous run QIDs for overlap avoidance
    try:
        previous_runs = fetch_previous_run_qids(sid, last_n=3)
    except Exception:
        previous_runs = []
    print(f"[{sid}] Previous logged runs for overlap avoidance: {len(previous_runs)}")

    # Fetch balanced question sample
    print(f"[{sid}] Fetching questions from {args.base_url}…")
    questions = fetch_questions(args.base_url, previous_runs)
    print(f"[{sid}] {len(questions)} questions sampled")

    # Build prompt
    prompt = build_prompt(rig, active_events, questions)
    if args.verbose:
        print("\n── PROMPT ──────────────────────────────────────────")
        print(prompt)
        print("────────────────────────────────────────────────────\n")

    # Call Claude (retry once on parse failure)
    print(f"[{sid}] Calling Claude ({MODEL})…")
    response_text = call_claude(prompt)
    try:
        answers = parse_answers(response_text, questions)
    except ValueError as e:
        print(f"[{sid}] Parse error — retrying Claude call: {e}")
        response_text = call_claude(prompt)
        answers = parse_answers(response_text, questions)

    # Score
    result = score(questions, answers)
    archetype = result["archetype"]
    ev_pos    = result["ev_pos"]
    ethics    = result["ethics"]

    print(f"\n[{sid}] {name}")
    print(f"  Archetype : {archetype}")
    print(f"  E↔V pos   : {ev_pos:+.3f}  ({'Exit' if ev_pos > 0 else 'Voice'})")
    print(f"  Ethics    : Virtue {ethics['virtue']:.0%}  "
          f"Conseq {ethics['consequentialist']:.0%}  "
          f"Deont {ethics['deontological']:.0%}")
    print(f"  Expected  : {rig.get('identity', {}).get('archetype', '?')}")

    if run_mode == "logged":
        now       = datetime.now(timezone.utc).isoformat()
        run_number = fetch_next_run_number(sid)

        # Full v2 run record (mirrors test.html format)
        run_data = {
            "version":        2,
            "timestamp":      now,
            "run_number":     run_number,
            "archetype":      archetype,
            "ev_bias":        result["ev_bias"],
            "scores": {
                "exit":            result["scores"]["exit"],
                "voice":           result["scores"]["voice"],
                "virtue":          result["scores"]["virtue"],
                "consequentialist": result["scores"]["consequentialist"],
                "deontological":   result["scores"]["deontological"],
            },
            "position": {
                "ev":     ev_pos,
                "ethics": ethics,
            },
            "run": result["run"],
        }

        print(f"\n[{sid}] Storing run #{run_number} to D1…")
        store_run(
            sid, run_number, run_data,
            prompt_text=prompt,
            events_sampled=event_keys,
            run_type="logged",
        )
        print(f"[{sid}] Run #{run_number} stored. ✓")
    else:
        print(f"\n[{sid}] QA mode — result not stored.")


if __name__ == "__main__":
    main()
