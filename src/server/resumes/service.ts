import { createEmptyDocument } from "@/features/resume-builder/defaults";
import { resumeDocumentSchema, type ResumeDocument } from "@/features/resume-builder/schema";
import type { ResumeData, ResumeRepository, ResumeSummary } from "@/server/resumes/repository";

/** Resume documents larger than this are rejected (a normal resume is a few KB). */
export const MAX_CONTENT_BYTES = 200_000;

export type ResumeError = "invalid" | "too_large" | "not_found";

type Parsed =
  { ok: true; document: ResumeDocument } | { ok: false; error: "invalid" | "too_large" };

/** Never trust the client: validate and strip unknown fields before anything is stored. */
export function parseDocument(input: unknown): Parsed {
  const parsed = resumeDocumentSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const size = new TextEncoder().encode(JSON.stringify(parsed.data)).length;
  if (size > MAX_CONTENT_BYTES) return { ok: false, error: "too_large" };
  return { ok: true, document: parsed.data };
}

function toData(document: ResumeDocument): ResumeData {
  return {
    title: document.title.trim() || "Untitled resume",
    templateId: document.templateId,
    content: document,
  };
}

export function createResumeService(repo: ResumeRepository) {
  return {
    list(userId: string): Promise<ResumeSummary[]> {
      return repo.list(userId);
    },

    /** Create a resume: blank when `input` is omitted, or from a validated document (draft import). */
    async create(
      userId: string,
      input?: unknown,
    ): Promise<{ ok: true; id: string } | { ok: false; error: ResumeError }> {
      let document = createEmptyDocument();
      if (input !== undefined) {
        const parsed = parseDocument(input);
        if (!parsed.ok) return parsed;
        document = parsed.document;
      }
      const { id } = await repo.create(userId, toData(document));
      return { ok: true, id };
    },

    async get(
      userId: string,
      id: string,
    ): Promise<{ ok: true; document: ResumeDocument } | { ok: false; error: ResumeError }> {
      const record = await repo.get(userId, id);
      if (!record) return { ok: false, error: "not_found" };
      const parsed = parseDocument(record.content);
      return parsed.ok ? { ok: true, document: parsed.document } : parsed;
    },

    async save(
      userId: string,
      id: string,
      input: unknown,
    ): Promise<{ ok: true } | { ok: false; error: ResumeError }> {
      const parsed = parseDocument(input);
      if (!parsed.ok) return parsed;
      const updated = await repo.update(userId, id, toData(parsed.document));
      return updated ? { ok: true } : { ok: false, error: "not_found" };
    },

    async remove(
      userId: string,
      id: string,
    ): Promise<{ ok: true } | { ok: false; error: ResumeError }> {
      const removed = await repo.remove(userId, id);
      return removed ? { ok: true } : { ok: false, error: "not_found" };
    },
  };
}

export type ResumeService = ReturnType<typeof createResumeService>;
