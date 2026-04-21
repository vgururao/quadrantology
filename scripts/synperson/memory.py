"""
memory.py — Discounted-sampling memory model for synperson test runs.

Each event has an intensity (1–10) and a narrative date. Salience decays
exponentially with time since the event. High-intensity events always stay
in memory regardless of decay (above intensity_floor). The stochastic
(logged) mode samples from the surviving pool; the deterministic (QA) mode
returns all survivors deterministically.

Default memory_params (can be overridden per synperson in D1):
  alpha           — minimum salience fraction to survive (0–1). Events below
                    alpha * max_salience are dropped before sampling.
  lambda          — daily decay rate (higher = faster forgetting).
                    Default 0.004 ≈ half-life ~173 days.
  intensity_floor — events with intensity >= this are always included
                    regardless of decay.
  max_events      — hard cap on events returned (sampled from survivors).
"""

import math
import random
from datetime import datetime, date
from typing import Any


def _parse_narrative_date(narrative_date: str) -> date:
    """
    Parse narrative_date from events.md header.
    Accepts: 'YYYY-MM', 'YYYY-MM → YYYY-MM', 'YYYY → YYYY', etc.
    Returns the END date of the event (what the synperson has lived through).
    """
    s = narrative_date.strip()
    # Take the last segment if range ('→')
    if '→' in s:
        s = s.split('→')[-1].strip()
    # Year-month
    if len(s) == 7 and s[4] == '-':
        try:
            return date(int(s[:4]), int(s[5:7]), 28)  # end of month approx
        except ValueError:
            pass
    # Year only
    if len(s) == 4:
        try:
            return date(int(s), 12, 31)
        except ValueError:
            pass
    # Fuzzy labels like "Fall 2008", "Christmas week 2001" — extract last 4-digit year
    import re
    m = re.search(r'\b(\d{4})\b', s)
    if m:
        return date(int(m.group(1)), 12, 31)
    raise ValueError(f"Cannot parse narrative_date: {narrative_date!r}")


def salience(
    event: dict[str, Any],
    as_of: date,
    lam: float = 0.004,
) -> float:
    """
    Compute the salience of a single event as of `as_of`.

    salience = intensity * exp(-lambda * days_since_event)

    Days are measured from the event's narrative end date to `as_of`.
    If the event end date is in the future relative to as_of, days = 0
    (the event just happened, full salience).
    """
    end = _parse_narrative_date(event["narrative_date"])
    days = max(0, (as_of - end).days)
    return event["intensity"] * math.exp(-lam * days)


def select_events(
    events: list[dict[str, Any]],
    params: dict[str, Any],
    mode: str = "logged",
    as_of: date | None = None,
    seed: int | None = None,
) -> list[dict[str, Any]]:
    """
    Return the subset of events that should be included in a test run.

    Parameters
    ----------
    events : list of event dicts, each with keys:
        event_key, narrative_date, title, body, intensity
    params : memory_params dict from synperson record:
        alpha, lambda, intensity_floor, max_events
    mode : 'logged' (stochastic) or 'qa' (deterministic)
    as_of : reference date for decay (defaults to today)
    seed : random seed for logged mode (None = truly random)

    Returns
    -------
    Ordered list of events (chronological by narrative_date end).
    """
    if not events:
        return []

    as_of = as_of or date.today()
    lam             = float(params.get("lambda",          0.004))
    alpha           = float(params.get("alpha",           0.5))
    intensity_floor = int(  params.get("intensity_floor", 8))
    max_events      = int(  params.get("max_events",      10))

    # Compute salience for every event
    scored = []
    for ev in events:
        s = salience(ev, as_of, lam)
        scored.append((ev, s))

    if not scored:
        return []

    max_s = max(s for _, s in scored)

    # Separate always-included (above intensity_floor) from candidates
    pinned    = []
    candidates = []
    for ev, s in scored:
        if ev["intensity"] >= intensity_floor:
            pinned.append((ev, s))
        else:
            # Drop if below alpha * max_salience threshold
            if s >= alpha * max_s:
                candidates.append((ev, s))

    if mode == "qa":
        # Deterministic: all survivors, ordered chronologically
        selected = [ev for ev, _ in pinned + candidates]
    else:
        # Stochastic: sample candidates weighted by salience, always keep pinned
        if seed is not None:
            rng = random.Random(seed)
        else:
            rng = random.Random()

        # How many slots remain after pinned events are guaranteed?
        slots = max(0, max_events - len(pinned))

        if slots == 0 or not candidates:
            selected = [ev for ev, _ in pinned]
        else:
            # Weighted sampling without replacement from candidates
            weights = [s for _, s in candidates]
            pool    = [ev for ev, _ in candidates]
            k = min(slots, len(pool))

            # Manual weighted-without-replacement via elimination
            chosen = []
            pool_copy    = list(pool)
            weights_copy = list(weights)
            for _ in range(k):
                if not pool_copy:
                    break
                total = sum(weights_copy)
                r = rng.uniform(0, total)
                cum = 0.0
                for i, (ev, w) in enumerate(zip(pool_copy, weights_copy)):
                    cum += w
                    if r <= cum:
                        chosen.append(ev)
                        pool_copy.pop(i)
                        weights_copy.pop(i)
                        break

            selected = [ev for ev, _ in pinned] + chosen

    # Sort chronologically by narrative end date
    def sort_key(ev: dict[str, Any]) -> date:
        try:
            return _parse_narrative_date(ev["narrative_date"])
        except ValueError:
            return date(1900, 1, 1)

    selected.sort(key=sort_key)

    # Hard cap
    return selected[:max_events]
