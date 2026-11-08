import { describe, expect, it } from "vitest";
import { createSampleDocument } from "@/features/resume-builder/defaults";
import {
  DRAFT_KEY,
  loadDraft,
  parseDraft,
  saveDraft,
  serializeDraft,
} from "@/features/resume-builder/draft-storage";

function fakeStorage(initial: Record<string, string> = {}) {
  const data = { ...initial };
  return {
    data,
    getItem: (k: string) => data[k] ?? null,
    setItem: (k: string, v: string) => {
      data[k] = v;
    },
    removeItem: (k: string) => {
      delete data[k];
    },
  };
}

describe("draft storage", () => {
  it("round-trips a document", () => {
    const doc = createSampleDocument();
    const storage = fakeStorage();
    expect(saveDraft(doc, storage)).toBe(true);
    expect(loadDraft(storage)).toEqual(doc);
  });

  it("returns null for missing, corrupted or wrong-version data", () => {
    expect(parseDraft(null)).toBeNull();
    expect(parseDraft("{not json")).toBeNull();
    expect(parseDraft(JSON.stringify({ version: 2, document: {} }))).toBeNull();
    expect(parseDraft(JSON.stringify({ version: 1, document: { title: 1 } }))).toBeNull();
    expect(loadDraft(fakeStorage({ [DRAFT_KEY]: "garbage" }))).toBeNull();
  });

  it("does not throw when storage is unavailable or full", () => {
    expect(saveDraft(createSampleDocument(), null)).toBe(false);
    const full = {
      setItem: () => {
        throw new Error("quota");
      },
    };
    expect(saveDraft(createSampleDocument(), full)).toBe(false);
    expect(loadDraft(null)).toBeNull();
  });

  it("stamps the save time in the envelope", () => {
    const json = serializeDraft(createSampleDocument(), new Date("2026-11-08T10:00:00Z"));
    expect(JSON.parse(json).savedAt).toBe("2026-11-08T10:00:00.000Z");
  });
});
