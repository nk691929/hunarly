"use server";

import type { ActionResult } from "@/features/dashboard/types";
import { auth } from "@/server/auth";
import { resumeService } from "@/server/resumes";
import type { ResumeError } from "@/server/resumes/service";

const MESSAGES: Record<ResumeError, string> = {
  invalid: "That resume could not be saved because some of its data is not valid.",
  too_large: "That resume is too large to save.",
  not_found: "We could not find that resume.",
};

async function currentUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

const SIGN_IN_REQUIRED = { ok: false, error: "Please sign in again to continue." } as const;

/** Create a blank resume, or import a document (a guest draft) when one is given. */
export async function createResumeAction(input?: unknown): Promise<ActionResult<{ id: string }>> {
  const userId = await currentUserId();
  if (!userId) return SIGN_IN_REQUIRED;
  const result = await resumeService.create(userId, input);
  return result.ok ? { ok: true, id: result.id } : { ok: false, error: MESSAGES[result.error] };
}

/** Called by autosave. Validates the document again on the server and checks ownership. */
export async function saveResumeAction(id: string, document: unknown): Promise<ActionResult> {
  const userId = await currentUserId();
  if (!userId) return SIGN_IN_REQUIRED;
  const result = await resumeService.save(userId, id, document);
  return result.ok ? { ok: true } : { ok: false, error: MESSAGES[result.error] };
}

export async function deleteResumeAction(id: string): Promise<ActionResult> {
  const userId = await currentUserId();
  if (!userId) return SIGN_IN_REQUIRED;
  const result = await resumeService.remove(userId, id);
  return result.ok ? { ok: true } : { ok: false, error: MESSAGES[result.error] };
}
