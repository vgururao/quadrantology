// POST /api/sample-questions
// Pairwise tie-free sampling with co-occurrence diversification.
//
// Guarantees an ODD count for each of the 4 comparison types:
//   ev  — exit vs voice
//   vc  — virtue vs conseq
//   vd  — virtue vs deont
//   cd  — conseq vs deont
//
// Odd counts make pairwise ties structurally impossible.
// Circular orderings (virtue > conseq > deont > virtue) are valid results.
//
// Sampler uses the question_sequences log to:
//   1. Penalize candidates that frequently co-occur with already-selected questions,
//      preventing the same combinations from locking in when the pool is small.
//   2. Sort by last_sampled_at so recently-served questions yield to older ones,
//      independent of total times_sampled count.
//
// Request body (JSON):
//   previous_runs   string[][]  QID arrays from recent runs, newest first ([] for first run)
//                               Used for multi-run overlap avoidance — no server-side user tracking.
//   previous_qids   string[]    Legacy: last run's QIDs (used if previous_runs absent)
//   ev_target       number?     Override ev count (rounded up to odd)
//   vc_target       number?     Override vc count
//   vd_target       number?     Override vd count
//   cd_target       number?     Override cd count
//   calibration_slots number?   Override protocol default
//   cooccurrence_window number? Sequences to load for co-occurrence (default 200, 0 to disable)
//
// Response (JSON):
//   questions   QuestionRecord[]
//   meta        { total, type_counts, parity_ok, targets, overlap_count, overlap_pct,
//                 calibration_used, cooccurrence_loaded }

// --------------------------------------------------------------------------
// Type classification
// Weight vector indices: [exit(0), voice(1), virtue(2), consequentialist(3), deontological(4)]
// --------------------------------------------------------------------------
function classifyTypes(wa, wb) {
  const types = [];
  if ((wa[0] > 0 && wb[1] > 0) || (wa[1] > 0 && wb[0] > 0)) types.push('ev');
  if ((wa[2] > 0 && wb[3] > 0) || (wa[3] > 0 && wb[2] > 0)) types.push('vc');
  if ((wa[2] > 0 && wb[4] > 0) || (wa[4] > 0 && wb[2] > 0)) types.push('vd');
  if ((wa[3] > 0 && wb[4] > 0) || (wa[4] > 0 && wb[3] > 0)) types.push('cd');
  return types;
}

function ensureOdd(n) {
  const num = Math.max(1, Math.round(n));
  return num % 2 === 0 ? num + 1 : num;
}

