# PathWise Security Headers Specification

**Date:** 2026-04-06  
**Status:** Ready for Implementation  
**Scope:** Frontend (Vercel) + Backend (Encore.dev gateway)

---

## 1. Threat Model and Current State

### What was observed

| Location | Finding | Severity |
|---|---|---|
| `index.html` lines 18-24 | Microsoft Clarity bootstrap script is a naked inline script — no nonce, no hash | P1 |
| `index.html` lines 26-32 | Google Analytics gtag inline initializer — same issue | P1 |
| `vercel.json` | No CSP header at all | P1 |
| `vercel.json` | No `Permissions-Policy` header | P2 |
| `src/lib/api.ts` | JWT stored in `localStorage` (XSS-readable) | P2 |
| `src/main.tsx` | PostHog API key hardcoded in source (`phc_tQX3...`) | P2 |
| `backend/auth/auth.ts` | No Encore CORS config found — defaults to Encore's permissive dev behaviour | P2 |
| `index.html` | No `<meta http-equiv="Content-Security-Policy">` tag | P1 |

### Sentry SDK network behaviour (v10.x `@sentry/react`)

The Sentry Browser SDK (`@sentry/react` ^10.47.0) makes outbound connections to:
- `https://o*.ingest.sentry.io` — event ingestion endpoint (the DSN host)
- `https://browser.sentry-cdn.com` — lazy-loaded Sentry replay worker chunk
- `https://*.sentry.io` — covers all ingest subdomains without needing to enumerate them

The Sentry script itself is bundled by Vite at build time (it is an npm dependency), so **no external `<script>` tag is needed**. Only `connect-src` and `worker-src` rules are required.

---

## 2. Content Security Policy

### 2.1 Design decisions

**Nonces vs hashes for inline scripts**

The two inline scripts in `index.html` (Microsoft Clarity loader and Google Analytics `gtag` initializer) cannot trivially receive a static hash because their content is fixed text — hashes would work. However, **nonces are the correct long-term approach** because Vite's build pipeline can inject a fresh nonce at the edge function level. For Vercel, the practical path today is:

1. Move the Clarity and GA inline scripts out of `index.html` and into a standalone `public/analytics-loader.js` file (external script, covered by `script-src` domain allowlist). This is the cleanest fix and removes the inline script problem entirely.
2. If moving them is not immediately feasible, compute SHA-256 hashes of the exact inline script text and add `'sha256-{hash}'` to `script-src`.

**`unsafe-inline` for styles**

Tailwind CSS and most CSS-in-JS approaches inject styles dynamically. Until a migration to static CSS extraction is complete, `'unsafe-inline'` on `style-src` is required. This is a known and accepted trade-off — it does not enable XSS on its own (only script execution matters for XSS), but it does allow CSS injection attacks. Accept this for now; it is tracked as tech debt below.

**`report-uri` / `report-to`**

CSP violation reports should be sent to a dedicated endpoint. Sentry natively supports being that endpoint via its Security Headers feature. The DSN is converted to a report endpoint by replacing `/api/{id}/` with `/api/{id}/security/`. This is the recommended configuration — it funnels CSP violations into the same observability tool already in use.

### 2.2 Inline script hashes (if not moving scripts to external files)

To compute the SHA-256 hashes of the current inline scripts:

```bash
# Clarity loader (index.html lines 18-24 — the content between the script tags)
printf '(function(c,l,a,r,i,t,y){\n        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};\n        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;\n        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);\n      })(window, document, "clarity", "script", "w8529y3h0y");' \
  | openssl dgst -sha256 -binary | base64

# GA gtag initializer (index.html lines 27-31)
printf "window.dataLayer = window.dataLayer || [];\n      function gtag(){dataLayer.push(arguments);}\n      gtag('js', new Date());\n      gtag('config', 'G-DY9L0KWV3B');" \
  | openssl dgst -sha256 -binary | base64
```

Paste the resulting base64 strings into the CSP as `'sha256-{output}'`.

**Preferred approach: move both to `public/analytics.js`**

```javascript
// public/analytics.js  (served as a static file — no inline script needed)

// Microsoft Clarity
(function(c,l,a,r,i,t,y){
  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "w8529y3h0y");

// Google Analytics
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-DY9L0KWV3B');
```

