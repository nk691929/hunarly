import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { siteConfig } from "@/config/site";

function FooterNav({
  title,
  links,
}: {
  title: string;
  links: readonly { label: string; href: string }[];
}) {
  return (
    <nav aria-label={title}>
      <h2 className="font-display text-sm font-semibold">{title}</h2>
      <ul className="mt-3 flex flex-col gap-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-sm text-muted-foreground hover:text-foreground">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 md:grid-cols-[1.5fr_1fr_1fr]">
        <div className="flex max-w-xs flex-col gap-4">
          <Logo />
          <p className="text-sm text-muted-foreground">
            Resumes that applicant tracking systems can read and people want to read, for job
            seekers everywhere.
          </p>
        </div>
        <FooterNav title="Product" links={siteConfig.footer.product} />
        <FooterNav title="Legal" links={siteConfig.footer.legal} />
      </div>
      <div className="border-t">
        <p className="mx-auto max-w-6xl px-5 py-5 text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
