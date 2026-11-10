import type { PurchaseRow, SubscriptionRow } from "@/server/billing/entitlements";

export interface SubscriptionRecord extends SubscriptionRow {
  userId: string;
  providerUpdatedAt: Date;
}

export interface PurchaseRecord extends PurchaseRow {
  userId: string;
  amount: number;
  currency: string;
}

/** Storage for billing state. Prisma today; the service never touches the database directly. */
export interface BillingRepository {
  getUserBilling(
    userId: string,
  ): Promise<{ subscriptions: SubscriptionRow[]; purchases: PurchaseRow[] }>;
  userExists(userId: string): Promise<boolean>;
  findUserIdByEmail(email: string): Promise<string | null>;
  /** "stale" when a newer update for the same subscription is already stored. */
  upsertSubscription(record: SubscriptionRecord): Promise<"applied" | "stale">;
  createPurchase(record: PurchaseRecord): Promise<"created" | "duplicate">;
  markPurchaseRefunded(provider: string, providerOrderId: string, at: Date): Promise<boolean>;
  /** True the first time an event is seen, false for repeats. */
  recordEvent(provider: string, eventId: string): Promise<boolean>;
  forgetEvent(provider: string, eventId: string): Promise<void>;
}
