// POST /api/sample-questions
// Proprietary balanced sampling strategy. Returns a shuffled subset of M questions
// drawn from the live+calibrating pool, with:
//   - Stratified balance across 4 discrimination types
//   - Overlap constraint against a previous run's question IDs
//   - Recency slots for recently-added questions still building response history
//   - Calibration slots reserved for questions in 'calibrating' status
//
// Request body (JSON):
//   previous_qids   string[]   QIDs from the user's most recent run ([] for first run)
//   target_count    number?    Override protocol default
//   calibration_slots number?  Override protocol default
//   recency_slots   number?    Override protocol default
//   recency_window_days number? Override protocol default
//   max_overlap_pct number?    Override protocol default (0–100)
//
// Response (JSON):
//   questions   QuestionRecord[]   Ordered for presentation (shuffled)
//   meta        SamplingMeta       Diagnostic info (type counts, overlap %, slots used)

// --------------------------------------------------------------------------
// Discrimination type classification
// --------------------------------------------------------------------------

// Weight vector indices: [exit(0), voice(1), virtue(2), consequentialist(3), deontological(4)]
// A question discriminates a dimension pair if, across answers A and B, at least one answer
// scores nonzero on each of the two dimensions in the pair.

function classifyDiscriminationType(weightsA, weightsB) {
  // EV: discriminates exit vs voice — one answer favours exit, other favours voice
  const aEV = weightsA[0] !== 0 || weightsA[1] !== 0;
  const bEV = weightsB[0] !== 0 || weightsB[1] !== 0;
  // For EV: the question is an exit/voice discriminator if between the two answers
  // there is meaningful exit/voice signal (combined nonzero on indices 0 or 1)
  const evScore = (weightsA[0] + weightsA[1]) - (weightsB[0] + weightsB[1]);
  const isEV = Math.abs(evScore) > 0 || (aEV && bEV);

  // Ethics discriminators: check which ethics dimensions (indices 2,3,4) have nonzero
  // combined weight across both answers. A pair discriminates if each dimension in the
  // pair appears nonzero in at least one answer.
  const ethicsActive = [2, 3, 4].map(i => weightsA[i] !== 0 || weightsB[i] !== 0);
  // ethicsActive[0] = virtue, [1] = consequentialist, [2] = deontological

  const isVirtueConseq  = ethicsActive[0] && ethicsActive[1];
  const isVirtueDeon    = ethicsActive[0] && ethicsActive[2];
  const isConseqDeon    = ethicsActive[1] && ethicsActive[2];

  // A question may technically fit multiple types (e.g. EV + ethics); we assign
  // the primary type by what it most strongly discriminates.
  // Priority: if it has any ethics signal, classify by the dominant ethics pair.
  // Tie-break: virtue_conseq > virtue_deon > conseq_deon > ev.
  // Pure EV questions (no ethics signal) get type 'ev'.
  const hasEthics = isVirtueConseq || isVirtueDeon || isConseqDeon;
  if (!hasEthics) return 'ev';
  if (isVirtueConseq && isVirtueDeon && isConseqDeon) return 'virtue_conseq'; // all three active: rare, assign first
  if (isVirtueConseq) return 'virtue_conseq';
  if (isVirtueDeon)   return 'virtue_deon';
  if (isConseqDeon)   return 'conseq_deon';
  return 'ev'; // fallback
}

