"use client";

import { Redo2, Undo2 } from "lucide-react";
import { useEffect } from "react";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ResumeMode } from "@/features/resume-builder/schema";
import { useResumeStore, type SaveStatus } from "@/features/resume-builder/store";

const STATUS_TEXT: Record<SaveStatus, string> = {
  idle: "",
  dirty: "Saving...",
  saved: "Saved on this device",
  error: "Could not save. Your browser may be blocking storage.",
};

const MODES: { id: ResumeMode; label: string }[] = [
  { id: "standard", label: "Standard" },
  { id: "remote", label: "Remote-ready" },
];

function isEditable(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  return ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName) || el.isContentEditable;
}

export function BuilderToolbar() {
  const title = useResumeStore((s) => s.history.present.title);
  const mode = useResumeStore((s) => s.history.present.mode);
  const canUndo = useResumeStore((s) => s.history.past.length > 0);
  const canRedo = useResumeStore((s) => s.history.future.length > 0);
  const saveStatus = useResumeStore((s) => s.saveStatus);
  const { setTitle, setMode, undo, redo, loadSample, startOver } = useResumeStore.getState();

  // Ctrl/Cmd+Z and Ctrl/Cmd+Shift+Z (or Y) outside text fields; inside fields the browser's own undo applies.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!(e.ctrlKey || e.metaKey) || isEditable(e.target)) return;
      const key = e.key.toLowerCase();
      if (key === "z" && !e.shiftKey) {
        e.preventDefault();
        useResumeStore.getState().undo();
      } else if ((key === "z" && e.shiftKey) || key === "y") {
        e.preventDefault();
        useResumeStore.getState().redo();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b bg-background px-4 py-2.5">
      <Logo />
      <Input
        aria-label="Resume title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="h-9 w-44 sm:w-56"
      />

      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Undo"
          disabled={!canUndo}
          onClick={undo}
        >
          <Undo2 className="size-5" aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Redo"
          disabled={!canRedo}
          onClick={redo}
        >
          <Redo2 className="size-5" aria-hidden="true" />
        </Button>
      </div>

      <fieldset className="flex rounded-lg border bg-card p-0.5">
        <legend className="sr-only">Resume mode</legend>
        {MODES.map((m) => (
          <label key={m.id} className="cursor-pointer">
            <input
              type="radio"
              name="mode"
              value={m.id}
              checked={mode === m.id}
              onChange={() => setMode(m.id)}
              className="peer sr-only"
            />
            <span className="block rounded-md px-3 py-1.5 text-sm font-medium peer-checked:bg-primary peer-checked:text-primary-foreground peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring">
              {m.label}
            </span>
          </label>
        ))}
      </fieldset>

      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={loadSample}>
          Load sample
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            if (
              window.confirm(
                "Start over with a blank resume? You can undo this with the Undo button.",
              )
            )
              startOver();
          }}
        >
          Start over
        </Button>
      </div>

      <p role="status" aria-live="polite" className="ml-auto text-sm text-muted-foreground">
        {STATUS_TEXT[saveStatus]}
      </p>
      <ThemeToggle />
    </div>
  );
}
