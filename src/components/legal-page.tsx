import type * as React from "react";

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <article className="mx-auto flex max-w-2xl flex-col gap-10 px-5 py-16">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-4xl font-bold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">Last updated: {updated}</p>
      </header>
      {children}
    </article>
  );
}

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 leading-relaxed">
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}
