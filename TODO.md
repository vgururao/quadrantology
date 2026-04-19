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

### Seed draft question stubs into D1
`worker/seed-stubs.sql` contains Q029–Q063 placeholder questions (vc/vd/cd coverage). Run once after the schema migration to load them into the admin UI for editing:
```bash
wrangler d1 execute quadrantology --file=worker/seed-stubs.sql --remote
```
Then edit text via `/admin/questions` and promote to `calibrating` when ready.

### Create first canonical model snapshot

Create `docs/data/quadrantology-model-v1.json` — the CC BY 4.0 published model file for v1. Steps:
1. Ensure questions are seeded in D1 (`worker/seed-questions.sql`)
2. From the admin page, trigger the model snapshot procedure: snapshot questions table → insert into `scoring_models` → creates the JSON blob
3. Download and save as `docs/data/quadrantology-model-v1.json`
4. Run `git tag model-v1` and push with tags
5. Confirm `protocol.json` `model_version` is set to 1

---

## Go-Live Checklist (when ready)

- [ ] DNS cutover: point `quadrantology.com` to Cloudflare Pages, disable GitHub Pages
- [ ] Create Stripe live-mode product + price
- [ ] Update CF env vars: `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `STRIPE_WEBHOOK_SECRET` (live values)
- [ ] Update Stripe webhook URL to `quadrantology.com/api/stripe-webhook`
- [ ] Test with a real card on production domain

---

## Done

- **D1 schema migrations applied** — `schema.sql` (with `question_sequences`, `times_sampled`, `last_sampled_at`, `draft` status) executed remotely via wrangler
- **Admin UI activated** — `ADMIN_PUBLIC_KEYS` and `ADMIN_TOKEN_SECRET` set in CF Pages env vars; ECDSA keypair generated in browser; auth working
- **Zero-weight questions fixed** — Q011 answer A and Q023 answer B weights corrected in D1 (via admin UI) and in `docs/data/questions.json` on both `master` and `gh-pages`
