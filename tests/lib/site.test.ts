import { describe, expect, it } from "vitest";
import { siteConfig } from "@/config/site";

describe("siteConfig", () => {
  it("has a brand name and a valid URL", () => {
    expect(siteConfig.name).toBe("Hunarly");
    expect(() => new URL(siteConfig.url)).not.toThrow();
  });

  it("uses root-relative nav links", () => {
    for (const item of siteConfig.nav) expect(item.href.startsWith("/")).toBe(true);
  });
});
