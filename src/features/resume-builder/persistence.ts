import type { Plan } from "@/config/plans";
import type { ResumeDocument } from "@/features/resume-builder/schema";

/**
 * Where the builder keeps the resume: this browser (guest) or the signed-in user's account.
 * `plan` only shapes what the screen offers (for example which templates look locked). The server
 * enforces the real limits.
 */
export type Persistence =
  | { kind: "local"; authAvailable: boolean; plan: Plan }
  | { kind: "cloud"; resumeId: string; initialDocument: ResumeDocument; plan: Plan };
