import { Resend } from "resend";
import { t, type Locale } from "@/lib/i18n";

type SendInviteEmailInput = {
  to: string;
  recipientName: string;
  tenantName: string;
  role: string;
  inviteUrl: string;
  locale: Locale;
};

type SendInviteEmailResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

function buildInviteEmail({
  recipientName,
  tenantName,
  role,
  inviteUrl,
  locale,
}: Omit<SendInviteEmailInput, "to">): { subject: string; html: string } {
  const params = {
    name: recipientName,
    tenantName,
    role: t(locale, `staff.role.${role}`),
  };

  const subject = t(locale, "email.invite.subject", params);
  const greeting = t(locale, "email.invite.greeting", params);
  const body = t(locale, "email.invite.body", params);
  const cta = t(locale, "email.invite.cta");
  const expiry = t(locale, "email.invite.expiry");
  const footer = t(locale, "email.invite.footer");

  // Sarbi system template — tenant brand colors don't apply because the
  // email is sent to a brand-new staff member who hasn't seen the owner's
  // palette yet. This keeps the brand consistent across all invite emails.
  const html = `<!DOCTYPE html>
<html>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #F8F9FA; padding: 32px 16px; color: #111827; line-height: 1.5;">
    <div style="max-width: 480px; margin: 0 auto; background: #FFFFFF; border-radius: 8px; padding: 32px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
      <h1 style="margin: 0 0 8px; font-size: 24px; color: #F59E0B; font-weight: 700;">Sarbi</h1>
      <p style="margin: 0 0 24px; font-size: 14px; color: #6B7280;">${greeting}</p>
      <p style="margin: 0 0 24px; font-size: 16px; color: #111827;">${body}</p>
      <a href="${inviteUrl}" style="display: inline-block; background: #F59E0B; color: #FFFFFF; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px;">${cta}</a>
      <p style="margin: 24px 0 0; font-size: 12px; color: #9CA3AF;">${expiry}</p>
      <p style="margin: 16px 0 0; font-size: 12px; color: #9CA3AF;">${footer}</p>
    </div>
  </body>
</html>`;

  return { subject, html };
}

export async function sendInviteEmail(
  input: SendInviteEmailInput
): Promise<SendInviteEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.RESEND_FROM ?? "Sarbi <noreply@sarbi.tn>";

  if (!apiKey) {
    return { ok: false, error: "RESEND_API_KEY is not configured" };
  }

  const resend = new Resend(apiKey);
  const { subject, html } = buildInviteEmail(input);

  try {
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [input.to],
      subject,
      html,
    });

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, id: data?.id ?? "unknown" };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Unknown email error",
    };
  }
}
