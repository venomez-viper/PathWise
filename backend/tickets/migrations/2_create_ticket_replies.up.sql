CREATE TABLE ticket_replies (
  id TEXT PRIMARY KEY,
  ticket_id TEXT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('admin', 'user')),
  author_email TEXT NOT NULL,
  author_name TEXT,
  body TEXT NOT NULL,
  message_id TEXT,
  in_reply_to TEXT,
  resend_email_id TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX idx_ticket_replies_ticket ON ticket_replies(ticket_id);
CREATE INDEX idx_ticket_replies_message_id ON ticket_replies(message_id);
CREATE INDEX idx_ticket_replies_resend_email_id ON ticket_replies(resend_email_id);
CREATE INDEX idx_ticket_replies_created ON ticket_replies(created_at);

ALTER TABLE tickets ADD COLUMN unread INTEGER NOT NULL DEFAULT 1;
ALTER TABLE tickets ADD COLUMN last_activity_at TEXT;

UPDATE tickets SET last_activity_at = created_at WHERE last_activity_at IS NULL;

CREATE INDEX idx_tickets_last_activity ON tickets(last_activity_at DESC);
CREATE INDEX idx_tickets_unread ON tickets(unread);
