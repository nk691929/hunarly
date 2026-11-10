"use client";

import { useEffect } from "react";
import type { ResumeDocument } from "@/features/resume-builder/schema";
import { resetResumeStore, useResumeStore } from "@/features/resume-builder/store";

/** Where a resume is loaded from and saved to. Keep the object stable between renders. */
export interface AutosaveTarget {
  load: () => ResumeDocument | null;
  save: (doc: ResumeDocument) => Promise<boolean>;
}

const SAVE_DELAY_MS = 600;

/**
 * Loads the resume once, then saves it shortly after every change.
 * - Saves run one at a time, in order, so a slow save can never overwrite a newer one.
 * - A pending save is flushed when the tab is hidden or the builder closes.
 * - The store is reset on exit so the next resume never briefly shows this one.
 */
export function useAutosave(target: AutosaveTarget): void {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let chain: Promise<void> = Promise.resolve();
    let disposed = false;

    useResumeStore.getState().hydrate(target.load());

    const run = async (doc: ResumeDocument) => {
      let ok = false;
      try {
        ok = await target.save(doc);
      } catch {
        ok = false;
      }
      if (disposed) return;
      const { history, setSaveStatus } = useResumeStore.getState();
      if (!ok) setSaveStatus("error");
      else if (history.present === doc) setSaveStatus("saved"); // stay "saving" if newer edits exist
    };

    // Capture the document now, so a flush during teardown saves what the person last saw.
    const queueSave = () => {
      timer = undefined;
      const doc = useResumeStore.getState().history.present;
      chain = chain.then(() => run(doc));
    };

    const unsubscribe = useResumeStore.subscribe((state, prev) => {
      if (!prev.hydrated || state.history.present === prev.history.present) return;
      if (timer) clearTimeout(timer);
      timer = setTimeout(queueSave, SAVE_DELAY_MS);
    });

    const flush = () => {
      if (!timer) return;
      clearTimeout(timer);
      queueSave();
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
    };
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      unsubscribe();
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onVisibility);
      flush();
      disposed = true;
      resetResumeStore();
    };
  }, [target]);
}
