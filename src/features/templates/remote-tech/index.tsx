import { ThemedTemplate } from "@/features/templates/_shared/themed-template";
import type { TemplateTheme } from "@/features/templates/_shared/theme";
import type { TemplateDefinition, TemplateProps } from "@/features/templates/types";

const theme: TemplateTheme = {
  header: "left",
  heading: "bar",
  skills: "outlined",
  links: "chips",
  mono: true,
  nameSize: 28,
  nameWeight: 700,
  nameTracking: 0,
  bodySize: 13,
  padX: 50,
  padY: 46,
};

function RemoteTech(props: TemplateProps) {
  return <ThemedTemplate {...props} theme={theme} />;
}

export const remoteTech: TemplateDefinition = {
  id: "remote-tech",
  name: "Remote / Tech",
  description:
    "Link chips up front and monospace details, made for developers and remote applicants.",
  atsSafe: true,
  tier: "pro",
  defaultStyle: { accent: "#6D28D9", font: "sans", spacing: "comfortable" },
  Component: RemoteTech,
};
