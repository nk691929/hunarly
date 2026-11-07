import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/legal-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Terms of service",
  description: "The terms that apply when you use Hunarly.",
  alternates: { canonical: "/terms" },
};

// NOTE: draft written for the planned product. Have a lawyer review it before launch.
export default function TermsPage() {
  return (
    <LegalPage title="Terms of service" updated="November 7, 2026">
      <LegalSection title="Using Hunarly">
        <p>
          You must be at least 16 to use Hunarly. You are responsible for your account and for
          keeping your sign-in details secure. Give accurate information and do not misuse the
          service.
        </p>
      </LegalSection>
      <LegalSection title="Your content">
        <p>
          You own the content you put into Hunarly. You give us permission to store, process and
          display it only as needed to run the service for you, such as saving, previewing and
          exporting your resume.
        </p>
      </LegalSection>
      <LegalSection title="Acceptable use">
        <p>
          Do not use Hunarly to break the law, to upload content you have no right to use, to
          include false claims about yourself in documents you create, to attack or overload the
          service, or to resell access to it.
        </p>
      </LegalSection>
      <LegalSection title="Plans and payments">
        <p>
          The free plan has limits described on the pricing page. Monthly and yearly plans renew
          automatically until you cancel and stay active until the end of the paid period. The
          job-hunt pass is a one-time payment for a fixed period and does not renew. Prices are
          shown in your selected currency and local taxes are added where required. If a payment
          went wrong, contact us within 14 days and we will review it.
        </p>
      </LegalSection>
      <LegalSection title="No guarantees about outcomes">
        <p>
          We design resumes to be readable by applicant tracking systems, but we cannot promise that
          every employer&apos;s system will read your file in the same way, or that you will receive
          interviews or a job offer.
        </p>
      </LegalSection>
      <LegalSection title="Availability and changes">
        <p>
          We work to keep Hunarly available but cannot guarantee uninterrupted service. We may
          change features or these terms; if a change is meaningful, we will tell you in advance.
        </p>
      </LegalSection>
      <LegalSection title="Ending your use">
        <p>
          You can delete your account at any time. We may suspend accounts that break these terms.
        </p>
      </LegalSection>
      <LegalSection title="Liability and governing law">
        <p>
          To the extent the law allows, Hunarly is provided as is, and our liability is limited to
          the amount you paid us in the 12 months before a claim. These terms are governed by the
          laws of the place where Hunarly&apos;s operating company is registered. Nothing here
          limits rights you have under consumer protection law where you live.
        </p>
      </LegalSection>
      <LegalSection title="Contact">
        <p>{siteConfig.contactEmail}</p>
      </LegalSection>
    </LegalPage>
  );
}
