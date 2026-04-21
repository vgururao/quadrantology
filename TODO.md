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

### Synperson panel — improve archetype hit rate, then first logged run

1. ~~**Write event histories**~~ — ✅ Done (Session 10).
2. ~~**Build `scripts/synperson/` suite**~~ — ✅ Done (Session 11): all 6 scripts written and syntax-verified.
3. ~~**First QA run pass**~~ — ✅ Done (Session 11): 6/30 matched (20%). Pipeline functional; hit rate needs work.
4. **Track D — Write behavioral anchor text** — For each archetype, write a `behavioral_stance` block derived from the question-weight analysis (see Session 11 devlog). This is the foundation for Tracks B and C. Key signatures: Exit = restless/bored-driven, leaves toxic situations, principles over friends, mission-first, first-principles thinking. Voice = anger/outrage-driven, stays and cleans up toxic situations, loyalty over principles, community-first, narrative thinking. Virtue = exemplar-following, reflective, apolitical. Consequentialist = ends-justify-means, politically engaged, analytical, present-focused. Deontological = principled hands-on action, self-reliant, concrete first steps, self-challenging.
5. **Track B — Add `behavioral_stance` to rig.yaml** — Update `_rig_schema.yaml` schema, then add the appropriate anchor text to all 30 `rig.yaml` files. Redesign `run-test.py` prompt to surface `behavioral_stance` before event summary.
6. **Track A — Memory model tuning** — Change defaults in `run-test.py`/`run-panel.py`: `intensity_floor` 8→6, `alpha` 0.5→0.2, `max_events` 10→12. Remove 4-relationship cap.
7. **Track C — Events response beats** — Audit all 30 `events.md` files. Fix events that show the wrong archetype's behavioral response. Add reaction beats: Exit personas should disengage/leave in response to toxic situations; Voice personas should stay and push back.
8. **Apply D1 schema migration** — Run after synperson tables confirmed in `worker/schema.sql`:
   ```bash
   wrangler d1 execute quadrantology --file=worker/schema.sql --remote
   ```
9. **Seed synperson profiles to D1** — `python3 scripts/synperson/sync-to-d1.py`
10. **First logged run pass** — `python3 scripts/synperson/run-panel.py --logged`; target ≥50% archetype match.
11. **Public synperson page** — `docs/synpersons.html`: panel overview + per-synperson cards.

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
