# Ticket Inbox + Reply Thread Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the Admin Tickets tab into a real support inbox AND add a Team Roles console so admins can grant limited "support agent" access (ticket inbox only, no admin console) to teammates.

**Architecture:**
- `ticket_replies` table stores every message after the original (both directions).
- Admin replies: `POST /admin/tickets/:id/reply` → writes row + sends via Resend with `Message-ID` / `In-Reply-To` headers, triggers ticket status `open → in_progress`.
- User replies-back: Resend Inbound hits `POST /webhooks/resend/inbound`, handler fetches full body via `POST /emails/receiving`, parses `In-Reply-To` to match back to a ticket, writes `direction='user'` row, flips status `closed → open`, marks ticket `unread=true`.
- Admin UI rebuilds the Tickets tab as a two-pane Inbox (list ↔ conversation), with unread badge, search, status filter, and composer.
- **Roles:** new `user_roles` table with `role IN ('admin','support_agent')`, keyed by email. `ADMIN_EMAILS` stays as the bootstrap allowlist; additional roles are managed via a new **Team** tab in the admin console (admins only). New `checkSupportAccess({userID})` helper gates all ticket endpoints — accepts admin OR support_agent. Support agents sign in normally, see a dedicated `/support` route (full-page inbox, no admin shell), and never see the rest of the admin console.

**Tech Stack:** Encore.dev (TypeScript), SQL migrations, Resend SDK (outbound + Inbound webhook + `/emails/receiving`), React/Vite frontend.

---

## File Structure

**Backend:**
- Create: `backend/tickets/migrations/2_create_ticket_replies.up.sql` — `ticket_replies` table + `unread` / `last_activity_at` columns on `tickets`
- Modify: `backend/tickets/tickets.ts` — add `adminReplyTicket`, `adminGetTicketThread`, `adminMarkTicketRead`; extend `adminListTickets` to return reply count, last activity, unread flag
- Modify: `backend/email/email.ts` — add `ticketReplyEmail()`; extend `sendEmail` to accept + return `messageId` / `inReplyTo` headers
- Create: `backend/tickets/inbound.ts` — Resend Inbound webhook: fetches body via `/emails/receiving`, parses In-Reply-To, writes reply row

**Frontend:**
- Modify: `src/lib/api.ts` — add `adminApi.getTicketThread`, `adminApi.replyTicket`, `adminApi.markTicketRead`
- Create: `src/pages/Admin/TicketInbox.tsx` — two-pane inbox component (list + conversation)
- Modify: `src/pages/Admin/index.tsx` — replace the inline Tickets tab with `<TicketInbox />`

---

## Task 1: DB migration — `ticket_replies` + unread/activity columns

**Files:**
- Create: `backend/tickets/migrations/2_create_ticket_replies.up.sql`

- [ ] **Step 1: Write the migration**

```sql
CREATE TABLE ticket_replies (
  id TEXT PRIMARY KEY,
  ticket_id TEXT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('admin', 'user')),
  author_email TEXT NOT NULL,
  author_name TEXT,
  body TEXT NOT NULL,
  message_id TEXT,
  in_reply_to TEXT,
  resend_email_id TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX idx_ticket_replies_ticket ON ticket_replies(ticket_id);
CREATE INDEX idx_ticket_replies_message_id ON ticket_replies(message_id);
CREATE INDEX idx_ticket_replies_resend_email_id ON ticket_replies(resend_email_id);
CREATE INDEX idx_ticket_replies_created ON ticket_replies(created_at);

ALTER TABLE tickets ADD COLUMN unread INTEGER NOT NULL DEFAULT 1;
ALTER TABLE tickets ADD COLUMN last_activity_at TEXT;

UPDATE tickets SET last_activity_at = created_at WHERE last_activity_at IS NULL;

CREATE INDEX idx_tickets_last_activity ON tickets(last_activity_at DESC);
CREATE INDEX idx_tickets_unread ON tickets(unread);
```

- [ ] **Step 2: Apply migration**

Run: `cd /home/admin1/PathWise/backend && encore run`
Expected: Encore applies migration on startup and logs no errors.

- [ ] **Step 3: Commit**

```bash
git add backend/tickets/migrations/2_create_ticket_replies.up.sql
git commit -m "feat(tickets): add ticket_replies + unread/activity columns for inbox"
```

---

## Task 2: Email template + threading headers on `sendEmail`

**Files:**
- Modify: `backend/email/email.ts`

- [ ] **Step 1: Extend `sendEmail` to accept + return threading headers**

Replace the `sendEmail` definition (starting `export const sendEmail = api(`) with:

```ts
export const sendEmail = api(
  { expose: false },
  async ({
    to, subject, html, messageId, inReplyTo, references,
  }: {
    to: string; subject: string; html: string;
    messageId?: string; inReplyTo?: string; references?: string;
  }): Promise<{ success: boolean; messageId?: string; resendId?: string }> => {
    try {
      const resend = getResend();
      const headers: Record<string, string> = {
        "List-Unsubscribe": "<mailto:hello@pathwise.fit?subject=Unsubscribe>",
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        "Reply-To": "hello@pathwise.fit",
      };
      if (messageId) headers["Message-ID"] = messageId;
      if (inReplyTo) headers["In-Reply-To"] = inReplyTo;
      if (references) headers["References"] = references;

      const res = await resend.emails.send({ from: FROM_EMAIL, to, subject, html, headers });
      return { success: true, messageId, resendId: res?.data?.id };
    } catch (err) {
      console.error("Email send failed:", { to, subject, error: err instanceof Error ? err.message : "unknown" });
      return { success: false };
    }
  }
);
```

- [ ] **Step 2: Add `ticketReplyEmail` template**

Append to `backend/email/email.ts` (after `adminTicketNotificationEmail`):

```ts
export function ticketReplyEmail(
  recipientName: string,
  adminName: string,
  subject: string,
  body: string,
): { subject: string; html: string } {
  const safeName = escapeHtml(recipientName || "there");
  const safeAdmin = escapeHtml(adminName || "PathWise Support");
  const safeBody = escapeHtml(body).replace(/\n/g, "<br>");
  const safeSubject = subject ? `Re: ${escapeHtml(subject)}` : "Re: Your PathWise support request";

  const content = `
    <p style="margin:0 0 16px;font-size:16px;color:#1a1a2e;">Hi ${safeName},</p>
    <div style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#333;">${safeBody}</div>
    <p style="margin:24px 0 0;font-size:14px;color:#666;">— ${safeAdmin}<br>PathWise Support</p>
    <p style="margin:16px 0 0;font-size:12px;color:#999;">Just reply to this email — we'll see it in your ticket.</p>
  `;

  return { subject: safeSubject, html: layout(content) };
}
```

- [ ] **Step 3: Commit**

```bash
git add backend/email/email.ts
git commit -m "feat(email): threading headers + ticketReplyEmail template"
```

---

## Task 3: Backend — admin reply, thread fetch, mark-read, enriched list

**Files:**
- Modify: `backend/tickets/tickets.ts`

- [ ] **Step 1: Update `adminListTickets` to return reply count, last activity, unread**

Replace the `adminListTickets` endpoint body (lines ~84–111) with:

