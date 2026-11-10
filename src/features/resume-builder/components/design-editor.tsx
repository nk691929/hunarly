"use client";

import { Lock } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { TemplateThumbnail } from "@/features/resume-builder/components/template-thumbnail";
import type { ResumeStyle } from "@/features/resume-builder/schema";
import { usePlan } from "@/features/resume-builder/plan-context";
import { useResumeStore } from "@/features/resume-builder/store";
import { isAccentReadable } from "@/features/templates/_shared/color";
import { getTemplate, templates } from "@/features/templates/registry";

const ACCENTS = [
  { name: "Lapis", value: "#3140D8" },
  { name: "Navy", value: "#1F2A5C" },
  { name: "Teal", value: "#0F766E" },
  { name: "Emerald", value: "#0B7A5A" },
  { name: "Violet", value: "#6D28D9" },
  { name: "Rose", value: "#C2395A" },
  { name: "Crimson", value: "#B3261E" },
  { name: "Amber", value: "#B45309" },
  { name: "Slate", value: "#334155" },
] as const;

const FONTS: { value: ResumeStyle["font"]; label: string }[] = [
  { value: "sans", label: "Sans-serif" },
  { value: "serif", label: "Serif" },
];

const SPACING: { value: ResumeStyle["spacing"]; label: string }[] = [
  { value: "compact", label: "Compact" },
  { value: "comfortable", label: "Comfortable" },
  { value: "relaxed", label: "Relaxed" },
];

const focusRing =
  "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring";

function Pills<T extends string>({
  legend,
  name,
  value,
  options,
  onChange,
}: {
  legend: string;
  name: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-sm font-medium">{legend}</legend>
      <div className="flex w-fit rounded-lg border bg-background p-0.5">
        {options.map((o) => (
          <label key={o.value} className="cursor-pointer">
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              className="peer sr-only"
            />
            <span
              className={`block rounded-md px-3 py-1.5 text-sm font-medium peer-checked:bg-primary peer-checked:text-primary-foreground ${focusRing}`}
            >
              {o.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function DesignEditor() {
  const templateId = useResumeStore((s) => s.history.present.templateId);
  const style = useResumeStore((s) => s.history.present.style);
  const applyTemplate = useResumeStore((s) => s.applyTemplate);
  const setStyle = useResumeStore((s) => s.setStyle);
  const current = getTemplate(templateId);
  const plan = usePlan();
  const locked = (tier: string) => tier === "pro" && plan === "free";

  return (
    <div className="flex flex-col gap-6">
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 text-sm font-medium">Template</legend>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {templates.map((t) => (
            <label
              key={t.id}
              className={locked(t.tier) ? "cursor-not-allowed opacity-60" : "cursor-pointer"}
            >
              <input
                type="radio"
                name="template"
                aria-label={locked(t.tier) ? `${t.name} (Pro)` : t.name}
                checked={current.id === t.id}
                disabled={locked(t.tier)}
                onChange={() => applyTemplate(t.id, t.defaultStyle)}
                className="peer sr-only"
              />
              <span
                className={`flex flex-col gap-2 rounded-lg border p-2 peer-checked:border-primary peer-checked:ring-2 peer-checked:ring-primary ${focusRing}`}
              >
                <TemplateThumbnail template={t} />
                <span className="flex items-center justify-between gap-2 px-1 text-sm font-medium">
                  {t.name}
                  {t.tier === "pro" && (
                    <Badge variant="primary" className="gap-1">
                      {locked(t.tier) && <Lock className="size-3" aria-hidden="true" />}
                      Pro
                    </Badge>
                  )}
                </span>
              </span>
            </label>
          ))}
        </div>
        {plan === "free" && (
          <p className="text-sm">
            Pro templates need an upgrade.{" "}
            <Link href="/pricing" className="font-medium underline">
              See plans
            </Link>
          </p>
        )}
        {plan === "free" && current.tier === "pro" && (
          <p className="text-sm text-destructive">
            This resume uses a Pro template. You can keep editing it, but to download a PDF switch
            to a free template or upgrade.
          </p>
        )}
        <p className="text-sm text-muted-foreground">
          {current.description} Choosing a template resets color, font and spacing to its look. Undo
          brings your previous choices back.
        </p>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium">Accent color</legend>
        <div className="flex flex-wrap items-center gap-3">
          {ACCENTS.map((c) => (
            <label key={c.value} className="cursor-pointer">
              <input
                type="radio"
                name="accent"
                checked={style.accent.toLowerCase() === c.value.toLowerCase()}
                onChange={() => setStyle({ accent: c.value })}
                className="peer sr-only"
              />
              <span
                className={`block size-8 rounded-full ring-1 ring-border ring-offset-2 ring-offset-card peer-checked:ring-2 peer-checked:ring-foreground ${focusRing}`}
                style={{ backgroundColor: c.value }}
              />
              <span className="sr-only">{c.name}</span>
            </label>
          ))}
          <label className="flex items-center gap-2 text-sm">
            Custom
            <input
              type="color"
              aria-label="Custom accent color"
              value={style.accent}
              onChange={(e) => setStyle({ accent: e.target.value })}
              className="h-8 w-10 cursor-pointer rounded border bg-transparent p-0.5"
            />
          </label>
        </div>
        {!isAccentReadable(style.accent) && (
          <p className="text-xs text-destructive">
            This color is light and may be hard to read, especially when printed. Pick a darker one.
          </p>
        )}
      </fieldset>

      <Pills
        legend="Font"
        name="font"
        value={style.font}
        options={FONTS}
        onChange={(font) => setStyle({ font })}
      />
      <Pills
        legend="Spacing"
        name="spacing"
        value={style.spacing}
        options={SPACING}
        onChange={(spacing) => setStyle({ spacing })}
      />
    </div>
  );
}
