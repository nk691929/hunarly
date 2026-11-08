export interface AuthEnv {
  NODE_ENV: string;
  DATABASE_URL?: string;
  AUTH_SECRET?: string;
  AUTH_GOOGLE_ID?: string;
  AUTH_GOOGLE_SECRET?: string;
  RESEND_API_KEY?: string;
  EMAIL_FROM?: string;
}

export type EmailTransport = "resend" | "console" | null;

export interface AuthStatus {
  /** Accounts are fully set up: database, secret and at least one sign-in method. */
  configured: boolean;
  google: boolean;
  email: boolean;
  emailTransport: EmailTransport;
}

/**
 * Decide which sign-in features are available from the environment.
 * - Email links go out through Resend when configured, or print to the terminal in development.
 * - Without a database and a secret, accounts are off and the site runs in guest mode.
 */
export function resolveAuthStatus(env: AuthEnv): AuthStatus {
  const google = Boolean(env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_SECRET);
  const emailTransport: EmailTransport =
    env.RESEND_API_KEY && env.EMAIL_FROM
      ? "resend"
      : env.NODE_ENV === "development"
        ? "console"
        : null;
  const email = emailTransport !== null;
  const configured = Boolean(env.DATABASE_URL && env.AUTH_SECRET) && (google || email);
  return { configured, google: configured && google, email: configured && email, emailTransport };
}
