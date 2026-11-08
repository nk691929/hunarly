"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { deleteResumeAction } from "@/features/dashboard/actions";

export function DeleteResumeButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={pending}
        aria-label={`Delete ${title}`}
        onClick={() => {
          if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
          startTransition(async () => {
            const result = await deleteResumeAction(id);
            if (result.ok) router.refresh();
            else setError(result.error);
          });
        }}
      >
        <Trash2 aria-hidden="true" />
      </Button>
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
