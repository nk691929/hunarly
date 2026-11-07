"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

/** Small-screen menu. Closes when a link is chosen. Positioned against the sticky header. */
export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="icon"
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? (
          <X className="size-5" aria-hidden="true" />
        ) : (
          <Menu className="size-5" aria-hidden="true" />
        )}
      </Button>
      {open && (
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className="absolute inset-x-0 top-full flex flex-col gap-1 border-b bg-background p-4 shadow-lg"
        >
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-3 text-base font-medium hover:bg-muted"
            >
              {item.label}
            </Link>
          ))}
          <Button asChild className="mt-2">
            <Link href={siteConfig.cta.href} onClick={() => setOpen(false)}>
              {siteConfig.cta.label}
            </Link>
          </Button>
        </nav>
      )}
    </div>
  );
}