// --------------------------------------------------------------------------
// Fisher-Yates shuffle (in-place)
// --------------------------------------------------------------------------
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// --------------------------------------------------------------------------
// Stratified sampling with type balance and overlap constraint
// --------------------------------------------------------------------------
// buckets: Map<type, QuestionRecord[]>  (pre-shuffled within each bucket)
// target:  number of questions to draw from these buckets
// prevSet: Set<string>  previous run QIDs
// maxOverlapCount: maximum questions allowed from prevSet
// Returns { selected: QuestionRecord[], overlapCount: number }
function stratifiedSample(buckets, target, prevSet, maxOverlapCount) {
  const types = ['ev', 'virtue_conseq', 'virtue_deon', 'conseq_deon'];
  const base  = Math.floor(target / types.length);
  const extra = target % types.length; // distribute remainder to first N types

  // Quota per type — try to fill evenly; unfilled quotas redistribute below
  const quotas = new Map(types.map((t, i) => [t, base + (i < extra ? 1 : 0)]));

  // Two-pass draw: prefer non-overlapping questions, then allow overlap up to cap
  const selected = [];
  let overlapUsed = 0;

  // Per-bucket: partition into non-prev and prev
  const fresh   = new Map(); // type → non-prev questions
  const overlap = new Map(); // type → prev-run questions
  for (const t of types) {
    const bucket = buckets.get(t) || [];
    fresh.set(t,   bucket.filter(q => !prevSet.has(q.id)));
    overlap.set(t, bucket.filter(q =>  prevSet.has(q.id)));
  }

  // Pass 1: fill each quota from fresh pool
  const unfilled = []; // types that couldn't fill quota from fresh
  for (const t of types) {
    const quota  = quotas.get(t);
    const avail  = fresh.get(t);
    const drawn  = avail.splice(0, quota);
    selected.push(...drawn);
    if (drawn.length < quota) unfilled.push({ t, remaining: quota - drawn.length });
  }

  // Pass 2: satisfy unfilled quotas from other types' fresh surplus
  const surplusFresh = [];
  for (const t of types) surplusFresh.push(...fresh.get(t));
  shuffle(surplusFresh);
  for (const { remaining } of unfilled) {
    selected.push(...surplusFresh.splice(0, remaining));
  }

  // Pass 3: if still short, allow overlap questions up to cap
  let shortfall = target - selected.length;
  if (shortfall > 0 && overlapUsed < maxOverlapCount) {
    const allOverlap = [];
    for (const t of types) allOverlap.push(...overlap.get(t));
    shuffle(allOverlap);
    const canUse = Math.min(shortfall, maxOverlapCount - overlapUsed);
    const drawn  = allOverlap.splice(0, canUse);
    selected.push(...drawn);
    overlapUsed += drawn.length;
  }

  return { selected, overlapCount: overlapUsed };
}

// --------------------------------------------------------------------------
// Main handler
// --------------------------------------------------------------------------

const DIMENSIONS     = ['exit', 'voice', 'virtue', 'consequentialist', 'deontological'];
const ARCHETYPES     = { exit: ['Legalist', 'Contrarian', 'Hacker'], voice: ['Holy Warrior', 'Operator', 'Investigator'] };
const ARCHETYPE_PAGES = { Legalist: 'legalist.html', Contrarian: 'contrarian.html', Hacker: 'hacker.html', 'Holy Warrior': 'holywarrior.html', Operator: 'operator.html', Investigator: 'investigator.html' };

// Protocol defaults — overridden by protocol.json values at runtime, or request body
const DEFAULTS = {
  target_count:        20,
  calibration_slots:    2,
  recency_slots:        2,
  recency_window_days: 90,
  max_overlap_pct:     30
};

