import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/** Placeholder hero. The full landing page (pricing, FAQ, live preview) is built in M2. */
export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto grid max-w-6xl items-center gap-14 px-5 py-20 md:grid-cols-2 md:py-28">
        <div className="flex flex-col items-start gap-6">
          <Badge variant="accent">Built for fresh graduates in Pakistan</Badge>
          <h1 className="font-display text-5xl leading-[1.05] font-bold tracking-tight text-balance md:text-6xl">
            A resume that gets read.
          </h1>
          <p className="max-w-md text-lg text-muted-foreground">
            Build an ATS-friendly resume in under 10 minutes, with guidance for every section, even
            when you have no experience yet.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/design">Build my resume</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/design">See the design system</Link>
            </Button>
          </div>
        </div>

        {/* Decorative A4 preview built from plain elements; replaced by the live preview in M2. */}
        <div aria-hidden="true" className="mx-auto w-full max-w-sm rotate-[-2deg] rounded-xl border bg-card p-8 shadow-xl shadow-primary/10">
          <div className="h-5 w-40 rounded bg-foreground" />
          <div className="mt-2 h-2.5 w-56 rounded bg-muted-foreground/40" />
          <div className="mt-7 h-2.5 w-20 rounded bg-primary" />
          {[88, 100, 72].map((w, i) => (
            <div key={i} className="mt-3 h-2 rounded bg-muted-foreground/25" style={{ width: `${w}%` }} />
          ))}
          <div className="mt-7 h-2.5 w-24 rounded bg-primary" />
          {[95, 80, 100, 60].map((w, i) => (
            <div key={i} className="mt-3 h-2 rounded bg-muted-foreground/25" style={{ width: `${w}%` }} />
          ))}
          <div className="mt-7 flex gap-2">
            <div className="h-5 w-14 rounded-full bg-secondary" />
            <div className="h-5 w-16 rounded-full bg-secondary" />
            <div className="h-5 w-12 rounded-full bg-accent" />
          </div>
        </div>
      </main>
    </>
  );
}
