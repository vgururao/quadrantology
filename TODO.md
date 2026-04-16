# Quadrantology — Manual To-Do

Items that require manual action outside of a Claude Code session (CF dashboard, Stripe, DNS, content review, etc.).

---

## Pending

### Activate research + admin features (CF Pages dashboard)
After the session 3 deploy, two manual steps are needed before the admin UI and research scaffolding work on staging:

1. Run D1 schema migrations:
   ```bash
   wrangler d1 execute quadrantology --file=worker/schema.sql --remote
   wrangler d1 execute quadrantology --file=worker/seed-questions.sql --remote
   ```
2. In CF Pages → Settings → Environment variables, add:
   - `ADMIN_PUBLIC_KEYS` (plain) — base64url SPKI public key(s), generated via the key setup flow on `/admin/questions`
   - `ADMIN_TOKEN_SECRET` (secret) — at least 32 bytes random entropy: `openssl rand -base64 32`

### Review zero-weight question vectors
Two questions have answer options with all-zero dimension weights — only the other answer scores anything. May be intentional asymmetric design; needs author review:

- **Q011 answer A** — all-zero weights (only answer B scores)
- **Q023 answer B** — all-zero weights (only answer A scores)

Once intent is confirmed, update weights via the admin UI at `/admin/questions` and add a status note to the state log.

---

## Go-Live Checklist (when ready)

- [ ] DNS cutover: point `quadrantology.com` to Cloudflare Pages, disable GitHub Pages
- [ ] Create Stripe live-mode product + price
- [ ] Update CF env vars: `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `STRIPE_WEBHOOK_SECRET` (live values)
- [ ] Update Stripe webhook URL to `quadrantology.com/api/stripe-webhook`
- [ ] Test with a real card on production domain

---

## Done

_(move completed items here)_
