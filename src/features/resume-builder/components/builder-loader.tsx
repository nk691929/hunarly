"use client";

import dynamic from "next/dynamic";
import { BuilderSkeleton } from "@/features/resume-builder/components/builder-skeleton";
import type { Persistence } from "@/features/resume-builder/persistence";

/** The builder is client-only (it reads localStorage) and loaded on demand to keep other pages light. */
const Builder = dynamic(
  () => import("@/features/resume-builder/components/builder").then((m) => m.Builder),
  {
    ssr: false,
    loading: () => <BuilderSkeleton />,
  },
);

export function BuilderLoader({ persistence }: { persistence: Persistence }) {
  return <Builder persistence={persistence} />;
}