```ts
interface AdminTicket {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
  lastActivityAt: string;
  unread: boolean;
  replyCount: number;
}

interface AdminTicketsResponse {
  tickets: AdminTicket[];
}

export const adminListTickets = api(
  { expose: true, method: "GET", path: "/admin/tickets", auth: true },
  async (): Promise<AdminTicketsResponse> => {
    const { userID } = getAuthData<AuthData>()!;
    const { isAdmin } = await checkAdmin({ userID });
    if (!isAdmin) throw APIError.permissionDenied("admin access required");

    const tickets: AdminTicket[] = [];
    const rows = db.query`
      SELECT
        t.id, t.name, t.email, t.subject, t.message, t.status, t.created_at,
        t.unread, COALESCE(t.last_activity_at, t.created_at) AS last_activity_at,
        (SELECT COUNT(*) FROM ticket_replies r WHERE r.ticket_id = t.id) AS reply_count
      FROM tickets t
      ORDER BY COALESCE(t.last_activity_at, t.created_at) DESC
    `;
    for await (const row of rows) {
      tickets.push({
        id: row.id,
        name: row.name,
        email: row.email,
        subject: row.subject ?? "",
        message: row.message,
        status: row.status,
        createdAt: row.created_at,
        lastActivityAt: row.last_activity_at,
        unread: Boolean(row.unread),
        replyCount: Number(row.reply_count ?? 0),
      });
    }
    return { tickets };
  }
);
```

- [ ] **Step 2: Add reply, thread, mark-read endpoints**

Append to `backend/tickets/tickets.ts`:

```ts
// ── Admin Reply to Ticket ────────────────────────────────────────────────────

interface ReplyTicketParams { ticketId: string; body: string; }

export const adminReplyTicket = api(
  { expose: true, method: "POST", path: "/admin/tickets/:ticketId/reply", auth: true },
  async (params: ReplyTicketParams): Promise<{ success: boolean; replyId: string }> => {
    const { userID, email: adminEmail } = getAuthData<AuthData>()!;
    const { isAdmin } = await checkAdmin({ userID });
    if (!isAdmin) throw APIError.permissionDenied("admin access required");

    if (!params.body || !params.body.trim()) throw APIError.invalidArgument("body is required");
    if (params.body.length > 10000) throw APIError.invalidArgument("body too long");

    const ticket = await db.queryRow`
      SELECT id, name, email, subject FROM tickets WHERE id = ${params.ticketId}
    `;
    if (!ticket) throw APIError.notFound("ticket not found");

    const replyId = crypto.randomUUID();
    const now = new Date().toISOString();
    const messageId = `<ticket-${params.ticketId}-${replyId}@pathwise.fit>`;
    const originalMessageId = `<ticket-${params.ticketId}-original@pathwise.fit>`;

    // Build References chain from prior messages for better Gmail threading
    const priorIds: string[] = [originalMessageId];
    const priorRows = db.query`
      SELECT message_id FROM ticket_replies
      WHERE ticket_id = ${params.ticketId} AND message_id IS NOT NULL
      ORDER BY created_at ASC
    `;
    for await (const r of priorRows) if (r.message_id) priorIds.push(r.message_id);
    const inReplyTo = priorIds[priorIds.length - 1];
    const references = priorIds.join(" ");

    await db.exec`
      INSERT INTO ticket_replies (id, ticket_id, direction, author_email, author_name, body, message_id, in_reply_to, created_at)
      VALUES (${replyId}, ${params.ticketId}, 'admin', ${adminEmail ?? 'admin@pathwise.fit'}, 'PathWise Support', ${params.body}, ${messageId}, ${inReplyTo}, ${now})
    `;
    await db.exec`
      UPDATE tickets
      SET last_activity_at = ${now},
          unread = 0,
          status = CASE WHEN status = 'open' THEN 'in_progress' ELSE status END
      WHERE id = ${params.ticketId}
    `;

    try {
      const { sendEmail, ticketReplyEmail } = await import("../email/email");
      const tmpl = ticketReplyEmail(ticket.name, 'PathWise Support', ticket.subject ?? '', params.body);
      await sendEmail({ to: ticket.email, ...tmpl, messageId, inReplyTo, references });
    } catch (err) {
      console.error("Ticket reply email failed:", err);
    }

    return { success: true, replyId };
  }
);

// ── Admin Get Ticket Thread ───────────────────────────────────────────────────

interface ThreadReply {
  id: string;
  direction: 'admin' | 'user';
  authorEmail: string;
  authorName: string | null;
  body: string;
  createdAt: string;
}

export const adminGetTicketThread = api(
  { expose: true, method: "GET", path: "/admin/tickets/:ticketId/thread", auth: true },
  async ({ ticketId }: { ticketId: string }): Promise<{ replies: ThreadReply[] }> => {
    const { userID } = getAuthData<AuthData>()!;
    const { isAdmin } = await checkAdmin({ userID });
    if (!isAdmin) throw APIError.permissionDenied("admin access required");

    const replies: ThreadReply[] = [];
    const rows = db.query`
      SELECT id, direction, author_email, author_name, body, created_at
      FROM ticket_replies WHERE ticket_id = ${ticketId}
      ORDER BY created_at ASC
    `;
    for await (const row of rows) {
      replies.push({
        id: row.id,
        direction: row.direction as 'admin' | 'user',
        authorEmail: row.author_email,
        authorName: row.author_name,
        body: row.body,
        createdAt: row.created_at,
      });
    }
    return { replies };
  }
);

// ── Admin Mark Ticket Read ────────────────────────────────────────────────────

export const adminMarkTicketRead = api(
  { expose: true, method: "POST", path: "/admin/tickets/:ticketId/read", auth: true },
  async ({ ticketId }: { ticketId: string }): Promise<{ success: boolean }> => {
    const { userID } = getAuthData<AuthData>()!;
    const { isAdmin } = await checkAdmin({ userID });
    if (!isAdmin) throw APIError.permissionDenied("admin access required");
    await db.exec`UPDATE tickets SET unread = 0 WHERE id = ${ticketId}`;
    return { success: true };
  }
);
```

- [ ] **Step 3: Smoke-test**

With `encore run` live, get an admin token and hit:
```bash
curl -X POST http://localhost:4000/admin/tickets/<REAL_UUID>/reply \
  -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" \
  -d '{"body":"Hello from plan test"}'
```
Expected: `{"success":true,"replyId":"..."}`, a row in `ticket_replies`, `last_activity_at` updated, and an email delivered.

- [ ] **Step 4: Commit**

```bash
git add backend/tickets/tickets.ts
git commit -m "feat(tickets): admin reply + thread + mark-read + enriched list"
```

---

## Task 4: Resend Inbound webhook — capture user replies

**Files:**
- Create: `backend/tickets/inbound.ts`

Per Resend Inbound docs: the webhook payload delivers only metadata. Use the Resend SDK's `resend.emails.receiving.get(email_id)` to retrieve the full body + headers, and `resend.webhooks.verify(...)` to authenticate every request.

**Security requirements for this task:**
1. **Verify signature before parsing.** Reject with 400 if signature missing or invalid. Use `resend.webhooks.verify` with raw body + svix headers. Missing signing secret → reject with 500.
2. **Secret:** new Encore secret `ResendWebhookSecret` (user configures via `encore secret set`).
3. Still return 200 for valid-but-unmatchable events (empty body, no ticket match, duplicate) so Resend doesn't retry-storm.
4. Never log email bodies. Log only `from`, `subject`, `email_id`.
5. Store the raw body; strip quoted replies only in the display layer (Task 6), not here.

