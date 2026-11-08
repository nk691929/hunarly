import type { EmailProvider } from "@/server/providers/email";

/** Development only: prints the email (including the sign-in link) to the terminal. */
export function createConsoleEmailProvider(): EmailProvider {
  return {
    async send(message) {
      console.warn(
        `\n[dev email] To: ${message.to}\n[dev email] Subject: ${message.subject}\n${message.text}\n`,
      );
    },
  };
}
