CREATE TABLE journal_summaries (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL,
  body          TEXT NOT NULL,
  entry_count   INTEGER NOT NULL,
  created_at    TEXT NOT NULL
);
CREATE INDEX idx_journal_summaries_user_id ON journal_summaries(user_id, created_at DESC);
