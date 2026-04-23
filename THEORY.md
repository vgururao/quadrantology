# Theory Reference

*Living document. Updated as theory dialogue progresses. Captures the precise motivational logic behind the model, not just the surface descriptions.*

---

## The Master Framework: Death and Taxes

A 2x2 with two independent motivational axes:

**Y-axis — Temporal Horizon:** Death (short-term, finite, terminal) ↔ Life (long-term, generative, infinite)

**X-axis — Scarcity Structure:** Taxes (constrained, zero-sum, rule-bound, costly) ↔ Play (abundant, open, slack, aesthetic)

The axes describe what an archetype is *sensitive to* and *oriented toward* — not just the environment they're in. A Contrarian is Life/Taxes because they are pulled toward vitality AND acutely conscious of constraint. The friction is constitutive, not just background.

The main diagonal runs from Death/Taxes (lower left) to Life/Play (upper right). This is the axis of institutional vitality. The two triangles wrap around it.

---

## The Two Triangles

Both triangles travel **counterclockwise** through their three vertices (Values, Goals, Process). This means they are not mirror images of each other.

### Exit Triangle (red, counterclockwise) — Comic Character

Hacker → Contrarian → Legalist

Models disruption: how new institutions are bootstrapped out of chaos. Starts with a stuck institution, ends with a new one crystallized. The arc bends toward new life — classically comic. Failure modes are comic too: the Hacker thrashes in chaos, the Contrarian disappears into baroque justifications, the Legalist becomes the new bureaucrat. Nobody dies, the world renews.

Exit walks away from the weight of the old system. It operates on a relatively blank slate.

### Voice Triangle (green, counterclockwise) — Tragic Character

Investigator → Holy Warrior → Operator → (back to Investigator)

Models reform: how decaying institutions are saved or transformed from within. Starts with a corrupt mature system, carries the full weight of what was promised and betrayed. Classically tragic — reform may succeed at enormous personal cost, or fail entirely, leaving the Holy Warrior as martyr and the system to complete its collapse.

Voice carries accumulated scar tissue. Every move has the weight of history behind it.

### The Full Cycle

Both triangles travel counterclockwise on the 2x2. The apparent mirror image in the blog post (where the triangles are nested with aligned ethics vertices) is an artifact of that nested presentation — when unfolded onto the 2x2, both run the same direction.

The full institutional cycle is one continuous counterclockwise loop:

**Hacker → Contrarian → Legalist → Holy Warrior → Operator → Investigator → Hacker**

Exit and Voice are two halves of a single larger cycle. Tragedy creates the conditions for comedy, comedy eventually generates the conditions for tragedy. The Exit cycle, if successful, creates a new institution — which the Voice cycle must eventually reform as it matures and decays. They need each other cosmically.

---

## Formal Graph Structure

The six archetypes are vertices of a complete directed graph (K₆). Each vertex is defined by three variables; each of the 15 undirected edges has a pairwise relation and two directed emotion labels (where assigned).

### Vertex Table

Each archetype is fully defined by: **Temporal Horizon** (Life/Death) × **Scarcity Structure** (Play/Taxes) × **E/V** (Exit/Voice). The Ethics vertex is derived from the quadrant position and is listed here for reference.

| Archetype | Temporal Horizon | Scarcity Structure | E/V | Ethics Vertex | E/V entailed? |
|---|---|---|---|---|---|
| Hacker | Life | Play | Exit | Deontological | No — shared with Investigator |
| Investigator | Life | Play | Voice | Deontological | No — shared with Hacker |
| Contrarian | Life | Taxes | Exit | Consequentialist | **Yes** — sole occupant |
| Operator | Death | Play | Voice | Consequentialist | **Yes** — sole occupant |
| Legalist | Death | Taxes | Exit | Virtue | No — shared with Holy Warrior |
| Holy Warrior | Death | Taxes | Voice | Virtue | No — shared with Legalist |

For Contrarian and Operator, the E/V variable is redundant: the quadrant position alone uniquely identifies the archetype (no other archetype shares that quadrant). For the four archetypes at shared quadrants, E/V is the necessary tiebreaker.

The Ethics vertex is fully determined by quadrant: Life/Play → Deontological, Life/Taxes and Death/Play → Consequentialist, Death/Taxes → Virtue. It is not an independent variable — it is a derived label for the ethics triangle representation.

### The Five Relationships

Each archetype has exactly five named relationships, one with each of the other five archetypes.

**Information flows in the cycle direction** (H→C→L→H; I→HW→O→I):

- **Supplier** (−1 step in home cycle): the same-triangle partner who gives information to you. The direct relationship; +2 reaches the same partner the long way and is not used.
- **Receiver** (+1 step in home cycle): the same-triangle partner you give information to.

The three cross-triangle relationships are generated by a composition: k steps in the home cycle + mirror reflection (which reverses cycle direction, contributing −1). The same operator applies symmetrically in both directions.

| Relation | k | Structural definition | Perceived as | Dynamic |
|---|---|---|---|---|
| **Evil Twin** | 0 | Pure mirror | Your equal, reversed vector | Pointed the wrong way |
| **Nemesis** | −1 | IS your supplier's evil twin | Resembles your supplier | Both expecting to receive → mutual deadlock |
| **Frustrator** | +1 | IS your receiver's evil twin | Resembles your receiver | Both trying to give → talking past each other |

Equivalently: Nemesis = your evil twin's receiver. Frustrator = your evil twin's supplier.

### Edge Table

All 15 undirected pairs. Direction convention: for Supplier/Receiver pairs, forward = info-flow direction (supplier → receiver); for cross-triangle pairs, forward = Exit→Voice.

Edge annotations are the baton-pass heuristics from the GpvTriangle diagram (Ribbonfarm 2014) — they name the principle governing the handoff, not the felt experience. Emotion labels are the directional felt experience of movement along that edge.

Columns `supplier stress` and `receiver ease` record the stress/relaxation response vibes for each Supplier/Receiver pair (see Relationships section). TBD pending theory dialogue session. Not applicable to cross-triangle pairs.