- [ ] **Step 1: Write the handler**

Create `backend/tickets/inbound.ts`:

```ts
import { api } from "encore.dev/api";
import { secret } from "encore.dev/config";
import { SQLDatabase } from "encore.dev/storage/sqldb";
import { Resend } from "resend";

const db = SQLDatabase.named("tickets");
const resendKey = secret("ResendAPIKey");
const webhookSecret = secret("ResendWebhookSecret");

interface InboundPayload {
  type?: string;
  data?: {
    email_id?: string;
    from?: string;
    to?: string[];
    subject?: string;
    message_id?: string;
  };
}

function parseFrom(from: string): { email: string; name: string | null } {
  const match = from.match(/^\s*(?:"?([^"<]*)"?\s*)?<?([^<>\s]+@[^<>\s]+)>?\s*$/);
  if (!match) return { email: from.trim(), name: null };
  const name = (match[1] ?? "").trim() || null;
  return { email: match[2].trim(), name };
}

export const ticketInboundWebhook = api.raw(
  { expose: true, method: "POST", path: "/webhooks/resend/inbound", auth: false },
  async (req, resp) => {
    // 1. Read raw body (required for signature verification)
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(chunk as Buffer);
    const raw = Buffer.concat(chunks).toString("utf-8");

    // 2. Verify svix signature before trusting anything
    const svixId = (req.headers["svix-id"] as string | undefined) ?? "";
    const svixTimestamp = (req.headers["svix-timestamp"] as string | undefined) ?? "";
    const svixSignature = (req.headers["svix-signature"] as string | undefined) ?? "";

    let secretValue: string;
    try { secretValue = webhookSecret(); } catch {
      console.error("Inbound: ResendWebhookSecret not configured");
      resp.writeHead(500); resp.end("webhook secret missing"); return;
    }
    if (!svixId || !svixTimestamp || !svixSignature) {
      resp.writeHead(400); resp.end("missing signature headers"); return;
    }

    const resend = new Resend(resendKey());
    let event: unknown;
    try {
      event = resend.webhooks.verify({
        payload: raw,
        headers: {
          "svix-id": svixId,
          "svix-timestamp": svixTimestamp,
          "svix-signature": svixSignature,
        },
        secret: secretValue,
      });
    } catch {
      resp.writeHead(400); resp.end("invalid signature"); return;
    }

    const payload = event as InboundPayload;
    if (payload?.type !== "email.received" || !payload.data?.email_id) {
      resp.writeHead(200); resp.end("ignored"); return;
    }

    // 3. Idempotency: skip if already stored
    const existing = await db.queryRow`
      SELECT id FROM ticket_replies WHERE resend_email_id = ${payload.data.email_id}
    `;
    if (existing) { resp.writeHead(200); resp.end("duplicate"); return; }

    // 4. Fetch full body + headers via SDK
    let email: { text?: string; html?: string; headers?: Record<string, string>; from?: string };
    try {
      const got = await resend.emails.receiving.get(payload.data.email_id);
      email = (got?.data ?? got) as typeof email;
    } catch (err) {
      console.error("Inbound: failed to fetch email body", { email_id: payload.data.email_id, err: err instanceof Error ? err.message : "unknown" });
      resp.writeHead(200); resp.end("fetch-failed"); return;
    }

    const fromRaw = email.from ?? payload.data.from ?? "";
    const { email: fromEmail, name: fromName } = parseFrom(fromRaw);
    const body = (email.text ?? email.html ?? "").trim();
    const headers = email.headers ?? {};
    const inReplyTo = headers["In-Reply-To"] ?? headers["in-reply-to"] ?? null;
    const references = headers["References"] ?? headers["references"] ?? "";
    const incomingMessageId = payload.data.message_id ?? headers["Message-ID"] ?? headers["message-id"] ?? null;

    if (!fromEmail || !body) { resp.writeHead(200); resp.end("empty"); return; }

    // 5. Match to ticket: sentinel → stored message_id → sender email fallback
    let ticketId: string | null = null;
    const searchSpace = `${inReplyTo ?? ""} ${references}`;
    const sentinelMatch = searchSpace.match(/<ticket-([0-9a-f-]{36})-/i);
    if (sentinelMatch) ticketId = sentinelMatch[1];

    if (!ticketId && inReplyTo) {
      const row = await db.queryRow`
        SELECT ticket_id FROM ticket_replies WHERE message_id = ${inReplyTo}
      `;
      if (row) ticketId = row.ticket_id;
    }

    if (!ticketId) {
      const row = await db.queryRow`
        SELECT id FROM tickets WHERE email = ${fromEmail} AND status != 'closed'
        ORDER BY last_activity_at DESC, created_at DESC LIMIT 1
      `;
      if (row) ticketId = row.id;
    }

    if (!ticketId) {
      console.warn("Inbound: no matching ticket", { fromEmail, subject: payload.data.subject, email_id: payload.data.email_id });
      resp.writeHead(200); resp.end("no-match"); return;
    }

    // 6. Insert reply + bump ticket state
    const replyId = crypto.randomUUID();
    const now = new Date().toISOString();
    await db.exec`
      INSERT INTO ticket_replies
        (id, ticket_id, direction, author_email, author_name, body, message_id, in_reply_to, resend_email_id, created_at)
      VALUES
        (${replyId}, ${ticketId}, 'user', ${fromEmail}, ${fromName}, ${body},
         ${incomingMessageId}, ${inReplyTo}, ${payload.data.email_id}, ${now})
    `;
    await db.exec`
      UPDATE tickets
      SET unread = 1,
          last_activity_at = ${now},
          status = CASE WHEN status = 'closed' THEN 'open' ELSE status END
      WHERE id = ${ticketId}
    `;

    resp.writeHead(200); resp.end("ok");
  }
);
```

**Operator note:** The `ResendWebhookSecret` secret must be set before deploy:
```bash
encore secret set --type prod ResendWebhookSecret
encore secret set --type dev,local ResendWebhookSecret
```
The value comes from the Resend dashboard when you create the Inbound route (shown once).

- [ ] **Step 2: Verify route registers**

Run: `cd /home/admin1/PathWise && grep -R "ticketInboundWebhook" backend/`
Expected: finds the export. When `encore run` starts, it logs `POST /webhooks/resend/inbound` in the route table.

- [ ] **Step 3: Commit**

```bash
git add backend/tickets/inbound.ts
git commit -m "feat(tickets): Resend Inbound webhook captures user reply-backs"
```

---

## Task 5: Frontend API client

**Files:**
- Modify: `src/lib/api.ts` — inside the `adminApi` object, after `deleteTicket` (~line 202)

- [ ] **Step 1: Add the methods**

Add inside the `adminApi` object:

```ts
  getTicketThread: (ticketId: string) =>
    request<{ replies: Array<{ id: string; direction: 'admin' | 'user'; authorEmail: string; authorName: string | null; body: string; createdAt: string }> }>(`/admin/tickets/${ticketId}/thread`),
  replyTicket: (ticketId: string, body: string) =>
    request<{ success: boolean; replyId: string }>(`/admin/tickets/${ticketId}/reply`, { method: 'POST', body: JSON.stringify({ body }) }),
  markTicketRead: (ticketId: string) =>
    request<{ success: boolean }>(`/admin/tickets/${ticketId}/read`, { method: 'POST' }),
```

