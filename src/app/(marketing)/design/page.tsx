import type { Metadata } from "next";
import { Logo } from "@/components/brand/logo";
import { LogoMark } from "@/components/brand/logo-mark";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata: Metadata = {
  title: "Design system",
  robots: { index: false, follow: false }, // internal reference page
};

const swatches = [
  { name: "Background", cls: "bg-background" },
  { name: "Card", cls: "bg-card" },
  { name: "Primary", cls: "bg-primary" },
  { name: "Accent", cls: "bg-accent" },
  { name: "Secondary", cls: "bg-secondary" },
  { name: "Muted", cls: "bg-muted" },
  { name: "Success", cls: "bg-success" },
  { name: "Destructive", cls: "bg-destructive" },
];

export default function DesignPage() {
  return (
    <>
      <div className="mx-auto flex max-w-6xl flex-col gap-14 px-5 py-14">
        <header className="flex flex-col gap-3">
          <h1 className="font-display text-4xl font-bold tracking-tight">Design system</h1>
          <p className="max-w-xl text-muted-foreground">
            Tokens and components used across Hunarly. Toggle dark mode in the header to check both
            themes.
          </p>
        </header>

        <section aria-labelledby="logo" className="flex flex-col gap-5">
          <h2 id="logo" className="font-display text-2xl font-semibold">
            Logo
          </h2>
          <div className="flex flex-wrap items-center gap-10 rounded-xl border bg-card p-8">
            <Logo asLink={false} />
            <LogoMark className="size-14" />
            <LogoMark className="size-6" />
          </div>
        </section>

        <section aria-labelledby="colors" className="flex flex-col gap-5">
          <h2 id="colors" className="font-display text-2xl font-semibold">
            Color
          </h2>
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {swatches.map((s) => (
              <li key={s.name} className="flex flex-col gap-2">
                <div className={`h-16 rounded-lg border ${s.cls}`} />
                <span className="text-sm text-muted-foreground">{s.name}</span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="buttons" className="flex flex-col gap-5">
          <h2 id="buttons" className="font-display text-2xl font-semibold">
            Buttons and badges
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <Button>Download PDF</Button>
            <Button variant="accent">Upgrade to Pro</Button>
            <Button variant="secondary">Save draft</Button>
            <Button variant="outline">Preview</Button>
            <Button variant="ghost">Cancel</Button>
            <Button variant="destructive">Delete resume</Button>
            <Button disabled>Exporting</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge>Free</Badge>
            <Badge variant="primary">Pro</Badge>
            <Badge variant="accent">Student discount</Badge>
            <Badge variant="success">ATS score 92</Badge>
            <Badge variant="outline">Remote-ready</Badge>
          </div>
        </section>

        <section aria-labelledby="forms" className="flex flex-col gap-5">
          <h2 id="forms" className="font-display text-2xl font-semibold">
            Form and card
          </h2>
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Education</CardTitle>
              <CardDescription>Add your degree. CGPA is optional.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="uni">University</Label>
                <Input id="uni" placeholder="e.g. NUST, Islamabad" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="cgpa">CGPA</Label>
                <Input
                  id="cgpa"
                  aria-invalid="true"
                  defaultValue="4.5"
                  aria-describedby="cgpa-error"
                />
                <p id="cgpa-error" className="text-sm text-destructive">
                  CGPA must be between 0 and 4.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </>
  );
}
