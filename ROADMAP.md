# Quadrantology — Roadmap

_Last updated: 2026-04-22 (Session 13)_

Future plans, ordered by priority tier. Current project state is in `STATUS.md`. Manual ops actions are in `OPS.md`.

---

## Tier 1 — Pre-onboarding (do next)

1. **URL fragment sharing + `r.html`** — "Share my arc" generates a ~220-char URL fragment with name + most recent 3 archetypes + summary scores. `r.html` renders received arcs client-side and has an "Add to Circle" button. Prerequisite for circle.html to be usable by real people. Requires `min_runs_to_share` completed runs. Name set at share time, not persisted.
2. **Mobile-friendly UX** — responsive pass on paywall, logbook, circle pages. (Test question flow is now touch-friendly; remaining pages still need a responsive pass.)
3. **.ics retake schedule** — client-side calendar file generation, ~30-day spacing, anchored to first test date.
4. **Research submission payload preview** — before any research data leaves the browser (per-run opt-in POST or logbook submission), show the user the exact JSON being sent in a scrollable modal. Raw stripped object, not a summary — so they can verify name/notes/code are absent.
5. **Entry points to circle + analysis** — link from results page and logbook to `circle.html`; link from circle to `analysis.html`. Currently these pages are only reachable by direct URL.

---

## Tier 1.5 — Content + Research Expansion

- **Copy and explanatory material** — improve landing page, about/theory, and results-page copy to reinforce the tracker framing. Add FAQ or explainer for first-time users.
- **Question bank expansion** — add questions beyond the initial 28 to the D1 bank (new Q/A pairs, all starting in `calibrating` status to gather data before promoting to `live`).
- **Question bank expansion** — Q029–Q063 stubs already in D1 as `draft`. Edit text via `/admin/questions` and promote to `calibrating` to enter the pool. Target: enough vc/vd/cd questions that no single question is structurally required every run (currently Q006 appears in almost every draw as the only dual-coded ev+vc question).
- **Subscription state design** — `circle.html` and `analysis.html` are supposed to be subscription-gated; `protocol.json` has `requires_subscription: true` but nothing enforces it. Design where subscription state lives (D1 + localStorage?) and add to DATAMODEL.md before building the enforcement.
- **Product portfolio UI** — paywall presents three tiers: single assessment sequence, annual subscription, Coach Mode. Requires subscription state design above + Stripe subscription Price IDs.
- **Offline-verifiable bundle** — signed zip of `docs/` with SHA256 manifest. Users can verify and run locally with `python3 -m http.server`. Stepping stone toward ZK client.

---

## Tier 1.9 — Synperson Research Panel

The synperson system is a 30-person synthetic focus group for longitudinal test research, QA, and eventual public access. All design specs, demographic profiles, event diaries, and scripts are complete. First QA pass done (20% hit rate). Theory fully articulated (Session 12). Synperson revision plan in `research/SYNPERSON_DESIGN.md`.

- [x] **Write 30 `events.md` files** — Done (Session 10).
- [x] **Build `scripts/synperson/` suite** — Done (Session 11).
- [x] **First QA run pass** — Done (Session 11): 6/30 matched (20%). Pipeline functional; hit rate needs improvement.
- [x] **Theory dialogue** — Done (Session 12). Full theoretical grounding of all 6 archetypes, 11 sub-models, relationship types, controlled vocabulary. See `THEORY.md`, `VOCAB.md`, `devlog/2026-04-21-theory-dialogue.md`.
- [ ] **Write 6 archetype behavioral profiles** — One per archetype, ~400-600 words, theory-derived, character-level. Foundation for all biography and events revision. See `research/SYNPERSON_DESIGN.md` Step 1.
- [ ] **Track D — Archetype description alignment** — Rewrite behavioral anchor text using theory-derived profiles. Do before Track B.
- [ ] **Track B — Behavioral anchor field** — Add `behavioral_stance` + theory-derived fields to `_rig_schema.yaml` and all 30 `rig.yaml` files. Update `run-test.py` prompt.
- [ ] **Track A — Memory model tuning** — `intensity_floor` 8→6, `alpha` 0.5→0.2, `max_events` 10→12; remove 4-relationship cap.
- [ ] **Track C — Events response beats** — Audit all 30 `events.md` files for wrong-archetype behavioral responses; add reaction beats.
- [ ] **Apply D1 schema migration** — Add `synpersons`, `synperson_events`, `synperson_runs` tables. See `OPS.md`.
- [ ] **First logged run pass** — After tracks A–D, run all 30 logged; target ≥50% archetype match.
- [ ] **Public synperson page** (`docs/synpersons.html`) — panel overview + per-synperson cards.

