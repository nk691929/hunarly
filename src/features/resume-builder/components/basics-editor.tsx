"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextField } from "@/features/resume-builder/components/fields";
import { newId } from "@/features/resume-builder/defaults";
import { BASICS_TIP_REMOTE } from "@/features/resume-builder/guidance";
import { profileSchema } from "@/features/resume-builder/schema";
import { useResumeStore } from "@/features/resume-builder/store";
import { validateWith } from "@/features/resume-builder/validation";

const MAX_LINKS = 6;

export function BasicsEditor() {
  const profile = useResumeStore((s) => s.history.present.profile);
  const mode = useResumeStore((s) => s.history.present.mode);
  const setProfile = useResumeStore((s) => s.setProfile);
  const errors = validateWith(profileSchema, profile);

  const setLink = (id: string, patch: { label?: string; url?: string }) =>
    setProfile({ links: profile.links.map((l) => (l.id === id ? { ...l, ...patch } : l)) });

  return (
    <div className="flex flex-col gap-5">
      {mode === "remote" && (
        <p className="rounded-lg bg-secondary px-4 py-3 text-sm">{BASICS_TIP_REMOTE}</p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Full name"
          value={profile.fullName}
          onChange={(fullName) => setProfile({ fullName })}
          error={errors.fullName}
          autoComplete="name"
        />
        <TextField
          label="Target job title"
          value={profile.headline}
          onChange={(headline) => setProfile({ headline })}
          error={errors.headline}
          placeholder="Junior Data Analyst"
        />
        <TextField
          label="Email"
          type="email"
          value={profile.email}
          onChange={(email) => setProfile({ email })}
          error={errors.email}
          autoComplete="email"
        />
        <TextField
          label="Phone"
          type="tel"
          value={profile.phone}
          onChange={(phone) => setProfile({ phone })}
          error={errors.phone}
          autoComplete="tel"
        />
        <TextField
          label="Location"
          value={profile.location}
          onChange={(location) => setProfile({ location })}
          error={errors.location}
          placeholder="City, country"
          className="sm:col-span-2"
        />
        {mode === "remote" && (
          <>
            <TextField
              label="Time zone"
              value={profile.timezone}
              onChange={(timezone) => setProfile({ timezone })}
              error={errors.timezone}
              placeholder="UTC+5 (Pakistan Standard Time)"
            />
            <TextField
              label="Availability"
              value={profile.availability}
              onChange={(availability) => setProfile({ availability })}
              error={errors.availability}
              placeholder="From 1 December, 40 hours a week"
            />
          </>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <h4 className="font-display text-sm font-semibold">Links</h4>
        <datalist id="link-labels">
          <option value="LinkedIn" />
          <option value="GitHub" />
          <option value="Portfolio" />
          <option value="Website" />
        </datalist>
        {profile.links.map((link, i) => (
          <div key={link.id} className="flex items-end gap-2">
            <TextField
              label="Label"
              list="link-labels"
              value={link.label}
              onChange={(label) => setLink(link.id, { label })}
              error={errors[`links.${i}.label`]}
              className="w-32 shrink-0"
            />
            <TextField
              label="Web address"
              value={link.url}
              onChange={(url) => setLink(link.id, { url })}
              error={errors[`links.${i}.url`]}
              placeholder="github.com/yourname"
              className="min-w-0 flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Remove link ${link.label || i + 1}`}
              onClick={() => setProfile({ links: profile.links.filter((l) => l.id !== link.id) })}
            >
              <Trash2 aria-hidden="true" />
            </Button>
          </div>
        ))}
        {profile.links.length < MAX_LINKS && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="self-start"
            onClick={() =>
              setProfile({ links: [...profile.links, { id: newId(), label: "", url: "" }] })
            }
          >
            <Plus aria-hidden="true" />
            Add link
          </Button>
        )}
      </div>
    </div>
  );
}
