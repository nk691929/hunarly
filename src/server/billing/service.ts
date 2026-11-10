import { isSku, PASS_DAYS } from "@/config/plans";
import { resolveEntitlements, type Entitlements } from "@/server/billing/entitlements";
import type { BillingEvent } from "@/server/billing/events";
import type { BillingRepository } from "@/server/billing/repository";

export type ApplyStatus = "applied" | "duplicate" | "ignored" | "stale" | "no_user";

const DAY_MS = 24 * 60 * 60 * 1000;

export function createBillingService(repo: BillingRepository) {
  /** Prefer the user id we put on the checkout; fall back to the buyer's email address. */
  async function resolveUser(event: {
    userId: string | null;
    email: string | null;
  }): Promise<string | null> {
    if (event.userId && (await repo.userExists(event.userId))) return event.userId;
    if (event.email) return repo.findUserIdByEmail(event.email.trim().toLowerCase());
    return null;
  }

  return {
    async getBilling(userId: string) {
      return repo.getUserBilling(userId);
    },

    async getEntitlements(
      userId: string | null,
      options: { now?: Date; devProUnlock?: boolean; isDevelopment?: boolean } = {},
    ): Promise<Entitlements> {
      const billing = userId
        ? await repo.getUserBilling(userId)
        : { subscriptions: [], purchases: [] };
      return resolveEntitlements({ ...billing, now: options.now ?? new Date(), ...options });
    },

    /**
     * Apply one provider event. Safe to call twice with the same event, and safe if events arrive
     * out of order. If applying fails, the event is forgotten so the provider's retry works.
     */
    async applyEvent(provider: string, event: BillingEvent): Promise<{ status: ApplyStatus }> {
      if (event.kind === "ignored") return { status: "ignored" };
      if (!(await repo.recordEvent(provider, event.eventId))) return { status: "duplicate" };

      try {
        if (event.kind === "refund") {
          await repo.markPurchaseRefunded(provider, event.providerOrderId, new Date());
          return { status: "applied" };
        }

        const userId = await resolveUser(event);
        if (!userId) return { status: "no_user" };

        if (event.kind === "subscription") {
          if (event.sku !== "pro_monthly" && event.sku !== "pro_yearly")
            return { status: "ignored" };
          const result = await repo.upsertSubscription({
            userId,
            provider,
            providerSubscriptionId: event.providerSubscriptionId,
            sku: event.sku,
            status: event.status,
            currentPeriodEnd: event.currentPeriodEnd,
            cancelAtPeriodEnd: event.cancelAtPeriodEnd,
            manageUrl: event.manageUrl,
            providerUpdatedAt: event.updatedAt,
          });
          return { status: result === "stale" ? "stale" : "applied" };
        }

        // Only the job-hunt pass is a one-time purchase. Subscription orders arrive as subscription events.
        if (!isSku(event.sku) || event.sku !== "job_hunt_pass") return { status: "ignored" };
        const result = await repo.createPurchase({
          userId,
          provider,
          providerOrderId: event.providerOrderId,
          sku: event.sku,
          amount: event.amount,
          currency: event.currency,
          purchasedAt: event.purchasedAt,
          expiresAt: new Date(event.purchasedAt.getTime() + PASS_DAYS * DAY_MS),
          refundedAt: null,
        });
        return { status: result === "duplicate" ? "duplicate" : "applied" };
      } catch (error) {
        await repo.forgetEvent(provider, event.eventId);
        throw error;
      }
    },
  };
}

export type BillingService = ReturnType<typeof createBillingService>;
