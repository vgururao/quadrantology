# Quadrantology Data Model

The app is essentially stateless — no user accounts, no server-side user data. Everything lives in the user's logbook. All feature design should start here.

---

## The Logbook

The logbook is the canonical user data artifact. It exists in two forms:

- **Live**: `localStorage` in the browser, on one device
- **Portable**: a downloaded JSON file the user can upload to another device to restore full state

The logbook is private by default. Nothing leaves the device unless the user explicitly downloads it or generates a share URL.

### localStorage keys

| Key | Type | Content |
|---|---|---|
| `quadrantology_name` | string | User's display name |
| `quadrantology_code` | string | Access code (personal / coupon / org) |
| `quadrantology_history` | JSON array | Own run records, newest first |
| `quadrantology_circle` | JSON array | Personal Circle entries, up to `personal_circle.max_slots` |

### Downloaded logbook JSON

```json
{
  "_note": "Keep this file secure — it contains your access code.",
  "name":    "<display name>",
  "code":    "<access code>",
  "history": [ <own run records> ],
  "circle":  [ <personal circle entries> ]
}
```

Uploading this file on another device restores the full logbook, including Personal Circle.

---

## Own Run Records

Appended to `quadrantology_history` each time the user completes a test. Newest first. Two versions coexist; v1 is legacy.

### v1 (legacy, read-only)

```json
{
  "version":   1,
  "timestamp": "<ISO 8601>",
  "archetype": "<string>",
  "evBias":    1,
  "scores":    [exit, voice, virtue, consequentialist, deontological],
  "answers":   [<array>]
}
```

### v2 (current)

```json
{
  "version":           2,
  "timestamp":         "<ISO 8601>",
  "questions_version": 1,
  "archetype":         "<string>",
  "ev_bias":           1,
  "run": [
    { "qid": "Q001", "ans": "a" }
  ],
  "scores": {
    "exit": 0.0, "voice": 0.0,
    "virtue": 0.0, "consequentialist": 0.0, "deontological": 0.0
  },
  "position": {
    "ev":     0.0,
    "ethics": { "virtue": 0.0, "consequentialist": 0.0, "deontological": 0.0 }
  },
  "note": ""
}
```

**Field notes:**
- `position.ev`: continuous E↔V position, -1 (pure Voice) to +1 (pure Exit)
- `position.ethics`: simplex proportions, sum to 1.0
- `run`: full Q/A log, enables future replay and reanalysis as the scoring model evolves
- `note`: freeform journal entry written at result time. Private — never included in share payloads.
- Questions are never deleted from `questions.json`, only retired, so old run records remain replayable.

---

## Personal Circle Entries

Stored in `quadrantology_circle`. Each entry is a point-in-time arc snapshot received from another person's share URL. Adding an entry requires a subscription; receiving and viewing a share URL is free.

Up to `personal_circle.max_slots` entries (see `docs/data/protocol.json`).

```json
{
  "version": "circle-v1",
  "added":   "<ISO 8601 — when added or last updated>",
  "name":    "<nickname as set by the sharer at share time>",
  "results": [
    {
      "ts":        "<ISO 8601>",
      "archetype": "<string>",
      "ev":        0.0,
      "ethics":    [virtue, consequentialist, deontological]
    }
  ]
}
```

**Field notes:**
- `results`: up to 3 entries, newest first — a mini arc, not a single snapshot
- `ethics`: proportions array, sums to 1.0, order is [virtue, consequentialist, deontological]
- `name`: the nickname the sharer chose at share time; may differ from their own display name
- To update: user pastes a new share URL into that person's slot; `added` refreshes, `results` overwrites
- To remove: user drops the slot, freeing it for someone else

---

## Share URL Payload

Generated on demand from the user's own logbook. Requires `sharing.min_runs_to_share` completed runs (see `docs/data/protocol.json`). The user enters a nickname at share time — this is not saved to the logbook and may differ per recipient.

