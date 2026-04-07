# Google & Apple OAuth Social Login — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Google and Apple social login to PathWise (web + iOS), with secure server-side token exchange, auto-account-linking, branded buttons, and login page UI polish.

**Architecture:** Single `POST /auth/oauth` backend endpoint accepts authorization codes (web) or ID tokens (iOS), verifies with provider server-to-server, auto-links by verified email, and returns a PathWise JWT. Frontend uses `@react-oauth/google` and Apple JS SDK with auth code flows + PKCE/nonce.

**Tech Stack:** Encore.dev (TypeScript), React 19, `@react-oauth/google`, Apple JS SDK, `jose` (JWKS verification), Swift/SwiftUI (iOS)

---

## File Structure

### Backend (new/modified)
| File | Action | Responsibility |
|------|--------|---------------|
| `backend/auth/migrations/3_add_oauth_providers.up.sql` | Create | OAuth providers table |
| `backend/auth/migrations/4_make_password_nullable.up.sql` | Create | Allow null password_hash |
| `backend/auth/oauth.ts` | Create | OAuth endpoint, token verification, provider linking |
| `backend/auth/auth.ts` | Modify | Update signin to handle null passwords, update changePassword for OAuth-only users |
| `backend/package.json` | Modify | Add `jose` dependency |

### Frontend (new/modified)
| File | Action | Responsibility |
|------|--------|---------------|
| `src/components/icons/GoogleIcon.tsx` | Create | Google "G" logo SVG component |
| `src/components/icons/AppleIcon.tsx` | Create | Apple logo SVG component |
| `src/lib/api.ts` | Modify | Add `auth.oauth()` method |
| `src/lib/oauth.ts` | Create | OAuth helpers: PKCE generation, nonce, Apple SDK loader |
| `src/pages/SignIn/index.tsx` | Modify | Wire social buttons, add icons, fix UI |
| `src/pages/SignUp/index.tsx` | Modify | Wire social buttons, add icons, fix UI |
| `src/pages/Settings/index.tsx` | Modify | Handle OAuth-only users (set password) |
| `src/App.tsx` | Modify | Wrap with GoogleOAuthProvider |
| `src/App.css` | Modify | Updated social button styles, UI fixes |
| `index.html` | Modify | Add Apple JS SDK script |
| `package.json` | Modify | Add `@react-oauth/google` |

---

### Task 1: Database Migrations

**Files:**
- Create: `backend/auth/migrations/3_add_oauth_providers.up.sql`
- Create: `backend/auth/migrations/4_make_password_nullable.up.sql`

- [ ] **Step 1: Create OAuth providers table migration**

Create `backend/auth/migrations/3_add_oauth_providers.up.sql`:

```sql
CREATE TABLE user_oauth_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    provider_user_id TEXT NOT NULL,
    email TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(provider, provider_user_id)
);

CREATE INDEX idx_oauth_providers_user_id ON user_oauth_providers(user_id);
```

Note: `user_id` is `TEXT` to match the existing `users.id` column type.

- [ ] **Step 2: Create password nullable migration**

Create `backend/auth/migrations/4_make_password_nullable.up.sql`:

```sql
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
ALTER TABLE users ALTER COLUMN password_hash SET DEFAULT NULL;
```

- [ ] **Step 3: Commit**

```bash
git add backend/auth/migrations/3_add_oauth_providers.up.sql backend/auth/migrations/4_make_password_nullable.up.sql
git commit -m "feat: add OAuth providers table and make password_hash nullable"
```

---

### Task 2: Install Backend Dependencies

**Files:**
- Modify: `backend/package.json`

- [ ] **Step 1: Install jose for JWKS verification**

```bash
cd /home/admin1/PathWise/backend && npm install jose
```

`jose` provides `jwtVerify` and `createRemoteJWKSet` for verifying Google/Apple ID tokens against their public JWKS endpoints. No `@types` needed — `jose` ships its own TypeScript types.

- [ ] **Step 2: Commit**

```bash
git add backend/package.json backend/package-lock.json
git commit -m "feat: add jose dependency for OAuth token verification"
```

---

### Task 3: Backend OAuth Endpoint

**Files:**
- Create: `backend/auth/oauth.ts`

- [ ] **Step 1: Create the OAuth module**

Create `backend/auth/oauth.ts`:

```typescript
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
  };
}

// ── Apple client_secret generator ────────────────────────────────────────────

async function generateAppleClientSecret(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = {
    alg: "ES256",
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
```

- [ ] **Step 2: Verify the file compiles**

```bash
cd /home/admin1/PathWise/backend && npx tsc --noEmit
```

Expected: no errors (Encore may need `encore run` to fully validate, but tsc catches syntax/type issues).

- [ ] **Step 3: Commit**

```bash
git add backend/auth/oauth.ts
git commit -m "feat: add POST /auth/oauth endpoint with Google and Apple verification"
```

