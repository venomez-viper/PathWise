# Google & Apple OAuth Social Login — Design Spec

**Date:** 2026-04-06
**Scope:** Backend OAuth endpoint, web + iOS frontend, UI polish for login pages

---

## 1. Architecture Overview

The flow works the same for both web and iOS:

1. **Client** (web or iOS) initiates OAuth with Google/Apple using their respective SDKs
2. **Web:** Client receives an **authorization code** from the provider
3. **iOS:** Client receives an **ID token** from the native SDK
4. **Client** sends the code/token to a new backend endpoint: `POST /auth/oauth`
5. **Backend** verifies the token (or exchanges the code server-side for a token, on web)
6. **Backend** extracts email + name from the verified token
7. **Backend** checks if a user with that email exists:
   - **Exists** → links the OAuth provider to that account, returns PathWise JWT
   - **Doesn't exist** → creates a new user (no password), links the provider, returns PathWise JWT
8. **Client** stores the JWT and proceeds (existing user → `/app`, new user → `/app/onboarding`)

**Key design decisions:**

- Single `POST /auth/oauth` endpoint handles both providers (distinguished by `provider` field)
- New `user_oauth_providers` table links provider IDs to user accounts (supports multiple providers per user)
- Users created via OAuth have a `null` password_hash — they can optionally set a password later in Settings
- The backend response includes an `isNewUser` flag so the frontend knows whether to route to onboarding
- Auto-link accounts only when the provider reports `email_verified: true`
- Apple "Hide My Email" relay addresses are accepted as-is (required for App Store approval)

---

## 2. Database Schema

### New migration: `3_add_oauth_providers.up.sql`

```sql
CREATE TABLE user_oauth_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,          -- 'google' or 'apple'
    provider_user_id TEXT NOT NULL,  -- sub claim from the ID token
    email TEXT,                      -- email from provider (relay email for Apple Hide My Email)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(provider, provider_user_id)
);

CREATE INDEX idx_oauth_providers_user_id ON user_oauth_providers(user_id);
```

### New migration: `4_make_password_nullable.up.sql`

```sql
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
```

Makes `password_hash` nullable so OAuth-only users don't need a password.

### Lookup logic

1. Find by `(provider, provider_user_id)` in `user_oauth_providers` → existing linked account
2. Fallback: find by verified email in `users` table → auto-link
3. No match: create new user + provider link

---

## 3. Backend API

### New endpoint: `POST /auth/oauth`

```
Request:
{
  provider: "google" | "apple",
  code?: string,             // authorization code (web)
  id_token?: string,         // ID token (iOS only)
  code_verifier?: string,    // PKCE verifier (Google web only)
  name?: string,             // Apple first-login name
  nonce?: string,            // for replay protection
  platform: "web" | "ios"
}

Response:
{
  token: string,             // PathWise JWT
  user: User,
  isNewUser: boolean
}
```

### Token verification — Google

- **Web:** Exchange `code` + `code_verifier` with Google's token endpoint server-to-server → receive ID token, then verify
- **iOS:** Verify `id_token` directly
- Fetch Google's JWKS from `https://www.googleapis.com/oauth2/v3/certs`
- Verify JWT signature, check `aud` matches Google Client ID (web or iOS), check `iss` is `accounts.google.com`
- Extract `sub`, `email`, `email_verified`, `name`

### Token verification — Apple

- **Web:** Exchange `code` using a signed `client_secret` JWT with Apple's token endpoint server-to-server → receive ID token, then verify
- **iOS:** Verify `id_token` directly
- Fetch Apple's JWKS from `https://appleid.apple.com/auth/keys`
- Verify JWT signature, check `aud` matches Apple Bundle/Service ID, check `iss` is `https://appleid.apple.com`
- Extract `sub`, `email`, `email_verified`, `name`
- Apple `client_secret` is a JWT signed with your `.p8` private key (team ID + key ID)

### Security measures

- **PKCE** (Google web): `code_verifier` / `code_challenge` prevents authorization code interception
- **Nonce:** Frontend generates a random nonce, includes it in OAuth request. Backend verifies nonce claim in ID token matches — prevents replay attacks
- **State parameter:** Random value stored in sessionStorage before redirect, verified on callback — prevents CSRF
- **All token exchange happens server-side** on web — no ID tokens or secrets in the browser
- **JWKS caching:** Cache provider public keys with TTL to reduce external calls

### New Encore secrets

- `GoogleClientID` — web token verification
- `GoogleClientSecret` — web code exchange
- `GoogleIOSClientID` — iOS token verification (different `aud`)
- `AppleBundleID` — iOS token verification
- `AppleServiceID` — web Apple Sign-In
- `AppleKeyID` — for signing Apple client_secret JWT
- `AppleTeamID` — for Apple client_secret JWT
- `ApplePrivateKey` — `.p8` key contents for signing

### Changes to existing endpoints

- `POST /auth/change-password` — if user has no password (OAuth-only), allow setting one without requiring `oldPassword`
- `POST /auth/signin` — reject with clear error if user has no password: "This account uses Google/Apple sign-in. Set a password in Settings, or sign in with your provider."

---

## 4. Frontend — Web

### Google Sign-In (Authorization Code flow with PKCE)

