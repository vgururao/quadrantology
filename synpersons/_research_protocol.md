# Synperson Research Protocol
_Governing rules for run types, logging, and editorial changes._

---

## Run Types

### Logged Run (Personality Evolution)
The canonical run type. Stores results permanently. Drives personality arc.

- **Frequency:** approximately weekly per synperson; may be clustered for a subset during active story development
- **Memory model:** full discounted-sampling (per `memory.py`); stochastic event inclusion
- **Questions:** served by `/api/sample-questions` with `previous_runs` populated from all prior logged runs; same path as real users
- **Storage:** result written to D1 `synperson_runs` with full run record, prompt text, and `events_sampled` list
- **Immutability:** once stored, the result (archetype, scores, answers) is permanent; see No-Rescoring Rule below
- **Script:** `scripts/synperson/run-test.py --id {ID} --logged`

### QA Run (Software Validation)
For testing the infrastructure, not the personality. Results are ephemeral.

- **Frequency:** unlimited; use freely during development
- **Memory model:** deterministic (all events included; no stochastic sampling) for reproducibility
- **Questions:** served by `/api/sample-questions`; QA runs contribute to `question_sequences` log just like real users — this is a feature, not a bug (they improve co-occurrence data)
- **Storage:** NOT written to D1 `synperson_runs`; output printed to terminal only
- **Archetype score:** displayed but not retained; cannot be compared to logged runs
- **Script:** `scripts/synperson/run-test.py --id {ID} --qa`

---

## No-Rescoring Rule

Once a logged run is stored in D1, it is immutable:
- The archetype, scores, and answers are canonical for that run.
- If the scoring algorithm changes, old logged runs are **not** retroactively updated.
- If questions are revised or retired, old logged runs still reference the original question IDs.
- This mirrors the real-user policy: a user's historical runs are what they are.

Rationale: the personality arc is meaningful only if each data point reflects what the synperson "believed" at the time, not what we now think they should have scored. Retroactive rescoring would make the arc a historical fiction.

---

## Editorial Change Logging

Any change to `rig.yaml` or `events.md` after the first logged run must be documented in `research_log.md` in the same directory. Changes before any logged runs exist are free to make without logging (the synperson has not yet been "born" in the research sense).

### `research_log.md` format

```markdown
# [Name] ([ID]) — Research Log

## 2026-05-10 · Biography edit
**Changed:** Updated `biography` field to reflect post-betrayal character state.
**Reason:** Original biography described David as "trusting"; after E015 this is no longer accurate at baseline.
**Runs affected:** 0 logged runs exist; no immutability concern.
**Authored by:** Venkat

---

## 2026-06-14 · Event added
**Event:** E016 · 2026-06 · intensity: 6 · "The Settlement Letter"
**Reason:** Natural story progression from E015; Marcus's legal team initiated contact.
**Authored by:** claude-sonnet-4-6 (evolve-events.py)
**Logged runs at time of change:** 4 (R001–R004 unaffected; event postdates all of them)

---

## 2026-07-02 · Event edited
**Event:** E008 · "The Acquisition Closes"
**Change:** Corrected narrative date from 2019-11 to 2020-01 (error in initial seeding).
**Runs affected:** R001 (events_sampled includes E008); note appended to R001 record in D1.
**Authored by:** Venkat
```

**Logging threshold:** Any change to an event that existed at the time of a logged run must be logged. Typo corrections are exempt. Substantive content changes are not.

**Causal note:** When adding an event, note whether it was AI-generated or human-authored. Both are valid; the distinction matters for research integrity.

---

## Event Intensity Standards

Quick reference for scoring events (see `_events_schema.md` for full distribution guidance):

| Intensity | Label | Examples |
|---|---|---|
| 1–2 | Background | A routine meeting; a minor inconvenience; a passing thought that becomes relevant |
| 3–4 | Notable | A good day at work; a small argument resolved; a minor professional win or setback |
| 5–6 | Significant | A promotion or demotion; a friendship deepening or cooling; a professional mistake with consequences |
| 7–8 | Defining | A betrayal; a public failure; a moment of moral choice with real cost; a close relationship ending or beginning |
| 9–10 | Catastrophic | A death in the family; a career-ending event; a trauma; reserved for use sparingly |

---

## Narrative Date Currency

Generated events should use the **current real-world month** as their narrative date. The synpersons' stories evolve in real time alongside the project. As of initial seeding: **April 2026**.

The gap between a synperson's last event and today should never exceed 3 months. If a synperson has not had a new event generated in more than 3 months (narrative time), the next `evolve-events.py` run should generate enough events to bring their diary current.

---

## Story Steering

Researchers (currently: Venkat) may insert events or edit existing ones to steer a synperson's narrative in a deliberate direction. This is explicitly permitted and documented as a research decision, not a contamination. Examples of legitimate steering:
- Introducing a crisis to observe how a personality responds under stress
- Resolving a storyline that has become stagnant
- Adding a relationship event when the existing relationships have become repetitive

Steering events should be marked `**Authored by:** human (steered)` in research_log.md and include a brief rationale.

---

## Synperson "Birth" Date

A synperson is considered "born" for research purposes on the date of their **first logged run**. Before that date, all changes are free. After that date, the logging requirements above apply. The birth date is stored in D1 `synpersons.first_run_at` (populated automatically by `run-test.py --logged` on first execution).

---

## Batch Operations

When running the full panel (all 30 synpersons) for a scheduled logged run, the script should:
1. Randomise the order (to avoid any systematic question-sequence bias from running them alphabetically)
2. Wait 2–5 seconds between runs (rate-limiting both the Claude API and the CF sample endpoint)
3. Log any failures without stopping the batch; failed runs can be retried individually
4. Output a panel-level summary: archetype distribution, any runs that changed archetype from their previous logged run

See `scripts/synperson/run-panel.py --logged` for implementation.
