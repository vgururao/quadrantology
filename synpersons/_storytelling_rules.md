# Synperson Storytelling Rules
_Narrative principles for writing and generating `events.md` files. These govern tone, event selection, emotional register, and time structure. Edit freely as the panel evolves._

---

## 1. Life events are milestones, but not clean ones

Events should include the major landmarks of adult life: graduations, first jobs, moves to new cities, marriages, births, deaths, divorces, promotions, firings, diagnoses, retirements, estrangements, reconciliations. These are the load-bearing events.

But every milestone carries ambivalence. The promotion came with a boss the synperson resents. The marriage was the right call and still felt like a door closing. The new city was exciting and lonely at the same time. The graduation was followed by three months of paralysis. Do not write emotionally clean events. Real milestones are almost always mixed.

---

## 2. 80/20 personal-to-public event ratio

Roughly 80% of events should be personal life events. Roughly 20% should be significant public or historical events — 9/11, the 2008 crash, the 2016 election, COVID lockdowns, the tech boom, wars, elections, economic crises — that plausibly intersected with the synperson's circumstances at the time.

Public events must be grounded in the synperson's specific situation. Don't place a generic "9/11 was terrible" entry. Ask: where was this person on that day? What did they stand to lose or gain? How did it affect their industry, city, family, or sense of what was possible? The historical significance is implicit; the personal footprint is what gets written.

Public events that had no plausible direct impact on a synperson's life should be omitted. Not every major historical event touches every person.

---

## 3. Events are durations, not instants

Every event has a start boundary and an end boundary. Represent both. A single `YYYY-MM` timestamp implies instantaneous — avoid it for significant events.

The boundaries should be narratively meaningful, not arbitrary. Good boundary choices:
- **Death**: hearing the news → the funeral (or the shiva, or the inquest, or the night after the burial)
- **Job loss**: the day it became clear something was wrong → the last day in the office
- **Move**: the decision crystallizing → the first month settled in the new city
- **Marriage**: the proposal period → the wedding
- **Marriage going sour**: the first clear turning point → the separation

The end boundary doesn't need to be resolution. It can be the point where the event stopped being acute and became chronic, or the point where the synperson stopped tracking it consciously.

**Header format for durations:**
```
## E004 · 2001-09 → 2001-10 · intensity: 9
## E007 · Fall 2008 → Spring 2009 · intensity: 7
## E012 · Christmas week 2014 · intensity: 6
## E019 · 2016 → 2018 · intensity: 5
```

---

## 4. Duration ranges: use the full spectrum

Durations should vary widely across events in the same diary. Use all of these:

| Range | Typical use |
|---|---|
| A few days | Acute crisis, travel, receiving major news, a fight that ends quickly |
| A few weeks | Job transition, illness, a relationship shift that becomes clear |
| 1–3 months | Pregnancy announcement to birth; moving to a new city; a project collapse |
| A season or half-year | Recovering from something; a slow estrangement; a career pivot forming |
| 1–2 years | A marriage deteriorating; a startup failing slowly; a relocation fully digesting |
| Multi-year | A chronic illness; a career arc; a long-running legal dispute; a deepening faith |

No event should be assigned a multi-year duration unless the emotional register is chronic (see Rule 5).

---

## 5. Duration length governs emotional type: chronic vs. acute

This is a hard rule. Emotional type must match duration:

- **Short duration (days to a few weeks):** acute emotions — shock, grief spike, joy, anger, fear, relief, embarrassment. High-intensity single experiences.
- **Medium duration (months to a season):** transitional emotions — uncertainty, adjustment, ambivalence, cautious hope, slow grief, accumulating fatigue.
- **Long duration (a year or more):** chronic emotions — sustained low-level dread, habituation to a bad situation, gradual acceptance, slow erosion of a belief, dull pride in something achieved over time.

A synperson cannot feel acute shock for two years. If a duration is long, the body text must reflect that the feeling changed, settled, or became background noise — not that the acute feeling persisted. Violations of this rule produce melodrama and unreadable profiles.