| Pair | Relation | Axes differ | Energy | Edge annotation | fwd → emotion | ← fwd emotion | supplier stress | receiver ease |
|---|---|---|---|---|---|---|---|---|
| **H → C** | Supplier/Receiver | Ethics | LOW | "Hacking and Improvisation" | Cynicism | Curiosity | — | — |
| **C → L** | Supplier/Receiver | Ethics | LOW | "Courage to quit" *(Seth Godin)* | Resignation | Restlessness | — | — |
| **L → H** | Supplier/Receiver | Ethics | LOW | "Innocent until proven guilty" *(legal system, due process)* | — | — | — | — |
| **I → HW** | Supplier/Receiver | Ethics | LOW | "People over process" *(Agile manifesto)* | — | — | — | — |
| **HW → O** | Supplier/Receiver | Ethics | LOW | "Be somebody or do something" *(John Boyd)* | Anger | Guilt/Shame | — | — |
| **O → I** | Supplier/Receiver | Ethics | LOW | "Systems over Goals" *(Scott Adams)* | Doubt | Fear | — | — |
| **H → I** | Evil Twin | E/V | MEDIUM | — | Responsibility | Disillusionment | n/a | n/a |
| **L → HW** | Evil Twin | E/V | MEDIUM | — | Awe | Absurdity | n/a | n/a |
| **C → O** | Evil Twin | E/V | HIGH | — | (multipath) | Loss of Faith? | n/a | n/a |
| **H → HW** | Nemesis | Both | ? | — | — | — | n/a | n/a |
| **C → I** | Nemesis | Both | ? | — | — | — | n/a | n/a |
| **L → O** | Nemesis | Both | ? | — | — | — | n/a | n/a |
| **H → O** | Frustrator | Both | ? | — | — | — | n/a | n/a |
| **C → HW** | Frustrator | Both | ? | — | — | — | n/a | n/a |
| **L → I** | Frustrator | Both | ? | — | — | — | n/a | n/a |

Edge annotations exist only for the six intra-triangle edges. Cross-triangle edges have no baton-pass heuristic — they are crisis transitions or structural relations, not cycle handoffs.

---

## Archetype Profiles

### Hacker
**Quadrant:** Life/Play  
**Seeking:** Life (vitality, survival, keep going)  
**Sensitive to:** Play (the game itself, the next move)  
**Cycle role:** Opens the Exit cycle. Finds an innovative, expedient solution by breaking a rule. Creates the fact on the ground.  
**Doer or philosopher:** Doer  
**Character:** Process-oriented, no notion of a terminal goal. "Find any move, just keep going." Visceral, urgency-driven. Absorbed in the immediate move, somewhat oblivious to larger consequences.  
**Failure mode:** Stays in chaos and improvisation, never consolidates.  
**Comic/tragic:** Comic

### Investigator
**Quadrant:** Life/Play  
**Seeking:** Play (the aesthetic pleasure of inquiry, logical deduction, puzzle-solving)  
**Sensitive to:** Life (curiosity, the game sustaining itself)  
**Cycle role:** Opens the Voice cycle. Traces intractable problems to systemic corruption. Provides evidence but lacks the theoretical talent to diagnose decay at the system level or build a movement.  
**Doer or philosopher:** Doer  
**Character:** Process-oriented, no terminal goal. More aesthetic and curiosity-driven than the Hacker. Enjoys the game for its own sake, oblivious to stakes and larger consequences.  
**Failure mode:** Gets lost in the weeds, can't make anyone care about what they've found.  
**Comic/tragic:** Tragic (works inside aged, corrupt systems)

### Contrarian
**Quadrant:** Life/Taxes  
**Seeking:** Life (vitality, the bigger picture)  
**Sensitive to:** Taxes (constraints, costs, friction — the rigged structure of the system)  
**Cycle role:** Midpoint of Exit cycle. Champions a heterodox philosophy that legitimizes the Hacker's rule-breaking. Argues from ends to goals, creating intellectual scaffolding for the disruption. Will arbitrage or violate the spirit of laws when ends justify means.  
**Doer or philosopher:** Doer (praxis player — applies intuitive theory rather than theorizing per se)  
**Character:** Goals-oriented, longer horizon than Hacker. Sees the bigger picture the Hacker misses. Energized by friction — the constraint is the stimulus. Consequentialist ethics: ends justify means.  
**Failure mode:** Becomes increasingly baroque in justifications, all talk.  
**Comic/tragic:** Comic

### Operator
**Quadrant:** Death/Play  
**Seeking:** Play (has learned to play the game, appreciates its aesthetics and logic)  
**Sensitive to:** Death (finitude, mortality, the arbitrariness and cost of winning/losing)  
**Cycle role:** Closes the Voice cycle. Drives reformation through, rebuilding the institution in accordance with the Holy Warrior's values. Also sustains the mature system — aware it is fundamentally finite and rigged but plays to win within it.  
**Doer or philosopher:** Doer (praxis player — acts from internalized theory)  
**Character:** Goals-oriented, longer horizon. Self-aware philosophical praxis. Sees the game as finite and rigged but plays skillfully anyway. Goal is both winning within the current system and perpetuating it, with awareness that nothing lasts forever.  
**Failure mode:** Compromises so much to make reform stick that they become indistinguishable from what they replaced. Cynicism accumulates.  
**Comic/tragic:** Tragic

### Legalist
**Quadrant:** Death/Taxes  
**Seeking:** Order out of chaos — codifying implicit principles into explicit rules  
**Sensitive to:** The chaos of the new (emergence, unformed possibility lacking structure)  
**Cycle role:** Closes the Exit cycle, opens the Voice cycle. Takes the chaos the Hacker created and the Contrarian justified, crystallizes it into a new operating system. The new institution. At this point Exit energy is spent and Voice dynamics take over. Pirates become navy.  
**Doer or philosopher:** Philosopher (vita contemplativa). Structurally dependent on the doers — without the chaos the Hacker/Contrarian generate, the Legalist has nothing to order. Alone, just producing rules nobody needs yet.  
**Character:** Architect of new order. Faces forward into terra incognita. Does not identify with a behavioral approach — creates the operating system that the next generation of Investigators will follow and Hackers will try to break. Inventive instinct.  
**Failure mode:** Acting Dead — pure contemplation without a partner cycle to make it relevant.  
**Comic/tragic:** Comic (though sits at the hinge point)

