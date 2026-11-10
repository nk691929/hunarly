import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Templates", robots: { index: false, follow: true } };

export default function Page() {
  return (
    <ComingSoon
      title="Templates"
      description="Templates arrive in the next milestone. Six ATS-friendly designs are on the way."
    />
  );
}
