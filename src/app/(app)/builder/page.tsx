import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BuilderLoader } from "@/features/resume-builder/components/builder-loader";
import { auth } from "@/server/auth";
import { getEntitlementsForUser } from "@/server/billing";
import { authStatus } from "@/server/auth-status";

export const metadata: Metadata = {
  title: "Resume builder",
  robots: { index: false, follow: false }, // a private tool, not a landing page
};

/** Guest builder: the draft lives in this browser. Signed-in users manage resumes from the dashboard. */
export default async function BuilderPage() {
  const session = await auth();
  if (session?.user?.id) redirect("/dashboard");
  const { plan } = await getEntitlementsForUser(null);
  return (
    <BuilderLoader persistence={{ kind: "local", authAvailable: authStatus.configured, plan }} />
  );
}
