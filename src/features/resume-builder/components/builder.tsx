"use client";

import { useState } from "react";
import { BuilderSkeleton } from "@/features/resume-builder/components/builder-skeleton";
import { BuilderToolbar } from "@/features/resume-builder/components/builder-toolbar";
import { EditorPanel } from "@/features/resume-builder/components/editor-panel";
import { ResumePreview } from "@/features/resume-builder/components/resume-preview";
import { useResumeStore } from "@/features/resume-builder/store";
import { useAutosave } from "@/hooks/use-autosave";
import { cn } from "@/lib/utils";

type Tab = "edit" | "preview";

/** Split-screen builder: editor on the left, live A4 preview on the right. Tabs on small screens. */
export function Builder() {
  useAutosave();
  const hydrated = useResumeStore((s) => s.hydrated);
  const [tab, setTab] = useState<Tab>("edit");

  if (!hydrated) return <BuilderSkeleton />;

  return (
    <div className="flex h-dvh flex-col">
      <BuilderToolbar />

      <div role="tablist" aria-label="Builder view" className="grid grid-cols-2 border-b lg:hidden">
        {(["edit", "preview"] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            id={`tab-${t}`}
            aria-selected={tab === t}
            aria-controls={`pane-${t}`}
            onClick={() => setTab(t)}
            className={cn(
              "py-3 text-sm font-medium",
              tab === t ? "border-b-2 border-primary text-foreground" : "text-muted-foreground",
            )}
          >
            {t === "edit" ? "Edit" : "Preview"}
          </button>
        ))}
      </div>

      <div className="grid min-h-0 flex-1 lg:grid-cols-2">
        <div
          id="pane-edit"
          role="tabpanel"
          aria-labelledby="tab-edit"
          className={cn("overflow-y-auto p-4 lg:p-6", tab === "preview" && "hidden lg:block")}
        >
          <EditorPanel />
        </div>
        <div
          id="pane-preview"
          role="tabpanel"
          aria-labelledby="tab-preview"
          className={cn("overflow-y-auto bg-muted p-4 lg:p-6", tab === "edit" && "hidden lg:block")}
        >
          <ResumePreview />
        </div>
      </div>
    </div>
  );
}
