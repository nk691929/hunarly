export type HeaderVariant = "left" | "center" | "band";
export type HeadingVariant = "underline" | "bar" | "hairline" | "caps" | "pill";
export type SkillsVariant = "text" | "chips" | "outlined";
export type LinksVariant = "inline" | "chips";

/** The design choices that make one template look different from another. */
export interface TemplateTheme {
  header: HeaderVariant;
  heading: HeadingVariant;
  skills: SkillsVariant;
  links: LinksVariant;
  /** Use a monospace font for dates and technology lines. */
  mono: boolean;
  nameSize: number;
  nameWeight: number;
  nameTracking: number;
  bodySize: number;
  padX: number;
  padY: number;
}
