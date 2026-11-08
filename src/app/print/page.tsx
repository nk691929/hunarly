import type { Metadata } from "next";
import { PrintView } from "@/features/resume-builder/components/print-view";

export const metadata: Metadata = {
  title: "Print",
  robots: { index: false, follow: false },
};

/** Used only by the PDF renderer (see src/server/providers/pdf). It shows nothing on its own. */
export default function PrintPage() {
  return <PrintView />;
}
