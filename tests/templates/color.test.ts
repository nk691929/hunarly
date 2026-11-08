import { describe, expect, it } from "vitest";
import { contrastRatio, hexToRgb, isAccentReadable } from "@/features/templates/_shared/color";

describe("color helpers", () => {
  it("parses #rrggbb and rejects anything else", () => {
    expect(hexToRgb("#3140D8")).toEqual([49, 64, 216]);
    expect(hexToRgb("blue")).toBeNull();
    expect(hexToRgb("#fff")).toBeNull();
  });

  it("computes WCAG contrast", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 0);
    expect(contrastRatio("#ffffff", "#ffffff")).toBeCloseTo(1, 5);
    expect(contrastRatio("nope", "#ffffff")).toBeNull();
  });

  it("flags light accents as hard to read on white", () => {
    expect(isAccentReadable("#3140D8")).toBe(true);
    expect(isAccentReadable("#ffff00")).toBe(false);
    expect(isAccentReadable("not a color")).toBe(false);
  });

  it("keeps every built-in template accent readable", async () => {
    const { templates } = await import("@/features/templates/registry");
    for (const t of templates) expect(isAccentReadable(t.defaultStyle.accent)).toBe(true);
  });
});
