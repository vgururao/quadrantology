# Quadrantology — Manual Ops

Items that require manual action outside of a Claude Code session: CF dashboard, Stripe, DNS, D1 migrations, content review. Research and product planning are in `ROADMAP.md`. Current project state is in `STATUS.md`.

---

## Pending

### Activate synperson D1 tables

After synperson tables are confirmed in `worker/schema.sql`, run:

```bash
wrangler d1 execute quadrantology --file=worker/schema.sql --remote
```

Then seed synperson profiles:

```bash
python3 scripts/synperson/sync-to-d1.py
```

### Create first canonical model snapshot

Create `docs/data/quadrantology-model-v1.json` — the CC BY 4.0 published model file for v1. Steps:

1. Ensure questions are seeded in D1 (`worker/seed-questions.sql`)
2. From the admin page, trigger the model snapshot procedure: snapshot questions table → insert into `scoring_models` → creates the JSON blob
3. Download and save as `docs/data/quadrantology-model-v1.json`
4. Run `git tag model-v1` and push with tags
5. Confirm `protocol.json` `model_version` is set to 1

---

## Go-Live Checklist

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
- **Research + admin scaffolding activated** — D1 schema migrations applied, CF env vars set for admin auth, ECDSA keypair generated
