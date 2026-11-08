import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createEmptyDocument, createSampleDocument } from "@/features/resume-builder/defaults";
import { styleSchema, type ResumeDocument } from "@/features/resume-builder/schema";
import { getTemplate, templates } from "@/features/templates/registry";
import type { TemplateDefinition } from "@/features/templates/types";

const HEADINGS = [
  "Summary",
  "Education",
  "Projects",
  "Experience",
  "Skills",
  "Certifications",
  "Languages",
];

function sampleFor(t: TemplateDefinition, patch: Partial<ResumeDocument> = {}): ResumeDocument {
  return { ...createSampleDocument(), templateId: t.id, style: t.defaultStyle, ...patch };
}

describe("template registry", () => {
  it("lists six templates with unique ids and valid default styles", () => {
    expect(templates).toHaveLength(6);
    expect(new Set(templates.map((t) => t.id)).size).toBe(6);
    for (const t of templates) expect(styleSchema.safeParse(t.defaultStyle).success).toBe(true);
  });

  it("offers exactly two free templates and finds each by id", () => {
    expect(templates.filter((t) => t.tier === "free")).toHaveLength(2);
    for (const t of templates) expect(getTemplate(t.id)).toBe(t);
  });
});

describe.each(templates.map((t) => [t.name, t] as const))("%s", (_name, template) => {
  const Template = template.Component;

  it("matches its snapshot with the sample resume", () => {
    const { asFragment } = render(<Template document={sampleFor(template)} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it("is ATS-safe: one column of real text with standard headings in order", () => {
    const { container } = render(<Template document={sampleFor(template)} />);
    expect(container.querySelector("table, img, svg, canvas")).toBeNull();
    expect(container.querySelector("[style*='position: absolute'], [style*='float']")).toBeNull();
    const h1 = container.querySelector("h1");
    const headings = [...container.querySelectorAll("h2")];
    expect(h1?.textContent).toBe("Maya Johnson");
    expect(headings.map((h) => h.textContent)).toEqual(HEADINGS);
    expect(
      h1!.compareDocumentPosition(headings[0]!) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("uses the chosen accent color", () => {
    const doc = sampleFor(template, { style: { ...template.defaultStyle, accent: "#B3261E" } });
    const { container } = render(<Template document={doc} />);
    expect(container.innerHTML).toMatch(/179,\s*38,\s*30/);
  });

  it("applies the font and spacing choices", () => {
    const serif = render(
      <Template
        document={sampleFor(template, { style: { ...template.defaultStyle, font: "serif" } })}
      />,
    );
    expect(serif.container.innerHTML).toContain("Georgia");
    serif.unmount();

    const sans = render(
      <Template
        document={sampleFor(template, { style: { ...template.defaultStyle, font: "sans" } })}
      />,
    );
    expect(sans.container.innerHTML).toContain("Arial");
    sans.unmount();

    const compact = render(
      <Template
        document={sampleFor(template, { style: { ...template.defaultStyle, spacing: "compact" } })}
      />,
    );
    expect(compact.container.querySelector("section")?.style.marginTop).toBe("10px");
    compact.unmount();

    const relaxed = render(
      <Template
        document={sampleFor(template, { style: { ...template.defaultStyle, spacing: "relaxed" } })}
      />,
    );
    expect(relaxed.container.querySelector("section")?.style.marginTop).toBe("18px");
  });

  it("shows time zone and availability only in remote mode", () => {
    const standard = render(<Template document={sampleFor(template)} />);
    expect(standard.container.textContent).not.toContain("Time zone:");
    standard.unmount();
    const remote = render(<Template document={sampleFor(template, { mode: "remote" })} />);
    expect(remote.container.textContent).toContain("Time zone: UTC+0");
  });

  it("renders an empty resume without sections and never links unsafe addresses", () => {
    const empty = createEmptyDocument();
    empty.templateId = template.id;
    empty.style = template.defaultStyle;
    empty.profile.links = [{ id: "x", label: "Site", url: "javascript:alert(1)" }];
    const { container } = render(<Template document={empty} />);
    expect(container.querySelectorAll("h2")).toHaveLength(0);
    expect(container.querySelector("a")).toBeNull();
  });
});
