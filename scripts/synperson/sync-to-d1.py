#!/usr/bin/env /opt/homebrew/bin/python3
"""
sync-to-d1.py — Push local synperson profiles and events to Cloudflare D1.

Reads rig.yaml + events.md for each synperson in synpersons/ and upserts into
the D1 tables synpersons and synperson_events via `wrangler d1 execute`.

The local markdown/YAML files are always the source of truth.  Run this after
editing any rig.yaml or events.md file, and after evolve-events.py adds new
events.

Usage:
    python3 sync-to-d1.py              # sync all 30
    python3 sync-to-d1.py --id C1     # sync one synperson
    python3 sync-to-d1.py --dry-run   # print SQL, don't execute

Requirements:
    pip install pyyaml
    wrangler must be on PATH (npx wrangler or global install)
"""

import argparse
import json
import os
import re
import subprocess
import sys
import tempfile
from datetime import datetime, timezone
from pathlib import Path

import yaml

REPO_ROOT    = Path(__file__).resolve().parent.parent.parent
SYNPERSONS   = REPO_ROOT / "synpersons"
DB_NAME      = "quadrantology"


# ── Parsing ────────────────────────────────────────────────────────────────────

def load_rig(path: Path) -> dict:
    with open(path) as f:
        return yaml.safe_load(f)


def _extract_retcons(body: str) -> str | None:
    """Extract <!-- retcon: E001,E003 --> comment from event body, if present."""
    m = re.search(r'<!--\s*retcon:\s*([^>]+)\s*-->', body)
    if not m:
        return None
    keys = [k.strip() for k in re.split(r'[,\s]+', m.group(1)) if k.strip()]
    return ",".join(keys) if keys else None


def parse_events(path: Path) -> list[dict]:
    """
    Parse events.md and return a list of event dicts.

    Each dict:
        event_key, narrative_date, title, body, intensity, retcons, generated_by
    """
    text = path.read_text()
    events = []

    # Match each event block: ## E{NNN} · {date} · intensity: {N}
    pattern = re.compile(
        r'^## (E\d+[a-z]?)\s*·\s*([^·\n]+?)\s*·\s*intensity:\s*(\d+)\s*\n'
        r'\*\*(.+?)\*\*\s*\n'   # title line
        r'(.*?)'                  # body (lazy)
        r'^---\s*$',
        re.MULTILINE | re.DOTALL,
    )

    for m in pattern.finditer(text):
        event_key      = m.group(1).strip()
        narrative_date = m.group(2).strip()
        intensity      = int(m.group(3))
        title          = m.group(4).strip()
        body_raw       = m.group(5).strip()

        retcons     = _extract_retcons(body_raw)
        # Strip HTML comments from body before storing
        body_clean  = re.sub(r'<!--.*?-->', '', body_raw, flags=re.DOTALL).strip()

        # Infer generated_by from <!-- AI-generated --> comment in full text (header)
        # Events themselves don't carry provenance yet; default to 'human'
        generated_by = "human"

        events.append({
            "event_key":      event_key,
            "narrative_date": narrative_date,
            "title":          title,
            "body":           body_clean,
            "intensity":      intensity,
            "retcons":        retcons,
            "generated_by":   generated_by,
        })

    return events


def rig_to_synperson_row(rig: dict, synperson_id: str) -> dict:
    """Convert a rig.yaml dict to a synpersons table row dict."""
    identity = rig.get("identity", {})
    return {
        "id":            synperson_id,
        "archetype":     identity.get("archetype", ""),
        "name":          identity.get("name", ""),
        "hook":          None,       # populated later when made public
        "biography":     None,       # populated later when made public
        "status":        "active",
        "memory_params": json.dumps({
            "alpha": 0.5, "lambda": 0.004,
            "intensity_floor": 8, "max_events": 10,
        }),
        "public":    0,
        "first_run_at": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }


# ── SQL generation ─────────────────────────────────────────────────────────────

def _sql_str(v) -> str:
    """Escape a value for inline SQL."""
    if v is None:
        return "NULL"
    s = str(v).replace("'", "''")
    return f"'{s}'"