export async function onRequestPost(context) {
  const { env, request } = context;

  // Parse request
  let body = {};
  try { body = await request.json(); } catch (_) {}

  const previousQids       = Array.isArray(body.previous_qids) ? body.previous_qids : [];
  const prevSet            = new Set(previousQids);

  // Load protocol params (best-effort; fall back to hardcoded defaults)
  let proto = {};
  try {
    const r = await fetch(new URL('/data/protocol.json', request.url));
    if (r.ok) proto = (await r.json()).sampling || {};
  } catch (_) {}

  const targetCount       = body.target_count        ?? proto.target_count        ?? DEFAULTS.target_count;
  const calibrationSlots  = body.calibration_slots   ?? proto.calibration_slots   ?? DEFAULTS.calibration_slots;
  const recencySlots      = body.recency_slots        ?? proto.recency_slots        ?? DEFAULTS.recency_slots;
  const recencyWindowDays = body.recency_window_days  ?? proto.recency_window_days  ?? DEFAULTS.recency_window_days;
  const maxOverlapPct     = body.max_overlap_pct      ?? proto.max_overlap_pct      ?? DEFAULTS.max_overlap_pct;

  // Fetch all eligible questions from D1
  let rows;
  try {
    const { results } = await env.DB.prepare(
      `SELECT id, answer_a, answer_b, weights_a, weights_b, response_weight, status, questions_version, added_at
       FROM questions
       WHERE status IN ('live', 'calibrating')
       ORDER BY id`
    ).all();
    rows = results;
  } catch (err) {
    return json({ error: 'questions unavailable', questions: [] }, 503);
  }

  if (!rows || rows.length === 0) {
    return json({ error: 'no questions available', questions: [] }, 503);
  }

  // Parse and classify all questions
  const now = Date.now();
  const recencyCutoffMs = recencyWindowDays * 24 * 60 * 60 * 1000;

  const allQuestions = rows.map(row => {
    const wA = JSON.parse(row.weights_a);
    const wB = JSON.parse(row.weights_b);
    return {
      id:          row.id,
      status:      row.status,
      weight:      row.response_weight,
      a:           row.answer_a,
      b:           row.answer_b,
      weights:     { a: wA, b: wB },
      discType:    classifyDiscriminationType(wA, wB),
      isRecent:    row.added_at && (now - new Date(row.added_at).getTime()) < recencyCutoffMs,
      addedAt:     row.added_at
    };
  });

  // Partition by status
  const calibratingPool = allQuestions.filter(q => q.status === 'calibrating');
  const livePool        = allQuestions.filter(q => q.status === 'live');

  // Max overlap count
  const maxOverlapCount = Math.round(targetCount * maxOverlapPct / 100);

  // --------------------------------------------------------------------------
  // Step 1: Reserve calibration slots
  // Pick from calibrating pool (prefer non-overlap, then allow overlap)
  // --------------------------------------------------------------------------
  const actualCalibSlots = Math.min(calibrationSlots, calibratingPool.length);
  shuffle(calibratingPool);
  const calibFresh   = calibratingPool.filter(q => !prevSet.has(q.id));
  const calibOverlap = calibratingPool.filter(q =>  prevSet.has(q.id));
  const calibPicked  = [
    ...calibFresh.slice(0, actualCalibSlots),
    ...calibOverlap.slice(0, Math.max(0, actualCalibSlots - calibFresh.length))
  ];
  const calibOverlapCount = calibPicked.filter(q => prevSet.has(q.id)).length;
  const pickedIds = new Set(calibPicked.map(q => q.id));

  // --------------------------------------------------------------------------
  // Step 2: Reserve recency slots from live pool
  // Pick recently-added live questions that are past initial calibration
  // (status = live, not calibrating, and within recency window)
  // --------------------------------------------------------------------------
  const recentLive = livePool.filter(q => q.isRecent && !pickedIds.has(q.id));
  shuffle(recentLive);
  const recencyFresh   = recentLive.filter(q => !prevSet.has(q.id));
  const recencyOverlap = recentLive.filter(q =>  prevSet.has(q.id));
  const actualRecencySlots = Math.min(recencySlots, recentLive.length);
  const recencyPicked = [
    ...recencyFresh.slice(0, actualRecencySlots),
    ...recencyOverlap.slice(0, Math.max(0, actualRecencySlots - recencyFresh.length))
  ];
  const recencyOverlapCount = recencyPicked.filter(q => prevSet.has(q.id)).length;
  recencyPicked.forEach(q => pickedIds.add(q.id));

  // --------------------------------------------------------------------------
  // Step 3: Stratified sampling for remaining slots
  // --------------------------------------------------------------------------
  const remainingTarget = targetCount - calibPicked.length - recencyPicked.length;
  const remainingOverlapBudget = maxOverlapCount - calibOverlapCount - recencyOverlapCount;
  const corePool = allQuestions.filter(q => !pickedIds.has(q.id));

  // Build per-type buckets (shuffled)
  const buckets = new Map();
  for (const q of corePool) {
    if (!buckets.has(q.discType)) buckets.set(q.discType, []);
    buckets.get(q.discType).push(q);
  }
  for (const [, arr] of buckets) shuffle(arr);

  const { selected: stratPicked, overlapCount: stratOverlapCount } =
    stratifiedSample(buckets, Math.max(0, remainingTarget), prevSet, Math.max(0, remainingOverlapBudget));

  // --------------------------------------------------------------------------
  // Step 4: Assemble and shuffle final set
  // --------------------------------------------------------------------------
  const finalSet = [...calibPicked, ...recencyPicked, ...stratPicked];
  shuffle(finalSet);

  // Trim to targetCount in case of edge-case overfill (shouldn't happen in practice)
  const trimmed = finalSet.slice(0, targetCount);

  // --------------------------------------------------------------------------
  // Build meta (diagnostic, not exposed to end users — for admin/debugging)
  // --------------------------------------------------------------------------
  const typeCounts = { ev: 0, virtue_conseq: 0, virtue_deon: 0, conseq_deon: 0 };
  for (const q of trimmed) typeCounts[q.discType] = (typeCounts[q.discType] || 0) + 1;
  const totalOverlap = trimmed.filter(q => prevSet.has(q.id)).length;

  const meta = {
    total:             trimmed.length,
    calibration_used:  calibPicked.length,
    recency_used:      recencyPicked.length,
    stratified_used:   stratPicked.length,
    overlap_count:     totalOverlap,
    overlap_pct:       trimmed.length > 0 ? Math.round(100 * totalOverlap / trimmed.length) : 0,
    type_counts:       typeCounts
  };

  // Strip internal fields before returning
  const questions = trimmed.map(({ id, status, weight, a, b, weights }) => ({
    id, status, weight, a, b, weights
  }));

  return json({
    schema_version:  2,
    dimensions:      DIMENSIONS,
    archetypes:      ARCHETYPES,
    archetypePages:  ARCHETYPE_PAGES,
    questions,
    meta
  });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