Then replace the inline blocks in `index.html` with:

```html
<!-- Analytics (external — covered by script-src allowlist) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-DY9L0KWV3B"></script>
<script src="/analytics.js"></script>
```

This eliminates all inline scripts and removes the need for `'unsafe-inline'` or hash entries in `script-src`.

### 2.3 Complete CSP header value

```
Content-Security-Policy:
  default-src 'self';
  script-src
    'self'
    https://www.googletagmanager.com
    https://www.clarity.ms
    https://us.i.posthog.com
    https://appleid.cdn-apple.com
    https://accounts.google.com;
  style-src
    'self'
    'unsafe-inline';
  img-src
    'self'
    data:
    blob:
    https://api.dicebear.com
    https://*.googleusercontent.com
    https://www.google-analytics.com
    https://www.clarity.ms;
  connect-src
    'self'
    https://staging-pathwise-4mxi.encr.app
    https://*.encr.app
    https://www.google-analytics.com
    https://analytics.google.com
    https://us.i.posthog.com
    https://www.clarity.ms
    https://*.ingest.sentry.io
    https://accounts.google.com
    https://appleid.apple.com;
  font-src
    'self'
    data:;
  worker-src
    'self'
    blob:;
  frame-src
    https://accounts.google.com
    https://appleid.apple.com;
  frame-ancestors
    'none';
  object-src
    'none';
  base-uri
    'self';
  form-action
    'self';
  upgrade-insecure-requests;
  report-uri https://o{YOUR_SENTRY_ORG_ID}.ingest.sentry.io/api/{YOUR_SENTRY_PROJECT_ID}/security/?sentry_key={YOUR_SENTRY_DSN_KEY};
```

**Notes on each directive:**

| Directive | Rationale |
|---|---|
| `default-src 'self'` | Fail-closed default. Anything not explicitly listed is blocked. |
| `script-src` — no `'unsafe-inline'` | After moving inline scripts to external files (section 2.2). If inline scripts remain, add the SHA-256 hashes here instead. |
| `style-src 'unsafe-inline'` | Required for Tailwind and dynamic CSS. Tech debt — see section 7. |
| `img-src blob:` | Required for Sentry Replay, which converts screenshots to blob URLs. |
| `connect-src https://*.encr.app` | Covers both staging and production Encore environments without needing to update the CSP when the prod URL is provisioned. |
| `connect-src https://*.ingest.sentry.io` | Sentry SDK sends events to `o{id}.ingest.sentry.io` — the subdomain varies by org. Wildcard on `ingest.sentry.io` is the safe allowlist. |
| `worker-src blob:` | Required for Sentry Replay's web worker chunk, which is loaded as a blob URL by the SDK internals. |
| `frame-src` Google + Apple | Required for OAuth popup/redirect flows. Remove these if OAuth is never enabled. |
| `frame-ancestors 'none'` | Redundant with `X-Frame-Options: DENY` but required for CSP-aware browsers that have deprecated `X-Frame-Options`. |
| `form-action 'self'` | Prevents form hijacking by blocking `<form action="https://attacker.com">` injections. |
| `upgrade-insecure-requests` | Forces all HTTP subresource loads to HTTPS. Important for mixed-content safety. |
| `report-uri` | Routes CSP violations to Sentry. Find the URL in Sentry → Project Settings → Security Headers. |

### 2.4 CSP in report-only mode (recommended rollout path)

Before enforcing, deploy in report-only mode for 1-2 weeks to catch legitimate resources being blocked:

```
Content-Security-Policy-Report-Only: [same value as above]
```

Switch to `Content-Security-Policy` only after the violation report volume has dropped to zero for non-test traffic.

---

## 3. Vercel Configuration (`vercel.json`)

