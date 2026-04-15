// POST /api/stripe-webhook
// Receives Stripe webhook events. On checkout.session.completed,
// generates a personal access code and writes it to D1.
//
// Required env vars:
//   STRIPE_WEBHOOK_SECRET  (secret) — from Stripe Dashboard → Webhooks → signing secret

const TOTAL_USES = 10; // runs per individual purchase

export async function onRequestPost(context) {
  const { request, env } = context;

  const rawBody = await request.text();
  const sigHeader = request.headers.get('stripe-signature');

  let event;
  try {
    event = await verifyWebhookSignature(rawBody, sigHeader, env.STRIPE_WEBHOOK_SECRET);
  } catch (e) {
    console.error('Webhook signature error:', e.message);
    return new Response('Signature verification failed', { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const code = generateCode();
    const label = session.customer_details?.email || '';

    try {
      await env.DB.prepare(
        `INSERT INTO codes (code, type, total_uses, used_uses, stripe_session_id, label, created_at)
         VALUES (?, 'personal', ?, 0, ?, ?, ?)`
      ).bind(code, TOTAL_USES, session.id, label, new Date().toISOString()).run();
    } catch (e) {
      // Idempotency: if this session_id was already processed, ignore
      if (!e.message?.includes('UNIQUE')) throw e;
    }
  }

  return new Response('ok', { status: 200 });
}

// --- Stripe webhook signature verification (no SDK needed) ---

async function verifyWebhookSignature(rawBody, sigHeader, secret) {
  if (!sigHeader || !secret) throw new Error('Missing signature or secret');

  const parts = Object.fromEntries(
    sigHeader.split(',').map(p => p.split('='))
  );
  const timestamp = parts['t'];
  const sig = parts['v1'];
  if (!timestamp || !sig) throw new Error('Malformed signature header');

  // Reject webhooks older than 5 minutes
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) {
    throw new Error('Webhook timestamp too old');
  }

  const payload = `${timestamp}.${rawBody}`;
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const computed = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  const computedHex = [...new Uint8Array(computed)]
    .map(b => b.toString(16).padStart(2, '0')).join('');

  if (computedHex !== sig) throw new Error('Signature mismatch');

  return JSON.parse(rawBody);
}

// --- Code generation ---

function generateCode() {
  const hex = crypto.randomUUID().replace(/-/g, '').toUpperCase().slice(0, 12);
  return `QNTLG-${hex.slice(0, 4)}-${hex.slice(4, 8)}-${hex.slice(8, 12)}`;
}
