import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import type { Sku } from "@/config/plans";
import type { BillingEvent } from "@/server/billing/events";
import {
  InvalidWebhookSignatureError,
  PaymentError,
  type PaymentProvider,
} from "@/server/providers/payments";

export const LEMONSQUEEZY_ID = "lemonsqueezy";

/** Lemon Squeezy signs the raw request body with HMAC-SHA256 and sends the hex digest in X-Signature. */
export function verifyLemonSqueezySignature(
  rawBody: string,
  signature: string | null,
  secret: string,
): boolean {
  if (!signature) return false;
  const expected = Buffer.from(createHmac("sha256", secret).update(rawBody).digest("hex"));
  const received = Buffer.from(signature.trim().toLowerCase());
  return expected.length === received.length && timingSafeEqual(expected, received);
}

const payloadSchema = z.object({
  meta: z.object({
    event_name: z.string(),
    custom_data: z.object({ user_id: z.string().optional() }).passthrough().optional(),
  }),
  data: z.object({
    id: z.union([z.string(), z.number()]).transform(String),
    type: z.string(),
    attributes: z.record(z.string(), z.unknown()),
  }),
});

const str = (v: unknown): string | null => (typeof v === "string" && v !== "" ? v : null);
const num = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null);
const date = (v: unknown): Date | null => {
  const s = str(v);
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
};

/** Translate one Lemon Squeezy webhook payload. `variantToSku` maps variant ids to our SKUs. */
export function parseLemonSqueezyEvent(
  payload: unknown,
  variantToSku: Record<string, Sku>,
): BillingEvent {
  const parsed = payloadSchema.safeParse(payload);
  if (!parsed.success)
    return { kind: "ignored", eventId: "unreadable", reason: "unreadable payload" };

  const { meta, data } = parsed.data;
  const a = data.attributes;
  const stamp = str(a.updated_at) ?? str(a.created_at) ?? "";
  const eventId = `${meta.event_name}:${data.id}:${stamp}`;
  const userId = meta.custom_data?.user_id ?? null;
  const email = str(a.user_email);
  const sku = (variantId: unknown) => variantToSku[String(variantId)] ?? "unknown";

  if (data.type === "subscriptions") {
    const status = str(a.status) ?? "unknown";
    const renewsAt = date(a.renews_at);
    const endsAt = date(a.ends_at);
    const urls = (a.urls ?? {}) as Record<string, unknown>;
    return {
      kind: "subscription",
      eventId,
      userId,
      email,
      providerSubscriptionId: data.id,
      sku: sku(a.variant_id),
      status,
      currentPeriodEnd: status === "cancelled" ? (endsAt ?? renewsAt) : (renewsAt ?? endsAt),
      cancelAtPeriodEnd: a.cancelled === true,
      manageUrl: str(urls.customer_portal),
      updatedAt: date(a.updated_at) ?? new Date(),
    };
  }

  if (data.type === "orders" && meta.event_name === "order_created") {
    if (str(a.status) !== "paid") return { kind: "ignored", eventId, reason: "order not paid" };
    const item = (a.first_order_item ?? {}) as Record<string, unknown>;
    return {
      kind: "purchase",
      eventId,
      userId,
      email,
      providerOrderId: data.id,
      sku: sku(item.variant_id),
      amount: num(a.total) ?? 0,
      currency: str(a.currency) ?? "USD",
      purchasedAt: date(a.created_at) ?? new Date(),
    };
  }

  if (data.type === "orders" && meta.event_name === "order_refunded") {
    return { kind: "refund", eventId, providerOrderId: data.id };
  }

  return { kind: "ignored", eventId, reason: `unhandled ${meta.event_name}` };
}

export interface LemonSqueezyConfig {
  apiKey: string;
  storeId: string;
  webhookSecret: string;
  /** Variant ids from the Lemon Squeezy dashboard, one per SKU. */
  variants: Record<Sku, string>;
  fetchImpl?: typeof fetch;
}

export function createLemonSqueezyProvider(config: LemonSqueezyConfig): PaymentProvider {
  const doFetch = config.fetchImpl ?? fetch;
  const variantToSku = Object.fromEntries(
    (Object.entries(config.variants) as [Sku, string][]).map(([sku, variant]) => [variant, sku]),
  ) as Record<string, Sku>;

  return {
    id: LEMONSQUEEZY_ID,

    async createCheckout({ userId, email, sku, discountCode, successUrl }) {
      const response = await doFetch("https://api.lemonsqueezy.com/v1/checkouts", {
        method: "POST",
        headers: {
          Accept: "application/vnd.api+json",
          "Content-Type": "application/vnd.api+json",
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          data: {
            type: "checkouts",
            attributes: {
              checkout_data: {
                email,
                ...(discountCode ? { discount_code: discountCode } : {}),
                custom: { user_id: userId },
              },
              product_options: { redirect_url: successUrl },
            },
            relationships: {
              store: { data: { type: "stores", id: config.storeId } },
              variant: { data: { type: "variants", id: config.variants[sku] } },
            },
          },
        }),
      });
      if (!response.ok)
        throw new PaymentError(`Checkout request failed (status ${response.status})`);
      const json = (await response.json()) as { data?: { attributes?: { url?: unknown } } };
      const url = json.data?.attributes?.url;
      if (typeof url !== "string") throw new PaymentError("Checkout response had no address");
      return { url };
    },

    verifyAndParseWebhook(rawBody, signature) {
      if (!verifyLemonSqueezySignature(rawBody, signature, config.webhookSecret)) {
        throw new InvalidWebhookSignatureError();
      }
      let payload: unknown;
      try {
        payload = JSON.parse(rawBody);
      } catch {
        return { kind: "ignored", eventId: "unreadable", reason: "not json" };
      }
      return parseLemonSqueezyEvent(payload, variantToSku);
    },
  };
}
