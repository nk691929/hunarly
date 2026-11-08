import type { PartialDate } from "@/features/resume-builder/schema";

export const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

/** "2025-06" parts to "Jun 2025"; year only stays "2025"; empty stays "". */
export function formatPartialDate(d: PartialDate): string {
  if (!d.year) return "";
  if (!d.month) return d.year;
  const name = MONTH_NAMES[Number(d.month) - 1];
  return name ? `${name} ${d.year}` : d.year;
}

export function formatDateRange(start: PartialDate, end: PartialDate, current: boolean): string {
  const s = formatPartialDate(start);
  const e = current ? "Present" : formatPartialDate(end);
  if (s && e) return `${s} - ${e}`;
  return s || e;
}

/** Turn a textarea into bullet lines. Ignores blank lines and leading "-", "*" or "•" markers. */
export function splitLines(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*[-*•]\s*/, "").trim())
    .filter(Boolean);
}

/** Split "Python, SQL, Excel" (commas or new lines) into a clean list. */
export function splitList(value: string): string[] {
  return value
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}
