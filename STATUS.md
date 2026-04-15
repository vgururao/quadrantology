# Quadrantology — Project Status

_Last updated: 2026-04-15_

## Live

| Environment | URL | Status |
|---|---|---|
| Staging | https://quadrantology.pages.dev | ✅ Live, fully functional |
| Production | https://quadrantology.com | ⚠️ Still on GitHub Pages DNS — cutover pending |

## What's Working (staging)

- Personality test: name intro → 28 A/B questions → paywall → results
- Stripe test mode payments: purchase → webhook → code generated → results shown
- Access code system: personal (Stripe), coupon, org — all validated against D1
- Code stored silently in localStorage, included in downloaded history with safety note
- Per-device history: localStorage, export to JSON, import/merge from JSON
- History viewer page with v1/v2 record support
- v2 data model: permanent question IDs (Q001–Q028), per-question weights, continuous position
- Price fetched live from Stripe (no hardcoded values)
- Results page: runs remaining count, 6-month tracking advisory, download prompt

## Go-Live Checklist

- [ ] DNS cutover: point quadrantology.com to Cloudflare, disable GitHub Pages
- [ ] Create Stripe live-mode product + price
- [ ] Update CF env vars: `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `STRIPE_WEBHOOK_SECRET` (live values)
- [ ] Update Stripe webhook URL to `quadrantology.com/api/stripe-webhook`
- [ ] Test with a real card on production domain
- [ ] Verify D1 binding works in production (currently verified on staging only)

## Next Up (Tier 1)

1. **Encrypted URL fragment sharing** — share results via URL (CryptoPad/Excalidraw pattern), foundation for circle comparison. Plan ready, build next session.
2. **Circle comparison** — `compare.html` loads multiple shared URLs client-side, relational analysis. Blocked by #1.
3. **Mobile-friendly UX** — responsive pass on test, paywall, history pages.
4. **Email reminders** — CF Cron Trigger at ~3mo and ~5.5mo to prompt retake before 6-month expiry.

## Known Issues / Pending Review

- Q011 answer A has all-zero dimension weights (only B scores). Review with author — intentional?
- Q023 answer B has all-zero dimension weights (only A scores). Same question.
- `game.html` is still a stub (lorem ipsum placeholder).

## Stack

| Layer | Technology |
|---|---|
| Hosting | Cloudflare Pages (from `docs/`, push-to-deploy) |
| Functions | Cloudflare Pages Functions (`functions/api/`) |
| Database | Cloudflare D1 (SQLite), bound as `DB` |
| Payments | Stripe Checkout (test mode on staging) |
| Frontend | Static HTML/CSS/JS, no build step, no frameworks |
| Legacy fallback | GitHub Pages, tag `ghpages-v1` |
