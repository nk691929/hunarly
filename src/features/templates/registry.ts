import { atsClassic } from "@/features/templates/ats-classic";
import type { TemplateDefinition } from "@/features/templates/types";

/** Register new templates here (one line each). The builder reads this list. */
export const templates: readonly TemplateDefinition[] = [atsClassic];

export function getTemplate(id: string): TemplateDefinition {
  return templates.find((t) => t.id === id) ?? atsClassic;
}