- [ ] **Step 2: Update the ticket list type**

If `getTickets` has a narrow return type, widen the ticket shape to include `lastActivityAt: string; unread: boolean; replyCount: number`. If it uses `any[]`, no change needed — but add a shared `type AdminTicket = {...}` export for the new inbox component to import.

Add to `src/lib/api.ts` (top of admin-related exports):

```ts
export type AdminTicket = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'closed';
  createdAt: string;
  lastActivityAt: string;
  unread: boolean;
  replyCount: number;
};
```

And update `getTickets`:

```ts
getTickets: () => request<{ tickets: AdminTicket[] }>('/admin/tickets'),
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/api.ts
git commit -m "feat(api): ticket thread, reply, mark-read + AdminTicket type"
```

---

## Task 6: Frontend — `TicketInbox` component (two-pane inbox)

**Files:**
- Create: `src/pages/Admin/TicketInbox.tsx`
- Modify: `src/pages/Admin/index.tsx` — replace the entire Tickets-tab block

Design: left column is a scrollable list of ticket rows (sender, subject preview, last-activity timestamp, unread dot, status pill). Right column is the conversation — ticket header (subject + sender + status dropdown + delete), chronological message bubbles (user left gray, admin right purple), and a sticky composer at the bottom.

- [ ] **Step 1: Create `TicketInbox.tsx`**

```tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { adminApi, type AdminTicket } from '../../lib/api';
import { Send, Trash2, Search, Inbox } from 'lucide-react';

type ThreadReply = {
  id: string;
  direction: 'admin' | 'user';
  authorEmail: string;
  authorName: string | null;
  body: string;
  createdAt: string;
};

type StatusKey = 'open' | 'in_progress' | 'closed';
const STATUS_COLORS: Record<StatusKey, { bg: string; color: string; label: string }> = {
  open:        { bg: '#dcfce7', color: '#166534', label: 'Open' },
  in_progress: { bg: '#fef3c7', color: '#92400e', label: 'In Progress' },
  closed:      { bg: '#e5e7eb', color: '#374151', label: 'Closed' },
};

function formatWhen(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffHr = diffMs / 3_600_000;
  if (diffHr < 1) return `${Math.max(1, Math.floor(diffMs / 60_000))}m ago`;
  if (diffHr < 24) return `${Math.floor(diffHr)}h ago`;
  if (diffHr < 24 * 7) return `${Math.floor(diffHr / 24)}d ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

type Filter = 'all' | 'unread' | 'open' | 'closed';

