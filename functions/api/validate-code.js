// POST /api/validate-code
// Body: { code: string }
// Returns: { valid, remaining, type } or { valid: false, reason }

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try { body = await request.json(); }
  catch { return json({ valid: false, reason: 'bad_request' }, 400); }

  const code = (body.code || '').trim().toUpperCase();
  if (!code) return json({ valid: false, reason: 'missing_code' }, 400);

  const row = await env.DB
    .prepare('SELECT total_uses, used_uses, type FROM codes WHERE code = ?')
    .bind(code)
    .first();

  if (!row) return json({ valid: false, reason: 'not_found' });

  const remaining = row.total_uses - row.used_uses;
  if (remaining <= 0) return json({ valid: false, reason: 'exhausted', remaining: 0 });

  return json({ valid: true, remaining, type: row.type });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