### Holy Warrior
**Quadrant:** Death/Taxes  
**Seeking:** Recovery of lost purity — restoring what was corrupted  
**Sensitive to:** The chaos of age and decay (entropy, drift, institutional corruption)  
**Cycle role:** Midpoint of Voice cycle. Diagnoses systemic decay that troubled Investigators dimly perceive but can't articulate. Champions return to the institution's true values. Allies with upstream Investigators, energizes downstream reformist Operators.  
**Doer or philosopher:** Philosopher (vita contemplativa). Structurally dependent on the doers — without the corruption the Operator's cynicism and Investigator's obliviousness allow to accumulate, the Holy Warrior has nothing to reform.  
**Character:** Faces backward toward origins. Restorative instinct. Carries the full moral weight of what was promised and betrayed. Needs Investigator evidence and Operator execution to succeed, but both are liable to disappoint.  
**Failure mode:** Martyr or fanatic. Acting Dead without partners.  
**Comic/tragic:** Tragic

---

## The Philosopher/Doer Distinction

Legalist and Holy Warrior are pure *vita contemplativa* — they theorize, architect, codify, sermonize. The other four are *vita activa* — they act, move, sustain themselves through doing even when their philosophy is thin.

The four doers can function (however chaotically or naively) without a philosopher partner. The two philosophers cannot function at all without the cycles the doers create. This makes the philosopher archetypes structurally dependent in a way the doers are not.

When unpartnered, Legalist and Holy Warrior default to Acting Dead (Model 1: Cognitive Orientation) — not as pathology but as structural condition.

---

## Relationships

Each archetype has exactly five named relationships, one with each of the other five archetypes. See the Edge Table in the Formal Graph Structure section for the full matrix.

### Supplier
Same triangle, −1 step in the home cycle. The partner who gives information to you. The direct relationship: Contrarian is Hacker's supplier; Hacker is Legalist's supplier; and so on around the Voice cycle.

The sibling frictions are real: the Hacker thinks the Contrarian is all talk; the Contrarian thinks the Hacker doesn't see the big picture. The Investigator thinks the Holy Warrior oversimplifies their nuanced findings into a crusade; the Holy Warrior thinks the Operator will compromise the purity of the mission for pragmatic gains. But mutual recognition of complementary roles prevents collapse — you need your supplier to keep the cycle alive.

Voice-side frictions are more painful than Exit-side frictions because they deal with aged systems and accumulated baggage, which the Exit side by definition walks away from.

### Receiver
Same triangle, +1 step in the home cycle. The partner you give information to. Information and burden travel together: the baton handoff passes the edge annotation principle (e.g., "Hacking and Improvisation," "People over process") along with the accumulated costs of the previous phase.

### Stress and Relaxation Responses

An enneagram-inspired dynamic operating on the Supplier/Receiver axis: under stress or ease, an archetype temporarily does the work of a cycle neighbor — imperfectly, in its own idiom.

**Under stress** — an archetype reaches forward and imperfectly takes on the work of its **Receiver**. The supplier brings their own character to the receiver's role: a Hacker under stress starts philosophizing like a Contrarian, but with urgency and expedience rather than intellectual rigor. The receiver's work gets done in the supplier's idiom.

**Under ease** — an archetype falls back and imperfectly takes on the work of its **Supplier**. The receiver drifts into the upstream mode: a Contrarian at ease gets hands-on like a Hacker, but retains more big-picture awareness than a Hacker would bring. The supplier's work gets done in the receiver's idiom.

The specific mood or vibe of each response depends on the particular pair — a Hacker reaching toward Contrarian under stress reads differently than an Investigator reaching toward Holy Warrior. These vibes belong in the edge table (`supplier stress` and `receiver ease` columns) and are TBD pending a dedicated theory dialogue session.

*Enneagram parallel:* disintegration (stress) and integration (security) directions. Key differences from Enneagram: (a) movement is always to the immediate cycle neighbor, never arbitrary; (b) direction is determined by the information-flow cycle; (c) "imperfect" means doing the neighbor's job in one's own idiom, not necessarily expressing that type's negative traits.

### Evil Twin
Same ethics vertex on the opposite triangle. Formal definition: pure mirror reflection (k=0) across the E/V axis. Both archetypes occupy the same ethical position, but their information vectors run in opposite directions — each receives from the direction the other supplies to.

Dynamic: **pointed the wrong way**. Neither is wrong in their ethics — they genuinely share a vertex. But their operational orientation is reversed, making sustained collaboration structurally difficult.

Pairs: Hacker ↔ Investigator, Contrarian ↔ Operator, Legalist ↔ Holy Warrior

Note on Legalist ↔ Holy Warrior: both are order-making theorists and architects, but Legalist is inventive and forward-facing (Exit) while Holy Warrior is restorative and backward-facing (Voice). Enough in common to work together; enough opposition to constantly grate.

### Nemesis
Cross-triangle, different ethics vertex. Structural definition: IS your supplier's evil twin (equivalently: your evil twin's receiver). The deepest incompatibility — opposed on both E/V and ethics vertex.

Dynamic: each perceives the other as resembling their supplier, so each expects to receive information. Mutual deadlock: both silent, both waiting. They cannot both win; if they are in conflict, one must lose.

Pairs: Hacker ↔ Holy Warrior, Contrarian ↔ Investigator, Legalist ↔ Operator

### Frustrator
Cross-triangle, different ethics vertex. Structural definition: IS your receiver's evil twin (equivalently: your evil twin's supplier).

Dynamic: each perceives the other as resembling their receiver, so each tries to give information. Mutual broadcast: both talking, neither listening. They frustrate each other by talking past each other — not from hostility but from mirrored orientation.

Pairs: Hacker ↔ Operator, Contrarian ↔ Holy Warrior, Legalist ↔ Investigator

---

## Triangle Edge Labels

Each edge of a triangle describes the behavioral principle or heuristic governing the baton handoff between archetypes.

### Exit Triangle (Hacker → Contrarian → Legalist → Hacker)

