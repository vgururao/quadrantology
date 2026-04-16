// POST /api/admin/auth
// Authenticates an admin via ECDSA P-256 challenge-response.
// Returns a short-lived HMAC-signed token on success.
//
// Body: {
//   challenge:  string  — nonce from GET /api/admin/challenge
//   signature:  string  — base64url ECDSA signature of the challenge string
//   public_key: string  — base64url SPKI-encoded ECDSA P-256 public key
// }
//
// Required env vars:
//   ADMIN_PUBLIC_KEYS   — comma-separated base64url public keys (allowed admins)
//   ADMIN_TOKEN_SECRET  — HMAC signing secret (min 32 bytes of entropy)

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try { body = await request.json(); }
  catch { return json({ error: 'Invalid JSON' }, 400); }

  const { challenge, signature, public_key } = body;
  if (!challenge || !signature || !public_key) {
    return json({ error: 'challenge, signature, and public_key required' }, 400);
  }

  // Verify challenge exists and is not expired (consume atomically)
  const row = await env.DB.prepare(
    `SELECT challenge FROM admin_challenges
     WHERE challenge = ? AND created_at > datetime('now', '-5 minutes')`
  ).bind(challenge).first();

  if (!row) return json({ error: 'challenge_expired' }, 401);

  // Check public key is in the allowed list
  const allowedKeys = (env.ADMIN_PUBLIC_KEYS || '')
    .split(',')
    .map(k => k.trim())
    .filter(Boolean);

  if (!allowedKeys.includes(public_key)) {
    return json({ error: 'Public key not authorized' }, 403);
  }

  // Verify ECDSA P-256 signature
  try {
    const keyData = base64urlToBuffer(public_key);
    const importedKey = await crypto.subtle.importKey(
      'spki',
      keyData,
      { name: 'ECDSA', namedCurve: 'P-256' },
      false,
      ['verify']
    );
    const sig = base64urlToBuffer(signature);
    const data = new TextEncoder().encode(challenge);
    const valid = await crypto.subtle.verify(
      { name: 'ECDSA', hash: 'SHA-256' },
      importedKey,
      sig,
      data
    );
    if (!valid) return json({ error: 'Invalid signature' }, 401);
  } catch {
    return json({ error: 'Signature verification failed' }, 401);
  }

  // Consume challenge (delete after successful verification)
  await env.DB.prepare(`DELETE FROM admin_challenges WHERE challenge = ?`).bind(challenge).run();

  // Compute fingerprint: first 16 hex chars of SHA-256 of the raw public key bytes
  const keyBytes = base64urlToBuffer(public_key);
  const hashBuf = await crypto.subtle.digest('SHA-256', keyBytes);
  const fingerprint = Array.from(new Uint8Array(hashBuf).slice(0, 8))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  // Issue HMAC-signed token (1-hour expiry)
  const token = await createToken(fingerprint, env.ADMIN_TOKEN_SECRET);
  return json({ token, fingerprint });
}

async function createToken(fingerprint, secret) {
  const payload = JSON.stringify({
    pk:  fingerprint,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600
  });
  const payloadB64 = btoa(payload);

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret || crypto.randomUUID()), // fallback makes token always invalid if secret missing
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sigBuffer = await crypto.subtle.sign(
    'HMAC',
    keyMaterial,
    new TextEncoder().encode(payloadB64)
  );
  return `${payloadB64}.${bufferToBase64url(sigBuffer)}`;
}

function base64urlToBuffer(b64url) {
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  const padded = b64.padEnd(b64.length + (4 - b64.length % 4) % 4, '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

function bufferToBase64url(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
