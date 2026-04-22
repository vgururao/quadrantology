# Synperson Design Plan

*Plan for revising synperson biographies and life-event generators based on the theory dialogue (2026-04-21). See THEORY.md and VOCAB.md for the theoretical foundation.*

---

## The Problem

The current synperson panel (30 personas) achieved 20% archetype hit rate on first QA pass. The root cause is a triangle of incoherence:

- **Theory** is now more precisely articulated (post theory dialogue)
- **Biographies (rig.yaml)** encode archetype assignment but not the rich motivational/behavioral logic behind it
- **Events (events.md)** were written from narrative descriptions that don't reliably encode the correct behavioral responses
- **Test run prompts** don't give the LLM enough character-level context to respond authentically as the archetype

The fix requires work at all four levels — theory → archetype profiles → biography → events → test run context — in that order.

---

## Step 1: Archetype Behavioral Profiles

*One document per archetype, not per synperson. The theoretical anchor from which all synperson content is derived.*

For each of the 6 archetypes, write a behavioral profile (~400-600 words) that distills the theory into character-level description. This is the master reference for biography writing and event auditing.

Each profile covers:

**Motivational core** — What the archetype is seeking and what they're sensitive to (the two axes). Stated as felt experience, not theoretical label. E.g. not "Life/Taxes orientation" but "feels most alive when working around obstacles; acutely aware of costs and friction."

**Action signature** — How they characteristically move through the world. What triggers action, what constitutes a win, what counts as stuck. Doer or philosopher? Can they access flow? What does it look like?

**Emotional register** — Comic or tragic? What are the characteristic emotions at each stage of their cycle? (Reference Model 6: Emotions from the FoTW diagram — cynicism, resignation, restlessness, fear, doubt, curiosity, guilt/shame, etc.)

**Failure mode** — What does acting dead look like for this archetype specifically? What's the degenerate version?

**Interpersonal signature** (from Model 10) — How they engage with others. Promethean/Pragmatic/Purist/Pastoralist in plain language.

**Epistemic signature** (from Model 11) — Fox, Hedgehog, Very Zen, or Cactus/Weasel tendency. How they hold and express views.

**Relationship notes** — How they typically relate to their Nemesis (fundamental incompatibility), Frenemy (same values, different methods), and Evil Triplets (dependent but friction-filled). In plain language.

**What they sound like** — Characteristic speech patterns, what they notice and comment on, what they ignore. Voice/tone markers.

*Output: `docs/data/archetype_profiles/hacker.md`, `contrarian.md`, etc. (6 files)*

---

## Step 2: Biography Revision (rig.yaml)

*Revise all 30 rig.yaml files to add theory-derived fields.*

### New fields to add to rig.yaml

```yaml
# Theory-derived fields (add to existing rig.yaml schema)

archetype_logic:
  quadrant: "Life/Play"           # Death and Taxes position
  seeking: "vitality and flow"    # what draws them forward
  sensitive_to: "game aesthetics" # what they're oriented toward
  doer_or_philosopher: "doer"
  comic_or_tragic: "comic"        # Exit = comic, Voice = tragic
  cycle_stage: "early"            # early/mid/late in their cycle
  flow_access: true               # can they access unconscious flow?

behavioral_stance: |
  [300-400 word character-level description derived from archetype profile,
  instantiated for this specific person's demographic/life context.
  Written as description of a person, not a taxonomy entry.
  This is the primary context submitted during test runs.]

epistemic_type: "fox"             # fox / hedgehog / cactus / weasel / very_zen
signaling_mode: "no_signaling"    # no_signaling / incentive / mortality / hypocritical
interpersonal_mode: "promethean"  # promethean / pragmatic / purist / pastoralist

relationships_theory:
  nemesis_archetype: "holy_warrior"
  frenemy_archetype: "investigator"
  evil_triplet_archetype: "contrarian"
  # Note which synpersons in panel occupy these roles, if any
```

### Also update `_rig_schema.yaml`
Document all new fields with descriptions and valid values.

