import { Prisma } from "@prisma/client";
import { getDb } from "@/server/db";
import type { BillingRepository } from "@/server/billing/repository";

const isUniqueViolation = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";

export const prismaBillingRepository: BillingRepository = {
  async getUserBilling(userId) {
    const db = getDb();
    const [subscriptions, purchases] = await Promise.all([
      db.subscription.findMany({ where: { userId } }),
      db.purchase.findMany({ where: { userId } }),
    ]);
    return {
      subscriptions: subscriptions.map((s) => ({
        provider: s.provider,
        providerSubscriptionId: s.providerSubscriptionId,
        sku: s.sku,
        status: s.status,
        currentPeriodEnd: s.currentPeriodEnd,
        cancelAtPeriodEnd: s.cancelAtPeriodEnd,
        manageUrl: s.manageUrl,
      })),
      purchases: purchases.map((p) => ({
        provider: p.provider,
        providerOrderId: p.providerOrderId,
        sku: p.sku,
        purchasedAt: p.purchasedAt,
        expiresAt: p.expiresAt,
        refundedAt: p.refundedAt,
      })),
    };
  },

  async userExists(userId) {
    return (
      (await getDb().user.findUnique({ where: { id: userId }, select: { id: true } })) !== null
    );
  },

  async findUserIdByEmail(email) {
    const user = await getDb().user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
      select: { id: true },
    });
    return user?.id ?? null;
  },

  async upsertSubscription(record) {
    const db = getDb();
    const where = {
      provider_providerSubscriptionId: {
        provider: record.provider,
        providerSubscriptionId: record.providerSubscriptionId,
      },
    };
    const existing = await db.subscription.findUnique({ where });
    if (existing && existing.providerUpdatedAt > record.providerUpdatedAt) return "stale";

    const data = {
      sku: record.sku,
      status: record.status,
      currentPeriodEnd: record.currentPeriodEnd,
      cancelAtPeriodEnd: record.cancelAtPeriodEnd,
      manageUrl: record.manageUrl,
      providerUpdatedAt: record.providerUpdatedAt,
    };
    await db.subscription.upsert({
      where,
      create: {
        userId: record.userId,
        provider: record.provider,
        providerSubscriptionId: record.providerSubscriptionId,
        ...data,
      },
      update: data,
    });
    return "applied";
  },

  async createPurchase(record) {
    try {
      await getDb().purchase.create({
        data: {
          userId: record.userId,
          provider: record.provider,
          providerOrderId: record.providerOrderId,
          sku: record.sku,
          amount: record.amount,
          currency: record.currency,
          purchasedAt: record.purchasedAt,
          expiresAt: record.expiresAt,
        },
      });
      return "created";
    } catch (error) {
      if (isUniqueViolation(error)) return "duplicate";
      throw error;
    }
  },

  async markPurchaseRefunded(provider, providerOrderId, at) {
    const result = await getDb().purchase.updateMany({
      where: { provider, providerOrderId, refundedAt: null },
      data: { refundedAt: at },
    });
    return result.count > 0;
  },

  async recordEvent(provider, eventId) {
    try {
      await getDb().paymentEvent.create({ data: { provider, eventId } });
      return true;
    } catch (error) {
      if (isUniqueViolation(error)) return false;
      throw error;
    }
  },

  async forgetEvent(provider, eventId) {
    await getDb().paymentEvent.deleteMany({ where: { provider, eventId } });
  },
};
