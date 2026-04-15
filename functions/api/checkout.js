// POST /api/checkout
// Creates a Stripe Checkout session for an individual 10-run access pack.
// Returns: { url } to redirect the client to.
//
// Required env vars (set via CF Pages dashboard → Settings → Environment variables):
//   STRIPE_SECRET_KEY   (secret)
//   STRIPE_PRICE_ID     (secret) — the Price ID from your Stripe product catalog

export async function onRequestPost(context) {
  const { request, env } = context;
  const origin = new URL(request.url).origin;

  const params = new URLSearchParams({
    mode: 'payment',
    'line_items[0][price]': env.STRIPE_PRICE_ID,
    'line_items[0][quantity]': '1',
    success_url: `${origin}/test.html?session_id={CHECKOUT_SESSION_ID}&success=1`,
    cancel_url: `${origin}/test.html?canceled=1`,
  });

  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  const session = await res.json();
  if (!session.url) {
    console.error('Stripe session error:', session);
    return json({ error: 'Failed to create checkout session' }, 502);
  }

  return json({ url: session.url });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
