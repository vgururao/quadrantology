#!/usr/bin/env /opt/homebrew/bin/python3
"""
evolve-events.py — Generate new diary events for a synperson via Claude API.

Reads the existing events.md, prompts Claude to continue the narrative with
1–5 new events following the events schema, appends them to events.md, and
logs the addition in research_log.md.

Run sync-to-d1.py afterwards to push new events to D1.

Usage:
    python3 evolve-events.py --id C1           # generate 1–5 events
    python3 evolve-events.py --id C1 --n 3     # request exactly 3
    python3 evolve-events.py --id C1 --dry-run # print output, don't write files

Environment variables required:
    ANTHROPIC_API_KEY

Requirements:
    pip install anthropic pyyaml
"""

import argparse
import os
import re
import sys
from datetime import date, datetime, timezone
from pathlib import Path

import anthropic
import yaml
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent.parent / ".env")

REPO_ROOT  = Path(__file__).resolve().parent.parent.parent
SYNPERSONS = REPO_ROOT / "synpersons"
MODEL      = "claude-sonnet-4-6"


def find_directory(sid: str) -> Path:
    prefix = sid.upper() + "_"
    for d in SYNPERSONS.iterdir():
        if d.is_dir() and d.name.upper().startswith(prefix):
            return d
    raise FileNotFoundError(f"No synperson directory for ID {sid!r}")


def load_rig(sid: str) -> dict:
    d = find_directory(sid)
    with open(d / "rig.yaml") as f:
        return yaml.safe_load(f)


def load_events_text(sid: str) -> str:
    d = find_directory(sid)
    p = d / "events.md"
    return p.read_text() if p.exists() else ""


def last_event_number(events_text: str) -> int:
    """Return the highest E{NNN} number seen in the file."""
    nums = re.findall(r'^## E(\d+)', events_text, re.MULTILINE)
    return max((int(n) for n in nums), default=0)


def build_prompt(rig: dict, events_text: str, n_events: int) -> str:
    identity = rig.get("identity", {})
    name     = identity.get("name", "Unknown")
    archetype = identity.get("archetype", "")

    today_str = date.today().strftime("%B %Y")

    return f"""You are continuing the event diary for a synthetic research persona named {name}, whose expected personality archetype is {archetype}.

The narrative date currency is the current real-world month: {today_str}. New events should be dated up to and including {today_str}.

Here is the person's full event diary so far:

{events_text.strip()}

---

Generate exactly {n_events} new event(s) to append to this diary. Follow these rules strictly:

1. Use the next sequential E{{NNN}} number(s) after the last event shown.
2. Date format: `YYYY-MM → YYYY-MM` for ranges, or a fuzzy label like `Fall 2025 → Spring 2026` for multi-season events. Single `YYYY-MM` only for genuinely instantaneous events.
3. Intensity 1–10 following the schema: 1–2 background, 3–4 notable, 5–6 significant, 7–8 defining, 9–10 catastrophic. Most events are 3–6.
4. Title: bold, 2–5 words, present tense headline style.
5. Body: first person, past tense. 2–4 sentences. Subjective experience — what the person felt, noticed, concluded. Causally coherent with prior events. No omniscience about others' motives.
6. Follow the intensity distribution: ~15% intensity 1–2, ~40% 3–4, ~30% 5–6, ~13% 7–8, ~2% 9–10.
7. Mix emotional valence: not every new event should be negative.
8. End each event block with `---` on its own line.

Output ONLY the new event block(s) in the exact same markdown format as the existing events, nothing else — no preamble, no commentary.

Example of correct format:
## E016 · 2026-04 → 2026-05 · intensity: 4
**The Report Lands Badly**

I submitted the quarterly summary expecting the usual non-response and instead got a reply within the hour asking me to explain three specific figures. I spent the afternoon preparing a defence I didn't think I'd need. The figures were correct. But the fact that I had to defend them at all left a residue I couldn't shake for the rest of the week.

---"""


