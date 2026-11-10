import { describe, expect, it } from "vitest";
import { createEmptyDocument, createSampleDocument } from "@/features/resume-builder/defaults";
import { profileSchema, resumeDocumentSchema } from "@/features/resume-builder/schema";
import { displayUrl, isHttpUrl, normalizeUrl } from "@/features/resume-builder/urls";
import { validateWith } from "@/features/resume-builder/validation";

describe("resume document schema", () => {
  it("accepts the empty and sample documents", () => {
    expect(resumeDocumentSchema.safeParse(createEmptyDocument()).success).toBe(true);
    expect(resumeDocumentSchema.safeParse(createSampleDocument()).success).toBe(true);
  });

  it("rejects a section order with duplicates or missing sections", () => {
    const doc = createEmptyDocument();
    expect(
      resumeDocumentSchema.safeParse({ ...doc, sectionOrder: ["summary", "summary"] }).success,
    ).toBe(false);
  });
});

describe("field validation", () => {
  const base = createEmptyDocument().profile;

  it("flags an invalid email and accepts an empty one", () => {
    expect(validateWith(profileSchema, { ...base, email: "nope" }).email).toBe(
      "Enter a valid email address",
    );
    expect(validateWith(profileSchema, { ...base, email: "" }).email).toBeUndefined();
    expect(validateWith(profileSchema, { ...base, email: "a@b.co" }).email).toBeUndefined();
  });

  it("rejects letters in a phone number", () => {
    expect(validateWith(profileSchema, { ...base, phone: "call me" }).phone).toBeDefined();
    expect(
      validateWith(profileSchema, { ...base, phone: "+92 300 1234567" }).phone,
    ).toBeUndefined();
  });

  it("reports link errors by index", () => {
    const errors = validateWith(profileSchema, {
      ...base,
      links: [{ id: "1", label: "X", url: "not a url" }],
    });
    expect(errors["links.0.url"]).toBeDefined();
  });

  it("requires a year when a month is chosen", () => {
    const exp = createSampleDocument().experience[0]!;
    const bad = { ...exp, start: { month: "06" as const, year: "" } };
    const doc = { ...createSampleDocument(), experience: [bad] };
    expect(resumeDocumentSchema.safeParse(doc).success).toBe(false);
  });
});

describe("urls", () => {
  it("adds https:// to bare addresses", () => {
    expect(normalizeUrl("github.com/me")).toBe("https://github.com/me");
    expect(normalizeUrl("  ")).toBe("");
  });

  it("accepts web addresses and rejects dangerous or malformed ones", () => {
    expect(isHttpUrl("github.com/me")).toBe(true);
    expect(isHttpUrl("https://example.com/path")).toBe(true);
    expect(isHttpUrl("javascript:alert(1)")).toBe(false);
    expect(isHttpUrl("data:text/html,hi")).toBe(false);
    expect(isHttpUrl("hello world")).toBe(false);
    expect(isHttpUrl("localhost")).toBe(false);
  });

  it("shows addresses without protocol or trailing slash", () => {
    expect(displayUrl("https://github.com/me/")).toBe("github.com/me");
  });
});
