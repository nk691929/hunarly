import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth, { type Session } from "next-auth";
import type { Provider } from "next-auth/providers";
import Google from "next-auth/providers/google";
import { env } from "@/config/env";
import { authStatus } from "@/server/auth-status";
import { getDb } from "@/server/db";
import { selectEmailProvider } from "@/server/providers/email";
import { buildMagicLinkEmail, MAGIC_LINK_MINUTES } from "@/server/providers/email/magic-link";

function buildProviders(): Provider[] {
  const providers: Provider[] = [];

  if (authStatus.google) {
    // Reads AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET from the environment.
    // Linking by email is safe here because Google only returns verified email addresses, and
    // it lets someone who first used an email link sign in with Google later.
    providers.push(Google({ allowDangerousEmailAccountLinking: true }));
  }

  if (authStatus.email) {
    const emailProvider = selectEmailProvider({
      transport: authStatus.emailTransport,
      resendApiKey: env.RESEND_API_KEY,
      emailFrom: env.EMAIL_FROM,
    });
    providers.push({
      id: "email",
      type: "email",
      name: "Email",
      from: env.EMAIL_FROM ?? "Hunarly <login@localhost>",
      maxAge: MAGIC_LINK_MINUTES * 60,
      options: {},
      async sendVerificationRequest({ identifier, url }) {
        if (!emailProvider) throw new Error("No email provider is configured");
        await emailProvider.send(buildMagicLinkEmail(identifier, url));
      },
    });
  }

  return providers;
}

const nextAuth = authStatus.configured
  ? NextAuth({
      adapter: PrismaAdapter(getDb()),
      providers: buildProviders(),
      session: { strategy: "database", maxAge: 60 * 60 * 24 * 30 },
      pages: { signIn: "/signin", verifyRequest: "/verify-request", error: "/auth-error" },
      callbacks: {
        session({ session, user }) {
          session.user.id = user.id;
          return session;
        },
      },
    })
  : null;

const unavailable = () =>
  Response.json({ error: "Accounts are not set up on this server" }, { status: 404 });

export const handlers = nextAuth?.handlers ?? { GET: unavailable, POST: unavailable };

/** The signed-in session, or null (also null when accounts are not configured). */
export async function auth(): Promise<Session | null> {
  return nextAuth ? await nextAuth.auth() : null;
}

export async function signIn(
  provider: "google" | "email",
  options: { email?: string; redirectTo: string },
) {
  if (!nextAuth) throw new Error("Accounts are not set up on this server");
  return nextAuth.signIn(provider, options);
}

export async function signOut(options: { redirectTo: string }) {
  if (!nextAuth) throw new Error("Accounts are not set up on this server");
  return nextAuth.signOut(options);
}