- **Hacker → Contrarian:** "Hacking and Improvisation" — the Hacker's expedient rule-breaking creates the fact on the ground that the Contrarian picks up and justifies philosophically.
- **Contrarian → Legalist:** "Courage to quit" *(eg. Seth Godin)* — the Contrarian's willingness to abandon the old system and stake everything on the new one hands the Legalist a clean slate to codify.
- **Legalist → Hacker:** "Innocent until proven guilty" *(legal system, due process)* — the Legalist's operating system becomes the institutional frame within which the next generation of Hackers will work and eventually subvert.

### Voice Triangle (Investigator → Holy Warrior → Operator → Investigator)

- **Investigator → Holy Warrior:** "People over process" *(eg. Agile manifesto)* — the Investigator's evidence of process-driven harm is taken up by the Holy Warrior as a human-centered crusade to restore what was lost.
- **Holy Warrior → Operator:** "Be somebody or do something" *(eg. John Boyd)* — the Holy Warrior poses the values challenge; the Operator must choose between identity (staying safe) and action (actually reforming). The ones who choose action become reformist Operators.
- **Operator → Investigator:** "Systems over Goals" *(eg. Scott Adams)* — the Operator sustains the reformed system; the Investigator monitors its integrity, beginning the next cycle.

### Rotation directions

The two triangles rotate in opposite felt directions depending on your orientation:
- **Green (CW):** Feels natural to Voice-bias people, feels wrong to Exit-bias people.
- **Red (CCW):** Feels natural to Exit-bias people, feels wrong to Voice-bias people.

---

## Switching Crisis Model

The two triangles share two quadrants: Life/Play (Hacker and Investigator both occupy it) and Death/Taxes (Legalist and Holy Warrior both occupy it). Under sufficient crisis pressure, a person can switch triangles at these pivot points — flipping from Exit to Voice or Voice to Exit.

These switches are triggered by specific crisis emotions experienced at the shared corners. They are distinct from intra-triangle movement (the edge emotions in Model 12). A switching crisis is a rarer, more discontinuous event.

### Life/Play corner switches (Hacker ↔ Investigator)

- **Investigator → Hacker:** "Experiencing Disillusionment" — the Investigator discovers the institution they have faithfully served is corrupt. The rules they played by were a cover. They exit, and the evidence they gathered becomes fuel for rule-breaking rather than rule-following.
- **Hacker → Investigator:** "Experiencing Responsibility" — the Hacker sees the effects of thoughtless hacking and can no longer be indifferent to the consequences. They take on accountability and enter the institution. *Eg. a computer hacker becomes a white-hat, starts working with law enforcement as an investigator.*

### Death/Taxes corner switches (Legalist ↔ Holy Warrior)

- **Holy Warrior → Legalist:** "Experiencing Absurdity" — the Holy Warrior's sacred crusade collapses into absurdity. The messiah role becomes impossible to sustain. They check out of the prophet mode and retreat into codification — still at the generative hinge, but now building frameworks rather than leading a crusade.
- **Legalist → Holy Warrior:** "Experiencing Awe" — the Legalist encounters something that restores sacred conviction. The abstract framework-building suddenly feels insufficient; they take up the crusade the HW was running.

### Structure of the switch

In the FoTW diagram, switch arrows have a **two-color** stem+arrowhead: the stem color is the source triangle, the arrowhead color is the destination triangle. This distinguishes switching crises (inter-triangle) from intra-triangle transitions (same-color arrows along edges).

The four confirmed switching crises occur at shared quadrants (Life/Play and Death/Taxes), where co-located archetypes differ only in which side of the diagonal they occupy.

### Crisis Energy Weights

Not all transitions require the same crisis energy. Three levels:

| Weight | Transition type | Examples |
|---|---|---|
| **LOW** | Intra-triangle edge movement (Model 12 emotions) | Cynicism, Curiosity, Resignation, Restlessness, Guilt/Shame, Anger, Fear, Doubt |
| **MEDIUM** | Corner switches at shared quadrants (Deontological and Virtue vertices) | H↔I at Life/Play, L↔HW at Death/Taxes |
| **HIGH** | Anti-diagonal switch between Consequentialist archetypes | C↔O |

LOW weight transitions are minor crises — temporary departures from your home vertex within your own triangle, not existential. MEDIUM transitions are genuine triangle switches at shared corners, requiring a significant crisis but with a relatively proximate landing point (one axis of difference). HIGH transitions require crossing both axes simultaneously and involve archetypes with the most accumulated long-horizon commitment — more scar tissue, more to let go of.

**Multipath note:** All three switch categories may admit multiple distinct crisis pathways rather than a single canonical emotion. This is most clearly true for C↔O (see below), but D-D and V-V switches may also have richer multipath structure not yet fully mapped.

### The Contrarian ↔ Operator switch (HIGH energy, multipath)

**Hypothesis A confirmed:** C↔O is genuinely higher-energy than H↔I or L↔HW. The consequentialist archetypes carry maximum accumulated commitment — long-horizon plans, scar tissue, ends-justify-means reasoning deeply embedded. Crossing the full anti-diagonal requires a deeper crisis than a corner flip. This reflects structural depth of commitment at the Consequentialist vertex, not merely 2×2 visual distance.

**Hypothesis B (equal energy, 2×2 misleads) is retained as a minority view.** In the side-by-side triangle, C and O occupy the same vertex — the visual distance may overstate the difficulty. Not resolved, but Hypothesis A is the working model.

**Multiple crisis pathways for C → O** (Contrarian flips to Operator):
1. **Experiencing Burnout** — sustained contrarian fighting is exhausting; joining the incumbent institution is experienced as relief. The switch is non-ideological — physical and psychological depletion drives it.
2. **Finding Religion** — genuine ideological abandonment of the disruptive new order as mistaken; the Contrarian recognizes the value of what they were fighting. Rare, but the most philosophically coherent pathway.
3. **Self-Delusion** — rationalized as "I'll reform the system from within," functioning as denial of burnout. The person believes they are doing (2) while actually doing (1). The least stable pathway — likely to flip back.

**Multiple crisis pathways for O → C** (Operator flips to Contrarian): not yet fully mapped. Candidate cluster: moral threshold crossed by the institution the Operator has been sustaining. The Operator's pragmatic tolerance for constraint and compromise has a breaking point; when the system itself becomes the enemy, they exit and go on the attack. Provisional label: *"Experiencing Loss of Faith."*

