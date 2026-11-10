import { describe, expect, it } from "vitest";
import { SECTION_GUIDE, SECTION_LABELS } from "@/features/resume-builder/guidance";
import { SECTION_IDS } from "@/features/resume-builder/schema";
import { getTemplate, templates } from "@/features/templates/registry";

describe("guidance", () => {
  it("has a label and a tip for every section", () => {
    for (const id of SECTION_IDS) {
      expect(SECTION_LABELS[id]).toBeTruthy();
      expect(SECTION_GUIDE[id].tip.length).toBeGreaterThan(20);
    }
  });
});

describe("template registry", () => {
  it("finds templates by id and falls back to the first one", () => {
    expect(getTemplate("ats-classic").id).toBe("ats-classic");
    expect(getTemplate("does-not-exist").id).toBe(templates[0]?.id);
  });
});
