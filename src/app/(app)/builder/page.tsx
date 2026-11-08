import type { Metadata } from "next";
import { BuilderLoader } from "@/features/resume-builder/components/builder-loader";

export const metadata: Metadata = {
  title: "Resume builder",
  robots: { index: false, follow: false }, // a private tool, not a landing page
};

export default function BuilderPage() {
  return <BuilderLoader />;
}