### 3.1 Complete `vercel.json`

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' https://www.googletagmanager.com https://www.clarity.ms https://us.i.posthog.com https://appleid.cdn-apple.com https://accounts.google.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://api.dicebear.com https://*.googleusercontent.com https://www.google-analytics.com https://www.clarity.ms; connect-src 'self' https://staging-pathwise-4mxi.encr.app https://*.encr.app https://www.google-analytics.com https://analytics.google.com https://us.i.posthog.com https://www.clarity.ms https://*.ingest.sentry.io https://accounts.google.com https://appleid.apple.com; font-src 'self' data:; worker-src 'self' blob:; frame-src https://accounts.google.com https://appleid.apple.com; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests; report-uri https://o{SENTRY_ORG_ID}.ingest.sentry.io/api/{SENTRY_PROJECT_ID}/security/?sentry_key={SENTRY_DSN_KEY}"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "0"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=63072000; includeSubDomains; preload"
        },
        {
          "key": "Cross-Origin-Opener-Policy",
          "value": "same-origin-allow-popups"
        },
        {
          "key": "Cross-Origin-Resource-Policy",
          "value": "same-origin"
        },
        {
          "key": "Cross-Origin-Embedder-Policy",
          "value": "unsafe-none"
        }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ],
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

### 3.2 Header rationale

**`X-XSS-Protection: 0` (not `1; mode=block`)**

The value `1; mode=block` is actively harmful in modern browsers. The XSS Auditor it controls was removed from Chrome in 2019 and Firefox never implemented it. The `mode=block` behaviour can actually be abused as a side-channel to detect page content. The correct value is `0` — this tells modern browsers to disable the auditor entirely, which is what they already do. Your CSP is the real XSS defence.

**`Strict-Transport-Security: max-age=63072000` (2 years, not 1)**

