import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { faqItems } from "@/config/faq";
import { PricingTable } from "@/features/billing/components/pricing-table";
import { FaqList } from "@/features/landing/faq-list";
import { faqPageSchema } from "@/lib/seo/schema";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Hunarly is free to start. Upgrade to Pro for unlimited resumes, all templates, no watermark and AI writing tools. Pay monthly, yearly or once for a job-hunt pass, in USD, EUR, GBP or PKR.",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  return (
    <>
      <JsonLd data={faqPageSchema(faqItems)} />
      <section className="mx-auto max-w-6xl px-5 pt-16 pb-24">
        <h1 className="max-w-2xl font-display text-4xl font-bold tracking-tight text-balance md:text-5xl">
          Simple pricing, in your currency
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground">
          Start free. Pay monthly, yearly, or once for a pass that covers your job hunt.
        </p>
        <div className="mt-12">
          <PricingTable />
        </div>
      </section>
      <section className="mx-auto max-w-3xl px-5 pb-24">
        <h2 className="mb-8 font-display text-3xl font-bold tracking-tight">Questions</h2>
        <FaqList items={faqItems} />
      </section>
    </>
  );
}