- Use `@react-oauth/google` with `GoogleOAuthProvider` wrapping the app
- `useGoogleLogin({ flow: 'auth-code' })` to get an authorization code
- Frontend generates `code_verifier` and `nonce`
- Send `code` + `code_verifier` + `nonce` + `platform: "web"` to `POST /auth/oauth`

### Apple Sign-In (Authorization Code flow)

- Use Apple's JS SDK (`appleid.auth.init`) loaded via script tag
- Configure with `AppleServiceID`, redirect URI, `usePopup: true`
- Apple returns authorization code + optional `user` object (name on first login only)
- Send `code` + `name` + `nonce` + `platform: "web"` to `POST /auth/oauth`

### Changes to SignIn/SignUp pages

- Wire up existing Google/Apple buttons with onClick handlers
- After `POST /auth/oauth` succeeds:
  - Store JWT via `tokenStore.set()`
  - If `isNewUser` → navigate to `/app/onboarding`
  - If existing user → navigate to `/app`
- Show loading state on buttons during OAuth flow
- Error handling: show inline error message if OAuth fails

### Changes to Settings page

- Show "Set Password" option if user has no password (OAuth-only accounts)

### Changes to `api.ts`

- Add `auth.oauth({ provider, code?, id_token?, code_verifier?, name?, nonce?, platform })` method

---

## 5. iOS Implementation

### Google Sign-In

- Use `GoogleSignIn` Swift SDK (SPM: `google-signin-ios`)
- Configure with `GoogleIOSClientID` in `Info.plist` as a URL scheme
- `GIDSignIn.sharedInstance.signIn()` → returns `GIDGoogleUser` with `idToken`
- Send `id_token` + `nonce` + `platform: "ios"` to `POST /auth/oauth`

### Apple Sign-In

- Use native `AuthenticationServices` framework (no third-party dependency)
- `ASAuthorizationAppleIDProvider` → presents system sign-in sheet
- Returns `ASAuthorizationAppleIDCredential` with `identityToken` (JWT) and optional `fullName`
- Send `id_token` + `name` + `nonce` + `platform: "ios"` to `POST /auth/oauth`
- Store Apple's `user` identifier in Keychain for credential revocation detection

### Credential revocation handling

- On app launch, check `getCredentialState(forUserID:)` for Apple users
- If `.revoked`, clear local session and force re-login

---

## 6. Social Button Branding

### Icon components

- `src/components/icons/GoogleIcon.tsx` — official Google "G" logo as inline SVG
- `src/components/icons/AppleIcon.tsx` — official Apple logo as inline SVG

### Button styling

- **Google:** White background, Google "G" logo, "Continue with Google" text, border
- **Apple:** Black background, white Apple logo, "Continue with Apple" text
- Both buttons: 48px height, `font-weight: 600`, consistent with primary button sizing
- Follow Google and Apple branding guidelines (required for app review)

### iOS native buttons

- Apple: use `ASAuthorizationAppleIDButton` (system-styled)
- Google: use `GIDSignInButton` or custom button with logo asset

---

## 7. UI Polish — Login/SignUp Pages

### Fixes

1. **Social buttons** — currently plain text, no icons. Restyle with logo + label layout, proper branding colors, 48px height
2. **Inconsistent label text** — SignIn has "Email Address", SignUp has "Email". Normalize to "Email" on both
3. **Input label font size** — bump from `0.72rem` to `0.78rem` for readability
4. **Divider text size** — bump from `0.72rem` to `0.78rem`
5. **Forgot password link** — has `cursor: default` looking broken. Style with reduced opacity (`0.5`) and `cursor: not-allowed` until implemented
6. **Inline styles cleanup** — move SignUp `marginBottom: 0` and SignIn `marginTop: 1.5rem` to CSS classes
7. **Footer consistency** — SignUp page missing footer links (Privacy/Terms/Support). Add to both pages
8. **Auth switch spacing** — move inline margin to CSS

---

## 8. Error Handling & Edge Cases

### Token verification failures

- Invalid/expired ID token → `400` with "Authentication failed. Please try again."
- Provider unreachable (JWKS fetch fails) → `503` with "Sign-in temporarily unavailable. Please try again shortly."
- Cache JWKS keys with TTL to reduce external calls and handle brief outages

### Account edge cases

- OAuth user tries email/password signin (no password set) → "This account uses Google/Apple sign-in. Set a password in Settings, or sign in with your provider."
- Same user links both Google and Apple (different emails) → works fine, `user_oauth_providers` supports multiple rows per user
- Apple "Hide My Email" user later signs in with Google using real email → auto-links if real email matches existing user, otherwise separate account
- Apple stops sending name after first auth → persist name on first login, never overwrite with empty

### Rate limiting

- Apply same rate limits to `/auth/oauth` as existing signin/signup

---

## 9. Testing Plan

- Unit tests for token verification logic (mock JWKS responses)
- Unit tests for PKCE code_verifier/code_challenge generation
- Integration tests for the full OAuth flow (mock provider tokens)
- Test auto-link scenarios: new user, existing email match, existing provider match
- Test null password flows: OAuth-only user setting first password, rejected email/password signin
- Test nonce verification (replay prevention)
- Test Apple "Hide My Email" relay address handling
