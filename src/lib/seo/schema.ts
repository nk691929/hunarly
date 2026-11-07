import { PRO_PRICES } from "@/config/plans";
import type { FaqItem } from "@/config/faq";
import { absoluteUrl, siteConfig } from "@/config/site";

const CONTEXT = "https://schema.org";

/** Serialize JSON-LD safely for inlining in a <script> tag (prevents "</script>" injection). */
export function jsonLdString(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function organizationSchema() {
  return {
    "@context": CONTEXT,
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: absoluteUrl("/logo.svg"),
  };
}

export function websiteSchema() {
  return {
    "@context": CONTEXT,
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
  };
}

export function softwareApplicationSchema() {
  return {
    "@context": CONTEXT,
    "@type": "SoftwareApplication",
    name: siteConfig.name,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: siteConfig.description,
    url: siteConfig.url,
    offers: [
      { "@type": "Offer", name: "Free", price: "0", priceCurrency: "USD" },
      {
        "@type": "Offer",
        name: "Pro (monthly)",
        price: String(PRO_PRICES.monthly.USD),
        priceCurrency: "USD",
      },
    ],
  };
}

export function faqPageSchema(items: FaqItem[]) {
  return {
    "@context": CONTEXT,
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}
