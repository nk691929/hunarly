"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

/** Both icons render; CSS shows the right one, so there is no hydration flicker. */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle dark mode"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <Sun className="hidden size-5 dark:block" aria-hidden="true" />
      <Moon className="size-5 dark:hidden" aria-hidden="true" />
    </Button>
  );
}
