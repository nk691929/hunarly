import { describe, expect, it } from "vitest";
import {
  createEmptyDocument,
  createSampleDocument,
  newId,
} from "@/features/resume-builder/defaults";
import { hasContent } from "@/features/resume-builder/document-ops";

describe("hasContent", () => {
  it("is false for a blank resume", () => {
    expect(hasContent(createEmptyDocument())).toBe(false);
  });

  it("is true once the person types something", () => {
    const named = createEmptyDocument();
    named.profile.fullName = "Ayesha";
    expect(hasContent(named)).toBe(true);

    const summary = createEmptyDocument();
    summary.summary = "Hello";
    expect(hasContent(summary)).toBe(true);

    const linked = createEmptyDocument();
    linked.profile.links = [{ id: newId(), label: "", url: "" }];
    expect(hasContent(linked)).toBe(true);
  });

  it("is true for the sample", () => {
    expect(hasContent(createSampleDocument())).toBe(true);
  });

  it("ignores whitespace and empty entries", () => {
    const doc = createEmptyDocument();
    doc.profile.fullName = "   ";
    expect(hasContent(doc)).toBe(false);
  });
});
