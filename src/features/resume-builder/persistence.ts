import type { ResumeDocument } from "@/features/resume-builder/schema";

/** Where the builder keeps the resume: this browser (guest) or the signed-in user's account. */
export type Persistence =
  | { kind: "local"; authAvailable: boolean }
  | { kind: "cloud"; resumeId: string; initialDocument: ResumeDocument };
