-- Email case-insensitive uniqueness.
-- Prior schema relied on `users.email TEXT NOT NULL UNIQUE` (1_create_users)
-- which is case-sensitive. A user could register `Foo@x.com` and `foo@x.com`
-- as two distinct accounts; the OAuth flow normalizes case and would happily
-- claim the second one. Backfill all existing rows to LOWER(TRIM(email)),
-- drop the case-sensitive unique constraint, and replace it with a unique
-- index on LOWER(email) so the database itself enforces normalization
-- regardless of which code path inserts.

-- 1. Backfill — safe at <1k users and run inside the deploy window.
UPDATE users SET email = LOWER(TRIM(email)) WHERE email <> LOWER(TRIM(email));

-- 2. Drop the old case-sensitive unique constraint. PG names a column-level
--    UNIQUE constraint `<table>_<col>_key` by default.
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key;

-- 3. Replace with a functional unique index on LOWER(email). Belt-and-braces
--    with the application-layer normalization in auth.ts.
CREATE UNIQUE INDEX IF NOT EXISTS users_lower_email_unique ON users (LOWER(email));