---

### Task 4: Update Existing Auth Endpoints

**Files:**
- Modify: `backend/auth/auth.ts:106-135` (signin)
- Modify: `backend/auth/auth.ts:220-242` (changePassword)

- [ ] **Step 1: Update signin to handle OAuth-only users**

In `backend/auth/auth.ts`, replace the signin handler (lines 106-135) with a version that checks for null password_hash:

Replace:
```typescript
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
```

With:
```typescript
export const signin = api(
  { expose: true, method: "POST", path: "/auth/signin", auth: false },
  async (params: SignInParams): Promise<TokenResponse> => {
    const row = await db.queryRow`
      SELECT id, name, email, avatar_url, plan, password_hash
      FROM users WHERE email = ${params.email}
    `;

    // OAuth-only user (no password set) — guide them to use social login
    if (row && !row.password_hash) {
      throw APIError.unauthenticated(
        "This account uses Google or Apple sign-in. Please use that method, or set a password in Settings."
      );
    }

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
```

- [ ] **Step 2: Update changePassword to support OAuth-only users setting first password**

In `backend/auth/auth.ts`, replace the changePassword handler (lines 220-242) with:

Replace:
```typescript
export const changePassword = api(
  { expose: true, method: "POST", path: "/auth/change-password", auth: true },
  async (params: ChangePasswordParams): Promise<{ success: boolean }> => {
    const { userID } = getAuthData<AuthData>()!;

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
```

With:
```typescript
export interface ChangePasswordParams {
  currentPassword?: string;
  newPassword: string;
}

export const changePassword = api(
  { expose: true, method: "POST", path: "/auth/change-password", auth: true },
  async (params: ChangePasswordParams): Promise<{ success: boolean }> => {
    const { userID } = getAuthData<AuthData>()!;

    if (params.newPassword.length < 8) {
      throw APIError.invalidArgument("new password must be at least 8 characters");
    }

    const row = await db.queryRow`
      SELECT password_hash FROM users WHERE id = ${userID}
    `;
    if (!row) throw APIError.notFound("user not found");

    // OAuth-only user setting their first password
    if (!row.password_hash) {
      const newHash = await bcrypt.hash(params.newPassword, 12);
      await db.exec`UPDATE users SET password_hash = ${newHash} WHERE id = ${userID}`;
      return { success: true };
    }

    // Existing password user — verify current password
    if (!params.currentPassword) {
      throw APIError.invalidArgument("current password is required");
    }

    const match = await bcrypt.compare(params.currentPassword, row.password_hash);
    if (!match) throw APIError.unauthenticated("current password is incorrect");

    const newHash = await bcrypt.hash(params.newPassword, 12);
    await db.exec`UPDATE users SET password_hash = ${newHash} WHERE id = ${userID}`;

    return { success: true };
  }
);
```

Note: Also remove the duplicate `ChangePasswordParams` interface that already exists above the handler (lines 215-218), since we're redefining it with the optional `currentPassword`.

- [ ] **Step 3: Commit**

```bash
git add backend/auth/auth.ts
git commit -m "feat: handle OAuth-only users in signin and changePassword"
```

---

### Task 5: Install Frontend Dependencies

**Files:**
- Modify: `package.json` (root)

- [ ] **Step 1: Install @react-oauth/google**

```bash
cd /home/admin1/PathWise && npm install @react-oauth/google
```

- [ ] **Step 2: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: add @react-oauth/google dependency"
```

---

### Task 6: Create Icon Components

**Files:**
- Create: `src/components/icons/GoogleIcon.tsx`
- Create: `src/components/icons/AppleIcon.tsx`

- [ ] **Step 1: Create GoogleIcon component**

Create `src/components/icons/GoogleIcon.tsx`:

```tsx
export default function GoogleIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}
```

- [ ] **Step 2: Create AppleIcon component**

Create `src/components/icons/AppleIcon.tsx`:

```tsx
export default function AppleIcon({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill={color}>
      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
    </svg>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/icons/GoogleIcon.tsx src/components/icons/AppleIcon.tsx
git commit -m "feat: add Google and Apple logo icon components"
```

---

### Task 7: Create OAuth Helper Utilities

**Files:**
- Create: `src/lib/oauth.ts`

- [ ] **Step 1: Create OAuth helpers**

Create `src/lib/oauth.ts`:

```typescript
/**
 * OAuth utilities: PKCE, nonce generation, Apple SDK loader
 */

// ── PKCE (for Google web auth code flow) ─────────────────────────────────────

function generateRandomString(length: number): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function generateNonce(): string {
  return generateRandomString(16);
}

export function generateCodeVerifier(): string {
  return generateRandomString(32);
}

export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// ── Apple JS SDK loader ──────────────────────────────────────────────────────

let appleSDKLoaded = false;

export function loadAppleSDK(): Promise<void> {
  if (appleSDKLoaded) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src =
      "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js";
    script.onload = () => {
      appleSDKLoaded = true;
      resolve();
    };
    script.onerror = () => reject(new Error("Failed to load Apple Sign-In SDK"));
    document.head.appendChild(script);
  });
}

