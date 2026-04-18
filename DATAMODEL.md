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
| `quadrantology_history` | JSON array | Own run records, newest first. When sync is active: rolling window of last `sync.max_active_runs` runs only. |
| `quadrantology_circle` | JSON array | Personal Circle entries, up to `personal_circle.max_slots` |
| `quadrantology_models` | JSON object | Map of `model_version` int → full canonical model doc. Cached at test time; used to enrich exports without a server call. |
| `quadrantology_archive_buffer` | JSON array | Evicted runs waiting to form a closed archive batch. Oldest first. Present only when sync folder is active. |
| `quadrantology_archive_index` | JSON object | `{ total_archived: N, files: [...] }` — lightweight index for run_number assignment without reading archive files. |
| `quadrantology_questions_v{N}` | JSON object | `{ cached_at, questions: [{id, answer_a, answer_b}] }` — question bank cache keyed by `questions_version`. Seeded from `data/questions.json` on first load. |
| `quadrantology_code_shown` | string `"1"` | Guard: first-purchase code display modal has been shown. |
| `quadrantology_sync_folder` | string | Display name of active sync folder (e.g. `"quadrantology"`). Handle lives in IndexedDB. |

### Downloaded logbook JSON

The exported file is self-contained: it embeds the full scoring model documentation for every `model_version` referenced by any run in the file. A user with only this file can understand and re-score all their historical runs without access to the app or any external reference.

```json
{
  "_note": "Keep this file secure — it contains your access code.",
  "name":    "<display name>",
  "code":    "<access code>",
  "scoring_models": {
    "1": { "<full canonical model-v1 doc — dimensions, archetypes, algorithm, questions+weights>" }
  },
  "history": [ <own run records> ],
  "circle":  [ <personal circle entries> ]
}
```

`scoring_models` is a map from model version integer to the full canonical model object (see Scoring Models section below). One entry per unique `model_version` found across all runs in `history`. Archive files in the sync folder follow the same pattern.

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
  "run_number":        7,
  "format_version":    1,
  "model_version":     1,
  "timestamp":         "<ISO 8601>",
  "questions_version": 1,
  "archetype":         "<string>",
  "ev_bias":           "exit",
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
  "calibrating": ["Q005", "Q012"],
  "run_token":   "<32-char hex string, or null>",
  "note": ""
}
```

**Field notes:**
- `run_number`: sequential 1-indexed integer, assigned at save time from lifetime run count. Stable identifier used for archive file naming. Re-numbered chronologically after a merge; `timestamp` is the identity key.
- `format_version`: the file/record format version in effect when this run was saved. Frozen on the record; never updated retroactively.
- `model_version`: the scoring model version in effect when this run was saved. Frozen on the record; never updated retroactively. Old runs are never re-scored (see Design Principle 6).
- `position.ev`: continuous E↔V position, -1 (pure Voice) to +1 (pure Exit)
- `position.ethics`: simplex proportions, sum to 1.0
- `run`: full Q/A log, enables future replay and reanalysis. In exported files this array is enriched with `question`, `chosen`, and `not_chosen` text fields resolved from the question bank cache.
- `calibrating`: question IDs that were in `calibrating` status at run time. Used by `submit-logbook` to correctly tag `is_calibrating` on response rows even for runs submitted later. Empty array `[]` if no calibrating questions were present or user declined opt-in.
- `run_token`: 32-char hex token generated at run time if user opted into research. Stored in `research_sessions.run_token` for cross-dataset linkage. `null` if user declined. Never the same as the internal `session_id` (which never leaves the server).
- `note`: freeform journal entry written at result time. Private — never included in share payloads.
- Questions are never deleted from D1, only archived, so old run records remain replayable.

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

## Research Data (D1 — server side)

Anonymised research data is stored server-side in Cloudflare D1. This data is never linked to user accounts, access codes, names, or journal notes. Full schema in `worker/schema.sql`.

### Table hierarchy

```
research_subjects           — one row per logbook submission (bulk pathway)
  └── research_sessions     — one row per test run (per-run or bulk)
        └── research_responses — one row per question answered
