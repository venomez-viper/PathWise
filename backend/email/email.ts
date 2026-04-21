import { api } from "encore.dev/api";
import { secret } from "encore.dev/config";
import { Resend } from "resend";

const resendKey = secret("ResendAPIKey");

function getResend() {
  return new Resend(resendKey());
}

const FROM_EMAIL = "PathWise <hello@pathwise.fit>";
const BRAND_COLOR = "#6245a4";
const BRAND_DARK = "#1a1a2e";

// ── HTML Escape Function ──

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ── Internal email sending function (not exposed) ──

export const sendEmail = api(
  { expose: false },
  async ({
    to, subject, html, cc, messageId, inReplyTo, references,
  }: {
    to: string | string[];
    subject: string;
    html: string;
    cc?: string[];
    messageId?: string;
    inReplyTo?: string;
    references?: string;
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

      const res = await resend.emails.send({
        from: FROM_EMAIL,
        to,
        ...(cc && cc.length > 0 ? { cc } : {}),
        subject,
        html,
        headers,
      });
      return { success: true, messageId, resendId: res?.data?.id };
    } catch (err) {
      console.error("Email send failed:", { to, subject, error: err instanceof Error ? err.message : "unknown" });
      return { success: false };
    }
  }
);

// ── Shared layout wrapper (Gmail-optimized, table-based) ──

function layout(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>PathWise</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f7; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f7;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.06);">
          <!-- Header -->
          <tr>
            <td style="background: ${BRAND_DARK}; padding: 20px 40px; text-align: center;">
              <img src="https://www.pathwise.fit/email-logo.png" alt="PathWise" width="200" height="43" style="display:block;margin:0 auto;max-width:200px;height:auto;">
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 40px 40px 32px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px 32px; border-top: 1px solid #eaeaef;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 12px; color: #9ca3af; line-height: 1.6;">
                    <p style="margin: 0;">PathWise Career Intelligence</p>
                    <p style="margin: 4px 0 0;"><a href="https://pathwise.fit" style="color: #9ca3af;">pathwise.fit</a> &nbsp;&middot;&nbsp; <a href="https://pathwise.fit/privacy-policy" style="color: #9ca3af;">Privacy</a> &nbsp;&middot;&nbsp; <a href="https://pathwise.fit/terms-of-service" style="color: #9ca3af;">Terms</a></p>
                    <p style="margin: 12px 0 0;"><a href="mailto:hello@pathwise.fit?subject=Unsubscribe" style="color: #9ca3af; text-decoration: underline;">Unsubscribe</a></p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function button(text: string, href: string): string {
  return `
<table role="presentation" cellpadding="0" cellspacing="0" style="margin: 28px 0;">
  <tr>
    <td style="background: ${BRAND_COLOR}; border-radius: 8px;">
      <a href="${href}" style="display: inline-block; padding: 14px 36px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; font-weight: 700; color: #ffffff; text-decoration: none;">
        ${text}
      </a>
    </td>
  </tr>
</table>`;
}

function p(content: string): string {
  return `<p style="margin: 0 0 16px; font-size: 15px; color: #374151; line-height: 1.65;">${content}</p>`;
}

function h1(content: string): string {
  return `<h1 style="margin: 0 0 20px; font-size: 24px; font-weight: 800; color: ${BRAND_DARK}; line-height: 1.3;">${content}</h1>`;
}

function step(num: number, title: string, desc: string): string {
  return `
<tr>
  <td style="padding: 14px 16px; background: #f9fafb; border-radius: 8px;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td width="36" valign="top" style="padding-right: 12px;">
          <div style="width: 28px; height: 28px; border-radius: 50%; background: ${BRAND_COLOR}; color: #fff; text-align: center; line-height: 28px; font-size: 13px; font-weight: 700;">${num}</div>
        </td>
        <td style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; color: #374151; line-height: 1.5;">
          <strong style="color: ${BRAND_DARK};">${title}</strong><br>
          <span style="color: #6b7280;">${desc}</span>
        </td>
      </tr>
    </table>
  </td>
</tr>
<tr><td style="height: 8px;"></td></tr>`;
}

// ── Email Templates ──

