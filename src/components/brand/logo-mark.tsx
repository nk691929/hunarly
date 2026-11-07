import { cn } from "@/lib/utils";

/**
 * The Hunarly mark: a rounded "H" whose crossbar rises left to right (progress),
 * with a marigold spark above the right stem (the moment you get noticed).
 * Colors follow the theme tokens, so it stays legible in light and dark mode.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
      className={cn("size-8 shrink-0", className)}
    >
      <rect width="32" height="32" rx="9" className="fill-primary" />
      <path
        d="M10.5 9v14M21.5 13v10M10.5 18l11-4"
        fill="none"
        strokeWidth="3.2"
        strokeLinecap="round"
        className="stroke-primary-foreground"
      />
      <circle cx="21.5" cy="8.5" r="2.5" className="fill-accent" />
    </svg>
  );
}
