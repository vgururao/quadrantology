# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project Overview

Quadrantology is a personality test and card game website at **quadrantology.com**. It models organizational creative destruction through 6 archetypes in two groups: Exit (Hacker, Contrarian, Legalist) and Voice (Investigator, Holy Warrior, Operator), mapped onto a master 2×2 framework called "Death and Taxes" with 13 sub-models.

The personality test is the primary active product. It is a paid service: users take the test free, then pay or enter an access code to view results. Access codes come in three types: `personal` (generated on Stripe purchase), `coupon` (batch-generated promos), and `org` (bulk org purchases). All code management is in Cloudflare D1.

**Privacy principle:** we sell access (codes), not data. Sharing and aggregation are always user-initiated. We do not build data-collection tooling for orgs.

## Repository Structure

```
docs/              — Live website (Cloudflare Pages, custom domain quadrantology.com)
  index.html       — Home: hero + CTA + archetype card grid
  test.html        — Personality test: name intro → 28 questions → paywall → results
  theory.html      — Full model exposition
  understand.html  — Understanding Your Results: 13 models as 2×2 grids
  shop.html        — Card deck shop + print-at-home downloads
  game.html        — How to Play (stub)
  history.html     — Per-device test history viewer
  hacker.html, contrarian.html, legalist.html,
  investigator.html, holywarrior.html, operator.html
  quadrantology.css — Full shared stylesheet with custom properties
  data/
    questions.json — Question bank (schema v1): permanent IDs, weights, status
  images/          — Site images and card print sheets

functions/         — Cloudflare Pages Functions (deployed alongside docs/)
  api/
    validate-code.js    — POST: check code validity + remaining uses
    consume-code.js     — POST: decrement use counter (fire-and-forget after results)
    checkout.js         — POST: create Stripe Checkout session
    session-code.js     — GET:  exchange Stripe session_id for personal code
    stripe-webhook.js   — POST: handle checkout.session.completed, generate code
    price.js            — GET:  fetch live price display from Stripe
    admin/
      generate-codes.js — POST: batch-generate coupon/org codes (admin-protected)

worker/
  schema.sql       — D1 schema (apply once: wrangler d1 execute quadrantology --file=worker/schema.sql --remote)

assets/            — Source/master files (not served)
  deck/            — Card deck masters (character art, logos, PSD masters)
  booklet/         — Booklet page PNGs and cover
  twoTriangles.svg — Canonical editable two-triangles diagram
  resultsExplainer.pdf — Master slide deck, source for understand.html

history/           — Archived materials
  docs/            — Archived PDFs and superseded materials
  qtest/           — Legacy Matlab scoring scripts
  typeform/        — Legacy Typeform batch processing + pilot data

devlog/            — Session-by-session development log (eventually published)
```

## Deployment

Two separate deploy targets — **do not confuse them**:

| Target | URL | Branch | Purpose |
|---|---|---|---|
| Cloudflare Pages | `quadrantology.pages.dev` | `master` | Active development |
| GitHub Pages | `quadrantology.com` | `gh-pages` | Stable production (pre-CF DNS cutover) |

### Cloudflare Pages (active development)
- Deploys automatically on push to `master` — no build step
- Pages Functions in `functions/api/` deploy automatically alongside
- D1 database: `quadrantology` (bound as `DB` in CF Pages → Settings → Functions)
- `quadrantology.com` will point here after DNS cutover

### GitHub Pages (stable, `quadrantology.com` via current DNS)
- Serves from the `gh-pages` branch at `/docs`
- `gh-pages` branch = snapshot at tag `ghpages-v1` (last clean build before CF migration)
- **Do not push new features here** — this is the frozen stable build for current DNS
- To update: cherry-pick specific commits onto `gh-pages`, or advance the branch intentionally

### DNS cutover plan (when ready)
1. Point `quadrantology.com` DNS to Cloudflare Pages
2. Disable GitHub Pages in repo settings (or leave as fallback)
3. Update Stripe webhook URL to `quadrantology.com/api/stripe-webhook`

### Local preview
```bash
python3 -m http.server -d docs
```
Worker-dependent features (Stripe, code validation) require `wrangler pages dev`.

## Backend

### API routes

| Route | Purpose |
|---|---|
| `GET  /api/price` | Live price from Stripe (so UI always matches product) |
| `POST /api/validate-code` | Check code validity + remaining uses |
| `POST /api/consume-code` | Decrement use counter (called after results shown) |
| `POST /api/checkout` | Create Stripe Checkout session |
| `GET  /api/session-code?session_id=` | Exchange Stripe session_id for personal code |
| `POST /api/stripe-webhook` | Handle payment events, generate personal code |
| `POST /api/admin/generate-codes` | Batch-generate coupon/org codes |

### D1 schema (`worker/schema.sql`)

One table: `codes`

