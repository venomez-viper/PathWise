CREATE TABLE roadmaps (
  id                  TEXT PRIMARY KEY,
  user_id             TEXT NOT NULL UNIQUE,
  target_role         TEXT NOT NULL,
  completion_percent  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE milestones (
  id          TEXT PRIMARY KEY,
  roadmap_id  TEXT NOT NULL REFERENCES roadmaps(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'locked',  -- locked | in_progress | completed
  due_date    TEXT,
  position    INTEGER NOT NULL DEFAULT 0
);
