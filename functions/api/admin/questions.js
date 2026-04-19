// Admin questions API
//
// GET  /api/admin/questions          — list all questions (all statuses)
// GET  /api/admin/questions?id=Q001  — single question with state log
// POST /api/admin/questions          — create or update a question
//
// All routes protected by token middleware (_middleware.js).
// `context.data.adminPk` contains the authenticated admin's key fingerprint.

const VALID_STATUSES = ['draft', 'live', 'calibrating', 'archived'];

export async function onRequestGet(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  if (id) {
    const q = await env.DB.prepare(`SELECT * FROM questions WHERE id = ?`).bind(id).first();
    if (!q) return json({ error: 'Not found' }, 404);

    const { results: log } = await env.DB.prepare(
      `SELECT * FROM question_state_log WHERE question_id = ? ORDER BY changed_at DESC`
    ).bind(id).all();

    return json({ question: formatQuestion(q), state_log: log });
  }

  const { results } = await env.DB.prepare(
    `SELECT * FROM questions ORDER BY id`
  ).all();
  return json({ questions: results.map(formatQuestion) });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const adminPk = context.data?.adminPk || null;

  let body;
  try { body = await request.json(); }
  catch { return json({ error: 'Invalid JSON' }, 400); }

  const { id, answer_a, answer_b, weights_a, weights_b, response_weight, status, notes, state_note } = body;

  if (!id || typeof id !== 'string' || !/^Q\d{3,}$/.test(id)) {
    return json({ error: 'id required, format: Q001' }, 400);
  }
  if (!answer_a || !answer_b) return json({ error: 'answer_a and answer_b required' }, 400);
  if (!Array.isArray(weights_a) || weights_a.length !== 5 ||
      !Array.isArray(weights_b) || weights_b.length !== 5) {
    return json({ error: 'weights_a and weights_b must be arrays of 5 numbers' }, 400);
  }
  if (status && !VALID_STATUSES.includes(status)) {
    return json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` }, 400);
  }

  const now = new Date().toISOString();
  const existing = await env.DB.prepare(`SELECT status FROM questions WHERE id = ?`).bind(id).first();

  if (existing) {
    // Update existing question
    const newStatus = status || existing.status;
    const stmts = [
      env.DB.prepare(
        `UPDATE questions
         SET answer_a=?, answer_b=?, weights_a=?, weights_b=?, response_weight=?, status=?, notes=?
         WHERE id=?`
      ).bind(
        answer_a, answer_b,
        JSON.stringify(weights_a), JSON.stringify(weights_b),
        response_weight ?? 1.0,
        newStatus, notes ?? null,
        id
      )
    ];

    // Log status change if it changed
    if (status && status !== existing.status) {
      stmts.push(
        env.DB.prepare(
          `INSERT INTO question_state_log (question_id, from_status, to_status, changed_at, changed_by, note)
           VALUES (?, ?, ?, ?, ?, ?)`
        ).bind(id, existing.status, status, now, adminPk, state_note ?? null)
      );
    }

    await env.DB.batch(stmts);
  } else {
    // Create new question
    const initialStatus = status || 'draft';
    await env.DB.batch([
      env.DB.prepare(
        `INSERT INTO questions (id, answer_a, answer_b, weights_a, weights_b, response_weight, status, questions_version, added_at, created_by, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        id, answer_a, answer_b,
        JSON.stringify(weights_a), JSON.stringify(weights_b),
        response_weight ?? 1.0,
        initialStatus, 1, now, adminPk, notes ?? null
      ),
      env.DB.prepare(
        `INSERT INTO question_state_log (question_id, from_status, to_status, changed_at, changed_by, note)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).bind(id, null, initialStatus, now, adminPk, state_note ?? 'Created')
    ]);
  }

  const updated = await env.DB.prepare(`SELECT * FROM questions WHERE id = ?`).bind(id).first();
  return json({ question: formatQuestion(updated) });
}

function formatQuestion(row) {
  return {
    id:               row.id,
    answer_a:         row.answer_a,
    answer_b:         row.answer_b,
    weights_a:        JSON.parse(row.weights_a),
    weights_b:        JSON.parse(row.weights_b),
    response_weight:  row.response_weight,
    status:           row.status,
    questions_version:row.questions_version,
    added_at:         row.added_at,
    created_by:       row.created_by,
    notes:            row.notes
  };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
