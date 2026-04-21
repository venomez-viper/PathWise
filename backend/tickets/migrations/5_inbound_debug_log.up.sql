CREATE TABLE inbound_debug_log (
  id TEXT PRIMARY KEY,
  received_at TEXT NOT NULL,
  decision TEXT NOT NULL,
  from_email TEXT,
  to_addresses_json TEXT,
  subject TEXT,
  reason TEXT,
  has_svix_headers INTEGER NOT NULL DEFAULT 0,
  resend_email_id TEXT
);

CREATE INDEX idx_inbound_debug_log_received ON inbound_debug_log(received_at DESC);
