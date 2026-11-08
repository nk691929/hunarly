"use client";

import { useCallback, useState } from "react";
import { exportBlockedReason, filenameFromDisposition } from "@/features/resume-builder/pdf";
import { useResumeStore } from "@/features/resume-builder/store";

export type PdfDownloadState = "idle" | "working" | "error";

/** Sends the current resume to /api/pdf and saves the file the server returns. */
export function usePdfDownload() {
  const [state, setState] = useState<PdfDownloadState>("idle");
  const [error, setError] = useState<string | null>(null);

  const download = useCallback(async () => {
    const doc = useResumeStore.getState().history.present;
    const blocked = exportBlockedReason(doc);
    if (blocked) {
      setError(blocked);
      setState("error");
      return;
    }

    setState("working");
    setError(null);
    try {
      const response = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(doc),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? "We could not create your PDF. Please try again.");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filenameFromDisposition(response.headers.get("Content-Disposition"));
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
      setState("idle");
    } catch (e) {
      setError(e instanceof Error ? e.message : "We could not create your PDF. Please try again.");
      setState("error");
    }
  }, []);

  return { state, error, download };
}
