import { ThemedTemplate } from "@/features/templates/_shared/themed-template";
import type { TemplateTheme } from "@/features/templates/_shared/theme";
import type { TemplateDefinition, TemplateProps } from "@/features/templates/types";

const theme: TemplateTheme = {
  header: "left",
  heading: "underline",
  skills: "text",
  links: "inline",
  mono: false,
  nameSize: 28,
  nameWeight: 700,
  nameTracking: 0,
  bodySize: 13,
  padX: 52,
  padY: 48,
};

function AtsClassic(props: TemplateProps) {
  return <ThemedTemplate {...props} theme={theme} />;
}

export const atsClassic: TemplateDefinition = {
  id: "ats-classic",
  name: "ATS Classic",
  description: "A clean single-column layout that hiring software reads reliably.",
  atsSafe: true,
  tier: "free",
  defaultStyle: { accent: "#3140D8", font: "sans", spacing: "comfortable" },
  Component: AtsClassic,
};
