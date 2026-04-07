import { api, APIError } from "encore.dev/api";
import { secret } from "encore.dev/config";
import { SQLDatabase } from "encore.dev/storage/sqldb";
import { createRemoteJWKSet, jwtVerify } from "jose";
import jwt from "jsonwebtoken";

// Re-use the same database as auth.ts
const db = new SQLDatabase("users", { migrations: "./migrations" });

// ── Secrets ──────────────────────────────────────────────────────────────────
const jwtSecret         = secret("JWTSecret");
const googleClientId    = secret("GoogleClientID");
const googleClientSecret = secret("GoogleClientSecret");
const googleIOSClientId = secret("GoogleIOSClientID");
const appleBundleId     = secret("AppleBundleID");
const appleServiceId    = secret("AppleServiceID");
const appleTeamId       = secret("AppleTeamID");
const appleKeyId        = secret("AppleKeyID");
const applePrivateKey   = secret("ApplePrivateKey");

// ── JWKS sets (cached automatically by jose) ─────────────────────────────────
const googleJWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/oauth2/v3/certs")
);
const appleJWKS = createRemoteJWKSet(
  new URL("https://appleid.apple.com/auth/keys")
);

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
      console.error("OAuth verification failed:", err);
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("fetch") || msg.includes("network") || msg.includes("ECONNREFUSED")) {
        throw APIError.unavailable("Sign-in temporarily unavailable. Please try again shortly.");
      }
      throw APIError.unauthenticated("Authentication failed. Please try again.");
    }

    // Verify nonce if provided (replay attack protection)
    if (params.nonce && profile.nonce && profile.nonce !== params.nonce) {
      throw APIError.unauthenticated("Authentication failed. Please try again.");
    }

    // Look up or create user
    // Step 1: Check if provider is already linked
    const linked = await db.queryRow`
      SELECT user_id FROM user_oauth_providers
      WHERE provider = ${params.provider} AND provider_user_id = ${profile.sub}
    `;

    if (linked) {
      // Existing linked account — return token
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

    // Step 2: Auto-link by verified email
    if (profile.emailVerified) {
      const existingUser = await db.queryRow`
        SELECT id, name, email, avatar_url, plan FROM users WHERE email = ${profile.email}
      `;

      if (existingUser) {
        // Link this provider to existing account
        await db.exec`
          INSERT INTO user_oauth_providers (id, user_id, provider, provider_user_id, email)
          VALUES (${crypto.randomUUID()}, ${existingUser.id}, ${params.provider}, ${profile.sub}, ${profile.email})
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
    }

    // Step 3: Create new user
    const userId = crypto.randomUUID();
    const now = new Date().toISOString();
    const userName = profile.name || params.name || "User";

    await db.exec`
      INSERT INTO users (id, name, email, plan, created_at)
      VALUES (${userId}, ${userName}, ${profile.email}, 'free', ${now})
    `;

    await db.exec`
      INSERT INTO user_oauth_providers (id, user_id, provider, provider_user_id, email)
      VALUES (${crypto.randomUUID()}, ${userId}, ${params.provider}, ${profile.sub}, ${profile.email})
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
);

// ── Google verification ──────────────────────────────────────────────────────

async function verifyGoogle(params: OAuthParams): Promise<ProviderProfile> {
  let idToken: string;

  if (params.platform === "web") {
    // Exchange authorization code for ID token server-to-server
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
      const err = await tokenRes.text();
      console.error("Google token exchange failed:", err);
      throw new Error("Google token exchange failed");
    }

    const tokenData = await tokenRes.json();
    idToken = tokenData.id_token;
  } else {
    idToken = params.id_token!;
  }

  // Verify the ID token against Google's JWKS
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
    emailVerified: payload.email_verified as boolean ?? false,
    name: (payload.name as string) ?? "",
    nonce: (payload.nonce as string) ?? undefined,
  };
}

// ── Apple verification ───────────────────────────────────────────────────────

async function verifyApple(params: OAuthParams): Promise<ProviderProfile> {
  let idToken: string;

  if (params.platform === "web") {
    // Generate Apple client_secret JWT
    const clientSecret = await generateAppleClientSecret();

    // Exchange authorization code for ID token
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
      const err = await tokenRes.text();
      console.error("Apple token exchange failed:", err);
      throw new Error("Apple token exchange failed");
    }

    const tokenData = await tokenRes.json();
    idToken = tokenData.id_token;
  } else {
    idToken = params.id_token!;
  }

  // Verify the ID token against Apple's JWKS
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
    email: (payload.email as string) ?? "",
    emailVerified: payload.email_verified as boolean ?? false,
    name: (params.name as string) ?? "",
    nonce: (payload.nonce as string) ?? undefined,
  };
}

// ── Apple client_secret generator ────────────────────────────────────────────

async function generateAppleClientSecret(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = {
    alg: "ES256" as const,
    kid: appleKeyId(),
    typ: "JWT",
  };
  const claims = {
    iss: appleTeamId(),
    iat: now,
    exp: now + 86400 * 180, // 180 days max
    aud: "https://appleid.apple.com",
    sub: appleServiceId(),
  };

  // Import the Apple private key and sign
  const { importPKCS8, SignJWT } = await import("jose");
  const privateKey = await importPKCS8(applePrivateKey(), "ES256");

  return new SignJWT(claims)
    .setProtectedHeader(header)
    .sign(privateKey);
}

// ── Helper ───────────────────────────────────────────────────────────────────

function issueToken(userId: string): string {
  return jwt.sign({ sub: userId }, jwtSecret(), { expiresIn: "30d" });
}
