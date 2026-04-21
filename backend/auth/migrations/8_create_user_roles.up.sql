CREATE TABLE user_roles (
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'support_agent')),
  added_by_email TEXT,
  added_at TEXT NOT NULL,
  PRIMARY KEY (email, role)
);

CREATE INDEX idx_user_roles_email ON user_roles(email);
CREATE INDEX idx_user_roles_role ON user_roles(role);
