# Quadrantology — Project Status

_Last updated: 2026-04-22 (Session 13)_

## Live

| Environment | URL | Branch | Status |
|---|---|---|---|
| Staging / active dev | https://quadrantology.pages.dev | `master` | ✅ Live, fully functional |
| Marketing site | https://quadrantology.com | `gh-pages` (active, not frozen) | ✅ V1 free test + V2 sign-up |

`quadrantology.com` points to GitHub Pages via DNS. `gh-pages` is now an actively maintained marketing/preview site: V1 free test (no paywall), static copy pages, V2 sign-up CTA. CF Pages (`master`) takes over after DNS cutover.

## What's Working (staging)

- Personality tracker logbook: name intro → 28 A/B questions → paywall → results + journal entry → save to logbook
- Journal entry textarea on results: user notes life events at result time; saved to `note` field in v2 record; rendered in logbook view
- Stripe test mode payments: purchase → webhook → code generated → results shown
- Access code system: personal (Stripe), coupon, org — all validated against D1
- Logbook: localStorage, export to `quadrantology-logbook.json`, import/merge from JSON
- Logbook viewer (`logbook.html`) with v1/v2 record support and journal note display
- v2 data model: permanent question IDs, per-question weights, continuous E↔V position, ethics simplex
- Price fetched live from Stripe (no hardcoded values)
- Results page: runs remaining count, access code advisory, save + download gesture
- **Research scaffolding** — questions served from D1 via `/api/questions`; `calibrating` status questions trigger opt-in consent flow on intro screen; opted-in sessions POST full anonymised run to `/api/research/record-response`; logbook bulk submission via `/api/research/submit-logbook`; `run_token` cross-links per-run and logbook pathways without exposing internal session IDs
- **Admin UI** (`/admin/questions`) — ECDSA P-256 challenge-response auth (keys in browser IndexedDB, never extractable); question CRUD with status toggles (`live`/`calibrating`/`archived`), per-question response weight, full state log; research data panel with A/B breakdown and archetype discrimination view; bulk import from `questions.json`
- **Personal Circle** (`circle.html`) — 8 slots for contact arc snapshots; add/update via pasted share URL (deflate-decompressed); mini arc chips, E/V bar, slot age; demo mode with 3 sci-fi-named contacts clearly flagged as dummy
- **Relationship Analysis** (`analysis.html`) — 4 analysis types over selected circle members + optionally yourself: Working Dynamic (E/V composition + archetype pair notes), Values Map (ethics simplex group average + outlier), Fault Lines (pairwise dimension gaps ranked), Collective Blind Spots (underweight dimensions flagged); demo data matching circle.html
- **Design Principles page** (`design_principles.html`) — all 7 principles published as a versioned public page; linked from site footer; Walk-Away Guarantee and data dignity documented publicly
- **Proprietary sampling endpoint** (`POST /api/sample-questions`) — pairwise tie-free sampling: per-type odd-count targets (ev/vc/vd/cd) make ties structurally impossible; co-occurrence-aware (loads last 200 sequences, penalizes frequently co-occurring pairs); multi-run overlap avoidance via `previous_runs[]` (last 3 runs' QID arrays, no server-side user tracking); `last_sampled_at` + `times_sampled` recency sorting; fire-and-forget sequence logging to D1
- **Sequence log** (`question_sequences` D1 table) — one compact row per sample draw; used by sampler for co-occurrence diversification and by diagnostics API
- **Admin diagnostics page** (`/admin/diagnostics`) — sequence log stats: summary cards, type balance min/max/avg/p50, per-question exposure bars, top co-occurring pairs, recent sequence list; window_days + recent row controls
- **Sampler smoke test** (`scripts/test-sampler.sh`) — runs N sequential sample calls chaining previous_runs, prints compact per-run summary; works against live or local wrangler dev
- **Logbook rename** — `history.html` → `logbook.html`; old URL redirects via meta-refresh
- **Scoring models table** in D1 schema (`scoring_models`) — one row per model version, full canonical JSON blob, never deleted
- **v2 run record** fields extended: `run_number`, `format_version`, `model_version` frozen at save time; `scoring_models` block embedded in all logbook exports
- **Build stamp** (`docs/v.js`) — discreet `vX.Y.Z · date` fixed bottom-right on every page; semantic versioning: `gh-pages` is v1.x.x, `master` is v2.x.x-dev
- **Select-then-confirm question flow** (both branches) — choice buttons set JS-controlled `.selected` class; always-visible Back/Next nav with disabled states; "Response changed!" notification on answer revision; fixes touch `:active` state persistence on mobile

## Go-Live Checklist

- [ ] Apply D1 schema migrations (`worker/schema.sql` then `worker/seed-questions.sql`) — see `OPS.md`
- [ ] Set `ADMIN_PUBLIC_KEYS` + `ADMIN_TOKEN_SECRET` CF env vars to activate admin UI — see `OPS.md`
- [ ] Promote at least one question to `calibrating` via admin UI to activate research data collection
- [ ] DNS cutover: point `quadrantology.com` to Cloudflare, disable GitHub Pages
- [ ] Create Stripe live-mode product + price
- [ ] Update CF env vars: `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `STRIPE_WEBHOOK_SECRET` (live values)
- [ ] Update Stripe webhook URL to `quadrantology.com/api/stripe-webhook`
- [ ] Test with a real card on production domain
- [ ] Verify D1 binding works in production (currently verified on staging only)

## Known Issues / Pending Review

- `game.html` is still a stub (lorem ipsum placeholder).
- `logbook.html` (was `history.html`) still shows a raw run log only; full analytics page (trendline chart, tier commentary) is deferred to Tier 2.
- `gh-pages` marketing site: Shop and How to Play pages still exist at direct URLs but are unlinked from nav. Fine for now; remove or update when V2 is ready.
- `docs/data/quadrantology-model-v1.json` not yet created (first canonical model snapshot pending admin model-snapshot procedure).

## Key Documents

| File | Purpose |
|---|---|
| `THEORY.md` | Canonical model — archetypes, sub-models, relationships. Top of precedence hierarchy for model content. |
| `VOCAB.md` | Controlled vocabulary — wins on term definitions, even over THEORY.md |
| `DESIGN.md` | Founding design principles (also published at `docs/design_principles.html`) |
| `DATAMODEL.md` | Canonical data model — update before touching code |
| `ROADMAP.md` | Product and theory track roadmap, tiered by priority |
| `OPS.md` | Manual action items (CF dashboard, DNS, Stripe, D1 migrations) |
| `CLAUDE.md` | Full technical reference + wrap-up procedure for Claude Code sessions |
| `docs/data/protocol.json` | Runtime feature parameters (min_runs, circle size, calibration, etc.) |
| `devlog/` | Session-by-session narrative log |
| `research/` | Research track: RESEARCH_DESIGN.md, AUDIT.md, SYNPERSON_DESIGN.md, VISUAL.md |

## Precedence Hierarchy

When documents conflict, this order resolves it:

1. `VOCAB.md` — term definitions (canonical)
2. `THEORY.md` — model content (canonical)
3. `DESIGN.md` + `DATAMODEL.md` — product decisions (canonical)
4. `research/RESEARCH_DESIGN.md` — research methodology
5. `research/SYNPERSON_DESIGN.md` — synperson revision plan
6. `synpersons/` data files — persona content
7. `STATUS.md` — current state
8. `ROADMAP.md` — future plans

## Stack

| Layer | Technology |
|---|---|
| Hosting | Cloudflare Pages (from `docs/`, push-to-deploy on `master`) |
| Functions | Cloudflare Pages Functions (`functions/api/`) |
| Database | Cloudflare D1 (SQLite), bound as `DB` |
| Payments | Stripe Checkout (test mode on staging) |
| Frontend | Static HTML/CSS/JS, no build step, no frameworks |
| Stable fallback | GitHub Pages, `gh-pages` branch (frozen at `ghpages-v1`) |