---

## 6. Fuzzy boundary dates are allowed and often better

Event dates can be expressed as fuzzy time labels when that accurately reflects the synperson's own memory. Fuzziness should feel internally motivated, not authorial laziness.

**Good fuzzy labels:**
- `Christmas week 2001`
- `Fall 2008`
- `early spring 2019`
- `sometime in 2014`
- `May 2009` (single fuzzy month — not a range)
- `summer 2003 → fall 2003`

**Rules for fuzziness:**
- Recent events (last 5 years) should have precise enough dates: `YYYY-MM` or short fuzzy labels.
- Older events (10+ years ago) may be fully fuzzy: `fall 2007`, `sometime in 2001`.
- The start boundary may be fuzzy while the end is precise, or vice versa. This is realistic.
- If the event is a public historical event with a known date (9/11, election night 2016), use the real date precisely for the anchor but make the duration fuzzy: `2001-09-11 → late September 2001`.

---

## 7. Private regret over public narrative

When the synperson describes a milestone that the world would read as positive — a prestigious job, a marriage, a graduation, a big professional win — the event text should include at minimum a shadow. What did they give up? What were they pretending not to notice? What did they tell themselves that they didn't fully believe?

This is not the same as making every synperson depressed. It is about writing humans. The rule is: if the milestone is unambiguously positive in the external narrative, the internal voice must complicate it at least once. Conversely, ostensibly negative events (a firing, a failed relationship, a move driven by necessity) should contain at least one positive undercurrent.

---

## 8. No retrospective wisdom the synperson didn't have at the time

The body text is written in the first person at the emotional state of the event, not from the current vantage point. The synperson at 28 does not know what the synperson at 45 has learned. This rule already exists in `_events_schema.md` but bears repeating here because it interacts with duration: for long-duration events, you may show emotional evolution *within* the event, but not insight that only became available after.

Exception: retcon events (see schema). Retcon events explicitly reinterpret earlier events from a later vantage — that's their purpose.

---

## 9. Public events: write from the inside out

When including a public/historical event, start with the synperson's immediate sensory and emotional situation — what they were doing, where they were, what hit them first — before broadening to the event's significance. Never open with the historical significance and work inward.

**Wrong:** "9/11 changed everything. The towers fell and the world I thought I understood disappeared."
**Right:** "I was in the Wharton library when someone wheeled in a TV. I remember staring at the smoke and thinking: I had a call scheduled with a client in Tower Two at 9:30."

The historical weight is implicit. The personal detail is what makes the event land.

---

## 10. Events overlap in arbitrary ways — model this explicitly

Events are not a clean sequence. They are overlapping intervals, and the overlaps are often the point. A job loss can land in the middle of a troubled patch in a marriage. A vacation can be where a future partner is first met. A bereavement can coincide with a career breakthrough that the synperson feels guilty about. A public crisis (9/11, a financial crash) can interrupt a personal high — or provide cover for one.

When writing events, check whether any current events temporally overlap with others and, if so, whether that overlap is emotionally meaningful. If it is, the body text of at least one of the overlapping events should acknowledge the co-occurrence — even if only obliquely.

This matters because the events list is not just a narrative diary. It is the substrate for a formal temporal model. We will eventually apply Allen's interval calculus to the full event history to represent and reason about temporal relations between events (before, meets, overlaps, during, starts, finishes, equals — and their inverses). The fuzzy, overlapping, duration-based format we use here is designed to be compatible with that formalism. Write events with this in mind: prefer explicit start/end boundaries over vague instants, and don't flatten overlapping events into a false sequence just for readability.

---

## 11. At least one event should be simply, uncomplicatedly good

Not every event should be shadowed. One event per synperson's seed set — perhaps two — should be a genuine, uncomplicated positive: a birth that was joyful, a friendship that deepened cleanly, a moment of professional validation that felt earned and real. The purpose is calibration: if everything is ambivalent, ambivalence itself loses its texture.
