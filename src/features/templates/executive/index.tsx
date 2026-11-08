import { ThemedTemplate } from "@/features/templates/_shared/themed-template";
import type { TemplateTheme } from "@/features/templates/_shared/theme";
import type { TemplateDefinition, TemplateProps } from "@/features/templates/types";

const theme: TemplateTheme = {
  header: "center",
  heading: "caps",
  skills: "text",
  links: "inline",
  mono: false,
  nameSize: 30,
  nameWeight: 700,
  nameTracking: 0,
  bodySize: 13,
  padX: 56,
  padY: 52,
};

function Executive(props: TemplateProps) {
  return <ThemedTemplate {...props} theme={theme} />;
}

export const executive: TemplateDefinition = {
  id: "executive",
  name: "Executive",
  description: "A formal serif layout with a centered header, for senior and traditional roles.",
  atsSafe: true,
  tier: "pro",
  defaultStyle: { accent: "#1F2A5C", font: "serif", spacing: "comfortable" },
  Component: Executive,
};
