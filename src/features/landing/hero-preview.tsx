"use client";

import { useState, type CSSProperties } from "react";
import { Badge } from "@/components/ui/badge";

const ACCENTS = [
  { name: "Lapis", value: "#3140D8" },
  { name: "Emerald", value: "#0E8F6B" },
  { name: "Rose", value: "#C2395A" },
  { name: "Ink", value: "#12162B" },
] as const;

function SectionHeading({ children, accent }: { children: string; accent: string }) {
  return (
    <h3
      className="mt-[1.4cqw] border-b pb-[0.8cqw] text-[3cqw] font-bold"
      style={{ color: accent, borderColor: `${accent}40` }}
    >
      {children}
    </h3>
  );
}

/**
 * A small interactive sample resume. Sizes use container query units (cqw) so the
 * page scales with the card and never shifts layout. A resume is always white paper,
 * even in dark mode.
 */
export function HeroPreview() {
  const [accent, setAccent] = useState<string>(ACCENTS[0].value);

  return (
    <figure className="mx-auto flex w-full max-w-md flex-col gap-5">
      <div
        role="img"
        aria-label="Sample resume for Maya Johnson, junior data analyst, with an ATS score of 94"
        className="[container-type:inline-size] aspect-[210/297] w-full overflow-hidden rounded-xl border bg-white shadow-2xl shadow-primary/15"
      >
        <div
          className="flex h-full flex-col gap-[1.6cqw] p-[7cqw] text-[3cqw] leading-[1.45] text-[#2a2f45]"
          style={{ "--accent": accent } as CSSProperties}
        >
          <p className="text-[7.4cqw] leading-none font-bold text-[#12162b]">Maya Johnson</p>
          <p className="text-[3.8cqw] font-medium" style={{ color: accent }}>
            Junior Data Analyst
          </p>
          <p className="text-[2.7cqw] text-[#5b6078]">
            maya.johnson@email.com &nbsp; linkedin.com/in/mayajohnson &nbsp; Remote, UTC+1
          </p>

          <SectionHeading accent={accent}>Summary</SectionHeading>
          <p>
            Statistics graduate who turned a final-year project into a dashboard used by 40
            students. Looking for a junior analyst role.
          </p>

          <SectionHeading accent={accent}>Education</SectionHeading>
          <p>
            <span className="font-semibold">BSc Statistics, University of Leeds</span>
            <br />
            2022 to 2026, GPA 3.8 / 4.0
          </p>

          <SectionHeading accent={accent}>Projects</SectionHeading>
          <p className="font-semibold">Final-year project: Campus Energy Dashboard</p>
          <ul className="list-disc pl-[4cqw]">
            <li>Cleaned 18 months of meter data with Python and SQL.</li>
            <li>Built a Tableau view that cut weekly reporting from 3 hours to 20 minutes.</li>
          </ul>

          <SectionHeading accent={accent}>Skills</SectionHeading>
          <div className="flex flex-wrap gap-[1.6cqw]">
            {["Python", "SQL", "Tableau", "Excel"].map((s) => (
              <span
                key={s}
                className="rounded-full px-[2.2cqw] py-[0.6cqw] text-[2.6cqw] font-medium"
                style={{ backgroundColor: `${accent}1f`, color: accent }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      <figcaption className="flex flex-wrap items-center justify-between gap-4">
        <Badge variant="success">ATS score 94</Badge>
        <fieldset className="flex items-center gap-3">
          <legend className="sr-only">Accent color</legend>
          <span className="text-sm text-muted-foreground" aria-hidden="true">
            Try a color
          </span>
          {ACCENTS.map((a) => (
            <label key={a.value} className="cursor-pointer">
              <input
                type="radio"
                name="accent"
                value={a.value}
                checked={accent === a.value}
                onChange={() => setAccent(a.value)}
                className="peer sr-only"
              />
              <span
                className="block size-7 rounded-full ring-1 ring-border ring-offset-2 ring-offset-background peer-checked:ring-2 peer-checked:ring-foreground peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-ring"
                style={{ backgroundColor: a.value }}
              />
              <span className="sr-only">{a.name}</span>
            </label>
          ))}
        </fieldset>
      </figcaption>
    </figure>
  );
}
