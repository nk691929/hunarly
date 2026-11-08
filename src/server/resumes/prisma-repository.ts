import type { Prisma } from "@prisma/client";
import { getDb } from "@/server/db";
import type { ResumeRepository } from "@/server/resumes/repository";

/** Prisma implementation. Every query is scoped by userId so people can only reach their own rows. */
export const prismaResumeRepository: ResumeRepository = {
  list: (userId) =>
    getDb().resume.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, templateId: true, updatedAt: true },
    }),

  get: (userId, id) => getDb().resume.findFirst({ where: { id, userId } }),

  create: async (userId, data) => {
    const row = await getDb().resume.create({
      data: {
        userId,
        title: data.title,
        templateId: data.templateId,
        content: data.content as Prisma.InputJsonValue,
      },
      select: { id: true },
    });
    return { id: row.id };
  },

  update: async (userId, id, data) => {
    const result = await getDb().resume.updateMany({
      where: { id, userId },
      data: {
        title: data.title,
        templateId: data.templateId,
        content: data.content as Prisma.InputJsonValue,
      },
    });
    return result.count > 0;
  },

  remove: async (userId, id) => {
    const result = await getDb().resume.deleteMany({ where: { id, userId } });
    return result.count > 0;
  },
};
