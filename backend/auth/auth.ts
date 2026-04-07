import { api, APIError, Gateway, Header } from "encore.dev/api";
import { authHandler } from "encore.dev/auth";
import { getAuthData } from "encore.dev/internal/codegen/auth";
import { secret } from "encore.dev/config";
import { SQLDatabase } from "encore.dev/storage/sqldb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { RateLimits } from "../shared/rate-limiter";

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

interface PublicProfileResponse {
  profile: {
    name: string;
    avatarUrl?: string;
    plan: string;
    headline?: string;
    bio?: string;
    memberSince: string;
    slug: string;
  };
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

// Register the auth handler with Encore's Gateway
export const gateway = new Gateway({ authHandler: authHandlerDef });

// ── Sign Up ───────────────────────────────────────────────────────────────────

export interface SignUpParams {
  name: string;
  email: string;
  password: string;
}

export const signup = api(
  { expose: true, method: "POST", path: "/auth/signup", auth: false },
  async (params: SignUpParams): Promise<TokenResponse> => {
    RateLimits.auth("signup:" + params.email);
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

    // Send welcome email (fire and forget)
    try {
      const { welcomeEmail } = await import("../email/email");
      const { sendEmail } = await import("../email/email");
      const template = welcomeEmail(params.name);
      await sendEmail({ to: params.email, ...template });
    } catch {}

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
    RateLimits.auth("signin:" + params.email);
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

// ── Update Profile ────────────────────────────────────────────────────────────

export interface UpdateProfileParams {
  name?: string;
  avatarUrl?: string;
}

export const updateProfile = api(
  { expose: true, method: "PATCH", path: "/auth/me", auth: true },
  async (params: UpdateProfileParams): Promise<MeResponse> => {
    const { userID } = getAuthData<AuthData>()!;
    const row = await db.queryRow`
      SELECT id, name, email, avatar_url, plan FROM users WHERE id = ${userID}
    `;
    if (!row) throw APIError.notFound("user not found");

    const newName      = params.name      ?? row.name;

    // Validate avatarUrl to prevent javascript:, data:, and file: URI attacks
    if (params.avatarUrl !== undefined && params.avatarUrl !== null && params.avatarUrl !== "") {
      try {
        const parsed = new URL(params.avatarUrl);
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
          throw APIError.invalidArgument("avatarUrl must use http or https protocol");
        }
      } catch (e) {
        if (e instanceof APIError) throw e;
        throw APIError.invalidArgument("avatarUrl must be a valid http or https URL");
      }
    }

    const newAvatarUrl = params.avatarUrl !== undefined ? params.avatarUrl : row.avatar_url;

    await db.exec`
      UPDATE users SET name = ${newName}, avatar_url = ${newAvatarUrl} WHERE id = ${userID}
    `;

    return {
      user: {
        id:        userID,
        name:      newName,
        email:     row.email,
        avatarUrl: newAvatarUrl ?? undefined,
        plan:      row.plan,
      },
    };
  }
);

// ── Change Password ───────────────────────────────────────────────────────────

export interface ChangePasswordParams {
  currentPassword: string;
  newPassword: string;
}

export const changePassword = api(
  { expose: true, method: "POST", path: "/auth/change-password", auth: true },
  async (params: ChangePasswordParams): Promise<{ success: boolean }> => {
    const { userID } = getAuthData<AuthData>()!;
    RateLimits.profile("chpw:" + userID);

    if (params.newPassword.length < 8) {
      throw APIError.invalidArgument("new password must be at least 8 characters");
    }

    const row = await db.queryRow`
      SELECT password_hash FROM users WHERE id = ${userID}
    `;
    if (!row) throw APIError.notFound("user not found");

    const match = await bcrypt.compare(params.currentPassword, row.password_hash);
    if (!match) throw APIError.unauthenticated("current password is incorrect");

    const newHash = await bcrypt.hash(params.newPassword, 12);
    await db.exec`UPDATE users SET password_hash = ${newHash} WHERE id = ${userID}`;

    return { success: true };
  }
);

// ── Admin ─────────────────────────────────────────────────────────────────────

const ADMIN_EMAIL = "akashagakash@gmail.com";

async function requireAdmin(userID: string): Promise<void> {
  const row = await db.queryRow`SELECT email FROM users WHERE id = ${userID}`;
  if (!row || row.email !== ADMIN_EMAIL) {
    throw APIError.permissionDenied("admin access required");
  }
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  plan: string;
  createdAt: string;
}

export interface AdminUsersResponse {
  users: AdminUser[];
}

export const adminListUsers = api(
  { expose: true, method: "GET", path: "/admin/users", auth: true },
  async (): Promise<AdminUsersResponse> => {
    const { userID } = getAuthData<AuthData>()!;
    RateLimits.admin("admin:" + userID);
    await requireAdmin(userID);

    const users: AdminUser[] = [];
    const rows = db.query`
      SELECT id, name, email, plan, created_at
      FROM users ORDER BY created_at DESC
    `;
    for await (const row of rows) {
      users.push({
        id: row.id,
        name: row.name,
        email: row.email,
        plan: row.plan,
        createdAt: row.created_at,
      });
    }
    return { users };
  }
);

export interface DeleteUserResponse {
  success: boolean;
  deletedUserId: string;
}

export const adminDeleteUser = api(
  { expose: true, method: "DELETE", path: "/admin/users/:userId", auth: true },
  async ({ userId }: { userId: string }): Promise<DeleteUserResponse> => {
    const { userID } = getAuthData<AuthData>()!;
    RateLimits.admin("admin:" + userID);
    await requireAdmin(userID);

    // Don't allow deleting the admin themselves
    const targetRow = await db.queryRow`SELECT email FROM users WHERE id = ${userId}`;
    if (!targetRow) throw APIError.notFound("user not found");
    if (targetRow.email === ADMIN_EMAIL) {
      throw APIError.invalidArgument("cannot delete the admin user");
    }

    // Delete from users table (user_oauth_providers will cascade if FK exists)
    try { await db.exec`DELETE FROM user_oauth_providers WHERE user_id = ${userId}`; } catch {}
    await db.exec`DELETE FROM users WHERE id = ${userId}`;

    return { success: true, deletedUserId: userId };
  }
);

// ── Admin Update Plan ─────────────────────────────────────────────────────────

export const adminUpdatePlan = api(
  { expose: true, method: "PATCH", path: "/admin/users/:userId/plan", auth: true },
  async ({ userId, plan }: { userId: string; plan: string }): Promise<{ success: boolean }> => {
    const { userID } = getAuthData<AuthData>()!;
    await requireAdmin(userID);
    if (plan !== 'free' && plan !== 'premium') {
      throw APIError.invalidArgument("plan must be 'free' or 'premium'");
    }
    await db.exec`UPDATE users SET plan = ${plan} WHERE id = ${userId}`;
    return { success: true };
  }
);

// ── Admin Impersonate ─────────────────────────────────────────────────────────

export const adminImpersonate = api(
  { expose: true, method: "POST", path: "/admin/impersonate/:userId", auth: true },
  async ({ userId }: { userId: string }): Promise<{ token: string }> => {
    const { userID } = getAuthData<AuthData>()!;
    await requireAdmin(userID);
    const row = await db.queryRow`SELECT id FROM users WHERE id = ${userId}`;
    if (!row) throw APIError.notFound("user not found");
    return { token: issueToken(userId) };
  }
);

// ── Admin User Detail ─────────────────────────────────────────────────────────

interface AdminUserDetailResponse {
  user: {
    id: string;
    name: string;
    email: string;
    plan: string;
    avatarUrl?: string;
    createdAt: string;
    hasPassword: boolean;
    oauthProviders: string[];
  };
}

export const adminUserDetail = api(
  { expose: true, method: "GET", path: "/admin/user/:userId/detail", auth: true },
  async ({ userId }: { userId: string }): Promise<AdminUserDetailResponse> => {
    const { userID } = getAuthData<AuthData>()!;
    await requireAdmin(userID);
    const row = await db.queryRow`
      SELECT id, name, email, plan, avatar_url, created_at, password_hash
      FROM users WHERE id = ${userId}
    `;
    if (!row) throw APIError.notFound("user not found");
    // Check OAuth providers
    const providers: string[] = [];
    try {
      const oauthRows = db.query`SELECT provider FROM user_oauth_providers WHERE user_id = ${userId}`;
      for await (const r of oauthRows) providers.push(r.provider);
    } catch {}
    return {
      user: {
        id: row.id,
        name: row.name,
        email: row.email,
        plan: row.plan,
        avatarUrl: row.avatar_url ?? undefined,
        createdAt: row.created_at,
        hasPassword: !!row.password_hash,
        oauthProviders: providers,
      },
    };
  }
);

// ── Admin Check (internal, callable from other services) ─────────────────────

export const checkAdmin = api(
  { expose: false },
  async ({ userID }: { userID: string }): Promise<{ isAdmin: boolean }> => {
    const row = await db.queryRow`SELECT email FROM users WHERE id = ${userID}`;
    return { isAdmin: !!row && row.email === ADMIN_EMAIL };
  }
);

// ── Delete Account (self-service) ─────────────────────────────────────────────

export const deleteAccount = api(
  { expose: true, method: "DELETE", path: "/auth/account", auth: true },
  async (): Promise<{ success: boolean }> => {
    const { userID } = getAuthData<AuthData>()!;

    // Don't allow admin to self-delete via this endpoint
    const row = await db.queryRow`SELECT email FROM users WHERE id = ${userID}`;
    if (!row) throw APIError.notFound("user not found");
    if (row.email === "akashagakash@gmail.com") {
      throw APIError.invalidArgument("admin account cannot be deleted from settings");
    }

    // Delete OAuth providers
    try { await db.exec`DELETE FROM user_oauth_providers WHERE user_id = ${userID}`; } catch {}
    // Delete user
    await db.exec`DELETE FROM users WHERE id = ${userID}`;

    return { success: true };
  }
);

// ── Export Data ───────────────────────────────────────────────────────────────

export const exportData = api(
  { expose: true, method: "GET", path: "/auth/export", auth: true },
  async (): Promise<{ data: any }> => {
    const { userID } = getAuthData<AuthData>()!;

    const user = await db.queryRow`
      SELECT id, name, email, plan, avatar_url, created_at FROM users WHERE id = ${userID}
    `;
    if (!user) throw APIError.notFound("user not found");

    // Get OAuth providers
    const providers: string[] = [];
    try {
      const rows = db.query`SELECT provider FROM user_oauth_providers WHERE user_id = ${userID}`;
      for await (const r of rows) providers.push(r.provider);
    } catch {}

    return {
      data: {
        profile: {
          id: user.id,
          name: user.name,
          email: user.email,
          plan: user.plan,
          avatarUrl: user.avatar_url,
          createdAt: user.created_at,
          oauthProviders: providers,
        },
        exportedAt: new Date().toISOString(),
        note: "Assessment, roadmap, tasks, and streaks data can be exported separately from their respective services.",
      },
    };
  }
);

// ── Public Profile ────────────────────────────────────────────────────────────

export const getPublicProfile = api(
  { expose: true, method: "GET", path: "/profile/:slug", auth: false },
  async ({ slug }: { slug: string }): Promise<PublicProfileResponse> => {
    const row = await db.queryRow`
      SELECT id, name, email, avatar_url, plan, headline, bio, created_at
      FROM users WHERE profile_slug = ${slug} AND profile_public = true
    `;
    if (!row) throw APIError.notFound("profile not found");

    return {
      profile: {
        name: row.name,
        avatarUrl: row.avatar_url ?? undefined,
        plan: row.plan,
        headline: row.headline ?? undefined,
        bio: row.bio ?? undefined,
        memberSince: row.created_at,
        slug,
      },
    };
  }
);

// ── Profile Settings ──────────────────────────────────────────────────────────

export const updateProfileSettings = api(
  { expose: true, method: "PATCH", path: "/auth/profile-settings", auth: true },
  async (params: { profilePublic?: boolean; profileSlug?: string; headline?: string; bio?: string }): Promise<{ success: boolean }> => {
    const { userID } = getAuthData<AuthData>()!;

    // Validate slug if provided
    if (params.profileSlug !== undefined) {
      const slug = params.profileSlug.toLowerCase().replace(/[^a-z0-9-]/g, '');
      if (slug.length < 3) throw APIError.invalidArgument("slug must be at least 3 characters");
      if (slug.length > 30) throw APIError.invalidArgument("slug must be under 30 characters");
      // Check uniqueness
      const existing = await db.queryRow`SELECT id FROM users WHERE profile_slug = ${slug} AND id != ${userID}`;
      if (existing) throw APIError.alreadyExists("this profile URL is already taken");
      await db.exec`UPDATE users SET profile_slug = ${slug} WHERE id = ${userID}`;
    }

    if (params.profilePublic !== undefined) {
      await db.exec`UPDATE users SET profile_public = ${params.profilePublic} WHERE id = ${userID}`;
    }
    if (params.headline !== undefined) {
      await db.exec`UPDATE users SET headline = ${params.headline} WHERE id = ${userID}`;
    }
    if (params.bio !== undefined) {
      await db.exec`UPDATE users SET bio = ${params.bio} WHERE id = ${userID}`;
    }

    return { success: true };
  }
);

export const getProfileSettings = api(
  { expose: true, method: "GET", path: "/auth/profile-settings", auth: true },
  async (): Promise<{ profilePublic: boolean; profileSlug: string | null; headline: string | null; bio: string | null }> => {
    const { userID } = getAuthData<AuthData>()!;
    const row = await db.queryRow`
      SELECT profile_public, profile_slug, headline, bio FROM users WHERE id = ${userID}
    `;
    if (!row) throw APIError.notFound("user not found");
    return {
      profilePublic: row.profile_public ?? false,
      profileSlug: row.profile_slug ?? null,
      headline: row.headline ?? null,
      bio: row.bio ?? null,
    };
  }
);

// ── Helper ────────────────────────────────────────────────────────────────────

function issueToken(userId: string): string {
  return jwt.sign({ sub: userId }, jwtSecret(), { expiresIn: "30d" });
}
