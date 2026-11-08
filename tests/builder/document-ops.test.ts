import { describe, expect, it } from "vitest";
import {
  createEmptyDocument,
  createItem,
  createSampleDocument,
} from "@/features/resume-builder/defaults";
import {
  addItem,
  isSectionEmpty,
  moveInArray,
  moveItem,
  removeItem,
  reorderSections,
  updateItem,
} from "@/features/resume-builder/document-ops";

describe("document ops", () => {
  it("moves items inside an array", () => {
    expect(moveInArray(["a", "b", "c"], 0, 2)).toEqual(["b", "c", "a"]);
  });

  it("adds, updates and removes list items", () => {
    let doc = createEmptyDocument();
    const item = createItem("languages");
    doc = addItem(doc, "languages", item);
    expect(doc.languages).toHaveLength(1);
    doc = updateItem(doc, "languages", item.id, { name: "Urdu", level: "Native" });
    expect(doc.languages[0]).toMatchObject({ name: "Urdu", level: "Native" });
    doc = removeItem(doc, "languages", item.id);
    expect(doc.languages).toHaveLength(0);
  });

  it("keeps the same document for no-op moves", () => {
    const doc = createSampleDocument();
    expect(moveItem(doc, "languages", 0, 0)).toBe(doc);
    expect(moveItem(doc, "languages", 0, 99)).toBe(doc);
    expect(reorderSections(doc, 2, 2)).toBe(doc);
  });

  it("reorders items and sections", () => {
    const doc = createSampleDocument();
    expect(moveItem(doc, "languages", 0, 1).languages.map((l) => l.name)).toEqual([
      "French",
      "English",
    ]);
    expect(reorderSections(doc, 0, 1).sectionOrder.slice(0, 2)).toEqual(["education", "summary"]);
  });

  it("detects empty sections", () => {
    const empty = createEmptyDocument();
    expect(isSectionEmpty(empty, "summary")).toBe(true);
    expect(isSectionEmpty(empty, "skills")).toBe(true);
    expect(isSectionEmpty(addItem(empty, "projects", createItem("projects")), "projects")).toBe(
      true,
    );
    const sample = createSampleDocument();
    for (const id of sample.sectionOrder) expect(isSectionEmpty(sample, id)).toBe(false);
  });
});
