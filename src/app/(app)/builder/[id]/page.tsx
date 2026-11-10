import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { BuilderLoader } from "@/features/resume-builder/components/builder-loader";
import { auth } from "@/server/auth";
import { getEntitlementsForUser } from "@/server/billing";
import { resumeService } from "@/server/resumes";

export const metadata: Metadata = {
  title: "Resume builder",
  robots: { index: false, follow: false },
};

/** A saved resume. Only its owner can open it: the lookup is scoped by the signed-in user's id. */
export default async function SavedResumePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect(`/signin?callbackUrl=${encodeURIComponent(`/builder/${id}`)}`);

  const [result, entitlements] = await Promise.all([
    resumeService.get(session.user.id, id),
    getEntitlementsForUser(session.user.id),
  ]);
  if (!result.ok) notFound();

  return (
    <BuilderLoader
      persistence={{
        kind: "cloud",
        resumeId: id,
        initialDocument: result.document,
        plan: entitlements.plan,
      }}
    />
  );
}
