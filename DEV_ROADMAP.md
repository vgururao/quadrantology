# Quadrantology — Development Roadmap

_Last updated: 2026-04-22 (Session 14)_

Product feature roadmap, ordered by priority tier. Research track is in `RESEARCH_ROADMAP.md`. Current project state is in `STATUS.md`. Manual ops actions are in `OPS.md`.

Items marked **[V2 gate]** are required for the V2 public release. See `STATUS.md` for the full gate list and status.

---

## Tier 1 — Pre-onboarding (do next)

1. **[V2 gate] URL fragment sharing + `r.html`** — "Share my arc" generates a ~220-char URL fragment with name + most recent 3 archetypes + summary scores. `r.html` renders received arcs client-side and has an "Add to Circle" button. Prerequisite for circle.html to be usable by real people. Requires `min_runs_to_share` completed runs. Name set at share time, not persisted.
2. **Mobile-friendly UX** — responsive pass on paywall, logbook, circle pages. (Test question flow is now touch-friendly; remaining pages still need a responsive pass.)
3. **.ics retake schedule** — client-side calendar file generation, ~30-day spacing, anchored to first test date.
4. **Research submission payload preview** — before any research data leaves the browser (per-run opt-in POST or logbook submission), show the user the exact JSON being sent in a scrollable modal. Raw stripped object, not a summary — so they can verify name/notes/code are absent.
5. **Entry points to circle + analysis** — link from results page and logbook to `circle.html`; link from circle to `analysis.html`. Currently these pages are only reachable by direct URL.

---

## Tier 1.5 — Content + Infrastructure

- **[V2 gate] Subscription state design and enforcement** — `circle.html` and `analysis.html` are supposed to be subscription-gated; `protocol.json` has `requires_subscription: true` but nothing enforces it. Design where subscription state lives (D1 + localStorage?) and add to DATAMODEL.md before building the enforcement.
- **[V2 gate] Product portfolio UI** — paywall presents three tiers: single assessment sequence, annual subscription, Coach Mode. Requires subscription state design above + Stripe subscription Price IDs.
- **[V2 gate] Multi-track context capability** — Context declaration step in test intro, relationship set entry, editable inheritance from prior contexts, format_version 2 run records, multi-track logbook display with separate arc per context. Data model spec complete in DATAMODEL.md. Implementation sequence: (1) context declaration UI, (2) inheritance/edit flow, (3) run record extension, (4) multi-track logbook display, (5) cross-context analytics.
- **Copy and explanatory material** — improve landing page, about/theory, and results-page copy to reinforce the tracker framing. Add FAQ or explainer for first-time users.
- **Question bank expansion** — Q029–Q063 stubs already in D1 as `draft`. Edit text via `/admin/questions` and promote to `calibrating` to enter the pool. Target: enough vc/vd/cd questions that no single question is structurally required every run (currently Q006 appears in almost every draw as the only dual-coded ev+vc question).
- **Subscription state design** — `circle.html` and `analysis.html` are supposed to be subscription-gated; `protocol.json` has `requires_subscription: true` but nothing enforces it. Design where subscription state lives (D1 + localStorage?) and add to DATAMODEL.md before building the enforcement.
- **Product portfolio UI** — paywall presents three tiers: single assessment sequence, annual subscription, Coach Mode. Requires subscription state design above + Stripe subscription Price IDs.
- **Offline-verifiable bundle** — signed zip of `docs/` with SHA256 manifest. Users can verify and run locally with `python3 -m http.server`. Stepping stone toward ZK client.

---

## Tier 2 — Enrichment

- **[V2 gate] Public theory model bundle** — Publish `docs/data/quadrantology-model-v1.json` (CC BY 4.0) and embed it in every logbook export alongside `scoring_models`. The bundle must contain: full archetype definitions, dimension meanings, relationship types, scoring algorithm — sufficient for a user to run their own analysis on their logbook data without the app. See `OPS.md` for the model snapshot procedure.
- **Analytics page** — `logbook.html` serves as a stub for now (log of results, no chart). The full analytics page (trendline chart + commentary, unlocked at `min_runs`, richer at 5 and 10 runs) is deferred until the question bank, sampling logic, and subscription gating are solid.
- **Bulk org admin UI** — admin page for generating code batches, viewing usage, exporting lists. Builds on existing `/api/admin/generate-codes`.

---

## Tier 3 — Coach Mode

- **Coach Mode subscription** — import full client logbooks via encrypted file transfer (asymmetric key pair, client encrypts, coach decrypts in-browser; private key never leaves coach's device). Stored in `quadrantology_coach_clients`. Client cap TBD in `protocol.json`.
- **Deep relationship analysis** — `analysis.html` richer mode when coach client logbooks present. Full dimension scores + arc history for all participants, not just summary arcs.

---

## Tier 4 — Advanced

- **LLM results interpretation** — in-page chat (results + theory context → Claude API via Worker proxy) and/or MCP server exposing results for Claude Desktop.
- **x402 / crypto payments** — CF Workers x402 facilitator + "Pay with ETH" on paywall. Base/USDC.
- **Google Drive sync** — OAuth, save/sync logbook JSON to personal Drive.

---

## Someday / Maybe

- **Multilingual / i18n** — Full internationalisation of the product: UI copy, test question text translated and culturally adapted, results and archetype descriptions localised, scoring model validated against non-Anglophone organisational cultures. Requires a translation layer for all static copy, D1 question versioning by locale, and careful consideration of whether the six archetypes map cleanly outside Anglo-American institutional contexts. Synperson profiles will be evolved to take tests and generate events natively in their first language when this ships. Do not start until the English product is mature and there is demonstrated demand from a specific second-language market.

- **Verifiable local client for privacy-sovereign test-taking.** Distribute the test as a content-addressed, signed static bundle (IPFS CID or signed tarball with published SHA256) that users can verify before running. Research data would use a ZK-friendly scheme: the client generates a cryptographic commitment to its answers, computes the archetype locally, and selectively opens only the parts of the commitment it chooses to share. Requires a ZK-executable scoring function (RISC Zero / zkWASM) and a commitment scheme for the Q/A vector. The offline-verifiable bundle (Tier 1.5) is the near-term stepping stone.
