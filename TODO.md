# Quadrantology — Manual To-Do

Items that require manual action outside of a Claude Code session (CF dashboard, Stripe, DNS, content review, etc.).

---

## Pending

### Research goal: synchronize theory ↔ test inventory ↔ synperson narratives

The three components of the research system need to be coherent with each other. Currently they have drifted:
- **Theory** (archetype definitions, ethics dimension meanings) is partially documented but not fully formalized
- **Test inventory** (questions in D1, both live and calibrating) was written over time and may encode implicit assumptions that don't match the current theory
- **Synperson narratives** (rig.yaml profiles, events.md diaries) were written from the narrative archetype descriptions, which themselves may not align with what the question weights actually measure

The synperson panel is the research instrument for detecting and closing these gaps — a well-constructed persona should reliably score its assigned archetype. Low hit rates are a signal of incoherence somewhere in the triangle.

**Audit to-do: question inventory alignment**

Review all questions — live and calibrating — against the theoretical definitions of each dimension:
- Does each question cleanly discriminate the dimension it's tagged to?
- Are there questions that are theoretically ambiguous (could be answered consistently by multiple archetypes)?
- Are the E/V questions encoding Exit-as-restlessness and Voice-as-outrage, or are some using folk definitions (Exit = leaving a job, Voice = speaking up) that don't match?
- Are the virtue questions encoding mimetic ethics (both modes: HW's exemplar-following and Legalist's codifying)? Or just one mode?
- Are the deontological questions encoding behavioral self-definition (act-defines-belief), or drifting toward rule-following?
- Are the consequentialist questions encoding goal-driven pragmatism, or drifting toward mere analysis?

Do this audit *after* the theory dialogue session, when the dimension definitions are crisp. Use the synperson QA hit-rate results as a diagnostic tool: if a particular archetype is systematically missed, look for questions that are producing false signal for that archetype.

**Implicit E/V bias in pure-ethics questions**

Questions that only score on ethics dimensions (no E/V weight) may still have an implicit E/V bias — the tension between the two options may be more legible or emotionally natural to one side of the E/V axis than the other. Example: a C vs D question framed around "ruthless efficiency vs. principled craft" encodes a Contrarian/Hacker tension. It may not feel like a real dilemma to an Operator or Investigator — they pick an answer but it's noise, not signal.

Two-part fix:
1. **Acknowledge the bias explicitly**: add a small same-direction E/V weight (e.g. `[0.1, 0, 0, 1, 0]` / `[0.1, 0, 0, 0, 1]`) to both options of a question that is implicitly Exit-biased. This makes the bias visible in the data model rather than invisible in the question text.
2. **Write mirror questions**: for each biased C/D question, write a companion question that poses the *same* C vs D distinction but from a Voice perspective — so the Operator/Investigator tension is the one being probed. Balance the pool: Exit-biased C/D questions and Voice-biased C/D questions should appear in roughly equal numbers.

Same logic applies to V/D and V/C questions. Check whether any virtue questions are implicitly Exit-biased (Legalist/Hacker tension) or Voice-biased (Holy Warrior/Investigator tension) and apply the same treatment.

This is a question-bank design principle: **every ethics-only question should have a named E/V home**, and the pool should be balanced across homes so no archetype is systematically underserved by the question inventory.

### Theory dialogue — Approach Mode / Retreat Mode

From the slide deck: "Approach Mode: You are running toward life. Retreat Mode: You are running away from life." Not yet explained. Needs a dedicated dialogue session to work out how this maps onto the archetypes and the Death and Taxes 2x2. Is this a per-archetype disposition, a situational state, or something else?

---

### Theory dialogue — ethics dimension definitions

Have a dedicated session to map out the full theoretical grounding of the three ethics dimensions before writing behavioral anchor text (Track D/B). Known starting points:

- **Virtue** = mimetic ethics: moral development through emulating idols and exemplars. You become good by watching and imitating good people, not by reasoning about rules or consequences.
- **Deontological** = behavioral ethics: morality is embodied in how you act, not in outcomes or models. Hackers and Investigators define themselves by their behaviors — the right way to do things is intrinsically important, independent of goals or idol-proximity.
- **Consequentialist** = goal ethics: the moral weight is in outcomes. Contrarians and Operators evaluate actions by what they achieve.

Further refinement on virtue: there are two modes within virtue ethics that align with the E/V split.
- **Holy Warrior (Voice + Virtue)** = mimetic virtue: emulate specific exemplars; reform the institution back toward those models. Points at people.
- **Legalist (Exit + Virtue)** = codifying virtue: extract principles from (possibly implicit) models and crystallize them into abstract frameworks that define good/bad. Think constitution-drafters, bill-of-rights scholars — they may draw on Locke or Montesquieu but the output is a normative code, not "be like Jefferson." The Legalist completes the exit cycle: Hacker subverts a rule → Contrarian philosophizes the subversion → Legalist codifies it into the new canonical definition of "good."