---

## Step 3: Events Revision (events.md)

*Audit and rewrite events to encode correct behavioral responses.*

### What good events look like

Each event should:
1. **Show the archetype's characteristic action** — not just what happened, but how they moved through it (smooth/Nakatomi for Hacker, aligned with institutional logic for Investigator, fighting constraint for Contrarian, etc.)
2. **Show the correct emotional register** — comic or tragic; which cycle emotion is active
3. **Include a reaction beat** — how did the synperson respond? Exit personas disengage/leave toxic situations; Voice personas stay and push back
4. **Occasionally show relationship dynamics** — interactions with other synpersons that reflect nemesis/frenemy/evil triplet tensions

### Audit rubric for existing events

For each event, check:
- Does the response beat match the archetype's interpersonal mode? (Model 10)
- Does the action signature match the archetype's habit structure? (Model 8)
- Does the emotional tone match the comic/tragic register?
- If a relationship is involved, is the dynamic consistent with the theoretical relationship type?

Flag events that show the wrong behavioral response. Rewrite flagged events. Add reaction beats where missing.

---

## Step 4: Test Run Context Strategy

*How much theory to submit during a test run, and in what form.*

### Design principle

The goal is **authentic character response**, not theoretical performance. Too much theory in the prompt collapses the synperson into an archetype-robot that answers "what would the theory say" rather than "what would this person feel." The behavioral stance block must do most of the work — it should be rich enough that raw theory is unnecessary.

### Context tiers

**Always include:**
- Full `rig.yaml` (demographic, relationships, archetype_logic, behavioral_stance, epistemic_type, signaling_mode, interpersonal_mode)
- Recent events from `events.md` (memory model selection — current approach)
- Relationship notes: 2-3 sentences on how this person relates to their Nemesis and Frenemy archetypes, in plain language, no jargon

**Include for difficult archetypes (L, HW — philosophers):**
- A 2-line character note on their epistemic signature (from Model 11) and interpersonal mode (from Model 10), written as character description not model label
- A note on their acting dead failure mode — what inaction looks like for them specifically

**Never include:**
- Raw THEORY.md or VOCAB.md
- Sub-model tables directly
- Relationship type labels (Nemesis, Frenemy, Evil Triplet) — use plain language descriptions instead
- Archetype jargon (vita contemplativa, Nakatomi space, etc.)

### Rationale

The sub-models (11 lenses) are analytical tools for *us* to use when designing and auditing synpersons. They should be baked into the behavioral_stance block and events, not submitted to the LLM at test time. The LLM should be responding as a character, not as a theorist applying a model.

Exception: if hit rates remain low after biography + events revision, consider submitting 2-3 of the most behaviorally immediate sub-models (Models 10 and 11) as compact character notes. Experiment carefully — measure hit rate impact.

---

## Step 5: Validation

After revisions are complete:

1. Run full QA pass (`run-panel.py --qa`)
2. Measure archetype hit rate overall and per-archetype
3. Compare against 20% baseline from Session 11
4. Target: ≥50% hit rate before first logged run
5. Low-hit-rate archetypes: run audit against question pool (AUDIT.md Layer 2) to distinguish biography/events problems from question pool problems

---

## Implementation Order

1. Write 6 archetype behavioral profiles (Step 1) — foundation for everything else
2. Update `_rig_schema.yaml` with new fields
3. Add `archetype_logic` and `behavioral_stance` fields to all 30 rig.yaml files
4. Audit and revise events.md files (can be done in parallel with biography revision)
5. Update `run-test.py` prompt to surface new fields
6. Run QA pass and measure hit rate

---

## Dependencies

- `THEORY.md` — source of truth for all archetype profiles
- `VOCAB.md` — controlled vocabulary; do not leak jargon into synperson-facing prompts
- `AUDIT.md` — question pool audit; run alongside or after synperson revision
- `scripts/synperson/_rig_schema.yaml` — schema to update
- `synpersons/_research_protocol.md` — no-rescoring rule and run type definitions remain unchanged
