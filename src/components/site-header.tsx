import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { MobileNav } from "@/components/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { authStatus } from "@/server/auth-status";

/**
 * Stays static (no session lookup) so marketing pages remain fast and cacheable.
 * The "Sign in" link goes to /signin, which redirects signed-in people to their dashboard.
 */
export function SiteHeader() {
  const showSignIn = authStatus.configured;
  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          {showSignIn && (
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link href="/signin">Sign in</Link>
            </Button>
          )}
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href={siteConfig.cta.href}>{siteConfig.cta.label}</Link>
          </Button>
          <MobileNav showSignIn={showSignIn} />
        </div>
      </div>
    </header>
  );
}
