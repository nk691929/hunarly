"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { createResumeAction } from "@/features/dashboard/actions";

export function NewResumeButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);

  return (
    <div className="flex flex-col items-start gap-2">
      <Button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await createResumeAction();
            if (result.ok) {
              router.push(`/builder/${result.id}`);
            } else {
              setError(result.error);
              setLimitReached(result.code === "limit_reached");
            }
          })
        }
      >
        <Plus aria-hidden="true" />
        {pending ? "Creating..." : "New resume"}
      </Button>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}{" "}
          {limitReached && (
            <Link href="/billing" className="font-medium underline">
              See plans
            </Link>
          )}
        </p>
      )}
    </div>
  );
}
