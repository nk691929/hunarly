import { beforeEach, describe, expect, it } from "vitest";
import type { BillingEvent } from "@/server/billing/events";
import { createBillingService } from "@/server/billing/service";
import { createMemoryBillingRepository } from "../helpers/memory-billing-repository";

const P = "lemonsqueezy";
const now = new Date("2026-11-09T12:00:00Z");
const day = 86_400_000;

function subscriptionEvent(
  over: Partial<Extract<BillingEvent, { kind: "subscription" }>> = {},
): BillingEvent {
  return {
    kind: "subscription",
    eventId: "e1",
    userId: "u1",
    email: null,
    providerSubscriptionId: "s1",
    sku: "pro_yearly",
    status: "active",
    currentPeriodEnd: new Date(now.getTime() + 365 * day),
    cancelAtPeriodEnd: false,
    manageUrl: "https://portal.test",
    updatedAt: now,
    ...over,
  };
}

function purchaseEvent(
  over: Partial<Extract<BillingEvent, { kind: "purchase" }>> = {},
): BillingEvent {
  return {
    kind: "purchase",
    eventId: "p1",
    userId: "u1",
    email: null,
    providerOrderId: "o1",
    sku: "job_hunt_pass",
    amount: 1900,
    currency: "USD",
    purchasedAt: now,
    ...over,
  };
}

describe("billing service", () => {
  let repo: ReturnType<typeof createMemoryBillingRepository>;
  let service: ReturnType<typeof createBillingService>;
  const plan = async (userId: string, at = now) =>
    (await service.getEntitlements(userId, { now: at })).plan;

  beforeEach(() => {
    repo = createMemoryBillingRepository([
      { id: "u1", email: "ayesha@example.com" },
      { id: "u2", email: "bilal@example.com" },
    ]);
    service = createBillingService(repo);
  });

  it("starts everyone, and guests, on the free plan", async () => {
    expect(await plan("u1")).toBe("free");
    expect((await service.getEntitlements(null)).plan).toBe("free");
  });

  it("grants Pro when a subscription becomes active", async () => {
    expect(await service.applyEvent(P, subscriptionEvent())).toEqual({ status: "applied" });
    expect(await plan("u1")).toBe("pro");
    expect(await plan("u2")).toBe("free");
  });

  it("ignores a repeated event", async () => {
    await service.applyEvent(P, subscriptionEvent());
    expect(await service.applyEvent(P, subscriptionEvent())).toEqual({ status: "duplicate" });
  });

  it("does not let an older update overwrite a newer one", async () => {
    await service.applyEvent(
      P,
      subscriptionEvent({
        eventId: "new",
        status: "expired",
        updatedAt: new Date(now.getTime() + 1000),
      }),
    );
    const result = await service.applyEvent(
      P,
      subscriptionEvent({ eventId: "old", status: "active", updatedAt: now }),
    );
    expect(result).toEqual({ status: "stale" });
    expect(await plan("u1")).toBe("free");
  });

  it("keeps a cancelled subscription until the period ends", async () => {
    await service.applyEvent(
      P,
      subscriptionEvent({
        status: "cancelled",
        cancelAtPeriodEnd: true,
        currentPeriodEnd: new Date(now.getTime() + 5 * day),
      }),
    );
    expect(await plan("u1")).toBe("pro");
    expect(await plan("u1", new Date(now.getTime() + 6 * day))).toBe("free");
  });

  it("ends access when a subscription expires", async () => {
    await service.applyEvent(P, subscriptionEvent());
    await service.applyEvent(
      P,
      subscriptionEvent({
        eventId: "e2",
        status: "expired",
        updatedAt: new Date(now.getTime() + 1000),
      }),
    );
    expect(await plan("u1")).toBe("free");
  });

  it("grants a job-hunt pass for 60 days", async () => {
    expect(await service.applyEvent(P, purchaseEvent())).toEqual({ status: "applied" });
    expect(await plan("u1", new Date(now.getTime() + 59 * day))).toBe("pro");
    expect(await plan("u1", new Date(now.getTime() + 61 * day))).toBe("free");
  });

  it("ignores subscription orders (they arrive as subscription events) and unknown products", async () => {
    expect(await service.applyEvent(P, purchaseEvent({ sku: "pro_yearly" }))).toEqual({
      status: "ignored",
    });
    expect(await service.applyEvent(P, purchaseEvent({ eventId: "p2", sku: "unknown" }))).toEqual({
      status: "ignored",
    });
    expect(
      await service.applyEvent(P, subscriptionEvent({ eventId: "e9", sku: "unknown" })),
    ).toEqual({ status: "ignored" });
    expect(await plan("u1")).toBe("free");
  });

  it("takes access away on refund", async () => {
    await service.applyEvent(P, purchaseEvent());
    await service.applyEvent(P, { kind: "refund", eventId: "r1", providerOrderId: "o1" });
    expect(await plan("u1")).toBe("free");
  });

  it("finds the buyer by email when the user id is missing or unknown", async () => {
    expect(
      await service.applyEvent(P, subscriptionEvent({ userId: null, email: "Ayesha@Example.com" })),
    ).toEqual({ status: "applied" });
    expect(await plan("u1")).toBe("pro");
    expect(
      await service.applyEvent(
        P,
        subscriptionEvent({ eventId: "e5", userId: "ghost", email: "bilal@example.com" }),
      ),
    ).toEqual({ status: "applied" });
    expect(await plan("u2")).toBe("pro");
  });

  it("reports when no account matches", async () => {
    expect(
      await service.applyEvent(
        P,
        subscriptionEvent({ userId: "ghost", email: "nobody@example.com" }),
      ),
    ).toEqual({ status: "no_user" });
  });

  it("lets the provider retry after a failure", async () => {
    repo.failNextWrite();
    await expect(service.applyEvent(P, subscriptionEvent())).rejects.toThrow(
      "database unavailable",
    );
    expect(await service.applyEvent(P, subscriptionEvent())).toEqual({ status: "applied" });
    expect(await plan("u1")).toBe("pro");
  });

  it("ignores events the provider layer marked as ignored", async () => {
    expect(await service.applyEvent(P, { kind: "ignored", eventId: "x", reason: "test" })).toEqual({
      status: "ignored",
    });
  });
});
