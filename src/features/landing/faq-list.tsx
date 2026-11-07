import { Plus } from "lucide-react";
import type { FaqItem } from "@/config/faq";

/** Native <details> disclosure: keyboard accessible and needs no JavaScript. */
export function FaqList({ items }: { items: FaqItem[] }) {
  return (
    <div className="divide-y border-y">
      {items.map((item) => (
        <details key={item.question} className="group py-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 rounded-md font-display text-lg font-semibold [&::-webkit-details-marker]:hidden">
            {item.question}
            <Plus
              className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-45"
              aria-hidden="true"
            />
          </summary>
          <p className="mt-3 max-w-2xl text-muted-foreground">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