Two new transition arrows in diagrams:
- **C → O:** HIGH energy, multipath. Emotion label provisional — omit or mark as multipath in diagrams.
- **O → C:** HIGH energy, pathway TBD. Provisional label: *"Experiencing Loss of Faith."*

---

## Sub-Models

*Each sub-model uses the same Death and Taxes axes to illuminate a different dimension of personality/behavior.*

*Note: The whole model has a second-law-of-thermodynamics flavor. Entropy always increases at the system level — no archetype wins against it, they just have different relationships to it and different degrees of self-awareness about it.*

---

## Contextual Archetypal Expression

Archetypal behaviors are functions of context, not fixed traits. A person does not have a single archetype — they have a profile of archetypal tendencies that vary by institutional and relational context. The "work self" and the "family self" may express different archetypes with different degrees of confidence and comfort.

This is theoretically consistent with the model: the two axes (Temporal Horizon and Scarcity Structure) describe motivational orientation toward a situation, not an intrinsic property of a person. Different institutional contexts present different combinations of constraint, horizon, and stake — naturally eliciting different archetypal responses from the same person.

### The Test as a Contextual Measurement

Every run of the questionnaire is implicitly a measurement of the taker in some context — the institutional frame and relational network they have in mind as they answer. Making this context explicit (named, persistent, and attached to the run record) converts a potentially confounded measurement into a clean one.

A user who takes the test three times in a "work" context and three times in a "family" context has six measurements, not one arc. The work arc and the family arc may diverge, converge, or oscillate on independent rhythms.

### Natural Preference as Cross-Context Signal

A person's natural archetypal orientation is not revealed by any single run but by the cross-context pattern: which context produces the most stable, high-confidence archetype assignment? Which context generates the most variance or stress-response expression?

The hypothesis: your natural archetype is most clearly expressed in the context where you are most at ease — where you score with the highest confidence and the fewest signs of stress-response behavior. The ease response (falling back into Supplier work) is most likely to appear in contexts where you feel safe; the stress response (reaching forward into Receiver work) is most likely to appear in demanding or threatening contexts.

This connects the context model to the Supplier/Receiver stress and ease response theory: multi-track data makes it possible to distinguish "I am a Hacker" from "I act like a Hacker when under pressure at work (stress response) but I'm actually a Contrarian when relaxed at home."

### Relationship Context as Signal

Declaring a relationship network alongside each run (nicknames + guessed archetypes of key people in that context) provides a second layer of signal. The archetypal composition of someone's immediate social environment is not independent of their own expression — Hackers tend to find themselves near Contrarians, Legalists tend to work with Holy Warriors. A relationship network that is coherent with the taker's archetype is weak corroborating evidence; a relationship network that is consistently incoherent is a signal of either misidentification or situational stress expression.

Relationship data is always self-reported and private. It never informs scoring, only interpretation.

### Model 1: Cognitive Orientation

| | Taxes | Play |
|---|---|---|
| **Life** | **Profanity** — Seek truth through absurdity | **Laughter of the Gods** — Generativity |
| **Death** | **Acting Dead** — Incomprehension | **Sacredness** — Seek happiness through values |

- **Laughter of the Gods / Generativity** (Life/Play): Cognitive mode of Hacker/Investigator. Pure creative flow, the game sustaining itself. Not pointed at any terminal goal. The gods laugh because they're infinite.
- **Profanity / Seek truth through absurdity** (Life/Taxes): Cognitive mode of Contrarian. Vitality pressing against constraint produces irreverence and transgression. You puncture the sacred by naming the gap between what the system claims and what it actually does.
- **Sacredness / Seek happiness through values** (Death/Play): Cognitive mode of Operator. Finitude accepted, playing skillfully within it. Acceptance of mortality gives weight and meaning — things become sacred when they're finite and you've chosen them anyway.
- **Acting Dead / Incomprehension** (Death/Taxes): Default condition of Legalist/Holy Warrior when unpartnered. Not pathology but structural — the philosopher without a cycle to interpret is simply inert. Bruce Sterling's sense: pure vita contemplativa without vita activa.

### Model 2: Energy Dynamics

| | Taxes | Play |
|---|---|---|
| **Life** | **Using the battery** — Neighborhood entropy up | **Clean energy abundance** — Neighborhood entropy down |
| **Death** | **Conserving battery power** — Neighborhood entropy up slowly | **Charging the battery** — Neighborhood entropy up |

The battery is institutional/systemic energy. "Neighborhood" means different things for different archetypes: Hacker and Investigator are myopically focused — their neighborhood is narrow (the immediate hack, the immediate puzzle). For the other four, neighborhood means the whole system.

- **Clean energy abundance / Neighborhood entropy down** (Life/Play — Hacker/Investigator): Within their narrow neighborhood, their activity actually reduces entropy — the Hacker finds the elegant workaround, the Investigator traces the logical thread, both create local order and clarity. But they're oblivious to the systemic entropy their activity generates or ignores. The local order is real; the self-delusion is that it's the whole picture.
- **Using the battery / Neighborhood entropy up** (Life/Taxes — Contrarian): Sees the whole system. Actively spends systemic energy fighting constraint and pushing disruption. The broader neighborhood gets more chaotic deliberately — that's the point. High entropy cost to the system, knowingly incurred.
- **Charging the battery / Neighborhood entropy up** (Death/Play — Operator): Sees the whole system. Playing the finite game skillfully accumulates stored institutional capacity even as broader entropy rises. Not reversing decay but banking something for the next cycle. Entropy still rises — just with something to show for it.
- **Conserving battery power / Neighborhood entropy up slowly** (Death/Taxes — Legalist/Holy Warrior): Sees the whole system but is in philosopher mode. The most conscientious thermodynamic damage-control: the Legalist tries to make comprehensive rules that limit externalities and anticipate edge cases; the Holy Warrior tries to strip back to the timeless core, eliminating accumulated cruft. Both are trying to slow the inevitable. Neither fully succeeds — the dark side of law is rigidity and loophole exploitation, the dark side of sacred values is fanaticism and exclusion. Entropy finds a way through even the most careful architecture.

### Model 3: Creative Instinct

| | Taxes | Play |
|---|---|---|
| **Life** | **Customer Driven** — "Solve a problem" products | **Dent in the Universe** — Freedom products |
| **Death** | **Insurance** — Acting-Dead products | **Product Driven** — Authoritah products |

