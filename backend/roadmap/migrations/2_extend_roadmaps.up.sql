ALTER TABLE roadmaps
  ADD COLUMN skill_gap_current  TEXT,
  ADD COLUMN skill_gap_required TEXT,
  ADD COLUMN skill_gap_gaps     TEXT,
  ADD COLUMN estimated_weeks    INTEGER,
  ADD COLUMN created_at         TEXT;

ALTER TABLE milestones
  ADD COLUMN estimated_weeks INTEGER DEFAULT 4,
  ADD COLUMN skills_targeted TEXT;
