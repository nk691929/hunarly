/** What a payment provider tells us, in one shape, whichever provider it is. */
export type BillingEvent =
  | {
      kind: "subscription";
      eventId: string;
      userId: string | null;
      email: string | null;
      providerSubscriptionId: string;
      sku: string;
      status: string;
      currentPeriodEnd: Date | null;
      cancelAtPeriodEnd: boolean;
      manageUrl: string | null;
      updatedAt: Date;
    }
  | {
      kind: "purchase";
      eventId: string;
      userId: string | null;
      email: string | null;
      providerOrderId: string;
      sku: string;
      amount: number;
      currency: string;
      purchasedAt: Date;
    }
  | { kind: "refund"; eventId: string; providerOrderId: string }
  | { kind: "ignored"; eventId: string; reason: string };