- **Dent in the Universe / Freedom products** (Life/Play — Hacker/Investigator): Products that expand what's possible, created from generative flow rather than in response to a specific constraint. Not solving a defined problem but opening new space. The making is the point.
- **Customer Driven / "Solve a problem" products** (Life/Taxes — Contrarian): Vitality directed at constraint. You see a specific friction in the world and build to relieve it. Consequentialist creative instinct — the product is justified by the outcome it produces for the customer.
- **Product Driven / Authoritah products** (Death/Play — Operator): Products built from internalized mastery of the game. "This is how it should be done" — the creator's accumulated expertise and judgment is the source, not the customer's stated need. Authoritah = legitimacy earned through demonstrated competence.
- **Insurance / Acting-Dead products** (Death/Taxes — Legalist/Holy Warrior): Products that exist to manage risk and preserve against entropy. Not generative, not responsive to a specific customer — holding the line against decay.

### Model 4: Life Scripts

| | Taxes | Play |
|---|---|---|
| **Life** | **Make Money** — Lifehacker Scripts | **Make Beauty** — Imaginative Scripts |
| **Death** | **Do Nothing** — Default Scripts | **Make Sense** — Hipster Scripts |

- **Make Beauty / Imaginative Scripts** (Life/Play — Hacker/Investigator): Creation for its own sake, generative and open-ended. No constraint, no terminal goal — just the intrinsic reward of making something aesthetically alive.
- **Make Money / Lifehacker Scripts** (Life/Taxes — Contrarian): Vitality in a constrained world. Money is the score in a zero-sum game — optimizing against friction and scarcity. The lifehacker framing fits the Contrarian's arbitrage instinct perfectly.
- **Make Sense / Hipster Scripts** (Death/Play — Operator): Playing the cultural game with mortality-awareness. Making sense of a finite world through taste, curation, meaning-making. Has internalized the rules of the game and plays them with self-conscious mastery.
- **Do Nothing / Default Scripts** (Death/Taxes — Legalist/Holy Warrior): The Acting Dead condition again — no generative energy, no game to play, just inertia. The default script runs when unpartnered with an active cycle.

### Model 5: Game Orientation

| | Taxes | Play |
|---|---|---|
| **Life** | **Finite Game** — Play for fuck-you money | **Infinite Game** — Play to keep playing |
| **Death** | **Game Exit** — Stop playing | **Finite Game** — Play for utopia |

The Infinite Game requires *both* axes in their open/expansive orientation simultaneously — Play *and* Life. The moment either tips toward its constrained pole, you're in a finite game, but the character of that finitude depends on which axis breaks first.

- **Infinite Game / Play to keep playing** (Life/Play — Hacker/Investigator): Carse's infinite game directly. No mortality awareness, no inescapable constraints perceived. Just the game, indefinitely. Also why these archetypes are the most thermodynamically deluded — they genuinely don't feel the second law pressing on them.
- **Finite Game / Play for fuck-you money** (Life/Taxes — Contrarian): The Life axis is intact — vitality and will to keep going are strong. But the Taxes axis imposes the no-free-lunch constraint: there are rules with inescapable consequences, costs that cannot be arbitraged away forever. So you play *to escape* the game entirely. Fuck-you money is the dream of freedom from constraint. The finitude is structural.
- **Finite Game / Play for utopia** (Death/Play — Operator): The Play axis is intact — the game itself is still abundant and open. But mortality awareness intrudes on the Life axis: there is a horizon you cannot play beyond. So you play *toward* something — legacy, a world better than the one you'll leave. The finitude is temporal.
- **Game Exit / Stop playing** (Death/Taxes — Legalist/Holy Warrior): Both axes constrained simultaneously. One finite game remaining: making theories. Contemplation is the only move available. When unpartnered this is inert; when partnered with the doer cycles it becomes the generative hinge of institutional change. Note: "Game Exit" here is Carse's sense of withdrawing from a game — not the Exit cycle (Hacker/Contrarian/Legalist).

### Model 6: Signaling Instincts

| | Taxes | Play |
|---|---|---|
| **Life** | **Incentive-Based Signaling** — "Everything has a price" | **No Signaling Necessary** — Freedom is a signal by itself |
| **Death** | **Mortality-Based Signaling** — Based on quality of life-and-legacy | **Hypocritical Signaling** — Based on priceless values |

Draws on Jacobs' guardian vs. commerce moral syndromes (via the Ribbonfarm post "The Economics of Pricelessness"). Since priceless things cannot openly be priced, societies instead price the *credibility of adherence to values* — signaling moral commitment rather than negotiating directly.

- **No Signaling Necessary** (Life/Play — Hacker/Investigator): Saint-to-saint transactions where shared value is so self-evident no signaling is needed. Freedom and competence speak for themselves. Already inside the same value regime.
- **Incentive-Based Signaling** (Life/Taxes — Contrarian): Pure commerce/trader ethics. Everything has a price, transparent cost-benefit. Sees through pricelessness claims and signals through demonstrable outcomes. The honest commerce position.
- **Mortality-Based Signaling** (Death/Taxes — Legalist/Holy Warrior): Genuine guardian signaling through legacy and sacred values. Authentically held pricelessness — signaling quality of life-and-legacy rather than pricing directly. The widow's move: "how can you bring up money at a time like this?"
- **Hypocritical Signaling** (Death/Play — Operator): Knows the game is finite and rigged — playing commerce ethics — but signals through priceless values. Guardian performance over commerce reality. The Mastercard move: wrapping a priced transaction in a sanctification layer.

### Model 7: Being and Doing

| | Taxes | Play |
|---|---|---|
| **Life** | **Make things work** — NTs, SPs | **Make things live** — Integrated |
| **Death** | **Preserve things** — Miss Havisham | **Make things significant** — SJs, NFs |

