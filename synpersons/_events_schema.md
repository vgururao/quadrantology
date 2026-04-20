# Synperson Events Schema
_Format reference and distribution principles for all `events.md` files._

---

## File Header

```markdown
# [Full Name] ([ID]) — Event Diary
_Archetype: [Archetype] · Born: [YYYY-MM-DD] · Narrative life begins: [YYYY]_

<!-- AI-generated. Edit freely. Editorial changes must be logged in research_log.md. -->
<!-- Format: ## E{NNN} · {YYYY-MM} · intensity: {1-10} / **{Title}** / [body] / --- -->
```

---

## Event Block Format

```markdown
## E001 · 2019-03 → 2019-05 · intensity: 7
**The Big Short Pitch**

First-person past tense, 2–4 sentences. Written as the synperson would recall it: the
subjective experience, not an objective account. What they felt. What they noticed. What
they concluded that may or may not be accurate.

---
```

**Field rules:**
- `E{NNN}`: zero-padded, three digits. Chronological order.
- **Date field** — events are durations, not instants. Use a start → end format:
  - `YYYY-MM → YYYY-MM` for precise ranges
  - `YYYY → YYYY` for multi-year chronic events
  - Fuzzy labels are allowed and often better for older events: `Fall 2008 → Spring 2009`, `Christmas week 2001`, `sometime in 2014`
  - A single `YYYY-MM` is only acceptable for genuinely instantaneous reference events (e.g., anchoring a public event)
  - The start and end boundaries should be narratively meaningful, not arbitrary
- `intensity: {1-10}`: emotional loading at time of occurrence (not current significance). 1 = background/mundane, 5 = notable but not life-changing, 8 = defining or traumatic, 10 = reserved for genuinely catastrophic events. Most events are 3–6.
- **Title**: bold, 2–5 words, present tense (newspaper headline style).
- **Body**: first person, past tense. 2–4 sentences. No retrospective wisdom the synperson didn't have at the time — unless this is a retcon event (see below). For long-duration events (months or years), the body should reflect emotional evolution over that span — not a single sustained acute feeling.
- Separator: `---` after every event block.

See `_storytelling_rules.md` for full narrative principles governing event selection, public/personal ratio, duration-to-emotion mapping, and boundary fuzziness.

---

## Retcon Events

When a later event revises interpretation of an earlier one, add a retcon marker:

```markdown
## E014 · 2024-06 · intensity: 8
**The Leak Was Not an Accident**

<!-- retcon: E003 -->
I found out through a journalist that Marcus had been feeding my position to Meridian's IR
team for months before I noticed the PR campaign. The betrayal in E003 I attributed to
opportunism — I now believe it was calculated from the beginning.

---
```

Retcon events do not change E003's text. They add a new event that revises the interpretation. The causal link engine will eventually infer the connection automatically; the `retcon: E{NNN}` comment is the hand-authored predecessor to that.

---

## Seed Event Distribution (initial 15 events)

Seed events follow an **exponential-density-over-time** distribution: events are more frequent in recent years, but older events tend to be more emotionally intense.

**Density rule** (approximate; adjust by ±1 based on life circumstances):

| Period | Events | Notes |
|---|---|---|
| Narrative start → 12 years ago | 3 | Formative; avg intensity 7–8 |
| 12 → 7 years ago | 3 | Establishing; avg intensity 5–7 |
| 7 → 3 years ago | 4 | Rising stakes; avg intensity 4–7 |
| 3 → 1 years ago | 3 | Recent; avg intensity 3–6 |
| Last 12 months | 2 | Freshest; intensity varies widely |

"Narrative start" = roughly age 18-22 (first adult independence, first professional act, or first defining moral choice). For older synpersons (55+), the formative events are further back but still limited to 3 — the exponential decay is relative to the person's active span, not absolute calendar time.

**Intensity tendency by period:**
- Formative events are often high-intensity (7–9) because they shaped identity.
- Recent events are distributed across the full range; mundane things happen frequently.
- Every synperson should have at least one intensity-8+ event in their history.
- No synperson should have more than three intensity-8+ events in their seed set.
- Intensity-10 events are rare; use at most once per synperson, only for genuine catastrophe.

---

## Ongoing Event Generation (between logged runs)

**Volume:** 1–5 events per interval between logged runs (approximately weekly). The distribution of how many to add follows:
- 1 event: 35% of intervals (most weeks, one thing happened)
- 2 events: 30%
- 3 events: 20%
- 4 events: 10%
- 5 events: 5%

**Intensity distribution for generated events** follows an approximate log-normal:
- μ = 1.4, σ = 0.55 (on the log scale) → median intensity ≈ 4.1, mean ≈ 4.7
- Practical bins: intensity 1–2 (15%), 3–4 (40%), 5–6 (30%), 7–8 (13%), 9–10 (2%)
- Generating scripts should sample from this distribution; not every week is dramatic.

**Narrative coherence:** New events should follow causally from existing ones. Avoid contradicting established facts. Causal links can be implicit — "I started avoiding the office" is a consequence of a prior conflict without needing to name it.

---

## Emotional Valence

Events should be mixed in valence. Not every event is bad. Positive events (a relationship deepening, a professional win, a moment of unexpected generosity) are just as important for personality evolution as negative ones. A synperson who only experiences losses will drift into an unrealistically grim profile.

**Rough valence distribution for seed set:**
- Negative / painful: 5–6 events
- Positive / affirming: 3–4 events  
- Ambiguous / mixed: 4–5 events

---

## What Events Are NOT

- Not omniscient: the synperson writes from their own perspective. If Marcus betrayed David, David writes about feeling betrayed, not about Marcus's actual motivations (unless a later retcon event adds that).
- Not summaries: "I had a difficult year" is not an event. A specific moment is an event.
- Not character descriptions: the biography in `rig.yaml` handles stable character. Events handle things that *happened*.
- Not future plans: events are completed facts (past tense), not intentions.

---

## Narrative Date vs. Creation Date

The `YYYY-MM` in the event header is the **narrative date** — when the event occurred in the synperson's life. It has nothing to do with when the event was written or generated. Events should be populated with narrative dates up to the current real-world date (April 2026 at initial seeding). New generated events should use the current real-world month as their narrative date unless the prompt specifies otherwise.
