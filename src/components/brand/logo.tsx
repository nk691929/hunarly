import Link from "next/link";
import { LogoMark } from "@/components/brand/logo-mark";
import { cn } from "@/lib/utils";

interface LogoProps {
  /** Render as a link to the home page. Defaults to true. */
  asLink?: boolean;
  className?: string;
}

/** Mark + wordmark lockup. */
export function Logo({ asLink = true, className }: LogoProps) {
  const content = (
    <>
      <LogoMark />
      <span className="font-display text-xl font-bold tracking-tight">Hunarly</span>
    </>
  );

  if (!asLink) {
    return <span className={cn("inline-flex items-center gap-2.5", className)}>{content}</span>;
  }

  return (
    <Link
      href="/"
      aria-label="Hunarly home"
      className={cn("inline-flex items-center gap-2.5 rounded-md", className)}
    >
      {content}
    </Link>
  );
}
