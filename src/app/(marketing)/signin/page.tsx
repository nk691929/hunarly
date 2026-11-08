import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SignInForm } from "@/features/auth/components/sign-in-form";
import { safeRedirect } from "@/features/auth/redirect";
import { auth } from "@/server/auth";
import { authStatus } from "@/server/auth-status";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  const destination = safeRedirect(callbackUrl);

  const session = await auth();
  if (session?.user?.id) redirect(destination);

  return (
    <section className="mx-auto flex max-w-md flex-col gap-8 px-5 py-20">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-4xl font-bold tracking-tight">Sign in to Hunarly</h1>
        <p className="text-muted-foreground">
          Save your resumes online and pick up where you left off on any device.
        </p>
      </div>

      {authStatus.configured ? (
        <SignInForm google={authStatus.google} email={authStatus.email} callbackUrl={destination} />
      ) : (
        <div className="flex flex-col gap-2 rounded-xl border bg-card p-5 text-sm">
          <p>
            Accounts are not available on this site yet. You can still build and download a resume
            without one.
          </p>
          {process.env.NODE_ENV === "development" && (
            <p className="text-muted-foreground">
              Developer note: set DATABASE_URL, AUTH_SECRET and a sign-in method in .env.local. See
              docs/auth-and-database.md.
            </p>
          )}
        </div>
      )}

      <Button asChild variant="ghost" className="self-start">
        <Link href="/builder">Continue without an account</Link>
      </Button>
    </section>
  );
}
