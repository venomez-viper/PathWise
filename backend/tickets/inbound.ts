/**
 * Resend Inbound webhook — receives user reply-backs to support emails.
 *
 * Security posture (email content is adversarial/public input):
 *   1. Svix signature verification BEFORE trusting payload
 *   2. Size limits on raw request (256 KB) and extracted body (50 KB)
 *   3. Per-sender rate limit (20 inbound replies per hour per from-address)
 *   4. Text-only storage — HTML is stripped to plain text, never rendered
 *   5. Attachments ignored entirely — we don't store or process them
 *   6. Binary/non-printable content rejected
 *   7. URL-flood detection (reject > 50 URLs in one message)
 *   8. Idempotent on resend_email_id — duplicate webhooks are no-ops
 *   9. Isolated DB — this handler never queries the users/auth tables
 *
 * The handler always returns 200 for valid-but-unmatched events so Resend
 * doesn't retry-storm; it only returns 4xx on signature failures or bad input.
 */

import { api } from "encore.dev/api";
import { secret } from "encore.dev/config";
import { SQLDatabase } from "encore.dev/storage/sqldb";
import { Resend } from "resend";
import { RateLimits } from "../shared/rate-limiter";

const db = SQLDatabase.named("tickets");
const resendKey = secret("ResendAPIKey");
const webhookSecret = secret("ResendWebhookSecret");

const MAX_RAW_BYTES = 256 * 1024;          // 256 KB hard cap on webhook request size
const MAX_BODY_CHARS = 50 * 1024;          // 50 KB stored body cap
const MAX_URLS_PER_BODY = 50;              // spam signal
const MAX_NONPRINTABLE_RATIO = 0.2;        // 20% threshold

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
  if (!match) return { email: from.trim().toLowerCase(), name: null };
  const name = (match[1] ?? "").trim() || null;
  return { email: match[2].trim().toLowerCase(), name };
}

