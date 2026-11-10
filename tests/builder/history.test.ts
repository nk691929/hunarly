import { describe, expect, it } from "vitest";
import {
  commit,
  createHistory,
  MAX_HISTORY,
  redo,
  shouldCoalesce,
  undo,
} from "@/features/resume-builder/history";

describe("history", () => {
  it("commits, undoes and redoes", () => {
    let h = createHistory(1);
    h = commit(h, 2, false);
    h = commit(h, 3, false);
    expect(h.present).toBe(3);
    h = undo(h);
    expect(h.present).toBe(2);
    h = redo(h);
    expect(h.present).toBe(3);
  });

  it("clears the redo stack after a new edit", () => {
    let h = commit(commit(createHistory(1), 2, false), 3, false);
    h = undo(h);
    h = commit(h, 9, false);
    expect(h.future).toEqual([]);
  });

  it("returns the same history when there is nothing to undo or redo", () => {
    const h = createHistory(1);
    expect(undo(h)).toBe(h);
    expect(redo(h)).toBe(h);
  });

  it("merges coalesced edits into one undo step", () => {
    let h = commit(createHistory("a"), "ab", false);
    h = commit(h, "abc", true);
    h = commit(h, "abcd", true);
    expect(h.past).toEqual(["a"]);
    expect(undo(h).present).toBe("a");
  });

  it("caps the number of undo steps", () => {
    let h = createHistory(0);
    for (let i = 1; i <= MAX_HISTORY + 20; i++) h = commit(h, i, false);
    expect(h.past.length).toBe(MAX_HISTORY);
  });

  it("coalesces only the same key inside the time window", () => {
    expect(shouldCoalesce(null, "a", 1000)).toBe(false);
    expect(shouldCoalesce({ key: "a", at: 1000 }, "a", 1500)).toBe(true);
    expect(shouldCoalesce({ key: "a", at: 1000 }, "b", 1500)).toBe(false);
    expect(shouldCoalesce({ key: "a", at: 1000 }, "a", 5000)).toBe(false);
  });
});
