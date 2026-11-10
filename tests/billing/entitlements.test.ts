import { describe, expect, it } from "vitest";
import {
  FREE_ENTITLEMENTS,
  resolveEntitlements,
  subscriptionGrantsAccess,
  type PurchaseRow,
  type SubscriptionRow,
} from "@/server/billing/entitlements";

const now = new Date("2026-11-09T12:00:00Z");
const day = 86_400_000;
const later = (days: number) => new Date(now.getTime() + days * day);

const sub = (over: Partial<SubscriptionRow> = {}): SubscriptionRow => ({
  provider: "lemonsqueezy",
  providerSubscriptionId: "s1",
  sku: "pro_monthly",
  status: "active",
  currentPeriodEnd: later(30),
  cancelAtPeriodEnd: false,
  manageUrl: null,
  ...over,
});
const pass = (over: Partial<PurchaseRow> = {}): PurchaseRow => ({
  provider: "lemonsqueezy",
  providerOrderId: "o1",
  sku: "job_hunt_pass",
  purchasedAt: now,
  expiresAt: later(60),
  refundedAt: null,
  ...over,
});
const resolve = (subscriptions: SubscriptionRow[], purchases: PurchaseRow[] = []) =>
  resolveEntitlements({ subscriptions, purchases, now });

describe("free plan", () => {
  it("allows 1 resume, free templates only, with a watermark", () => {
    const e = resolve([]);
    expect(e).toEqual(FREE_ENTITLEMENTS);
    expect(e).toMatchObject({
      plan: "free",
      maxResumes: 1,
      proTemplates: false,
      pdfWatermark: true,
    });
  });
});

describe("subscriptions", () => {
  it.each(["active", "on_trial", "past_due"])("%s grants Pro", (status) => {
    expect(resolve([sub({ status })])).toMatchObject({
      plan: "pro",
      source: "subscription",
      pdfWatermark: false,
    });
  });

  it.each(["paused", "unpaid", "expired", "unknown"])("%s does not", (status) => {
    expect(resolve([sub({ status })]).plan).toBe("free");
  });

  it("keeps a cancelled plan until the paid period ends", () => {
    expect(
      subscriptionGrantsAccess(sub({ status: "cancelled", currentPeriodEnd: later(5) }), now),
    ).toBe(true);
    expect(
      subscriptionGrantsAccess(sub({ status: "cancelled", currentPeriodEnd: later(-1) }), now),
    ).toBe(false);
    expect(
      subscriptionGrantsAccess(sub({ status: "cancelled", currentPeriodEnd: null }), now),
    ).toBe(false);
  });

  it("reports the latest end date and unlimited resumes", () => {
    const e = resolve([
      sub({ currentPeriodEnd: later(10) }),
      sub({ providerSubscriptionId: "s2", currentPeriodEnd: later(40) }),
    ]);
    expect(e.activeUntil).toEqual(later(40));
    expect(e.maxResumes).toBe(Number.POSITIVE_INFINITY);
  });
});

describe("job-hunt pass", () => {
  it("grants Pro until it expires", () => {
    expect(resolve([], [pass()])).toMatchObject({ plan: "pro", source: "pass" });
    expect(resolve([], [pass({ expiresAt: later(-1) })]).plan).toBe("free");
  });

  it("does not count a refunded pass", () => {
    expect(resolve([], [pass({ refundedAt: later(-2) })]).plan).toBe("free");
  });

  it("prefers a subscription when both exist", () => {
    expect(resolve([sub()], [pass()]).source).toBe("subscription");
  });
});

describe("development unlock", () => {
  it("only works in development", () => {
    const base = { subscriptions: [], purchases: [], now, devProUnlock: true };
    expect(resolveEntitlements({ ...base, isDevelopment: true })).toMatchObject({
      plan: "pro",
      source: "dev",
    });
    expect(resolveEntitlements({ ...base, isDevelopment: false }).plan).toBe("free");
  });
});
