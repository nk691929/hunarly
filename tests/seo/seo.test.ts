import { describe, expect, it } from "vitest";
import sitemap, { indexablePaths } from "@/app/sitemap";
import { faqItems } from "@/config/faq";
import { absoluteUrl, siteConfig } from "@/config/site";
import { faqPageSchema, jsonLdString, softwareApplicationSchema } from "@/lib/seo/schema";

describe("absoluteUrl", () => {
  it("joins the site URL and a path with exactly one slash", () => {
    expect(absoluteUrl("/pricing")).toBe(`${siteConfig.url}/pricing`);
    expect(absoluteUrl("pricing")).toBe(`${siteConfig.url}/pricing`);
    expect(siteConfig.url.endsWith("/")).toBe(false);
  });
});

describe("jsonLdString", () => {
  it("escapes < so a value cannot close the script tag", () => {
    const out = jsonLdString({ text: "</script><script>alert(1)</script>" });
    expect(out).not.toContain("</script>");
    expect(JSON.parse(out).text).toBe("</script><script>alert(1)</script>");
  });
});

describe("structured data", () => {
  it("includes every FAQ item", () => {
    const schema = faqPageSchema(faqItems);
    expect(schema.mainEntity).toHaveLength(faqItems.length);
    expect(schema["@type"]).toBe("FAQPage");
  });

  it("describes a free offer", () => {
    const offers = softwareApplicationSchema().offers;
    expect(offers.some((o) => o.price === "0")).toBe(true);
  });
});

describe("sitemap", () => {
  it("lists only absolute URLs for indexable pages", () => {
    const entries = sitemap();
    expect(entries).toHaveLength(indexablePaths.length);
    for (const e of entries) expect(e.url.startsWith(siteConfig.url)).toBe(true);
  });

  it("does not include placeholder pages", () => {
    const urls = sitemap().map((e) => e.url);
    for (const path of ["/builder", "/templates", "/blog", "/design"]) {
      expect(urls).not.toContain(absoluteUrl(path));
    }
  });
});
