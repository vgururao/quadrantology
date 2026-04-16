// GET /api/admin/challenge
// Issues a one-time nonce for admin authentication.
// Nonce is stored in D1 with a created_at timestamp; consumed (deleted) on use in /api/admin/auth.
// Expired challenges (> 5 min) are cleaned up lazily on each request.

export async function onRequestGet(context) {
  const { env } = context;

  const challenge = crypto.randomUUID();
  const now = new Date().toISOString();

  // Store nonce and clean up stale ones in a single batch
  await env.DB.batch([
    env.DB.prepare(`INSERT INTO admin_challenges (challenge, created_at) VALUES (?, ?)`)
      .bind(challenge, now),
    env.DB.prepare(`DELETE FROM admin_challenges WHERE created_at < datetime('now', '-5 minutes')`)
  ]);

  return json({ challenge, expires_in: 300 });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
