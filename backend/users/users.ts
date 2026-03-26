import { api } from "encore.dev/api";
import { SQLDatabase } from "encore.dev/storage/sqldb";

const db = new SQLDatabase("users", { migrations: "./migrations" });

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  plan: "free" | "premium";
  createdAt: string;
}

export interface GetUserResponse {
  user: User;
}

// GET /users/:id
export const getUser = api(
  { expose: true, method: "GET", path: "/users/:id" },
  async ({ id }: { id: string }): Promise<GetUserResponse> => {
    const row = await db.queryRow`
      SELECT id, name, email, avatar_url, plan, created_at
      FROM users WHERE id = ${id}
    `;
    if (!row) throw new Error(`User ${id} not found`);
    return {
      user: {
        id: row.id,
        name: row.name,
        email: row.email,
        avatarUrl: row.avatar_url,
        plan: row.plan,
        createdAt: row.created_at,
      },
    };
  }
);

export interface CreateUserParams {
  name: string;
  email: string;
}

// POST /users
export const createUser = api(
  { expose: true, method: "POST", path: "/users" },
  async (params: CreateUserParams): Promise<GetUserResponse> => {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    await db.exec`
      INSERT INTO users (id, name, email, plan, created_at)
      VALUES (${id}, ${params.name}, ${params.email}, 'free', ${now})
    `;
    return {
      user: { id, name: params.name, email: params.email, plan: "free", createdAt: now },
    };
  }
);
