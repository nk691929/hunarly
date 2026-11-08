import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resetResumeStore, useResumeStore } from "@/features/resume-builder/store";

const get = () => useResumeStore.getState();

describe("resume store", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-08T10:00:00Z"));
    resetResumeStore();
  });
  afterEach(() => vi.useRealTimers());

  it("merges quick typing in one field into a single undo step", () => {
    get().setProfile({ fullName: "A" });
    vi.advanceTimersByTime(200);
    get().setProfile({ fullName: "Ay" });
    vi.advanceTimersByTime(200);
    get().setProfile({ fullName: "Aye" });
    expect(get().history.present.profile.fullName).toBe("Aye");
    expect(get().history.past).toHaveLength(1);
    get().undo();
    expect(get().history.present.profile.fullName).toBe("");
  });

  it("starts a new undo step after a pause", () => {
    get().setProfile({ fullName: "A" });
    vi.advanceTimersByTime(5000);
    get().setProfile({ fullName: "Ab" });
    expect(get().history.past).toHaveLength(2);
  });

  it("supports redo after undo", () => {
    get().setSummary("Hello");
    get().undo();
    expect(get().history.present.summary).toBe("");
    get().redo();
    expect(get().history.present.summary).toBe("Hello");
  });

  it("adds, edits, moves and removes list items", () => {
    get().addItem("projects");
    get().addItem("projects");
    const [first, second] = get().history.present.projects;
    get().updateItem("projects", first!.id, { name: "One" });
    get().moveItem("projects", 0, 1);
    expect(get().history.present.projects.map((p) => p.id)).toEqual([second!.id, first!.id]);
    get().removeItem("projects", second!.id);
    expect(get().history.present.projects).toHaveLength(1);
  });

  it("reorders sections as one undoable step", () => {
    const before = get().history.present.sectionOrder;
    get().reorderSections(0, 3);
    expect(get().history.present.sectionOrder).not.toEqual(before);
    get().undo();
    expect(get().history.present.sectionOrder).toEqual(before);
  });

  it("loads the sample and can undo back to blank", () => {
    get().loadSample();
    expect(get().history.present.profile.fullName).toBe("Maya Johnson");
    get().undo();
    expect(get().history.present.profile.fullName).toBe("");
  });

  it("marks changes as unsaved and hydrates from a saved document", () => {
    get().setTitle("Draft");
    expect(get().saveStatus).toBe("dirty");
    const saved = { ...get().history.present, title: "From storage" };
    resetResumeStore();
    get().hydrate(saved);
    expect(get().hydrated).toBe(true);
    expect(get().history.present.title).toBe("From storage");
    expect(get().history.past).toHaveLength(0);
  });
});
