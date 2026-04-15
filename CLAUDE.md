# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Quadrantology is a personality test and card game website served at **quadrantology.com**. It models organizational creative destruction through 6 archetypes in two groups: Exit (Hacker, Contrarian, Legalist) and Voice (Investigator, Holy Warrior, Operator), mapped onto a master 2×2 framework called "Death and Taxes" with 13 sub-models.

The website is the primary active component. The personality test is implemented as a static JS webapp with local storage. Plans exist for Stripe payments and trend tracking.

## Repository Structure

- **`docs/`** — Live website (GitHub Pages, custom domain `quadrantology.com`). Static HTML/CSS/JS, no build system.
  - `index.html` — Home: hero + CTA + archetype card grid
  - `test.html` — 28-question A/B test with progress bar, animated score bars, archetype icon on results
  - `theory.html` — Full model exposition
  - `understand.html` — Understanding Your Results: 13 models as 2×2 grids, scoring, transitions/emotions, self-actualization
  - `shop.html` — Card deck shop with playtesting photos + print-at-home downloads
  - `game.html` — How to Play (stub)
  - 6 archetype pages: `hacker.html`, `contrarian.html`, `legalist.html`, `investigator.html`, `holywarrior.html`, `operator.html`
  - `quadrantology.css` — Full shared stylesheet with custom properties
  - `data/` — Test question and answer weight data (JSON)
  - `images/` — Site images and card print sheets
- **`assets/`** — Source/master files
  - `deck/` — Card deck masters (character art, logos, card formats, PSD masters)
  - `booklet/` — Booklet page PNGs and cover
  - `twoTriangles.svg` — Canonical editable two-triangles diagram
  - `resultsExplainer.pdf` — Master slide deck (PDF) for the 13-model results explainer, source for `understand.html`
- **`history/`** — Archived materials with `README.md`
  - `docs/` — Archived PDFs and superseded materials
  - `qtest/` — Legacy Matlab scoring scripts (Exosphere workshop)
  - `typeform/` — Legacy Typeform batch processing + pilot data

## Deployment

### Current (active): Cloudflare Pages + Workers
- Cloudflare Pages serves `docs/` — deploy on push to `master`
- Cloudflare Workers handle API routes (`/api/checkout`, `/api/stripe-webhook`)
- Dev/staging site: `quadrantology.pages.dev` (no DNS change needed)
- Production: `quadrantology.com` (DNS on Cloudflare, cutover when ready)
- Worker + D1 config lives in `worker/` (not yet created)

### Legacy: GitHub Pages
- Tag `ghpages-v1` marks the last known-good GitHub Pages build
- To restore: revert to that tag, re-enable GH Pages in repo settings
- GH Pages served `docs/` directly from `master` — no build step
- Will break when CF-specific features (Worker API calls) are added to `docs/`

### Local preview
```
python3 -m http.server -d docs
```
Note: Worker-dependent features (Stripe checkout, code validation) won't work locally without `wrangler pages dev`.

## Backend (Cloudflare Pages Functions)

Serverless functions in `functions/api/` — deployed automatically by CF Pages alongside `docs/`.

| Route | File | Purpose |
|---|---|---|
| `POST /api/validate-code` | `functions/api/validate-code.js` | Check if a code exists and has uses remaining |
| `POST /api/consume-code` | `functions/api/consume-code.js` | Decrement a code's use counter (called after results shown) |
| `POST /api/checkout` | `functions/api/checkout.js` | Create Stripe Checkout session |
| `GET  /api/session-code` | `functions/api/session-code.js` | Exchange Stripe session_id for generated personal code |
| `POST /api/stripe-webhook` | `functions/api/stripe-webhook.js` | Handle Stripe events, generate personal code on payment |
| `POST /api/admin/generate-codes` | `functions/api/admin/generate-codes.js` | Batch-generate coupon/org codes (admin-protected) |

### D1 Database

Schema: `worker/schema.sql`. One table: `codes`.

Apply schema:
```bash
wrangler d1 execute quadrantology --file=worker/schema.sql
```

### Environment variables (set in CF Pages dashboard → Settings → Environment variables)

| Name | Type | Purpose |
|---|---|---|
| `STRIPE_SECRET_KEY` | Secret | Stripe API secret key |
| `STRIPE_WEBHOOK_SECRET` | Secret | Stripe webhook signing secret |
| `STRIPE_PRICE_ID` | Secret | Price ID for the individual access product |
| `ADMIN_SECRET` | Secret | Bearer token for `/api/admin/generate-codes` |

### Code format

All codes follow the pattern `QNTLG-XXXX-XXXX-XXXX` (12 uppercase hex chars from a UUID).

Types: `personal` (from Stripe purchase), `coupon` (batch-generated promo), `org` (bulk org purchase).

## Architecture Notes

- All pages share `quadrantology.css` and the same nav structure (CSS-only hamburger menu, checkbox trick)
- System font stack, no external dependencies
- Nav: The Test | The Theory | Shop | How to Play | Archetypes (dropdown with Exit/Voice groups)
- Color scheme: bg `#f4f1eb`, card `#ffffff`, text `#2c2c2c`, accent `#c0713a`, exit `#3a7a8c` (teal), voice `#8c3a3a` (deep red)
- The test in `test.html` is pure client-side JS with local scoring
- Answer weights are in `docs/data/` (JSON) and historically in `history/typeform/qtest/data/` (.mat, .txt)
- `understand.html` uses `.model-grid` / `.model-card` / `.model-table` CSS classes for the 2×2 model grids
