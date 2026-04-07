import { api } from "encore.dev/api";
import { secret } from "encore.dev/config";
import { Resend } from "resend";

const resendKey = secret("ResendAPIKey");

function getResend() {
  return new Resend(resendKey());
}

const FROM_EMAIL = "PathWise <hello@pathwise.fit>";

// ── Internal email sending function (not exposed) ──

export const sendEmail = api(
  { expose: false },
  async ({ to, subject, html }: { to: string; subject: string; html: string }): Promise<{ success: boolean }> => {
    try {
      const resend = getResend();
      await resend.emails.send({
        from: FROM_EMAIL,
        to,
        subject,
        html,
      });
      return { success: true };
    } catch (err) {
      console.error("Email send failed:", { to, subject, error: err instanceof Error ? err.message : "unknown" });
      return { success: false };
    }
  }
);

// ── Email templates ──

export function welcomeEmail(name: string): { subject: string; html: string } {
  return {
    subject: "Welcome to PathWise!",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 28px; font-weight: 800; color: #1a1a2e; margin: 0;">Welcome to PathWise</h1>
        </div>
        <p style="font-size: 16px; color: #333; line-height: 1.6;">Hi ${name},</p>
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          Thanks for joining PathWise. You're one step closer to mapping your career and building a roadmap to get there.
        </p>
        <p style="font-size: 16px; color: #333; line-height: 1.6;">Here's what to do next:</p>
        <ol style="font-size: 16px; color: #333; line-height: 1.8; padding-left: 20px;">
          <li><strong>Take the Career Assessment</strong> (5 minutes)</li>
          <li><strong>Get your career matches</strong> based on your personality</li>
          <li><strong>Follow your personalized roadmap</strong> with daily tasks</li>
        </ol>
        <div style="text-align: center; margin: 32px 0;">
          <a href="https://pathwise.fit/app" style="display: inline-block; background: #6245a4; color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 16px;">
            Get Started
          </a>
        </div>
        <p style="font-size: 14px; color: #888; line-height: 1.5; border-top: 1px solid #eee; padding-top: 20px; margin-top: 32px;">
          You're receiving this because you signed up for PathWise. If this wasn't you, please ignore this email.
        </p>
      </div>
    `,
  };
}

export function contactConfirmationEmail(name: string): { subject: string; html: string } {
  return {
    subject: "We received your message",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="font-size: 24px; font-weight: 800; color: #1a1a2e; margin: 0 0 16px;">Message Received</h1>
        <p style="font-size: 16px; color: #333; line-height: 1.6;">Hi ${name},</p>
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          Thanks for reaching out to PathWise. We've received your message and will get back to you within 24-48 hours.
        </p>
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          In the meantime, feel free to explore your career roadmap at <a href="https://pathwise.fit/app" style="color: #6245a4;">pathwise.fit</a>.
        </p>
        <p style="font-size: 14px; color: #888; line-height: 1.5; border-top: 1px solid #eee; padding-top: 20px; margin-top: 32px;">
          PathWise Career Intelligence
        </p>
      </div>
    `,
  };
}

export function adminTicketNotificationEmail(ticketName: string, ticketEmail: string, ticketSubject: string, ticketMessage: string): { subject: string; html: string } {
  return {
    subject: `New support ticket from ${ticketName}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="font-size: 24px; font-weight: 800; color: #1a1a2e; margin: 0 0 16px;">New Support Ticket</h1>
        <table style="width: 100%; font-size: 15px; color: #333; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; font-weight: 600; width: 80px;">From:</td><td>${ticketName} (${ticketEmail})</td></tr>
          <tr><td style="padding: 8px 0; font-weight: 600;">Subject:</td><td>${ticketSubject || 'No subject'}</td></tr>
        </table>
        <div style="margin-top: 16px; padding: 16px; background: #f8f9fa; border-radius: 8px; font-size: 15px; color: #333; line-height: 1.6;">
          ${ticketMessage.replace(/\n/g, '<br/>')}
        </div>
        <div style="margin-top: 24px;">
          <a href="https://pathwise.fit/app/admin" style="display: inline-block; background: #6245a4; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px;">
            View in Admin
          </a>
        </div>
      </div>
    `,
  };
}
