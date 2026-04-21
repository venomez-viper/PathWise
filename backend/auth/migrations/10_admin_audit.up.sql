CREATE TABLE admin_audit (
  id          TEXT PRIMARY KEY,
  actor_id    TEXT NOT NULL,
  action      TEXT NOT NULL,
  target_id   TEXT,
  target_type TEXT,
  metadata    TEXT,
  created_at  TEXT NOT NULL
);

CREATE INDEX idx_admin_audit_actor ON admin_audit(actor_id, created_at DESC);
CREATE INDEX idx_admin_audit_action ON admin_audit(action, created_at DESC);
CREATE INDEX idx_admin_audit_target ON admin_audit(target_id, created_at DESC);
