// POST /api/research/submit-logbook
// Voluntarily submitted by users who want to contribute their full logbook history.
// Only v2 run records are accepted (v1 has no Q/A data).
//
// What is stored:   timestamps, Q/A answers, computed scores/archetype/position,
//                   which questions were in calibrating status at run time
// What is stripped: name, access code, journal notes (note field), Personal Circle data
//
// If a run has a run_token (it was also submitted via per-run calibration opt-in),
// we locate the existing research_sessions row and link it to this subject rather
// than creating a duplicate. Responses are already stored for those runs.
//
// Body: {
//   runs: [v2 run records from quadrantology_history localStorage]
// }
//
// Response: { ok: true, subject_id, recorded: N, linked: M }

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try { body = await request.json(); }
  catch { return json({ error: 'Invalid JSON' }, 400); }

  const { runs } = body;
  if (!Array.isArray(runs) || runs.length === 0) {
    return json({ error: 'runs array required' }, 400);
  }

  // v2 only — requires Q/A data and position object
  const v2runs = runs.filter(r =>
    r &&
    r.version === 2 &&
    Array.isArray(r.run) && r.run.length > 0 &&
    r.position && typeof r.position.ev === 'number' &&
    typeof r.archetype === 'string' &&
    r.timestamp
  );

  if (v2runs.length === 0) {
    return json({ error: 'No valid v2 run records found. Only v2 records with Q/A data are accepted.' }, 422);
  }

  const subjectId   = crypto.randomUUID();
  const submittedAt = new Date().toISOString();

  const stmts = [];
  let newSessions = 0;
  let linkedSessions = 0;

  // Create subject row
  stmts.push(
    env.DB.prepare(
      `INSERT INTO research_subjects (subject_id, run_count, submitted_at) VALUES (?, ?, ?)`
    ).bind(subjectId, v2runs.length, submittedAt)
  );

  for (const run of v2runs) {
    const runToken = run.run_token || null;

    // Use original timestamp for longitudinal ordering
    const collectedAt = typeof run.timestamp === 'string'
      ? run.timestamp
      : new Date(run.timestamp).toISOString();

    const archetype = String(run.archetype).slice(0, 64);
    const evPos     = run.position.ev;
    const virtue    = run.position.ethics?.virtue            ?? null;
    const conseq    = run.position.ethics?.consequentialist  ?? null;
    const deont     = run.position.ethics?.deontological     ?? null;
    const version   = Number.isInteger(run.questions_version) ? run.questions_version : 1;

    if (runToken) {
      // This run was already recorded via per-run opt-in. Link the existing session
      // to this subject rather than duplicating it. Responses are already stored.
      stmts.push(
        env.DB.prepare(
          `UPDATE research_sessions SET subject_id = ? WHERE run_token = ? AND subject_id IS NULL`
        ).bind(subjectId, runToken)
      );
      linkedSessions++;
    } else {
      // No prior per-run record — create a fresh session and store all responses.
      // calibrating: array of qids that were in calibrating status at run time (may be absent
      // for runs recorded before this field was added; treat as all non-calibrating in that case).
      const sessionId      = crypto.randomUUID();
      const calibratingSet = new Set(Array.isArray(run.calibrating) ? run.calibrating : []);

      stmts.push(
        env.DB.prepare(
          `INSERT INTO research_sessions
             (session_id, subject_id, archetype, ev_pos, ethics_virtue, ethics_conseq, ethics_deont, questions_version, collected_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(sessionId, subjectId, archetype, evPos, virtue, conseq, deont, version, collectedAt)
      );

      for (const qa of run.run) {
        if (!qa.qid || (qa.ans !== 'a' && qa.ans !== 'b')) continue;
        stmts.push(
          env.DB.prepare(
            `INSERT OR IGNORE INTO research_responses (session_id, question_id, answer, is_calibrating)
             VALUES (?, ?, ?, ?)`
          ).bind(sessionId, qa.qid, qa.ans, calibratingSet.has(qa.qid) ? 1 : 0)
        );
      }
      newSessions++;
    }
  }

  await env.DB.batch(stmts);

  return json({
    ok:         true,
    subject_id: subjectId,
    recorded:   newSessions,
    linked:     linkedSessions
  });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