declare global {
  interface Window {
    AppleID: {
      auth: {
        init: (config: {
          clientId: string;
          scope: string;
          redirectURI: string;
          state?: string;
          nonce?: string;
          usePopup: boolean;
        }) => void;
        signIn: () => Promise<{
          authorization: {
            code: string;
            id_token: string;
            state?: string;
          };
          user?: {
            name?: { firstName?: string; lastName?: string };
            email?: string;
          };
        }>;
      };
    };
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/oauth.ts
git commit -m "feat: add OAuth helper utilities (PKCE, nonce, Apple SDK loader)"
```

---

### Task 8: Add OAuth Method to API Client

**Files:**
- Modify: `src/lib/api.ts:69-86`

- [ ] **Step 1: Add oauth method to auth object**

In `src/lib/api.ts`, replace the auth object (lines 69-86) with:

```typescript
// --- Auth ---
export const auth = {
  signup: (data: { name: string; email: string; password: string }) =>
    request<{ token: string; user: { id: string; name: string; email: string; plan: string } }>(
      '/auth/signup', { method: 'POST', body: JSON.stringify(data) }
    ),
  signin: (data: { email: string; password: string }) =>
    request<{ token: string; user: { id: string; name: string; email: string; plan: string } }>(
      '/auth/signin', { method: 'POST', body: JSON.stringify(data) }
    ),
  oauth: (data: {
    provider: 'google' | 'apple';
    code?: string;
    id_token?: string;
    code_verifier?: string;
    name?: string;
    nonce?: string;
    platform: 'web' | 'ios';
  }) =>
    request<{ token: string; user: { id: string; name: string; email: string; avatarUrl?: string; plan: string }; isNewUser: boolean }>(
      '/auth/oauth', { method: 'POST', body: JSON.stringify(data) }
    ),
  me: () =>
    request<{ user: { id: string; name: string; email: string; avatarUrl?: string; plan: string } }>('/auth/me'),
  updateProfile: (data: { name?: string; avatarUrl?: string }) =>
    request<{ user: { id: string; name: string; email: string; avatarUrl?: string; plan: string } }>(
      '/auth/me', { method: 'PATCH', body: JSON.stringify(data) }
    ),
  changePassword: (data: { currentPassword?: string; newPassword: string }) =>
    request<{ success: boolean }>('/auth/change-password', { method: 'POST', body: JSON.stringify(data) }),
};
```

Key changes:
- Added `oauth()` method
- Made `currentPassword` optional in `changePassword` (for OAuth-only users)

- [ ] **Step 2: Commit**

```bash
git add src/lib/api.ts
git commit -m "feat: add auth.oauth() API method and update changePassword signature"
```

---

### Task 9: Wrap App with GoogleOAuthProvider

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Add GoogleOAuthProvider wrapper**

In `src/App.tsx`, add import at the top (after existing imports, around line 6):

```typescript
import { GoogleOAuthProvider } from '@react-oauth/google';
```

Then wrap the `BrowserRouter` with `GoogleOAuthProvider`. Replace lines 110-111:

```typescript
    <BrowserRouter>
      <AuthProvider>
```

With:

```typescript
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ''}>
    <BrowserRouter>
      <AuthProvider>
```

And replace lines 155-157:

```typescript
      </AuthProvider>
    </BrowserRouter>
    </Sentry.ErrorBoundary>
```

With:

```typescript
      </AuthProvider>
    </BrowserRouter>
    </GoogleOAuthProvider>
    </Sentry.ErrorBoundary>
```

- [ ] **Step 2: Commit**

```bash
git add src/App.tsx
git commit -m "feat: wrap app with GoogleOAuthProvider"
```

---

### Task 10: Update Social Button CSS

**Files:**
- Modify: `src/App.css`

- [ ] **Step 1: Update social button and auth UI styles**

In `src/App.css`, replace the social buttons section and fix UI issues. Replace lines 258-280:

```css
/* Social buttons */
.auth-social-row {
  display: flex;
  gap: 10px;
}

.btn-auth-social {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--surface-container-high);
  background: var(--surface-container-low);
  color: var(--on-surface);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-auth-social:hover { background: var(--surface-container); }
```

With:

```css
/* Social buttons */
.auth-social-row {
  display: flex;
  gap: 10px;
}

.auth-social-row--spaced {
  margin-bottom: 0;
}

.btn-auth-social {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: 48px;
  padding: 0 16px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--surface-container-high);
  background: var(--surface-container-lowest);
  color: var(--on-surface);
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, box-shadow 0.15s;
}
.btn-auth-social:hover {
  background: var(--surface-container);
  box-shadow: var(--shadow-sm);
}
.btn-auth-social:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-auth-social--apple {
  background: #000;
  color: #fff;
  border-color: #000;
}
.btn-auth-social--apple:hover {
  background: #1a1a1a;
}

