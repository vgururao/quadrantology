# Visual Model Reference

*Geometric and visual specification for the Death and Taxes model. Companion to `THEORY.md`. Use this as the authoritative reference before drawing any SVG, diagram, or illustration.*

---

## Overview: The Three Visualization Modes

The two triangles (Exit/red and Voice/green) can be rendered in three distinct modes, each suited to different explanatory purposes. All three are canonical — they are different projections of the same underlying structure, not different models.

### Mode 1: Nested (Essay original)

**Source:** "How to Fall Off the Wagon," Ribbonfarm, 2014. The GpvTriangle.png diagram.

Both triangles share the same three vertex positions (Goals/Consequentialist, Processes/Deontological, Values/Virtue). The Voice triangle is drawn inside or overlapping the Exit triangle, with both sharing the same vertex coordinates. The two triangles are distinguished by color (red/Exit, green/Voice) and rotation direction (CCW/Exit, CW/Voice).

**Best for:** Showing that the two triangles are mirror images of each other in ethics-space — same vertices, opposite rotation. Makes the fundamental chirality contrast visually obvious. Emphasizes the shared ethical vocabulary.

**Limitation:** Co-located archetypes (H/I at Deontological, L/HW at Virtue) overlap completely, making it hard to read individual archetype positions or switching crisis arrows.

### Mode 2: Side by Side (Slide deck)

**Source:** Slide deck (quadrantologyExp.pptx era). The two triangles are drawn as separate diagrams placed next to each other, each with its own copy of the three vertex labels.

**Best for:** Reading edge labels clearly. Each triangle's baton-pass heuristics ("Hacking and Improvisation," "People over process," etc.) can be annotated without crowding. Good for introducing the two triangles independently before combining them.

**Limitation:** Hides the spatial relationship between Exit and Voice archetypes — the 2×2 position and diagonal mirror logic are invisible. Does not show switching crises.

### Mode 3: Mirrored on the 2×2 (Death and Taxes)

**Source:** Developed in theory dialogue (Sessions 12–13). The master representation.

Both triangles are placed on the Death and Taxes 2×2 (Y = Temporal Horizon, X = Scarcity Structure), reflected across the main diagonal (the Turnpike). Exit occupies the upper-left half (above diagonal), Voice occupies the lower-right half (below diagonal). Co-located archetypes at shared quadrant corners are shown as nearby but distinct points, offset to opposite sides of the diagonal.

**Best for:** Showing the full spatial logic of the model — archetype positions relative to Death/Life/Taxes/Play axes, the Turnpike, switching crisis arrows, Model 12 edge emotions, and the tiling property. The canonical representation for the test results page and theory exposition.

**Limitation:** Requires familiarity with the 2×2 axes to read. The different rotation directions of the triangles (both appear CCW on the 2×2 because the Voice triangle is reflected) are less intuitively obvious than in Mode 1.

### Use Case Guide

| Context | Recommended mode |
|---|---|
| Introducing the model (first explanation) | Mode 2 (side by side) |
| Showing ethics-space mirror symmetry | Mode 1 (nested) |
| Full theory exposition / slide deck | Mode 3 (2×2) |
| Switching crisis arrows | Mode 3 (2×2) |
| Edge label / baton-pass heuristics | Mode 2 (side by side) |
| Animation: Exit→Voice full cycle | Mode 1 or Mode 2 |
| Test results page | Mode 3 (2×2) |

### Notes for Refinement

- All three modes should use consistent color conventions: Exit = red, Voice = green, retreat emotions = red labels, approach emotions = green labels.
- The Turnpike diagonal is only visible in Mode 3.
- Edge labels (Mode 2) and emotion labels (Mode 3) are complementary — consider a hybrid that shows both, or a toggle/animation that transitions between modes.
- Mode 1 (nested) is the most historically authentic but least legible. May be most useful as an animation frame showing the two triangles "unfolding" into Mode 2 or "folding onto" the 2×2 for Mode 3.
- Visual depiction rules (line weights, arrow styles, crisis energy encoding, font sizes, etc.) are specified in the geometric spec below. Once diagrams are built (Theory Track item 4), update use-case recommendations accordingly.
- Once the mathematical framework (Theory Track item 2) is complete, each mode should be derived as a formal projection of the graph model. See `ROADMAP.md` Theory Track item 3.

