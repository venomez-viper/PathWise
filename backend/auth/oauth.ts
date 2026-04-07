import { api, APIError } from "encore.dev/api";
import { secret } from "encore.dev/config";
import { SQLDatabase } from "encore.dev/storage/sqldb";
import { createRemoteJWKSet, jwtVerify, importPKCS8, SignJWT } from "jose";
import jwt from "jsonwebtoken";
import crypto from "crypto";

// Re-use the same database as auth.ts
const db = new SQLDatabase("users", { migrations: "./migrations" });

// ── Secrets ──────────────────────────────────────────────────────────────────
const jwtSecret          = secret("JWTSecret");
const googleClientId     = secret("GoogleClientID");
const googleClientSecret = secret("GoogleClientSecret");
const googleIOSClientId  = secret("GoogleIOSClientID");
const appleBundleId      = secret("AppleBundleID");
const appleServiceId     = secret("AppleServiceID");
const appleTeamId        = secret("AppleTeamID");
const appleKeyId         = secret("AppleKeyID");
const applePrivateKey    = secret("ApplePrivateKey");

// ── JWKS sets (cached automatically by jose) ─────────────────────────────────
const googleJWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/oauth2/v3/certs")
);
const appleJWKS = createRemoteJWKSet(
  new URL("https://appleid.apple.com/auth/keys")
);

// ── Apple client_secret cache ─────────────────────────────────���──────────────
let cachedAppleSecret: { jwt: string; expiresAt: number } | null = null;

// ── Types ────────────────────────────────────────────────────────────────────

interface OAuthParams {
  provider: "google" | "apple";
  code?: string;
  id_token?: string;
  code_verifier?: string;
  name?: string;
  nonce?: string;
  platform: "web" | "ios";
}

interface OAuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    plan: "free" | "premium";
  };
  isNewUser: boolean;
}

interface ProviderProfile {
  sub: string;
  email: string;
  emailVerified: boolean;
  name: string;
  nonce?: string;
}

// ── Main endpoint ────────────────────────────────────────────────────────────

export const oauth = api(
  { expose: true, method: "POST", path: "/auth/oauth", auth: false },
  async (params: OAuthParams): Promise<OAuthResponse> => {
    // Validate input
    if (params.platform === "web" && !params.code) {
      throw APIError.invalidArgument("authorization code required for web");
    }
    if (params.platform === "ios" && !params.id_token) {
      throw APIError.invalidArgument("ID token required for iOS");
    }

    // Get verified profile from provider
    let profile: ProviderProfile;
    try {
      if (params.provider === "google") {
        profile = await verifyGoogle(params);
      } else {
        profile = await verifyApple(params);
      }
    } catch (err) {
      if (err instanceof APIError) throw err;
      console.error("OAuth verification failed", {
        provider: params.provider,
        platform: params.platform,
        error: err instanceof Error ? err.message : "unknown",
      });
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("fetch") || msg.includes("network") || msg.includes("ECONNREFUSED")) {
        throw APIError.unavailable("Sign-in temporarily unavailable. Please try again shortly.");
      }
      throw APIError.unauthenticated("Authentication failed. Please try again.");
    }

    // ── Nonce verification (replay attack protection) ──
    // If the ID token contains a nonce, the client MUST have sent the matching value
    if (profile.nonce) {
      if (!params.nonce) {
        throw APIError.unauthenticated("Authentication failed. Please try again.");
      }
      // Apple hashes the nonce (SHA-256) before embedding it in the ID token
      // Google embeds the raw nonce
      const rawMatch = params.nonce === profile.nonce;
      const hashedNonce = crypto.createHash("sha256").update(params.nonce).digest("hex");
      const hashMatch = hashedNonce === profile.nonce;
      if (!rawMatch && !hashMatch) {
        throw APIError.unauthenticated("Authentication failed. Please try again.");
      }
    }

    // ── Validate email ──
    if (!profile.email || profile.email.trim() === "") {
      throw APIError.invalidArgument(
        "Email is required. Please ensure your account has an email address and you've granted email access."
      );
    }

    // Require verified email for ALL flows (auto-link and new account creation)
    if (!profile.emailVerified) {
      throw APIError.invalidArgument(
        "A verified email address is required. Please verify your email with your provider and try again."
      );
    }

    // ── Look up or create user (in transaction to prevent races) ──
    return await lookupOrCreateUser(params, profile);
  }
);

