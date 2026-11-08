import { prismaResumeRepository } from "@/server/resumes/prisma-repository";
import { createResumeService } from "@/server/resumes/service";

/** The resume service backed by the database. Use this from server components and actions. */
export const resumeService = createResumeService(prismaResumeRepository);