**Question audit plan:** `research/AUDIT.md` documents a two-layer audit framework: structural/system tests (pool-level) + 11 unit tests (per-question, one per sub-model). Run after synperson revision to distinguish biography/events problems from question pool problems.

---

## Theory Track — Backlog (unscheduled sessions)

Items ordered by dependency. Items 6 and 9 can run in parallel once item 5 is done; item 10 follows 9; item 2 follows both 3 and 5.

Preparatory sessions (do before items 1–10):

- [ ] **0a. Theory dialogue — ethics dimension definitions** — Dedicated session to map out the full theoretical grounding of the three ethics dimensions before writing behavioral anchor text. Known starting points: Virtue = mimetic ethics, Deontological = behavioral ethics, Consequentialist = goal ethics. Open questions: how does the mimetic/behavioral/goal split interact with the E/V axis? Are there canonical thinkers per cell? What does each archetype's failure mode look like (idol-betrayal vs wrong-method vs missed-target)? How does the codifying/mimetic virtue split show up in test answers?

- [ ] **0b. Theory dialogue — Approach Mode / Retreat Mode** — From the slide deck: "Approach Mode: You are running toward life. Retreat Mode: You are running away from life." Not yet explained. Needs a dedicated session to work out how this maps onto the archetypes and the Death and Taxes 2×2. Is this a per-archetype disposition, a situational state, or something else?

Main sequence:

- [ ] **1. Finish edge table emotion and annotation entries** — Fill the 8 blank cells in the Edge Table in `THEORY.md`: emotion labels for L→H and I→HW (intra-triangle), and energy/emotion labels for all 6 Nemesis/Frustrator pairs. These are the final gaps in the formal graph structure before the topology is complete.

- [ ] **2. Mathematical framework** — Describe the full model as a directed graph with formal transition operators. Language: 6 vertices, two directed 3-cycles, mirror reflection operator, composition operator k∈{−1,0,+1} generating the 3 cross-triangle relation types. Express switching crises as edge traversal with energy weights. Output: a self-contained `MATH.md` (or new section in `THEORY.md`). Foundation for items 3–10.

- [ ] **3. Visualizations as projections** — Derive each of the three visualization modes (nested, side-by-side, 2×2-mirrored) as projections of the mathematical model: which graph properties each mode preserves, which it discards. Append to `research/VISUAL.md` (currently only describes modes descriptively). This makes the visualization choices principled rather than ad hoc.

- [ ] **4. Build clean component visualizations** — Implement the canonical diagram set in SVG (or equivalent): the two-triangle graph with vertices, directed edges, relation type color coding, energy weight encoding for switching crises, and emotion labels. Build all three modes from the same data source. Replace current one-off diagrams in `assets/`. These become the master assets for all downstream presentations.

- [ ] **5. Update all model descriptions with topology/geometry language** — Rewrite the 11 sub-model descriptions in `THEORY.md` (and eventually `understand.html`) to use the new variable language consistently: Temporal Horizon, Scarcity Structure, E/V as the three defining axes; ethics vertex as derived. Introduce any additional dependent variables the sub-models define (energy type, epistemic type, signaling mode, etc.) explicitly as derived from the three primary variables. Creates a uniform "derived from coordinates" structure across all models.

