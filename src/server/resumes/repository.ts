export interface ResumeSummary {
  id: string;
  title: string;
  templateId: string;
  updatedAt: Date;
}

export interface ResumeRecord extends ResumeSummary {
  userId: string;
  content: unknown;
  createdAt: Date;
}

export interface ResumeData {
  title: string;
  templateId: string;
  content: unknown;
}

/**
 * Storage for resumes. Every method takes the owner's userId and must only touch that user's
 * rows. Swap the implementation (Prisma today) without touching the service.
 */
export interface ResumeRepository {
  list(userId: string): Promise<ResumeSummary[]>;
  count(userId: string): Promise<number>;
  get(userId: string, id: string): Promise<ResumeRecord | null>;
  create(userId: string, data: ResumeData): Promise<{ id: string }>;
  update(userId: string, id: string, data: ResumeData): Promise<boolean>;
  remove(userId: string, id: string): Promise<boolean>;
}