---

## Part II: Geometric Specification

---

## 1. The Canonical Coordinate System

The master 2×2 is drawn as a standard Cartesian plane with two axes:

- **X-axis (horizontal):** Scarcity structure. **Taxes** at left (negative), **Play** at right (positive).
- **Y-axis (vertical):** Temporal Horizon. **Death** at bottom (negative), **Life** at top (positive).

In normalized coordinates, the four quadrant corners are at:

| Quadrant | (X, Y) | Archetype(s) |
|---|---|---|
| Life/Play (upper-right) | (+1, +1) | Hacker, Investigator |
| Life/Taxes (upper-left) | (−1, +1) | Contrarian |
| Death/Taxes (lower-left) | (−1, −1) | Legalist, Holy Warrior |
| Death/Play (lower-right) | (+1, −1) | Operator |

The axes cross at the origin (0, 0). The full diagram is a square spanning (−1, −1) to (+1, +1).

**In SVG pixel coordinates** (Y-axis flipped — SVG origin is top-left): if the canvas is W×H pixels with margins, map as:

```
svg_x = margin + (normalized_x + 1) / 2 * content_width
svg_y = margin + (1 - normalized_y) / 2 * content_height
```

A typical working canvas: 500×500px, 60px margin on all sides gives content 380×380px.

---

## 2. Archetype Vertex Positions

Two quadrants are shared by two archetypes each. In the diagram, co-located archetypes are shown as **two nearby but distinct points**, slightly offset from each other and from the exact quadrant corner. This offset serves two purposes: (1) it makes the two triangles visually distinct, and (2) it creates space for the switching-crisis arrows between them.

**Recommended offsets** (in normalized coordinates, before SVG mapping):

| Archetype | Canonical position | Offset direction |
|---|---|---|
| Hacker | Life/Play (+1, +1) | Slightly toward Taxes (left) — toward (0.75, 0.85) |
| Investigator | Life/Play (+1, +1) | Slightly toward Death (down) — toward (0.90, 0.70) |
| Contrarian | Life/Taxes (−1, +1) | Sole occupant — place at (−0.80, 0.80) |
| Legalist | Death/Taxes (−1, −1) | Slightly toward Play (right) — toward (−0.75, −0.80) |
| Holy Warrior | Death/Taxes (−1, −1) | Slightly toward Death (down) — toward (−0.88, −0.90) |
| Operator | Death/Play (+1, −1) | Sole occupant — place at (0.80, −0.80) |

*Note: the exact offsets are a visual judgment call. The key constraints are: (a) both co-located points must be clearly within their shared quadrant, (b) the switching-crisis arrows between them must be visible, (c) neither triangle should look degenerate.*

---

## 3. The Two Triangles as Cycle Graphs

Each triangle is a **directed 3-vertex cycle graph** with a main direction and a reverse direction. The vertices are named by their ethics role, bound to specific archetypes.

### Data structure

```
Triangle {
  id:                    "exit" | "voice"
  color:                 red (#8c3a3a) | green (#3a7a4a)

  // Vertices named by ethics role, bound to archetype
  consequentialist:      Archetype      // Goals vertex
  virtue:                Archetype      // Values vertex
  deontological:         Archetype      // Processes vertex

  // Directed cycle — main institutional sequence
  main_cycle:            [deont → conseq → virtue → deont]  // or reverse, see below
  reverse_cycle:         opposite of main_cycle

  // Chirality when drawn with ethics vertices at CANONICAL positions
  // (Consequentialist top, Virtue bottom-left, Deontological bottom-right)
  fundamental_chirality: "ccw" | "cw"
}
```

