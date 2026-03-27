ALTER TABLE tasks
  ADD COLUMN category        TEXT DEFAULT 'learning',
  ADD COLUMN estimated_hours REAL,
  ADD COLUMN resource_url    TEXT,
  ADD COLUMN ai_generated    BOOLEAN DEFAULT FALSE,
  ADD COLUMN completed_at    TEXT;

CREATE INDEX IF NOT EXISTS idx_tasks_milestone ON tasks(milestone_id);
CREATE INDEX IF NOT EXISTS idx_tasks_category  ON tasks(category);
