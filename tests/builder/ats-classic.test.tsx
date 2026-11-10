import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createEmptyDocument, createSampleDocument } from "@/features/resume-builder/defaults";
import { atsClassic } from "@/features/templates/ats-classic";

const Template = atsClassic.Component;

describe("ATS Classic template", () => {
  it("renders the name and sections in the chosen order", () => {
    render(<Template document={createSampleDocument()} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Maya Johnson");
    const headings = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
    expect(headings).toEqual([
      "Summary",
      "Education",
      "Projects",
      "Experience",
      "Skills",
      "Certifications",
      "Languages",
    ]);
  });

  it("follows a reordered section list", () => {
    const doc = createSampleDocument();
    doc.sectionOrder = [
      "skills",
      "summary",
      "education",
      "projects",
      "experience",
      "certifications",
      "languages",
    ];
    render(<Template document={doc} />);
    expect(screen.getAllByRole("heading", { level: 2 })[0]).toHaveTextContent("Skills");
  });

  it("hides empty sections", () => {
    render(<Template document={createEmptyDocument()} />);
    expect(screen.queryAllByRole("heading", { level: 2 })).toHaveLength(0);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Your name");
  });

  it("shows time zone and availability only in remote mode", () => {
    const doc = createSampleDocument();
    const { rerender } = render(<Template document={doc} />);
    expect(screen.queryByText(/Time zone:/)).toBeNull();
    rerender(<Template document={{ ...doc, mode: "remote" }} />);
    expect(screen.getByText(/Time zone: UTC\+0/)).toBeInTheDocument();
  });

  it("never turns an unsafe address into a link", () => {
    const doc = createEmptyDocument();
    doc.profile.links = [{ id: "x", label: "Site", url: "javascript:alert(1)" }];
    render(<Template document={doc} />);
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("marks final-year projects", () => {
    render(<Template document={createSampleDocument()} />);
    expect(screen.getByText(/Final-year project: Campus Energy Dashboard/)).toBeInTheDocument();
  });
});