### Exit Triangle (red)

```
exit_triangle = {
  id: "exit",
  consequentialist: Contrarian,   // Life/Taxes
  virtue:           Legalist,     // Death/Taxes
  deontological:    Hacker,       // Life/Play

  main_cycle:   [Hacker → Contrarian → Legalist → Hacker]
  // i.e.: deont → conseq → virtue → deont

  fundamental_chirality: "ccw"
  // Proof: with Conseq at top (0,1), Virtue at bottom-left (-0.87,-0.5),
  // Deont at bottom-right (0.87,-0.5):
  // Hacker(0.87,-0.5) → Contrarian(0,1) → Legalist(-0.87,-0.5) → back
  // traces counterclockwise ✓
}
```

### Voice Triangle (green)

```
voice_triangle = {
  id: "voice",
  consequentialist: Operator,      // Death/Play
  virtue:           HolyWarrior,   // Death/Taxes
  deontological:    Investigator,  // Life/Play

  main_cycle:   [Investigator → HolyWarrior → Operator → Investigator]
  // i.e.: deont → virtue → conseq → deont  ← NOTE: different order from Exit!

  fundamental_chirality: "cw"
  // Proof: with same canonical positions:
  // Investigator(0.87,-0.5) → HolyWarrior(-0.87,-0.5) → Operator(0,1) → back
  // traces clockwise ✓
}
```

### Why different chirality

Both cycles start at the Deontological vertex, but go to **different** second vertices:
- Exit: Deont(Hacker) → **Conseq**(Contrarian) — goes to the top vertex first → CCW
- Voice: Deont(Investigator) → **Virtue**(HolyWarrior) — goes to the bottom-left vertex first → CW

Same starting point, opposite rotations. The difference encodes a real theoretical asymmetry: the Exit cycle leads with consequentialist philosophy (the Contrarian justifies the Hacker's rule-breaking), while the Voice cycle leads with virtue recovery (the Holy Warrior invokes lost values from the Investigator's evidence).

### The reflection that makes both CCW in the 2×2

The 2×2 has a **mirror symmetry across the main diagonal (y = x)**. Exit occupies the upper-left half (y > x); Voice occupies the lower-right half (y < x). The lower-right half is the reflection of the upper-left half across y = x.

Reflection across y = x sends (x, y) → (y, x). Applying this to Exit's vertices:

| Exit vertex | Position | Reflected position | Voice vertex |
|---|---|---|---|
| Contrarian (Conseq) | (−1, +1) → Life/Taxes | (+1, −1) → Death/Play | Operator (Conseq) |
| Legalist (Virtue) | (−1, −1) → Death/Taxes | (−1, −1) → Death/Taxes | Holy Warrior (Virtue) |
| Hacker (Deont) | (+1, +1) → Life/Play | (+1, +1) → Life/Play | Investigator (Deont) |

The reflection maps Exit exactly onto Voice. Because reflection reverses chirality (CCW → CW, CW → CCW), and Voice has fundamental CW chirality, the reflection cancels it: **reflected Voice appears CCW in the 2×2**, matching Exit. Both triangles look counterclockwise in the 2×2 diagram — not because they have the same fundamental chirality, but because the mirror geometry of the 2×2 cancels Voice's inversion. Like a left hand reflected in a mirror looks like a right hand.

### Handedness and felt direction

Exit and Voice people are like right-handed and left-handed people. Their fundamental chirality is their "handedness" — the direction of cycle traversal that feels natural.

- **Exit people are right-handed (CCW).** Following H→C→L feels natural: Deont→Conseq→Virtue is their native sequence.
- **Voice people are left-handed (CW).** Following I→HW→O feels natural: Deont→Virtue→Conseq is their native sequence.

