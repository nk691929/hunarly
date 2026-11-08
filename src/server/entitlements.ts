export interface Entitlements {
  plan: "free" | "pro";
  /** Free exports carry a small "Made with Hunarly" footer. */
  pdfWatermark: boolean;
}

/**
 * What a person may do. Until billing exists (M7) everyone is on the free plan; in development,
 * DEV_PRO_UNLOCK=1 removes the watermark so you can check the clean output.
 * M7 replaces this with a lookup of the user's subscription or pass.
 */
export function resolveEntitlements(input: {
  userId: string | null;
  devProUnlock: boolean;
  isDevelopment: boolean;
}): Entitlements {
  if (input.devProUnlock && input.isDevelopment) return { plan: "pro", pdfWatermark: false };
  return { plan: "free", pdfWatermark: true };
}
