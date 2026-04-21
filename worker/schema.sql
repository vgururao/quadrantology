-- Quadrantology D1 schema
-- Run via: wrangler d1 execute quadrantology --file=worker/schema.sql

CREATE TABLE IF NOT EXISTS codes (
  code              TEXT PRIMARY KEY,       -- e.g. QNTLG-A3F7-X9K2
  type              TEXT NOT NULL           -- 'personal' | 'coupon' | 'org'
                    CHECK(type IN ('personal','coupon','org')),
  total_uses        INTEGER NOT NULL,       -- total runs purchased/granted
  used_uses         INTEGER NOT NULL DEFAULT 0,
  org_id            TEXT,                   -- org name, promo name, or null
  label             TEXT,                   -- human label e.g. "Acme Corp", "Spring 2026"
  stripe_session_id TEXT,                   -- populated for personal codes from Stripe
  created_at        TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_codes_org_id ON codes(org_id);
CREATE INDEX IF NOT EXISTS idx_codes_stripe_session ON codes(stripe_session_id);

-- Questions database (admin-editable, replaces static questions.json for live reads)
-- Statuses: draft = placeholder, not served | live = in pool | calibrating = in pool + responses recorded | archived = retired
CREATE TABLE IF NOT EXISTS questions (
  id                TEXT    PRIMARY KEY,             -- e.g. Q001
  answer_a          TEXT    NOT NULL,
  answer_b          TEXT    NOT NULL,
  weights_a         TEXT    NOT NULL,                -- JSON array [exit, voice, virtue, consequentialist, deontological]
  weights_b         TEXT    NOT NULL,                -- JSON array
  response_weight   REAL    NOT NULL DEFAULT 1.0,    -- contribution to scoring; calibrated over time
  status            TEXT    NOT NULL DEFAULT 'draft'
                    CHECK(status IN ('draft','live','calibrating','archived')),
  questions_version INTEGER NOT NULL DEFAULT 1,      -- schema version when question was added
  added_at          TEXT    NOT NULL,                -- ISO timestamp
  created_by        TEXT,                            -- admin key fingerprint
  notes             TEXT,
  times_sampled     INTEGER NOT NULL DEFAULT 0,      -- incremented each time the question is included in a sample
  last_sampled_at   TEXT                             -- ISO timestamp of most recent sample inclusion
);

-- Full audit log of status transitions per question (questions are never deleted)
CREATE TABLE IF NOT EXISTS question_state_log (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  question_id TEXT    NOT NULL REFERENCES questions(id),
  from_status TEXT,                                  -- null on initial creation
  to_status   TEXT    NOT NULL,
  changed_at  TEXT    NOT NULL,
  changed_by  TEXT,                                  -- admin key fingerprint
  note        TEXT
);

-- Groups multiple research_sessions from the same logbook submission.
-- Null subject_id on a session = per-run calibration (independent, no longitudinal link).
-- Non-null subject_id = logbook submission (multiple runs from the same anonymous person).
CREATE TABLE IF NOT EXISTS research_subjects (
  subject_id   TEXT PRIMARY KEY,             -- random anonymous ID, generated per submission
  run_count    INTEGER NOT NULL,             -- number of v2 runs in the submitted logbook
  submitted_at TEXT    NOT NULL
);

-- Anonymized research sessions: one row per opted-in test run.
-- subject_id links runs from the same logbook submission for longitudinal analysis.
-- run_token is a client-generated opaque token stored in the user's run record (only for
-- per-run opted-in runs). It allows submit-logbook to find and link an existing session
-- rather than creating a duplicate. Never exposed outside D1 — session_id is the internal PK.
CREATE TABLE IF NOT EXISTS research_sessions (
  session_id        TEXT    PRIMARY KEY,             -- internal DB key only, never leaves server
  subject_id        TEXT    REFERENCES research_subjects(subject_id),  -- null for per-run calibration
  run_token         TEXT    UNIQUE,                  -- client token for cross-dataset linkage; null for logbook-only
  archetype         TEXT,
  ev_pos            REAL,                            -- continuous E↔V position (-1 Voice … +1 Exit)
  ethics_virtue     REAL,                            -- ethics simplex proportions (sum to 1)
  ethics_conseq     REAL,
  ethics_deont      REAL,
  questions_version INTEGER NOT NULL DEFAULT 1,
  collected_at      TEXT    NOT NULL                 -- original run timestamp for logbook submissions
);

CREATE INDEX IF NOT EXISTS idx_sessions_subject   ON research_sessions(subject_id);
CREATE INDEX IF NOT EXISTS idx_sessions_run_token ON research_sessions(run_token);

