CREATE TABLE journal_tags (
  id          TEXT PRIMARY KEY,
  entry_id    TEXT NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  user_id     TEXT NOT NULL,
  tag         TEXT NOT NULL,
  created_at  TEXT NOT NULL
);
CREATE INDEX idx_journal_tags_user_id ON journal_tags(user_id);
CREATE INDEX idx_journal_tags_entry_id ON journal_tags(entry_id);
