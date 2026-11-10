const rawUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/** Single source of truth for brand and site-wide metadata. */
export const siteConfig = {
  name: "Hunarly",
  tagline: "A resume that gets read.",
  description:
    "Build an ATS-friendly resume in under 10 minutes. Made for fresh graduates, career changers and remote job seekers around the world.",
  url: rawUrl.replace(/\/+$/, ""),
  locale: "en",
  ogLocale: "en_US",
  // Placeholder on a reserved domain. Replace before launch (see docs/launch-checklist.md).
  contactEmail: "support@hunarly.example",
  cta: { label: "Build my resume", href: "/builder" },
  nav: [
    { label: "Templates", href: "/templates" },
    { label: "Pricing", href: "/pricing" },
    { label: "Blog", href: "/blog" },
  ],
  footer: {
    product: [
      { label: "Templates", href: "/templates" },
      { label: "Pricing", href: "/pricing" },
      { label: "Blog", href: "/blog" },
    ],
    legal: [
      { label: "Privacy policy", href: "/privacy" },
      { label: "Terms of service", href: "/terms" },
    ],
  },
} as const;

export type SiteConfig = typeof siteConfig;

/** Build an absolute URL on this site from a root-relative path. */
export function absoluteUrl(path = "/"): string {
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}
