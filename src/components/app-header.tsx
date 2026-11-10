import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/features/auth/actions";

export function AppHeader({ email }: { email?: string | null }) {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-16 max-w-4xl items-center justify-between gap-4 px-5">
        <Logo />
        <div className="flex items-center gap-1 sm:gap-2">
          {email && <span className="hidden text-sm text-muted-foreground md:inline">{email}</span>}
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard">Resumes</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/billing">Billing</Link>
          </Button>
          <ThemeToggle />
          <form action={signOutAction}>
            <Button type="submit" variant="outline" size="sm">
              Sign out
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