| Column | Type | Notes |
|---|---|---|
| `code` | TEXT PK | Format: `QNTLG-XXXX-XXXX-XXXX` |
| `type` | TEXT | `personal` / `coupon` / `org` |
| `total_uses` | INTEGER | Runs purchased/granted |
| `used_uses` | INTEGER | Incremented on each result view |
| `org_id` | TEXT | Org name or promo label |
| `label` | TEXT | Human label; stores email for personal codes |
| `stripe_session_id` | TEXT | For personal codes from Stripe |
| `created_at` | TEXT | ISO timestamp |

### Environment variables (CF Pages → Settings → Environment variables)

| Name | Type | Purpose |
|---|---|---|
| `STRIPE_SECRET_KEY` | Secret | Stripe API secret (`sk_test_...` or `sk_live_...`) |
| `STRIPE_WEBHOOK_SECRET` | Secret | Stripe webhook signing secret (`whsec_...`) |
| `STRIPE_PRICE_ID` | Secret | Price ID for the access product (`price_...`) |
| `ADMIN_SECRET` | Secret | Bearer token for `/api/admin/generate-codes` |

## Data Model

See `DATAMODEL.md` for the full canonical spec. Summary below for quick reference.

### questions.json (schema v1)

Each question has a permanent `id` (Q001–Q028+), `status` (`active`/`retired`), `weight` (float, default 1.0), `added` (schema version), and dimension weight vectors for answers `a` and `b`.

Dimensions (index order): `[exit, voice, virtue, consequentialist, deontological]`

Questions are never deleted — only retired. Retired questions stay in the file so old history records can be replayed.

**Known issues to resolve:** Q011 answer A and Q023 answer B have all-zero weight vectors. May be intentional asymmetric questions — review with author.

### Own run records

Two versions coexist in localStorage and exported JSON:

**v1** (legacy): `{ version:1, timestamp, archetype, evBias, scores:[array], answers:[array] }`

**v2** (current): `{ version:2, timestamp, questions_version, run:[{qid,ans}], scores:{exit,voice,virtue,consequentialist,deontological}, position:{ev, ethics:{virtue,consequentialist,deontological}}, archetype, ev_bias, note:'' }`

- `position.ev`: continuous E↔V position, -1 (pure Voice) to +1 (pure Exit)
- `position.ethics`: simplex proportions summing to 1.0
- `run`: exact question IDs + answers, enabling future replay and reanalysis
- `note`: freeform journal entry, private to the user, never included in share payloads

### Personal Circle records

Stored alongside own runs. Each entry is a point-in-time snapshot received from another person's share URL. Up to `personal_circle.max_slots` entries (currently 8, see `docs/data/protocol.json`).

```
{
  version: "circle-v1",
  added:   <ISO timestamp when added to circle>,
  name:    <string, as set by the sharer>,
  results: [
    { ts, archetype, ev, ethics:[virtue, consequentialist, deontological] },
    ...  // up to 3 entries, newest first
  ]
}
```

- `results` contains summary data only — no Q/A run data, no journal notes
- `ethics` is an array of proportions summing to 1.0 (virtue, consequentialist, deontological)
- To update: user pastes a new share URL into that person's slot; `added` timestamp refreshes
- Requires subscription to add entries; receiving and viewing a share URL is free

### Share URL payload

Generated client-side from own logbook when user clicks "Share my arc". Requires `min_runs_to_share` completed runs (currently 3). Fragment format: `r.html#v1:<base64url-deflate-json>`.

```
{
  v:    1,
  name: <string, editable by sharer before generating>,
  results: [
    { ts, archetype, ev, ethics:[virtue, consequentialist, deontological] },
    ...  // most recent 3 own runs
  ]
}
```

Never sent to the server. Decoded and rendered entirely in `r.html`. Journal notes and full Q/A data are never included.

### localStorage keys

| Key | Content |
|---|---|
| `quadrantology_name` | User's display name |
| `quadrantology_code` | Access code (personal/coupon/org) |
| `quadrantology_history` | JSON array of own run records (newest first, v1+v2) |
| `quadrantology_circle` | JSON array of Personal Circle entries (circle-v1, up to 8) |

### Downloaded logbook JSON

Top-level fields: `_note`, `name`, `code`, `history` (own runs), `circle` (Personal Circle snapshots). The code is flagged in the note so users know to keep the file secure. Circle data is included so the full relational context is portable across devices.

## Architecture Notes

- All pages share `quadrantology.css` and the same nav structure (CSS-only hamburger menu, checkbox trick)
- System font stack, no external JS dependencies
- Nav: The Test | The Theory | Shop | How to Play | Archetypes (dropdown)
- Color scheme: bg `#f4f1eb`, card `#ffffff`, text `#2c2c2c`, accent `#c0713a`, exit `#3a7a8c` (teal), voice `#8c3a3a` (deep red)
- Test flow: name intro → questions → compute results → check localStorage for code → paywall if none → results
- Price shown in UI is fetched live from Stripe `/api/price` so it always matches the product
