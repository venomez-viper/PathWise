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

// ── Internal email sending function (not exposed) ──

export const sendEmail = api(
  { expose: false },
  async ({ to, subject, html }: { to: string; subject: string; html: string }): Promise<{ success: boolean }> => {
    try {
      const resend = getResend();
      await resend.emails.send({ from: FROM_EMAIL, to, subject, html });
      return { success: true };
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
            <td style="background: ${BRAND_DARK}; padding: 24px 40px; text-align: center;">
              <img src="https://pathwise.fit/logo.png" alt="PathWise" width="140" style="display: inline-block; height: auto; max-width: 140px;">
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
  const firstName = name.split(" ")[0];
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
  const firstName = name.split(" ")[0];
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
  return {
    subject: `Support ticket: ${ticketSubject || ticketName}`,
    html: layout(`
      ${h1("New Support Ticket")}

      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <tr>
          <td style="padding: 10px 0; font-size: 14px; color: #6b7280; border-bottom: 1px solid #f3f4f6; width: 80px; font-weight: 600;">From</td>
          <td style="padding: 10px 0; font-size: 14px; color: #111827; border-bottom: 1px solid #f3f4f6;">${ticketName}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; font-size: 14px; color: #6b7280; border-bottom: 1px solid #f3f4f6; font-weight: 600;">Email</td>
          <td style="padding: 10px 0; font-size: 14px; color: #111827; border-bottom: 1px solid #f3f4f6;"><a href="mailto:${ticketEmail}" style="color: ${BRAND_COLOR};">${ticketEmail}</a></td>
        </tr>
        <tr>
          <td style="padding: 10px 0; font-size: 14px; color: #6b7280; font-weight: 600;">Subject</td>
          <td style="padding: 10px 0; font-size: 14px; color: #111827;">${ticketSubject || "No subject"}</td>
        </tr>
      </table>

      <div style="padding: 20px; background: #f9fafb; border-radius: 8px; border-left: 3px solid ${BRAND_COLOR}; font-size: 14px; color: #374151; line-height: 1.65; margin: 0 0 24px;">
        ${ticketMessage.replace(/\n/g, "<br>")}
      </div>

      ${button("View in Admin Panel", "https://pathwise.fit/app/admin")}
    `),
  };
}
