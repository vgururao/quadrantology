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
