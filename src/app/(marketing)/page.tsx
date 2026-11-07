import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { faqItems } from "@/config/faq";
import { PricingTable } from "@/features/billing/components/pricing-table";
import { FaqList } from "@/features/landing/faq-list";
import { CtaBanner, Features, Hero, HowItWorks, TrustStrip } from "@/features/landing/sections";
import {
  faqPageSchema,
  organizationSchema,
  softwareApplicationSchema,
  websiteSchema,
} from "@/lib/seo/schema";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function HomePage() {
  return (
    <>
      <JsonLd data={organizationSchema()} />
      <JsonLd data={websiteSchema()} />
      <JsonLd data={softwareApplicationSchema()} />
      <JsonLd data={faqPageSchema(faqItems)} />

      <Hero />
      <TrustStrip />
      <HowItWorks />
      <Features />

      <section id="pricing" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-24">
        <h2 className="max-w-xl font-display text-3xl font-bold tracking-tight text-balance md:text-4xl">
          Start free. Upgrade when you are job hunting.
        </h2>
        <div className="mt-10">
          <PricingTable />
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 pb-8">
        <h2 className="mb-8 font-display text-3xl font-bold tracking-tight md:text-4xl">
          Questions
        </h2>
        <FaqList items={faqItems} />
      </section>

      <CtaBanner />
    </>
  );
}
