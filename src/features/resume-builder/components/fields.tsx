"use client";

import { useId, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MONTH_NAMES } from "@/features/resume-builder/format";
import { MONTHS, type PartialDate } from "@/features/resume-builder/schema";
import { cn } from "@/lib/utils";

const controlClass =
  "w-full rounded-lg border border-input bg-card px-3.5 text-sm placeholder:text-muted-foreground aria-[invalid=true]:border-destructive disabled:cursor-not-allowed disabled:opacity-50";

function Message({ id, hint, error }: { id: string; hint?: string; error?: string }) {
  if (error)
    return (
      <p id={id} className="text-xs text-destructive">
        {error}
      </p>
    );
  if (hint)
    return (
      <p id={id} className="text-xs text-muted-foreground">
        {hint}
      </p>
    );
  return null;
}

/** Errors appear only after the person has left the field, so typing is never interrupted. */
function useTouched() {
  const [touched, setTouched] = useState(false);
  return [touched, () => setTouched(true)] as const;
}

interface TextFieldProps extends Omit<React.ComponentProps<"input">, "value" | "onChange" | "id"> {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
}

export function TextField({
  label,
  value,
  onChange,
  error,
  hint,
  className,
  ...rest
}: TextFieldProps) {
  const id = useId();
  const [touched, markTouched] = useTouched();
  const shown = touched ? error : undefined;
  const msgId = `${id}-msg`;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={markTouched}
        aria-invalid={shown ? true : undefined}
        aria-describedby={shown || hint ? msgId : undefined}
        {...rest}
      />
      <Message id={msgId} hint={hint} error={shown} />
    </div>
  );
}

interface TextAreaFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  className?: string;
}

export function TextAreaField({
  label,
  value,
  onChange,
  error,
  hint,
  placeholder,
  rows = 4,
  maxLength,
  className,
}: TextAreaFieldProps) {
  const id = useId();
  const [touched, markTouched] = useTouched();
  const shown = touched ? error : undefined;
  const msgId = `${id}-msg`;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={id}>{label}</Label>
      <textarea
        id={id}
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onBlur={markTouched}
        aria-invalid={shown ? true : undefined}
        aria-describedby={shown || hint ? msgId : undefined}
        className={cn(controlClass, "py-2.5 leading-relaxed")}
      />
      <div className="flex justify-between gap-4">
        <Message id={msgId} hint={hint} error={shown} />
        {maxLength ? (
          <span className="ml-auto text-xs text-muted-foreground">
            {value.length}/{maxLength}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly { value: string; label: string }[];
  className?: string;
}) {
  const id = useId();
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(controlClass, "h-11")}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function CheckboxField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 accent-primary"
      />
      {label}
    </label>
  );
}

export function DateField({
  label,
  value,
  onChange,
  error,
  disabled,
}: {
  label: string;
  value: PartialDate;
  onChange: (value: PartialDate) => void;
  error?: string;
  disabled?: boolean;
}) {
  const id = useId();
  const [touched, markTouched] = useTouched();
  const shown = touched ? error : undefined;
  return (
    <fieldset className="flex min-w-0 flex-col gap-1.5" disabled={disabled}>
      <legend className="mb-1.5 text-sm font-medium">{label}</legend>
      <div className="flex gap-2">
        <select
          aria-label={`${label} month`}
          value={value.month}
          onChange={(e) => onChange({ ...value, month: e.target.value as PartialDate["month"] })}
          className={cn(controlClass, "h-11 min-w-0 flex-1")}
        >
          <option value="">Month</option>
          {MONTHS.map((m, i) => (
            <option key={m} value={m}>
              {MONTH_NAMES[i]}
            </option>
          ))}
        </select>
        <Input
          aria-label={`${label} year`}
          inputMode="numeric"
          maxLength={4}
          placeholder="Year"
          value={value.year}
          onChange={(e) =>
            onChange({ ...value, year: e.target.value.replace(/\D/g, "").slice(0, 4) })
          }
          onBlur={markTouched}
          aria-invalid={shown ? true : undefined}
          aria-describedby={shown ? `${id}-msg` : undefined}
          className="w-24 shrink-0"
        />
      </div>
      <Message id={`${id}-msg`} error={shown} />
    </fieldset>
  );
}
