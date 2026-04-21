#!/usr/bin/env /opt/homebrew/bin/python3
"""
run-panel.py — Batch run all 30 synpersons.

Runs the full synperson panel in randomized order with rate-limiting gaps
between runs. Delegates to run-test.py for each individual run.

Usage:
    python3 run-panel.py --logged             # canonical run for all 30
    python3 run-panel.py --qa                 # validation run for all 30
    python3 run-panel.py --logged --ids C1,C2 # subset only
    python3 run-panel.py --logged --dry-run   # print what would run, no calls

Environment variables required:
    ANTHROPIC_API_KEY
    SYNPERSON_BASE_URL  (optional; defaults to staging)

Requirements: same as run-test.py
"""

import argparse
import os
import random
import subprocess
import sys
import time
from pathlib import Path

REPO_ROOT  = Path(__file__).resolve().parent.parent.parent
SYNPERSONS = REPO_ROOT / "synpersons"
SCRIPT     = Path(__file__).parent / "run-test.py"
PYTHON     = "/opt/homebrew/bin/python3"

# Seconds to wait between synperson runs
GAP_MIN = 2
GAP_MAX = 5


def discover_all_ids() -> list[str]:
    ids = []
    for d in sorted(SYNPERSONS.iterdir()):
        if d.is_dir() and not d.name.startswith("_"):
            sid = d.name.split("_", 1)[0].upper()
            if sid:
                ids.append(sid)
    return ids


def run_one(sid: str, mode: str, base_url: str, verbose: bool) -> bool:
    """
    Run run-test.py for one synperson.
    Returns True on success, False on failure.
    """
    cmd = [
        PYTHON, str(SCRIPT),
        "--id", sid,
        f"--{mode}",
        "--base-url", base_url,
    ]
    if verbose:
        cmd.append("--verbose")

    env = dict(os.environ)
    result = subprocess.run(cmd, env=env, text=True)
    return result.returncode == 0


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Batch run all synpersons through the Quadrantology test."
    )
    mode_grp = parser.add_mutually_exclusive_group(required=True)
    mode_grp.add_argument("--logged", action="store_true")
    mode_grp.add_argument("--qa",     action="store_true")
    parser.add_argument("--ids",     help="Comma-separated subset of IDs (default: all 30)")
    parser.add_argument("--dry-run", action="store_true",
                        help="Print run order without executing")
    parser.add_argument("--verbose", action="store_true")
    parser.add_argument("--base-url",
                        default=os.environ.get("SYNPERSON_BASE_URL",
                                               "https://quadrantology.pages.dev"))
    args = parser.parse_args()

    mode = "logged" if args.logged else "qa"

    if args.ids:
        ids = [i.strip().upper() for i in args.ids.split(",") if i.strip()]
    else:
        ids = discover_all_ids()

    # Randomise order (avoid systematic question-sequence bias)
    random.shuffle(ids)

    print(f"Panel run — mode={mode}, {len(ids)} synpersons")
    print(f"Order: {' '.join(ids)}\n")

    if args.dry_run:
        for i, sid in enumerate(ids, 1):
            print(f"  {i:2d}. {sid}")
        print("\n(dry-run: no runs executed)")
        return

    successes = []
    failures  = []

    for i, sid in enumerate(ids, 1):
        print(f"\n── [{i}/{len(ids)}] {sid} ──────────────────────────────────")
        ok = run_one(sid, mode, args.base_url, args.verbose)
        if ok:
            successes.append(sid)
        else:
            failures.append(sid)
            print(f"  FAILED: {sid} — continuing with next synperson")

        if i < len(ids):
            gap = random.uniform(GAP_MIN, GAP_MAX)
            time.sleep(gap)

    # Panel summary
    print("\n" + "=" * 56)
    print(f"Panel complete: {len(successes)} succeeded, {len(failures)} failed")
    if failures:
        print(f"Failed: {', '.join(failures)}")
        print("Retry individually: python3 run-test.py --id <ID> --" + mode)
        sys.exit(1)


if __name__ == "__main__":
    main()
