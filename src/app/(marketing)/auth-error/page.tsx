import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Sign-in problem",
  robots: { index: false, follow: false },
};

const MESSAGES: Record<string, string> = {
  Verification:
    "That sign-in link has expired or was already used. Request a new one and try again.",
  AccessDenied: "You do not have permission to sign in.",
  Configuration: "Sign-in is not set up correctly on this site. Please try again later.",
};

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const message =
    (error && MESSAGES[error]) || "Something went wrong while signing you in. Please try again.";
  return (
    <section className="mx-auto flex max-w-md flex-col gap-5 px-5 py-20">
      <h1 className="font-display text-4xl font-bold tracking-tight">We could not sign you in</h1>
      <p className="text-muted-foreground">{message}</p>
      <Button asChild className="self-start">
        <Link href="/signin">Try again</Link>
      </Button>
    </section>
  );
}
