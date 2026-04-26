-- Single-use guarantee for password reset tokens.
-- Without `used_at`, two concurrent resetPassword calls could both pass the
-- bcrypt check before either DELETE commits — a stolen token could reset
-- multiple passwords. The atomic UPDATE … WHERE used_at IS NULL closes the
-- race.
ALTER TABLE password_reset_tokens ADD COLUMN used_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_used_at ON password_reset_tokens(used_at);