In the 2×2, both cycles appear CCW (because the diagonal reflection converts left to right, as a mirror does). But the *felt* wrongness when an Exit person is asked to operate in Voice mode (or vice versa) is not about the visual appearance — it is about the underlying ethics-vertex traversal order being mirrored. The first step from the Deontological vertex goes to the opposite neighbor. That is the experienced dissonance.

This is what the deck's center arrows mean: *"Feels natural to exit bias people, feels wrong to voice bias people"* and vice versa. Both refer to the fundamental chirality, not the rendered direction.

### Rendering model

```
render_triangle(triangle, context, flip=false):

  context = "side_by_side":
    // Ethics vertices at canonical positions (Conseq top, Virtue BL, Deont BR)
    // Respect fundamental chirality: Exit appears CCW, Voice appears CW
    // Use this when showing the triangles as independent ethics diagrams
    positions = canonical_ethics_positions
    effective_chirality = triangle.fundamental_chirality

  context = "2x2":
    // Voice triangle is placed in the reflected (lower-right) half of the 2x2
    // This automatically cancels Voice's CW chirality → both appear CCW
    // Do NOT manually flip the Voice triangle — the placement does it for you
    positions = 2x2_archetype_positions  // Exit upper-left, Voice lower-right
    effective_chirality = "ccw"  // for both, due to reflection
```

### Edge ownership

Each triangle "owns" two of the four outer edges of the 2×2. The diagonal (Turnpike) is the shared edge and carries no transition emotions.

| Triangle | Owned edges | Transition emotions |
|---|---|---|
| Exit | Top (Life/Play ↔ Life/Taxes) + Left (Life/Taxes ↔ Death/Taxes) | Cynicism/Curiosity, Resignation/Restlessness |
| Voice | Bottom (Death/Taxes ↔ Death/Play) + Right (Death/Play ↔ Life/Play) | Guilt-Shame/Anger, Fear/Doubt |

---

## 4. The Tiling Property and the Diagonal as Mirror Axis

### Tiling

The two triangles together tile the entire 2×2 square with no overlap and no gaps, divided by the main diagonal (y = x):

- **Exit triangle = above the diagonal (y > x)** — the half containing Life/Taxes
- **Voice triangle = below the diagonal (y < x)** — the half containing Death/Play
- **The diagonal itself is the neutral Turnpike watershed** — no archetype sits exactly on it

Every interior point of the 2×2 belongs to exactly one triangle. Points on the diagonal (y = x) are on the boundary of both.

**Visual implication:** semi-transparent triangle fills should meet cleanly at the diagonal, together covering the entire square. The diagonal itself may be drawn as a distinct line (dashed or accent-colored) to make the watershed visible.

### The diagonal as a reflection axis

The diagonal y = x is not just a geometric boundary — it is an active **mirror axis** with theoretical content:

- A point (x, y) above the diagonal (y > x) has **Life > Play** — the temporal axis dominates the scarcity axis
- A point (x, y) below the diagonal (y < x) has **Play > Life** — the scarcity axis dominates
- On the diagonal (y = x): Life = Play, perfectly balanced — this is the Turnpike, the growth path

This is the sense in which Exit archetypes are "Life-biased" and Voice archetypes are "Play-biased" at a structural level. The diagonal encodes the balance point.

### Archetype positions relative to the diagonal

All archetypes are offset orthogonally from the diagonal — none sits on it. The offset is what assigns them to Exit (above) or Voice (below):

| Archetype | 2×2 corner | Side of diagonal | Bias |
|---|---|---|---|
| Hacker | Life/Play | Above (y > x) | Life > Play |
| Investigator | Life/Play | Below (y < x) | Play > Life |
| Contrarian | Life/Taxes | Above (maximally: y−x = 2) | Maximally Life-biased |
| Legalist | Death/Taxes | Above (slightly: near (−1,−1)) | Life > Play (slightly) |
| Holy Warrior | Death/Taxes | Below (slightly: near (−1,−1)) | Play > Life (slightly) |
| Operator | Death/Play | Below (maximally: y−x = −2) | Maximally Play-biased |

