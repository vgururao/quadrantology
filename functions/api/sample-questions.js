// POST /api/sample-questions
// Pairwise tie-free sampling strategy.
//
// Guarantees an ODD count for each of the 4 comparison types:
//   ev  — exit vs voice
//   vc  — virtue vs conseq
//   vd  — virtue vs deont
//   cd  — conseq vs deont
//
// Odd counts make pairwise ties structurally impossible on all four axes.
// Circular orderings (e.g. virtue > conseq > deont > virtue) are valid results.
//
// Dual questions (e.g. Q006: EV + VC) count toward multiple type quotas,
// reducing the total questions needed when they appear in the pool.
//
// Minimum achievable total: 9 (if all ethics questions are also EV-coded),
// practical default: 14 (ev=5, vc=3, vd=3, cd=3, assuming orthogonal pool).
//
// Request body (JSON):
//   previous_qids   string[]   QIDs from the user's most recent run ([] for first run)
//   ev_target       number?    Override ev count (rounded up to odd if even)
//   vc_target       number?    Override vc count
//   vd_target       number?    Override vd count
//   cd_target       number?    Override cd count
//   calibration_slots number?  Override protocol default
//   max_overlap_pct number?    Override protocol default (0–100, soft guideline)
//
// Response (JSON):
//   questions   QuestionRecord[]
//   meta        SamplingMeta     { total, type_counts, parity_ok, overlap_count,
//                                  overlap_pct, calibration_used, targets }

// --------------------------------------------------------------------------
// Type classification
// --------------------------------------------------------------------------
// Weight vector indices: [exit(0), voice(1), virtue(2), consequentialist(3), deontological(4)]
// A question covers a type if one answer scores that dimension's "A side"
// and the other answer scores its "B side".

function classifyTypes(wa, wb) {
  const types = [];
  // ev: one answer favours exit, other favours voice
  if ((wa[0] > 0 && wb[1] > 0) || (wa[1] > 0 && wb[0] > 0)) types.push('ev');
  // vc: one answer favours virtue, other favours conseq
  if ((wa[2] > 0 && wb[3] > 0) || (wa[3] > 0 && wb[2] > 0)) types.push('vc');
  // vd: one answer favours virtue, other favours deont
  if ((wa[2] > 0 && wb[4] > 0) || (wa[4] > 0 && wb[2] > 0)) types.push('vd');
  // cd: one answer favours conseq, other favours deont
  if ((wa[3] > 0 && wb[4] > 0) || (wa[4] > 0 && wb[3] > 0)) types.push('cd');
  return types;
}

// Round n up to the nearest odd integer ≥ 1
function ensureOdd(n) {
  const num = Math.max(1, Math.round(n));
  return num % 2 === 0 ? num + 1 : num;
}

// How many of this question's types are still below target?
function typesStillNeeded(q, counts, targets) {
  return q.types.filter(t => counts[t] < targets[t]).length;
}

// Fisher-Yates shuffle (in-place)
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// --------------------------------------------------------------------------
// Constants
// --------------------------------------------------------------------------

const DIMENSIONS     = ['exit', 'voice', 'virtue', 'consequentialist', 'deontological'];
const ARCHETYPES     = { exit: ['Legalist', 'Contrarian', 'Hacker'], voice: ['Holy Warrior', 'Operator', 'Investigator'] };
const ARCHETYPE_PAGES = { Legalist: 'legalist.html', Contrarian: 'contrarian.html', Hacker: 'hacker.html', 'Holy Warrior': 'holywarrior.html', Operator: 'operator.html', Investigator: 'investigator.html' };

const DEFAULTS = {
  ev_target:         5,   // odd — E/V axis
  vc_target:         3,   // odd — virtue vs conseq
  vd_target:         3,   // odd — virtue vs deont
  cd_target:         3,   // odd — conseq vs deont
  calibration_slots: 2,   // reserved for 'calibrating' status questions
  max_overlap_pct:  30    // soft guideline: prefer fresh questions from prev run
};

// --------------------------------------------------------------------------
// Main handler
// --------------------------------------------------------------------------

