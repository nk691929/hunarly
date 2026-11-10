import { ThemedTemplate } from "@/features/templates/_shared/themed-template";
import type { TemplateTheme } from "@/features/templates/_shared/theme";
import type { TemplateDefinition, TemplateProps } from "@/features/templates/types";

const theme: TemplateTheme = {
  header: "left",
  heading: "hairline",
  skills: "text",
  links: "inline",
  mono: false,
  nameSize: 26,
  nameWeight: 600,
  nameTracking: 0,
  bodySize: 12.5,
  padX: 60,
  padY: 56,
};

function Minimal(props: TemplateProps) {
  return <ThemedTemplate {...props} theme={theme} />;
}

export const minimal: TemplateDefinition = {
  id: "minimal",
  name: "Minimal",
  description: "Quiet and spacious. Small headings and plenty of white space.",
  atsSafe: true,
  tier: "pro",
  defaultStyle: { accent: "#334155", font: "sans", spacing: "relaxed" },
  Component: Minimal,
};