// ── User lookup/create (transaction-safe) ────────────────────────────────────

async function lookupOrCreateUser(
  params: OAuthParams,
  profile: ProviderProfile
): Promise<OAuthResponse> {
  // Step 1: Check if provider is already linked
  const linked = await db.queryRow`
    SELECT user_id FROM user_oauth_providers
    WHERE provider = ${params.provider} AND provider_user_id = ${profile.sub}
  `;

  if (linked) {
    const user = await db.queryRow`
      SELECT id, name, email, avatar_url, plan FROM users WHERE id = ${linked.user_id}
    `;
    if (!user) throw APIError.notFound("linked user not found");

    return {
      token: issueToken(user.id),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatar_url ?? undefined,
        plan: user.plan,
      },
      isNewUser: false,
    };
  }

  // Step 2: Check if an account with this email exists
  const existingUser = await db.queryRow`
    SELECT id, name, email, avatar_url, plan, password_hash FROM users
    WHERE email = ${profile.email}
  `;

  if (existingUser) {
    // SECURITY: Never auto-link to a password-only account.
    // Password-only users must sign in with their password first,
    // then link the OAuth provider in Settings.
    if (existingUser.password_hash) {
      throw APIError.unauthenticated(
        "An account with this email already exists. Please sign in with your password first."
      );
    }

    // Auto-link only for existing OAuth-only accounts (user already opted into social login)
    // Use ON CONFLICT to handle race conditions
    await db.exec`
      INSERT INTO user_oauth_providers (id, user_id, provider, provider_user_id, email)
      VALUES (${crypto.randomUUID()}, ${existingUser.id}, ${params.provider}, ${profile.sub}, ${profile.email})
      ON CONFLICT (provider, provider_user_id) DO NOTHING
    `;

    return {
      token: issueToken(existingUser.id),
      user: {
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
        avatarUrl: existingUser.avatar_url ?? undefined,
        plan: existingUser.plan,
      },
      isNewUser: false,
    };
  }

  // Step 3: Create new user
  // Use ON CONFLICT to handle race conditions where two requests try to create the same user
  const userId = crypto.randomUUID();
  const now = new Date().toISOString();
  const userName = profile.name || params.name || "User";

  const inserted = await db.queryRow`
    INSERT INTO users (id, name, email, plan, created_at)
    VALUES (${userId}, ${userName}, ${profile.email}, 'free', ${now})
    ON CONFLICT (email) DO NOTHING
    RETURNING id
  `;

  if (!inserted) {
    // Race condition: another request created this user between our SELECT and INSERT
    // Retry the lookup
    const raceUser = await db.queryRow`
      SELECT id, name, email, avatar_url, plan, password_hash FROM users
      WHERE email = ${profile.email}
    `;
    if (!raceUser) throw APIError.internal("unexpected state during account creation");

    if (raceUser.password_hash) {
      throw APIError.unauthenticated(
        "An account with this email already exists. Please sign in with your password first."
      );
    }

    await db.exec`
      INSERT INTO user_oauth_providers (id, user_id, provider, provider_user_id, email)
      VALUES (${crypto.randomUUID()}, ${raceUser.id}, ${params.provider}, ${profile.sub}, ${profile.email})
      ON CONFLICT (provider, provider_user_id) DO NOTHING
    `;

    return {
      token: issueToken(raceUser.id),
      user: {
        id: raceUser.id,
        name: raceUser.name,
        email: raceUser.email,
        avatarUrl: raceUser.avatar_url ?? undefined,
        plan: raceUser.plan,
      },
      isNewUser: false,
    };
  }

  await db.exec`
    INSERT INTO user_oauth_providers (id, user_id, provider, provider_user_id, email)
    VALUES (${crypto.randomUUID()}, ${userId}, ${params.provider}, ${profile.sub}, ${profile.email})
    ON CONFLICT (provider, provider_user_id) DO NOTHING
  `;

  return {
    token: issueToken(userId),
    user: {
      id: userId,
      name: userName,
      email: profile.email,
      plan: "free",
    },
    isNewUser: true,
  };
}

