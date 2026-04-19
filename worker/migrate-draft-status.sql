-- Migration: add 'draft' to questions.status CHECK constraint
-- SQLite doesn't support ALTER COLUMN, so we recreate the table.

PRAGMA foreign_keys = OFF;

CREATE TABLE IF NOT EXISTS questions_new (
  id                TEXT    PRIMARY KEY,
  answer_a          TEXT    NOT NULL,
  answer_b          TEXT    NOT NULL,
  weights_a         TEXT    NOT NULL,
  weights_b         TEXT    NOT NULL,
  response_weight   REAL    NOT NULL DEFAULT 1.0,
  status            TEXT    NOT NULL DEFAULT 'draft'
                    CHECK(status IN ('draft','live','calibrating','archived')),
  questions_version INTEGER NOT NULL DEFAULT 1,
  added_at          TEXT    NOT NULL,
  created_by        TEXT,
  notes             TEXT
);

INSERT INTO questions_new SELECT * FROM questions;

DROP TABLE questions;

ALTER TABLE questions_new RENAME TO questions;

PRAGMA foreign_keys = ON;
