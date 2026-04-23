# Controlled Vocabulary

*Terms of art used in the Quadrantology model. Use these precisely and consistently.*

---

**Exit** — One of two institutional change patterns (from Hirschman). The disruption cycle: Hacker → Contrarian → Legalist. Comic character. Do not use loosely to mean "withdrawing from a game" or "leaving a situation."

**Voice** — One of two institutional change patterns (from Hirschman). The reform cycle: Investigator → Holy Warrior → Operator. Tragic character.

**Life / Death** — The Y-axis of the Death and Taxes 2x2. Stylized opposed pair describing temporal horizon orientation. Life = long-term, generative, infinite. Death = short-term, finite, terminal. These describe what an archetype is *sensitive to*, not just the environment they're in.

**Play / Taxes** — The X-axis of the Death and Taxes 2x2. Stylized opposed pair describing scarcity structure orientation. Play = abundant, open, aesthetic, slack. Taxes = constrained, zero-sum, rule-bound, costly. Again, motivational orientation, not just environment.

**Finite Game** — A game played to win, with a terminal condition. Entered when either the Life or Play axis tips toward its constrained pole. Character of the finitude depends on which axis: Death/Play = temporal finitude (play for legacy/utopia); Life/Taxes = structural finitude (play to escape constraint, e.g. fuck-you money). From Carse.

**Infinite Game** — A game played to keep playing, with no terminal condition. Requires both Life and Play axes in their open/expansive orientation simultaneously. From Carse.

**Supplier** — Relationship type. Same triangle, −1 step in home cycle. The partner who gives information to you. Information gradient only — do not imply status hierarchy.

**Receiver** — Relationship type. Same triangle, +1 step in home cycle. The partner you give information to. Information gradient only — do not imply status hierarchy.

**Stress response** — Under stress conditions, an archetype imperfectly takes on the work of its Receiver, doing that work in its own idiom. The specific vibe or character of this impersonation depends on the particular Supplier/Receiver pair. See edge table in THEORY.md (`supplier stress` column). Enneagram parallel: disintegration direction.

**Ease response** — Under relaxed/secure conditions, an archetype imperfectly takes on the work of its Supplier, doing that work in its own idiom. The specific vibe or character of this impersonation depends on the particular pair. See edge table in THEORY.md (`receiver ease` column). Enneagram parallel: integration direction.

**Evil Twin** — Relationship type. Same ethics vertex on the opposite triangle. Formal definition: pure mirror reflection (k=0) across the E/V axis. Dynamic: *pointed the wrong way* — both occupy the same ethics vertex but their information vectors run in opposite directions; each receives from the direction the other supplies to. Pairs: Hacker ↔ Investigator, Contrarian ↔ Operator, Legalist ↔ Holy Warrior.

**Nemesis** — Relationship type. Cross-triangle, different ethics vertex. Formal definition: IS your supplier's evil twin (equivalently: your evil twin's receiver; k=−1 composed with mirror). Dynamic: each perceives the other as resembling their supplier, so each expects to receive — mutual deadlock, both silent. The deepest incompatibility: cannot both win. Pairs: Hacker ↔ Holy Warrior, Contrarian ↔ Investigator, Legalist ↔ Operator.

**Frustrator** — Relationship type. Cross-triangle, different ethics vertex. Formal definition: IS your receiver's evil twin (equivalently: your evil twin's supplier; k=+1 composed with mirror). Dynamic: each perceives the other as resembling their receiver, so each tries to give — mutual broadcast, talking past each other. Pairs: Hacker ↔ Operator, Contrarian ↔ Holy Warrior, Legalist ↔ Investigator.

**Test context** — A named, persistent institutional/relational frame declared by the user at test time (e.g., "work — Acme Corp", "family of origin"). Contexts are reusable across runs via editable inheritance. A run taken without a declared context is valid but produces a less interpretable result. Do not confuse with the colloquial sense of "context" — this is a formal data object with its own schema.