```

**`research_sessions`** key columns:
- `session_id` — internal UUID primary key; never exposed outside the server
- `subject_id` — FK to `research_subjects`; null for per-run submissions until linked by logbook submit
- `run_token` — 32-char hex; the only cross-dataset linkage token; stored in user's v2 run record
- `archetype`, `ev_pos`, `ethics_virtue/conseq/deont`, `questions_version`, `collected_at`

**`research_responses`** key columns:
- `session_id`, `question_id`, `answer` (`a`/`b`), `is_calibrating` (0/1)

**Cross-dataset linkage:** When a user who opted in per-run later submits their full logbook, `submit-logbook` matches `run_token` values to avoid duplicating responses. The `session_id` UUID is never stored in the user's logbook — only `run_token`.

### Questions (D1)

Managed via `/admin/questions` UI. Schema in `worker/schema.sql`. Seed file: `worker/seed-questions.sql`.

Each question: `id`, `status` (`live`/`calibrating`/`archived`), `response_weight`, `questions_version`, `answer_a/b`, `weights_a/b` (5-element arrays: exit, voice, virtue, consequentialist, deontological), `notes`.

Status meanings:
- `live` — in pool, responses not recorded
- `calibrating` — in pool AND responses recorded anonymously (triggers opt-in consent on intro)
- `archived` — not in pool; preserved for replay

Full audit trail in `question_state_log` (one row per status change, with reason note).

---

## Scoring Models

Scoring models are versioned snapshots of the complete algorithm: dimensions, archetype assignment table, tie-breaking rules, and the full question bank with per-answer weight vectors. Every export file embeds the model docs for all versions referenced by its runs (see Walk-Away Guarantee in `DESIGN.md`).

### Canonical model file format

`docs/data/quadrantology-model-v{N}.json` — publicly downloadable, CC BY 4.0 licensed. Published to GitHub (tagged `model-v{N}`) when each version is released. Never deleted.

Top-level fields: `_meta` (format, version, created_at, license, attribution, git_tag, reference_implementation), `dimensions`, `archetypes`, `algorithm` (steps, archetype_table, tie_breaking), `questions` (id, answer_a, answer_b, weights {a,b}, response_weight, status).

### D1 `scoring_models` table

Stores the full canonical model JSON for each version. Used by the admin page to serve model downloads and to snapshot the current model when a new version is created.

```sql
CREATE TABLE IF NOT EXISTS scoring_models (
  version      INTEGER PRIMARY KEY,
  created_at   TEXT NOT NULL,
  reason       TEXT,             -- why this version was created
  git_tag      TEXT,             -- e.g. 'model-v1'
  model_json   TEXT NOT NULL     -- full canonical JSON blob
);
```

Creating a new model version is an admin action: snapshot the current `questions` table state into `model_json`, increment the version, write to D1, write the static file to `docs/data/`, and create a git tag. The `model_version` field in `protocol.json` is bumped at the same time.

### `migrations.json` (sync folder)

Written to the sync folder root when a non-compatible model or format change is deployed. Append-only. Each entry records the version transition, whether it was compatible, the reason, and the run number at which any open archive batch was force-flushed before the new version took effect. See Sync Profile spec for full format.

---

## IndexedDB

Database: `quadrantology_sync`, version 1  
Object store: `meta`, key-path `"key"`

| `key` | Value type | Content |
|---|---|---|
| `"directory_handle"` | `FileSystemDirectoryHandle` | Persisted sync folder handle (Chrome/Chromium only) |
| `"last_synced"` | string | ISO 8601 timestamp of last successful sync folder write |

---

## Protocol Parameters

Feature thresholds and limits are not hardcoded. They live in `docs/data/protocol.json` and should be read at runtime by any page that needs them. See that file for current values.

Key parameters:
- `format_version` — current file/record format version (top-level)
- `model_version` — current scoring model version (top-level)
- `protocol.min_runs` — runs needed to unlock analytics
- `sharing.min_runs_to_share` — runs needed to generate a share URL
- `personal_circle.max_slots` — maximum Personal Circle entries
- `personal_circle.requires_subscription` — gating flag
- `sync.max_active_runs` — runs kept in active localStorage window when sync folder is active
- `sync.archive_batch_size` — evicted runs buffered before writing a closed archive file
