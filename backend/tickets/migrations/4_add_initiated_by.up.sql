ALTER TABLE tickets ADD COLUMN initiated_by TEXT NOT NULL DEFAULT 'user';

CREATE INDEX idx_tickets_initiated_by ON tickets(initiated_by);
