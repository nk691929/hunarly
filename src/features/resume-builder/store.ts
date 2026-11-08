import { create } from "zustand";
import {
  createEmptyDocument,
  createItem,
  createSampleDocument,
} from "@/features/resume-builder/defaults";
import * as ops from "@/features/resume-builder/document-ops";
import {
  commit,
  createHistory,
  redo as redoHistory,
  shouldCoalesce,
  undo as undoHistory,
  type History,
  type LastEdit,
} from "@/features/resume-builder/history";
import type {
  ListKey,
  Profile,
  ResumeDocument,
  ResumeMode,
  ResumeStyle,
} from "@/features/resume-builder/schema";

export type SaveStatus = "idle" | "dirty" | "saved" | "error";

interface ResumeState {
  history: History<ResumeDocument>;
  lastEdit: LastEdit | null;
  /** False until the saved draft (if any) has been loaded on the client. */
  hydrated: boolean;
  saveStatus: SaveStatus;

  hydrate: (saved: ResumeDocument | null) => void;
  setSaveStatus: (status: SaveStatus) => void;

  /** Apply a change. A non-null `editKey` merges repeated edits of the same field into one undo step. */
  update: (editKey: string | null, recipe: (doc: ResumeDocument) => ResumeDocument) => void;
  undo: () => void;
  redo: () => void;

  setTitle: (title: string) => void;
  setMode: (mode: ResumeMode) => void;
  setProfile: (patch: Partial<Profile>) => void;
  setSummary: (summary: string) => void;
  setSkills: (skills: string) => void;
  setStyle: (patch: Partial<ResumeStyle>) => void;
  /** Switch template and take on its default look (color, font, spacing) in one undoable step. */
  applyTemplate: (templateId: string, style: ResumeStyle) => void;
  reorderSections: (from: number, to: number) => void;

  addItem: <K extends ListKey>(key: K) => void;
  updateItem: <K extends ListKey>(
    key: K,
    id: string,
    patch: Partial<ResumeDocument[K][number]>,
  ) => void;
  removeItem: (key: ListKey, id: string) => void;
  moveItem: (key: ListKey, from: number, to: number) => void;

  loadSample: () => void;
  startOver: () => void;
}

const initialState = () => ({
  history: createHistory(createEmptyDocument()),
  lastEdit: null as LastEdit | null,
  hydrated: false,
  saveStatus: "idle" as SaveStatus,
});

export const useResumeStore = create<ResumeState>()((set, get) => ({
  ...initialState(),

  hydrate: (saved) =>
    set((s) => ({
      history: createHistory(saved ?? s.history.present),
      lastEdit: null,
      hydrated: true,
      saveStatus: "idle",
    })),

  setSaveStatus: (saveStatus) => set({ saveStatus }),

  update: (editKey, recipe) => {
    const { history, lastEdit } = get();
    const next = recipe(history.present);
    if (next === history.present) return;
    const now = Date.now();
    const coalesce = editKey !== null && shouldCoalesce(lastEdit, editKey, now);
    set({
      history: commit(history, next, coalesce),
      lastEdit: editKey === null ? null : { key: editKey, at: now },
      saveStatus: "dirty",
    });
  },

  undo: () =>
    set((s) => ({ history: undoHistory(s.history), lastEdit: null, saveStatus: "dirty" })),
  redo: () =>
    set((s) => ({ history: redoHistory(s.history), lastEdit: null, saveStatus: "dirty" })),

  setTitle: (title) => get().update("title", (d) => ({ ...d, title })),
  setMode: (mode) => get().update(null, (d) => ({ ...d, mode })),
  setProfile: (patch) =>
    get().update(`profile:${Object.keys(patch).join(",")}`, (d) => ({
      ...d,
      profile: { ...d.profile, ...patch },
    })),
  setSummary: (summary) => get().update("summary", (d) => ({ ...d, summary })),
  setSkills: (skills) => get().update("skills", (d) => ({ ...d, skills })),
  setStyle: (patch) =>
    get().update(`style:${Object.keys(patch).join(",")}`, (d) => ({
      ...d,
      style: { ...d.style, ...patch },
    })),
  applyTemplate: (templateId, style) => get().update(null, (d) => ({ ...d, templateId, style })),
  reorderSections: (from, to) => get().update(null, (d) => ops.reorderSections(d, from, to)),

  addItem: (key) => get().update(null, (d) => ops.addItem(d, key, createItem(key))),
  updateItem: (key, id, patch) =>
    get().update(`${key}:${id}:${Object.keys(patch).sort().join(",")}`, (d) =>
      ops.updateItem(d, key, id, patch),
    ),
  removeItem: (key, id) => get().update(null, (d) => ops.removeItem(d, key, id)),
  moveItem: (key, from, to) => get().update(null, (d) => ops.moveItem(d, key, from, to)),

  loadSample: () => get().update(null, () => createSampleDocument()),
  startOver: () => get().update(null, () => createEmptyDocument()),
}));

/** Reset to a blank, un-hydrated store. Used by tests. */
export function resetResumeStore(): void {
  useResumeStore.setState(initialState());
}