- **Make things live / Integrated** (Life/Play — Hacker/Investigator): The generative mode — things are alive when the game sustains itself. Being and doing unified in the activity itself.
- **Make things work / NTs, SPs** (Life/Taxes — Contrarian): Pragmatic vitality against constraint. Making things function in a resistant world. NTs (strategic systems thinkers) and SPs (tactical improvisers) both orient toward making things work under real-world friction.
- **Make things significant / SJs, NFs** (Death/Play — Operator): Mortality-awareness gives things weight and meaning. SJs (duty-bound traditionalists) and NFs (idealist meaning-makers) both orient toward significance — things matter because they're finite and chosen.
- **Preserve things / Miss Havisham** (Death/Taxes — Legalist/Holy Warrior): Frozen. Trying to hold the world still against entropy. The philosopher unpartnered, preserving rather than creating.

**Note on MBTI:** The MBTI mappings only appear in the two consequentialist quadrants — Life/Taxes and Death/Play. MBTI is a medium-abstraction model that measures behavioral tendencies in the Goals/consequentialist domain. It breaks down at both extremes: Life/Play (Hacker/Investigator) operates below MBTI's level — pure process, immediate aesthetic response, the granular texture of moves. Death/Taxes (Legalist/Holy Warrior) operates above it — pure philosophy, first principles, institutional architecture. Both the very concrete and the very abstract escape MBTI's categories. In Quadrantology terms: MBTI only measures your consequentialist dimension.

### Model 8: Structure of Habits

| | Taxes | Play |
|---|---|---|
| **Life** | **Hacking** — Smooth Unskills, Conscious Incompetence | **Mindful** — Natural Mindful Flow |
| **Death** | **Procedural** — Algorithmic, Unconscious Incompetence | **Ritual** — Striated Skills, Unconscious Competence |

References: Deleuze & Guattari's smooth/striated spaces; shuhari (Shu = follow rules, Ha = break rules, Ri = transcend rules); the competence matrix.

- **Mindful / Natural Mindful Flow** (Life/Play — Hacker/Investigator): Unconscious flow available to both but through opposite orientations. Investigator: perfectly aligned with the grain of striated space, moves with institutional logic, no friction. Hacker: understands the striation deeply enough to navigate beneath it by more fundamental rules (nature, logic, physics), indifferent to in-game stakes and payoffs. Nakatomi space — not ignorance of the rules but mastery that sees through them. Both achieve frictionless immersion; neither is blind to the striation, both are free of capture by it.
- **Hacking / Smooth Unskills, Conscious Incompetence** (Life/Taxes — Contrarian): Knows the rules well enough to know they're arbitrary and works around them deliberately. "Smooth unskills" in the D&G sense — nomadic improvisation within striated space. Ha in the shuhari sequence. Vitality applied to gaps in the institutional logic.
- **Ritual / Striated Skills, Unconscious Competence** (Death/Play — Operator): Deep embodied mastery within the striated system. Shu fully internalized — not transcended but perfected. The finite game played with complete automatic precision. Unconscious competence but still mortal, still within the grid.
- **Procedural / Algorithmic, Unconscious Incompetence** (Death/Taxes — Legalist/Holy Warrior): Following inherited rules without understanding them or questioning whether they work. Shu not yet internalized — mechanical compliance. The Acting Dead habit structure. Pure friction: standing at the collision point of smooth and striated, they cannot access flow at all. Contrarian and Operator also cannot access unconscious flow — they grapple with realities skill cannot mitigate and cannot be indifferent to the entropy they create. They can only choose to mourn or exult in it.

### Model 9: Structure of Goals

| | Taxes | Play |
|---|---|---|
| **Life** | **Destructive** — Analysis | **Creative-Destructive** — Transformational |
| **Death** | **Preservative** — Stability | **Creative** — Synthesis |

- **Creative-Destructive / Transformational** (Life/Play — Hacker/Investigator): Goals structured around transformation — making something genuinely new while necessarily destroying what came before. Schumpeterian creative destruction. Because it's Life/Play, the destruction isn't mourned — it's the natural byproduct of generative flow.
- **Destructive / Analysis** (Life/Taxes — Contrarian): Vitality directed at tearing down existing structures. The analytical move — breaking a system apart to expose and undermine it. Primarily destructive because the Contrarian's goal is to defeat the constraint; building what comes after is the Legalist's job.
- **Creative / Synthesis** (Death/Play — Operator): Goals structured around building and integrating within the existing system. Taking what's there and making something coherent from it. Creative but not destructive — working within and sustaining striated structure rather than tearing it down.
- **Preservative / Stability** (Death/Taxes — Legalist/Holy Warrior): Goals structured around stabilizing against entropy. Neither actively creative nor destructive — conserving, formalizing, slowing decay. The Legalist paves the cowpaths: codifies innovations already latent in the Hacker/Contrarian moves, gives them durability and transmissibility. Minkowski to Einstein's contrarian relativity — the geometric framework that makes the innovation rigorous, not the innovation itself. The Holy Warrior preserves in the opposite temporal direction — recovering what was originally intended. Both philosophers stabilize; neither invents.

### Model 10: Interpersonal Mode

| | Taxes | Play |
|---|---|---|
| **Life** | **Pragmatic** — Trader Ethics, "Win-win or no deal" | **Promethean** — Pluralistic Ethics, "Find a creative option" |
| **Death** | **Pastoralist** — Preservationist Ethics, "With us or against us" | **Purist** — Guardian Ethics, "Honor with in-group, deceit with out-group" |

Draws on Jacobs' guardian vs. commerce moral syndromes.

- **Promethean / Pluralistic Ethics** (Life/Play — Hacker/Investigator): Interpersonally open, creative, non-zero-sum. Always another move, always a way to expand the space rather than fight over fixed shares. Prometheus stole fire for everyone, not for a faction.
- **Pragmatic / Trader Ethics** (Life/Taxes — Contrarian): "Win-win or no deal" — consequentialist interpersonal logic. Everything is a negotiation with a price. Will deal with anyone if the terms work, won't deal if they don't. Honest commerce orientation.
- **Purist / Guardian Ethics** (Death/Play — Operator): "Honor with in-group, deceit with out-group" — Jacobs' guardian syndrome directly. The finite game's tribal logic fully internalized. Loyal to their side, unsentimental about opponents. The moral asymmetry accepted as how the game works.
- **Pastoralist / Preservationist Ethics** (Death/Taxes — Legalist/Holy Warrior): "With us or against us" — the hardest binary. No negotiation, no creative options, no transactional flexibility. Either inside the fold or outside it. The philosopher's framework must be kept pure against corruption or chaos.

