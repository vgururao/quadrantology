// POST /api/consume-code
// Body: { code: string }
// Returns: { ok, remaining } or { ok: false, reason }
// Called after results are displayed — decrements the use counter.

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try { body = await request.json(); }
  catch { return json({ ok: false, reason: 'bad_request' }, 400); }

  const code = (body.code || '').trim().toUpperCase();
  if (!code) return json({ ok: false, reason: 'missing_code' }, 400);

  const row = await env.DB
    .prepare('SELECT total_uses, used_uses FROM codes WHERE code = ?')
    .bind(code)
    .first();

  if (!row) return json({ ok: false, reason: 'not_found' }, 404);
  if (row.used_uses >= row.total_uses) return json({ ok: false, reason: 'exhausted' }, 403);

  await env.DB
    .prepare('UPDATE codes SET used_uses = used_uses + 1 WHERE code = ?')
    .bind(code)
    .run();

  return json({ ok: true, remaining: row.total_uses - row.used_uses - 1 });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
