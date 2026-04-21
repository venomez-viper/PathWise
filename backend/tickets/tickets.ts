import { api, APIError } from "encore.dev/api";
import { getAuthData } from "encore.dev/internal/codegen/auth";
import { SQLDatabase } from "encore.dev/storage/sqldb";
import { AuthData, checkAdmin, ADMIN_EMAILS } from "../auth/auth";
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
}

interface AdminTicketsResponse {
  tickets: AdminTicket[];
}

export const adminListTickets = api(
  { expose: true, method: "GET", path: "/admin/tickets", auth: true },
  async (): Promise<AdminTicketsResponse> => {
    const { userID } = getAuthData<AuthData>()!;
    const { isAdmin } = await checkAdmin({ userID });
    if (!isAdmin) {
      throw APIError.permissionDenied("admin access required");
    }

    const tickets: AdminTicket[] = [];
    const rows = db.query`
      SELECT id, name, email, subject, message, status, created_at
      FROM tickets ORDER BY created_at DESC
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
    const { isAdmin } = await checkAdmin({ userID });
    if (!isAdmin) {
      throw APIError.permissionDenied("admin access required");
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
  async (params: ReplyToTicketParams): Promise<{ success: boolean }> => {
    const { userID } = getAuthData<AuthData>()!;
    const { isAdmin } = await checkAdmin({ userID });
    if (!isAdmin) {
      throw APIError.permissionDenied("admin access required");
    }

    if (!params.subject?.trim()) throw APIError.invalidArgument("subject is required");
    if (!params.message?.trim()) throw APIError.invalidArgument("message is required");
    if (params.subject.length > 500) throw APIError.invalidArgument("subject too long");
    if (params.message.length > 10000) throw APIError.invalidArgument("message too long");

    const ticket = await db.queryRow<{ name: string; email: string }>`
      SELECT name, email FROM tickets WHERE id = ${params.ticketId}
    `;
    if (!ticket) throw APIError.notFound("ticket not found");

    const { sendEmail, adminReplyEmail } = await import("../email/email");
    const emailContent = adminReplyEmail(ticket.name, params.subject, params.message);

    // Build To list: primary ticket email + any additional addresses
    const toList = [ticket.email, ...(params.additionalTo ?? [])].filter(Boolean);
    const ccList = (params.cc ?? []).filter(Boolean);

    await sendEmail({ to: toList.length === 1 ? toList[0] : toList, cc: ccList.length > 0 ? ccList : undefined, ...emailContent });

    return { success: true };
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
// Trigger Encore redeploy - Wed Apr  8 06:28:34 PM CDT 2026
