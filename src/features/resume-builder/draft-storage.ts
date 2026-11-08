import { createEmptyDocument } from "@/features/resume-builder/defaults";
import { resumeDocumentSchema, type ResumeDocument } from "@/features/resume-builder/schema";

/**
 * Guest drafts live in localStorage until the user signs in (M5 moves them to the database).
 * Never log draft contents: resumes are private.
 */
export const DRAFT_KEY = "hunarly:draft:v1";

interface Envelope {
  version: 1;
  savedAt: string;
  document: unknown;
}

function getStorage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null; // storage blocked (private mode, browser setting)
  }
}

export function serializeDraft(document: ResumeDocument, now: Date = new Date()): string {
  const envelope: Envelope = { version: 1, savedAt: now.toISOString(), document };
  return JSON.stringify(envelope);
}

/** Returns a valid document, or null if the data is missing, corrupted or from an unknown version. */
export function parseDraft(json: string | null): ResumeDocument | null {
  if (!json) return null;
  try {
    const envelope = JSON.parse(json) as Partial<Envelope> | null;
    if (!envelope || envelope.version !== 1) return null;
    const result = resumeDocumentSchema.safeParse(envelope.document);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export function loadDraft(
  storage: Pick<Storage, "getItem"> | null = getStorage(),
): ResumeDocument | null {
  if (!storage) return null;
  try {
    return parseDraft(storage.getItem(DRAFT_KEY));
  } catch {
    return null;
  }
}

export function saveDraft(
  document: ResumeDocument,
  storage: Pick<Storage, "setItem"> | null = getStorage(),
): boolean {
  if (!storage) return false;
  try {
    storage.setItem(DRAFT_KEY, serializeDraft(document));
    return true;
  } catch {
    return false; // quota exceeded or storage unavailable
  }
}

export function clearDraft(storage: Pick<Storage, "removeItem"> | null = getStorage()): void {
  try {
    storage?.removeItem(DRAFT_KEY);
  } catch {
    // ignore
  }
}

export { createEmptyDocument };
