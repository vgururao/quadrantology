# Question Audit Model

*Plan for auditing the question inventory against the theoretical framework. Two layers: structural/system tests based on the triangles and 2x2 geometry, and unit tests based on the 11 sub-models. Not yet implemented.*

---

## Background

The current question data model encodes for each question: `[exit, voice, virtue, consequentialist, deontological]` weight vectors for answers A and B. The audit model works with these weights plus the richer theoretical framework documented in `THEORY.md` and `VOCAB.md`.

The goal is threefold:
1. Detect questions that are theoretically inconsistent or ambiguous
2. Identify gaps in pool coverage (archetypes, models, quadrants underrepresented)
3. Generate recommendations for new questions and revisions

---

## Layer 1: Structural / System Tests

*Properties of the question pool as a whole. Some derivable programmatically from weight vectors.*

| # | Test | What it checks |
|---|---|---|
| S1 | **E/V balance** | Pool-level: is there systematic bias toward Exit or Voice framing? |
| S2 | **Ethics dimension coverage** | Are all three ethics dimensions (virtue, consequentialist, deontological) adequately represented, both E-flavored and V-flavored? |
| S3 | **Implicit E/V bias in ethics-only questions** | Questions with zero E/V weight: do they have a named E/V home? Is that home balanced across the pool? See DESIGN.md for the mirror question principle. |
| S4 | **Archetype discriminability** | For each archetype pair (especially Nemesis pairs and Frenemies), is there sufficient discriminating power? Nemesis pairs should be most strongly separated. |
| S5 | **Philosopher/Doer discriminability** | Can the pool distinguish Legalist/Holy Warrior (vita contemplativa) from the four doer archetypes? |
| S6 | **Cycle coverage** | Each of the six archetype positions should have adequate coverage. No stage of either cycle (Exit: H→C→L, Voice: I→HW→O) should be systematically underserved. |
| S7 | **Co-occurrence balance** | Extend existing D1 sequence tracking to check against theoretical predictions. E.g. H/I questions should co-occur more naturally than H/L questions given their shared Life/Play quadrant. |

**Archetype pairs by relationship type** (for S4):

| Relationship | Pairs | Expected discriminability |
|---|---|---|
| Nemesis | H↔HW, C↔I, L↔O | Highest — these cannot both win |
| Frenemy | H↔I, C↔O, L↔HW | Medium — same vertex, opposite triangle |
| Evil Triplet | H↔C, C↔L, L↔H, I↔HW, HW↔O, O↔I | Lower — same triangle, complementary |

---

## Layer 2: Unit Tests (11 Sub-Model Rubrics)

*Per-question annotation against each sub-model. A well-formed question should create a clean diagonal tension — answers A and B should sit in adjacent or opposing quadrants, not the same one.*

For each model, three checks per question:
- **Classifiable?** Can each answer be placed in a quadrant of this model?
- **Diagonal?** Do A and B create a meaningful tension (not same quadrant, preferably opposing)?
- **Consistent?** Does the quadrant placement match what the existing weight vector encodes?

Where placement and weight vector disagree, flag for review.

### The 11 Sub-Model Rubrics

**Model 1: Cognitive Orientation**

| | Taxes | Play |
|---|---|---|
| Life | Profanity — seek truth through absurdity | Laughter of the Gods — generativity |
| Death | Acting Dead — incomprehension | Sacredness — seek happiness through values |

**Model 2: Energy Dynamics**

| | Taxes | Play |
|---|---|---|
| Life | Using the battery — neighborhood entropy up | Clean energy abundance — neighborhood entropy down |
| Death | Conserving battery power — entropy up slowly | Charging the battery — entropy up |

**Model 3: Creative Instinct**

| | Taxes | Play |
|---|---|---|
| Life | Customer Driven — "solve a problem" products | Dent in the Universe — freedom products |
| Death | Insurance — acting-dead products | Product Driven — authoritah products |

**Model 4: Life Scripts**

| | Taxes | Play |
|---|---|---|
| Life | Make Money — lifehacker scripts | Make Beauty — imaginative scripts |
| Death | Do Nothing — default scripts | Make Sense — hipster scripts |

**Model 5: Game Orientation**

| | Taxes | Play |
|---|---|---|
| Life | Finite Game — play for fuck-you money (structural finitude) | Infinite Game — play to keep playing |
| Death | Game Exit — one finite game left: theorizing | Finite Game — play for utopia (temporal finitude) |

**Model 6: Signaling Instincts**

| | Taxes | Play |
|---|---|---|
| Life | Incentive-Based — "everything has a price" | No Signaling Necessary — freedom is a signal by itself |
| Death | Mortality-Based — quality of life-and-legacy | Hypocritical — guardian performance over commerce reality |

**Model 7: Being and Doing**

| | Taxes | Play |
|---|---|---|
| Life | Make things work — NTs, SPs | Make things live — integrated |
| Death | Preserve things — Miss Havisham | Make things significant — SJs, NFs |

**Model 8: Structure of Habits**

| | Taxes | Play |
|---|---|---|
| Life | Hacking — smooth unskills, conscious incompetence | Mindful — natural mindful flow |
| Death | Procedural — algorithmic, unconscious incompetence | Ritual — striated skills, unconscious competence |

**Model 9: Structure of Goals**

| | Taxes | Play |
|---|---|---|
| Life | Destructive — analysis | Creative-Destructive — transformational |
| Death | Preservative — stability | Creative — synthesis |

**Model 10: Interpersonal Mode**

| | Taxes | Play |
|---|---|---|
| Life | Pragmatic — trader ethics, "win-win or no deal" | Promethean — pluralistic ethics, "find a creative option" |
| Death | Pastoralist — preservationist ethics, "with us or against us" | Purist — guardian ethics, "honor in-group, deceit out-group" |

**Model 11: Views and Holds**

| | Taxes | Play |
|---|---|---|
| Life | Fox — weak views strongly held | Very Zen — "you are probably lying" |
| Death | Cactus or Weasel — strong-strong or weak-weak | Hedgehog — strong views weakly held |

---

## Implementation Plan

Three components (not yet built):

### 1. `scripts/audit/rubrics.json`
Machine-readable version of the 11 models. Each model is a 2x2 with quadrant labels, archetype occupants, and key descriptors. Lookup table for unit tests.

### 2. `scripts/audit/structural_tests.py`
Runs Layer 1 tests against live questions from D1 or `docs/data/questions.json`. Outputs a structured report: pass/fail per test with specifics. Should be runnable standalone with no server dependencies.

### 3. `scripts/audit/unit_test_template.md`
Per-question worksheet for Layer 2 audit. Human-filled initially; Claude-assisted at scale. For each question: which models it maps cleanly to, which are ambiguous, which it fails. Output becomes an annotation layer on top of the question bank.

---

## Audit Output Format

A full audit run produces:

1. **Structural test report** — pool-level pass/fail with specifics
2. **Per-question annotation** — model coverage map for each question
3. **Gap analysis** — which models/quadrants are underrepresented
4. **Flagged questions** — fail structural tests, or inconsistent between weight vector and theoretical placement
5. **Recommendations** — new questions needed, existing questions to revise

---

## Dependencies

- `THEORY.md` — theoretical grounding for all 11 models and archetype profiles
- `VOCAB.md` — controlled vocabulary, precise definitions
- `RESEARCH_DESIGN.md` — question design principles (implicit E/V bias, mirror question strategy)
- `docs/data/questions.json` — current question bank (seed/backup)
- D1 `questions` table — canonical live question state
