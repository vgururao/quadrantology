# Quadrantology — Research Design Principles

Internal research protocol. Not the test administration protocol (see `synpersons/_research_protocol.md`).

---

## The Core Problem: The Synchronization Triangle

The Quadrantology research system has three components that must be mutually coherent:

```
        Theory
       (archetype definitions,
        dimension meanings)
          /        \
         /          \
Test Inventory ——— Synperson Narratives
(questions in D1,  (rig.yaml profiles,
 live + calibrating) events.md diaries)
```

These three components drift apart over time. Theory evolves through dialogue. Questions get written to intuition rather than the current theory. Synperson narratives are written from marketing archetype descriptions rather than the mathematical definitions encoded in question weights. The result is incoherence: a well-constructed Contrarian persona doesn't reliably score as a Contrarian.

**The synperson panel is the research instrument for detecting this incoherence.** Low archetype hit rates on QA runs are a signal that something in the triangle is misaligned — not merely a persona construction problem. Each improvement cycle should tighten all three sides of the triangle together.

---

## Theoretical Definitions

### The E/V Axis

The Exit/Voice distinction is not about whether someone leaves an organization. It is a psychological orientation that shows up in how people respond to friction, what motivates them, and where they locate trust.

**Exit orientation** (Legalist, Contrarian, Hacker):
- Motivated by *restlessness and boredom*, not moral outrage
- *Cynicism* limits them, not fear
- Complies with unwanted demands via *resignation*, not guilt or shame
- Improvises first when things go wrong
- Thinks through *first principles*, not analogies
- *Mission-first*, then finds a tribe going that way
- Can't stand *futile work* (disconnected from purpose)
- Trusts *the process*, not the person leading it
- When politics turns toxic: *leaves* — finds or builds a better arena
- *Principles over friends* when the two conflict
- Believes in justice as a human construct worth maintaining

**Voice orientation** (Holy Warrior, Operator, Investigator):
- Motivated by *anger and moral outrage*
- *Fear* limits them (stakes matter to them)
- Complies via *guilt or shame* relative to people who matter
- Figures out what's wrong before proceeding
- Understands through *analogies and stories*
- *Community-first* — joins a tribe, then figures out where to go
- Can't stand working with *people they dislike*, even on meaningful work
- Trusts the *leader*, not the abstract process
- When politics turns toxic: *stays and cleans house*
- *Loyalty to friends* over abstract consistency with principles
- Sees believing the world is inherently fair as naive

Note: Q021 ("when politics gets toxic...") is the definitional question for E/V. Exit archetypes literally exit; Voice archetypes reform from within. This is not a metaphor.

### The Ethics Axis

The three ethics dimensions do not map to academic moral philosophy in a straightforward way. Their meanings in this model are specific.

**Virtue ethics** (Legalist, Holy Warrior):
Moral development is organized around the concept of *good people* — what makes someone good, how goodness is recognized, and how it propagates.

Within virtue, the E/V split produces two distinct modes:
- **Holy Warrior (Voice + Virtue)** = *mimetic virtue*: you become good by finding and emulating exemplars. Moral improvement means closing the gap between yourself and the people you look up to. Points at real people and traditions. Reform means restoring the institution to the standard set by its best exemplars.
- **Legalist (Exit + Virtue)** = *codifying virtue*: you extract principles from (possibly implicit) models of goodness and crystallize them into abstract frameworks — codes, constitutions, definitions — that make good/bad legible to others. Think constitution-drafters and bills-of-rights scholars. They may draw on Locke or Montesquieu but the output is a normative framework, not "be like Jefferson." The Legalist completes the exit cycle: Hacker subverts a rule → Contrarian philosophizes the subversion → Legalist codifies the new definition of "good."

**Consequentialist ethics** (Contrarian, Operator):
Moral weight is in *outcomes*. Actions are evaluated by what they achieve. The ethics of means is subordinate to the ethics of ends.
- Analyzes options carefully before deciding (outcome-mapping)
- Believes ends justify means when the ends are important enough
- Motivated when they can see what's exciting or worthwhile about a project
- Engages with political maneuvering as a legitimate tool for achieving goals
- Present-focused pragmatism: winning the game you're in matters; long-term abstractions are often cover for inaction
- Evaluates legacy by what kind of world was built, not what lessons were taught

