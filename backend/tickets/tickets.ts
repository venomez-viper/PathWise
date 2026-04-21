import { api, APIError } from "encore.dev/api";
import { getAuthData } from "encore.dev/internal/codegen/auth";
import { SQLDatabase } from "encore.dev/storage/sqldb";
import { AuthData, checkAdmin, checkSupportAccess, ADMIN_EMAILS } from "../auth/auth";
import { RateLimits } from "../shared/rate-limiter";

const db = new SQLDatabase("tickets", { migrations: "./migrations" });

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
    if (params.email.length > 255) throw APIError.invalidArgument("email too long");
    if (params.subject && params.subject.length > 500) throw APIError.invalidArgument("subject too long");
    if (params.message.length > 5000) throw APIError.invalidArgument("message too long");

    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const subject = params.subject ?? null;

    await db.exec`
      INSERT INTO tickets (id, name, email, subject, message, status, created_at)
      VALUES (${id}, ${params.name}, ${params.email}, ${subject}, ${params.message}, 'open', ${now})
    `;

    // Send confirmation to user + notification to admin
    try {
      const { sendEmail, contactConfirmationEmail, adminTicketNotificationEmail } = await import("../email/email");
      // Confirm to user
      const confirm = contactConfirmationEmail(params.name);
      await sendEmail({ to: params.email, ...confirm });
      // Notify all admins
      const notify = adminTicketNotificationEmail(params.name, params.email, params.subject || '', params.message);
      await Promise.all(ADMIN_EMAILS.map(email => sendEmail({ to: email, ...notify })));
    } catch {}

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
    const authorEmail = (await getUserEmail({ userID })).email ?? "admin@pathwise.fit";

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

    // Store the reply in the thread table
    await db.exec`
      INSERT INTO ticket_replies (id, ticket_id, direction, author_email, author_name, body, message_id, in_reply_to, created_at)
      VALUES (${replyId}, ${params.ticketId}, 'admin', ${authorEmail}, 'PathWise Support', ${params.message}, ${messageId}, ${inReplyTo}, ${now})
    `;
    await db.exec`
      UPDATE tickets
      SET last_activity_at = ${now},
          unread = 0,
          status = CASE WHEN status = 'open' THEN 'in_progress' ELSE status END
      WHERE id = ${params.ticketId}
    `;

    const { sendEmail, adminReplyEmail } = await import("../email/email");
    const emailContent = adminReplyEmail(ticket.name, params.subject, params.message);

    // Build To list: primary ticket email + any additional addresses
    const toList = [ticket.email, ...(params.additionalTo ?? [])].filter(Boolean);
    const ccList = (params.cc ?? []).filter(Boolean);

    await sendEmail({
      to: toList.length === 1 ? toList[0] : toList,
      cc: ccList.length > 0 ? ccList : undefined,
      messageId,
      inReplyTo,
      references,
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

    const { adminReplyEmail } = await import("../email/email");
    return adminReplyEmail(ticket.name, params.subject, params.message);
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

// Trigger Encore redeploy - Wed Apr  8 06:28:34 PM CDT 2026