function typesStillNeeded(q, counts, targets) {
  return q.types.filter(t => counts[t] < targets[t]).length;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Compact qids encoding: sort numerically, strip Q-prefix and leading zeros
// "Q001" → 1, "Q029" → 29  →  "1,7,11,20,23,29"
function encodeQids(questions) {
  return questions
    .map(q => parseInt(q.id.slice(1), 10))
    .sort((a, b) => a - b)
    .join(',');
}

// Build co-occurrence map from sequence qids strings.
// Returns Map<"Qa,Qb" (sorted), count> where key uses zero-padded QIDs for consistency.
function buildCooccurrence(sequenceRows) {
  const map = new Map();
  for (const row of sequenceRows) {
    const nums = row.qids.split(',').map(Number).sort((a, b) => a - b);
    for (let i = 0; i < nums.length; i++) {
      for (let j = i + 1; j < nums.length; j++) {
        const key = `${nums[i]},${nums[j]}`;
        map.set(key, (map.get(key) || 0) + 1);
      }
    }
  }
  return map;
}

// Max co-occurrence of candidate with any already-selected question, normalised to [0,1]
function cooccurrencePenalty(candidate, selectedNums, comap, windowSize) {
  if (!comap || comap.size === 0 || selectedNums.length === 0 || windowSize === 0) return 0;
  const cNum = parseInt(candidate.id.slice(1), 10);
  let max = 0;
  for (const sNum of selectedNums) {
    const a = Math.min(cNum, sNum), b = Math.max(cNum, sNum);
    const count = comap.get(`${a},${b}`) || 0;
    if (count > max) max = count;
  }
  return max / windowSize; // normalised: 0 (never co-occurred) → 1 (always co-occurred)
}

// --------------------------------------------------------------------------
// Constants
// --------------------------------------------------------------------------
const DIMENSIONS     = ['exit', 'voice', 'virtue', 'consequentialist', 'deontological'];
const ARCHETYPES     = { exit: ['Legalist', 'Contrarian', 'Hacker'], voice: ['Holy Warrior', 'Operator', 'Investigator'] };
const ARCHETYPE_PAGES = { Legalist: 'legalist.html', Contrarian: 'contrarian.html', Hacker: 'hacker.html', 'Holy Warrior': 'holywarrior.html', Operator: 'operator.html', Investigator: 'investigator.html' };

const DEFAULTS = {
  ev_target:            5,
  vc_target:            3,
  vd_target:            3,
  cd_target:            3,
  calibration_slots:    2,
  max_overlap_pct:     30,
  cooccurrence_window: 200
};

// --------------------------------------------------------------------------
// Main handler
// --------------------------------------------------------------------------
export async function onRequestPost(context) {
  const { env, request } = context;

  let body = {};
  try { body = await request.json(); } catch (_) {}

  // Multi-run overlap: accept previous_runs (array of QID arrays) or legacy previous_qids
  const previousRuns  = Array.isArray(body.previous_runs) ? body.previous_runs : [];
  const legacyQids    = Array.isArray(body.previous_qids) ? body.previous_qids : [];
  // Build overlap set: union of all past runs' qids (broader avoidance window)
  const prevSet = new Set([
    ...legacyQids,
    ...previousRuns.flat()
  ]);
  // Last run's qids only (for calibration slot freshness — tighter constraint)
  const lastRunSet = new Set(previousRuns[0] || legacyQids);

  // Load protocol params
  let proto = {};
  try {
    const r = await fetch(new URL('/data/protocol.json', request.url));
    if (r.ok) proto = (await r.json()).sampling || {};
  } catch (_) {}

  const targets = {
    ev: ensureOdd(body.ev_target ?? proto.ev_target ?? DEFAULTS.ev_target),
    vc: ensureOdd(body.vc_target ?? proto.vc_target ?? DEFAULTS.vc_target),
    vd: ensureOdd(body.vd_target ?? proto.vd_target ?? DEFAULTS.vd_target),
    cd: ensureOdd(body.cd_target ?? proto.cd_target ?? DEFAULTS.cd_target)
  };
  const calibSlots    = body.calibration_slots ?? proto.calibration_slots ?? DEFAULTS.calibration_slots;
  const coWindow      = body.cooccurrence_window ?? proto.cooccurrence_window ?? DEFAULTS.cooccurrence_window;

  const now = new Date().toISOString();

  // --------------------------------------------------------------------------
  // Load questions + co-occurrence data in parallel
  // --------------------------------------------------------------------------
  let rows, seqRows = [];
  try {
    const qPromise = env.DB.prepare(
      `SELECT id, answer_a, answer_b, weights_a, weights_b, response_weight,
              status, questions_version, times_sampled, last_sampled_at
       FROM questions
       WHERE status IN ('live', 'calibrating')
       ORDER BY id`
    ).all();

    const seqPromise = coWindow > 0
      ? env.DB.prepare(
          `SELECT qids FROM question_sequences ORDER BY id DESC LIMIT ?`
        ).bind(coWindow).all()
      : Promise.resolve({ results: [] });

    const [qResult, seqResult] = await Promise.all([qPromise, seqPromise]);
    rows    = qResult.results;
    seqRows = seqResult.results;
  } catch (_) {
    return json({ error: 'questions unavailable', questions: [] }, 503);
  }

  if (!rows || rows.length === 0) {
    return json({ error: 'no questions available', questions: [] }, 503);
  }

  // Build co-occurrence map from recent sequences
  const comap = buildCooccurrence(seqRows);
  const coWindowActual = seqRows.length;

  // Parse and classify questions
  const allQuestions = rows.map(row => {
    const wA = JSON.parse(row.weights_a);
    const wB = JSON.parse(row.weights_b);
    // Days since last sampled (null → Infinity, i.e. never sampled = highest priority)
    const daysSinceSampled = row.last_sampled_at
      ? (Date.now() - new Date(row.last_sampled_at).getTime()) / 86400000
      : Infinity;
    return {
      id:               row.id,
      qnum:             parseInt(row.id.slice(1), 10),
      status:           row.status,
      weight:           row.response_weight,
      a:                row.answer_a,
      b:                row.answer_b,
      weights:          { a: wA, b: wB },
      types:            classifyTypes(wA, wB),
      timesSampled:     row.times_sampled ?? 0,
      daysSinceSampled,
      isMultiRunFresh:  !prevSet.has(row.id),   // not in any recent run
      isLastRunFresh:   !lastRunSet.has(row.id)  // not in immediately previous run
    };
  });

  // --------------------------------------------------------------------------
  // Selection state
  // --------------------------------------------------------------------------
  const selected      = [];
  const selectedIds   = new Set();
  const selectedNums  = [];  // numeric QIDs of selected, for co-occurrence lookup
  const counts        = { ev: 0, vc: 0, vd: 0, cd: 0 };
  let   calibUsed     = 0;

  function pick(q) {
    selected.push(q);
    selectedIds.add(q.id);
    selectedNums.push(q.qnum);
    for (const t of q.types) {
      if (t in counts) counts[t]++;
    }
  }

  // Sort comparator — lower score = higher priority
  // Factors (in order of importance):
  //   1. Types still needed (more = better, so negate)
  //   2. Co-occurrence penalty with already-selected (lower = better)
  //   3. Multi-run freshness (not in any recent run = better)
  //   4. Days since last sampled (more days = better, so negate)
  //   5. Total times sampled (lower = better)
  function sortScore(q) {
    const coP = cooccurrencePenalty(q, selectedNums, comap, coWindowActual);
    return [
      -typesStillNeeded(q, counts, targets),
      coP,
      q.isMultiRunFresh ? 0 : 1,
      -(q.daysSinceSampled === Infinity ? 1e9 : q.daysSinceSampled),
      q.timesSampled
    ];
  }
  function bySortScore(a, b) {
    const sa = sortScore(a), sb = sortScore(b);
    for (let i = 0; i < sa.length; i++) {
      if (sa[i] !== sb[i]) return sa[i] - sb[i];
    }
    return 0;
  }

  // --------------------------------------------------------------------------
  // Step 1: Reserve calibration slots
  // --------------------------------------------------------------------------
  const calibPool = shuffle(allQuestions.filter(q => q.status === 'calibrating'));
  const calibOrdered = [
    ...calibPool.filter(q => q.isLastRunFresh),
    ...calibPool.filter(q => !q.isLastRunFresh)
  ];
  for (const q of calibOrdered) {
    if (calibUsed >= calibSlots) break;
    pick(q);
    calibUsed++;
  }

  // --------------------------------------------------------------------------
  // Step 2: Greedy fill — satisfy all type quotas
  // Re-sort on each iteration since co-occurrence penalties change as we pick.
  // --------------------------------------------------------------------------
  let changed = true;
  while (changed) {
    changed = false;
    if (Object.entries(targets).every(([t, n]) => counts[t] >= n)) break;

    const candidates = allQuestions
      .filter(q => !selectedIds.has(q.id) && typesStillNeeded(q, counts, targets) > 0)
      .sort(bySortScore);

    if (candidates.length === 0) break;
    pick(candidates[0]);
    changed = true;
  }

  // --------------------------------------------------------------------------
  // Step 3: Parity correction — ensure all type counts are odd
  // --------------------------------------------------------------------------
  for (const type of ['ev', 'vc', 'vd', 'cd']) {
    if (counts[type] % 2 === 0) {
      const extra = allQuestions
        .filter(q => !selectedIds.has(q.id) && q.types.includes(type))
        .sort(bySortScore)[0];
      if (extra) pick(extra);
    }
  }

  // --------------------------------------------------------------------------
  // Step 4: Fire-and-forget DB updates
  // --------------------------------------------------------------------------
  if (selected.length > 0) {
    const ids = selected.map(q => q.id);
    const placeholders = ids.map(() => '?').join(',');

    // Increment times_sampled + update last_sampled_at
    env.DB.prepare(
      `UPDATE questions SET times_sampled = times_sampled + 1, last_sampled_at = ?
       WHERE id IN (${placeholders})`
    ).bind(now, ...ids).run().catch(() => {});

    // Log sequence
    const qidsEncoded  = encodeQids(selected);
    const typeCountsJson = JSON.stringify({ ev: counts.ev, vc: counts.vc, vd: counts.vd, cd: counts.cd });
    const parityOk = ['ev','vc','vd','cd'].every(t => counts[t] % 2 === 1) ? 1 : 0;
    env.DB.prepare(
      `INSERT INTO question_sequences (sampled_at, qids, type_counts, parity_ok, q_count)
       VALUES (?, ?, ?, ?, ?)`
    ).bind(now, qidsEncoded, typeCountsJson, parityOk, selected.length).run().catch(() => {});
  }

  // --------------------------------------------------------------------------
  // Step 5: Shuffle and return
  // --------------------------------------------------------------------------
  shuffle(selected);

  const totalOverlap = selected.filter(q => !q.isLastRunFresh).length;
  const parityOk     = ['ev','vc','vd','cd'].every(t => counts[t] % 2 === 1);

  const meta = {
    total:                selected.length,
    type_counts:          { ev: counts.ev, vc: counts.vc, vd: counts.vd, cd: counts.cd },
    parity_ok:            parityOk,
    targets,
    calibration_used:     calibUsed,
    overlap_count:        totalOverlap,
    overlap_pct:          selected.length > 0 ? Math.round(100 * totalOverlap / selected.length) : 0,
    cooccurrence_loaded:  coWindowActual
  };

  const questions = selected.map(({ id, status, weight, a, b, weights }) => ({
    id, status, weight, a, b, weights
  }));

  return json({ schema_version: 2, dimensions: DIMENSIONS, archetypes: ARCHETYPES, archetypePages: ARCHETYPE_PAGES, questions, meta });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
