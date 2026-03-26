CREATE TABLE users (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  avatar_url  TEXT,
  plan        TEXT NOT NULL DEFAULT 'free',
  created_at  TEXT NOT NULL
);
