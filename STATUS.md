# Quadrantology — Project Status

_Last updated: 2026-04-21 (Session 12)_

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
- Logbook viewer (`history.html`) with v1/v2 record support and journal note display
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

- [ ] Apply D1 schema migrations (`worker/schema.sql` then `worker/seed-questions.sql`) — see `TODO.md`
- [ ] Set `ADMIN_PUBLIC_KEYS` + `ADMIN_TOKEN_SECRET` CF env vars to activate admin UI — see `TODO.md`
- [ ] Promote at least one question to `calibrating` via admin UI to activate research data collection
- [ ] DNS cutover: point `quadrantology.com` to Cloudflare, disable GitHub Pages
- [ ] Create Stripe live-mode product + price
- [ ] Update CF env vars: `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `STRIPE_WEBHOOK_SECRET` (live values)
- [ ] Update Stripe webhook URL to `quadrantology.com/api/stripe-webhook`
- [ ] Test with a real card on production domain
- [ ] Verify D1 binding works in production (currently verified on staging only)

## Next Up (Tier 1 — pre-onboarding)

1. **URL fragment sharing + `r.html`** — "Share my arc" generates a ~220-char URL fragment with name + most recent 3 archetypes + summary scores. `r.html` renders received arcs client-side and has an "Add to Circle" button. Prerequisite for circle.html to be usable by real people. Requires `min_runs_to_share` completed runs. Name set at share time, not persisted.
2. **Mobile-friendly UX** — responsive pass on paywall, logbook, circle pages. (Test question flow is now touch-friendly; remaining pages still need a responsive pass.)
3. **.ics retake schedule** — client-side calendar file generation, ~30-day spacing, anchored to first test date.
4. **Research submission payload preview** — before any research data leaves the browser (per-run opt-in POST or logbook submission), show the user the exact JSON being sent in a scrollable modal. Raw stripped object, not a summary — so they can verify name/notes/code are absent.
5. **Entry points to circle + analysis** — link from results page and logbook to `circle.html`; link from circle to `analysis.html`. Currently these pages are only reachable by direct URL.

## Next Up (Tier 1.5 — content + research expansion)

- **Copy and explanatory material** — improve landing page, about/theory, and results-page copy to reinforce the tracker framing. Add FAQ or explainer for first-time users.
- **Question bank expansion** — add questions beyond the initial 28 to the D1 bank (new Q/A pairs, all starting in `calibrating` status to gather data before promoting to `live`).
- **Question bank expansion** — Q029–Q063 stubs already in D1 as `draft`. Edit text via `/admin/questions` and promote to `calibrating` to enter the pool. Target: enough vc/vd/cd questions that no single question is structurally required every run (currently Q006 appears in almost every draw as the only dual-coded ev+vc question).
- **Subscription state design** — `circle.html` and `analysis.html` are supposed to be subscription-gated; `protocol.json` has `requires_subscription: true` but nothing enforces it. Design where subscription state lives (D1 + localStorage?) and add to DATAMODEL.md before building the enforcement.
- **Product portfolio UI** — paywall presents three tiers: single assessment sequence, annual subscription, Coach Mode. Requires subscription state design above + Stripe subscription Price IDs.
- **Offline-verifiable bundle** — signed zip of `docs/` with SHA256 manifest. Users can verify and run locally with `python3 -m http.server`. Stepping stone toward ZK client.

## Next Up (Tier 1.9 — synperson research panel)

The synperson system is a 30-person synthetic focus group for longitudinal test research, QA, and eventual public access. All design specs, demographic profiles, event diaries, and scripts are complete. First QA pass done (20% hit rate). Theory fully articulated (Session 12). Synperson revision plan in `SYNPERSON_DESIGN.md`.

- [x] **Write 30 `events.md` files** — ✅ Done (Session 10).
- [x] **Build `scripts/synperson/` suite** — ✅ Done (Session 11).
- [x] **First QA run pass** — ✅ Done (Session 11): 6/30 matched (20%). Pipeline functional; hit rate needs improvement.
- [x] **Theory dialogue** — ✅ Done (Session 12). Full theoretical grounding of all 6 archetypes, 11 sub-models, relationship types, controlled vocabulary. See `THEORY.md`, `VOCAB.md`, `devlog/2026-04-21-theory-dialogue.md`.
- [ ] **Write 6 archetype behavioral profiles** — One per archetype, ~400-600 words, theory-derived, character-level. Foundation for all biography and events revision. See `SYNPERSON_DESIGN.md` Step 1.
- [ ] **Track D — Archetype description alignment** — Rewrite behavioral anchor text using theory-derived profiles. Do before Track B.
- [ ] **Track B — Behavioral anchor field** — Add `behavioral_stance` + theory-derived fields to `_rig_schema.yaml` and all 30 `rig.yaml` files. Update `run-test.py` prompt.
- [ ] **Track A — Memory model tuning** — `intensity_floor` 8→6, `alpha` 0.5→0.2, `max_events` 10→12; remove 4-relationship cap.
- [ ] **Track C — Events response beats** — Audit all 30 `events.md` files for wrong-archetype behavioral responses; add reaction beats.
- [ ] **Apply D1 schema migration** — Add `synpersons`, `synperson_events`, `synperson_runs` tables.
- [ ] **First logged run pass** — After tracks A–D, run all 30 logged; target ≥50% archetype match.
- [ ] **Public synperson page** (`docs/synpersons.html`) — panel overview + per-synperson cards.

**Question audit plan:** `AUDIT.md` documents a two-layer audit framework: structural/system tests (pool-level) + 11 unit tests (per-question, one per sub-model). Run after synperson revision to distinguish biography/events problems from question pool problems.

## Later (Tier 2 — enrichment)

- **Analytics page** — `history.html` serves as a stub for now (log of results, no chart). The full analytics page (trendline chart + commentary, unlocked at `min_runs`, richer at 5 and 10 runs) is deferred until the question bank, sampling logic, and subscription gating are solid. This is a critical launch feature but self-contained — building it well requires a stable data foundation first.
- **Bulk org admin UI** — admin page for generating code batches, viewing usage, exporting lists. Builds on existing `/api/admin/generate-codes`.

## Later (Tier 3 — Coach Mode)

- **Coach Mode subscription** — import full client logbooks via encrypted file transfer (asymmetric key pair, client encrypts, coach decrypts in-browser; private key never leaves coach's device). Stored in `quadrantology_coach_clients`. Client cap TBD in `protocol.json`.
- **Deep relationship analysis** — `analysis.html` richer mode when coach client logbooks present. Full dimension scores + arc history for all participants, not just summary arcs.

## Later (Tier 4 — advanced)

- **LLM results interpretation** — in-page chat (results + theory context → Claude API via Worker proxy) and/or MCP server exposing results for Claude Desktop.
- **x402 / crypto payments** — CF Workers x402 facilitator + "Pay with ETH" on paywall. Base/USDC.
- **Google Drive sync** — OAuth, save/sync logbook JSON to personal Drive.

## Someday / Maybe

- **Multilingual / i18n** — Full internationalisation of the product: UI copy, test question text translated and culturally adapted, results and archetype descriptions localised, scoring model validated against non-Anglophone organisational cultures. Requires a translation layer for all static copy, D1 question versioning by locale, and careful consideration of whether the six archetypes map cleanly outside Anglo-American institutional contexts. Synperson profiles will be evolved to take tests and generate events natively in their first language when this ships (e.g. Tomas Osei in Twi/English, Fatima Hasan in Urdu, Carlos Rivera in Spanish). Do not start until the English product is mature and there is demonstrated demand from a specific second-language market. The synperson panel provides a built-in cross-cultural test harness for localisation validation.

- **Verifiable local client for privacy-sovereign test-taking.** Distribute the test as a content-addressed, signed static bundle (IPFS CID or signed tarball with published SHA256) that users can verify before running. The test runs entirely from the local bundle; research submission and logbook export are explicit user actions with no ambient server access. Research data would use a ZK-friendly scheme: the client generates a cryptographic commitment to its answers, computes the archetype locally, and selectively opens only the parts of the commitment it chooses to share — proving correct computation without revealing anything withheld. Requires a ZK-executable scoring function (RISC Zero / zkWASM) and a commitment scheme for the Q/A vector. The offline-verifiable bundle (Tier 1.5) is the near-term stepping stone.

## Known Issues / Pending Review

- `game.html` is still a stub (lorem ipsum placeholder).
- `logbook.html` (was `history.html`) still shows a raw run log only; full analytics page (trendline chart, tier commentary) is deferred to Tier 2.
- `gh-pages` marketing site: Shop and How to Play pages still exist at direct URLs but are unlinked from nav. Fine for now; remove or update when V2 is ready.
- `docs/data/quadrantology-model-v1.json` not yet created (first canonical model snapshot pending admin model-snapshot procedure).

## Key Documents

| File | Purpose |
|---|---|
| `DATAMODEL.md` | Canonical data model — update before touching code |
| `DESIGN.md` | Founding design principles (also published at `docs/design_principles.html`) |
| `CLAUDE.md` | Full technical reference + wrap-up procedure for Claude Code sessions |
| `TODO.md` | Manual action items (CF dashboard, DNS, Stripe, content review) |
| `docs/data/protocol.json` | Runtime feature parameters (min_runs, circle size, calibration, etc.) |
| `devlog/` | Session-by-session narrative log |

## Stack

| Layer | Technology |
|---|---|
| Hosting | Cloudflare Pages (from `docs/`, push-to-deploy on `master`) |
| Functions | Cloudflare Pages Functions (`functions/api/`) |
| Database | Cloudflare D1 (SQLite), bound as `DB` |
| Payments | Stripe Checkout (test mode on staging) |
| Frontend | Static HTML/CSS/JS, no build step, no frameworks |
| Stable fallback | GitHub Pages, `gh-pages` branch (frozen at `ghpages-v1`) |
