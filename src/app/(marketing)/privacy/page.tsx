import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/legal-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "How Hunarly collects, uses and protects your data, and how you can export or delete it.",
  alternates: { canonical: "/privacy" },
};

// NOTE: draft written for the planned product. Have a lawyer review it before launch.
export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy policy" updated="November 7, 2026">
      <LegalSection title="What we collect">
        <p>
          Account details: your email address and, if you sign in with Google, your name. Resume
          content: the text and choices you enter into the builder. Usage counters: how many resumes
          you have and how often you use limited features, so we can apply your plan. Payments are
          handled by our payment provider; we do not receive or store your card number.
        </p>
      </LegalSection>
      <LegalSection title="How we use it">
        <p>
          To run your account, save and render your resumes, export files, apply plan limits,
          process payments, provide support and keep the service secure. If you use an AI feature,
          the text needed for that request is sent to our AI provider to produce the result.
        </p>
      </LegalSection>
      <LegalSection title="What we do not do">
        <p>
          We do not sell your personal data. We do not write your resume content to our logs. We do
          not use your resume content to train our own models.
        </p>
      </LegalSection>
      <LegalSection title="Who processes data for us">
        <p>
          We use service providers for hosting, database, email, payments, analytics and AI
          features. They may process your data only to provide their service to us.
        </p>
      </LegalSection>
      <LegalSection title="Cookies and local storage">
        <p>
          We store your theme preference and, before you sign in, your resume draft in your browser
          so your work is not lost. We do not use advertising cookies.
        </p>
      </LegalSection>
      <LegalSection title="Your rights and choices">
        <p>
          You can download all of your data and delete your account from your account settings.
          Depending on where you live, you may also have rights to access, correct, restrict or
          object to the use of your data, and to complain to your local data protection authority.
          Contact us to use any of these rights.
        </p>
      </LegalSection>
      <LegalSection title="Retention">
        <p>
          We keep your data while your account is active. When you delete your account, we delete
          your resumes and personal data, except what we must keep for legal or accounting reasons,
          such as payment records.
        </p>
      </LegalSection>
      <LegalSection title="International transfers">
        <p>
          Hunarly is used worldwide, so your data may be processed in countries other than your own.
          We use providers that protect data to a standard appropriate to the law that applies to
          you.
        </p>
      </LegalSection>
      <LegalSection title="Children">
        <p>Hunarly is not intended for anyone under 16.</p>
      </LegalSection>
      <LegalSection title="Changes and contact">
        <p>
          If we change this policy in a meaningful way, we will tell you in the product or by email.
          Questions: {siteConfig.contactEmail}.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
