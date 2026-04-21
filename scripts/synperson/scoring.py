"""
scoring.py — Python mirror of the scoring algorithm in docs/test.html.

Given a list of question records (as returned by /api/sample-questions) and
a parallel list of answers ('a' or 'b'), computes:
  - raw dimension scores [exit, voice, virtue, consequentialist, deontological]
  - ev_bias: 1 (Exit), 2 (Voice), 0 (tied)
  - archetype string (e.g. 'Contrarian', 'Operator')
  - ev_pos: continuous E↔V position (-1 = pure Voice, +1 = pure Exit)
  - ethics proportions {virtue, consequentialist, deontological}

Must stay in sync with computeResults() in docs/test.html.
"""

from __future__ import annotations
from typing import Any


# Archetype tables indexed by ethics dimension winner (virtue=0, conseq=1, deont=2)
EXIT_ARCHETYPES  = ["Legalist", "Contrarian", "Hacker"]
VOICE_ARCHETYPES = ["Holy Warrior", "Operator", "Investigator"]


def score(
    questions: list[dict[str, Any]],
    answers:   list[str],          # 'a' or 'b', parallel to questions
) -> dict[str, Any]:
    """
    Score a completed test run.

    Parameters
    ----------
    questions : question records from /api/sample-questions (or questions.json).
        Each record needs: id, status, weight (float), weights (dict with 'a'/'b'
        keys each mapping to a 5-element list [exit, voice, vt, co, de]).
    answers : list of 'a'/'b' strings, same length and order as questions.

    Returns
    -------
    dict with keys:
        scores        – raw [exit, voice, virtue, consequentialist, deontological]
        ev_bias       – 1 (Exit), 2 (Voice), 0 (tied)
        archetype     – string archetype name (or tie description)
        ev_pos        – float in [-1, +1]
        ethics        – {virtue, consequentialist, deontological} proportions (sum 1.0)
        run           – [{qid, ans}, ...]  (all questions including calibrating)
    """
    if len(questions) != len(answers):
        raise ValueError(
            f"questions ({len(questions)}) and answers ({len(answers)}) must have the same length"
        )

    dims = [0.0, 0.0, 0.0, 0.0, 0.0]  # exit, voice, virtue, consequentialist, deontological
    run  = []

    for q, ans in zip(questions, answers):
        ans = ans.lower().strip()
        if ans not in ("a", "b"):
            raise ValueError(f"Answer must be 'a' or 'b', got {ans!r} for question {q.get('id')}")

        run.append({"qid": q["id"], "ans": ans})

        # Calibrating questions are answered but don't affect the score
        if q.get("status") == "calibrating":
            continue

        qw = float(q.get("weight", 1.0))
        w  = q["weights"][ans]          # 5-element list
        for j in range(5):
            dims[j] += w[j] * qw

    exit_score  = dims[0]
    voice_score = dims[1]

    if exit_score > voice_score:
        ev_bias = 1
    elif voice_score > exit_score:
        ev_bias = 2
    else:
        ev_bias = 0

    ethics = dims[2:5]  # virtue, consequentialist, deontological
    max_eth = max(ethics)
    max_states = [i for i, v in enumerate(ethics) if v == max_eth]

    # Archetype assignment — mirrors test.html exactly
    if len(max_states) == 1 and ev_bias > 0:
        archetype = (EXIT_ARCHETYPES if ev_bias == 1 else VOICE_ARCHETYPES)[max_states[0]]
    elif len(max_states) == 1 and ev_bias == 0:
        archetype = f"{EXIT_ARCHETYPES[max_states[0]]} / {VOICE_ARCHETYPES[max_states[0]]}"
    elif len(max_states) == 2 and ev_bias > 0:
        row = EXIT_ARCHETYPES if ev_bias == 1 else VOICE_ARCHETYPES
        archetype = f"{row[max_states[0]]} / {row[max_states[1]]}"
    else:
        archetype = "No preferred state (high adaptability)"

    ev_total  = exit_score + voice_score
    ev_pos    = (exit_score - voice_score) / ev_total if ev_total > 0 else 0.0

    eth_total = sum(ethics)
    if eth_total > 0:
        ethics_pos = {
            "virtue":         ethics[0] / eth_total,
            "consequentialist": ethics[1] / eth_total,
            "deontological":  ethics[2] / eth_total,
        }
    else:
        ethics_pos = {"virtue": 1/3, "consequentialist": 1/3, "deontological": 1/3}

    return {
        "scores": {
            "exit":            dims[0],
            "voice":           dims[1],
            "virtue":          dims[2],
            "consequentialist": dims[3],
            "deontological":   dims[4],
        },
        "ev_bias":  ev_bias,
        "archetype": archetype,
        "ev_pos":   ev_pos,
        "ethics":   ethics_pos,
        "run":      run,
    }
