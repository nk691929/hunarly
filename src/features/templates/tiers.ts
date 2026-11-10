export type TemplateTier = "free" | "pro";

export const DEFAULT_TEMPLATE_ID = "ats-classic";

/**
 * Which templates are free. Kept apart from the React template files so server code can check it
 * cheaply. A test keeps this in step with the template registry.
 */
export const TEMPLATE_TIERS: Record<string, TemplateTier> = {
  "ats-classic": "free",
  "fresher-friendly": "free",
  modern: "pro",
  minimal: "pro",
  executive: "pro",
  "remote-tech": "pro",
};

/** Unknown ids count as Pro, so a made-up template id never gets around the limit. */
export function templateTier(id: string): TemplateTier {
  return TEMPLATE_TIERS[id] ?? "pro";
}

export function canUseTemplate(id: string, proTemplates: boolean): boolean {
  return proTemplates || templateTier(id) === "free";
}
