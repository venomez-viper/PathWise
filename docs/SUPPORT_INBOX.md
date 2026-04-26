# Support Inbox — architecture, surfaces, security

**Module:** `backend/tickets/` (DB: `tickets`) + `src/pages/Admin/TicketInbox.tsx`
**Routes:** `/app/inbox` (support agents and admins) and `/app/admin` (admin only)
**Live since:** v0.21.0 (PRs #62, #63), expanded through v0.22.0 (PRs #69–#81)

---

## What it does

A two-pane support console for handling customer email:

- **Inbound** — public visitors send messages via the contact form
  (`/contact`) or the in-app support form (`/app/support`); customers
  can also reply directly to support emails or, with the apex MX
  configured, email `support@pathwise.fit` cold. Everything threads
  into the same inbox.
- **Outbound (compose / "outbox")** — agents can write to anyone from
  one of four verified senders (`hello`, `onboarding`, `support`,
  `marketing` @pathwise.fit). Each compose creates a tracked open
  ticket so the recipient's reply lands back in the inbox.
- **Replies** — agents reply inline; replies go out via Resend with
  proper `Message-ID` / `In-Reply-To` / `References` headers and are
  threaded by Gmail/Outlook/Apple Mail clients.
- **Reply-back routing** — outbound emails carry a sentinel
  `Message-ID` of the form `<ticket-{uuid}-{replyId}@pathwise.fit>`;
  the Resend Inbound webhook (`/webhooks/resend/inbound`) extracts
  the UUID and threads the reply back to the right ticket.

---

## Data model

```
tickets
├─ id            text PK (UUID)
├─ name          text
├─ email         text
├─ subject       text
├─ message       text                  -- original body
├─ status        text                  -- 'open' | 'in_progress' | 'closed'
├─ created_at    text
├─ unread        int    default 1
├─ last_activity_at text
└─ initiated_by  text   default 'user' -- 'user' (inbound) or 'agent' (outbox)

ticket_replies
├─ id            text PK (UUID)
├─ ticket_id     text FK → tickets.id ON DELETE CASCADE
├─ direction     text                  -- 'admin' | 'user'
├─ author_email  text
├─ author_name   text
├─ body          text
├─ message_id    text                  -- the Message-ID header we sent
├─ in_reply_to   text                  -- the In-Reply-To header
├─ resend_email_id text                -- Resend's id (idempotency key for inbound)
└─ created_at    text

support_snippets
├─ id            text PK
├─ user_id       text                  -- agent owner
├─ title         text  ≤80
├─ body          text  ≤4000
├─ created_at    text
└─ updated_at    text

inbound_debug_log                      -- agent-visible webhook activity log
├─ id            text PK
├─ received_at   text
├─ decision      text                  -- ok / ok-new / no-match / duplicate /
│                                          auth-failed / suspicious / empty-body /
│                                          rate-limited / invalid-signature /
│                                          missing-headers / internal-error / ...
├─ from_email    text
├─ to_addresses_json text
├─ subject       text
├─ reason        text                  -- short safe category, never raw stack
├─ has_svix_headers int
└─ resend_email_id text
```

**Migrations:**
- `tickets/migrations/1_create_tickets.up.sql`
- `tickets/migrations/2_create_ticket_replies.up.sql`
- `tickets/migrations/3_create_support_snippets.up.sql`
- `tickets/migrations/4_add_initiated_by.up.sql`
- `tickets/migrations/5_inbound_debug_log.up.sql`
- `auth/migrations/8_create_user_roles.up.sql` (Team Roles console)
- `auth/migrations/9_add_email_signature.up.sql`
- `auth/migrations/10_admin_audit.up.sql` (impersonation/plan/broadcast/delete audit)
- `auth/migrations/11_reset_token_used_at.up.sql` (single-use reset tokens)

---

## Endpoints

All endpoints live in `backend/tickets/`. **Auth:** `auth: true` on
every mutation; readable endpoints gated by `checkSupportAccess`.

| Method | Path                                    | Who               | Notes                                                   |
| ------ | --------------------------------------- | ----------------- | ------------------------------------------------------- |
| POST   | `/tickets`                              | public            | submit ticket (rate-limited, regex-validated email)     |
| GET    | `/admin/tickets`                        | support + admin   | list all tickets                                        |
| PATCH  | `/admin/tickets/:id`                    | support + admin   | update status                                           |
| DELETE | `/admin/tickets/:id`                    | **admin only**    | UI shows "ask an admin" message for support agents      |
| POST   | `/admin/tickets/:id/reply`              | support + admin   | reply; rawHtml requires admin                           |
| POST   | `/admin/tickets/:id/reply/preview`      | support + admin   | render reply HTML without sending                       |
| GET    | `/admin/tickets/:id/thread`             | support + admin   | thread of replies                                       |
| POST   | `/admin/tickets/:id/read`               | support + admin   | mark read                                               |
| POST   | `/admin/compose-email`                  | support + admin   | outbox; rawHtml admin-only; creates one ticket per `to` |
| POST   | `/admin/compose-email/preview`          | support + admin   | render compose HTML without sending                     |
| GET    | `/admin/snippets`                       | support + admin   | list own snippets                                       |
| POST   | `/admin/snippets`                       | support + admin   | create (max 50/user)                                    |
| PATCH  | `/admin/snippets/:id`                   | support + admin   | update (own only)                                       |
| DELETE | `/admin/snippets/:id`                   | support + admin   | delete (own only)                                       |
| GET    | `/admin/senders`                        | support + admin   | verified From allow-list for the picker                 |
| GET    | `/admin/inbound-log`                    | support + admin   | last 50 webhook decisions                               |
| POST   | `/webhooks/resend/inbound`              | public + Svix sig | process inbound emails; per-sender + global rate limits |

Sender allow-list (`backend/email/email.ts`):
```
hello       PathWise <hello@pathwise.fit>
onboarding  PathWise Onboarding <onboarding@pathwise.fit>
support     PathWise Support <support@pathwise.fit>
marketing   PathWise Team <marketing@pathwise.fit>
```

---

## UI features (all in `src/pages/Admin/TicketInbox.tsx`)

- **Header**: search box, segmented filter bar (All / Unread / Open
  / Active / Closed) with per-segment counts, refresh button (spins
  while loading), Activity (debug log) button, primary copper
  Compose CTA.
- **Ticket list (left, 400px)**: hover-lift rows, copper left border
  on active, To-prefix and PenSquare chip for outbound tickets
  (`initiatedBy === 'agent'`).
- **Conversation pane (right)**:
  - Subject + sender meta
  - Custom `StatusPicker` dropdown (replaces native `<select>`)
  - Delete button — visible to all support agents but the action is
    admin-only; non-admins see a "ask an admin" alert.
  - Thread view with two-tone author + timestamp meta line.
  - **Reply composer**:
    - `ReplyRecipientsPanel` summary card (always visible) with From
      label, primary recipient avatar pill, additional-To overflow,
      Cc row when present. Click to expand into a full editor with
      `FromPicker` + `EmailTagInput` × 2.
    - `SignatureBar` — chip preview with Edit; expanded inline editor
      with copper focus ring + 1000-char counter.
    - Snippets popover (rendered via React portal so it escapes
      modal stacking contexts).
    - Inline iframe preview with **Edit HTML** toggle (admin-only on
      send).
    - Slack-style Enter-to-send / Shift+Enter-to-newline.
- **Compose modal**: copper-tinted icon header, custom `FromPicker`,
  To + Cc tag inputs, Subject + Message with focus halos, signature
  bar, snippets, preview with Edit HTML, sticky footer.
- **Manage Snippets modal**: 240px sidebar list + editor with Title
  (≤80) and Body (≤4000) live counters.
- **Inbound Debug modal**: summary bar (accepted / dropped /
  errored), per-event rows with category pill + meta labels +
  monospace inset for raw reason.

Design tokens (Zen Stone): `--surface: #eefcfe`, `--surface-container:
#ddebed`, copper accent `#8b4f2c`, focus ring `rgba(139,79,44,0.12)`.
No purple anywhere in the inbox module.

---

## Security model

Three independent reviews ran on this module (PRs #80 inbox+admin,
#82 broader backend). Findings + fixes:

### Authorization

- `checkSupportAccess({ userID })` → `{ canAccessTickets }` returns
  true for ADMIN_EMAILS bootstrap admins, DB-granted admins, and
  DB-granted support_agents.
- `checkAdmin({ userID })` → `{ isAdmin }` returns true for bootstrap
  admins and DB-granted admins. Used for: ticket delete,
  Compose/Reply rawHtml, `requireAdmin` (impersonation, plan, broadcast,
  delete-user, etc).
- All admin mutation endpoints refuse impersonation tokens via
  `refuseImpersonation(authData)`. Stolen impersonation tokens
  cannot chain into admin actions.
- Impersonation: short-lived (1h), refuses to impersonate any other
  admin (bootstrap or DB-granted), best-effort row written to
  `admin_audit`.

### Validation

- All email lists (compose `to`, `cc`; reply `additionalTo`, `cc`)
  pass through `normalizeEmailList(list, label, maxCount)`:
  trim + lowercase + RFC-ish regex + 254-char cap + per-list max.
- `subject` ≤500, `message` ≤10 000, `rawHtml` ≤200 000.
- Snippet `title` ≤80, `body` ≤4000, max 50 per agent.
- Profile `headline` ≤100, `bio` ≤2000 — both stripped of HTML tags
  and ASCII control chars before storage.
- All ID parameters are UUIDs handled as opaque strings; we never
  parse or interpolate them as SQL.

### Rate limits (`backend/shared/rate-limiter.ts`)

| Profile             | Rate                        | Used by                                |
| ------------------- | --------------------------- | -------------------------------------- |
| `auth`              | 10/min/key                  | signup, signin, forgot-password, reset |
| `contact`           | 3 / 10min                   | public submitTicket                    |
| `ticketReply`       | 20/min/agent                | reply, compose                         |
| `inboundSender`     | 20/hr per sender address    | inbound webhook                        |
| `inboundGlobal`     | 500/hr platform-wide        | inbound new-ticket creation            |
| `forgotGlobal`      | 200/hr platform-wide        | forgot-password (anti-spray)           |
| `aiGenerate`        | 5/min/user                  | AI task generation                     |
| `aiGenerateGlobal`  | 500/day platform-wide       | AI task generation (Mistral spend cap) |
| `admin`             | 20/min/admin                | admin endpoints                        |

In-memory limiter is process-local. **Production deployments must
run on a single Encore instance** until we move the store to Redis
or Postgres. Multi-instance autoscaling silently multiplies limits.

### Inbound webhook (`backend/tickets/inbound.ts`)

1. **Svix signature verification** (Resend's webhook secret) before
   parsing anything.
2. **Size cap** at 256 KB raw; **body cap** at 50 KB stored.
3. **Per-sender rate limit** + **global new-ticket rate limit**.
4. **SPF/DKIM/DMARC enforcement** — failed-auth dropped silently.
5. **Content filters**: non-printable ratio ≤20%, ≤50 URLs.
6. **HTML decoding**: `stripHtmlToText` decodes `&#NNN;` and
   `&#xHH;` entities for defense in depth.
7. **Quoted-reply stripping**: Gmail/Outlook/Apple "On X wrote:" and
   `>` lines are removed so threads show only the fresh content.
8. **Threading**: sentinel match → message_id lookup → sender-email
   open-ticket fallback. Verifies the matched ticket actually exists
   before inserting a reply (closes the FK-crash that previously
   500ed Resend when the ticketId pointed to a phantom).
9. **Cold inbound**: if no match AND recipient is in the
   `INBOUND_ACCEPTED_ADDRESSES` allow-list (the four verified
   mailboxes plus `reply@support.pathwise.fit`), creates a fresh
   open ticket. Otherwise drops as `no-match`.
10. **Idempotency**: dedupes on Resend's `email_id`.
11. **Top-level try/catch**: never returns 500 to Resend (would
    trigger retry storms). Errors are categorized to short codes
    (`db-constraint`, `db-schema`, `db-duplicate`, `db-connection`,
    `internal-error`) and logged to `inbound_debug_log`. Raw error
    text only goes to stderr.

### Outbound (compose + reply)

- Sender `from` validated against `FROM_KEYS` allow-list.
- `rawHtml` (HTML editing in preview) is **admin-only** in both
  compose and reply. Support agents can craft messages but not
  arbitrary HTML emails from a verified pathwise.fit sender.
- `sendEmail` strips CR/LF from every Resend header and from the
  user-controlled subject (header-injection defense in depth).
- Compose creates a tracked ticket per recipient with a sentinel
  Message-ID so reply-backs thread automatically.
- DB errors on ticket insert are logged server-side; UI sees only a
  short category in `failures[].error`.

### XSS

- No `dangerouslySetInnerHTML` anywhere in the frontend module.
  All user-controlled strings render via JSX interpolation
  (auto-escaped) or `whiteSpace: pre-wrap` (text-rendered).
- Email previews use `<iframe sandbox="" srcDoc={…}>` — `sandbox=""`
  disables scripts, forms, navigation, and same-origin.
- Cert renderer pulls `userName` from the DB server-side and strips
  HTML before returning.

### Public profile

- `getPublicProfile` no longer returns `plan` to anonymous viewers
  (privacy/targeting concern).
- `bio` and `headline` are HTML-stripped + length-capped on write.

### Password reset

- `forgotPassword`: bcrypt + token generation runs unconditionally
  (timing-equalized between hit and miss).
- `resetPassword`: atomic single-use guarantee via
  `UPDATE … SET used_at = NOW() WHERE used_at IS NULL`. All error
  branches return the same generic "invalid or expired" message so
  the endpoint isn't an oracle.

### Audit trail (`admin_audit`)

Every admin mutation writes a best-effort audit row:
- impersonate
- update_plan
- delete_user
- broadcast_email

Audit writes are wrapped in try/catch; a missing `admin_audit` table
never blocks the action — stderr remains the last line of defense.

---

## Operational notes

### Deploys

- **Vercel** auto-deploys the frontend from `main`.
- **Encore** auto-applies migrations on deploy. If a deploy doesn't
  pick up the latest code (rare), push a no-op chore commit
  modifying `backend/tickets/tickets.ts` (the trailing
  `// Trigger Encore redeploy …` line is reserved for this).

### DNS / Resend

- **Domain `pathwise.fit`** verified on Resend (SPF + DKIM green).
  Sending from any `*@pathwise.fit` works once the domain is verified.
- **Apex MX** records on `pathwise.fit` point to
  `inbound-smtp.us-east-1.amazonaws.com` — emails sent to any address
  on the apex go to Resend Inbound.
- **Webhook endpoint** (Resend dashboard): `POST` to
  `https://staging-pathwise-4mxi.encr.app/webhooks/resend/inbound`.
- **Inbound route** (Resend dashboard): listen for
  `email.received` on the apex domain, deliver to the webhook.
- **Signing secret**: Encore secret `ResendWebhookSecret`. Rotate in
  the Resend dashboard, paste into Encore secrets, redeploy.

### Sender verification

If a sender like `marketing@pathwise.fit` fails to send, check
the Resend dashboard:
1. Domains → `pathwise.fit` → Restart verification (DNS recheck)
2. Logs → filter by `marketing@` → look at the actual error
3. The Compose modal now surfaces the exact Resend error per
   recipient in the alert, so agents see what's wrong without
   dashboard access.

To add a new sender (e.g. `billing@`):
1. Add to `FROM_ADDRESSES` in `backend/email/email.ts`.
2. Add to `FROM_KEYS`.
3. Verify the address in Resend if needed.
4. Restart Encore.

### Sender verification dry-run

`backend/verify-senders.mjs` sends a probe email from each From
address. Run from `backend/`:
```bash
cd backend
RESEND_API_KEY=$(encore secret get ResendAPIKey --env=local --type dev) \
  node verify-senders.mjs --to your-email@gmail.com
```

### Inbound debug

The Activity icon next to Compose in the inbox header opens a panel
showing the last 50 webhook calls. If the panel is empty after
sending a test email to `support@pathwise.fit`, Resend isn't calling
the webhook (route misconfigured or signing-secret mismatch).

### Adding a support agent

1. Admin opens **Team Roles** in the admin page.
2. Adds the user's email with role `support_agent`.
3. The user signs in and visits `/app/inbox`.

The DB-granted admin role works on the entire admin surface
(`requireAdmin` is now DB-aware as of PR #80).

---

## Known limitations

- **In-memory rate limiter** is per-instance. Multi-instance
  autoscaling silently multiplies limits. Pin scaling to 1 or back
  the limiter with Redis/Postgres.
- **No global quota** on outbound compose volume per agent. Per-call
  rate-limited but no daily cap. Acceptable while support traffic is
  low; revisit if abuse appears.
- **Snippets are user-scoped, not team-shared**. Each agent
  maintains their own. A shared-snippet feature is a future PR.
- **Cold inbound to non-allowlisted addresses is silently dropped**.
  Add a new mailbox both to `INBOUND_ACCEPTED_ADDRESSES` (in
  `inbound.ts`) AND the Resend route allow-list before announcing
  it externally.

---

## Changelog

- **0.21.0** (Apr 21, 2026) — Initial inbox + Team Roles (#62, #63).
- **0.22.0** (Apr 21, 2026) — Compose/outbox, snippets, sender
  picker, admin-only delete (#69).
- Apr 21–26, 2026 — Polish, fixes, and security hardening:
  - #70 — Zen palette + Resend error surfacing
  - #71 — Edit HTML in preview
  - #73 — Inbound debug log + strip quoted replies + no more 500s
  - #74 — Refresh button
  - #75 — Header cluster + status picker + a11y
  - #76 — Compose modal senior polish pass
  - #77 — Modals + segmented filter + signature
  - #78 — FK crash fix + portal snippets popover + bigger inbox
  - #79 — Reply recipients panel + 1M timestamp casing
  - #80 — Inbox + admin security hardening
  - #81 — SPA chunk-load resilience + Sentry filter
  - #82 — Broad backend security hardening (CORS, reset race,
    XSS, IDOR oracles, rate limits)
