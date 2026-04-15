// POST /api/admin/generate-codes
// Generates a batch of coupon or org codes and writes them to D1.
// Protected by a shared secret in the Authorization header.
//
// Body: {
//   type: 'coupon' | 'org',
//   count: number,          -- how many codes to generate
//   uses_per_code: number,  -- runs per code
//   org_id?: string,        -- e.g. 'acme-corp' or 'spring-2026-promo'
//   label?: string          -- human label shown in admin/export
// }
//
// Required env vars:
//   ADMIN_SECRET  (secret) — set via CF Pages dashboard

export async function onRequestPost(context) {
  const { request, env } = context;

  const auth = request.headers.get('Authorization') || '';
  if (auth !== `Bearer ${env.ADMIN_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  let body;
  try { body = await request.json(); }
  catch { return json({ error: 'Invalid JSON' }, 400); }

  const { type, count, uses_per_code, org_id, label } = body;

  if (!type || !['coupon', 'org'].includes(type)) return json({ error: 'type must be coupon or org' }, 400);
  if (!count || count < 1 || count > 1000) return json({ error: 'count must be 1–1000' }, 400);
  if (!uses_per_code || uses_per_code < 1) return json({ error: 'uses_per_code must be >= 1' }, 400);

  const codes = [];
  const now = new Date().toISOString();
  const stmt = env.DB.prepare(
    `INSERT INTO codes (code, type, total_uses, org_id, label, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  );

  for (let i = 0; i < count; i++) {
    const code = generateCode();
    await stmt.bind(code, type, uses_per_code, org_id || null, label || null, now).run();
    codes.push(code);
  }

  return json({ codes, count: codes.length });
}

function generateCode() {
  const hex = crypto.randomUUID().replace(/-/g, '').toUpperCase().slice(0, 12);
  return `QNTLG-${hex.slice(0, 4)}-${hex.slice(4, 8)}-${hex.slice(8, 12)}`;
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
