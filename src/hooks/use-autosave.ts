"use client";

import { useEffect } from "react";
import { loadDraft, saveDraft } from "@/features/resume-builder/draft-storage";
import { useResumeStore } from "@/features/resume-builder/store";

const SAVE_DELAY_MS = 600;

/**
 * Loads the saved draft once, then saves the document shortly after every change.
 * A pending save is flushed when the tab is hidden or closed so no work is lost.
 */
export function useAutosave(): void {
  useEffect(() => {
    useResumeStore.getState().hydrate(loadDraft());
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    const save = () => {
      timer = undefined;
      const { history, setSaveStatus } = useResumeStore.getState();
      setSaveStatus(saveDraft(history.present) ? "saved" : "error");
    };

    const unsubscribe = useResumeStore.subscribe((state, prev) => {
      if (!prev.hydrated || state.history.present === prev.history.present) return;
      if (timer) clearTimeout(timer);
      timer = setTimeout(save, SAVE_DELAY_MS);
    });

    const flush = () => {
      if (timer) {
        clearTimeout(timer);
        save();
      }
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
    };
  }, []);
}
