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


### Create first canonical model snapshot

Create `docs/data/quadrantology-model-v1.json` — the CC BY 4.0 published model file for v1. Steps:
1. Ensure questions are seeded in D1 (`worker/seed-questions.sql`)
2. From the admin page, trigger the model snapshot procedure: snapshot questions table → insert into `scoring_models` → creates the JSON blob
3. Download and save as `docs/data/quadrantology-model-v1.json`
4. Run `git tag model-v1` and push with tags
5. Confirm `protocol.json` `model_version` is set to 1

---

### Synperson panel — bring to first logged run

1. ~~**Write event histories**~~ — ✅ Done (Session 10): all 30 `events.md` files written, 15 events each, up to April 2026.
2. **Public synperson page** — `docs/synpersons.html`: public-facing page presenting the 30 synperson profiles and their evolving test histories. Goal: let visitors watch the simulation research evolve in real time. Contents: panel overview, per-synperson card (bio stub, archetype, nationality/role, link to full profile), results history when runs exist. Design: static HTML rendered from synperson data; profiles expand over time as runs accumulate. See STATUS.md Tier 1.9 for full spec.
3. **Update `worker/schema.sql`** — Add the three synperson tables from `DATAMODEL.md` and apply:
   ```bash
   wrangler d1 execute quadrantology --file=worker/schema.sql --remote
   ```
4. **Build `scripts/synperson/` suite** — Start with `memory.py` + `scoring.py` (shared modules), then `run-test.py` (both `--logged` and `--qa` modes), then `evolve-events.py` and `sync-to-d1.py`.
5. **Seed synperson profiles to D1** — Run `sync-to-d1.py` to populate `synpersons` and `synperson_events` from the local YAML/markdown files.
6. **First logged run pass** — `run-panel.py --logged` across all 30; inspect archetype distribution.

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