**Deontological ethics** (Hacker, Investigator):
Morality is *embodied in behaviors*. The right way to act is intrinsically important, independent of outcomes or models. Hackers and Investigators define themselves by how they do things, not by what they achieve or who they emulate.
- Ends do not justify means — the method is part of the moral content of the action
- Dives in hands-on; the work itself is where morality lives
- Recognizes concrete first steps; acts before planning exhaustively
- Plays to own strengths (internal compass, not external benchmark)
- Long-term principled thinking: the right strategy may cost short-term but is correct regardless
- Challenges themselves continuously (growth through self-confrontation, not comparison to others)
- "To understand me, you need to know where I'm coming from" — principled self-definition makes them somewhat inscrutable from outside

---

## Question Design Principles

### Every question must have a theoretical home

Before writing a question, specify:
1. Which dimension(s) it discriminates (E/V, virtue/conseq/deont, or a specific cross-axis)
2. Which archetype tension it is primarily testing (e.g., Contrarian vs Hacker = Exit × C/D)
3. Whether it has an implicit E/V bias (see below)

### Pure-ethics questions may have implicit E/V bias

Questions that only score on ethics dimensions (no E/V weight) can still have an implicit E/V orientation — the tension between the two options may be more legible, emotionally natural, or resonant with one side of the E/V axis.

Example: a C vs D question framed around ruthless efficiency vs. principled craft encodes a *Contrarian/Hacker* tension (Exit idiom). An Operator or Investigator may not feel the tension as sharply — their answer becomes noise rather than signal.

**The two-part fix:**
1. **Acknowledge the bias in the weights**: add a small same-direction E/V component (e.g. `[0.1, 0, 0, 1, 0]` / `[0.1, 0, 0, 0, 1]`) to both options of an implicitly Exit-biased question. This makes the bias visible in the data model.
2. **Write mirror questions**: for each biased ethics question, write a companion question that poses the *same* ethics distinction but from the other side of the E/V axis. An Exit-biased C/D question should have a Voice-biased C/D companion so the Operator/Investigator tension is also represented.

This applies to all cross-axis ethics pairs: V/C, V/D, and C/D.

**Balance requirement**: the question pool should have roughly equal numbers of Exit-biased and Voice-biased questions within each ethics-dimension pair. Systematic imbalance means some archetypes are underserved by the inventory and will produce noisier scores.

### The only dual-coded E/V + ethics question is structurally load-bearing

Q006 is currently the only question that scores on both E/V and an ethics dimension (exit/conseq vs voice/virtue). Because the sampler draws a constrained set per run, Q006 appears in nearly every sample draw. This creates fragility: one question doing two jobs. The question bank expansion should create more dual-coded questions so this burden is distributed.

### Questions are never deleted, only archived

The `archived` status preserves questions for history replay and longitudinal analysis. If a question is found to be theoretically misaligned, archive it and write a replacement — do not edit it in place in a way that would make historical scores incoherent.

---

## Research Cycle

The synchronization triangle is tightened through iterative research cycles:

1. **Theory dialogue** → sharpen dimension definitions; resolve ambiguities
2. **Question audit** → identify questions drifting from current theory; apply bias corrections; write mirrors
3. **Synperson behavioral anchors** → rewrite `behavioral_stance` fields in rig.yaml using crisp theoretical definitions
4. **Events audit** → fix narrative events that encode the wrong archetype's behavioral responses
5. **QA panel run** → measure archetype hit rate; low-hit archetypes indicate remaining incoherence
6. **Diagnose and repeat** → use hit-rate patterns to pinpoint which triangle edge needs work

Target: ≥50% archetype hit rate on QA runs as a baseline signal that the triangle is approximately coherent. 100% is not the goal (legitimate persona drift and ambiguity are expected); persistent systematic misses for specific archetypes are the signal to investigate.

---

## Relationship to Test Administration Protocol

The test administration protocol (`synpersons/_research_protocol.md`) governs run mechanics: logged vs. QA runs, the no-rescoring rule, run_token generation, and editorial logging. That document is about *how runs are conducted*. This document is about *why the system is designed as it is* and *how to improve it*. They are complementary, not overlapping.
