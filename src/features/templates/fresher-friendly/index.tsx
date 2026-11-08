import { ThemedTemplate } from "@/features/templates/_shared/themed-template";
import type { TemplateTheme } from "@/features/templates/_shared/theme";
import type { TemplateDefinition, TemplateProps } from "@/features/templates/types";

const theme: TemplateTheme = {
  header: "band",
  heading: "pill",
  skills: "chips",
  links: "inline",
  mono: false,
  nameSize: 30,
  nameWeight: 700,
  nameTracking: 0,
  bodySize: 13,
  padX: 48,
  padY: 44,
};

function FresherFriendly(props: TemplateProps) {
  return <ThemedTemplate {...props} theme={theme} />;
}

export const fresherFriendly: TemplateDefinition = {
  id: "fresher-friendly",
  name: "Fresher-Friendly",
  description: "A friendly header band and clear sections that make education and projects shine.",
  atsSafe: true,
  tier: "free",
  defaultStyle: { accent: "#0B7A5A", font: "sans", spacing: "comfortable" },
  Component: FresherFriendly,
};
