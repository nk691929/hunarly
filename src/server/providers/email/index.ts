import type { EmailTransport } from "@/features/auth/status";
import { createConsoleEmailProvider } from "@/server/providers/email/console";
import { createResendEmailProvider } from "@/server/providers/email/resend";

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html: string;
}

/** Swap vendors by adding another implementation; feature code only sees this interface. */
export interface EmailProvider {
  send(message: EmailMessage): Promise<void>;
}

export function selectEmailProvider(options: {
  transport: EmailTransport;
  resendApiKey?: string;
  emailFrom?: string;
}): EmailProvider | null {
  if (options.transport === "resend" && options.resendApiKey && options.emailFrom) {
    return createResendEmailProvider({ apiKey: options.resendApiKey, from: options.emailFrom });
  }
  if (options.transport === "console") return createConsoleEmailProvider();
  return null;
}
