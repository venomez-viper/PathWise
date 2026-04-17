CREATE TABLE journal_daily_prompts (
  user_id     TEXT NOT NULL,
  prompt_date TEXT NOT NULL,
  prompt      TEXT NOT NULL,
  created_at  TEXT NOT NULL,
  PRIMARY KEY (user_id, prompt_date)
);
