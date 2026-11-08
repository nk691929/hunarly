import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { authStatus } from "@/server/auth-status";

export const metadata: Metadata = {
  title: "Check your email",
  robots: { index: false, follow: false },
};

export default function VerifyRequestPage() {
  return (
    <section className="mx-auto flex max-w-md flex-col gap-5 px-5 py-20">
      <h1 className="font-display text-4xl font-bold tracking-tight">Check your email</h1>
      <p className="text-muted-foreground">
        We sent you a sign-in link. It works once and expires in 15 minutes. Check your spam folder
        if you do not see it.
      </p>
      {authStatus.emailTransport === "console" && (
        <p className="rounded-lg bg-secondary px-4 py-3 text-sm">
          Developer note: no email service is set up, so the link was printed in the terminal
          running pnpm dev.
        </p>
      )}
      <Button asChild variant="outline" className="self-start">
        <Link href="/signin">Back to sign in</Link>
      </Button>
    </section>
  );
}
