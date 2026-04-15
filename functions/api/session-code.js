// GET /api/session-code?session_id=cs_xxx
// Exchanges a completed Stripe session ID for the generated access code.
// Called by the client after returning from Stripe checkout.
// Retried a few times client-side to allow for webhook processing lag.

export async function onRequestGet(context) {
  const { request, env } = context;
  const sessionId = new URL(request.url).searchParams.get('session_id');

  if (!sessionId) return json({ error: 'Missing session_id' }, 400);

  const row = await env.DB
    .prepare('SELECT code FROM codes WHERE stripe_session_id = ?')
    .bind(sessionId)
    .first();

  if (!row) return json({ error: 'Not found — webhook may still be processing' }, 404);

  return json({ code: row.code });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
