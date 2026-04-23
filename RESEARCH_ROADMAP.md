# Quadrantology — Research Roadmap

_Last updated: 2026-04-22 (Session 14)_

Research track roadmap: synperson panel and theory formalization. Development track is in `DEV_ROADMAP.md`. Research methodology is in `research/RESEARCH_DESIGN.md`.

Items marked **[V2 gate]** are required for the V2 public release. See `STATUS.md` for the full gate list and status. Synpersons are a V3 feature — the panel work below is post-V2.

---

## Theory Baseline (prerequisite for V2, not a feature)

The question audit cannot produce meaningful results until the theory it audits against is settled. Three theory track items must be complete before the audit can run:

- **0a — Ethics dimension definitions**: without precise, dialogue-confirmed definitions of virtue/consequentialist/deontological, the per-question unit tests (AUDIT.md Layer 2) have no stable rubric to check against.
- **1 — Finish edge table**: the structural pool tests (S4 discriminability, S7 co-occurrence) require correct relationship type names and energy weights throughout.
- **5 — Update sub-model descriptions with consistent variable language**: all 11 Layer 2 unit test rubrics in AUDIT.md are keyed to sub-model quadrant content; the sub-models must be in their final form before the rubrics are applied.

These three items produce the audit-ready theory baseline. All other theory track items (0b, 0c, 0d, 2, 3, 4, 6, 7, 8, 9, 10) are post-V2.

---

## [V2 gate] — 100 Audited Questions

Before V2 ships, the question bank must reach 100 questions that have been audited against the current model. "Audited" means each question has been reviewed against the theoretical definitions in `THEORY.md` using the framework in `research/AUDIT.md`: does it cleanly discriminate the dimension(s) it encodes, with no implicit bias that contradicts current theory? Questions currently in `draft` status (Q029–Q063) need text written and then audited before promotion to `calibrating` or `live`.

The audit framework (`research/AUDIT.md`) must be run at the pool level (structural tests S1–S7) as well as per-question (unit tests U1–U11) before this gate is cleared.

---

## Post-V2 — Synperson Panel

**Scope: V3.** Do not start until V2 ships. The synperson system is a 30-person synthetic focus group for longitudinal test research, QA, and eventual public access. All design specs, demographic profiles, event diaries, and scripts are complete. First QA pass done (20% hit rate). Theory fully articulated (Session 12). Synperson revision plan in `research/SYNPERSON_DESIGN.md`.

**Completed:**
- [x] Write 30 `events.md` files — Done (Session 10)
- [x] Build `scripts/synperson/` suite — Done (Session 11)
- [x] First QA run pass — Done (Session 11): 6/30 matched (20%). Pipeline functional; hit rate needs improvement.
- [x] Theory dialogue — Done (Session 12). Full theoretical grounding of all 6 archetypes, 11 sub-models, relationship types, controlled vocabulary. See `THEORY.md`, `VOCAB.md`, `devlog/2026-04-21-theory-dialogue.md`.

**Pending (run in order; tracks A–D can proceed in parallel after behavioral profiles):**
- [ ] **Write 6 archetype behavioral profiles** — One per archetype, ~400-600 words, theory-derived, character-level. Foundation for all biography and events revision. See `research/SYNPERSON_DESIGN.md` Step 1.
- [ ] **Track D — Archetype description alignment** — Rewrite behavioral anchor text using theory-derived profiles. Do before Track B.
- [ ] **Track B — Behavioral anchor field** — Add `behavioral_stance` + theory-derived fields to `_rig_schema.yaml` and all 30 `rig.yaml` files. Update `run-test.py` prompt.
- [ ] **Track A — Memory model tuning** — `intensity_floor` 8→6, `alpha` 0.5→0.2, `max_events` 10→12; remove 4-relationship cap.
- [ ] **Track C — Events response beats** — Audit all 30 `events.md` files for wrong-archetype behavioral responses; add reaction beats.
- [ ] **Apply D1 schema migration** — Add `synpersons`, `synperson_events`, `synperson_runs` tables. See `OPS.md`.
- [ ] **First logged run pass** — After tracks A–D, run all 30 logged; target ≥50% archetype match.
- [ ] **Public synperson page** (`docs/synpersons.html`) — panel overview + per-synperson cards.

**Context implications for synpersons:** synpersons already have implicit contexts (workplace, family) in their `rig.yaml` and `events.md`. When the context-aware run model ships, `run-test.py` should declare a context before each run — using the synperson's primary institutional setting as the default. The `relationships` field in the run context should be populated from the synperson's declared relationships in `rig.yaml`. This makes synperson QA runs context-aware from the start, producing richer research data and testing the inheritance flow.

**Research data note:** opted-in research submissions should never include relationship data (nicknames, guessed archetypes of real people). Context `label` and `id` are also excluded. The only context-derived signal that may appear in research submissions is a de-identified context type (e.g., a user-selected category like "work" / "family" / "other"), if the user explicitly opts in to that level of disclosure.

**Question audit:** `research/AUDIT.md` documents the two-layer audit framework (structural/system tests + 11 unit tests per sub-model). Run this after synperson revision to distinguish biography/events problems from question pool problems.

---