export async function onRequestPost(context) {
  const { env, request } = context;

  let body = {};
  try { body = await request.json(); } catch (_) {}

  const previousQids = Array.isArray(body.previous_qids) ? body.previous_qids : [];
  const prevSet      = new Set(previousQids);

  // Load protocol params (best-effort)
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

  // --------------------------------------------------------------------------
  // Fetch and classify all eligible questions
  // --------------------------------------------------------------------------
  let rows;
  try {
    const { results } = await env.DB.prepare(
      `SELECT id, answer_a, answer_b, weights_a, weights_b, response_weight,
              status, questions_version, times_sampled
       FROM questions
       WHERE status IN ('live', 'calibrating')
       ORDER BY id`
    ).all();
    rows = results;
  } catch (_) {
    return json({ error: 'questions unavailable', questions: [] }, 503);
  }

  if (!rows || rows.length === 0) {
    return json({ error: 'no questions available', questions: [] }, 503);
  }

  const allQuestions = rows.map(row => {
    const wA = JSON.parse(row.weights_a);
    const wB = JSON.parse(row.weights_b);
    return {
      id:           row.id,
      status:       row.status,
      weight:       row.response_weight,
      a:            row.answer_a,
      b:            row.answer_b,
      weights:      { a: wA, b: wB },
      types:        classifyTypes(wA, wB),
      timesSampled: row.times_sampled ?? 0,
      isFresh:      !prevSet.has(row.id)
    };
  });

  // --------------------------------------------------------------------------
  // Selection state
  // --------------------------------------------------------------------------
  const selected    = [];
  const selectedIds = new Set();
  const counts      = { ev: 0, vc: 0, vd: 0, cd: 0 };
  let   calibUsed   = 0;

  function pick(q) {
    selected.push(q);
    selectedIds.add(q.id);
    for (const t of q.types) {
      if (t in counts) counts[t]++;
    }
  }

  // Sort comparator: most underfilled types first → fresh first → less sampled first
  function sortKey(q) {
    return [-typesStillNeeded(q, counts, targets), q.isFresh ? 0 : 1, q.timesSampled];
  }
  function bySortKey(a, b) {
    const ka = sortKey(a), kb = sortKey(b);
    for (let i = 0; i < ka.length; i++) {
      if (ka[i] !== kb[i]) return ka[i] - kb[i];
    }
    return 0;
  }

  // --------------------------------------------------------------------------
  // Step 1: Reserve calibration slots
  // Calibrating questions get priority exposure for data collection.
  // They count toward type quotas like any other question.
  // --------------------------------------------------------------------------
  const calibPool = shuffle(allQuestions.filter(q => q.status === 'calibrating'));
  // Prefer fresh calibrating questions first
  const calibOrdered = [
    ...calibPool.filter(q => q.isFresh),
    ...calibPool.filter(q => !q.isFresh)
  ];
  for (const q of calibOrdered) {
    if (calibUsed >= calibSlots) break;
    pick(q);
    calibUsed++;
  }

  // --------------------------------------------------------------------------
  // Step 2: Greedy fill — satisfy all type quotas
  // Re-sort on each pass since picking a dual question changes what's needed.
  // --------------------------------------------------------------------------
  let changed = true;
  while (changed) {
    changed = false;
    // Are all quotas met?
    if (Object.entries(targets).every(([t, n]) => counts[t] >= n)) break;

    const candidates = allQuestions
      .filter(q => !selectedIds.has(q.id) && typesStillNeeded(q, counts, targets) > 0)
      .sort(bySortKey);

    if (candidates.length === 0) break;

    pick(candidates[0]);
    changed = true;
  }

  // --------------------------------------------------------------------------
  // Step 3: Parity correction
  // If any type count is even (pool too small to reach target), add one more
  // question of that type to restore odd parity.
  // --------------------------------------------------------------------------
  for (const type of ['ev', 'vc', 'vd', 'cd']) {
    if (counts[type] % 2 === 0) {
      const extra = allQuestions
        .filter(q => !selectedIds.has(q.id) && q.types.includes(type))
        .sort(bySortKey)[0];
      if (extra) pick(extra);
    }
  }

  // --------------------------------------------------------------------------
  // Step 4: Increment times_sampled (fire-and-forget)
  // --------------------------------------------------------------------------
  if (selected.length > 0) {
    const placeholders = selected.map(() => '?').join(',');
    env.DB.prepare(
      `UPDATE questions SET times_sampled = times_sampled + 1 WHERE id IN (${placeholders})`
    ).bind(...selected.map(q => q.id)).run().catch(() => {});
  }

  // --------------------------------------------------------------------------
  // Step 5: Shuffle and build response
  // --------------------------------------------------------------------------
  shuffle(selected);

  const totalOverlap = selected.filter(q => !q.isFresh).length;
  const parityOk     = ['ev', 'vc', 'vd', 'cd'].every(t => counts[t] % 2 === 1);

  const meta = {
    total:            selected.length,
    type_counts:      { ev: counts.ev, vc: counts.vc, vd: counts.vd, cd: counts.cd },
    parity_ok:        parityOk,
    targets,
    calibration_used: calibUsed,
    overlap_count:    totalOverlap,
    overlap_pct:      selected.length > 0 ? Math.round(100 * totalOverlap / selected.length) : 0
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
