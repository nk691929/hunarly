import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = {
  title: "Resume builder",
  robots: { index: false, follow: true },
};

export default function Page() {
  return (
    <ComingSoon
      title="Resume builder"
      description="The builder arrives in the next milestone. You will be able to create, preview and export your resume here."
    />
  );
}
