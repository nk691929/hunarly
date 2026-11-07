/** Single source of truth for brand and site-wide metadata. */
export const siteConfig = {
  name: "Hunarly",
  tagline: "A resume that gets read.",
  description:
    "Build an ATS-friendly resume in under 10 minutes. Made for fresh graduates in Pakistan and remote job applicants.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "en",
  nav: [
    { label: "Templates", href: "/templates" },
    { label: "Pricing", href: "/pricing" },
    { label: "Blog", href: "/blog" },
  ],
} as const;

export type SiteConfig = typeof siteConfig;
