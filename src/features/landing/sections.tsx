import { Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { HeroPreview } from "@/features/landing/hero-preview";

export function Hero() {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-14 px-5 pt-16 pb-20 md:grid-cols-[1.05fr_0.95fr] md:pt-24">
      <div className="flex flex-col items-start gap-6">
        <h1 className="font-display text-5xl leading-[1.04] font-bold tracking-tight text-balance md:text-6xl">
          {siteConfig.tagline}
        </h1>
        <p className="max-w-lg text-lg text-muted-foreground">
          Build an ATS-friendly resume in under 10 minutes. Guided sections help you write it even
          when you have little experience, wherever you are applying from.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href={siteConfig.cta.href}>{siteConfig.cta.label}</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="#how-it-works">See how it works</Link>
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">Free to start. No card needed.</p>
      </div>
      <HeroPreview />
    </section>
  );
}

const trustPoints = [
  "Real, text-selectable PDF that hiring software can read",
  "Remote-ready mode: no photo, no date of birth",
  "Your resume content is never written to our logs",
  "Export or delete your data any time",
];

/** Concrete product promises. Real customer quotes and numbers are added after launch. */
export function TrustStrip() {
  return (
    <section aria-label="What you can count on" className="border-y bg-card">
      <ul className="mx-auto grid max-w-6xl gap-x-8 gap-y-4 px-5 py-8 sm:grid-cols-2 lg:grid-cols-4">
        {trustPoints.map((p) => (
          <li key={p} className="flex gap-3 text-sm">
            <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

const steps = [
  {
    title: "Pick a template",
    body: "Start from a clean, ATS-safe layout. Change the color, font and spacing to suit you.",
  },
  {
    title: "Fill in guided sections",
    body: "Every section shows what to write and an example, from your final-year project to your certifications.",
  },
  {
    title: "Check and download",
    body: "See your ATS score as you type, fix what it flags, and export a PDF that is ready to send.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-24">
      <h2 className="max-w-xl font-display text-3xl font-bold tracking-tight text-balance md:text-4xl">
        From blank page to PDF in three steps
      </h2>
      <ol className="mt-12 grid gap-10 md:grid-cols-3">
        {steps.map((s, i) => (
          <li key={s.title} className="flex flex-col gap-3">
            <span className="font-display text-5xl font-bold text-primary" aria-hidden="true">
              {i + 1}
            </span>
            <h3 className="font-display text-xl font-semibold">{s.title}</h3>
            <p className="text-muted-foreground">{s.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

const features = [
  {
    title: "Guidance for your first resume",
    body: "No experience yet? Each section comes with plain-language tips and example text so you never stare at an empty box.",
  },
  {
    title: "A live ATS score",
    body: "See how well hiring software can read your resume while you edit, and what to change to improve it.",
  },
  {
    title: "Remote-ready mode",
    body: "Applying to international employers? Switch on portfolio, GitHub and LinkedIn links, timezone and availability, and leave out the photo and date of birth.",
  },
  {
    title: "Sections that fit graduates",
    body: "Final-year projects, internships, coursework, volunteering, languages and certifications from providers like Coursera, Google and Meta.",
  },
  {
    title: "Six professional templates",
    body: "ATS Classic, Modern, Minimal, Executive, Fresher-Friendly and Remote/Tech, each customizable.",
  },
  {
    title: "Resume, CV or both",
    body: "Whether your target country expects a one-page resume or a detailed CV, you can build the version it expects.",
  },
];

export function Features() {
  return (
    <section className="border-y bg-card">
      <div className="mx-auto max-w-6xl px-5 py-24">
        <h2 className="max-w-xl font-display text-3xl font-bold tracking-tight text-balance md:text-4xl">
          Made for your first resume, and every one after
        </h2>
        <div className="mt-12 grid gap-x-16 gap-y-10 md:grid-cols-2">
          {features.map((f) => (
            <div key={f.title} className="border-t pt-6">
              <h3 className="font-display text-xl font-semibold">{f.title}</h3>
              <p className="mt-2 max-w-md text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CtaBanner() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-24">
      <div className="flex flex-col items-start gap-6 rounded-xl bg-primary p-10 text-primary-foreground md:p-14">
        <h2 className="max-w-xl font-display text-3xl font-bold tracking-tight text-balance md:text-4xl">
          Your next application deserves a better resume.
        </h2>
        <Button asChild size="lg" variant="accent">
          <Link href={siteConfig.cta.href}>{siteConfig.cta.label}</Link>
        </Button>
      </div>
    </section>
  );
}