The HSTS preload list requires `max-age` of at least 1 year. Two years is the recommended value for preload submission. The `preload` directive opts you into the browser preload lists (submit at https://hstspreload.org when ready). Only add `preload` once you are certain all subdomains serve HTTPS.

**`Cross-Origin-Opener-Policy: same-origin-allow-popups`**

`same-origin` would break Google OAuth and Apple Sign-In, both of which use popup windows for the authorization flow. `same-origin-allow-popups` gives you the cross-origin isolation protection on the main window while still allowing OAuth popups to communicate back via `window.opener`.

**`Cross-Origin-Embedder-Policy: unsafe-none`**

COEP `require-corp` would break loading DiceBear avatars and Google Analytics resources unless those providers add `Cross-Origin-Resource-Policy: cross-origin` headers (they don't). `unsafe-none` is the safe default until all third-party resources are CORP-compliant.

**`Permissions-Policy`**

`interest-cohort=()` opts out of Google's FLoC (Federated Learning of Cohorts). Even though FLoC was deprecated, the directive is harmless and signals privacy intent. `payment=()` is added because PathWise does not use the Payment Request API — blocking it reduces attack surface if Stripe's JS were compromised.

---

## 4. CORS Hardening (Encore Backend)

### 4.1 Current state

No explicit CORS configuration was found in the backend TypeScript source. Encore.dev's default CORS behaviour:

- In **local dev**: allows all origins.
- In **cloud/production**: by default, only same-origin requests are allowed unless an `allow_origins` policy is set in `encore.app`.

### 4.2 Finding

**Risk (P2):** Without explicit CORS configuration, the production behaviour depends entirely on Encore's built-in defaults. This is not visible in the codebase and could silently change with an Encore platform update. The `allow_origins_without_credentials: ["*"]` pattern mentioned in the task spec should not be used in production.

### 4.3 Recommended `encore.app` CORS config

The `encore.app` file is a binary/proprietary format that Encore manages. CORS policy in Encore is configured via the dashboard or the `encore.app` file's CORS section. The equivalent configuration to implement:

```json
{
  "cors": {
    "allow_origins_with_credentials": [
      "https://pathwise.app",
      "https://www.pathwise.app",
      "https://staging.pathwise.app"
    ],
    "allow_origins_without_credentials": [
      "https://pathwise.app",
      "https://www.pathwise.app"
    ],
    "allow_headers": ["Authorization", "Content-Type"],
    "expose_headers": ["X-Request-ID"],
    "allow_private_network_access": false
  }
}
```

**Why not `"*"` on `allow_origins_without_credentials`?**

Wildcard on non-credentialed CORS only covers requests without `Authorization` headers or cookies. Since PathWise sends `Authorization: Bearer {jwt}` on every authenticated API call, those requests already require credentialed CORS and `"*"` would not apply to them. However, allowing all origins even for unauthenticated endpoints (like `/auth/signup` and `/auth/signin`) means any site can POST to your auth endpoints from a browser context. Rate limiting (already present via `RateLimits.auth`) mitigates the severity, but restricting origins is defense in depth.

**Add `localhost:5173` and `localhost:4000` for local dev:**

These should be in a separate dev environment CORS config, not the production one. In Encore, environment-specific configs are set per environment in the cloud dashboard.

---

## 5. Subresource Integrity (SRI)

### 5.1 What SRI applies to

SRI hashes protect against CDN compromise — if the remote CDN serving a script is breached, the browser will refuse to execute the script if its hash does not match.

SRI only applies to **externally hosted scripts loaded via `<script src>` tags**. It does **not** apply to:
- Scripts bundled by Vite (these are self-hosted in `/assets/`)
- npm packages (Sentry, PostHog, etc.) — these are bundled at build time

### 5.2 Scripts that can receive SRI

**Currently in `index.html`:**

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-DY9L0KWV3B"></script>
```

This Google Tag Manager script **cannot reliably use SRI** because Google silently updates it and the hash would break within days of deployment. Google does not version or hash-lock its GTM script. This is a known limitation.

**Recommendation:** Accept the risk on the GTM script — your CSP domain allowlist (`https://www.googletagmanager.com`) already limits what domain this script can be loaded from. SRI would provide marginal additional protection but would cause frequent outages as Google updates the script.

**Apple Sign-In SDK (when enabled):**

```html
<!-- When Apple OAuth is added, use: -->
<script
  type="text/javascript"
  src="https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js"
  integrity="sha384-{HASH_TO_COMPUTE}"
  crossorigin="anonymous"
></script>
```

To compute the hash when integrating Apple OAuth:
```bash
curl -s https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js \
  | openssl dgst -sha384 -binary | base64 | sed 's/^/sha384-/'
```

Apple CDN scripts are more stable and appropriate for SRI. Re-verify the hash on any Apple SDK version bump.

### 5.3 Summary

| Script | SRI Applicable? | Action |
|---|---|---|
| GTM `gtag/js` | No — Google updates it silently | Domain-allowlist in CSP only |
| Clarity loader | Moved to `public/analytics.js` (self-hosted) | No SRI needed — self-hosted |
| Apple Sign-In SDK | Yes | Compute hash at integration time |
| PostHog SDK | No — bundled by Vite | No SRI needed |
| Sentry SDK | No — bundled by Vite | No SRI needed |

---

## 6. Cookie Security (Migration Path from localStorage to httpOnly Cookies)

### 6.1 Current state

JWT tokens are stored in `localStorage` (see `src/lib/api.ts` line 22-27). This is accessible to any JavaScript running on the page, including injected scripts. XSS is the primary threat vector.

### 6.2 Target cookie attributes

When migrating to httpOnly cookies, every session cookie must use:

```
Set-Cookie: pathwise_session={jwt};
  HttpOnly;
  Secure;
  SameSite=Strict;
  Path=/;
  Max-Age=2592000;
  Domain=pathwise.app
```

| Attribute | Value | Rationale |
|---|---|---|
| `HttpOnly` | (flag) | JavaScript cannot read this cookie. Eliminates the XSS-to-token-theft vector. |
| `Secure` | (flag) | Cookie only sent over HTTPS. Prevents transmission over HTTP even if a user hits an HTTP URL. |
| `SameSite=Strict` | Strict | Cookie not sent on cross-site requests. Fully mitigates CSRF. |
| `Path=/` | / | Scoped to the entire app. |
| `Max-Age=2592000` | 30 days | Matches the current JWT `expiresIn: "30d"`. |
| `Domain=pathwise.app` | explicit | Set explicitly — omitting `Domain` scopes to the exact hostname only (no subdomain sharing). |

**Why `SameSite=Strict` over `Lax`?**

`Lax` allows the cookie to be sent on top-level navigations (e.g., clicking a link from another site). `Strict` prevents this entirely. Since PathWise is a SaaS app (not a documentation site where users expect to arrive logged in from external links), `Strict` is the correct choice. The trade-off is that users clicking a PathWise link from email or another site will appear logged-out on first load and need to re-authenticate — this is acceptable UX for a security-conscious app.

### 6.3 CSRF token mechanism

With `SameSite=Strict` cookies, CSRF is fully mitigated — the cookie will not be sent on cross-origin requests, so there is no CSRF attack surface. A separate CSRF token is not required.

If the cookie strategy is ever changed to `SameSite=Lax` (e.g., to support magic link flows), add a Double Submit Cookie pattern:

1. Backend sets a second `csrf_token` cookie: `SameSite=Lax; Secure` but **without** `HttpOnly` (so JS can read it).
2. Frontend reads `csrf_token` from cookies and includes it as `X-CSRF-Token: {value}` on all mutating requests (POST, PATCH, DELETE).
3. Backend validates that the `X-CSRF-Token` header value matches the `csrf_token` cookie value.

### 6.4 Migration steps (Encore backend changes required)

1. Add a new Encore API endpoint `POST /auth/session` that exchanges a JWT for a `Set-Cookie` response.
2. Modify the auth handler to accept cookies in addition to Bearer tokens (transition period).
3. Update `src/lib/api.ts` to remove `tokenStore` (localStorage operations) and instead rely on the browser automatically sending the httpOnly cookie.
4. Remove the `Authorization: Bearer` header injection from the API client once all users have been migrated.
5. Phase out the Bearer token pathway after a migration window.

---

## 7. Tech Debt Register

| ID | Item | Priority | Effort |
|---|---|---|---|
| SEC-01 | PostHog API key (`phc_tQX3...`) is hardcoded in `src/main.tsx` line 9. Move to `VITE_POSTHOG_KEY` env var. | P2 | 30 min |
| SEC-02 | Admin email (`akashagakash@gmail.com`) hardcoded in `auth.ts`. Move to `AdminEmail` Encore secret. | P2 | 30 min |
| SEC-03 | JWT in localStorage — migrate to httpOnly cookies (section 6). | P2 | 2-3 days |
| SEC-04 | `style-src 'unsafe-inline'` — requires audit of dynamic style injection; migrate to static CSS extraction or CSS Modules to eliminate this directive. | P3 | 3-5 days |
| SEC-05 | No HSTS preload submission. Submit to https://hstspreload.org once `max-age=63072000; includeSubDomains; preload` has been live for 30+ days. | P3 | 15 min |
| SEC-06 | CSP deployed in report-only mode — monitor Sentry Security Headers violations for 2 weeks before switching to enforce mode. | P1 | Operational |
| SEC-07 | Move Clarity loader and GA gtag initializer from `index.html` inline scripts to `public/analytics.js` to eliminate `script-src` hash requirements. | P1 | 1 hour |

---

## 8. Implementation Checklist

### Phase 1 — Immediate (before next deploy)

- [ ] Update `vercel.json` with the complete headers config from section 3.1
- [ ] Set `X-XSS-Protection: 0` (replace the current `1; mode=block` value)
- [ ] Add `Permissions-Policy` header
- [ ] Add `Cross-Origin-Opener-Policy: same-origin-allow-popups`
- [ ] Deploy CSP in **report-only mode** first (use `Content-Security-Policy-Report-Only`)
- [ ] Configure Sentry Security Headers endpoint (Project Settings → Security Headers → get the report URL)

### Phase 2 — Within 1 week

- [ ] Move Clarity loader and GA inline scripts to `public/analytics.js` (SEC-07)
- [ ] Move PostHog API key to `VITE_POSTHOG_KEY` environment variable (SEC-01)
- [ ] Move admin email to Encore secret (SEC-02)
- [ ] Review CSP violation reports in Sentry; fix any legitimate blocked resources
- [ ] Switch `Content-Security-Policy-Report-Only` to `Content-Security-Policy`

### Phase 3 — Within 1 month

- [ ] Configure Encore CORS policy explicitly per section 4.3
- [ ] Begin httpOnly cookie migration (SEC-03)
- [ ] Submit to HSTS preload list (SEC-05)

### Phase 4 — Ongoing

- [ ] Revisit `style-src 'unsafe-inline'` after CSS audit (SEC-04)
- [ ] Compute and add SRI hash for Apple Sign-In SDK when OAuth is integrated
