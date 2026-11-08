import type { ResumeData, ResumeRecord, ResumeRepository } from "@/server/resumes/repository";

/** In-memory repository for tests. Mirrors the rule every real implementation must follow: scope by userId. */
export function createMemoryResumeRepository(): ResumeRepository & {
  rows: Map<string, ResumeRecord>;
} {
  const rows = new Map<string, ResumeRecord>();
  let counter = 0;
  const own = (userId: string, id: string) => {
    const row = rows.get(id);
    return row && row.userId === userId ? row : undefined;
  };

  return {
    rows,
    async list(userId) {
      return [...rows.values()]
        .filter((r) => r.userId === userId)
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
        .map(({ id, title, templateId, updatedAt }) => ({ id, title, templateId, updatedAt }));
    },
    async get(userId, id) {
      return own(userId, id) ?? null;
    },
    async create(userId, data: ResumeData) {
      const id = `r${++counter}`;
      const now = new Date();
      rows.set(id, { id, userId, ...data, createdAt: now, updatedAt: now });
      return { id };
    },
    async update(userId, id, data: ResumeData) {
      const row = own(userId, id);
      if (!row) return false;
      rows.set(id, { ...row, ...data, updatedAt: new Date() });
      return true;
    },
    async remove(userId, id) {
      return own(userId, id) ? rows.delete(id) : false;
    },
  };
}
