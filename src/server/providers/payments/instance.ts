import { env } from "@/config/env";
import type { PaymentProvider } from "@/server/providers/payments";
import { createLemonSqueezyProvider } from "@/server/providers/payments/lemonsqueezy";

let provider: PaymentProvider | null | undefined;

/** The configured payment provider, or null when payments are not set up (see docs/billing.md). */
export function getPaymentProvider(): PaymentProvider | null {
  if (provider !== undefined) return provider;
  const apiKey = env.LEMONSQUEEZY_API_KEY;
  const storeId = env.LEMONSQUEEZY_STORE_ID;
  const webhookSecret = env.LEMONSQUEEZY_WEBHOOK_SECRET;
  const monthly = env.LEMONSQUEEZY_VARIANT_MONTHLY;
  const yearly = env.LEMONSQUEEZY_VARIANT_YEARLY;
  const pass = env.LEMONSQUEEZY_VARIANT_PASS;

  provider =
    apiKey && storeId && webhookSecret && monthly && yearly && pass
      ? createLemonSqueezyProvider({
          apiKey,
          storeId,
          webhookSecret,
          variants: { pro_monthly: monthly, pro_yearly: yearly, job_hunt_pass: pass },
        })
      : null;
  return provider;
}
