"use server";

import { env } from "@/config/env";
import { isSku } from "@/config/plans";
import { siteConfig } from "@/config/site";
import {
  isInvalidDiscountInput,
  isStudentEmail,
  sanitizeDiscountCode,
} from "@/features/billing/checkout";
import type { ActionResult } from "@/features/dashboard/types";
import { auth } from "@/server/auth";
import { getEntitlementsForUser } from "@/server/billing";
import { getPaymentProvider } from "@/server/providers/payments/instance";
import { createMemoryRateLimiter } from "@/server/rate-limit";

const limiter = createMemoryRateLimiter({ limit: 10, windowMs: 60_000 });

/**
 * Start a hosted checkout for the signed-in person and return its address.
 * The student discount is decided here from the verified sign-in email, never from the browser.
 */
export async function startCheckoutAction(input: {
  sku: unknown;
  discountCode?: unknown;
}): Promise<ActionResult<{ url: string }>> {
  const session = await auth();
  const userId = session?.user?.id;
  const email = session?.user?.email;
  if (!userId || !email) return { ok: false, error: "Please sign in to continue." };

  if (!isSku(input.sku)) return { ok: false, error: "Please choose a plan." };
  if (isInvalidDiscountInput(input.discountCode))
    return { ok: false, error: "That discount code is not valid." };

  const provider = getPaymentProvider();
  if (!provider) return { ok: false, error: "Payments are not available yet." };

  if (!(await limiter.check(`checkout:${userId}`)).allowed) {
    return { ok: false, error: "Too many attempts. Please wait a minute and try again." };
  }

  const entitlements = await getEntitlementsForUser(userId);
  if (entitlements.source === "subscription" && input.sku !== "job_hunt_pass") {
    return {
      ok: false,
      error: "You already have a subscription. Manage it from the billing page.",
    };
  }

  const typed = sanitizeDiscountCode(input.discountCode);
  const studentCode = isStudentEmail(email) ? env.STUDENT_DISCOUNT_CODE : undefined;
  const discountCode = typed ?? studentCode;

  try {
    const { url } = await provider.createCheckout({
      userId,
      email,
      sku: input.sku,
      discountCode,
      successUrl: `${siteConfig.url}/billing?checkout=success`,
    });
    return { ok: true, url };
  } catch {
    console.error("Checkout could not be created");
    return { ok: false, error: "We could not start checkout. Please try again in a moment." };
  }
}
