"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInWithEmail, signInWithGoogle, type SignInState } from "@/features/auth/actions";

export function SignInForm({
  google,
  email,
  callbackUrl,
}: {
  google: boolean;
  email: boolean;
  callbackUrl: string;
}) {
  const [state, formAction, pending] = useActionState<SignInState, FormData>(signInWithEmail, {});

  return (
    <div className="flex flex-col gap-6">
      {google && (
        <form action={signInWithGoogle}>
          <input type="hidden" name="callbackUrl" value={callbackUrl} />
          <Button type="submit" variant="outline" size="lg" className="w-full">
            Continue with Google
          </Button>
        </form>
      )}

      {google && email && (
        <div className="flex items-center gap-3 text-sm text-muted-foreground" aria-hidden="true">
          <span className="h-px flex-1 bg-border" />
          or
          <span className="h-px flex-1 bg-border" />
        </div>
      )}

      {email && (
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="callbackUrl" value={callbackUrl} />
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              aria-invalid={state.error ? true : undefined}
              aria-describedby={state.error ? "email-error" : "email-hint"}
            />
            {state.error ? (
              <p id="email-error" role="alert" className="text-sm text-destructive">
                {state.error}
              </p>
            ) : (
              <p id="email-hint" className="text-xs text-muted-foreground">
                No password needed. We email you a link that works for 15 minutes.
              </p>
            )}
          </div>
          <Button type="submit" size="lg" disabled={pending}>
            {pending ? "Sending..." : "Email me a sign-in link"}
          </Button>
        </form>
      )}
    </div>
  );
}