- [ ] **6. Ground test questions in relationship discrimination** — For each question in the bank, identify which of the 5 relationship directions it discriminates (Supplier, Receiver, Evil Twin, Nemesis, Frustrator) in addition to which dimensions it scores. A question that only discriminates intra-triangle is structurally weaker than one that discriminates across Evil Twin or Nemesis pairs. Annotate `research/AUDIT.md` and question notes in D1. Foundation for item 7.

- [ ] **7. Improve sampling model with relationship coverage** — Redesign the sampling algorithm (`/api/sample-questions`) so each run tests the respondent in all 5 relationship directions, not just by dimension weight balance. A run that only varies intra-triangle questions cannot distinguish Nemesis from Frustrator pairs. Requires item 6's annotations as input to the sampler.

- [ ] **8. Rethink synpersona and event history model with transition grammar** — Revise `research/SYNPERSON_DESIGN.md` to incorporate: (a) the formal relationship types as the basis for interpersonal events (events should fire along named relationship edges), (b) the emotion labels from the edge table as the affective grammar of transitions, and (c) the switching crisis model as the basis for major life events that shift a persona's modal expression. Generate a small set of canonical event templates per edge type. This replaces the current ad hoc event design with a theory-derived grammar.

- [ ] **9. Update site theory and archetype pages** — Rewrite `theory.html` and all 6 archetype pages (`hacker.html`, etc.) on both `master` and `gh-pages` to use the current controlled vocabulary (Evil Twin, Nemesis, Frustrator, Supplier, Receiver — no Frenemy, no Evil Triplet, no superior/subordinate). Incorporate clean component visualizations from item 4. Requires items 4 and 5.

- [ ] **10. Build new slide deck** — Produce a new canonical slide deck replacing the superseded `deathAndTaxes.pptx`-era materials. Structure: opening 2×2, formal graph model, 6 archetypes (with behavioral profiles), 5 relationship types, 11 sub-models, switching crises with emotion grammar, test methodology. Uses visualizations from item 4. Final synthesis of all theory track work.

---

## Tier 2 — Enrichment

- **Analytics page** — `logbook.html` serves as a stub for now (log of results, no chart). The full analytics page (trendline chart + commentary, unlocked at `min_runs`, richer at 5 and 10 runs) is deferred until the question bank, sampling logic, and subscription gating are solid. This is a critical launch feature but self-contained — building it well requires a stable data foundation first.
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

- **Multilingual / i18n** — Full internationalisation of the product: UI copy, test question text translated and culturally adapted, results and archetype descriptions localised, scoring model validated against non-Anglophone organisational cultures. Requires a translation layer for all static copy, D1 question versioning by locale, and careful consideration of whether the six archetypes map cleanly outside Anglo-American institutional contexts. Synperson profiles will be evolved to take tests and generate events natively in their first language when this ships (e.g. Tomas Osei in Twi/English, Fatima Hasan in Urdu, Carlos Rivera in Spanish). Do not start until the English product is mature and there is demonstrated demand from a specific second-language market. The synperson panel provides a built-in cross-cultural test harness for localisation validation.

- **Verifiable local client for privacy-sovereign test-taking.** Distribute the test as a content-addressed, signed static bundle (IPFS CID or signed tarball with published SHA256) that users can verify before running. The test runs entirely from the local bundle; research submission and logbook export are explicit user actions with no ambient server access. Research data would use a ZK-friendly scheme: the client generates a cryptographic commitment to its answers, computes the archetype locally, and selectively opens only the parts of the commitment it chooses to share — proving correct computation without revealing anything withheld. Requires a ZK-executable scoring function (RISC Zero / zkWASM) and a commitment scheme for the Q/A vector. The offline-verifiable bundle (Tier 1.5) is the near-term stepping stone.
