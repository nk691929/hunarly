import { createHmac } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import { InvalidWebhookSignatureError, PaymentError } from "@/server/providers/payments";
import {
  createLemonSqueezyProvider,
  parseLemonSqueezyEvent,
  verifyLemonSqueezySignature,
} from "@/server/providers/payments/lemonsqueezy";

const SECRET = "test-secret-value";
const variants = { pro_monthly: "11", pro_yearly: "22", job_hunt_pass: "33" } as const;
const map = { "11": "pro_monthly", "22": "pro_yearly", "33": "job_hunt_pass" } as const;
const sign = (body: string) => createHmac("sha256", SECRET).update(body).digest("hex");

const subscriptionPayload = (
  attrs: Record<string, unknown> = {},
  eventName = "subscription_created",
) => ({
  meta: { event_name: eventName, custom_data: { user_id: "u1" } },
  data: {
    type: "subscriptions",
    id: "123",
    attributes: {
      status: "active",
      variant_id: 22,
      user_email: "a@b.co",
      renews_at: "2027-11-09T00:00:00.000Z",
      ends_at: null,
      cancelled: false,
      updated_at: "2026-11-09T10:00:00.000Z",
      urls: { customer_portal: "https://portal.test/x" },
      ...attrs,
    },
  },
});

describe("signature", () => {
  const body = '{"a":1}';
  it("accepts the right signature and rejects everything else", () => {
    expect(verifyLemonSqueezySignature(body, sign(body), SECRET)).toBe(true);
    expect(verifyLemonSqueezySignature(body, sign(body).toUpperCase(), SECRET)).toBe(true);
    expect(verifyLemonSqueezySignature(body, null, SECRET)).toBe(false);
    expect(verifyLemonSqueezySignature(body, "abc", SECRET)).toBe(false);
    expect(verifyLemonSqueezySignature('{"a":2}', sign(body), SECRET)).toBe(false);
    expect(verifyLemonSqueezySignature(body, sign(body), "other-secret")).toBe(false);
  });
});

describe("parseLemonSqueezyEvent", () => {
  it("reads a subscription", () => {
    const event = parseLemonSqueezyEvent(subscriptionPayload(), map);
    expect(event).toMatchObject({
      kind: "subscription",
      userId: "u1",
      email: "a@b.co",
      providerSubscriptionId: "123",
      sku: "pro_yearly",
      status: "active",
      cancelAtPeriodEnd: false,
      manageUrl: "https://portal.test/x",
    });
    if (event.kind === "subscription")
      expect(event.currentPeriodEnd).toEqual(new Date("2027-11-09T00:00:00.000Z"));
  });

  it("uses the end date for a cancelled subscription", () => {
    const event = parseLemonSqueezyEvent(
      subscriptionPayload(
        { status: "cancelled", cancelled: true, ends_at: "2026-12-01T00:00:00.000Z" },
        "subscription_cancelled",
      ),
      map,
    );
    expect(event).toMatchObject({
      kind: "subscription",
      status: "cancelled",
      cancelAtPeriodEnd: true,
    });
    if (event.kind === "subscription")
      expect(event.currentPeriodEnd).toEqual(new Date("2026-12-01T00:00:00.000Z"));
  });

  it("marks an unknown variant so it is ignored later", () => {
    const event = parseLemonSqueezyEvent(subscriptionPayload({ variant_id: 999 }), map);
    expect(event).toMatchObject({ kind: "subscription", sku: "unknown" });
  });

  it("reads a paid order as a purchase", () => {
    const event = parseLemonSqueezyEvent(
      {
        meta: { event_name: "order_created", custom_data: { user_id: "u1" } },
        data: {
          type: "orders",
          id: "900",
          attributes: {
            status: "paid",
            total: 1900,
            currency: "USD",
            user_email: "a@b.co",
            created_at: "2026-11-09T10:00:00.000Z",
            first_order_item: { variant_id: 33 },
          },
        },
      },
      map,
    );
    expect(event).toMatchObject({
      kind: "purchase",
      providerOrderId: "900",
      sku: "job_hunt_pass",
      amount: 1900,
      currency: "USD",
      userId: "u1",
    });
  });

  it("ignores unpaid orders, and reads refunds", () => {
    const unpaid = parseLemonSqueezyEvent(
      {
        meta: { event_name: "order_created" },
        data: { type: "orders", id: "1", attributes: { status: "pending" } },
      },
      map,
    );
    expect(unpaid.kind).toBe("ignored");
    const refund = parseLemonSqueezyEvent(
      {
        meta: { event_name: "order_refunded" },
        data: { type: "orders", id: "900", attributes: {} },
      },
      map,
    );
    expect(refund).toMatchObject({ kind: "refund", providerOrderId: "900" });
  });

  it("ignores events it does not handle or cannot read", () => {
    const other = parseLemonSqueezyEvent(
      {
        meta: { event_name: "license_key_created" },
        data: { type: "license-keys", id: "1", attributes: {} },
      },
      map,
    );
    expect(other.kind).toBe("ignored");
    expect(parseLemonSqueezyEvent({ nope: true }, map).kind).toBe("ignored");
    expect(parseLemonSqueezyEvent(null, map).kind).toBe("ignored");
  });

  it("gives different events different ids", () => {
    const a = parseLemonSqueezyEvent(subscriptionPayload(), map);
    const b = parseLemonSqueezyEvent(
      subscriptionPayload({ updated_at: "2026-11-10T10:00:00.000Z" }),
      map,
    );
    expect(a.eventId).not.toBe(b.eventId);
  });
});

