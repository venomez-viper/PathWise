import { api, APIError } from "encore.dev/api";
import { getAuthData } from "encore.dev/internal/codegen/auth";
import { SQLDatabase } from "encore.dev/storage/sqldb";
import { AuthData, ADMIN_EMAILS } from "./auth";

const db = SQLDatabase.named("users");

async function requireAdminEmail(userID: string): Promise<string> {
  const row = await db.queryRow`SELECT email FROM users WHERE id = ${userID}`;
  if (!row) throw APIError.permissionDenied("admin access required");
  const email = row.email as string;
  if (ADMIN_EMAILS.includes(email)) return email;
  const granted = await db.queryRow`
    SELECT 1 FROM user_roles WHERE email = ${email} AND role = 'admin'
  `;
  if (!granted) throw APIError.permissionDenied("admin access required");
  return email;
}

interface RoleEntry {
  email: string;
  role: "admin" | "support_agent";
  addedByEmail: string | null;
  addedAt: string;
  isBootstrap: boolean;
  hasAccount: boolean;
  userName: string | null;
}

export const adminListRoles = api(
  { expose: true, method: "GET", path: "/admin/roles", auth: true },
  async (): Promise<{ entries: RoleEntry[] }> => {
    const { userID } = getAuthData<AuthData>()!;
    await requireAdminEmail(userID);

    const entries: RoleEntry[] = [];

    // Bootstrap admins from config
    for (const email of ADMIN_EMAILS) {
      const u = await db.queryRow`SELECT name FROM users WHERE email = ${email}`;
      entries.push({
        email,
        role: "admin",
        addedByEmail: null,
        addedAt: "",
        isBootstrap: true,
        hasAccount: !!u,
        userName: u?.name ?? null,
      });
    }

    // DB-granted roles
    const rows = db.query`
      SELECT r.email, r.role, r.added_by_email, r.added_at, u.name AS user_name, u.id AS user_id
      FROM user_roles r
      LEFT JOIN users u ON u.email = r.email
      ORDER BY r.role, r.added_at ASC
    `;
    for await (const row of rows) {
      if (row.role === "admin" && ADMIN_EMAILS.includes(row.email)) continue;
      entries.push({
        email: row.email,
        role: row.role as "admin" | "support_agent",
        addedByEmail: row.added_by_email,
        addedAt: row.added_at,
        isBootstrap: false,
        hasAccount: !!row.user_id,
        userName: row.user_name,
      });
    }
    return { entries };
  }
);

interface AddRoleParams {
  email: string;
  role: "admin" | "support_agent";
}

export const adminAddRole = api(
  { expose: true, method: "POST", path: "/admin/roles", auth: true },
  async ({ email, role }: AddRoleParams): Promise<{ success: boolean }> => {
    const { userID } = getAuthData<AuthData>()!;
    const adminEmail = await requireAdminEmail(userID);

    const normalized = (email ?? "").trim().toLowerCase();
    if (!normalized || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(normalized)) {
      throw APIError.invalidArgument("valid email required");
    }
    if (normalized.length > 255) {
      throw APIError.invalidArgument("email too long");
    }
    if (role !== "admin" && role !== "support_agent") {
      throw APIError.invalidArgument("role must be 'admin' or 'support_agent'");
    }

    const now = new Date().toISOString();
    await db.exec`
      INSERT INTO user_roles (email, role, added_by_email, added_at)
      VALUES (${normalized}, ${role}, ${adminEmail}, ${now})
      ON CONFLICT (email, role) DO NOTHING
    `;
    return { success: true };
  }
);

interface RemoveRoleParams {
  email: string;
  role: "admin" | "support_agent";
}

export const adminRemoveRole = api(
  { expose: true, method: "DELETE", path: "/admin/roles", auth: true },
  async ({ email, role }: RemoveRoleParams): Promise<{ success: boolean }> => {
    const { userID } = getAuthData<AuthData>()!;
    const adminEmail = await requireAdminEmail(userID);

    const normalized = (email ?? "").trim().toLowerCase();

    // Can't remove bootstrap admins
    if (ADMIN_EMAILS.includes(normalized) && role === "admin") {
      throw APIError.invalidArgument("cannot remove bootstrap admin");
    }

    // Can't remove your own admin role (prevents lockout)
    if (normalized === adminEmail.toLowerCase() && role === "admin") {
      throw APIError.invalidArgument("cannot remove your own admin role");
    }

    await db.exec`
      DELETE FROM user_roles WHERE email = ${normalized} AND role = ${role}
    `;
    return { success: true };
  }
);

export const myAccessRoles = api(
  { expose: true, method: "GET", path: "/auth/me/access", auth: true },
  async (): Promise<{ isAdmin: boolean; isSupportAgent: boolean; canAccessTickets: boolean }> => {
    const { userID } = getAuthData<AuthData>()!;
    const row = await db.queryRow`SELECT email FROM users WHERE id = ${userID}`;
    if (!row) return { isAdmin: false, isSupportAgent: false, canAccessTickets: false };
    const email = row.email as string;
    const isBootstrap = ADMIN_EMAILS.includes(email);

    let isAdmin = isBootstrap;
    let isSupportAgent = false;
    if (!isBootstrap) {
      const adminRow = await db.queryRow`
        SELECT 1 FROM user_roles WHERE email = ${email} AND role = 'admin'
      `;
      if (adminRow) isAdmin = true;
    }
    const supportRow = await db.queryRow`
      SELECT 1 FROM user_roles WHERE email = ${email} AND role = 'support_agent'
    `;
    isSupportAgent = !!supportRow;

    return { isAdmin, isSupportAgent, canAccessTickets: isAdmin || isSupportAgent };
  }
);