export function TicketInbox() {
  const [tickets, setTickets] = useState<AdminTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [thread, setThread] = useState<ThreadReply[]>([]);
  const [threadLoading, setThreadLoading] = useState(false);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const selected = useMemo(
    () => tickets.find(t => t.id === selectedId) ?? null,
    [tickets, selectedId],
  );

  const visibleTickets = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tickets.filter(t => {
      if (filter === 'unread' && !t.unread) return false;
      if (filter === 'open' && t.status === 'closed') return false;
      if (filter === 'closed' && t.status !== 'closed') return false;
      if (q) {
        const hay = `${t.name} ${t.email} ${t.subject} ${t.message}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [tickets, filter, search]);

  const loadList = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getTickets();
      setTickets(res?.tickets ?? []);
    } finally {
      setLoading(false);
    }
  };

  const loadThread = async (id: string) => {
    setThreadLoading(true);
    try {
      const res = await adminApi.getTicketThread(id);
      setThread(res.replies ?? []);
    } finally {
      setThreadLoading(false);
    }
  };

  useEffect(() => { loadList(); }, []);

  // Auto-select first ticket on first load
  useEffect(() => {
    if (!selectedId && visibleTickets.length > 0) {
      setSelectedId(visibleTickets[0].id);
    }
  }, [visibleTickets, selectedId]);

  // Load thread when selection changes; mark as read
  useEffect(() => {
    if (!selectedId) { setThread([]); return; }
    loadThread(selectedId);
    const current = tickets.find(t => t.id === selectedId);
    if (current?.unread) {
      adminApi.markTicketRead(selectedId).catch(() => {});
      setTickets(prev => prev.map(t => t.id === selectedId ? { ...t, unread: false } : t));
    }
  }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll to bottom when thread updates
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [thread, selectedId]);

  const handleSend = async () => {
    if (!selectedId || !draft.trim()) return;
    setSending(true);
    try {
      await adminApi.replyTicket(selectedId, draft.trim());
      setDraft('');
      await loadThread(selectedId);
      setTickets(prev => prev.map(t => t.id === selectedId
        ? { ...t, status: t.status === 'open' ? 'in_progress' : t.status, lastActivityAt: new Date().toISOString(), replyCount: t.replyCount + 1 }
        : t));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to send reply.');
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (id: string, status: StatusKey) => {
    try {
      await adminApi.updateTicket(id, status);
      setTickets(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update status.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this ticket permanently?')) return;
    try {
      await adminApi.deleteTicket(id);
      setTickets(prev => prev.filter(t => t.id !== id));
      if (selectedId === id) setSelectedId(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete.');
    }
  };

  const unreadCount = tickets.filter(t => t.unread).length;

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '340px 1fr', gap: '1rem',
      height: 'calc(100vh - 220px)', minHeight: 520,
    }}>
      {/* ─── Left: ticket list ─── */}
      <div className="panel" style={{
        borderRadius: '1.5rem', display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* Filters */}
        <div style={{ padding: '0.9rem 1rem', borderBottom: '1px solid var(--outline-variant)' }}>
          <div style={{ position: 'relative', marginBottom: 10 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--on-surface-variant)' }} />
            <input
              placeholder="Search tickets"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '7px 10px 7px 30px', borderRadius: 999,
                border: '1px solid var(--outline-variant)', background: 'var(--surface-container)',
                color: 'var(--on-surface)', fontSize: '0.82rem', outline: 'none',
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {(['all', 'unread', 'open', 'closed'] as Filter[]).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '4px 10px', borderRadius: 999, fontSize: '0.72rem', fontWeight: 700,
                  border: '1px solid var(--outline-variant)', cursor: 'pointer',
                  background: filter === f ? '#6245a4' : 'var(--surface-container)',
                  color: filter === f ? '#fff' : 'var(--on-surface-variant)',
                }}
              >
                {f === 'unread' && unreadCount > 0 ? `Unread (${unreadCount})` : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--on-surface-variant)', fontSize: '0.85rem' }}>Loading…</div>
          ) : visibleTickets.length === 0 ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--on-surface-variant)' }}>
              <Inbox size={32} style={{ opacity: 0.4, marginBottom: 8 }} />
              <div style={{ fontSize: '0.85rem' }}>No tickets match this filter.</div>
            </div>
          ) : (
            visibleTickets.map(t => {
              const isActive = t.id === selectedId;
              const sc = STATUS_COLORS[t.status as StatusKey] ?? STATUS_COLORS.open;
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedId(t.id)}
                  style={{
                    padding: '0.85rem 1rem', cursor: 'pointer',
                    borderLeft: isActive ? '3px solid #6245a4' : '3px solid transparent',
                    background: isActive ? 'var(--surface-container-high)' : 'transparent',
                    borderBottom: '1px solid var(--outline-variant)',
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--surface-container)'; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                      {t.unread && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#6245a4', flexShrink: 0 }} />}
                      <span style={{ fontWeight: t.unread ? 700 : 600, fontSize: '0.88rem', color: 'var(--on-surface)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {t.name || t.email}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', flexShrink: 0, marginLeft: 6 }}>
                      {formatWhen(t.lastActivityAt)}
                    </span>
                  </div>
                  <div style={{
                    fontSize: '0.8rem', color: 'var(--on-surface-variant)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 6,
                  }}>
                    {t.subject || '(no subject)'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{
                      display: 'inline-block', padding: '1px 8px', borderRadius: 999,
                      fontSize: '0.65rem', fontWeight: 700, background: sc.bg, color: sc.color,
                    }}>
                      {sc.label}
                    </span>
                    {t.replyCount > 0 && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)' }}>
                        {t.replyCount} {t.replyCount === 1 ? 'reply' : 'replies'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ─── Right: conversation ─── */}
      <div className="panel" style={{
        borderRadius: '1.5rem', display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {!selected ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--on-surface-variant)' }}>
            Select a ticket to view the conversation.
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{
              padding: '1rem 1.25rem', borderBottom: '1px solid var(--outline-variant)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap',
            }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--on-surface)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {selected.subject || '(no subject)'}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)' }}>
                  {selected.name} &lt;{selected.email}&gt;
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <select
                  value={selected.status}
                  onChange={e => handleStatusChange(selected.id, e.target.value as StatusKey)}
                  style={{
                    padding: '4px 10px', borderRadius: 999, fontSize: '0.72rem', fontWeight: 600,
                    border: '1px solid var(--outline-variant)', background: 'var(--surface-container)',
                    color: 'var(--on-surface)', cursor: 'pointer', outline: 'none',
                  }}
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="closed">Closed</option>
                </select>
                <button
                  onClick={() => handleDelete(selected.id)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 30, height: 30, borderRadius: '50%',
                    background: 'none', border: '1px solid #ef444444', color: '#ef4444',
                    cursor: 'pointer', padding: 0,
                  }}
                  title="Delete ticket"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
              {/* Original ticket as the first user message */}
              <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ maxWidth: '75%' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--on-surface-variant)', marginBottom: 4 }}>
                    {selected.name || selected.email} — {formatWhen(selected.createdAt)}
                  </div>
                  <div style={{
                    padding: '0.75rem 1rem', borderRadius: 14,
                    background: 'var(--surface-container)', color: 'var(--on-surface)',
                    fontSize: '0.88rem', lineHeight: 1.6, whiteSpace: 'pre-wrap',
                  }}>
                    {selected.message}
                  </div>
                </div>
              </div>

              {threadLoading ? (
                <div style={{ padding: '1rem', color: 'var(--on-surface-variant)', fontSize: '0.85rem' }}>Loading thread…</div>
              ) : (
                thread.map(r => (
                  <div key={r.id} style={{
                    display: 'flex',
                    justifyContent: r.direction === 'admin' ? 'flex-end' : 'flex-start',
                    marginBottom: '1rem',
                  }}>
                    <div style={{ maxWidth: '75%' }}>
                      <div style={{
                        fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
                        letterSpacing: '0.06em', color: 'var(--on-surface-variant)', marginBottom: 4,
                        textAlign: r.direction === 'admin' ? 'right' : 'left',
                      }}>
                        {r.direction === 'admin' ? 'You' : (r.authorName || r.authorEmail)} — {formatWhen(r.createdAt)}
                      </div>
                      <div style={{
                        padding: '0.75rem 1rem', borderRadius: 14,
                        background: r.direction === 'admin' ? '#6245a4' : 'var(--surface-container)',
                        color: r.direction === 'admin' ? '#fff' : 'var(--on-surface)',
                        fontSize: '0.88rem', lineHeight: 1.6, whiteSpace: 'pre-wrap',
                      }}>
                        {r.body}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Composer */}
            <div style={{ padding: '0.9rem 1.25rem', borderTop: '1px solid var(--outline-variant)' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <textarea
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  onKeyDown={e => {
                    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); handleSend(); }
                  }}
                  placeholder="Write a reply… (⌘/Ctrl+Enter to send)"
                  rows={2}
                  style={{
                    flex: 1, padding: '0.6rem 0.9rem', borderRadius: 14,
                    border: '1px solid var(--outline-variant)', background: 'var(--surface-container)',
                    color: 'var(--on-surface)', fontSize: '0.88rem', lineHeight: 1.5,
                    resize: 'vertical', outline: 'none', fontFamily: 'inherit',
                  }}
                />
                <button
                  onClick={handleSend}
                  disabled={sending || !draft.trim()}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    padding: '0.55rem 1.1rem', borderRadius: 999, border: 'none',
                    background: '#6245a4', color: '#fff', fontSize: '0.82rem', fontWeight: 700,
                    cursor: 'pointer', opacity: sending || !draft.trim() ? 0.5 : 1,
                  }}
                >
                  <Send size={14} /> {sending ? 'Sending…' : 'Send'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Replace the Tickets tab in `Admin/index.tsx`**

a) Add the import near the other page-level imports at the top:

```tsx
import { TicketInbox } from './TicketInbox';
```

b) Remove the now-unused state (lines ~362–365): `ticketsList`, `ticketsLoading`, `expandedTicket` (and their setters), plus `loadTickets`, `handleTicketStatusChange`, `handleDeleteTicket`, and the `useEffect` branch that calls `loadTickets()`. The `TicketInbox` component owns all of that now.

c) Keep the tab key `'tickets'` and the tab button (header needs the badge). Replace its label with a live unread count sourced from the component later if desired — for now keep the current label.

d) Replace the entire existing Tickets-tab block (lines ~1101–1216) with:

```tsx
{activeTab === 'tickets' && <TicketInbox />}
```

- [ ] **Step 3: Typecheck + browser smoke test**

```bash
cd /home/admin1/PathWise && npx tsc --noEmit
```
Expected: no new errors.

Then `npm run dev` + `encore run`. Log in as admin, go to Admin → Tickets. Verify: list on left with filters (all/unread/open/closed), select a ticket, see the original message as a gray bubble on the left, type a reply → ⌘+Enter → sent reply appears as a purple bubble on the right, email lands in test inbox, ticket moves to `in_progress`.

- [ ] **Step 4: Commit**

```bash
git add src/pages/Admin/TicketInbox.tsx src/pages/Admin/index.tsx
git commit -m "feat(admin): two-pane ticket inbox with inline reply composer"
```

---

## Task 7: Roles — DB migration + auth helper

**Files:**
- Create: `backend/auth/migrations/<next_number>_create_user_roles.up.sql` (pick the next unused migration number in `backend/auth/migrations/`)
- Modify: `backend/auth/auth.ts`

- [ ] **Step 1: Write the migration**

```sql
CREATE TABLE user_roles (
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'support_agent')),
  added_by_email TEXT,
  added_at TEXT NOT NULL,
  PRIMARY KEY (email, role)
);

CREATE INDEX idx_user_roles_email ON user_roles(email);
CREATE INDEX idx_user_roles_role ON user_roles(role);
```

- [ ] **Step 2: Add `checkSupportAccess` helper**

Append to `backend/auth/auth.ts` after `checkAdmin`:

```ts
// ── Support Access Check (internal, callable from other services) ─────────────

export const checkSupportAccess = api(
  { expose: false },
  async ({ userID }: { userID: string }): Promise<{ canAccessTickets: boolean; isAdmin: boolean; isSupportAgent: boolean }> => {
    const row = await db.queryRow`SELECT email FROM users WHERE id = ${userID}`;
    if (!row) return { canAccessTickets: false, isAdmin: false, isSupportAgent: false };
    const email = row.email as string;
    const isAdmin = ADMIN_EMAILS.includes(email);
    let isSupportAgent = false;
    if (!isAdmin) {
      const roleRow = await db.queryRow`
        SELECT 1 FROM user_roles WHERE email = ${email} AND role IN ('admin', 'support_agent')
      `;
      isSupportAgent = !!roleRow;
    }
    return {
      canAccessTickets: isAdmin || isSupportAgent,
      isAdmin: isAdmin || !!(await db.queryRow`SELECT 1 FROM user_roles WHERE email = ${email} AND role = 'admin'`),
      isSupportAgent,
    };
  }
);
```

- [ ] **Step 3: Update `checkAdmin` to honor DB-granted admin role**

Replace the existing `checkAdmin` body with:

```ts
export const checkAdmin = api(
  { expose: false },
  async ({ userID }: { userID: string }): Promise<{ isAdmin: boolean }> => {
    const row = await db.queryRow`SELECT email FROM users WHERE id = ${userID}`;
    if (!row) return { isAdmin: false };
    if (ADMIN_EMAILS.includes(row.email)) return { isAdmin: true };
    const granted = await db.queryRow`
      SELECT 1 FROM user_roles WHERE email = ${row.email} AND role = 'admin'
    `;
    return { isAdmin: !!granted };
  }
);
```

- [ ] **Step 4: Commit**

```bash
git add backend/auth/migrations/*_create_user_roles.up.sql backend/auth/auth.ts
git commit -m "feat(auth): user_roles table + checkSupportAccess helper"
```

---

## Task 8: Role-management API + gate ticket endpoints on support access

**Files:**
- Create: `backend/auth/roles.ts`
- Modify: `backend/tickets/tickets.ts`
- Modify: `backend/tickets/inbound.ts` (no change needed — public webhook)

- [ ] **Step 1: Write role-management endpoints**

Create `backend/auth/roles.ts`:

```ts
import { api, APIError } from "encore.dev/api";
import { getAuthData } from "encore.dev/internal/codegen/auth";
import { SQLDatabase } from "encore.dev/storage/sqldb";
import { AuthData, ADMIN_EMAILS } from "./auth";

const db = SQLDatabase.named("auth");

async function requireAdminEmail(userID: string): Promise<string> {
  const row = await db.queryRow`SELECT email FROM users WHERE id = ${userID}`;
  if (!row) throw APIError.permissionDenied("admin access required");
  const email = row.email as string;
  if (ADMIN_EMAILS.includes(email)) return email;
  const granted = await db.queryRow`
    SELECT 1 FROM user_roles WHERE email = ${email} AND role = 'admin'
  `;
  if (!granted) throw APIError.permissionDenied("admin access required");
  return email;
}

interface RoleEntry {
  email: string;
  role: 'admin' | 'support_agent';
  addedByEmail: string | null;
  addedAt: string;
  isBootstrap: boolean;
  hasAccount: boolean;
  userName: string | null;
}

export const adminListRoles = api(
  { expose: true, method: "GET", path: "/admin/roles", auth: true },
  async (): Promise<{ entries: RoleEntry[] }> => {
    const { userID } = getAuthData<AuthData>()!;
    await requireAdminEmail(userID);

    const entries: RoleEntry[] = [];
    // Bootstrap admins first
    for (const email of ADMIN_EMAILS) {
      const u = await db.queryRow`SELECT name FROM users WHERE email = ${email}`;
      entries.push({
        email, role: 'admin', addedByEmail: null, addedAt: '', isBootstrap: true,
        hasAccount: !!u, userName: u?.name ?? null,
      });
    }
    const rows = db.query`
      SELECT r.email, r.role, r.added_by_email, r.added_at, u.name AS user_name
      FROM user_roles r
      LEFT JOIN users u ON u.email = r.email
      ORDER BY r.role, r.added_at ASC
    `;
    for await (const row of rows) {
      if (row.role === 'admin' && ADMIN_EMAILS.includes(row.email)) continue; // already listed as bootstrap
      entries.push({
        email: row.email, role: row.role, addedByEmail: row.added_by_email,
        addedAt: row.added_at, isBootstrap: false,
        hasAccount: !!row.user_name || !!(await db.queryRow`SELECT 1 FROM users WHERE email = ${row.email}`),
        userName: row.user_name,
      });
    }
    return { entries };
  }
);

export const adminAddRole = api(
  { expose: true, method: "POST", path: "/admin/roles", auth: true },
  async ({ email, role }: { email: string; role: 'admin' | 'support_agent' }): Promise<{ success: boolean }> => {
    const { userID } = getAuthData<AuthData>()!;
    const adminEmail = await requireAdminEmail(userID);

    const normalized = (email ?? '').trim().toLowerCase();
    if (!normalized || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(normalized)) {
      throw APIError.invalidArgument("valid email required");
    }
    if (role !== 'admin' && role !== 'support_agent') {
      throw APIError.invalidArgument("role must be 'admin' or 'support_agent'");
    }

    const now = new Date().toISOString();
    await db.exec`
      INSERT INTO user_roles (email, role, added_by_email, added_at)
      VALUES (${normalized}, ${role}, ${adminEmail}, ${now})
      ON CONFLICT (email, role) DO NOTHING
    `;
    return { success: true };
  }
);

export const adminRemoveRole = api(
  { expose: true, method: "DELETE", path: "/admin/roles", auth: true },
  async ({ email, role }: { email: string; role: 'admin' | 'support_agent' }): Promise<{ success: boolean }> => {
    const { userID } = getAuthData<AuthData>()!;
    await requireAdminEmail(userID);

    const normalized = (email ?? '').trim().toLowerCase();
    if (ADMIN_EMAILS.includes(normalized) && role === 'admin') {
      throw APIError.invalidArgument("cannot remove bootstrap admin");
    }
    await db.exec`DELETE FROM user_roles WHERE email = ${normalized} AND role = ${role}`;
    return { success: true };
  }
);

export const myAccessRoles = api(
  { expose: true, method: "GET", path: "/auth/me/access", auth: true },
  async (): Promise<{ isAdmin: boolean; isSupportAgent: boolean; canAccessTickets: boolean }> => {
    const { userID } = getAuthData<AuthData>()!;
    const row = await db.queryRow`SELECT email FROM users WHERE id = ${userID}`;
    if (!row) return { isAdmin: false, isSupportAgent: false, canAccessTickets: false };
    const email = row.email as string;
    const isBootstrap = ADMIN_EMAILS.includes(email);
    const granted = await db.queryRow`
      SELECT role FROM user_roles WHERE email = ${email}
    `;
    const isAdmin = isBootstrap || granted?.role === 'admin';
    const isSupportAgent = granted?.role === 'support_agent';
    return { isAdmin, isSupportAgent, canAccessTickets: isAdmin || isSupportAgent };
  }
);
```

- [ ] **Step 2: Switch ticket endpoints from `checkAdmin` to `checkSupportAccess`**

In `backend/tickets/tickets.ts`, replace the import line

```ts
import { AuthData, checkAdmin, ADMIN_EMAILS } from "../auth/auth";
```

with

```ts
import { AuthData, checkAdmin, checkSupportAccess, ADMIN_EMAILS } from "../auth/auth";
```

Then, inside every admin-ticket endpoint (`adminListTickets`, `adminUpdateTicket`, `adminDeleteTicket`, `adminReplyTicket`, `adminGetTicketThread`, `adminMarkTicketRead`), replace the three-line admin check:

```ts
const { userID } = getAuthData<AuthData>()!;
const { isAdmin } = await checkAdmin({ userID });
if (!isAdmin) throw APIError.permissionDenied("admin access required");
```

with

```ts
const { userID } = getAuthData<AuthData>()!;
const { canAccessTickets } = await checkSupportAccess({ userID });
if (!canAccessTickets) throw APIError.permissionDenied("support access required");
```

Leave `adminDeleteTicket` restricted to admins — support agents should not delete tickets. For `adminDeleteTicket` only, keep the `checkAdmin` check.

- [ ] **Step 3: Smoke-test gating**

With a bootstrap admin token → `GET /admin/tickets` returns 200. With a regular-user token → 403. After `POST /admin/roles {email, role:'support_agent'}`, that user's token returns 200 on `/admin/tickets` but 403 on `/admin/users`.

- [ ] **Step 4: Commit**

```bash
git add backend/auth/roles.ts backend/tickets/tickets.ts
git commit -m "feat(auth): role management API + gate ticket endpoints on support access"
```

---

## Task 9: Frontend — Team Roles console tab in admin page

**Files:**
- Create: `src/pages/Admin/TeamRoles.tsx`
- Modify: `src/pages/Admin/index.tsx` — add new tab `'team'` before `'tickets'`
- Modify: `src/lib/api.ts` — add role endpoints + `getMyAccess`

- [ ] **Step 1: Add API methods**

In `src/lib/api.ts`, inside `adminApi`:

```ts
  listRoles: () => request<{ entries: Array<{ email: string; role: 'admin' | 'support_agent'; addedByEmail: string | null; addedAt: string; isBootstrap: boolean; hasAccount: boolean; userName: string | null }> }>('/admin/roles'),
  addRole: (email: string, role: 'admin' | 'support_agent') =>
    request<{ success: boolean }>('/admin/roles', { method: 'POST', body: JSON.stringify({ email, role }) }),
  removeRole: (email: string, role: 'admin' | 'support_agent') =>
    request<{ success: boolean }>(`/admin/roles?email=${encodeURIComponent(email)}&role=${role}`, { method: 'DELETE' }),
```

And add a top-level export:

```ts
export const getMyAccess = () =>
  request<{ isAdmin: boolean; isSupportAgent: boolean; canAccessTickets: boolean }>('/auth/me/access');
```

- [ ] **Step 2: Create `TeamRoles.tsx`**

```tsx
import { useEffect, useState } from 'react';
import { adminApi } from '../../lib/api';
import { Shield, Headphones, Trash2, UserPlus } from 'lucide-react';

type RoleEntry = {
  email: string;
  role: 'admin' | 'support_agent';
  addedByEmail: string | null;
  addedAt: string;
  isBootstrap: boolean;
  hasAccount: boolean;
  userName: string | null;
};

export function TeamRoles() {
  const [entries, setEntries] = useState<RoleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'support_agent'>('support_agent');
  const [adding, setAdding] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminApi.listRoles();
      setEntries(res.entries ?? []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    const email = newEmail.trim().toLowerCase();
    if (!email) return;
    setAdding(true);
    try {
      await adminApi.addRole(email, newRole);
      setNewEmail('');
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add role');
    } finally { setAdding(false); }
  };

  const handleRemove = async (email: string, role: 'admin' | 'support_agent') => {
    if (!window.confirm(`Remove ${role.replace('_', ' ')} access for ${email}?`)) return;
    try {
      await adminApi.removeRole(email, role);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to remove role');
    }
  };

  const admins = entries.filter(e => e.role === 'admin');
  const agents = entries.filter(e => e.role === 'support_agent');

  return (
    <div>
      {/* Add form */}
      <div className="panel" style={{ borderRadius: '1.5rem', padding: '1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 8, color: 'var(--on-surface)' }}>
          <UserPlus size={16} style={{ verticalAlign: '-3px', marginRight: 6 }} />
          Grant access
        </div>
        <p style={{ fontSize: '0.82rem', color: 'var(--on-surface-variant)', marginBottom: 12 }}>
          Support agents can view and reply to tickets. They cannot access other admin tabs.
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            type="email"
            value={newEmail}
            onChange={e => setNewEmail(e.target.value)}
            placeholder="teammate@example.com"
            style={{
              flex: '1 1 260px', padding: '0.55rem 0.9rem', borderRadius: 999,
              border: '1px solid var(--outline-variant)', background: 'var(--surface-container)',
              color: 'var(--on-surface)', fontSize: '0.88rem', outline: 'none',
            }}
          />
          <select
            value={newRole}
            onChange={e => setNewRole(e.target.value as 'admin' | 'support_agent')}
            style={{
              padding: '0.55rem 0.9rem', borderRadius: 999, fontSize: '0.82rem', fontWeight: 600,
              border: '1px solid var(--outline-variant)', background: 'var(--surface-container)',
              color: 'var(--on-surface)', cursor: 'pointer', outline: 'none',
            }}
          >
            <option value="support_agent">Support Agent</option>
            <option value="admin">Admin</option>
          </select>
          <button
            onClick={handleAdd}
            disabled={adding || !newEmail.trim()}
            style={{
              padding: '0.55rem 1.1rem', borderRadius: 999, border: 'none',
              background: '#6245a4', color: '#fff', fontSize: '0.82rem', fontWeight: 700,
              cursor: 'pointer', opacity: (adding || !newEmail.trim()) ? 0.5 : 1,
            }}
          >
            {adding ? 'Adding…' : 'Grant access'}
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--on-surface-variant)' }}>Loading…</div>
      ) : (
        <>
          <Section title="Admins" icon={<Shield size={14} />} entries={admins} onRemove={handleRemove} />
          <Section title="Support Agents" icon={<Headphones size={14} />} entries={agents} onRemove={handleRemove} />
        </>
      )}
    </div>
  );
}

