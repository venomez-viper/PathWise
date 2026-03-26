import { api, APIError, Header } from "encore.dev/api";
import { authHandler, getAuthData } from "encore.dev/auth";
import { secret } from "encore.dev/config";
import { SQLDatabase } from "encore.dev/storage/sqldb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const db = new SQLDatabase("users", { migrations: "./migrations" });

// ── Secrets (set via `encore secret set`) ────────────────────────────────────
const jwtSecret = secret("JWTSecret");

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  plan: "free" | "premium";
}

export interface TokenResponse {
  token: string;
  user: AuthUser;
}

// ── Auth Handler (validates Bearer tokens on every protected request) ─────────

interface AuthParams {
  authorization: Header<"Authorization">;
}

export interface AuthData {
  userID: string;
}

export const authHandlerDef = authHandler<AuthParams, AuthData>(
  async (params: AuthParams): Promise<AuthData> => {
    const raw = params.authorization ?? "";
    if (!raw.startsWith("Bearer ")) {
      throw APIError.unauthenticated("missing Bearer token");
    }
    const token = raw.slice(7);
    try {
      const payload = jwt.verify(token, jwtSecret()) as jwt.JwtPayload;
      if (!payload.sub) throw new Error("no sub");
      return { userID: payload.sub };
    } catch {
      throw APIError.unauthenticated("invalid or expired token");
    }
  }
);

// ── Sign Up ───────────────────────────────────────────────────────────────────

export interface SignUpParams {
  name: string;
  email: string;
  password: string;
}

export const signup = api(
  { expose: true, method: "POST", path: "/auth/signup", auth: false },
  async (params: SignUpParams): Promise<TokenResponse> => {
    if (params.password.length < 8) {
      throw APIError.invalidArgument("password must be at least 8 characters");
    }

    // Check email not already taken
    const existing = await db.queryRow`
      SELECT id FROM users WHERE email = ${params.email}
    `;
    if (existing) {
      throw APIError.alreadyExists("an account with this email already exists");
    }

    const id           = crypto.randomUUID();
    const now          = new Date().toISOString();
    const passwordHash = await bcrypt.hash(params.password, 12);

    await db.exec`
      INSERT INTO users (id, name, email, password_hash, plan, created_at)
      VALUES (${id}, ${params.name}, ${params.email}, ${passwordHash}, 'free', ${now})
    `;

    const token = issueToken(id);
    return {
      token,
      user: { id, name: params.name, email: params.email, plan: "free" },
    };
  }
);

// ── Sign In ───────────────────────────────────────────────────────────────────

export interface SignInParams {
  email: string;
  password: string;
}

export const signin = api(
  { expose: true, method: "POST", path: "/auth/signin", auth: false },
  async (params: SignInParams): Promise<TokenResponse> => {
    const row = await db.queryRow`
      SELECT id, name, email, avatar_url, plan, password_hash
      FROM users WHERE email = ${params.email}
    `;

    // Use constant-time comparison to avoid timing attacks
    const dummyHash = "$2a$12$invalidhashfortimingprotection000000000000000000000000";
    const hashToCheck = row?.password_hash ?? dummyHash;
    const match = await bcrypt.compare(params.password, hashToCheck);

    if (!row || !match) {
      throw APIError.unauthenticated("invalid email or password");
    }

    const token = issueToken(row.id);
    return {
      token,
      user: {
        id:       row.id,
        name:     row.name,
        email:    row.email,
        avatarUrl: row.avatar_url ?? undefined,
        plan:     row.plan,
      },
    };
  }
);

// ── Me (protected) ────────────────────────────────────────────────────────────

export interface MeResponse {
  user: AuthUser;
}

export const me = api(
  { expose: true, method: "GET", path: "/auth/me", auth: true },
  async (): Promise<MeResponse> => {
    const { userID } = getAuthData<AuthData>()!;
    const row = await db.queryRow`
      SELECT id, name, email, avatar_url, plan
      FROM users WHERE id = ${userID}
    `;
    if (!row) throw APIError.notFound("user not found");
    return {
      user: {
        id:        row.id,
        name:      row.name,
        email:     row.email,
        avatarUrl: row.avatar_url ?? undefined,
        plan:      row.plan,
      },
    };
  }
);

// ── Helper ────────────────────────────────────────────────────────────────────

function issueToken(userId: string): string {
  return jwt.sign({ sub: userId }, jwtSecret(), { expiresIn: "30d" });
}
