import { api, APIError } from "encore.dev/api";
import { getAuthData } from "encore.dev/internal/codegen/auth";
import { SQLDatabase } from "encore.dev/storage/sqldb";
import { AuthData, checkAdmin, checkSupportAccess, ADMIN_EMAILS } from "../auth/auth";
import { RateLimits } from "../shared/rate-limiter";

const db = new SQLDatabase("tickets", { migrations: "./migrations" });

// ── Shared helpers ────────────────────────────────────────────────────────────

/** RFC 5321 octet limit for an email address is 254 chars. */
const MAX_EMAIL_LEN = 254;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Normalize a list of email addresses: lowercase, trim, drop empties, enforce
 * max length, max count, and RFC-ish format. Throws APIError on invalid input.
 */
function normalizeEmailList(
  list: string[] | undefined,
  label: string,
  maxCount: number,
): string[] {
  if (!list) return [];
  const out: string[] = [];
  for (const raw of list) {
    const addr = (raw ?? "").trim().toLowerCase();
    if (!addr) continue;
    if (addr.length > MAX_EMAIL_LEN) {
      throw APIError.invalidArgument(`${label} email too long`);
    }
    if (!EMAIL_REGEX.test(addr)) {
      throw APIError.invalidArgument(`invalid ${label} email`);
    }
    out.push(addr);
  }
  if (out.length > maxCount) {
    throw APIError.invalidArgument(`too many ${label} recipients (max ${maxCount})`);
  }
  return out;
}

/**
 * Map a DB / internal error to a short, non-leaky category we can safely
 * surface to support agents in UI responses and debug logs. The full error
 * is still logged server-side via console.error.
 */
function categorizeInternalError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (/constraint|foreign key|violates/i.test(msg)) return "db-constraint";
  if (/column.*does not exist|schema/i.test(msg)) return "db-schema";
  if (/duplicate key/i.test(msg)) return "db-duplicate";
  if (/connection|timeout|ECONN/i.test(msg)) return "db-connection";
  return "internal-error";
}

// ── Submit Ticket (public, no auth) ───────────────────────────────────────────

interface SubmitTicketParams {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

interface TicketResponse {
  id: string;
  success: boolean;
}

export const submitTicket = api(
  { expose: true, method: "POST", path: "/tickets", auth: false },
  async (params: SubmitTicketParams): Promise<TicketResponse> => {
    RateLimits.contact("ticket:" + params.email);
    if (!params.name || !params.name.trim()) {
      throw APIError.invalidArgument("name is required");
    }
    if (!params.email || !params.email.trim()) {
      throw APIError.invalidArgument("email is required");
    }
    if (!params.message || !params.message.trim()) {
      throw APIError.invalidArgument("message is required");
    }
    if (params.message.trim().length < 10) {
      throw APIError.invalidArgument("message must be at least 10 characters");
    }
    if (params.name.length > 100) throw APIError.invalidArgument("name too long");
    if (params.email.length > MAX_EMAIL_LEN) throw APIError.invalidArgument("email too long");
    const submitterEmail = params.email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(submitterEmail)) {
      throw APIError.invalidArgument("invalid email address");
    }
    if (params.subject && params.subject.length > 500) throw APIError.invalidArgument("subject too long");
    if (params.message.length > 5000) throw APIError.invalidArgument("message too long");

    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const subject = params.subject ?? null;

    await db.exec`
      INSERT INTO tickets (id, name, email, subject, message, status, created_at)
      VALUES (${id}, ${params.name}, ${submitterEmail}, ${subject}, ${params.message}, 'open', ${now})
    `;

    // Send confirmation to user + notification to admin
    try {
      const { sendEmail, contactConfirmationEmail, adminTicketNotificationEmail } = await import("../email/email");
      // Confirm to user
      const confirm = contactConfirmationEmail(params.name);
      await sendEmail({ to: submitterEmail, ...confirm });
      // Notify all admins
      const notify = adminTicketNotificationEmail(params.name, submitterEmail, params.subject || '', params.message);
      await Promise.all(ADMIN_EMAILS.map(email => sendEmail({ to: email, ...notify })));
    } catch (err) {
      // Ticket is already stored; emails are best-effort. Log server-side
      // so on-call can spot sustained failures (e.g. Resend outages).
      console.error("submitTicket: email dispatch failed", err instanceof Error ? err.message : err);
    }

    return { id, success: true };
  }
);