def parse_new_events(raw: str, start_number: int) -> list[str]:
    """
    Extract event blocks from Claude's output.
    Returns a list of raw event block strings (each ending with ---).
    """
    # Split on '---' separators
    blocks = re.split(r'\n---\s*\n?', raw.strip())
    result = []
    for block in blocks:
        block = block.strip()
        if re.match(r'^## E\d+', block):
            result.append(block + "\n\n---")
    return result


def append_events(sid: str, new_blocks: list[str]) -> None:
    d = find_directory(sid)
    events_path = d / "events.md"
    current = events_path.read_text() if events_path.exists() else ""

    # Ensure file ends with a newline before appending
    if current and not current.endswith("\n"):
        current += "\n"

    with open(events_path, "w") as f:
        f.write(current)
        f.write("\n")
        for block in new_blocks:
            f.write(block + "\n\n")


def append_research_log(sid: str, name: str, new_blocks: list[str]) -> None:
    d = find_directory(sid)
    log_path = d / "research_log.md"

    # Create log if it doesn't exist
    if not log_path.exists():
        log_path.write_text(f"# {name} ({sid}) — Research Log\n\n")

    today = date.today().isoformat()
    entry_lines = [f"\n## {today} · Events generated by evolve-events.py\n"]
    for block in new_blocks:
        m = re.match(r'^## (E\d+[a-z]?)\s*·.*?·\s*intensity:\s*(\d+)\s*\n\*\*(.+?)\*\*', block)
        if m:
            entry_lines.append(
                f"**Event:** {m.group(1)} · intensity {m.group(2)} · \"{m.group(3)}\""
            )
    entry_lines.append(f"**Authored by:** {MODEL} (evolve-events.py)")
    entry_lines.append("**Runs at time of change:** see D1 synperson_runs table.")
    entry_lines.append("\n---")

    with open(log_path, "a") as f:
        f.write("\n".join(entry_lines) + "\n")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Generate new diary events for a synperson."
    )
    parser.add_argument("--id",      required=True, help="Synperson ID, e.g. C1")
    parser.add_argument("--n",       type=int, default=None,
                        help="Number of events to generate (default: stochastic 1–5)")
    parser.add_argument("--dry-run", action="store_true",
                        help="Print output without writing files")
    args = parser.parse_args()

    sid = args.id.upper()

    import random
    if args.n is not None:
        n_events = args.n
    else:
        # Approximate the schema's stochastic distribution
        r = random.random()
        n_events = 1 if r < 0.35 else 2 if r < 0.65 else 3 if r < 0.85 else 4 if r < 0.95 else 5

    rig          = load_rig(sid)
    name         = rig.get("identity", {}).get("name", sid)
    events_text  = load_events_text(sid)
    last_num     = last_event_number(events_text)

    print(f"[{sid}] {name} — {last_num} existing events. Generating {n_events} new event(s)…")

    prompt = build_prompt(rig, events_text, n_events)
    client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    msg    = client.messages.create(
        model=MODEL,
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}],
    )
    raw = msg.content[0].text.strip()

    new_blocks = parse_new_events(raw, last_num + 1)
    if not new_blocks:
        print("ERROR: No valid event blocks found in Claude's response.", file=sys.stderr)
        print("Raw response:\n", raw, file=sys.stderr)
        sys.exit(1)

    print(f"[{sid}] Generated {len(new_blocks)} event(s):")
    for block in new_blocks:
        m = re.match(r'^## (E\d+)', block)
        print(f"  {m.group(1) if m else '?'}: {block.splitlines()[1] if len(block.splitlines()) > 1 else ''}")

    if args.dry_run:
        print("\n── DRY RUN OUTPUT ──────────────────────────────────")
        for block in new_blocks:
            print(block)
            print()
        print("────────────────────────────────────────────────────")
        print("(dry-run: no files written)")
    else:
        append_events(sid, new_blocks)
        append_research_log(sid, name, new_blocks)
        print(f"[{sid}] events.md and research_log.md updated.")
        print(f"[{sid}] Run sync-to-d1.py --id {sid} to push new events to D1.")


if __name__ == "__main__":
    main()
