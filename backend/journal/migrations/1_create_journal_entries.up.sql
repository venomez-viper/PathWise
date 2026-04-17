CREATE TABLE journal_entries (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL,
  body        TEXT NOT NULL,
  source      TEXT NOT NULL DEFAULT 'typed',
  created_at  TEXT NOT NULL
);
CREATE INDEX idx_journal_entries_user_id ON journal_entries(user_id, created_at DESC);