function stripHtmlToText(html: string): string {
  return html
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function isMalicious(body: string): { bad: boolean; reason?: string } {
  if (body.length === 0) return { bad: true, reason: "empty" };

  // Non-printable ratio
  let nonPrintable = 0;
  for (let i = 0; i < body.length; i++) {
    const code = body.charCodeAt(i);
    if (code < 9 || (code > 13 && code < 32) || code === 127) nonPrintable++;
  }
  if (nonPrintable / body.length > MAX_NONPRINTABLE_RATIO) {
    return { bad: true, reason: "binary-content" };
  }

  // URL flood
  const urlMatches = body.match(/https?:\/\/\S+/gi);
  if (urlMatches && urlMatches.length > MAX_URLS_PER_BODY) {
    return { bad: true, reason: "url-flood" };
  }

  return { bad: false };
}

function failedAuthenticationResults(headers: Record<string, string>): boolean {
  const authResults = headers["Authentication-Results"] ?? headers["authentication-results"] ?? "";
  if (!authResults) return false;
  const lc = authResults.toLowerCase();
  return /spf=fail/.test(lc) || /dkim=fail/.test(lc) || /dmarc=fail/.test(lc);
}

export const ticketInboundWebhook = api.raw(
  { expose: true, method: "POST", path: "/webhooks/resend/inbound", auth: false },
  async (req, resp) => {
    // 1. Read raw body with size cap
    const chunks: Buffer[] = [];
    let total = 0;
    for await (const chunk of req) {
      total += (chunk as Buffer).length;
      if (total > MAX_RAW_BYTES) {
        resp.writeHead(413); resp.end("payload too large"); return;
      }
      chunks.push(chunk as Buffer);
    }
    const raw = Buffer.concat(chunks).toString("utf-8");

    // 2. Verify svix signature before parsing anything
    const svixId = (req.headers["svix-id"] as string | undefined) ?? "";
    const svixTimestamp = (req.headers["svix-timestamp"] as string | undefined) ?? "";
    const svixSignature = (req.headers["svix-signature"] as string | undefined) ?? "";

    let secretValue: string;
    try {
      secretValue = webhookSecret();
    } catch {
      console.error("Inbound: ResendWebhookSecret not configured");
      resp.writeHead(500); resp.end("webhook secret missing"); return;
    }
    if (!svixId || !svixTimestamp || !svixSignature) {
      resp.writeHead(400); resp.end("missing signature headers"); return;
    }

    const resend = new Resend(resendKey());
    let verified: unknown;
    try {
      verified = resend.webhooks.verify({
        payload: raw,
        headers: { id: svixId, timestamp: svixTimestamp, signature: svixSignature },
        webhookSecret: secretValue,
      });
    } catch {
      resp.writeHead(400); resp.end("invalid signature"); return;
    }

    const payload = verified as InboundPayload;
    if (payload?.type !== "email.received" || !payload.data?.email_id) {
      resp.writeHead(200); resp.end("ignored"); return;
    }

    // 3. Idempotency
    const existing = await db.queryRow`
      SELECT id FROM ticket_replies WHERE resend_email_id = ${payload.data.email_id}
    `;
    if (existing) { resp.writeHead(200); resp.end("duplicate"); return; }

    // 4. Parse sender + rate limit
    const fromRaw = payload.data.from ?? "";
    const { email: fromEmail, name: fromName } = parseFrom(fromRaw);
    if (!fromEmail) { resp.writeHead(200); resp.end("no-sender"); return; }

    try {
      RateLimits.inboundSender("inbound:" + fromEmail);
    } catch {
      console.warn("Inbound: rate-limited sender", { fromEmail });
      resp.writeHead(200); resp.end("rate-limited"); return;
    }

    // 5. Fetch full body + headers via SDK
    let email: {
      text: string | null;
      html: string | null;
      headers: Record<string, string> | null;
      from: string;
      subject: string;
      message_id: string;
    };
    try {
      const got = await resend.emails.receiving.get(payload.data.email_id);
      if (got.error || !got.data) throw new Error(got.error?.message ?? "no data");
      email = got.data;
    } catch (err) {
      console.error("Inbound: failed to fetch email body", {
        email_id: payload.data.email_id,
        err: err instanceof Error ? err.message : "unknown",
      });
      resp.writeHead(200); resp.end("fetch-failed"); return;
    }

    const headers = email.headers ?? {};

    // 6. Reject unauthenticated senders (SPF/DKIM/DMARC failures)
    if (failedAuthenticationResults(headers)) {
      console.warn("Inbound: dropped — failed authentication", { fromEmail });
      resp.writeHead(200); resp.end("auth-failed"); return;
    }

    // 7. Extract text body (prefer plain text; strip HTML if that's all we have)
    let body: string;
    if (email.text && email.text.trim()) {
      body = email.text;
    } else if (email.html && email.html.trim()) {
      body = stripHtmlToText(email.html);
    } else {
      resp.writeHead(200); resp.end("empty-body"); return;
    }
    body = body.slice(0, MAX_BODY_CHARS).trim();

    // 8. Malicious-content checks
    const check = isMalicious(body);
    if (check.bad) {
      console.warn("Inbound: dropped suspicious content", { fromEmail, reason: check.reason });
      resp.writeHead(200); resp.end("suspicious"); return;
    }

    // 9. Match to ticket: sentinel → stored message_id → sender-email fallback
    const inReplyTo = headers["In-Reply-To"] ?? headers["in-reply-to"] ?? null;
    const references = headers["References"] ?? headers["references"] ?? "";
    const incomingMessageId = email.message_id ?? payload.data.message_id ?? headers["Message-ID"] ?? headers["message-id"] ?? null;

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
      console.warn("Inbound: no matching ticket", {
        fromEmail, subject: payload.data.subject, email_id: payload.data.email_id,
      });
      resp.writeHead(200); resp.end("no-match"); return;
    }

    // 10. Insert reply + bump ticket state
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