## Long-term — Theory Formalization

Items ordered by dependency. Items 6 and 9 can run in parallel once item 5 is done; item 10 follows 9; item 2 follows both 3 and 5.

**Preparatory sessions (do before items 1–10):**

- [ ] **0a. Ethics dimension definitions** `[pre-audit — V2 blocker]` — Dedicated dialogue session to map out the full theoretical grounding of the three ethics dimensions before writing behavioral anchor text. Known starting points: Virtue = mimetic ethics, Deontological = behavioral ethics, Consequentialist = goal ethics. Open questions: how does the mimetic/behavioral/goal split interact with the E/V axis? What does each archetype's failure mode look like (idol-betrayal vs wrong-method vs missed-target)? How does the codifying/mimetic virtue split show up in test answers?

- [ ] **0d. Confidence scoring methodology** `[post-V2]` — Work out how `archetype_distribution` is computed from dimension scores. The assigned archetype is the argmax, but the full distribution needs a principled derivation: softmax over raw scores? Normalized margin? Should confidence also reflect question sample diversity (a run that only tested E/V questions is less confident about ethics vertex than one that covered all dimensions)? Connects to the context-aware run model: multi-context data will eventually let us validate confidence scoring empirically.

- [ ] **0c. Stress and ease response vibes** `[post-V2]` — For each of the 6 Supplier/Receiver pairs, work out the specific mood or vibe of the stress response (supplier impersonating receiver) and ease response (receiver impersonating supplier). The concept and column structure are already in THEORY.md; only the cell content is missing. Starting prompt: what does a Hacker look like when stressed into Contrarian mode? How does that differ from a Legalist sliding back into Contrarian ease? What's the analogous pattern on the Voice side?

- [ ] **0b. Approach Mode / Retreat Mode** `[post-V2]` — From the slide deck: "Approach Mode: You are running toward life. Retreat Mode: You are running away from life." Not yet explained. Needs a dedicated session to work out how this maps onto the archetypes and the Death and Taxes 2×2. Is this a per-archetype disposition, a situational state, or something else?

**Main sequence:**

- [ ] **1. Finish edge table** `[pre-audit — V2 blocker]` — Fill the 8 blank cells in the Edge Table in `THEORY.md`: emotion labels for L→H and I→HW (intra-triangle), and energy/emotion labels for all 6 Nemesis/Frustrator pairs. Final gaps in the formal graph structure.

- [ ] **2. Mathematical framework** `[post-V2]` — Describe the full model as a directed graph with formal transition operators: 6 vertices, two directed 3-cycles, mirror reflection operator, composition operator k∈{−1,0,+1} generating the 3 cross-triangle relation types. Express switching crises as edge traversal with energy weights. Output: `MATH.md` or new section in `THEORY.md`. Foundation for items 3–10.

- [ ] **3. Visualizations as projections** `[post-V2]` — Derive each of the three visualization modes (nested, side-by-side, 2×2-mirrored) as formal projections of the mathematical model: which graph properties each mode preserves, which it discards. Append to `research/VISUAL.md`. Makes visualization choices principled rather than ad hoc.

- [ ] **4. Build canonical SVG diagram set** `[post-V2]` — Implement all diagrams: two-triangle graph with vertices, directed edges, relation type color coding, energy weight encoding for switching crises, emotion labels. Build all three modes from the same data source. Replace current one-off diagrams in `assets/`.

- [ ] **5. Rewrite sub-models with consistent variable language** `[pre-audit — V2 blocker]` — Rewrite the 11 sub-model descriptions in `THEORY.md` (and eventually `understand.html`) using Temporal Horizon, Scarcity Structure, E/V as the three primary axes with all other variables explicitly derived from them.

- [ ] **6. Ground questions in relationship discrimination** `[post-V2]` — For each question, identify which of the 5 relationship directions it discriminates (Supplier, Receiver, Evil Twin, Nemesis, Frustrator). Annotate `research/AUDIT.md` and question notes in D1. Foundation for item 7.

- [ ] **7. Improve sampler with relationship coverage** `[post-V2]` — Redesign `/api/sample-questions` so each run tests the respondent across all 5 relationship directions, not just by dimension weight balance. Requires item 6's annotations.

- [ ] **8. Rethink synperson event grammar** `[post-V2]` — Revise `research/SYNPERSON_DESIGN.md` to use formal relationship types as the basis for interpersonal events, edge-table emotion labels as the affective grammar of transitions, and switching crisis model as the basis for major life events. Generate canonical event templates per edge type.

- [ ] **9. Update site theory and archetype pages** `[post-V2]` — Rewrite `theory.html` and all 6 archetype pages on both `master` and `gh-pages` to use current controlled vocabulary (Evil Twin, Nemesis, Frustrator, Supplier, Receiver). Incorporate canonical SVG diagrams from item 4. Requires items 4 and 5.

- [ ] **10. Build new slide deck** `[post-V2]` — Produce the canonical slide deck replacing superseded `deathAndTaxes.pptx`-era materials. Structure: opening 2×2, formal graph model, 6 archetypes with behavioral profiles, 5 relationship types, 11 sub-models, switching crises with emotion grammar, test methodology. Final synthesis of all theory track work.
