import type { EmailProvider } from "@/server/providers/email";

/** Sends through Resend's HTTP API. The API key is never logged or included in errors. */
export function createResendEmailProvider(options: {
  apiKey: string;
  from: string;
  fetchImpl?: typeof fetch;
}): EmailProvider {
  const doFetch = options.fetchImpl ?? fetch;
  return {
    async send(message) {
      const response = await doFetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${options.apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: options.from,
          to: [message.to],
          subject: message.subject,
          html: message.html,
          text: message.text,
        }),
      });
      if (!response.ok)
        throw new Error(`Email provider rejected the message (status ${response.status})`);
    },
  };
}