Contrarian and Operator are the **maximum-offset archetypes** — farthest from the diagonal on opposite sides. They are the exclusive vertices of their triangles and the most purely Exit/Voice respectively.

---

## 5. The Main Diagonal: The Turnpike

The diagonal from Death/Taxes (lower-left) to Life/Play (upper-right) is the single most important line in the model. It serves three roles simultaneously:

1. **Shared edge** of the two triangles — the structural seam between Exit and Voice
2. **Turnpike of maximal growth** (Model 13) — the axis of institutional vitality; movement along it is the ideal growth trajectory for both archetypes
3. **Location of the switching crises** — the two shared quadrants (Life/Play at upper-right end, Death/Taxes at lower-left end) are where inter-triangle switches happen

**Anti-diagonal** (Life/Taxes upper-left → Death/Play lower-right): this line is NOT drawn explicitly in any model, but it is the axis connecting the two "exclusive" archetypes (Contrarian and Operator). It runs perpendicular to the Turnpike and can be thought of as the axis of institutional rigidity — the position furthest from the generative hinge.

---

## 6. Ethics Vertex Mapping

The two triangles come from the "Interesting Times Triangle" — an ethics triangle with three vertices: **Goals (Consequentialist)**, **Values (Virtue)**, **Processes (Deontological)**.

Each triangle preserves this vertex structure, but the mapping from ethics-vertex to Death-and-Taxes position is **different for Exit vs Voice**:

| Ethics vertex | Exit archetype | D&T position | Voice archetype | D&T position |
|---|---|---|---|---|
| Goals / Consequentialist | Contrarian | Life/Taxes | Operator | Death/Play |
| Values / Virtue | Legalist | Death/Taxes | Holy Warrior | Death/Taxes |
| Processes / Deontological | Hacker | Life/Play | Investigator | Life/Play |

Observations:
- The **Virtue** vertex maps to the **same** Death/Taxes quadrant for both triangles. This is why Legalist and Holy Warrior co-locate there — they are the Virtue archetypes of their respective triangles, and Virtue maps to Death/Taxes in both.
- The **Deontological** vertex maps to the **same** Life/Play quadrant for both triangles. This is why Hacker and Investigator co-locate there.
- The **Consequentialist** vertex maps to **opposite** corners: Life/Taxes (Contrarian) vs Death/Play (Operator). These are the anti-diagonal pair — the "exclusive" archetypes.

**Implication for the side-by-side triangle diagram:** the two triangles look like mirror images when drawn side-by-side with Goals at top, Values at bottom-left, Processes at bottom-right — because they have the same internal ethics structure. But on the 2×2 they are rotated differently: the Exit triangle's top vertex (Goals/Contrarian) is at Life/Taxes (upper-left), while the Voice triangle's top vertex (Goals/Operator) is at Death/Play (lower-right). The triangles are the same shape, differently rotated.

---

## 7. The FoTW (Falling off the Wagon) Diagram

The full FoTW diagram superimposes all elements on the 2×2. Drawing order (back to front):

1. **Axes** — draw first, light gray
2. **Triangle fills** — semi-transparent: Exit = red tint (upper-left half), Voice = green tint (lower-right half)
3. **Triangle edges** — solid colored lines: Exit edges red, Voice edges green
4. **Main diagonal** — can be shown as a dashed or dotted line to distinguish it from the outer edges, or left implied by the triangle edges
5. **Emotion labels** — on the four outer edges (not the diagonal), each edge has two labels, one per direction. Typically: retreat label in red, approach label in green
6. **Archetype nodes** — small circles at each vertex position, colored by triangle (red=Exit, green=Voice). At shared quadrants, two circles very close together
7. **Switching crisis arrows** — two-color arrows at each shared quadrant corner (see Section 9)
8. **Corner emotion labels** — at Life/Play and Death/Taxes corners
9. **Axis labels** — Life/Death/Taxes/Play

