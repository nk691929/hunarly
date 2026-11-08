import { atsClassic } from "@/features/templates/ats-classic";
import { executive } from "@/features/templates/executive";
import { fresherFriendly } from "@/features/templates/fresher-friendly";
import { minimal } from "@/features/templates/minimal";
import { modern } from "@/features/templates/modern";
import { remoteTech } from "@/features/templates/remote-tech";
import type { TemplateDefinition } from "@/features/templates/types";

/** Register new templates here (one line each). The builder and the picker read this list. */
export const templates: readonly TemplateDefinition[] = [
  atsClassic,
  modern,
  minimal,
  executive,
  fresherFriendly,
  remoteTech,
];

export function getTemplate(id: string): TemplateDefinition {
  return templates.find((t) => t.id === id) ?? atsClassic;
}
