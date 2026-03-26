CREATE TABLE assessments (
  user_id          TEXT PRIMARY KEY,
  completed_at     TEXT NOT NULL,
  strengths        TEXT NOT NULL,  -- JSON array
  values           TEXT NOT NULL,  -- JSON array
  personality_type TEXT NOT NULL,
  career_matches   TEXT NOT NULL   -- JSON array
);