### FoTW Emotions variant
Same as above but with emotion arrows on the edges. The four outer edges have arrows showing movement direction:
- Top edge (Hacker↔Contrarian): two arrows, opposite directions — red pointing left (Cynicism/retreat), green pointing right (Curiosity/approach)
- Left edge (Contrarian↔Legalist): red pointing down (Resignation), green pointing up (Restlessness)
- Bottom edge (Legalist↔Operator): green pointing right (Anger/approach), red pointing left (Guilt-Shame/retreat)
- Right edge (Operator↔Investigator): two arrows — Fear (downward, **red** = retreat) and Doubt (upward, **green** = approach). Same color convention as all other pairs. Fear = retreat from Life/Play toward mortality. Doubt = approach, the courage to live without certainty; constructive precursor to breaking out of finite-game orientation.

---

## 8. Switching Crisis Arrows

At each shared quadrant, two short arrows connect the two co-located archetype nodes, pointing in opposite directions. Each arrow has a **two-color** stem+arrowhead: stem color = source triangle, arrowhead color = destination triangle.

### Crisis energy weights

| Weight | Category | Transitions |
|---|---|---|
| **LOW** | Intra-triangle edge movement (Model 12 emotions) | All 8 edge emotions |
| **MEDIUM** | Corner switches at shared quadrants | H↔I (Deontological), L↔HW (Virtue) |
| **HIGH** | Anti-diagonal switch between Consequentialist archetypes | C↔O |

LOW transitions are minor crises, not existential. MEDIUM transitions are genuine triangle switches with proximate landing points (one axis difference). HIGH transitions cross both axes with maximum accumulated-commitment archetypes — more to let go of.

### Confirmed switches (MEDIUM energy)

| Switch | Stem color | Arrowhead color | Crisis energy | Trigger emotion |
|---|---|---|---|---|
| Investigator → Hacker | Green (Voice) | Red (Exit) | MEDIUM | Experiencing Disillusionment |
| Hacker → Investigator | Red (Exit) | Green (Voice) | MEDIUM | Experiencing Responsibility |
| Holy Warrior → Legalist | Green (Voice) | Red (Exit) | MEDIUM | Experiencing Absurdity |
| Legalist → Holy Warrior | Red (Exit) | Green (Voice) | MEDIUM | Experiencing Awe |

**Drawing note:** the two arrows at each corner should be visually distinct — slight offset so both are visible. The arrowheads should be the dominant visual element since the destination is what matters. Draw as two slightly curved arcs rather than straight lines to prevent total overlap.

---

### Contrarian ↔ Operator: the anti-diagonal switch (HIGH energy, multipath)

**Hypothesis A confirmed (working model):** C↔O requires genuinely higher crisis energy than H↔I or L↔HW. Both archetypes carry maximum accumulated commitment — long-horizon plans, scar tissue, ends-justify-means reasoning embedded. The anti-diagonal crossing (differing on *both* axes) reflects structural depth of commitment, not merely visual distance.

**Hypothesis B retained as minority view:** In the side-by-side ethics triangle, C and O sit at the same Consequentialist vertex — the 2×2 distance may overstate the difficulty. Not resolved.

**Multiple crisis pathways confirmed for C → O:**
1. **Experiencing Burnout** — non-ideological; exhaustion drives switch to relief of operator mode
2. **Finding Religion** — genuine ideological abandonment; rare, most coherent
3. **Self-Delusion** — "reform from within" denial; least stable, may flip back

**O → C pathways not yet fully mapped.** Provisional label: *"Experiencing Loss of Faith."*