export function welcomeEmail(name: string): { subject: string; html: string } {
  const firstName = escapeHtml(name.split(" ")[0]);
  return {
    subject: `${firstName}, welcome to PathWise`,
    html: layout(`
      ${h1(`Welcome, ${firstName}.`)}
      ${p("Your PathWise account is ready. You now have access to career matching, skill gap analysis, and a personalized roadmap built around your goals.")}
      ${p("Here is how to get the most out of PathWise:")}

      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 8px;">
        ${step(1, "Take the Career Assessment", "5 minutes. Multi-dimensional analysis of your interests, values, and work style.")}
        ${step(2, "Review Your Career Matches", "90+ career profiles scored against your personality. See where you fit best.")}
        ${step(3, "Follow Your Roadmap", "Step-by-step milestones and daily tasks tailored to your timeline.")}
      </table>

      ${button("Open PathWise", "https://pathwise.fit/app")}
      ${p('Questions? Reply to this email or reach us at <a href="mailto:support@pathwise.fit" style="color: ' + BRAND_COLOR + ';">support@pathwise.fit</a>.')}
    `),
  };
}

export function contactConfirmationEmail(name: string): { subject: string; html: string } {
  const firstName = escapeHtml(name.split(" ")[0]);
  return {
    subject: "We received your message",
    html: layout(`
      ${h1("Message received.")}
      ${p(`Hi ${firstName}, thanks for reaching out. We have received your message and our team will get back to you within 24 hours.`)}
      <hr style="border: none; border-top: 1px solid #eaeaef; margin: 24px 0;">
      ${p("While you wait, you can continue working on your career roadmap:")}
      ${button("Go to Dashboard", "https://pathwise.fit/app")}
      ${p('Need urgent help? Email us directly at <a href="mailto:support@pathwise.fit" style="color: ' + BRAND_COLOR + ';">support@pathwise.fit</a>.')}
    `),
  };
}

export function adminTicketNotificationEmail(
  ticketName: string,
  ticketEmail: string,
  ticketSubject: string,
  ticketMessage: string
): { subject: string; html: string } {
  const escapedName = escapeHtml(ticketName);
  const escapedEmail = escapeHtml(ticketEmail);
  const escapedSubject = escapeHtml(ticketSubject);
  const escapedMessage = escapeHtml(ticketMessage);

  return {
    subject: `Support ticket: ${escapedSubject || escapedName}`,
    html: layout(`
      ${h1("New Support Ticket")}

      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <tr>
          <td style="padding: 10px 0; font-size: 14px; color: #6b7280; border-bottom: 1px solid #f3f4f6; width: 80px; font-weight: 600;">From</td>
          <td style="padding: 10px 0; font-size: 14px; color: #111827; border-bottom: 1px solid #f3f4f6;">${escapedName}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; font-size: 14px; color: #6b7280; border-bottom: 1px solid #f3f4f6; font-weight: 600;">Email</td>
          <td style="padding: 10px 0; font-size: 14px; color: #111827; border-bottom: 1px solid #f3f4f6;"><a href="mailto:${escapedEmail}" style="color: ${BRAND_COLOR};">${escapedEmail}</a></td>
        </tr>
        <tr>
          <td style="padding: 10px 0; font-size: 14px; color: #6b7280; font-weight: 600;">Subject</td>
          <td style="padding: 10px 0; font-size: 14px; color: #111827;">${escapedSubject || "No subject"}</td>
        </tr>
      </table>

      <div style="padding: 20px; background: #f9fafb; border-radius: 8px; border-left: 3px solid ${BRAND_COLOR}; font-size: 14px; color: #374151; line-height: 1.65; margin: 0 0 24px;">
        ${escapedMessage.replace(/\n/g, "<br>")}
      </div>

      ${button("View in Admin Panel", "https://pathwise.fit/app/admin")}
    `),
  };
}

