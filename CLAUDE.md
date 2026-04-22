# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project Overview

Quadrantology is a **personality tracker** and card game website at **quadrantology.com**. It models organizational creative destruction through 6 archetypes in two groups: Exit (Hacker, Contrarian, Legalist) and Voice (Investigator, Holy Warrior, Operator), mapped onto a master 2×2 framework called "Death and Taxes" with 13 sub-models.

The core product is a logbook-based personality tracker, not a one-shot test. Users take the questionnaire multiple times over a period (minimum 3 runs over 90 days), building a logbook of results with journal entries. The trend across runs — the personality arc — is the primary result. See `DESIGN.md` for design principles and `DATAMODEL.md` for the full data model.

Access is a paid service: users take the test free, then pay or enter an access code to view results. Three product tiers are planned: single assessment sequence, annual subscription, and Coach Mode. Access codes come in three types: `personal` (generated on Stripe purchase), `coupon` (batch-generated promos), and `org` (bulk org purchases). All code management is in Cloudflare D1.

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
  history.html     — Logbook viewer (rename to analytics.html when analytics built)
  circle.html      — Personal Circle: up to 8 arc snapshots from contacts
  analysis.html    — Relationship Analysis: computed views over circle + own data
  hacker.html, contrarian.html, legalist.html,
  investigator.html, holywarrior.html, operator.html
  quadrantology.css — Full shared stylesheet with custom properties
  data/
    questions.json  — Question bank (seed/backup only; canonical source is now D1)
    protocol.json   — Runtime feature parameters (min_runs, circle size, calibration, etc.)
  images/          — Site images and card print sheets
  admin/
    questions.html   — Admin UI: question CRUD, status toggles, research data view (ECDSA key auth)
    diagnostics.html — Sequence log diagnostics: exposure, type balance, co-occurrence, parity stats