Questions to explore: how does the mimetic/behavioral/goal split interact with the Exit/Voice axis? Are there canonical thinkers or traditions that map cleanly to each cell? Does the Hirschman Exit/Voice framing have a natural ethics theory complement? What does this imply about how each archetype talks about *failure* — idol-betrayal (virtue), wrong-method (deont), or missed-target (conseq)? How does the codifying/mimetic virtue split show up in test answers — is it detectable, or is the E/V axis doing all the work there?

### Activate research + admin features (CF Pages dashboard)
After the session 3 deploy, two manual steps are needed before the admin UI and research scaffolding work on staging:

1. Run D1 schema migrations:
   ```bash
   wrangler d1 execute quadrantology --file=worker/schema.sql --remote
   wrangler d1 execute quadrantology --file=worker/seed-questions.sql --remote
   ```
2. In CF Pages → Settings → Environment variables, add:
   - `ADMIN_PUBLIC_KEYS` (plain) — base64url SPKI public key(s), generated via the key setup flow on `/admin/questions`
   - `ADMIN_TOKEN_SECRET` (secret) — at least 32 bytes random entropy: `openssl rand -base64 32`


### Create first canonical model snapshot

Create `docs/data/quadrantology-model-v1.json` — the CC BY 4.0 published model file for v1. Steps:
1. Ensure questions are seeded in D1 (`worker/seed-questions.sql`)
2. From the admin page, trigger the model snapshot procedure: snapshot questions table → insert into `scoring_models` → creates the JSON blob
3. Download and save as `docs/data/quadrantology-model-v1.json`
4. Run `git tag model-v1` and push with tags
5. Confirm `protocol.json` `model_version` is set to 1

---

### Synperson panel — improve archetype hit rate, then first logged run

1. ~~**Write event histories**~~ — ✅ Done (Session 10).
2. ~~**Build `scripts/synperson/` suite**~~ — ✅ Done (Session 11): all 6 scripts written and syntax-verified.
3. ~~**First QA run pass**~~ — ✅ Done (Session 11): 6/30 matched (20%). Pipeline functional; hit rate needs work.
4. **Track D — Write behavioral anchor text** — For each archetype, write a `behavioral_stance` block derived from the question-weight analysis (see Session 11 devlog). This is the foundation for Tracks B and C. Key signatures: Exit = restless/bored-driven, leaves toxic situations, principles over friends, mission-first, first-principles thinking. Voice = anger/outrage-driven, stays and cleans up toxic situations, loyalty over principles, community-first, narrative thinking. Virtue = exemplar-following, reflective, apolitical. Consequentialist = ends-justify-means, politically engaged, analytical, present-focused. Deontological = principled hands-on action, self-reliant, concrete first steps, self-challenging.
5. **Track B — Add `behavioral_stance` to rig.yaml** — Update `_rig_schema.yaml` schema, then add the appropriate anchor text to all 30 `rig.yaml` files. Redesign `run-test.py` prompt to surface `behavioral_stance` before event summary.
6. **Track A — Memory model tuning** — Change defaults in `run-test.py`/`run-panel.py`: `intensity_floor` 8→6, `alpha` 0.5→0.2, `max_events` 10→12. Remove 4-relationship cap.
7. **Track C — Events response beats** — Audit all 30 `events.md` files. Fix events that show the wrong archetype's behavioral response. Add reaction beats: Exit personas should disengage/leave in response to toxic situations; Voice personas should stay and push back.
8. **Apply D1 schema migration** — Run after synperson tables confirmed in `worker/schema.sql`:
   ```bash
   wrangler d1 execute quadrantology --file=worker/schema.sql --remote
   ```
9. **Seed synperson profiles to D1** — `python3 scripts/synperson/sync-to-d1.py`
10. **First logged run pass** — `python3 scripts/synperson/run-panel.py --logged`; target ≥50% archetype match.
11. **Public synperson page** — `docs/synpersons.html`: panel overview + per-synperson cards.

---

## Go-Live Checklist (when ready)

- [ ] DNS cutover: point `quadrantology.com` to Cloudflare Pages, disable GitHub Pages
- [ ] Create Stripe live-mode product + price
- [ ] Update CF env vars: `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `STRIPE_WEBHOOK_SECRET` (live values)
- [ ] Update Stripe webhook URL to `quadrantology.com/api/stripe-webhook`
- [ ] Test with a real card on production domain

---

## Done

- **D1 schema migrations applied** — `schema.sql` (with `question_sequences`, `times_sampled`, `last_sampled_at`, `draft` status) executed remotely via wrangler
- **Admin UI activated** — `ADMIN_PUBLIC_KEYS` and `ADMIN_TOKEN_SECRET` set in CF Pages env vars; ECDSA keypair generated in browser; auth working
- **Zero-weight questions fixed** — Q011 answer A and Q023 answer B weights corrected in D1 (via admin UI) and in `docs/data/questions.json` on both `master` and `gh-pages`