.auth-switch--spaced {
  margin-top: 1.5rem;
}
```

- [ ] **Step 2: Fix input label and divider font sizes**

In `src/App.css`, replace line 116:

```css
  font-size: 0.72rem;
```

(inside `.input-label`) with:

```css
  font-size: 0.78rem;
```

And replace lines 250-251:

```css
  font-size: 0.72rem;
```

(inside `.auth-divider span`) with:

```css
  font-size: 0.78rem;
```

- [ ] **Step 3: Commit**

```bash
git add src/App.css
git commit -m "feat: restyle social buttons with branding, fix font sizes"
```

---

### Task 11: Update SignIn Page

**Files:**
- Modify: `src/pages/SignIn/index.tsx`

- [ ] **Step 1: Rewrite SignIn with OAuth integration and UI fixes**

Replace the entire contents of `src/pages/SignIn/index.tsx`:

```tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import Logo from '../../components/ui/Logo';
import GoogleIcon from '../../components/icons/GoogleIcon';
import AppleIcon from '../../components/icons/AppleIcon';
import { auth, tokenStore } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import { generateNonce, loadAppleSDK } from '../../lib/oauth';

type AuthUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  plan: 'free' | 'premium';
};

export default function SignIn() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'apple' | null>(null);

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const handleOAuthSuccess = (res: { token: string; user: AuthUser; isNewUser: boolean }) => {
    tokenStore.set(res.token);
    login(res.user);
    navigate(res.isNewUser ? '/app/onboarding' : '/app');
  };

  // ── Google ──
  const googleLogin = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: async (codeResponse) => {
      setOauthLoading('google');
      setError('');
      try {
        const res = await auth.oauth({
          provider: 'google',
          code: codeResponse.code,
          platform: 'web',
        });
        handleOAuthSuccess(res as { token: string; user: AuthUser; isNewUser: boolean });
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Google sign-in failed. Please try again.');
      } finally {
        setOauthLoading(null);
      }
    },
    onError: () => {
      setError('Google sign-in was cancelled.');
    },
  });

  // ── Apple ──
  const handleAppleLogin = async () => {
    setOauthLoading('apple');
    setError('');
    try {
      await loadAppleSDK();
      const nonce = generateNonce();

      window.AppleID.auth.init({
        clientId: import.meta.env.VITE_APPLE_SERVICE_ID ?? '',
        scope: 'name email',
        redirectURI: window.location.origin,
        nonce,
        usePopup: true,
      });

      const appleRes = await window.AppleID.auth.signIn();
      const name = appleRes.user?.name
        ? `${appleRes.user.name.firstName ?? ''} ${appleRes.user.name.lastName ?? ''}`.trim()
        : undefined;

      const res = await auth.oauth({
        provider: 'apple',
        code: appleRes.authorization.code,
        name,
        nonce,
        platform: 'web',
      });
      handleOAuthSuccess(res as { token: string; user: AuthUser; isNewUser: boolean });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (!msg.includes('popup_closed')) {
        setError(msg || 'Apple sign-in failed. Please try again.');
      }
    } finally {
      setOauthLoading(null);
    }
  };

  // ── Email/Password ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await auth.signin({ email: form.email, password: form.password });
      tokenStore.set(res.token);
      login(res.user as AuthUser);
      navigate('/app');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      setError(msg.includes('fetch') ? 'Could not reach the server. Check your connection.' : (msg || 'Sign in failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const isLoading = loading || oauthLoading !== null;

  return (
    <div className="auth-page">
      <div className="auth-brand">
        <Logo size={32} variant="full" />
      </div>

      <div className="auth-card">
        <div className="auth-card-header">
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Continue your journey to career mastery.</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <div className="input-label-row">
              <label className="input-label">Email</label>
            </div>
            <div className="input-wrap">
              <Mail size={16} className="input-icon" />
              <input
                type="email"
                className="auth-input"
                placeholder="name@example.com"
                value={form.email}
                onChange={set('email')}
                required
                autoComplete="email"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="input-group">
            <div className="input-label-row">
              <label className="input-label">Password</label>
              <span className="auth-link-sm" style={{ opacity: 0.5, cursor: 'not-allowed' }}>Forgot password?</span>
            </div>
            <div className="input-wrap">
              <Lock size={16} className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                className="auth-input"
                placeholder="••••••••"
                value={form.password}
                onChange={set('password')}
                required
                autoComplete="current-password"
                disabled={isLoading}
              />
              <button
                type="button"
                className="input-eye"
                onClick={() => setShowPassword(p => !p)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-auth-primary" disabled={isLoading}>
            {loading ? 'Signing in…' : <>Log In <ArrowRight size={16} /></>}
          </button>
        </form>

        <div className="auth-divider">
          <span>Or continue with</span>
        </div>

        <div className="auth-social-row">
          <button
            type="button"
            className="btn-auth-social"
            onClick={() => googleLogin()}
            disabled={isLoading}
          >
            <GoogleIcon size={18} />
            {oauthLoading === 'google' ? 'Signing in…' : 'Google'}
          </button>
          <button
            type="button"
            className="btn-auth-social btn-auth-social--apple"
            onClick={handleAppleLogin}
            disabled={isLoading}
          >
            <AppleIcon size={18} color="#fff" />
            {oauthLoading === 'apple' ? 'Signing in…' : 'Apple'}
          </button>
        </div>

        <p className="auth-switch auth-switch--spaced">
          Don't have an account?{' '}
          <Link to="/signup" className="auth-link-bold">Sign Up</Link>
        </p>
      </div>

      <div className="auth-footer">
        <Link to="/privacy-policy">Privacy Policy</Link>
        <Link to="/terms-of-service">Terms of Service</Link>
        <span style={{ cursor: 'default' }}>Support</span>
      </div>

      <div className="auth-glow" />
    </div>
  );
}
```

Key changes:
- Imported Google/Apple icons and OAuth utilities
- Added `useGoogleLogin` with auth-code flow
- Added Apple sign-in handler with SDK loading and nonce
- Wired both social buttons with loading states
- Fixed "Email Address" → "Email" label
- Fixed "Forgot password?" styling (opacity + not-allowed cursor)
- Moved inline margin to CSS class `auth-switch--spaced`
- Disabled all inputs during OAuth loading

- [ ] **Step 2: Commit**

```bash
git add src/pages/SignIn/index.tsx
git commit -m "feat: wire Google and Apple sign-in on SignIn page"
```

---

### Task 12: Update SignUp Page

**Files:**
- Modify: `src/pages/SignUp/index.tsx`

- [ ] **Step 1: Rewrite SignUp with OAuth integration and UI fixes**

Replace the entire contents of `src/pages/SignUp/index.tsx`:

```tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import Logo from '../../components/ui/Logo';
import GoogleIcon from '../../components/icons/GoogleIcon';
import AppleIcon from '../../components/icons/AppleIcon';
import { auth, tokenStore } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import { generateNonce, loadAppleSDK } from '../../lib/oauth';

type AuthUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  plan: 'free' | 'premium';
};

export default function SignUp() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'apple' | null>(null);

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const passwordsMatch = form.confirm === '' || form.password === form.confirm;

  const handleOAuthSuccess = (res: { token: string; user: AuthUser; isNewUser: boolean }) => {
    tokenStore.set(res.token);
    login(res.user);
    navigate(res.isNewUser ? '/app/onboarding' : '/app');
  };

  // ── Google ──
  const googleLogin = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: async (codeResponse) => {
      setOauthLoading('google');
      setError('');
      try {
        const res = await auth.oauth({
          provider: 'google',
          code: codeResponse.code,
          platform: 'web',
        });
        handleOAuthSuccess(res as { token: string; user: AuthUser; isNewUser: boolean });
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Google sign-in failed. Please try again.');
      } finally {
        setOauthLoading(null);
      }
    },
    onError: () => {
      setError('Google sign-in was cancelled.');
    },
  });

  // ── Apple ──
  const handleAppleLogin = async () => {
    setOauthLoading('apple');
    setError('');
    try {
      await loadAppleSDK();
      const nonce = generateNonce();

      window.AppleID.auth.init({
        clientId: import.meta.env.VITE_APPLE_SERVICE_ID ?? '',
        scope: 'name email',
        redirectURI: window.location.origin,
        nonce,
        usePopup: true,
      });

      const appleRes = await window.AppleID.auth.signIn();
      const name = appleRes.user?.name
        ? `${appleRes.user.name.firstName ?? ''} ${appleRes.user.name.lastName ?? ''}`.trim()
        : undefined;

      const res = await auth.oauth({
        provider: 'apple',
        code: appleRes.authorization.code,
        name,
        nonce,
        platform: 'web',
      });
      handleOAuthSuccess(res as { token: string; user: AuthUser; isNewUser: boolean });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (!msg.includes('popup_closed')) {
        setError(msg || 'Apple sign-in failed. Please try again.');
      }
    } finally {
      setOauthLoading(null);
    }
  };

  // ── Email/Password ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordsMatch) return;
    setError('');
    setLoading(true);
    try {
      const res = await auth.signup({ name: form.name, email: form.email, password: form.password });
      tokenStore.set(res.token);
      login(res.user as AuthUser);
      navigate('/app/onboarding');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      setError(msg.includes('fetch') ? 'Could not reach the server. Check your connection.' : (msg || 'Sign up failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const isLoading = loading || oauthLoading !== null;

  return (
    <div className="auth-page">
      <div className="auth-brand">
        <Logo size={32} variant="full" />
      </div>

      <div className="auth-card">
        <div className="auth-card-header">
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">Join the professional growth ecosystem.</p>
        </div>

        {/* Social login */}
        <div className="auth-social-row auth-social-row--spaced">
          <button
            type="button"
            className="btn-auth-social"
            onClick={() => googleLogin()}
            disabled={isLoading}
          >
            <GoogleIcon size={18} />
            {oauthLoading === 'google' ? 'Signing up…' : 'Google'}
          </button>
          <button
            type="button"
            className="btn-auth-social btn-auth-social--apple"
            onClick={handleAppleLogin}
            disabled={isLoading}
          >
            <AppleIcon size={18} color="#fff" />
            {oauthLoading === 'apple' ? 'Signing up…' : 'Apple'}
          </button>
        </div>

        <div className="auth-divider">
          <span>Or continue with email</span>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Full Name</label>
            <div className="input-wrap">
              <User size={16} className="input-icon" />
              <input
                type="text"
                className="auth-input"
                placeholder="John Doe"
                value={form.name}
                onChange={set('name')}
                required
                autoComplete="name"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Email</label>
            <div className="input-wrap">
              <Mail size={16} className="input-icon" />
              <input
                type="email"
                className="auth-input"
                placeholder="john@company.com"
                value={form.email}
                onChange={set('email')}
                required
                autoComplete="email"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <div className="input-wrap">
              <Lock size={16} className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                className="auth-input"
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={set('password')}
                required
                minLength={8}
                autoComplete="new-password"
                disabled={isLoading}
              />
              <button type="button" className="input-eye" onClick={() => setShowPassword(p => !p)}
                aria-label="Toggle password visibility">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Confirm Password</label>
            <div className={`input-wrap${!passwordsMatch ? ' input-error' : ''}`}>
              <Lock size={16} className="input-icon" />
              <input
                type={showConfirm ? 'text' : 'password'}
                className="auth-input"
                placeholder="Repeat your password"
                value={form.confirm}
                onChange={set('confirm')}
                required
                autoComplete="new-password"
                disabled={isLoading}
              />
              <button type="button" className="input-eye" onClick={() => setShowConfirm(p => !p)}
                aria-label="Toggle confirm password visibility">
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {!passwordsMatch && <p className="input-error-msg">Passwords don't match</p>}
          </div>

          <button type="submit" className="btn-auth-primary" disabled={isLoading || !passwordsMatch}>
            {loading ? 'Creating account…' : 'Sign Up'}
          </button>
        </form>

        <p className="auth-terms">
          By creating an account, you agree to PathWise's{' '}
          <Link to="/terms-of-service" className="auth-link-bold">Terms of Service</Link> and{' '}
          <Link to="/privacy-policy" className="auth-link-bold">Privacy Policy</Link>.
          We use your data to personalize your career roadmap.
        </p>

        <p className="auth-switch">
          Already have an account?{' '}
          <Link to="/signin" className="auth-link-bold">Log In</Link>
        </p>
      </div>

      <div className="auth-footer">
        <Link to="/privacy-policy">Privacy Policy</Link>
        <Link to="/terms-of-service">Terms of Service</Link>
        <span style={{ cursor: 'default' }}>Support</span>
      </div>

      <div className="auth-glow" />
    </div>
  );
}
```

Key changes:
- Added Google/Apple OAuth flows (identical logic to SignIn)
- Added branded icon buttons
- Removed inline `style={{ marginBottom: 0 }}`, replaced with CSS class `auth-social-row--spaced`
- Added footer links (was missing on SignUp)
- Disabled all inputs during OAuth loading

- [ ] **Step 2: Commit**

```bash
git add src/pages/SignUp/index.tsx
git commit -m "feat: wire Google and Apple sign-in on SignUp page"
```

---

### Task 13: Update Settings Page for OAuth-Only Users

**Files:**
- Modify: `src/pages/Settings/index.tsx`

- [ ] **Step 1: Update the password section to handle OAuth-only users**

In `src/pages/Settings/index.tsx`, the password change form (lines 162-179) needs to detect if the user has no password and show "Set Password" instead of "Update Password" with no current password field.

Since we can't easily detect OAuth-only status from the current user object, add a `hasPassword` check. The simplest approach: add a new field to the `/auth/me` response. However, to keep this task minimal, we'll try changing password with an empty `currentPassword` — if it fails, the user has a password and needs to enter it.

A simpler approach: add a `hasPassword` field to the user object.

In `backend/auth/auth.ts`, update the `me` endpoint to include `hasPassword`. Replace the `MeResponse` interface and `me` handler (lines 139-162):

Replace:
```typescript
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
```

With:
```typescript
export interface MeResponse {
  user: AuthUser;
  hasPassword: boolean;
}

export const me = api(
  { expose: true, method: "GET", path: "/auth/me", auth: true },
  async (): Promise<MeResponse> => {
    const { userID } = getAuthData<AuthData>()!;
    const row = await db.queryRow`
      SELECT id, name, email, avatar_url, plan, password_hash
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
      hasPassword: !!row.password_hash,
    };
  }
);
```

- [ ] **Step 2: Update auth-context to store hasPassword**

In `src/lib/auth-context.tsx`, update the `User` interface and context to include `hasPassword`:

Replace:
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  plan: 'free' | 'premium';
}
```

With:
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  plan: 'free' | 'premium';
  hasPassword?: boolean;
}
```

And update the `load` function to capture `hasPassword`. Replace:
```typescript
      const res = await auth.me();
      setUser(res.user as User);
```

With:
```typescript
      const res = await auth.me();
      setUser({ ...(res.user as User), hasPassword: (res as any).hasPassword });
```

- [ ] **Step 3: Update api.ts me() return type**

In `src/lib/api.ts`, update the `me` method return type. Replace:
```typescript
  me: () =>
    request<{ user: { id: string; name: string; email: string; avatarUrl?: string; plan: string } }>('/auth/me'),
```

With:
```typescript
  me: () =>
    request<{ user: { id: string; name: string; email: string; avatarUrl?: string; plan: string }; hasPassword: boolean }>('/auth/me'),
```

- [ ] **Step 4: Update Settings password section**

In `src/pages/Settings/index.tsx`, update the password form to handle OAuth-only users. Replace lines 152-179:

```typescript
          <div style={{ marginTop: '1rem' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginBottom: 4 }}>Security</p>
            <button
              className="settings-input"
              style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', textAlign: 'left' }}
              onClick={() => { setShowPasswordForm(v => !v); setPwError(''); setPwSuccess(false); }}
            >
              <span>Update Password</span>
              <ChevronRight size={15} color="var(--on-surface-variant)" />
            </button>
          </div>
          {showPasswordForm && (
            <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {pwSuccess ? (
                <p style={{ fontSize: '0.82rem', color: 'var(--secondary)', fontWeight: 600 }}>Password updated.</p>
              ) : (
                <>
                  {['current', 'newPw', 'confirm'].map(f => (
                    <input key={f} type="password" className="settings-input" placeholder={f === 'current' ? 'Current password' : f === 'newPw' ? 'New password' : 'Confirm new password'}
                      value={pwForm[f as keyof typeof pwForm]} onChange={e => setPwForm(p => ({ ...p, [f]: e.target.value }))} />
                  ))}
                  {pwError && <p style={{ fontSize: '0.78rem', color: '#ef4444' }}>{pwError}</p>}
                  <button className="btn-page-action" style={{ alignSelf: 'flex-start', background: '#8b4f2c' }} disabled={pwSaving} onClick={savePassword}>
                    {pwSaving ? 'Saving…' : 'Update Password'}
                  </button>
                </>
              )}
            </div>
          )}
```

With:
```typescript
          <div style={{ marginTop: '1rem' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginBottom: 4 }}>Security</p>
            <button
              className="settings-input"
              style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', textAlign: 'left' }}
              onClick={() => { setShowPasswordForm(v => !v); setPwError(''); setPwSuccess(false); }}
            >
              <span>{user?.hasPassword === false ? 'Set Password' : 'Update Password'}</span>
              <ChevronRight size={15} color="var(--on-surface-variant)" />
            </button>
          </div>
          {showPasswordForm && (
            <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {pwSuccess ? (
                <p style={{ fontSize: '0.82rem', color: 'var(--secondary)', fontWeight: 600 }}>
                  {user?.hasPassword === false ? 'Password set.' : 'Password updated.'}
                </p>
              ) : (
                <>
                  {user?.hasPassword !== false && (
                    <input type="password" className="settings-input" placeholder="Current password"
                      value={pwForm.current} onChange={e => setPwForm(p => ({ ...p, current: e.target.value }))} />
                  )}
                  {['newPw', 'confirm'].map(f => (
                    <input key={f} type="password" className="settings-input"
                      placeholder={f === 'newPw' ? 'New password' : 'Confirm new password'}
                      value={pwForm[f as keyof typeof pwForm]}
                      onChange={e => setPwForm(p => ({ ...p, [f]: e.target.value }))} />
                  ))}
                  {pwError && <p style={{ fontSize: '0.78rem', color: '#ef4444' }}>{pwError}</p>}
                  <button className="btn-page-action" style={{ alignSelf: 'flex-start', background: '#8b4f2c' }} disabled={pwSaving} onClick={savePassword}>
                    {pwSaving ? 'Saving…' : (user?.hasPassword === false ? 'Set Password' : 'Update Password')}
                  </button>
                </>
              )}
            </div>
          )}
```

- [ ] **Step 5: Update savePassword to handle OAuth-only users**

In `src/pages/Settings/index.tsx`, replace the `savePassword` function (lines 45-55):

```typescript
  const savePassword = async () => {
    if (pwForm.newPw !== pwForm.confirm) { setPwError('Passwords do not match.'); return; }
    if (pwForm.newPw.length < 8) { setPwError('Min 8 characters.'); return; }
    setPwSaving(true); setPwError('');
    try {
      await authApi.changePassword({ currentPassword: pwForm.current, newPassword: pwForm.newPw });
      setPwSuccess(true); setPwForm({ current: '', newPw: '', confirm: '' });
      setTimeout(() => { setPwSuccess(false); setShowPasswordForm(false); }, 2500);
    } catch (err: unknown) { setPwError(err instanceof Error ? err.message : 'Failed to change password.'); }
    finally { setPwSaving(false); }
  };
```

With:
```typescript
  const savePassword = async () => {
    if (pwForm.newPw !== pwForm.confirm) { setPwError('Passwords do not match.'); return; }
    if (pwForm.newPw.length < 8) { setPwError('Min 8 characters.'); return; }
    setPwSaving(true); setPwError('');
    try {
      const data = user?.hasPassword === false
        ? { newPassword: pwForm.newPw }
        : { currentPassword: pwForm.current, newPassword: pwForm.newPw };
      await authApi.changePassword(data);
      setPwSuccess(true); setPwForm({ current: '', newPw: '', confirm: '' });
      await refresh();
      setTimeout(() => { setPwSuccess(false); setShowPasswordForm(false); }, 2500);
    } catch (err: unknown) { setPwError(err instanceof Error ? err.message : 'Failed to change password.'); }
    finally { setPwSaving(false); }
  };
```

- [ ] **Step 6: Commit**

```bash
git add backend/auth/auth.ts src/lib/auth-context.tsx src/lib/api.ts src/pages/Settings/index.tsx
git commit -m "feat: handle OAuth-only users in Settings password section"
```

---

### Task 14: Add Environment Variables Documentation

**Files:**
- Create: `docs/superpowers/specs/oauth-env-setup.md`

- [ ] **Step 1: Document required environment variables and secrets**

Create `docs/superpowers/specs/oauth-env-setup.md`:

```markdown
# OAuth Environment Setup

## Frontend Environment Variables (`.env`)

```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
VITE_APPLE_SERVICE_ID=com.pathwise.web
```

## Backend Encore Secrets

Set via `encore secret set --env=local`:

```bash
echo "your-google-client-id" | encore secret set --env=local GoogleClientID
echo "your-google-client-secret" | encore secret set --env=local GoogleClientSecret
echo "your-google-ios-client-id" | encore secret set --env=local GoogleIOSClientID
echo "com.pathwise.ios" | encore secret set --env=local AppleBundleID
echo "com.pathwise.web" | encore secret set --env=local AppleServiceID
echo "XXXXXXXXXX" | encore secret set --env=local AppleTeamID
echo "YYYYYYYYYY" | encore secret set --env=local AppleKeyID
cat AuthKey_YYYYYYYYYY.p8 | encore secret set --env=local ApplePrivateKey
```

## Provider Setup

### Google Cloud Console
1. Create OAuth 2.0 credentials at console.cloud.google.com
2. Add authorized redirect URI: `postmessage` (for auth-code flow)
3. Create separate iOS client ID for mobile app
4. Enable "Google Identity" API

### Apple Developer Portal
1. Create a Service ID (for web) at developer.apple.com
2. Configure Sign In with Apple for the Service ID
3. Add web domain and return URL
4. Create a Sign In with Apple key (`.p8` file)
5. Note the Key ID and Team ID
6. Bundle ID is configured in Xcode project settings
```

- [ ] **Step 2: Commit**

```bash
git add docs/superpowers/specs/oauth-env-setup.md
git commit -m "docs: add OAuth environment setup guide"
```

---

### Task 15: Final Verification

- [ ] **Step 1: Run frontend type check**

```bash
cd /home/admin1/PathWise && npx tsc --noEmit
```

Expected: no type errors.

- [ ] **Step 2: Run frontend build**

```bash
cd /home/admin1/PathWise && npm run build
```

Expected: build succeeds.

- [ ] **Step 3: Run backend type check**

```bash
cd /home/admin1/PathWise/backend && npx tsc --noEmit
```

Expected: no type errors.

- [ ] **Step 4: Visual verification**

Start dev server and manually check:
- SignIn page: Google button (white with "G" logo), Apple button (black with Apple logo)
- SignUp page: same buttons at top
- Both pages: proper font sizes, consistent labels, footer links
- Click Google button → Google popup opens
- Click Apple button → Apple popup opens

- [ ] **Step 5: Final commit if any fixes needed**

```bash
git add -A && git commit -m "fix: address type check and build issues"
```