// ── Admin List Tickets ────────────────────────────────────────────────────────

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
  initiatedBy: "user" | "agent";
}

interface AdminTicketsResponse {
  tickets: AdminTicket[];
}

export const adminListTickets = api(
  { expose: true, method: "GET", path: "/admin/tickets", auth: true },
  async (): Promise<AdminTicketsResponse> => {
    const { userID } = getAuthData<AuthData>()!;
    const { canAccessTickets } = await checkSupportAccess({ userID });
    if (!canAccessTickets) {
      throw APIError.permissionDenied("support access required");
    }

    const tickets: AdminTicket[] = [];
    const rows = db.query`
      SELECT
        t.id, t.name, t.email, t.subject, t.message, t.status, t.created_at,
        t.unread, COALESCE(t.last_activity_at, t.created_at) AS last_activity_at,
        COALESCE(t.initiated_by, 'user') AS initiated_by,
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
        initiatedBy: row.initiated_by === "agent" ? "agent" : "user",
      });
    }
    return { tickets };
  }
);

// ── Admin Update Ticket Status ────────────────────────────────────────────────

interface UpdateTicketParams {
  ticketId: string;
  status: string;
}

export const adminUpdateTicket = api(
  { expose: true, method: "PATCH", path: "/admin/tickets/:ticketId", auth: true },
  async (params: UpdateTicketParams): Promise<{ success: boolean }> => {
    const { userID } = getAuthData<AuthData>()!;
    const { canAccessTickets } = await checkSupportAccess({ userID });
    if (!canAccessTickets) {
      throw APIError.permissionDenied("support access required");
    }

    const validStatuses = ["open", "in_progress", "closed"];
    if (!validStatuses.includes(params.status)) {
      throw APIError.invalidArgument("status must be 'open', 'in_progress', or 'closed'");
    }

    const existing = await db.queryRow`SELECT id FROM tickets WHERE id = ${params.ticketId}`;
    if (!existing) {
      throw APIError.notFound("ticket not found");
    }

    await db.exec`UPDATE tickets SET status = ${params.status} WHERE id = ${params.ticketId}`;

    return { success: true };
  }
);

// ── Admin Reply to Ticket ─────────────────────────────────────────────────────

interface ReplyToTicketParams {
  ticketId: string;
  subject: string;
  message: string;
  additionalTo?: string[];
  cc?: string[];
  from?: string;
  rawHtml?: string;
}

export const adminReplyToTicket = api(
  { expose: true, method: "POST", path: "/admin/tickets/:ticketId/reply", auth: true },
  async (params: ReplyToTicketParams): Promise<{ success: boolean; replyId: string }> => {
    const { userID } = getAuthData<AuthData>()!;
    RateLimits.ticketReply("reply:" + userID);

    const { canAccessTickets } = await checkSupportAccess({ userID });
    if (!canAccessTickets) {
      throw APIError.permissionDenied("support access required");
    }

    if (!params.subject?.trim()) throw APIError.invalidArgument("subject is required");
    if (!params.message?.trim()) throw APIError.invalidArgument("message is required");
    if (params.subject.length > 500) throw APIError.invalidArgument("subject too long");
    if (params.message.length > 10000) throw APIError.invalidArgument("message too long");

    const ticket = await db.queryRow<{ name: string; email: string }>`
      SELECT name, email FROM tickets WHERE id = ${params.ticketId}
    `;
    if (!ticket) throw APIError.notFound("ticket not found");

    const { getUserEmail } = await import("../auth/auth");
    const { getSignatureForUser } = await import("../auth/roles");
    const authorEmail = (await getUserEmail({ userID })).email ?? "admin@pathwise.fit";
    const signature = (await getSignatureForUser({ userID })).signature;
    const messageWithSignature = signature
      ? `${params.message}\n\n${signature}`
      : params.message;

    const replyId = crypto.randomUUID();
    const now = new Date().toISOString();
    const messageId = `<ticket-${params.ticketId}-${replyId}@pathwise.fit>`;
    const originalMessageId = `<ticket-${params.ticketId}-original@pathwise.fit>`;

    // Build References chain from prior messages for proper Gmail threading
    const priorIds: string[] = [originalMessageId];
    const priorRows = db.query`
      SELECT message_id FROM ticket_replies
      WHERE ticket_id = ${params.ticketId} AND message_id IS NOT NULL
      ORDER BY created_at ASC
    `;
    for await (const r of priorRows) {
      if (r.message_id) priorIds.push(r.message_id);
    }
    const inReplyTo = priorIds[priorIds.length - 1];
    const references = priorIds.join(" ");

    // Store the reply in the thread table (includes signature so admins see what went out)
    await db.exec`
      INSERT INTO ticket_replies (id, ticket_id, direction, author_email, author_name, body, message_id, in_reply_to, created_at)
      VALUES (${replyId}, ${params.ticketId}, 'admin', ${authorEmail}, 'PathWise Support', ${messageWithSignature}, ${messageId}, ${inReplyTo}, ${now})
    `;
    await db.exec`
      UPDATE tickets
      SET last_activity_at = ${now},
          unread = 0,
          status = CASE WHEN status = 'open' THEN 'in_progress' ELSE status END
      WHERE id = ${params.ticketId}
    `;

    const { sendEmail, adminReplyEmail, FROM_KEYS } = await import("../email/email");
    if (params.from && !(FROM_KEYS as string[]).includes(params.from)) {
      throw APIError.invalidArgument(`invalid from address: ${params.from}`);
    }
    if (params.rawHtml) {
      // rawHtml bypasses our templating/escaping; restrict to admins so
      // support agents can't craft arbitrary HTML emails from a verified
      // pathwise.fit sender.
      const { isAdmin } = await checkAdmin({ userID });
      if (!isAdmin) {
        throw APIError.permissionDenied("HTML editing is admin-only");
      }
      if (params.rawHtml.length > 200000) {
        throw APIError.invalidArgument("rawHtml too long (max 200KB)");
      }
    }
    const emailContent = params.rawHtml
      ? { subject: params.subject, html: params.rawHtml }
      : adminReplyEmail(params.subject, messageWithSignature);

    // Primary ticket email is always included (it's already been validated
    // at ticket-creation time). Additional recipients and CC must pass the
    // same format + length + count checks as compose so we never hand
    // unsanitized strings to Resend.
    const extraTo = normalizeEmailList(params.additionalTo, "additional to", 10);
    const ccList = normalizeEmailList(params.cc, "cc", 10);
    const toList = [ticket.email, ...extraTo];

    await sendEmail({
      to: toList.length === 1 ? toList[0] : toList,
      cc: ccList.length > 0 ? ccList : undefined,
      // Route replies to the Resend Inbound subdomain so user reply-backs
      // are captured automatically by the /webhooks/resend/inbound handler.
      replyTo: "reply@support.pathwise.fit",
      messageId,
      inReplyTo,
      references,
      from: params.from,
      ...emailContent,
    });

    return { success: true, replyId };
  }
);

// ── Admin Delete Ticket ───────────────────────────────────────────────────────

export const adminDeleteTicket = api(
  { expose: true, method: "DELETE", path: "/admin/tickets/:ticketId", auth: true },
  async ({ ticketId }: { ticketId: string }): Promise<{ success: boolean }> => {
    const { userID } = getAuthData<AuthData>()!;
    const { isAdmin } = await checkAdmin({ userID });
    if (!isAdmin) {
      throw APIError.permissionDenied("admin access required");
    }

    const existing = await db.queryRow`SELECT id FROM tickets WHERE id = ${ticketId}`;
    if (!existing) {
      throw APIError.notFound("ticket not found");
    }

    await db.exec`DELETE FROM tickets WHERE id = ${ticketId}`;

    return { success: true };
  }
);
// ── Admin Preview Ticket Reply (renders email HTML without sending) ───────────

interface PreviewTicketReplyParams {
  ticketId: string;
  subject: string;
  message: string;
}

export const adminPreviewTicketReply = api(
  { expose: true, method: "POST", path: "/admin/tickets/:ticketId/reply/preview", auth: true },
  async (params: PreviewTicketReplyParams): Promise<{ subject: string; html: string }> => {
    const { userID } = getAuthData<AuthData>()!;
    const { canAccessTickets } = await checkSupportAccess({ userID });
    if (!canAccessTickets) {
      throw APIError.permissionDenied("support access required");
    }
    if (!params.subject?.trim()) throw APIError.invalidArgument("subject is required");
    if (!params.message?.trim()) throw APIError.invalidArgument("message is required");
    if (params.subject.length > 500) throw APIError.invalidArgument("subject too long");
    if (params.message.length > 10000) throw APIError.invalidArgument("message too long");

    const ticket = await db.queryRow<{ name: string }>`
      SELECT name FROM tickets WHERE id = ${params.ticketId}
    `;
    if (!ticket) throw APIError.notFound("ticket not found");

    const { getSignatureForUser } = await import("../auth/roles");
    const signature = (await getSignatureForUser({ userID })).signature;
    const messageWithSignature = signature
      ? `${params.message}\n\n${signature}`
      : params.message;

    const { adminReplyEmail } = await import("../email/email");
    return adminReplyEmail(params.subject, messageWithSignature);
  }
);

// ── Admin Get Ticket Thread ───────────────────────────────────────────────────

interface ThreadReply {
  id: string;
  direction: "admin" | "user";
  authorEmail: string;
  authorName: string | null;
  body: string;
  createdAt: string;
}

export const adminGetTicketThread = api(
  { expose: true, method: "GET", path: "/admin/tickets/:ticketId/thread", auth: true },
  async ({ ticketId }: { ticketId: string }): Promise<{ replies: ThreadReply[] }> => {
    const { userID } = getAuthData<AuthData>()!;
    const { canAccessTickets } = await checkSupportAccess({ userID });
    if (!canAccessTickets) {
      throw APIError.permissionDenied("support access required");
    }

    const replies: ThreadReply[] = [];
    const rows = db.query`
      SELECT id, direction, author_email, author_name, body, created_at
      FROM ticket_replies
      WHERE ticket_id = ${ticketId}
      ORDER BY created_at ASC
    `;
    for await (const row of rows) {
      replies.push({
        id: row.id,
        direction: row.direction as "admin" | "user",
        authorEmail: row.author_email,
        authorName: row.author_name,
        body: row.body,
        createdAt: row.created_at,
      });
    }
    return { replies };
  }
);

// ── Admin Compose Email (send to any recipient from the inbox) ───────────────

interface ComposeEmailParams {
  to: string[];
  cc?: string[];
  subject: string;
  message: string;
  from?: string;
  // Optional: agent-edited HTML. If present, this exact HTML is sent instead
  // of rendering the `message` plaintext through adminBroadcastEmail.
  rawHtml?: string;
}

interface ComposeFailure {
  to: string;
  error: string;
}

export const adminComposeEmail = api(
  { expose: true, method: "POST", path: "/admin/compose-email", auth: true },
  async (params: ComposeEmailParams): Promise<{ success: boolean; sent: number; ticketIds: string[]; failures: ComposeFailure[] }> => {
    const { userID } = getAuthData<AuthData>()!;
    RateLimits.ticketReply("compose:" + userID);

    const { canAccessTickets } = await checkSupportAccess({ userID });
    if (!canAccessTickets) {
      throw APIError.permissionDenied("support access required");
    }

    const toList = normalizeEmailList(params.to, "to", 10);
    const ccList = normalizeEmailList(params.cc, "cc", 10);
    if (toList.length === 0) throw APIError.invalidArgument("to is required");
    if (!params.subject?.trim()) throw APIError.invalidArgument("subject is required");
    if (!params.message?.trim()) throw APIError.invalidArgument("message is required");
    if (params.subject.length > 500) throw APIError.invalidArgument("subject too long");
    if (params.message.length > 10000) throw APIError.invalidArgument("message too long");
    if (params.rawHtml) {
      const { isAdmin } = await checkAdmin({ userID });
      if (!isAdmin) {
        throw APIError.permissionDenied("HTML editing is admin-only");
      }
      if (params.rawHtml.length > 200000) {
        throw APIError.invalidArgument("rawHtml too long (max 200KB)");
      }
    }

    const { getUserEmail } = await import("../auth/auth");
    const { getSignatureForUser } = await import("../auth/roles");
    const authorEmail = (await getUserEmail({ userID })).email ?? "admin@pathwise.fit";
    const signature = (await getSignatureForUser({ userID })).signature;
    const messageWithSignature = signature ? `${params.message}\n\n${signature}` : params.message;

    const { sendEmail, adminBroadcastEmail, FROM_KEYS } = await import("../email/email");
    if (params.from && !(FROM_KEYS as string[]).includes(params.from)) {
      throw APIError.invalidArgument(`invalid from address: ${params.from}`);
    }
    const emailContent = params.rawHtml
      ? { subject: params.subject, html: params.rawHtml }
      : adminBroadcastEmail(params.subject, messageWithSignature);
    const trimmedSubject = params.subject.trim();

    const ticketIds: string[] = [];
    const failures: ComposeFailure[] = [];
    let sent = 0;

    await Promise.allSettled(toList.map(async to => {
      const ticketId = crypto.randomUUID();
      const replyId = crypto.randomUUID();
      const now = new Date().toISOString();
      const messageId = `<ticket-${ticketId}-${replyId}@pathwise.fit>`;
      const nameFromEmail = to.split("@")[0] || to;

      // Create a tracked ticket so replies thread back into the inbox.
      // Wrapped because if a migration hasn't applied (missing column), this
      // INSERT throws and Promise.allSettled would silently eat it, leaving
      // the agent confused about why their compose didn't create a ticket.
      try {
        try {
          await db.exec`
            INSERT INTO tickets
              (id, name, email, subject, message, status, created_at, unread, last_activity_at, initiated_by)
            VALUES
              (${ticketId}, ${nameFromEmail}, ${to}, ${trimmedSubject}, ${messageWithSignature},
               'open', ${now}, 0, ${now}, 'agent')
          `;
        } catch (errWithCol) {
          // Fall back to pre-migration-4 schema so compose still tracks
          // the ticket (as 'user'-initiated) until the column lands.
          const colMsg = errWithCol instanceof Error ? errWithCol.message : String(errWithCol);
          if (/initiated_by/i.test(colMsg) || /column.*does not exist/i.test(colMsg)) {
            await db.exec`
              INSERT INTO tickets
                (id, name, email, subject, message, status, created_at, unread, last_activity_at)
              VALUES
                (${ticketId}, ${nameFromEmail}, ${to}, ${trimmedSubject}, ${messageWithSignature},
                 'open', ${now}, 0, ${now})
            `;
          } else {
            throw errWithCol;
          }
        }
        await db.exec`
          INSERT INTO ticket_replies
            (id, ticket_id, direction, author_email, author_name, body, message_id, in_reply_to, created_at)
          VALUES
            (${replyId}, ${ticketId}, 'admin', ${authorEmail}, 'PathWise Support',
             ${messageWithSignature}, ${messageId}, NULL, ${now})
        `;
        ticketIds.push(ticketId);
      } catch (dbErr) {
        // Log the full error server-side but return only a short category
        // to the UI so PG error text (tables, constraint names, hints) never
        // leaks to agents.
        console.error("adminComposeEmail: ticket create failed", {
          to, err: dbErr instanceof Error ? dbErr.message : dbErr,
        });
        failures.push({ to, error: `could not create ticket (${categorizeInternalError(dbErr)})` });
        return; // don't send if we can't track it
      }

      const res = await sendEmail({
        to,
        cc: ccList.length > 0 ? ccList : undefined,
        ...emailContent,
        replyTo: "reply@support.pathwise.fit",
        messageId,
        references: messageId,
        from: params.from,
      });
      if (res.success) {
        sent++;
      } else {
        failures.push({ to, error: res.error ?? "unknown error" });
      }
    }));

    return { success: true, sent, ticketIds, failures };
  }
);

// ── Admin Preview Compose Email ───────────────────────────────────────────────

export const adminPreviewCompose = api(
  { expose: true, method: "POST", path: "/admin/compose-email/preview", auth: true },
  async ({ subject, message }: { subject: string; message: string }): Promise<{ subject: string; html: string }> => {
    const { userID } = getAuthData<AuthData>()!;
    const { canAccessTickets } = await checkSupportAccess({ userID });
    if (!canAccessTickets) throw APIError.permissionDenied("support access required");
    if (!subject?.trim()) throw APIError.invalidArgument("subject is required");
    if (!message?.trim()) throw APIError.invalidArgument("message is required");
    if (subject.length > 500) throw APIError.invalidArgument("subject too long");
    if (message.length > 10000) throw APIError.invalidArgument("message too long");

    const { getSignatureForUser } = await import("../auth/roles");
    const signature = (await getSignatureForUser({ userID })).signature;
    const messageWithSignature = signature ? `${message}\n\n${signature}` : message;

    const { adminBroadcastEmail } = await import("../email/email");
    return adminBroadcastEmail(subject, messageWithSignature);
  }
);

// ── Admin Inbound Debug Log ──────────────────────────────────────────────────

interface InboundDebugEntry {
  id: string;
  receivedAt: string;
  decision: string;
  fromEmail: string | null;
  toAddresses: string[];
  subject: string | null;
  reason: string | null;
  hasSvixHeaders: boolean;
  resendEmailId: string | null;
}

export const adminListInboundLog = api(
  { expose: true, method: "GET", path: "/admin/inbound-log", auth: true },
  async (): Promise<{ entries: InboundDebugEntry[] }> => {
    const { userID } = getAuthData<AuthData>()!;
    const { canAccessTickets } = await checkSupportAccess({ userID });
    if (!canAccessTickets) throw APIError.permissionDenied("support access required");

    const entries: InboundDebugEntry[] = [];
    const rows = db.query`
      SELECT id, received_at, decision, from_email, to_addresses_json,
             subject, reason, has_svix_headers, resend_email_id
      FROM inbound_debug_log
      ORDER BY received_at DESC
      LIMIT 50
    `;
    for await (const row of rows) {
      let to: string[] = [];
      if (row.to_addresses_json) {
        try { to = JSON.parse(row.to_addresses_json); } catch { to = []; }
      }
      entries.push({
        id: row.id,
        receivedAt: row.received_at,
        decision: row.decision,
        fromEmail: row.from_email,
        toAddresses: to,
        subject: row.subject,
        reason: row.reason,
        hasSvixHeaders: Boolean(row.has_svix_headers),
        resendEmailId: row.resend_email_id,
      });
    }
    return { entries };
  }
);

// ── Admin List Sender Addresses ──────────────────────────────────────────────

interface SenderOption {
  key: string;
  address: string;
  label: string;
}

export const adminListSenders = api(
  { expose: true, method: "GET", path: "/admin/senders", auth: true },
  async (): Promise<{ senders: SenderOption[] }> => {
    const { userID } = getAuthData<AuthData>()!;
    const { canAccessTickets } = await checkSupportAccess({ userID });
    if (!canAccessTickets) throw APIError.permissionDenied("support access required");

    const { FROM_ADDRESSES, FROM_KEYS } = await import("../email/email");
    const senders: SenderOption[] = FROM_KEYS.map(k => {
      const full = FROM_ADDRESSES[k];
      const match = full.match(/^(.*?)\s*<([^>]+)>$/);
      const label = match ? match[1].trim() : full;
      const address = match ? match[2].trim() : full;
      return { key: k, address, label };
    });
    return { senders };
  }
);

// ── Admin Mark Ticket Read ────────────────────────────────────────────────────

export const adminMarkTicketRead = api(
  { expose: true, method: "POST", path: "/admin/tickets/:ticketId/read", auth: true },
  async ({ ticketId }: { ticketId: string }): Promise<{ success: boolean }> => {
    const { userID } = getAuthData<AuthData>()!;
    const { canAccessTickets } = await checkSupportAccess({ userID });
    if (!canAccessTickets) {
      throw APIError.permissionDenied("support access required");
    }
    await db.exec`UPDATE tickets SET unread = 0 WHERE id = ${ticketId}`;
    return { success: true };
  }
);

// ── Internal: Purge a user's data from the tickets DB ────────────────────────

/**
 * Wipe everything in this service that is associated with a user. Called by
 * `auth.adminDeleteUser` and `auth.deleteAccount` as part of the cross-service
 * cascade (each Encore SQL DB is isolated, so no FK CASCADE saves us here).
 *
 * Match strategy:
 *   - tickets.email = userEmail  → covers public submitTicket flow where the
 *     ticket was created with no user_id link
 *   - inbound_debug_log.from_email = userEmail → strip incoming-mail traces
 *
 * Best-effort: each statement is wrapped so one schema drift / missing
 * column / locked row doesn't abort the rest of the purge. Failures are
 * logged but the call still resolves with `success: true` so the caller
 * can continue fanning out to other services.
 */
export const purgeUser = api(
  { expose: false },
  async ({ userId, userEmail }: { userId: string; userEmail: string | null }): Promise<{ success: boolean; deleted: Record<string, boolean> }> => {
    void userId; // tickets are matched by email, not user_id (public submitTicket)
    const deleted: Record<string, boolean> = {};
    const lcEmail = userEmail ? userEmail.trim().toLowerCase() : null;

    if (lcEmail) {
      try {
        // ticket_replies cascade automatically via FK ON DELETE CASCADE
        await db.exec`DELETE FROM tickets WHERE LOWER(email) = ${lcEmail}`;
        deleted.tickets = true;
      } catch (err) {
        console.error("purgeUser(tickets): tickets delete failed", err instanceof Error ? err.message : err);
        deleted.tickets = false;
      }

      try {
        await db.exec`DELETE FROM inbound_debug_log WHERE LOWER(from_email) = ${lcEmail}`;
        deleted.inbound_debug_log = true;
      } catch (err) {
        console.error("purgeUser(tickets): inbound_debug_log delete failed", err instanceof Error ? err.message : err);
        deleted.inbound_debug_log = false;
      }
    } else {
      deleted.tickets = false;
      deleted.inbound_debug_log = false;
    }

    // support_snippets is keyed on user_id (admin/agent table — survives even
    // if the user record went missing on the auth side).
    try {
      await db.exec`DELETE FROM support_snippets WHERE user_id = ${userId}`;
      deleted.support_snippets = true;
    } catch (err) {
      console.error("purgeUser(tickets): support_snippets delete failed", err instanceof Error ? err.message : err);
      deleted.support_snippets = false;
    }

    return { success: true, deleted };
  }
);

// Trigger Encore redeploy - Tue Apr 21 04:18:00 PM CDT 2026 (inbox outbox v0.22.0)