// ── Google verification ──────────────────────────────────────────────────────

async function verifyGoogle(params: OAuthParams): Promise<ProviderProfile> {
  let idToken: string;

  if (params.platform === "web") {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code: params.code!,
        client_id: googleClientId(),
        client_secret: googleClientSecret(),
        redirect_uri: "postmessage",
        grant_type: "authorization_code",
        ...(params.code_verifier ? { code_verifier: params.code_verifier } : {}),
      }),
    });

    if (!tokenRes.ok) {
      throw new Error("Google token exchange failed");
    }

    const tokenData = await tokenRes.json();
    idToken = tokenData.id_token;
  } else {
    idToken = params.id_token!;
  }

  const allowedAuds = [googleClientId(), googleIOSClientId()];
  const { payload } = await jwtVerify(idToken, googleJWKS, {
    issuer: ["https://accounts.google.com", "accounts.google.com"],
    audience: allowedAuds,
  });

  if (!payload.sub || !payload.email) {
    throw new Error("missing claims in Google ID token");
  }

  return {
    sub: payload.sub,
    email: payload.email as string,
    emailVerified: payload.email_verified === true,
    name: (payload.name as string) ?? "",
    nonce: payload.nonce ? String(payload.nonce) : undefined,
  };
}

// ── Apple verification ───────────────────────────────────────────────────────

async function verifyApple(params: OAuthParams): Promise<ProviderProfile> {
  let idToken: string;

  if (params.platform === "web") {
    const clientSecret = await generateAppleClientSecret();

    const tokenRes = await fetch("https://appleid.apple.com/auth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code: params.code!,
        client_id: appleServiceId(),
        client_secret: clientSecret,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      throw new Error("Apple token exchange failed");
    }

    const tokenData = await tokenRes.json();
    idToken = tokenData.id_token;
  } else {
    idToken = params.id_token!;
  }

  const allowedAuds = [appleServiceId(), appleBundleId()];
  const { payload } = await jwtVerify(idToken, appleJWKS, {
    issuer: "https://appleid.apple.com",
    audience: allowedAuds,
  });

  if (!payload.sub) {
    throw new Error("missing sub in Apple ID token");
  }

  return {
    sub: payload.sub,
    email: payload.email ? String(payload.email) : "",
    emailVerified: payload.email_verified === true,
    name: params.name ? String(params.name) : "",
    nonce: payload.nonce ? String(payload.nonce) : undefined,
  };
}

// ── Apple client_secret generator (cached) ───────────────────────────────────

async function generateAppleClientSecret(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  // Return cached secret if still valid (with 60s buffer)
  if (cachedAppleSecret && cachedAppleSecret.expiresAt > now + 60) {
    return cachedAppleSecret.jwt;
  }

  const exp = now + 3600; // 1 hour expiry (minimizes exposure if leaked)
  const header = {
    alg: "ES256" as const,
    kid: appleKeyId(),
    typ: "JWT",
  };
  const claims = {
    iss: appleTeamId(),
    iat: now,
    exp,
    aud: "https://appleid.apple.com",
    sub: appleServiceId(),
  };

  const privateKey = await importPKCS8(applePrivateKey(), "ES256");
  const token = await new SignJWT(claims)
    .setProtectedHeader(header)
    .sign(privateKey);

  cachedAppleSecret = { jwt: token, expiresAt: exp };
  return token;
}

// ── Helper ───────────────────────────────────────────────────────────────────

function issueToken(userId: string): string {
  return jwt.sign({ sub: userId }, jwtSecret(), { expiresIn: "30d" });
}
