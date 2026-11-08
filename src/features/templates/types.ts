import type { ComponentType } from "react";
import type { ResumeDocument } from "@/features/resume-builder/schema";

export interface TemplateProps {
  document: ResumeDocument;
}

/** What every template provides. Add a template by creating a folder and one registry entry. */
export interface TemplateDefinition {
  id: string;
  name: string;
  description: string;
  /** True when the layout is a single column with standard headings. */
  atsSafe: boolean;
  Component: ComponentType<TemplateProps>;
}
