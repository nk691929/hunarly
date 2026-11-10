import { describe, expect, it } from "vitest";
import { getTemplate, templates } from "@/features/templates/registry";
import {
  canUseTemplate,
  DEFAULT_TEMPLATE_ID,
  TEMPLATE_TIERS,
  templateTier,
} from "@/features/templates/tiers";

describe("template tiers", () => {
  it("match the template registry exactly", () => {
    expect(Object.keys(TEMPLATE_TIERS).sort()).toEqual(templates.map((t) => t.id).sort());
    for (const t of templates) expect(TEMPLATE_TIERS[t.id]).toBe(t.tier);
  });

  it("make the default template free", () => {
    expect(templateTier(DEFAULT_TEMPLATE_ID)).toBe("free");
    expect(getTemplate(DEFAULT_TEMPLATE_ID).id).toBe(DEFAULT_TEMPLATE_ID);
  });

  it("treat unknown ids as Pro", () => {
    expect(templateTier("made-up")).toBe("pro");
  });

  it("let Pro use everything and free use only free templates", () => {
    expect(canUseTemplate("modern", true)).toBe(true);
    expect(canUseTemplate("modern", false)).toBe(false);
    expect(canUseTemplate("ats-classic", false)).toBe(true);
    expect(canUseTemplate("made-up", false)).toBe(false);
  });
});
