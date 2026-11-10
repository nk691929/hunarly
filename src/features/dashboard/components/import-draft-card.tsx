"use client";

import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { createResumeAction } from "@/features/dashboard/actions";
import { hasContent } from "@/features/resume-builder/document-ops";
import { clearDraft, loadDraft } from "@/features/resume-builder/draft-storage";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

/** Title of a meaningful draft saved in this browser, or "" when there is none. */
function getDraftTitle(): string {
  const draft = loadDraft();
  return draft && hasContent(draft) ? draft.title.trim() || "Untitled resume" : "";
}

/** Offers to move a resume built as a guest into the signed-in account. */
export function ImportDraftCard() {
  const router = useRouter();
  const title = useSyncExternalStore(subscribe, getDraftTitle, () => "");
  const [dismissed, setDismissed] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!title || dismissed) return null;

  return (
    <section
      aria-labelledby="import-title"
      className="flex flex-col gap-3 rounded-xl border-2 border-primary bg-card p-6"
    >
      <h2 id="import-title" className="font-display text-lg font-semibold">
        We found a resume saved in this browser
      </h2>
      <p className="text-sm text-muted-foreground">
        &ldquo;{title}&rdquo; was built before you signed in. Add it to your account to keep it safe
        and open it on any device.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const draft = loadDraft();
              if (!draft) return;
              const result = await createResumeAction(draft);
              if (result.ok) {
                clearDraft();
                router.push(`/builder/${result.id}`);
              } else {
                setError(result.error);
              }
            })
          }
        >
          {pending ? "Adding..." : "Add to my account"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={pending}
          onClick={() => {
            if (window.confirm("Discard the draft saved in this browser? This cannot be undone.")) {
              clearDraft();
              setDismissed(true);
            }
          }}
        >
          Discard draft
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </section>
  );
}
