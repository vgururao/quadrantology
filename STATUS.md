# Quadrantology — Project Status

_Last updated: 2026-04-16 (Session 3)_

## Live

| Environment | URL | Branch | Status |
|---|---|---|---|
| Staging / active dev | https://quadrantology.pages.dev | `master` | ✅ Live, fully functional |
| Production | https://quadrantology.com | `gh-pages` (frozen at `ghpages-v1`) | ✅ Stable pre-paywall build |

`quadrantology.com` still points to GitHub Pages via DNS. CF Pages takes over after DNS cutover.

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

- [ ] DNS cutover: point `quadrantology.com` to Cloudflare, disable GitHub Pages
- [ ] Create Stripe live-mode product + price
- [ ] Update CF env vars: `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `STRIPE_WEBHOOK_SECRET` (live values)
- [ ] Update Stripe webhook URL to `quadrantology.com/api/stripe-webhook`
- [ ] Test with a real card on production domain
- [ ] Verify D1 binding works in production (currently verified on staging only)

## Next Up (Tier 1)

1. **URL fragment sharing** — "Share my arc" generates a ~220-char URL fragment with name + most recent 3 archetypes + summary scores. `r.html` renders received arcs client-side. Requires `min_runs_to_share` completed runs. Name set at share time, not persisted.
2. **Analytics page** — rename/rebuild `history.html` → `analytics.html`. Trendline chart + commentary, unlocked at `min_runs` (3). Richer at 5 and 10 runs.
3. **Mobile-friendly UX** — responsive pass on test, paywall, logbook pages.
4. **.ics retake schedule** — client-side calendar file generation, ~30-day spacing, anchored to first test date.
5. **Research submission payload preview** — before any research data leaves the browser (per-run opt-in POST or logbook submission), show the user the exact JSON being sent in a scrollable modal. Not a summary — the raw stripped object, so they can verify name/notes/code are absent. "Here is exactly what will be sent. Proceed?"
6. **Apply D1 schema migrations** — `wrangler d1 execute quadrantology --file=worker/schema.sql --remote` then `--file=worker/seed-questions.sql --remote`; set `ADMIN_PUBLIC_KEYS` and `ADMIN_TOKEN_SECRET` env vars in CF Pages dashboard to activate admin UI.

## Next Up (Tier 1.5)

- **Product portfolio UI** — paywall presents three tiers: single assessment, annual subscription, Coach Mode. Requires Stripe subscription Price IDs + D1 subscription state.
- **Offline-verifiable bundle** — publish a signed, versioned zip of `docs/` (the complete static site) alongside each release, with a SHA256 in a signed manifest. Users who want to audit the code they're running can download the bundle, verify the hash, and run locally with `python3 -m http.server`. Neither research logging pathway fires in this mode unless the user explicitly initiates a submission. Worker-dependent features (Stripe, code validation) won't work offline, but the test itself, scoring, and local logbook do. Stepping stone toward the ZK-verifiable client in Someday/Maybe.

## Someday / Maybe

- **Verifiable local client for privacy-sovereign test-taking.** The fundamental limitation of any web app is that the server serves the code, so secret telemetry is undetectable without auditing the network. A stronger model: distribute the test as a content-addressed, signed static bundle (IPFS CID or signed tarball with published SHA256) that users can verify before running. The test runs entirely from the local bundle; research submission and logbook export are explicit user actions with no ambient server access. Research data would use a ZK-friendly scheme: the client generates a cryptographic commitment to its answers, computes the archetype locally, and selectively opens only the parts of the commitment it chooses to share — proving correct computation without revealing anything withheld. This requires a ZK-executable version of the scoring function (plausible with RISC Zero or zkWASM once tooling matures) and a commitment scheme for the Q/A vector. The offline-verifiable bundle (Tier 1.5) is the near-term stepping stone toward this.

## Known Issues / Pending Review

- `game.html` is still a stub (lorem ipsum placeholder).
- `history.html` should be renamed `analytics.html` when analytics are built.

## Key Documents

| File | Purpose |
|---|---|
| `DATAMODEL.md` | Canonical data model — update before touching code |
| `DESIGN.md` | Founding design principles |
| `docs/data/protocol.json` | Runtime feature parameters (min_runs, circle size, etc.) |
| `CLAUDE.md` | Full technical reference for Claude Code sessions |

## Stack

| Layer | Technology |
|---|---|
| Hosting | Cloudflare Pages (from `docs/`, push-to-deploy on `master`) |
| Functions | Cloudflare Pages Functions (`functions/api/`) |
| Database | Cloudflare D1 (SQLite), bound as `DB` |
| Payments | Stripe Checkout (test mode on staging) |
| Frontend | Static HTML/CSS/JS, no build step, no frameworks |
| Stable fallback | GitHub Pages, `gh-pages` branch (frozen at `ghpages-v1`) |