def synperson_upsert_sql(row: dict) -> str:
    return (
        "INSERT INTO synpersons "
        "(id, archetype, name, hook, biography, status, memory_params, public, first_run_at, created_at) "
        "VALUES ("
        f"{_sql_str(row['id'])}, "
        f"{_sql_str(row['archetype'])}, "
        f"{_sql_str(row['name'])}, "
        f"{_sql_str(row['hook'])}, "
        f"{_sql_str(row['biography'])}, "
        f"{_sql_str(row['status'])}, "
        f"{_sql_str(row['memory_params'])}, "
        f"{row['public']}, "
        f"{_sql_str(row['first_run_at'])}, "
        f"{_sql_str(row['created_at'])}"
        ") "
        "ON CONFLICT(id) DO UPDATE SET "
        "archetype=excluded.archetype, "
        "name=excluded.name, "
        "status=excluded.status;"
        # Note: memory_params, hook, biography, public are NOT overwritten on
        # re-sync so hand-tuned values in D1 survive a sync.
    )


def event_upsert_sql(synperson_id: str, ev: dict) -> str:
    now = datetime.now(timezone.utc).isoformat()
    return (
        "INSERT INTO synperson_events "
        "(synperson_id, event_key, narrative_date, title, body, intensity, "
        "retcons, generated_by, created_at) "
        "VALUES ("
        f"{_sql_str(synperson_id)}, "
        f"{_sql_str(ev['event_key'])}, "
        f"{_sql_str(ev['narrative_date'])}, "
        f"{_sql_str(ev['title'])}, "
        f"{_sql_str(ev['body'])}, "
        f"{ev['intensity']}, "
        f"{_sql_str(ev['retcons'])}, "
        f"{_sql_str(ev['generated_by'])}, "
        f"{_sql_str(now)}"
        ") "
        "ON CONFLICT(synperson_id, event_key) DO UPDATE SET "
        "narrative_date=excluded.narrative_date, "
        "title=excluded.title, "
        "body=excluded.body, "
        "intensity=excluded.intensity, "
        "retcons=excluded.retcons;"
    )


# ── Execution ──────────────────────────────────────────────────────────────────

def execute_sql(statements: list[str], dry_run: bool = False) -> None:
    sql = "\n".join(statements)
    if dry_run:
        print(sql)
        return

    with tempfile.NamedTemporaryFile(mode="w", suffix=".sql", delete=False) as f:
        f.write(sql)
        fname = f.name

    try:
        result = subprocess.run(
            ["wrangler", "d1", "execute", DB_NAME, "--file", fname, "--remote"],
            capture_output=True, text=True,
        )
        if result.returncode != 0:
            print("ERROR:", result.stderr or result.stdout, file=sys.stderr)
            sys.exit(1)
    finally:
        os.unlink(fname)


# ── Main ───────────────────────────────────────────────────────────────────────

def discover_synpersons(filter_id: str | None = None) -> list[tuple[str, Path]]:
    """Return list of (synperson_id, directory_path) tuples."""
    results = []
    for d in sorted(SYNPERSONS.iterdir()):
        if not d.is_dir() or d.name.startswith("_"):
            continue
        # Directory name format: {ID}_{first}_{last}  e.g. C1_david_feld
        parts = d.name.split("_", 1)
        if not parts:
            continue
        sid = parts[0].upper()
        if filter_id and sid.upper() != filter_id.upper():
            continue
        results.append((sid, d))
    return results


def sync_synperson(sid: str, directory: Path, dry_run: bool) -> int:
    """Sync one synperson. Returns number of SQL statements executed."""
    rig_path    = directory / "rig.yaml"
    events_path = directory / "events.md"

    if not rig_path.exists():
        print(f"  WARNING: no rig.yaml in {directory}, skipping", file=sys.stderr)
        return 0

    rig    = load_rig(rig_path)
    row    = rig_to_synperson_row(rig, sid)
    events = parse_events(events_path) if events_path.exists() else []

    statements = [synperson_upsert_sql(row)]
    for ev in events:
        statements.append(event_upsert_sql(sid, ev))

    execute_sql(statements, dry_run=dry_run)
    return len(statements)


def main() -> None:
    parser = argparse.ArgumentParser(description="Sync synperson YAML/markdown to D1.")
    parser.add_argument("--id",      help="Sync only this synperson ID (e.g. C1)")
    parser.add_argument("--dry-run", action="store_true",
                        help="Print SQL without executing")
    args = parser.parse_args()

    pairs = discover_synpersons(filter_id=args.id)
    if not pairs:
        print(f"No synpersons found{f' matching {args.id}' if args.id else ''}.",
              file=sys.stderr)
        sys.exit(1)

    total_stmts = 0
    for sid, directory in pairs:
        name = directory.name
        print(f"  {sid:4s}  {name}")
        n = sync_synperson(sid, directory, dry_run=args.dry_run)
        total_stmts += n

    verb = "Would execute" if args.dry_run else "Executed"
    print(f"\n{verb} {total_stmts} SQL statements for {len(pairs)} synperson(s).")


if __name__ == "__main__":
    main()
