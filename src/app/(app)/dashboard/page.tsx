import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { Badge } from "@/components/ui/badge";
import { DeleteResumeButton } from "@/features/dashboard/components/delete-resume-button";
import { ImportDraftCard } from "@/features/dashboard/components/import-draft-card";
import { NewResumeButton } from "@/features/dashboard/components/new-resume-button";
import { getTemplate } from "@/features/templates/registry";
import { auth } from "@/server/auth";
import { getEntitlementsForUser } from "@/server/billing";
import { resumeService } from "@/server/resumes";

export const metadata: Metadata = { title: "My resumes", robots: { index: false, follow: false } };

const dateFormat = new Intl.DateTimeFormat("en", { dateStyle: "medium" });

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin?callbackUrl=%2Fdashboard");

  const [resumes, entitlements] = await Promise.all([
    resumeService.list(session.user.id),
    getEntitlementsForUser(session.user.id),
  ]);

  return (
    <>
      <AppHeader email={session.user.email} />
      <div className="mx-auto flex max-w-4xl flex-col gap-8 px-5 py-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl font-bold tracking-tight">My resumes</h1>
            <Badge variant={entitlements.plan === "pro" ? "primary" : "default"}>
              {entitlements.plan === "pro" ? "Pro" : "Free"}
            </Badge>
          </div>
          <NewResumeButton />
        </div>

        <ImportDraftCard />

        {resumes.length === 0 ? (
          <p className="rounded-xl border bg-card p-8 text-muted-foreground">
            You have no resumes yet. Create one to get started.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {resumes.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between gap-4 rounded-xl border bg-card p-5"
              >
                <Link
                  href={`/builder/${r.id}`}
                  className="flex min-w-0 flex-1 flex-col gap-1 rounded-md"
                >
                  <span className="truncate font-display text-lg font-semibold">{r.title}</span>
                  <span className="text-sm text-muted-foreground">
                    {getTemplate(r.templateId).name} &middot; Updated{" "}
                    {dateFormat.format(r.updatedAt)}
                  </span>
                </Link>
                <DeleteResumeButton id={r.id} title={r.title} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
