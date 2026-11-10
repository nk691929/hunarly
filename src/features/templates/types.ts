import type { ComponentType } from "react";
import type { ResumeDocument, ResumeStyle } from "@/features/resume-builder/schema";

export interface TemplateProps {
  document: ResumeDocument;
}

/** What every template provides. Add a template by creating a folder and one registry entry. */
export interface TemplateDefinition {
  id: string;
  name: string;
  description: string;
  /** True when the layout is a single column with standard headings and real text. */
  atsSafe: boolean;
  /** Free templates are available to everyone; limits are enforced on the server in M7. */
  tier: "free" | "pro";
  /** Look applied when the template is chosen. People can then change color, font and spacing. */
  defaultStyle: ResumeStyle;
  Component: ComponentType<TemplateProps>;
}
