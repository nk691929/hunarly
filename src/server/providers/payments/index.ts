import type { Sku } from "@/config/plans";
import type { BillingEvent } from "@/server/billing/events";

export interface CheckoutInput {
  userId: string;
  email: string;
  sku: Sku;
  discountCode?: string;
  successUrl: string;
}

export class InvalidWebhookSignatureError extends Error {
  constructor() {
    super("Invalid webhook signature");
    this.name = "InvalidWebhookSignatureError";
  }
}

export class PaymentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PaymentError";
  }
}

/**
 * A payment vendor. To add one (Paddle, a local gateway), implement this and return it from
 * instance.ts. Feature code only ever sees this interface and provider-neutral BillingEvents.
 */
export interface PaymentProvider {
  id: string;
  /** Returns a hosted checkout page address for the buyer. */
  createCheckout(input: CheckoutInput): Promise<{ url: string }>;
  /** Verifies the signature and translates the vendor's payload. Throws InvalidWebhookSignatureError. */
  verifyAndParseWebhook(rawBody: string, signature: string | null): BillingEvent;
}
