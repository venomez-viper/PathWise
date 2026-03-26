CREATE TABLE tasks (
  id           TEXT PRIMARY KEY,
  user_id      TEXT NOT NULL,
  milestone_id TEXT,
  title        TEXT NOT NULL,
  description  TEXT,
  status       TEXT NOT NULL DEFAULT 'todo',     -- todo | in_progress | done
  priority     TEXT NOT NULL DEFAULT 'medium',   -- low | medium | high
  due_date     TEXT,
  created_at   TEXT NOT NULL
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
