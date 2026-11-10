import Link from "next/link";
import { Button } from "@/components/ui/button";

/** Placeholder for sections that ship in a later milestone. Pages using it are noindex. */
export function ComingSoon({ title, description }: { title: string; description: string }) {
  return (
    <section className="mx-auto flex max-w-2xl flex-col items-start gap-5 px-5 py-28">
      <h1 className="font-display text-4xl font-bold tracking-tight">{title}</h1>
      <p className="text-lg text-muted-foreground">{description}</p>
      <Button asChild variant="outline">
        <Link href="/">Back to home</Link>
      </Button>
    </section>
  );
}