-- All question responses from that opted-in run (live + calibrating).
-- is_calibrating records status at time of collection for easy filtering.
-- Storing all responses (not just calibrating) enables cross-question correlation analysis.
CREATE TABLE IF NOT EXISTS research_responses (
  session_id        TEXT    NOT NULL REFERENCES research_sessions(session_id),
  question_id       TEXT    NOT NULL,
  answer            TEXT    NOT NULL CHECK(answer IN ('a','b')),
  is_calibrating    INTEGER NOT NULL DEFAULT 0,      -- 1 if question status = 'calibrating' at collection time
  PRIMARY KEY (session_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_research_question ON research_responses(question_id);
CREATE INDEX IF NOT EXISTS idx_research_session  ON research_responses(session_id);

-- One-time nonces for admin challenge-response authentication (5-min TTL, consumed on use)
CREATE TABLE IF NOT EXISTS admin_challenges (
  challenge  TEXT PRIMARY KEY,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_challenges_created_at ON admin_challenges(created_at);

-- Sequence log: one row per sample-questions call (no user data, no answers)
-- qids: compact sorted question numbers, Q-prefix/zero-stripped, comma-separated ("1,7,11,20,23")
-- type_counts: JSON {"ev":5,"vc":3,"vd":3,"cd":3}
CREATE TABLE IF NOT EXISTS question_sequences (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  sampled_at  TEXT    NOT NULL,
  qids        TEXT    NOT NULL,
  type_counts TEXT    NOT NULL,
  parity_ok   INTEGER NOT NULL DEFAULT 1,
  q_count     INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sequences_sampled_at ON question_sequences(sampled_at);

-- ── Synperson research panel ─────────────────────────────────────────────────
-- 30 synthetic persona profiles used for longitudinal test research and QA.
-- Source of truth is synpersons/{id}_{name}/rig.yaml + events.md; D1 is the
-- working copy. Apply changes to markdown first, then sync-to-d1.py pushes here.

CREATE TABLE IF NOT EXISTS synpersons (
  id              TEXT    PRIMARY KEY,    -- 'C1', 'HW3', etc.
  archetype       TEXT    NOT NULL,
  name            TEXT    NOT NULL,
  hook            TEXT,                   -- one-line bio hook for public display (populated when made public)
  biography       TEXT,                   -- 300-500 word stable character description (populated when made public)
  status          TEXT    NOT NULL DEFAULT 'active'
                  CHECK(status IN ('active','paused','retired')),
  memory_params   TEXT    NOT NULL DEFAULT '{"alpha":0.5,"lambda":0.004,"intensity_floor":8,"max_events":10}',
  public          INTEGER NOT NULL DEFAULT 0,   -- 1 = available as Personal Circle profile
  first_run_at    TEXT,                          -- ISO; null until first logged run
  created_at      TEXT    NOT NULL
);

CREATE TABLE IF NOT EXISTS synperson_events (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  synperson_id    TEXT    NOT NULL REFERENCES synpersons(id),
  event_key       TEXT    NOT NULL,       -- 'E001', 'E003b' etc. (from events.md header)
  narrative_date  TEXT    NOT NULL,       -- 'YYYY-MM' in synperson's internal timeline
  title           TEXT    NOT NULL,
  body            TEXT    NOT NULL,
  intensity       INTEGER NOT NULL CHECK(intensity BETWEEN 1 AND 10),
  last_recalled_at TEXT,                  -- populated after each logged run
  retcons         TEXT,                   -- comma-sep event_keys this event revises
  generated_by    TEXT    NOT NULL DEFAULT 'human',  -- 'human' | 'claude-{model}'
  created_at      TEXT    NOT NULL,
  UNIQUE(synperson_id, event_key)
);

CREATE TABLE IF NOT EXISTS synperson_runs (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  synperson_id    TEXT    NOT NULL REFERENCES synpersons(id),
  run_number      INTEGER NOT NULL,       -- 1-indexed per synperson
  run_data        TEXT    NOT NULL,       -- full v2 JSON (all answers stored)
  prompt_text     TEXT    NOT NULL,       -- full prompt sent to Claude (audit trail)
  events_sampled  TEXT    NOT NULL,       -- comma-sep event_keys active during this run
  model_used      TEXT    NOT NULL,       -- e.g. 'claude-sonnet-4-6'
  run_type        TEXT    NOT NULL DEFAULT 'logged'
                  CHECK(run_type IN ('logged','qa')),
  created_at      TEXT    NOT NULL,
  UNIQUE(synperson_id, run_number)
);

CREATE INDEX IF NOT EXISTS idx_synruns_synperson ON synperson_runs(synperson_id, run_number);

-- ── Canonical scoring model snapshots (one row per model version). ──────────
-- model_json contains the full canonical model object: dimensions, archetypes,
-- algorithm (steps + tie-breaking), and the question bank with weights at snapshot time.
-- These are never deleted — old runs are only meaningful if their model remains accessible.
-- When a new version is created: snapshot questions table → insert here → bump protocol.json model_version → git tag model-v{N}.
CREATE TABLE IF NOT EXISTS scoring_models (
  version      INTEGER PRIMARY KEY,
  created_at   TEXT    NOT NULL,
  reason       TEXT,                    -- why this version was created
  git_tag      TEXT,                    -- e.g. 'model-v1', links to reference implementation
  model_json   TEXT    NOT NULL         -- full canonical JSON blob (CC BY 4.0)
);