**Drawing the C↔O arrows:**
- In the 2×2: draw along (or near) the anti-diagonal, two-color style. C→O: red stem/green head. O→C: green stem/red head.
- In the side-by-side triangle: both C and O occupy the same Consequentialist vertex — draw as a self-loop or very short arc at that vertex.
- Emotion labels: omit or annotate as "(multipath)" for C→O; use "Loss of Faith?" (with question mark) for O→C until resolved.
- Visual weight: consider thicker stroke or dashed style to signal higher energy relative to MEDIUM switches.

---

## 9. Self-Actualization Diagram

A 2×2 variant with three additional elements drawn on top of the axes:

1. **Turnpike line** — a diagonal arrow from lower-left to upper-right, labeled "Turnpike of maximal growth". Style: solid, accent color (orange/brown), with arrowhead at the Life/Play end.
2. **Disruptors arrow** — from the Life/Play area, pointing leftward (toward Life/Taxes). Label: "Falling off the wagon (Disruptors)". Color: Exit/red.
3. **Reformers arrow** — from the Life/Play area, pointing downward (toward Death/Play). Label: "Falling off the wagon (Reformers)". Color: Voice/green or blue.
4. **Finite game contours** — a family of curved lines in the lower-left portion of the diagram, roughly parallel to the Turnpike but offset to lower-left. These represent "distance from the Turnpike" — points equidistant from the diagonal. Can be drawn as smooth arcs: if the Turnpike is `y = x` (in normalized coords), the contours are `y = x - c` for various positive `c`, clipped to the square.

---

## 10. The Side-by-Side Triangle Diagram

Used when explaining the ethics structure without the Death-and-Taxes 2×2 context. Draw two equilateral (or isoceles) triangles side by side, left-right:

**Left triangle (Exit, red):**
- Top vertex: **Contrarian** — label: "Consequentialist Ethics" below archetype name
- Bottom-left vertex: **Legalist** — label: "Virtue Ethics"
- Bottom-right vertex: **Hacker** — label: "Deontological Ethics"
- Edge labels (on the edge sides, not the vertices):
  - Left edge (Contrarian→Legalist): *"Courage to quit"* (Eg. Seth Godin)
  - Right edge (Hacker→Contrarian): *"Hacking and Improvisation"*
  - Bottom edge (Legalist→Hacker): *"Innocent until proven guilty"* (legal system, due process)
- Rotation indicator: counterclockwise arrow at center (or near top vertex)
- Triangle label: **"Exit Bias ('Left-minded')"**

**Right triangle (Voice, green):**
- Top vertex: **Operator** — label: "Consequentialist Ethics"
- Bottom-left vertex: **Holy Warrior** — label: "Virtue Ethics"
- Bottom-right vertex: **Investigator** — label: "Deontological Ethics"
- Edge labels:
  - Left edge (Operator→Holy Warrior): *"Be somebody or do something"* (Eg. John Boyd)
  - Right edge (Investigator→Operator): *"Systems over Goals"* (Eg. Scott Adams)
  - Bottom edge (Holy Warrior→Investigator): *"People over process"* (Eg. Agile manifesto)
- Rotation indicator: counterclockwise arrow at center (this will appear clockwise when the triangle is mirrored, which is the "felt" clockwise for Voice people — see rotation note in Section 3)
- Triangle label: **"Voice Bias ('Right-minded')"**

**Center between the triangles:** two rotation-circle arrows indicating the felt direction paradox:
- Green clockwise: *"Feels natural to voice bias people, feels wrong to exit bias people"*
- Red counterclockwise: *"Feels natural to exit bias people, feels wrong to voice bias people"*

---

## 11. Color Conventions

