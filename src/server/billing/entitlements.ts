import { FREE_MAX_RESUMES, type Plan } from "@/config/plans";

export interface Entitlements {
  plan: Plan;
  source: "free" | "dev" | "subscription" | "pass";
  /** Most resumes the person may have. */
  maxResumes: number;
  /** May choose and export templates marked Pro. */
  proTemplates: boolean;
  /** Free exports carry a small "Made with Hunarly" footer. */
  pdfWatermark: boolean;
  /** When paid access ends, if known. */
  activeUntil: Date | null;
}

export interface SubscriptionRow {
  provider: string;
  providerSubscriptionId: string;
  sku: string;
  status: string;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  manageUrl: string | null;
}

export interface PurchaseRow {
  provider: string;
  providerOrderId: string;
  sku: string;
  purchasedAt: Date;
  expiresAt: Date;
  refundedAt: Date | null;
}

export const FREE_ENTITLEMENTS: Entitlements = {
  plan: "free",
  source: "free",
  maxResumes: FREE_MAX_RESUMES,
  proTemplates: false,
  pdfWatermark: true,
  activeUntil: null,
};

function pro(source: "dev" | "subscription" | "pass", activeUntil: Date | null): Entitlements {
  return {
    plan: "pro",
    source,
    maxResumes: Number.POSITIVE_INFINITY,
    proTemplates: true,
    pdfWatermark: false,
    activeUntil,
  };
}

/**
 * Does a subscription currently give access?
 * - active, on_trial: yes. past_due: yes while the provider retries the payment.
 * - cancelled: yes until the paid period ends. paused, unpaid, expired: no.
 */
export function subscriptionGrantsAccess(sub: SubscriptionRow, now: Date): boolean {
  switch (sub.status) {
    case "active":
    case "on_trial":
    case "past_due":
      return true;
    case "cancelled":
      return sub.currentPeriodEnd !== null && sub.currentPeriodEnd > now;
    default:
      return false;
  }
}

/** The single place that decides what someone may do. Everything else asks this. */
export function resolveEntitlements(input: {
  subscriptions: SubscriptionRow[];
  purchases: PurchaseRow[];
  now: Date;
  devProUnlock?: boolean;
  isDevelopment?: boolean;
}): Entitlements {
  if (input.devProUnlock && input.isDevelopment) return pro("dev", null);

  const subs = input.subscriptions.filter((s) => subscriptionGrantsAccess(s, input.now));
  const passes = input.purchases.filter((p) => !p.refundedAt && p.expiresAt > input.now);

  if (subs.length > 0) {
    const ends = subs.map((s) => s.currentPeriodEnd).filter((d): d is Date => d !== null);
    const latest = ends.length > 0 ? new Date(Math.max(...ends.map((d) => d.getTime()))) : null;
    return pro("subscription", latest);
  }
  if (passes.length > 0) {
    const latest = new Date(Math.max(...passes.map((p) => p.expiresAt.getTime())));
    return pro("pass", latest);
  }
  return FREE_ENTITLEMENTS;
}
