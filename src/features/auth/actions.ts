"use server";

import { z } from "zod";
import { safeRedirect } from "@/features/auth/redirect";
import { authStatus } from "@/server/auth-status";
import { signIn, signOut } from "@/server/auth";

export interface SignInState {
  error?: string;
}

export async function signInWithGoogle(formData: FormData): Promise<void> {
  if (!authStatus.google) return;
  await signIn("google", { redirectTo: safeRedirect(formData.get("callbackUrl")) });
}

export async function signInWithEmail(
  _previous: SignInState,
  formData: FormData,
): Promise<SignInState> {
  if (!authStatus.email) return { error: "Email sign-in is not available right now." };
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (!z.email().safeParse(email).success) return { error: "Enter a valid email address." };
  // On success Auth.js sends the email and redirects, which ends this action.
  await signIn("email", { email, redirectTo: safeRedirect(formData.get("callbackUrl")) });
  return {};
}

export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: "/" });
}