functions/         — Cloudflare Pages Functions (deployed alongside docs/)
  api/
    validate-code.js    — POST: check code validity + remaining uses
    consume-code.js     — POST: decrement use counter (fire-and-forget after results)
    checkout.js         — POST: create Stripe Checkout session
    session-code.js     — GET:  exchange Stripe session_id for personal code
    stripe-webhook.js   — POST: handle checkout.session.completed, generate code
    price.js            — GET:  fetch live price display from Stripe
    questions.js        — GET:  serve live+calibrating questions from D1 (falls back to 503)
    sample-questions.js — POST: proprietary balanced sampling (pairwise tie-free, co-occurrence-aware, multi-run overlap avoidance)
    admin/
      _middleware.js    — HMAC token verification for all /api/admin/* routes
      challenge.js      — GET:  issue nonce for ECDSA challenge-response auth
      auth.js           — POST: verify signature, return HMAC session token
      questions.js      — GET/POST: question CRUD + state log
      research-data.js  — GET:  per-question response counts + archetype breakdown
      generate-codes.js — POST: batch-generate coupon/org codes
      sequences.js      — GET:  sequence log diagnostics (summary, exposure, type balance, cooccurrence, recent)
    research/
      record-response.js  — POST: store opted-in test run anonymously (per-run pathway)
      submit-logbook.js   — POST: store full logbook history anonymously (bulk pathway)

worker/
  schema.sql       — D1 schema (apply once: wrangler d1 execute quadrantology --file=worker/schema.sql --remote)
  seed-questions.sql — INSERT OR IGNORE for all 28 questions; run once after schema.sql

assets/            — Source/master files (not served)
  deck/            — Card deck masters (character art, logos, PSD masters)
  booklet/         — Booklet page PNGs and cover
  twoTriangles.svg — Canonical editable two-triangles diagram
  resultsExplainer.pdf — Master slide deck, source for understand.html

history/           — Archived materials
  docs/            — Archived PDFs and superseded materials
  qtest/           — Legacy Matlab scoring scripts
  typeform/        — Legacy Typeform batch processing + pilot data

scripts/           — Developer utilities (not deployed)
  test-sampler.sh  — Smoke-test /api/sample-questions: N sequential runs, compact summary output
  synperson/       — Synperson panel scripts (complete; first QA pass done Session 11)
    run-test.py    — Take a logged or QA test run for one synperson
    evolve-events.py — Generate next diary events via Claude API
    sync-to-d1.py  — Push local profile + events to D1
    run-panel.py   — Batch operations on all 30 synpersons
    memory.py      — Discounted-sampling memory model (shared module)
    scoring.py     — Scoring algorithm (mirrors test.html logic)

synpersons/        — Synthetic focus group: 30 persona profiles for longitudinal test research
  _rig_schema.yaml   — Field definitions for all rig.yaml files
  _events_schema.md  — Event format, date distribution, and intensity rules
  _research_protocol.md — Run types (logged vs QA), no-rescoring rule, editorial logging
  {id}_{name}/       — One directory per synperson (e.g. C1_david_feld/)
    rig.yaml         — Demographic + relationship data (all 30 complete)
    events.md        — Narrative event diary (all 30 seeded, 15 events each, up to April 2026)
    research_log.md  — Editorial change log (created on first logged run)

devlog/            — Session-by-session development log (eventually published)

THEORY.md          — Canonical theory reference: master framework, archetype profiles, relationships, all 11 sub-models
VOCAB.md           — Controlled vocabulary: precise definitions of all terms of art and key references
AUDIT.md           — Question audit model: structural/system tests + 11 unit tests based on sub-models
SYNPERSON_DESIGN.md — Plan for revising synperson biographies and events based on theory dialogue
visualizations.md  — Three canonical visualization modes (nested, side-by-side, 2×2-mirrored); visual depiction rules TBD
```

## Deployment

Two separate deploy targets — **do not confuse them**:

| Target | URL | Branch | Purpose |
|---|---|---|---|
| Cloudflare Pages | `quadrantology.pages.dev` | `master` | Active development |
| GitHub Pages | `quadrantology.com` | `gh-pages` | Marketing/preview site (V1 free test + V2 sign-up) |

### Cloudflare Pages (active development)
- Deploys automatically on push to `master` — no build step
- Pages Functions in `functions/api/` deploy automatically alongside
- D1 database: `quadrantology` (bound as `DB` in CF Pages → Settings → Functions)
- `quadrantology.com` will point here after DNS cutover

### GitHub Pages (marketing site, `quadrantology.com` via current DNS)
- Serves from the `gh-pages` branch at `/docs`
- This is the **active marketing site** while V2 (CF Pages) is in development
- V1 simple test (no paywall, no logbook), static copy pages, V2 sign-up CTA on home + results
- Shop and How to Play are removed from nav (pages still exist at their URLs)
- `docs/data/v2-cta.html` — shared CTA content fragment, fetched by both `index.html` and `test.html`; edit this file to update sign-up text/link on both pages at once
- Work directly on the `gh-pages` branch via a git worktree; commit and push when done

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
| `GET  /api/questions` | Serve live+calibrating questions from D1 (full pool, admin/fallback) |
| `POST /api/sample-questions` | Serve a balanced sampled subset for a test run (body: `{previous_runs}`) |
| `GET  /api/admin/challenge` | Issue ECDSA auth nonce |
| `POST /api/admin/auth` | Verify ECDSA signature, return HMAC session token |
| `GET  /api/admin/questions` | List all questions (with optional `?id=Q001` for single+state log) |
| `POST /api/admin/questions` | Create or update question |
| `GET  /api/admin/research-data` | Response counts + archetype breakdown (`?question_id=` or `?all=1`) |
| `POST /api/admin/generate-codes` | Batch-generate coupon/org codes |
| `GET  /api/admin/sequences` | Sequence log diagnostics (`?window_days=`, `?recent=`, `?include=`) |
| `POST /api/research/record-response` | Store anonymised per-run response (opted-in users) |
| `POST /api/research/submit-logbook` | Store anonymised full logbook history (bulk opt-in) |

### D1 schema (`worker/schema.sql`)

Tables: `codes`, `questions`, `question_state_log`, `question_sequences`, `research_subjects`, `research_sessions`, `research_responses`, `admin_challenges`, `scoring_models`

**`codes`** (unchanged)

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
| `ADMIN_PUBLIC_KEYS` | Plain | Comma-separated base64url SPKI ECDSA P-256 public keys for admin UI (`/admin/questions`). Generate via the admin page key setup flow. |
| `ADMIN_TOKEN_SECRET` | Secret | HMAC-SHA256 signing secret for admin session tokens. Must be at least 32 bytes of random entropy. Generate with `openssl rand -base64 32`. |

### D1 schema migrations

Schema changes are applied manually. After updating `worker/schema.sql`, run:
```bash
wrangler d1 execute quadrantology --file=worker/schema.sql --remote
```
This is safe to re-run (all statements use `CREATE TABLE IF NOT EXISTS`).

To seed questions into D1 from the static file (first-time setup):
```bash
wrangler d1 execute quadrantology --file=worker/seed-questions.sql --remote
```
After seeding, the admin UI at `/admin/questions` can import/manage questions from D1. The "Import from questions.json" button in the admin UI also handles seeding.

## Data Model

See `DATAMODEL.md` for the full canonical spec. Summary below for quick reference.

### Questions (D1-backed, schema v2)

Questions are now managed in D1 via `/admin/questions` and served via `GET /api/questions`. The static `docs/data/questions.json` is a seed/backup file only.

Each question has: `id` (Q001–Q028+), `status` (`live`/`calibrating`/`archived`), `response_weight` (float, default 1.0), `questions_version` (int), `answer_a`/`answer_b`, `weights_a`/`weights_b` (dimension weight arrays), `notes`, and `state_log` (full status change history).

Status meanings:
- `live` — in the test pool for respondents
- `calibrating` — live AND anonymous responses are recorded in D1 for research
- `archived` — not in pool; preserved for history replay (questions are never deleted)

Calibration threshold (`protocol.json > calibration.min_samples`, default 100): after this many responses, `response_weight` can be manually set via admin UI.

Dimensions (index order): `[exit, voice, virtue, consequentialist, deontological]`

**Pending review:** Q011 answer A and Q023 answer B have all-zero weight vectors — see `TODO.md`.

### Own run records

Two versions coexist in localStorage and exported JSON:

**v1** (legacy): `{ version:1, timestamp, archetype, evBias, scores:[array], answers:[array] }`

**v2** (current): `{ version:2, timestamp, questions_version, run:[{qid,ans}], scores:{exit,voice,virtue,consequentialist,deontological}, position:{ev, ethics:{virtue,consequentialist,deontological}}, archetype, ev_bias, calibrating:[qids], run_token:string|null, note:'' }`

- `position.ev`: continuous E↔V position, -1 (pure Voice) to +1 (pure Exit)
- `position.ethics`: simplex proportions summing to 1.0
- `run`: exact question IDs + answers, enabling future replay and reanalysis
- `calibrating`: array of question IDs that were in `calibrating` status at run time (used by `submit-logbook` to correctly tag `is_calibrating` on response rows)
- `run_token`: 32-char hex token generated at run time if user opted into research; stored in `research_sessions.run_token` for cross-dataset linkage. `null` if user declined. Never the same as the internal `session_id`.
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

## Wrap-Up Procedure

When the user says **"wrap up"**, perform all of the following before committing:

### 1. Update project-level artifacts (in order)

| File | What to update |
|---|---|
| `DATAMODEL.md` | Any new/changed data structures, fields, localStorage keys, or D1 tables |
| `DESIGN.md` | Only if a new design principle was established or an existing one was revised |
| `CLAUDE.md` | Repo structure (new files), API routes table, env vars, this artifact inventory if it changed |
| `STATUS.md` | "What's Working" (move completed items in), roadmap tiers (reorder/restate as needed), Known Issues |
| `TODO.md` | Add any new manual action items (CF dashboard, DNS, Stripe, content review); move completed items to Done |
| `devlog/YYYY-MM-DD-sessionN.md` | New entry covering: what was built, key decisions, files changed |

### 2. Commit all changed files
Stage all modified tracked files plus any new files created during the session. Do not stage `.wrangler/` or other local tooling artifacts. Commit message: one-line summary of session scope.

### 3. Push to origin/master
Cloudflare Pages auto-deploys on push. Changes to the marketing site (`gh-pages`) are made separately via a git worktree — they do not affect master.

### Notes
- `DESIGN.md` changes are rare; don't update it unless a principle actually changed.
- The devlog is the narrative record; STATUS.md is the current-state snapshot. Don't duplicate — STATUS.md states facts, devlog explains decisions.
- If data structures changed, update DATAMODEL.md *first* so the other docs can reference it accurately.

## Architecture Notes

- All pages share `quadrantology.css` and the same nav structure (CSS-only hamburger menu, checkbox trick)
- System font stack, no external JS dependencies
- Nav: The Test | The Theory | Shop | How to Play | Archetypes (dropdown)
- Color scheme: bg `#f4f1eb`, card `#ffffff`, text `#2c2c2c`, accent `#c0713a`, exit `#3a7a8c` (teal), voice `#8c3a3a` (deep red)
- Test flow: name intro → questions → compute results → check localStorage for code → paywall if none → results + journal entry → save to logbook
- Price shown in UI is fetched live from Stripe `/api/price` so it always matches the product
- Feature thresholds (min runs, circle size, etc.) are in `docs/data/protocol.json` — read at runtime, never hardcode
- See `DATAMODEL.md` before adding any feature that touches stored data
