import { describe, expect, it } from "vitest";
import {
  formatDateRange,
  formatPartialDate,
  splitLines,
  splitList,
} from "@/features/resume-builder/format";

describe("format helpers", () => {
  it("formats partial dates", () => {
    expect(formatPartialDate({ month: "06", year: "2025" })).toBe("Jun 2025");
    expect(formatPartialDate({ month: "", year: "2025" })).toBe("2025");
    expect(formatPartialDate({ month: "", year: "" })).toBe("");
  });

  it("formats ranges, including a current role", () => {
    const start = { month: "06" as const, year: "2025" };
    const end = { month: "08" as const, year: "2025" };
    expect(formatDateRange(start, end, false)).toBe("Jun 2025 - Aug 2025");
    expect(formatDateRange(start, end, true)).toBe("Jun 2025 - Present");
    expect(formatDateRange({ month: "", year: "" }, { month: "", year: "" }, false)).toBe("");
  });

  it("splits bullet lines and strips markers and blanks", () => {
    expect(splitLines("- One\n\n* Two\n  • Three  \n")).toEqual(["One", "Two", "Three"]);
  });

  it("splits skill lists on commas and new lines", () => {
    expect(splitList("Python, SQL,\nExcel , ,")).toEqual(["Python", "SQL", "Excel"]);
  });
});
