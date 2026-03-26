import { api } from "encore.dev/api";
import { SQLDatabase } from "encore.dev/storage/sqldb";

const db = new SQLDatabase("users", { migrations: "../users/migrations" });

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  plan: "free" | "premium";
}

export interface MeResponse {
  user: AuthUser;
}

// GET /auth/me — Returns the current authenticated user.
// For now, uses a query param ?userId= until real auth (JWT/OAuth) is added.
export const me = api(
  { expose: true, method: "GET", path: "/auth/me" },
  async ({ userId }: { userId: string }): Promise<MeResponse> => {
    const row = await db.queryRow`
      SELECT id, name, email, avatar_url, plan
      FROM users WHERE id = ${userId}
    `;
    if (!row) throw new Error(`User ${userId} not found`);
    return {
      user: {
        id: row.id,
        name: row.name,
        email: row.email,
        avatarUrl: row.avatar_url ?? undefined,
        plan: row.plan,
      },
    };
  }
);
