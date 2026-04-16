// Admin middleware — verifies HMAC token for all /api/admin/* routes.
// Exceptions: /api/admin/challenge and /api/admin/auth are public (handle their own logic).
// On success, attaches `context.data.adminPk` (key fingerprint) for downstream handlers.
//
// Required env vars:
//   ADMIN_TOKEN_SECRET  (secret) — at least 32 random bytes; set in CF Pages dashboard
//   ADMIN_PUBLIC_KEYS   (plain)  — comma-separated base64url SPKI ECDSA P-256 public keys

const PUBLIC_PATHS = ['/api/admin/challenge', '/api/admin/auth'];

export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (PUBLIC_PATHS.includes(url.pathname)) return context.next();

  const auth = context.request.headers.get('Authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';

  if (!token) return unauthorized('Missing token');

  const result = await verifyToken(token, context.env.ADMIN_TOKEN_SECRET);
  if (!result.ok) return unauthorized(result.error);

  context.data.adminPk = result.pk;
  return context.next();
}

async function verifyToken(token, secret) {
  const parts = token.split('.');
  if (parts.length !== 2) return { ok: false, error: 'Malformed token' };

  const [payloadB64, sigB64] = parts;

  try {
    const payload = JSON.parse(atob(payloadB64));
    if (!payload.pk || !payload.iat || !payload.exp) return { ok: false, error: 'Invalid payload' };
    if (Math.floor(Date.now() / 1000) > payload.exp) return { ok: false, error: 'Token expired' };

    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret || ''),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    const sigBytes = base64urlToBuffer(sigB64);
    const valid = await crypto.subtle.verify(
      'HMAC',
      keyMaterial,
      sigBytes,
      new TextEncoder().encode(payloadB64)
    );
    if (!valid) return { ok: false, error: 'Invalid signature' };

    return { ok: true, pk: payload.pk };
  } catch {
    return { ok: false, error: 'Token verification failed' };
  }
}

function base64urlToBuffer(b64url) {
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  const padded = b64.padEnd(b64.length + (4 - b64.length % 4) % 4, '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

function unauthorized(msg) {
  return new Response(JSON.stringify({ error: msg }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' }
  });
}