| Element | Color | Hex |
|---|---|---|
| Exit / Hacker / Contrarian / Legalist | Deep red | `#8c3a3a` |
| Voice / Investigator / Holy Warrior / Operator | Deep teal-green | `#3a7a4a` |
| Approach direction (getting back on) | Same green | `#3a7a4a` |
| Retreat direction (falling off) | Same red | `#8c3a3a` |
| Fear / Doubt arrows | Deep blue | `#3a4a8c` |
| Turnpike / accent | Warm orange-brown | `#c0713a` |
| Axes, grid | Mid-gray | `#888888` |
| Triangle fill (Exit) | Red tint | `rgba(140,58,58,0.08)` |
| Triangle fill (Voice) | Green tint | `rgba(58,122,74,0.08)` |
| Background | Warm off-white | `#f4f1eb` |
| Card / panel | White | `#ffffff` |
| Text | Near-black | `#2c2c2c` |
| Secondary text | Warm gray | `#6b6459` |

**Fear and Doubt use the same color convention as all other pairs** — red for retreat, green for approach. There is no special blue case. The right edge (Death/Play ↔ Life/Play) is structurally the same as the other three edges.

- **Fear (red, retreat — Life/Play → Death/Play):** The H/I archetype starts treating life as finite. Mortality presses in, the infinite game collapses into a finite one, and they slide toward Operator mode. Fear is what makes the myopic process-player suddenly aware of stakes.
- **Doubt (green, approach — Death/Play → Life/Play):** The Operator loosens their hedgehog certainty and re-enters the open-ended game. The capacity to entertain doubt without resolving it is courage — the courage to play without a terminal condition. Doubt as approach emotion: not weakness but the precondition for Life/Play orientation.

The other approaches to handling doubt:
- Consequentialist long-term planning (Contrarian) and virtue/deontological philosophizing (Legalist, HW) are *attempts to control doubt* — imposing enough certainty on the future or on moral reality that the open-ended game doesn't have to be faced.
- H/I bypass this entirely. Their myopia means the existential implications of doubt don't fully register. Or, in the Very Zen case, they've made peace with casually living in doubt — not resolution, not suppression, just indifference to the need for certainty.

---

## 12. Diagram Inventory

| Diagram | Description | Where used |
|---|---|---|
| **Master 2×2 (blank)** | Axes only, no quadrant content | Opening slide; template for all sub-models |
| **Two triangles (side-by-side)** | Exit and Voice as separate ethics triangles with edge labels | Theory deck slide 3 |
| **FoTW Archetypes** | Both triangles on 2×2, archetype nodes, switching crisis arrows | Theory deck slide 4 |
| **FoTW Emotions** | Both triangles on 2×2, emotion labels on edges, corner emotions | Theory deck slide 5 |
| **Models 1–13 (2×2 grids)** | Quadrant content grids; no triangle overlay | Theory deck slides 6–17 |
| **Self-Actualization** | 2×2 with Turnpike diagonal, Disruptors/Reformers arrows, finite game contours | Theory deck slide 19 |
| **Transitions (table)** | Not a 2×2 — a 4-row table showing edge emotions | Theory deck slide 17 |

---

## 13. Known Visual Ambiguities (Open Questions)

- **Switching crisis arrow style:** straight lines with two-color segments, or curved arcs? Curved avoids overlap but harder to read the color split. C↔O arrows (anti-diagonal, HIGH energy) should have a visually distinct weight (thicker or dashed) from MEDIUM switches.
- **C↔O emotion labels:** C→O is multipath (Burnout / Finding Religion / Self-Delusion) — no single label fits. O→C is "Loss of Faith?" (provisional). Leave blank or annotate as "(multipath)" in diagrams for now.
- **Diagonal visibility:** should the Turnpike diagonal be explicitly drawn on the FoTW diagrams, or left implied by the triangle edges? (The two triangle edges that coincide with the diagonal already draw it twice — once red, once green — which may be enough.)
- **Felt rotation direction:** the counterclockwise/clockwise paradox (Section 3) is conceptually important but visually confusing. The center arrows in the side-by-side diagram are the current solution; a note or tooltip may work better in an HTML context.
- **Archetype node shape:** circles used currently. Could also use colored dots with text labels outside, or small archetype icons.
