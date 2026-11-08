import type { EmailMessage } from "@/server/providers/email";

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const MAGIC_LINK_MINUTES = 15;

/** Build the sign-in email. Everything interpolated into HTML is escaped. */
export function buildMagicLinkEmail(to: string, url: string, siteName = "Hunarly"): EmailMessage {
  const subject = `Sign in to ${siteName}`;
  const text = [
    `Use this link to sign in to ${siteName}:`,
    "",
    url,
    "",
    `The link works once and expires in ${MAGIC_LINK_MINUTES} minutes.`,
    "If you did not ask for it, you can ignore this email.",
  ].join("\n");
  const safeUrl = escapeHtml(url);
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#12162b">
<h1 style="font-size:20px;margin:0 0 16px">Sign in to ${escapeHtml(siteName)}</h1>
<p style="margin:0 0 24px">Click the button to sign in. The link works once and expires in ${MAGIC_LINK_MINUTES} minutes.</p>
<p style="margin:0 0 24px"><a href="${safeUrl}" style="background:#3140d8;color:#ffffff;padding:12px 20px;border-radius:8px;text-decoration:none;display:inline-block">Sign in</a></p>
<p style="font-size:13px;color:#555b73;margin:0">If you did not ask for this, you can ignore this email.</p>
</div>`;
  return { to, subject, text, html };
}