describe("provider", () => {
  const provider = createLemonSqueezyProvider({
    apiKey: "key",
    storeId: "5",
    webhookSecret: SECRET,
    variants,
  });

  it("rejects an unsigned or wrongly signed webhook, and parses a signed one", () => {
    const body = JSON.stringify(subscriptionPayload());
    expect(() => provider.verifyAndParseWebhook(body, null)).toThrow(InvalidWebhookSignatureError);
    expect(() => provider.verifyAndParseWebhook(body, "deadbeef")).toThrow(
      InvalidWebhookSignatureError,
    );
    expect(provider.verifyAndParseWebhook(body, sign(body)).kind).toBe("subscription");
  });

  it("treats a signed non-JSON body as ignorable", () => {
    expect(provider.verifyAndParseWebhook("not json", sign("not json")).kind).toBe("ignored");
  });

  it("creates a checkout with the buyer, discount and user id attached", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ data: { attributes: { url: "https://pay.test/checkout/abc" } } }),
    });
    const p = createLemonSqueezyProvider({
      apiKey: "key",
      storeId: "5",
      webhookSecret: SECRET,
      variants,
      fetchImpl,
    });
    const result = await p.createCheckout({
      userId: "u1",
      email: "a@b.co",
      sku: "pro_yearly",
      discountCode: "STUDENT30",
      successUrl: "https://hunarly.test/billing?checkout=success",
    });
    expect(result.url).toBe("https://pay.test/checkout/abc");

    const [url, init] = fetchImpl.mock.calls[0]!;
    expect(url).toBe("https://api.lemonsqueezy.com/v1/checkouts");
    expect(init.headers.Authorization).toBe("Bearer key");
    const body = JSON.parse(init.body);
    expect(body.data.relationships.store.data.id).toBe("5");
    expect(body.data.relationships.variant.data.id).toBe("22");
    expect(body.data.attributes.checkout_data).toMatchObject({
      email: "a@b.co",
      discount_code: "STUDENT30",
      custom: { user_id: "u1" },
    });
    expect(body.data.attributes.product_options.redirect_url).toBe(
      "https://hunarly.test/billing?checkout=success",
    );
  });

  it("leaves out the discount when there is none", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => ({ data: { attributes: { url: "https://pay.test/c" } } }),
      });
    const p = createLemonSqueezyProvider({
      apiKey: "key",
      storeId: "5",
      webhookSecret: SECRET,
      variants,
      fetchImpl,
    });
    await p.createCheckout({
      userId: "u1",
      email: "a@b.co",
      sku: "job_hunt_pass",
      successUrl: "https://x.test",
    });
    const body = JSON.parse(fetchImpl.mock.calls[0]![1].body);
    expect(body.data.attributes.checkout_data).not.toHaveProperty("discount_code");
    expect(body.data.relationships.variant.data.id).toBe("33");
  });

  it("fails clearly, without leaking the key", async () => {
    const bad = vi.fn().mockResolvedValue({ ok: false, status: 401, json: async () => ({}) });
    const p1 = createLemonSqueezyProvider({
      apiKey: "secret-key",
      storeId: "5",
      webhookSecret: SECRET,
      variants,
      fetchImpl: bad,
    });
    const error = await p1
      .createCheckout({
        userId: "u",
        email: "a@b.co",
        sku: "pro_monthly",
        successUrl: "https://x.test",
      })
      .catch((e: Error) => e);
    expect(error).toBeInstanceOf(PaymentError);
    expect((error as Error).message).toContain("401");
    expect((error as Error).message).not.toContain("secret-key");

    const noUrl = vi.fn().mockResolvedValue({ ok: true, status: 201, json: async () => ({}) });
    const p2 = createLemonSqueezyProvider({
      apiKey: "k",
      storeId: "5",
      webhookSecret: SECRET,
      variants,
      fetchImpl: noUrl,
    });
    await expect(
      p2.createCheckout({
        userId: "u",
        email: "a@b.co",
        sku: "pro_monthly",
        successUrl: "https://x.test",
      }),
    ).rejects.toBeInstanceOf(PaymentError);
  });
});
