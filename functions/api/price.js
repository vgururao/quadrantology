// GET /api/price
// Returns the display price for the access product, fetched live from Stripe.
// Used by the front-end so the price shown always matches the Stripe product.

export async function onRequestGet(context) {
  const { env } = context;

  const res = await fetch(`https://api.stripe.com/v1/prices/${env.STRIPE_PRICE_ID}`, {
    headers: { 'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}` }
  });

  if (!res.ok) {
    return new Response(JSON.stringify({ error: 'Could not fetch price' }), {
      status: 502, headers: { 'Content-Type': 'application/json' }
    });
  }

  const price = await res.json();
  const dollars = (price.unit_amount / 100).toFixed(2).replace(/\.00$/, '');
  const symbol = price.currency === 'usd' ? '$' : price.currency.toUpperCase() + ' ';

  return new Response(JSON.stringify({ display: symbol + dollars, unit_amount: price.unit_amount }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
