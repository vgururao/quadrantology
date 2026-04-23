# Quadrantology — Research Roadmap

_Last updated: 2026-04-22 (Session 14)_

Research track roadmap: synperson panel and theory formalization. Development track is in `DEV_ROADMAP.md`. Research methodology is in `research/RESEARCH_DESIGN.md`.

---

## Immediate — Synperson Panel (Tier 1.9)

The synperson system is a 30-person synthetic focus group for longitudinal test research, QA, and eventual public access. All design specs, demographic profiles, event diaries, and scripts are complete. First QA pass done (20% hit rate). Theory fully articulated (Session 12). Synperson revision plan in `research/SYNPERSON_DESIGN.md`.

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

**Question audit:** `research/AUDIT.md` documents the two-layer audit framework (structural/system tests + 11 unit tests per sub-model). Run this after synperson revision to distinguish biography/events problems from question pool problems.

---

## Long-term — Theory Formalization

Items ordered by dependency. Items 6 and 9 can run in parallel once item 5 is done; item 10 follows 9; item 2 follows both 3 and 5.

**Preparatory sessions (do before items 1–10):**

- [ ] **0a. Ethics dimension definitions** — Dedicated dialogue session to map out the full theoretical grounding of the three ethics dimensions before writing behavioral anchor text. Known starting points: Virtue = mimetic ethics, Deontological = behavioral ethics, Consequentialist = goal ethics. Open questions: how does the mimetic/behavioral/goal split interact with the E/V axis? What does each archetype's failure mode look like (idol-betrayal vs wrong-method vs missed-target)? How does the codifying/mimetic virtue split show up in test answers?

- [ ] **0c. Stress and ease response vibes** — For each of the 6 Supplier/Receiver pairs, work out the specific mood or vibe of the stress response (supplier impersonating receiver) and ease response (receiver impersonating supplier). The concept and column structure are already in THEORY.md; only the cell content is missing. Starting prompt: what does a Hacker look like when stressed into Contrarian mode? How does that differ from a Legalist sliding back into Contrarian ease? What's the analogous pattern on the Voice side?

- [ ] **0b. Approach Mode / Retreat Mode** — From the slide deck: "Approach Mode: You are running toward life. Retreat Mode: You are running away from life." Not yet explained. Needs a dedicated session to work out how this maps onto the archetypes and the Death and Taxes 2×2. Is this a per-archetype disposition, a situational state, or something else?

**Main sequence:**

- [ ] **1. Finish edge table** — Fill the 8 blank cells in the Edge Table in `THEORY.md`: emotion labels for L→H and I→HW (intra-triangle), and energy/emotion labels for all 6 Nemesis/Frustrator pairs. Final gaps in the formal graph structure.

- [ ] **2. Mathematical framework** — Describe the full model as a directed graph with formal transition operators: 6 vertices, two directed 3-cycles, mirror reflection operator, composition operator k∈{−1,0,+1} generating the 3 cross-triangle relation types. Express switching crises as edge traversal with energy weights. Output: `MATH.md` or new section in `THEORY.md`. Foundation for items 3–10.

- [ ] **3. Visualizations as projections** — Derive each of the three visualization modes (nested, side-by-side, 2×2-mirrored) as formal projections of the mathematical model: which graph properties each mode preserves, which it discards. Append to `research/VISUAL.md`. Makes visualization choices principled rather than ad hoc.

- [ ] **4. Build canonical SVG diagram set** — Implement all diagrams: two-triangle graph with vertices, directed edges, relation type color coding, energy weight encoding for switching crises, emotion labels. Build all three modes from the same data source. Replace current one-off diagrams in `assets/`.

- [ ] **5. Rewrite sub-models with consistent variable language** — Rewrite the 11 sub-model descriptions in `THEORY.md` (and eventually `understand.html`) using Temporal Horizon, Scarcity Structure, E/V as the three primary axes with all other variables explicitly derived from them.

- [ ] **6. Ground questions in relationship discrimination** — For each question, identify which of the 5 relationship directions it discriminates (Supplier, Receiver, Evil Twin, Nemesis, Frustrator). Annotate `research/AUDIT.md` and question notes in D1. Foundation for item 7.

- [ ] **7. Improve sampler with relationship coverage** — Redesign `/api/sample-questions` so each run tests the respondent across all 5 relationship directions, not just by dimension weight balance. Requires item 6's annotations.

- [ ] **8. Rethink synperson event grammar** — Revise `research/SYNPERSON_DESIGN.md` to use formal relationship types as the basis for interpersonal events, edge-table emotion labels as the affective grammar of transitions, and switching crisis model as the basis for major life events. Generate canonical event templates per edge type.

- [ ] **9. Update site theory and archetype pages** — Rewrite `theory.html` and all 6 archetype pages on both `master` and `gh-pages` to use current controlled vocabulary (Evil Twin, Nemesis, Frustrator, Supplier, Receiver). Incorporate canonical SVG diagrams from item 4. Requires items 4 and 5.

- [ ] **10. Build new slide deck** — Produce the canonical slide deck replacing superseded `deathAndTaxes.pptx`-era materials. Structure: opening 2×2, formal graph model, 6 archetypes with behavioral profiles, 5 relationship types, 11 sub-models, switching crises with emotion grammar, test methodology. Final synthesis of all theory track work.
