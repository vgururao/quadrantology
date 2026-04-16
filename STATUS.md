# Quadrantology — Project Status

_Last updated: 2026-04-15 (Session 2)_

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

## Go-Live Checklist

- [ ] DNS cutover: point `quadrantology.com` to Cloudflare, disable GitHub Pages
- [ ] Create Stripe live-mode product + price
- [ ] Update CF env vars: `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `STRIPE_WEBHOOK_SECRET` (live values)
- [ ] Update Stripe webhook URL to `quadrantology.com/api/stripe-webhook`
- [ ] Test with a real card on production domain
- [ ] Verify D1 binding works in production (currently verified on staging only)

## Next Up (Tier 1)

1. **URL fragment sharing** — "Share my arc" generates a ~220-char URL fragment with name + most recent 3 archetypes + summary scores. `r.html` renders received arcs client-side. Requires `min_runs_to_share` completed runs. Name set at share time, not persisted.
2. **Personal Circle** (`circle.html`) — up to 8 slots for intimate contacts' arc snapshots. Subscription-gated add; receiving share URLs free. Update/drop per slot. Stored in `quadrantology_circle`.
3. **Analytics page** — rename/rebuild `history.html` → `analytics.html`. Trendline chart + commentary, unlocked at `min_runs` (3). Richer at 5 and 10 runs.
4. **Mobile-friendly UX** — responsive pass on test, paywall, logbook pages.
5. **.ics retake schedule** — client-side calendar file generation, ~30-day spacing, anchored to first test date.

## Next Up (Tier 1.5)

- **Product portfolio UI** — paywall presents three tiers: single assessment, annual subscription, Coach Mode. Requires Stripe subscription Price IDs + D1 subscription state.

## Known Issues / Pending Review

- Q011 answer A has all-zero dimension weights (only B scores). Review with author — intentional?
- Q023 answer B has all-zero dimension weights (only A scores). Same question.
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
