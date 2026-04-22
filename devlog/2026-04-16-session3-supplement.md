---
name: Session 3 — Questions research system + admin UI
description: What was built in session 3 around the questions database, research data collection, and admin interface
type: project
---

Built in session 3 (2026-04-16):

## Research rigging
- New question status: `calibrating` (= live + responses recorded anonymously)
- Status rename: `active` → `live`, `retired` → `archived`
- `POST /api/research/record-response` — batch endpoint, D1 batch inserts, UNIQUE(session_id, question_id) guard
- test.html fetches from `/api/questions` (D1-backed) with fallback to static `data/questions.json`
- test.html fires research batch in `computeResults()` (fire-and-forget, before paywall)
- Calibration disclosure note added to test intro when calibrating questions are present

## Admin UI
- `docs/admin/questions.html` — private-key-authenticated admin interface at `/admin/questions`
- Auth: ECDSA P-256 challenge-response (IndexedDB non-extractable key, CF env `ADMIN_PUBLIC_KEYS`)
- Token: HMAC-SHA256 1-hour session, verified by middleware
- Features: question list with status badges, editor (answers A/B, 5 dimension weights each, response_weight, status toggle, notes), research data panel (A/B counts + bar chart), state log, Import from questions.json button

## New CF Functions
- `GET /api/questions` — public, returns live+calibrating questions
- `POST /api/research/record-response` — public, records calibrating responses
- `GET /api/admin/challenge` — nonce generation
- `POST /api/admin/auth` — ECDSA sig verification, returns HMAC token
- `functions/api/admin/_middleware.js` — token middleware for all /api/admin/* except challenge+auth
- `GET/POST /api/admin/questions` — question CRUD with state logging
- `GET /api/admin/research-data` — A/B response stats (per-question or all calibrating)

## New D1 tables
- `questions` — D1-backed question bank
- `question_state_log` — full audit log of status changes
- `research_responses` — anonymized calibration data
- `admin_challenges` — one-time nonces for auth

## Setup (new deployments)
1. Apply schema: `wrangler d1 execute quadrantology --file=worker/schema.sql --remote`
2. Seed questions: `wrangler d1 execute quadrantology --file=worker/seed-questions.sql --remote`
3. Add CF env vars: `ADMIN_PUBLIC_KEYS` (from admin page key gen), `ADMIN_TOKEN_SECRET` (32+ byte random)
4. Or: use "Import from questions.json" button in admin UI after auth

**Why:** Questions need to be editable without redeployment; calibrating status enables systematic weight calibration via real response data.