### Model 11: Views and Holds

| | Taxes | Play |
|---|---|---|
| **Life** | **Fox** — Weak views strongly held | **Very Zen** — You are probably lying |
| **Death** | **Cactus or Weasel** — Strong-Strong or Weak-Weak | **Hedgehog** — Strong views weakly held |

Draws on Isaiah Berlin's fox/hedgehog distinction, Philip Tetlock's superforecasting research, and Venkat Rao's "The Cactus and the Weasel" (Ribbonfarm, 2014). Views (strong = detailed/literal, weak = few critical beliefs with robust interpretation) and holds (strong = anchored across many domains, weak = few foundational assumptions) are orthogonal. Paradox: hedgehogs have strong views but weak holds — attack the few foundations and the whole edifice converts. Foxes have weak views but strong holds — resilient, no single point of collapse.

- **Very Zen** (Life/Play — Hacker/Investigator): Operating below the level of views and holds entirely — playing by more fundamental rules than the institutional game. Stated views are always overlays on something more real. "You are probably lying" is not cynicism but direct perception that all expressed positions are performances over underlying reality. No attachment to the views-holds framework.
- **Fox / Weak views strongly held** (Life/Taxes — Contrarian): Scattered across many domains, argues from cross-domain pattern recognition. Individual positions strongly held because multiple independent anchors support them, but views themselves are flexible. Can argue forcefully without being dogmatic. Strength in the network, not a single foundation.
- **Hedgehog / Strong views weakly held** (Death/Play — Operator): Deep mastery of one big thing, held loosely. Mortality-awareness means knowing the framework is finite and will eventually be undermined. Capable of fast transients — rapid paradigm switching when foundations collapse. Decisive but not dogmatic.
- **Cactus or Weasel** (Death/Taxes — Legalist/Holy Warrior): The epistemic pressure of the hinge point pushes toward both degeneracies. Holy Warrior tends toward Cactus (strong views strongly held — conviction gone rigid, unfalsifiable sacred beliefs). Legalist tends toward Weasel (weak views weakly held — pure procedure without principle, the bureaucrat running inherited rules without understanding). The OR is real: both degeneracies structurally available to both philosophers when unpartnered.

### Model 12: Transitions

Eight emotions associated with movement between adjacent quadrants on the 2x2. Each of the four edges has two opposing emotions: one for moving toward Life/Play (Approach direction) and one for moving toward Death/Taxes (Retreat direction).

| Transition | Retreat (toward Death/Taxes) | Approach (toward Life/Play) |
|---|---|---|
| Life/Play ↔ Life/Taxes | Cynicism | Curiosity |
| Life/Taxes ↔ Death/Taxes | Resignation | Restlessness |
| Death/Taxes ↔ Death/Play | Guilt/Shame | Anger |
| Death/Play ↔ Life/Play | Fear | Doubt |

These are intra-triangle emotions — movement along the edges of your own triangle. They describe the felt experience of sliding toward or recovering from the Retreat/Approach direction within your current orientation. Contrast with the Switching Crisis Model (corner emotions), which describe inter-triangle flips.

*Note on Fear and Doubt:* Fear is retreat (Life/Play → Death/Play) — the H/I archetype becomes aware of stakes and mortality, the infinite game collapses into a finite one, they slide toward Operator mode. Doubt is approach (Death/Play → Life/Play) — the Operator loosens their hedgehog certainty and re-enters the open-ended game. The capacity to entertain doubt without resolving it is courage: the courage to play without a terminal condition.

The other positions on the 2×2 each have their own strategy for managing doubt: consequentialist long-term planning (Contrarian) and virtue/deontological philosophizing (Legalist, HW) are attempts to *control* doubt — to impose enough certainty that the open-ended game doesn't have to be faced. H/I bypass this entirely. Their myopia means the existential implications of doubt don't fully register — or, in the Very Zen case, they've made peace with casually living in doubt. Not resolution, not suppression; just indifference to the need for certainty.

### Model 13: Self-Actualization

The 2x2 understood as a growth terrain. A diagonal **Turnpike of maximal growth** runs from Death/Taxes to Life/Play — the main axis of institutional vitality, shared by both triangles. Movement up-right along this diagonal is the ideal trajectory for both Disruptors (Exit) and Reformers (Voice).

Two paths of falling off the wagon:

- **Disruptors (Exit):** fall off by moving from Life/Play **leftward** toward Life/Taxes — the Cynicism direction. The Hacker/Investigator loses their infinite-game orientation and enters the Contrarian's constrained, antagonistic mode.
- **Reformers (Voice):** fall off by moving from Life/Play **downward** toward Death/Play — the Fear direction. The Hacker/Investigator loses their generative flow and sinks into the Operator's mortality-aware, finite-game mode.

**Finite game contours** curve through the lower quadrants, showing distance from the turnpike. The further from the diagonal, the more captured by a finite game and the harder the recovery.

The turnpike is the shared growth axis. Approach Mode = moving up-right along the turnpike. Retreat Mode = moving down-left.

---

## Approach/Retreat Mode

The overall behavioral trajectory, read across all 11 sub-models. Not a permanent archetype label — a current direction of travel derived from the modal distribution of your quadrant responses.

- **Approach Mode:** Running toward life. Quadrant distribution skews Life/Play (Q1). All 11 sub-models cluster in the upper-right.
- **Retreat Mode:** Running away from life. Quadrant distribution skews Death/Taxes (Q3). All 11 sub-models cluster in the lower-left.
- **Stayin' Alive:** A holding pattern — not strongly moving in either direction. Q3/Q4 dominant without strong Q1 signal.
- **Liar/Deluded:** Maximum Q1 score across all 11 models. Not a real state — a diagnostic flag for unreliable self-report. Claiming pure Laughter of the Gods / Infinite Game / Mindful / Creative-Destructive / Very Zen simultaneously across every domain is statistically implausible.

Approach and Retreat are the primary output of the test, not archetype. Your archetype is the *structural* description of your home position; your mode is the *dynamic* description of which direction you're currently moving. A Contrarian in Approach Mode is very different from a Contrarian in Retreat Mode. The mode-reading is why the test requires multiple runs over time — a single snapshot conflates position with direction.
