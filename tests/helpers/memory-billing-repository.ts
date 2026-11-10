import type { PurchaseRow, SubscriptionRow } from "@/server/billing/entitlements";
import type {
  BillingRepository,
  PurchaseRecord,
  SubscriptionRecord,
} from "@/server/billing/repository";

/** In-memory billing storage for tests. `failNextWrite` makes the next write throw once. */
export function createMemoryBillingRepository(users: { id: string; email: string }[] = []) {
  const subscriptions = new Map<string, SubscriptionRecord>();
  const purchases = new Map<string, PurchaseRecord>();
  const events = new Set<string>();
  let failNext = false;

  const maybeFail = () => {
    if (failNext) {
      failNext = false;
      throw new Error("database unavailable");
    }
  };

  const repo: BillingRepository = {
    async getUserBilling(userId) {
      const subs: SubscriptionRow[] = [...subscriptions.values()].filter(
        (s) => s.userId === userId,
      );
      const buys: PurchaseRow[] = [...purchases.values()].filter((p) => p.userId === userId);
      return { subscriptions: subs, purchases: buys };
    },
    async userExists(userId) {
      return users.some((u) => u.id === userId);
    },
    async findUserIdByEmail(email) {
      return users.find((u) => u.email.toLowerCase() === email.toLowerCase())?.id ?? null;
    },
    async upsertSubscription(record) {
      maybeFail();
      const key = `${record.provider}:${record.providerSubscriptionId}`;
      const existing = subscriptions.get(key);
      if (existing && existing.providerUpdatedAt > record.providerUpdatedAt) return "stale";
      subscriptions.set(key, record);
      return "applied";
    },
    async createPurchase(record) {
      maybeFail();
      const key = `${record.provider}:${record.providerOrderId}`;
      if (purchases.has(key)) return "duplicate";
      purchases.set(key, record);
      return "created";
    },
    async markPurchaseRefunded(provider, providerOrderId, at) {
      const purchase = purchases.get(`${provider}:${providerOrderId}`);
      if (!purchase || purchase.refundedAt) return false;
      purchases.set(`${provider}:${providerOrderId}`, { ...purchase, refundedAt: at });
      return true;
    },
    async recordEvent(provider, eventId) {
      const key = `${provider}:${eventId}`;
      if (events.has(key)) return false;
      events.add(key);
      return true;
    },
    async forgetEvent(provider, eventId) {
      events.delete(`${provider}:${eventId}`);
    },
  };

  return {
    ...repo,
    subscriptions,
    purchases,
    failNextWrite() {
      failNext = true;
    },
  };
}
