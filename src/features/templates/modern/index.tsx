import { ThemedTemplate } from "@/features/templates/_shared/themed-template";
import type { TemplateTheme } from "@/features/templates/_shared/theme";
import type { TemplateDefinition, TemplateProps } from "@/features/templates/types";

const theme: TemplateTheme = {
  header: "left",
  heading: "bar",
  skills: "chips",
  links: "inline",
  mono: false,
  nameSize: 32,
  nameWeight: 700,
  nameTracking: 0,
  bodySize: 13,
  padX: 52,
  padY: 48,
};

function Modern(props: TemplateProps) {
  return <ThemedTemplate {...props} theme={theme} />;
}

export const modern: TemplateDefinition = {
  id: "modern",
  name: "Modern",
  description: "A confident layout with accent bars and skill chips, still one column.",
  atsSafe: true,
  tier: "pro",
  defaultStyle: { accent: "#0F766E", font: "sans", spacing: "relaxed" },
  Component: Modern,
};
