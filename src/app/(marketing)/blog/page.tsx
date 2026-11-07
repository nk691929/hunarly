import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Blog", robots: { index: false, follow: true } };

export default function Page() {
  return (
    <ComingSoon
      title="Blog"
      description="Guides on writing resumes and CVs for every career stage are coming soon."
    />
  );
}