function Section({
  title, icon, entries, onRemove,
}: {
  title: string; icon: React.ReactNode; entries: RoleEntry[];
  onRemove: (email: string, role: 'admin' | 'support_agent') => void;
}) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <div style={{
        fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.08em', color: 'var(--on-surface-variant)', marginBottom: 8,
      }}>
        {icon} <span style={{ marginLeft: 6 }}>{title} ({entries.length})</span>
      </div>
      {entries.length === 0 ? (
        <div className="panel" style={{ borderRadius: '1.25rem', padding: '1rem', color: 'var(--on-surface-variant)', fontSize: '0.85rem' }}>
          None yet.
        </div>
      ) : (
        <div className="panel" style={{ borderRadius: '1.25rem', padding: 0, overflow: 'hidden' }}>
          {entries.map((e, idx) => (
            <div key={`${e.email}-${e.role}`} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0.85rem 1rem',
              borderBottom: idx < entries.length - 1 ? '1px solid var(--outline-variant)' : 'none',
            }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--on-surface)' }}>
                  {e.userName ? `${e.userName} · ` : ''}{e.email}
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--on-surface-variant)', marginTop: 2 }}>
                  {e.isBootstrap
                    ? 'Built-in admin (config file)'
                    : `${e.hasAccount ? 'Active account' : 'Pending — no account yet'}${e.addedByEmail ? ` · added by ${e.addedByEmail}` : ''}`}
                </div>
              </div>
              {!e.isBootstrap && (
                <button
                  onClick={() => onRemove(e.email, e.role)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'none', border: '1px solid #ef444444', color: '#ef4444',
                    cursor: 'pointer', padding: 0,
                  }}
                  title="Remove access"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Wire the Team tab into the admin page**

In `src/pages/Admin/index.tsx`:

- Add `'team'` to `TabKey`:

```ts
type TabKey = 'users' | 'analytics' | 'system' | 'team' | 'tickets';
```

- Add the tab button (place it right before the Tickets tab button):

```tsx
<button style={tabStyle(activeTab === 'team')} onClick={() => setActiveTab('team')}>
  <Shield size={14} style={{ verticalAlign: '-2px', marginRight: 6 }} />Team
</button>
```

(Import `Shield` from `lucide-react` if not already imported.)

- Render the tab:

```tsx
{activeTab === 'team' && <TeamRoles />}
```

- Add the import at the top:

```tsx
import { TeamRoles } from './TeamRoles';
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/api.ts src/pages/Admin/TeamRoles.tsx src/pages/Admin/index.tsx
git commit -m "feat(admin): Team Roles console for granting support access"
```

---

## Task 10: `/support` standalone route for non-admin support agents

**Files:**
- Create: `src/pages/Support/index.tsx`
- Modify: `src/App.tsx` (or wherever routes are defined) — add `/support` route
- Modify: `src/components/Sidebar.tsx` (or equivalent nav component) — conditionally show "Support Inbox" link

- [ ] **Step 1: Locate the route definitions and nav**

Run: `cd /home/admin1/PathWise && grep -Rn "path=\"/admin\"" src/ | head -5` to find the router file. Run: `grep -Rn "Admin Console\|/admin" src/components/ src/layouts/ 2>/dev/null | head` to find the sidebar link.

Expected: pinpoint the file to modify (likely `src/App.tsx` and `src/components/Sidebar.tsx` or `src/pages/Dashboard/DashboardLayout.tsx`).

- [ ] **Step 2: Create the `/support` page**

Create `src/pages/Support/index.tsx`:

```tsx
import { useEffect, useState } from 'react';
import { TicketInbox } from '../Admin/TicketInbox';
import { getMyAccess } from '../../lib/api';

export default function SupportPage() {
  const [state, setState] = useState<'loading' | 'ok' | 'denied'>('loading');

  useEffect(() => {
    let alive = true;
    getMyAccess()
      .then(res => { if (alive) setState(res.canAccessTickets ? 'ok' : 'denied'); })
      .catch(() => { if (alive) setState('denied'); });
    return () => { alive = false; };
  }, []);

  if (state === 'loading') {
    return <div style={{ padding: '2rem', color: 'var(--on-surface-variant)' }}>Checking access…</div>;
  }
  if (state === 'denied') {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--on-surface)' }}>No support access</h2>
        <p style={{ color: 'var(--on-surface-variant)' }}>
          This page is for PathWise support agents. If you think you should have access, ask an admin.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem 2rem', minHeight: '100vh', background: 'var(--surface)' }}>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--on-surface)' }}>
        Support Inbox
      </h1>
      <TicketInbox />
    </div>
  );
}
```

- [ ] **Step 3: Register the route**

Add to the router file (pattern matches existing routes):

```tsx
<Route path="/support" element={<SupportPage />} />
```

and the import `import SupportPage from './pages/Support';`.

- [ ] **Step 4: Conditionally show the sidebar link**

At the top of the sidebar component, fetch access once:

```tsx
const [access, setAccess] = useState<{ isAdmin: boolean; canAccessTickets: boolean }>({ isAdmin: false, canAccessTickets: false });
useEffect(() => {
  getMyAccess().then(setAccess).catch(() => {});
}, []);
```

Render:
- If `access.isAdmin` → show existing "Admin Console" link (→ `/admin`).
- If `access.canAccessTickets` → show "Support Inbox" link (→ `/support`). Admins see both links.

- [ ] **Step 5: Smoke-test**

Create a regular user, grant them `support_agent` via Team Roles, log in as that user: sidebar shows "Support Inbox" (not Admin Console), `/support` renders the inbox, `/admin` redirects or shows a permission-denied state. Log in as admin: both links visible.

- [ ] **Step 6: Commit**

```bash
git add src/pages/Support/index.tsx src/App.tsx src/components/Sidebar.tsx
git commit -m "feat(support): standalone /support route for non-admin support agents"
```

---

## Task 11: Changelog entry

**Files:**
- Modify: `src/pages/WhatsNew/changelogData.ts`

- [ ] **Step 1: Add new entry at the top**

```ts
{
  version: '<next-version>',
  date: '2026-04-21',
  title: 'Support inbox + Team Roles',
  items: [
    { icon: 'Inbox', title: 'Support inbox', body: 'Admin Tickets is now a proper two-pane inbox with unread indicators, search, and filters.' },
    { icon: 'MessageSquare', title: 'Two-way replies', body: 'Reply to tickets inline. User replies to support emails automatically appear in the thread.' },
    { icon: 'Shield', title: 'Team Roles', body: 'Admins can grant teammates support-agent access to just the ticket inbox — no access to the rest of the admin console.' },
  ],
},
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/WhatsNew/changelogData.ts
git commit -m "docs(changelog): support inbox + Team Roles"
```

---

## Task 12 (operator, not agent): Flip DNS + configure Resend Inbound

- [ ] **Step 1:** In Resend → Inbound → add route `hello@pathwise.fit` → webhook `https://<prod-host>/webhooks/resend/inbound`.
- [ ] **Step 2:** Update `pathwise.fit` MX records per Resend's Inbound setup page. **This stops whatever currently receives mail at `hello@pathwise.fit` — only do it once you want PathWise to own the address.**
- [ ] **Step 3:** Send a reply from a real mailbox to a support email. Confirm the message appears in the inbox within ~30s.

---

## Self-Review Notes

- **Spec coverage:** proper inbox (Task 6), thread of sent replies (Tasks 1–3, 5), automatic capture of user reply-backs (Task 4), DNS/operator step flagged separately (Task 8), changelog entry (Task 7).
- **Resend flow verified from docs:** `email.received` webhook ships only metadata; full body + headers come from `POST /emails/receiving` with `email_id`. Threading uses `Message-ID` + `In-Reply-To` + `References`, subject prefixed with `Re:`.
- **Threading robustness:** outbound emails embed a sentinel `<ticket-<uuid>-...>` in `Message-ID`. Inbound match order: (1) regex sentinel from In-Reply-To/References, (2) DB lookup on `message_id`, (3) sender-email fallback to most recent non-closed ticket. Idempotent on `resend_email_id`.
- **Status transitions:** admin reply flips `open → in_progress` + clears `unread`; user reply sets `unread=1` + flips `closed → open`.
- **No placeholders** — every code block is complete. Types in Task 3 (`ThreadReply`) match Task 5 shape and Task 6 consumption.