function renderMessageBody(message: string): string {
  // Render message as HTML: preserve line breaks, linkify URLs, allow safe inline tags
  return message
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n\n+/g, '</p><p style="margin: 0 0 16px; font-size: 15px; color: #374151; line-height: 1.65;">')
    .replace(/\n/g, "<br>")
    .replace(
      /(https?:\/\/[^\s<>"]+)/g,
      `<a href="$1" style="color: ${BRAND_COLOR}; text-decoration: underline;">$1</a>`
    );
}

export function adminReplyEmail(
  recipientName: string,
  subject: string,
  message: string
): { subject: string; html: string } {
  const firstName = escapeHtml(recipientName.split(" ")[0]);
  const bodyHtml = renderMessageBody(message);
  return {
    subject: escapeHtml(subject),
    html: layout(`
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 8px;">
        <tr>
          <td style="padding: 0 0 4px;">
            <span style="display: inline-block; padding: 4px 12px; background: ${BRAND_COLOR}18; color: ${BRAND_COLOR}; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; border-radius: 999px;">PathWise Team</span>
          </td>
        </tr>
      </table>

      ${h1(`Hi ${firstName},`)}

      <p style="margin: 0 0 16px; font-size: 15px; color: #374151; line-height: 1.65;">
        ${bodyHtml}
      </p>

      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 28px 0 24px; border-top: 1px solid #eaeaef;">
        <tr>
          <td style="padding: 20px 0 0; font-size: 13px; color: #6b7280; line-height: 1.6;">
            <strong style="color: #374151;">The PathWise Team</strong><br>
            <a href="mailto:hello@pathwise.fit" style="color: ${BRAND_COLOR};">hello@pathwise.fit</a>
            &nbsp;&middot;&nbsp;
            <a href="https://pathwise.fit" style="color: ${BRAND_COLOR};">pathwise.fit</a>
          </td>
        </tr>
      </table>
    `),
  };
}

export function adminBroadcastEmail(
  subject: string,
  message: string
): { subject: string; html: string } {
  const bodyHtml = renderMessageBody(message);
  return {
    subject: escapeHtml(subject),
    html: layout(`
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 8px;">
        <tr>
          <td style="padding: 0 0 4px;">
            <span style="display: inline-block; padding: 4px 12px; background: ${BRAND_COLOR}18; color: ${BRAND_COLOR}; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; border-radius: 999px;">PathWise Team</span>
          </td>
        </tr>
      </table>

      <p style="margin: 0 0 20px; font-size: 15px; color: #374151; line-height: 1.65;">
        ${bodyHtml}
      </p>

      ${button("Open PathWise", "https://pathwise.fit/app")}

      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 8px 0 0; border-top: 1px solid #eaeaef;">
        <tr>
          <td style="padding: 20px 0 0; font-size: 13px; color: #6b7280; line-height: 1.6;">
            <strong style="color: #374151;">The PathWise Team</strong><br>
            <a href="mailto:hello@pathwise.fit" style="color: ${BRAND_COLOR};">hello@pathwise.fit</a>
            &nbsp;&middot;&nbsp;
            <a href="https://pathwise.fit" style="color: ${BRAND_COLOR};">pathwise.fit</a>
          </td>
        </tr>
      </table>
    `),
  };
}

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

  return {
    subject: safeSubject,
    html: layout(`
      <p style="margin:0 0 16px;font-size:16px;color:#1a1a2e;">Hi ${safeName},</p>
      <div style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#333;">${safeBody}</div>
      <p style="margin:24px 0 0;font-size:14px;color:#666;">— ${safeAdmin}<br>PathWise Support</p>
      <p style="margin:16px 0 0;font-size:12px;color:#999;">Just reply to this email — we'll see it in your ticket.</p>
    `),
  };
}

export function passwordResetEmail(resetUrl: string): { subject: string; html: string } {
  return {
    subject: "Reset your PathWise password",
    html: layout(`
      ${h1("Reset your password")}
      ${p("We received a request to reset your PathWise account password. Click the button below to choose a new password.")}
      ${button("Reset Password", escapeHtml(resetUrl))}
      ${p("This link expires in <strong>1 hour</strong>. If you didn't request a password reset, you can safely ignore this email.")}
      ${p('Need help? Contact us at <a href="mailto:support@pathwise.fit" style="color: ' + BRAND_COLOR + ';">support@pathwise.fit</a>.')}
    `),
  };
}
