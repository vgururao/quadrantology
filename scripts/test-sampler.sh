#!/usr/bin/env bash
# Test the /api/sample-questions endpoint.
# Runs N sequential samples (each using the previous run's QIDs as previous_runs),
# and prints a compact summary of each draw.
#
# Usage:
#   ./scripts/test-sampler.sh                # 3 runs against live CF Pages
#   ./scripts/test-sampler.sh 5              # 5 runs
#   ./scripts/test-sampler.sh 3 http://localhost:8788   # against local wrangler dev

set -euo pipefail

N="${1:-3}"
BASE="${2:-https://quadrantology.pages.dev}"
URL="${BASE}/api/sample-questions"

# Accumulate previous_runs as a JSON array of QID arrays (newest first)
previous_runs='[]'

echo "Sampler test — ${N} run(s) against ${URL}"
echo "────────────────────────────────────────────────────────────"

for i in $(seq 1 "$N"); do
  BODY=$(printf '{"previous_runs":%s}' "$previous_runs")
  RESPONSE=$(curl -sf -X POST "$URL" \
    -H 'Content-Type: application/json' \
    -d "$BODY")

  if [[ -z "$RESPONSE" ]]; then
    echo "Run $i: ERROR — empty response"
    continue
  fi

  # Extract fields with python3 (available on macOS without extra deps)
  /usr/local/bin/python3 - "$RESPONSE" "$i" <<'PYEOF'
import sys, json

raw   = sys.argv[1]
run_n = sys.argv[2]
d     = json.loads(raw)

if 'error' in d:
    print(f"Run {run_n}: ERROR — {d['error']}")
    sys.exit(0)

qs   = d.get('questions', [])
meta = d.get('meta', {})
ids  = [q['id'] for q in qs]
tc   = meta.get('type_counts', {})
tgt  = meta.get('targets', {})
parity = "OK" if meta.get('parity_ok') else "FAIL"
calib  = meta.get('calibration_used', 0)
overlap = meta.get('overlap_count', 0)
overlap_pct = meta.get('overlap_pct', 0)
coocc = meta.get('cooccurrence_loaded', 0)

print(f"Run {run_n}:  {len(ids)} questions  |  parity {parity}  |  calib slots {calib}  |  overlap {overlap} ({overlap_pct}%)  |  cooc window {coocc}")
print(f"  Types: ev {tc.get('ev','?')}/{tgt.get('ev','?')}  vc {tc.get('vc','?')}/{tgt.get('vc','?')}  vd {tc.get('vd','?')}/{tgt.get('vd','?')}  cd {tc.get('cd','?')}/{tgt.get('cd','?')}")
print(f"  QIDs:  {' '.join(ids)}")

# Show question text (truncated)
print(f"  Questions:")
for q in qs:
    a = q.get('a','')[:55]
    b = q.get('b','')[:55]
    st = q.get('status','?')[0].upper()  # L/C
    print(f"    [{st}] {q['id']}  A: {a!r}")
    print(f"           B: {b!r}")
PYEOF

  # Extract QID array from this run and prepend to previous_runs (keep newest first, max 3)
  THIS_QIDS=$(/usr/local/bin/python3 -c "
import sys, json
d = json.loads(sys.argv[1])
qs = d.get('questions', [])
print(json.dumps([q['id'] for q in qs]))
" "$RESPONSE")

  # Prepend this run, cap at 3
  previous_runs=$(/usr/local/bin/python3 -c "
import sys, json
prev = json.loads(sys.argv[1])
this = json.loads(sys.argv[2])
combined = [this] + prev
print(json.dumps(combined[:3]))
" "$previous_runs" "$THIS_QIDS")

  echo "────────────────────────────────────────────────────────────"
done
