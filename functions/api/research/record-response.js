// POST /api/research/record-response
// Records an anonymized, fully opted-in test run for research calibration.
// Only fires when the user explicitly consented on the intro screen.
//
// Body: {
//   session_id:        string   — internal random UUID (never stored in user's logbook)
//   run_token:         string   — opaque cross-dataset token stored in the user's run record
//   responses:         [{question_id, answer, is_calibrating}]  — all questions answered
//   outcome:           {archetype, ev_pos, ethics_virtue, ethics_conseq, ethics_deont}
//   questions_version: number
// }
//
// session_id is the internal D1 primary key; run_token is the externally-visible linkage
// token that gets stored in the user's localStorage run record. The two are separated so
// the internal DB key is never exposed outside the server.

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try { body = await request.json(); }
  catch { return json({ error: 'Invalid JSON' }, 400); }

  const { session_id, run_token, responses, outcome, questions_version } = body;

  if (!session_id || typeof session_id !== 'string' || session_id.length > 128) {
    return json({ error: 'session_id required (max 128 chars)' }, 400);
  }
  if (!run_token || typeof run_token !== 'string' || run_token.length > 64) {
    return json({ error: 'run_token required (max 64 chars)' }, 400);
  }
  if (!Array.isArray(responses) || responses.length === 0) {
    return json({ error: 'responses array required' }, 400);
  }
  if (!outcome || typeof outcome.archetype !== 'string') {
    return json({ error: 'outcome.archetype required' }, 400);
  }

  const validResponses = responses.filter(r =>
    r &&
    typeof r.question_id === 'string' &&
    /^Q\d{3,}$/.test(r.question_id) &&
    (r.answer === 'a' || r.answer === 'b')
  );
  if (validResponses.length === 0) return json({ error: 'No valid responses' }, 400);

  const version   = Number.isInteger(questions_version) ? questions_version : 1;
  const now       = new Date().toISOString();
  const archetype = String(outcome.archetype).slice(0, 64);
  const evPos     = typeof outcome.ev_pos          === 'number' ? outcome.ev_pos          : null;
  const virtue    = typeof outcome.ethics_virtue   === 'number' ? outcome.ethics_virtue   : null;
  const conseq    = typeof outcome.ethics_conseq   === 'number' ? outcome.ethics_conseq   : null;
  const deont     = typeof outcome.ethics_deont    === 'number' ? outcome.ethics_deont    : null;

  const sessionStmt = env.DB.prepare(
    `INSERT OR IGNORE INTO research_sessions
       (session_id, run_token, archetype, ev_pos, ethics_virtue, ethics_conseq, ethics_deont, questions_version, collected_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(session_id, run_token, archetype, evPos, virtue, conseq, deont, version, now);

  const responseStmts = validResponses.map(r =>
    env.DB.prepare(
      `INSERT OR IGNORE INTO research_responses (session_id, question_id, answer, is_calibrating)
       VALUES (?, ?, ?, ?)`
    ).bind(session_id, r.question_id, r.answer, r.is_calibrating ? 1 : 0)
  );

  await env.DB.batch([sessionStmt, ...responseStmts]);

  return json({ ok: true, recorded: validResponses.length });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
