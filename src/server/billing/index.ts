import { env } from "@/config/env";
import { prismaBillingRepository } from "@/server/billing/prisma-repository";
import { createBillingService } from "@/server/billing/service";
import type { Entitlements } from "@/server/billing/entitlements";

/** The billing service backed by the database. Use this from server components, actions and routes. */
export const billingService = createBillingService(prismaBillingRepository);

/**
 * What this person may do right now. Guests (null) are on the free plan. In development,
 * DEV_PRO_UNLOCK=1 unlocks Pro for everyone so you can check the paid experience.
 */
export function getEntitlementsForUser(userId: string | null): Promise<Entitlements> {
  return billingService.getEntitlements(userId, {
    devProUnlock: env.DEV_PRO_UNLOCK === "1",
    isDevelopment: env.NODE_ENV === "development",
  });
}
