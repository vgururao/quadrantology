# Quadrantology Design Principles

Working notes on the design philosophy behind this product. These should inform feature decisions, copy, and UX framing.

---

## 1. This is a personality tracker, not a personality test

A "test" implies a single authoritative result — pass/fail, score, label. Quadrantology is not that. It is a tracking tool for something that evolves over time, like a mood journal or a fitness log. The word "test" is used in entry-level marketing copy because it's familiar, but the product experience should push people toward the tracker framing as quickly as possible.

## 2. The model is continuous monitors, not spot tests

Reference products: continuous glucose monitors, sleep trackers, fitness trackers. These deal in trends, baselines, drift, and variance — not in single readings. A single glucose reading tells you almost nothing; the trend over days tells you everything. The same is true here. One run of the questionnaire is almost meaningless. The arc across multiple runs is the product.

A complementary reference is the Dexa scan model: a service you can use as a one-off (single body composition scan) or subscribe to annually for regular scans. The one-off gives you a snapshot; the subscription gives you a longitudinal picture that compounds in value over time. This maps directly to the product portfolio: a single assessment sequence (3 tests, 90 days) versus an annual subscription for ongoing tracking.

## 3. Personal Circle, not social network

The relational feature is called the Personal Circle. It is not an address book, a social network, or a contact list. It is a small set of intimate people — partners, close friends, mentors, key colleagues — whose personality arcs you track alongside your own, because those relationships actively shape who you are. The model is closer to a therapist's genogram or a coach's relationship map than to LinkedIn connections.

Sharing is intentionally friction-ful and bilateral: you generate a share URL from your own logbook, send it to someone directly, and they add it to their circle (and vice versa if they want). There is no follow, no discovery, no feed. The circle is private to each user and stored only in their logbook.

## 4. The main "result" is the personality arc, not a point state

Like a character arc in a story, what matters is the shape of the trajectory — where you started, where you moved, what inflection points appeared, whether you're converging or oscillating. A single archetype label is a thumbnail; the arc is the full picture. Features and copy should consistently reinforce this: the trendline is not a bonus feature, it is the core deliverable.

## 5. Data model first

The app is stateless — no server-side user data, no accounts. The logbook is the product. All feature design should begin by updating `DATAMODEL.md` to reflect what new data is needed and where it lives, before touching any code. If a feature can't be expressed as a clean addition to the data model, the feature design isn't ready yet.

## 6. Historical runs are never re-scored

A logbook entry is an honest record of what the scoring model computed at the time. Retroactively applying a new scoring model would be like altering a journal entry — it destroys the integrity of the arc. When a scoring model is updated, all past runs keep their original scores and their original `model_version`. Analytics code must handle mixed-model logbooks transparently: show model version boundaries as visible annotations on trendline charts rather than silently homogenizing across versions. This also means every historical model version must be preserved indefinitely — old scores are only meaningful if the model that produced them remains accessible.

## 7. The Walk-Away Guarantee and data dignity

*Adapted from Vitalik Buterin's "walk-away test" for Ethereum.*

A personality logbook represents real time, honest self-reflection, and lived experience. That investment of attention belongs to the user, not to this service. We call this **data dignity**: the user's data should remain useful and interpretable on its own terms, independent of whether this product continues to exist.

The walk-away guarantee: *if Quadrantology.com disappeared tomorrow — the domain lapses, the servers go dark, the developer moves on — a user with their profile file should be able to understand all their past results, re-score any historical run independently, and continue using the questionnaire locally.*

This guarantee is retrospective: it covers all runs you have already taken. It is not a promise of future model development.

**How the guarantee is maintained:**

- Every export file (profile, archive) embeds the full scoring model documentation for every model version it references — weights, algorithm, archetype table, tie-breaking rules. No external lookup required.
- Scoring models are versioned and published under CC BY 4.0 from the moment each new version is released. No model version is ever deleted.
- The questionnaire is static HTML/CSS/JS with no runtime server dependency. It can be opened from a local file.
- Paid access features (codes, Stripe) are layered on top of a fully functional free core. They are access mechanisms, not capability locks on the data itself.

The scoring algorithm is documented precisely enough that a competent programmer can reimplement it in an afternoon from the model file alone.

---

## 8. Archetypal expression is context-specific

A person does not have a single archetype. They have a profile of archetypal tendencies that vary by institutional and relational context. The product should embrace this multiplicity rather than averaging it away into a single score.

Every test run is a contextual measurement. Making the context explicit — named, persistent, attached to the run — converts an ambiguous measurement into a clean one. A user with three work runs and three family runs has two arcs, not one confused one. Multi-track trend display (separate arc per context) is not a complication of the core feature; it IS the core feature for users with more than one context.

Natural preference is revealed comparatively across contexts, not by any single run or context. The context that produces the most stable, high-confidence archetype assignment over time is the strongest indicator of natural orientation. The context that produces the most variance or stress-response expression is a signal of situational pressure, not natural preference.

**Privacy extension:** relationship data (the nicknames and guessed archetypes of real people in the user's life) is categorically more sensitive than archetype scores. It must never leave the logbook in any form — not in share URLs, not in research submissions, not in Personal Circle exports, not in Coach Mode imports unless the client explicitly includes it. The logbook download is the only authorized export path for relationship data.

*Add principles here as they emerge from product decisions.*