**Fragment format:** `r.html#v1:<base64url(deflate(json))>`

The fragment is never sent to the server. Decoded and rendered entirely client-side in `r.html`.

```json
{
  "v":    1,
  "name": "<nickname entered at share time>",
  "results": [
    {
      "ts":        "<ISO 8601>",
      "archetype": "<string>",
      "ev":        0.0,
      "ethics":    [virtue, consequentialist, deontological]
    }
  ]
}
```

**Field notes:**
- `results`: the user's most recent 3 own runs in summary form, newest first
- Contains no Q/A run data, no journal notes, no access code
- Each generation is independent — there is no persistent share identity or URL
- Estimated payload size: ~300 bytes raw → ~220 chars in fragment after compression

---

## Coach Mode: Imported Client Logbooks

Available only on the Coach Mode subscription tier. A coach imports a client's full logbook — not a summary arc, but the complete `quadrantology-logbook.json` the client downloads and shares directly (out of band: email, secure message, etc.). The imported logbook gives the coach access to the client's full run history including dimension scores, position data, and journal notes.

Stored in a separate localStorage key from the coach's own logbook, as a named collection:

### localStorage key: `quadrantology_coach_clients`

Array of imported client logbooks, each wrapped with import metadata:

```json
{
  "version":   "client-v1",
  "imported":  "<ISO 8601 — when imported>",
  "label":     "<name the coach assigns locally>",
  "logbook": {
    "name":    "<client's display name from their logbook>",
    "history": [ <full own run records> ],
    "circle":  [ <client's personal circle, if present> ]
  }
}
```

**Field notes:**
- `label`: coach-assigned local name, independent of the client's `name` field — allows the coach to organise clients without the client's name being the identifier
- `logbook.circle`: included if present in the shared file; coach can see who is in the client's circle (names + arcs) but has no way to contact them
- The client's `code` field is stripped on import — the coach has no access to the client's access credentials
- No cap currently specified on number of clients; to be defined in `protocol.json` when the feature is built

### Encryption

The logbook file must be encrypted before sharing to prevent interception (email, file hosts, etc.). Encryption scheme TBD when the feature is built. Leading candidate: **asymmetric key pair** — coach generates a key pair in-browser, shares the public key (or a derived "import code") with the client, client's browser encrypts the logbook file using it before download, coach's browser decrypts on import using the private key (never leaves coach's device). Eliminates need for a shared secret or a server-mediated handshake.

---

## Computed Views (no new storage)

Some pages compute and display results from existing logbook + circle data without persisting anything new. These do not require data model changes — they are read-only views. Adding one of these features means updating UI only.

| Page | Inputs | Subscription | Description |
|---|---|---|---|
| `analytics.html` | `quadrantology_history` | Annual | Trendline chart + commentary across own runs. Unlocked at `min_runs`. |
| `analysis.html` (standard) | Selected subset of circle + self | Annual | Relationship analysis across 2+ people using summary arcs. Selection ephemeral. |
| `analysis.html` (deep) | 2+ full logbooks from coach clients | Coach Mode | Deep analysis with full run histories. Same page, richer inputs and analysis types. |

**Standard relationship analysis selection pool:** yourself (full run history) + any Personal Circle members (summary arcs). Yourself is optional — you can run an analysis on two circle members without including yourself (mediator use case).

**Deep analysis selection pool (Coach Mode):** any combination of imported client logbooks. The coach's own logbook can also be included. Full dimension scores and arc history available for all participants, enabling richer analysis than the summary-only standard mode. Results displayed only, not saved.

---

## Protocol Parameters

Feature thresholds and limits are not hardcoded. They live in `docs/data/protocol.json` and should be read at runtime by any page that needs them. See that file for current values.

Key parameters:
- `protocol.min_runs` — runs needed to unlock analytics
- `sharing.min_runs_to_share` — runs needed to generate a share URL
- `personal_circle.max_slots` — maximum Personal Circle entries
- `personal_circle.requires_subscription` — gating flag