**Relationship set** — The named people and their guessed archetypes attached to a context. Each entry has a nickname (never a real name), a guessed archetype (nullable), and a confidence level (the user's self-reported certainty about the guess). Relationship data is private and logbook-only — it must never appear in share URLs, research submissions, or any exported payload except the full logbook download.

**Archetype distribution** — A probability-style map of all 6 archetypes to confidence scores (summing to 1.0), derived from dimension scores at run time. The assigned archetype is the one with the highest value. Replaces the implicit notion that the scoring model produces a single label — it always produces a distribution; the label is just the argmax. Stored on every run record.

**Multi-track** — Trend tracking that separates results by declared context, enabling separate arc views for "work self", "family self", etc. The cross-context pattern — which context produces the most stable, high-confidence archetype — is the primary signal for natural archetypal preference. Not to be confused with multi-run tracking within a single context.

**MBTI** — A medium-abstraction personality model that measures behavioral tendencies in the consequentialist/Goals domain only. Maps cleanly onto the Life/Taxes and Death/Play quadrants but breaks down at the process extreme (Life/Play — too granular) and the virtue/philosophy extreme (Death/Taxes — too abstract). Do not use MBTI as a proxy for the full Quadrantology model — it only measures the consequentialist dimension.

**Smooth space** (D&G, as used in this model) — Do not confuse with flatness, ease, or flow. Smooth space is wilderness, or striated space as navigated by someone playing by more fundamental rules than the institutional game — nature, logic, physics — while indifferent to in-game stakes and payoffs (prizes, status, institutional rewards). The Hacker is the paradigm case: understands the striation as well as or better than the Investigator, but operates at a deeper level underneath it. Nakatomi space is the visual metaphor — McClane navigating the building through air ducts and elevator shafts, not because he doesn't understand the architecture but because he understands it well enough to see through it. Exit triangle = smooth space orientation.

**Striated space** (D&G, as used in this model) — Gridded, metric, hierarchical, rule-governed institutional space. Voice triangle = striated space orientation. The Investigator is perfectly aligned with the grain of striated space and therefore experiences no friction — not because they're in smooth space but because they're moving with the institutional logic rather than against or beneath it.

**Flow / Unconscious competence** — The frictionless immersion in action available to Hacker and Investigator (Life/Play). Both achieve it but through opposite orientations: Investigator through perfect alignment with striated space; Hacker through deep understanding of striation that enables smooth navigation beneath it. Contrarian and Operator cannot access unconscious flow — they grapple with realities that skill alone cannot mitigate and cannot be blind or indifferent to the entropy they're creating. They can only choose to mourn or exult in it. Legalist and Holy Warrior cannot access flow at all — their experience is pure friction, standing at the collision point of smooth and striated.

**Shuhari** (守破離) — Japanese martial arts concept for stages of mastery: Shu (follow rules), Ha (break rules), Ri (transcend rules). Maps onto the model: Shu = Procedural (Death/Taxes); Ha = Hacking (Life/Taxes); Ri = Mindful flow (Life/Play). Ritual (Death/Play) = Shu perfected into unconscious competence, not transcended. Reference: aikido and other Japanese martial arts traditions.

**Nakatomi space** — Visual metaphor for smooth navigation of striated space. From Geoff Manaugh's BLDGBLOG essay on Die Hard: McClane moves through the Nakatomi Plaza skyscraper via air ducts, elevator shafts, and blasted walls — not because he doesn't understand the architecture but because he understands it well enough to see through it to more fundamental possibilities. Paradigm case for the Hacker's relationship to institutional rules. See also: IDF urban warfare tactics in Nablus (Eyal Weizman).

**Hedgehog** — Epistemic type: strong views, weakly held. Few foundational beliefs anchor an entire worldview. Attack the foundations and the whole edifice converts rapidly. Decisive but vulnerable to paradigm collapse. Maps to Operator (Death/Play). From Isaiah Berlin; elaborated by Philip Tetlock and Venkat Rao's "The Cactus and the Weasel."

**Fox** — Epistemic type: weak views, strongly held. Scattered beliefs across many domains anchored by cross-domain pattern recognition. Resilient because no single point of collapse — undermining requires piecemeal attacks across many areas. Maps to Contrarian (Life/Taxes). Same sources as Hedgehog.

**Cactus** — Degenerate hedgehog: strong views, strongly held. Dogmatic, disconnected from reality, beliefs unfalsifiable. Holy Warrior's failure mode. Cannot change its mind in any meaningful way.

**Weasel** — Degenerate fox: weak views, weakly held. Pure bullshitter, purely relativistic, no grounding. Legalist's failure mode when unpartnered — running inherited rules without principle or understanding.

**Very Zen** — Epistemic stance of Hacker/Investigator (Life/Play): operating below the level of views and holds entirely. Stated views are always overlays on something more fundamental. "You are probably lying" is not cynicism but direct perception that all expressed positions are performances over underlying reality. No attachment to the views-holds framework.

**Guardian ethics / Commerce ethics** — Jane Jacobs' two incompatible moral syndromes from *Systems of Survival*. Guardian: loyalty, honor, pricelessness, "with us or against us." Commerce: negotiation, price, win-win, voluntary agreement. Maps in this model: Legalist/Holy Warrior (Death/Taxes) = guardian; Contrarian (Life/Taxes) = commerce; Operator (Death/Play) = guardian performance over commerce reality (hypocritical signaling); Hacker/Investigator (Life/Play) = beyond both syndromes, no signaling necessary.

**Pricelessness** — Economic concept from Venkat Rao's "The Economics of Pricelessness" (Ribbonfarm, 2014). Since culturally priceless things (life, dignity, honor) cannot openly be priced, societies instead price the *credibility of adherence to values* — signaling moral commitment rather than negotiating directly. Key to understanding Model 6 (Signaling Instincts) and the guardian/commerce distinction.

**Vita contemplativa / Vita activa** — Classical distinction between the life of thought and the life of action. Legalist and Holy Warrior = vita contemplativa (philosophers, theorists, architects of order). Hacker, Investigator, Contrarian, Operator = vita activa (doers). Philosophers are structurally dependent on doers — without the cycles doers generate, philosophers have nothing to interpret. Unpartnered philosophers default to Acting Dead (Bruce Sterling's sense).

**Acting Dead** — Bruce Sterling's term for the condition of pure vita contemplativa without vita activa. Default state of Legalist and Holy Warrior when unpartnered — not pathology but structural condition. They can produce texts and rules, but nobody needs them yet.

**Second law flavor** — The whole model operates against a backdrop of thermodynamic inevitability. Entropy always increases at the system level. No archetype wins against it; they differ in their awareness of and relationship to this fact. Hacker/Investigator are most deluded (narrow neighborhood). Contrarian/Operator are most honest (see the whole system, choose to mourn or exult). Legalist/Holy Warrior are most conscientious (try hardest to slow the inevitable, but entropy finds a way through even the most careful architecture).
