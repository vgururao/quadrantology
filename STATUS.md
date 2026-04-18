# Quadrantology — Project Status

_Last updated: 2026-04-18 (Session 5)_

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
2. **Mobile-friendly UX** — responsive pass on test, paywall, logbook, circle pages.
3. **.ics retake schedule** — client-side calendar file generation, ~30-day spacing, anchored to first test date.
4. **Research submission payload preview** — before any research data leaves the browser (per-run opt-in POST or logbook submission), show the user the exact JSON being sent in a scrollable modal. Raw stripped object, not a summary — so they can verify name/notes/code are absent.
5. **Entry points to circle + analysis** — link from results page and logbook to `circle.html`; link from circle to `analysis.html`. Currently these pages are only reachable by direct URL.

## Next Up (Tier 1.5 — content + research expansion)

- **Copy and explanatory material** — improve landing page, about/theory, and results-page copy to reinforce the tracker framing. Add FAQ or explainer for first-time users.
- **Question bank expansion** — add questions beyond the initial 28 to the D1 bank (new Q/A pairs, all starting in `calibrating` status to gather data before promoting to `live`).
- **Question sampling logic** — when the bank grows beyond the run size, each run draws a balanced subset by archetype/dimension coverage rather than serving all questions. Scoring must remain comparable across runs with different subsets. Design in DATAMODEL.md before coding.
- **Subscription state design** — `circle.html` and `analysis.html` are supposed to be subscription-gated; `protocol.json` has `requires_subscription: true` but nothing enforces it. Design where subscription state lives (D1 + localStorage?) and add to DATAMODEL.md before building the enforcement.
- **Product portfolio UI** — paywall presents three tiers: single assessment sequence, annual subscription, Coach Mode. Requires subscription state design above + Stripe subscription Price IDs.
- **Offline-verifiable bundle** — signed zip of `docs/` with SHA256 manifest. Users can verify and run locally with `python3 -m http.server`. Stepping stone toward ZK client.

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

- **Verifiable local client for privacy-sovereign test-taking.** Distribute the test as a content-addressed, signed static bundle (IPFS CID or signed tarball with published SHA256) that users can verify before running. The test runs entirely from the local bundle; research submission and logbook export are explicit user actions with no ambient server access. Research data would use a ZK-friendly scheme: the client generates a cryptographic commitment to its answers, computes the archetype locally, and selectively opens only the parts of the commitment it chooses to share — proving correct computation without revealing anything withheld. Requires a ZK-executable scoring function (RISC Zero / zkWASM) and a commitment scheme for the Q/A vector. The offline-verifiable bundle (Tier 1.5) is the near-term stepping stone.

## Known Issues / Pending Review

- `game.html` is still a stub (lorem ipsum placeholder).
- `history.html` should be renamed `analytics.html` when analytics are built.
- `gh-pages` marketing site: Shop and How to Play pages still exist at direct URLs but are unlinked from nav. Fine for now; remove or update when V2 is ready.

## Key Documents

| File | Purpose |
|---|---|
| `DATAMODEL.md` | Canonical data model — update before touching code |
| `DESIGN.md` | Founding design principles |
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
