CREATE TABLE IF NOT EXISTS activity_log (
  user_id TEXT NOT NULL,
  active_date TEXT NOT NULL,
  PRIMARY KEY (user_id, active_date)
);
