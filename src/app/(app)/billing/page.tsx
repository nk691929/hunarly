import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { env } from "@/config/env";
import { isSku, STUDENT_DISCOUNT_PERCENT, type Sku } from "@/config/plans";
import { CheckoutForm } from "@/features/billing/components/checkout-form";
import { isStudentEmail } from "@/features/billing/checkout";
import { auth } from "@/server/auth";
import { billingService, getEntitlementsForUser } from "@/server/billing";
import { getPaymentProvider } from "@/server/providers/payments/instance";

export const metadata: Metadata = { title: "Billing", robots: { index: false, follow: false } };

const dateFormat = new Intl.DateTimeFormat("en", { dateStyle: "long" });

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ sku?: string; checkout?: string }>;
}) {
  const { sku, checkout } = await searchParams;

  const session = await auth();
  if (!session?.user?.id) {
    const back = isSku(sku) ? `/billing?sku=${sku}` : "/billing";
    redirect(`/signin?callbackUrl=${encodeURIComponent(back)}`);
  }

  const userId = session.user.id;
  const [entitlements, billing] = await Promise.all([
    getEntitlementsForUser(userId),
    billingService.getBilling(userId),
  ]);
  const providerReady = getPaymentProvider() !== null;
  const manageUrl = billing.subscriptions.find((s) => s.manageUrl)?.manageUrl ?? null;
  const defaultSku: Sku = isSku(sku) ? sku : "pro_yearly";
  const studentDiscount =
    isStudentEmail(session.user.email ?? "") && Boolean(env.STUDENT_DISCOUNT_CODE);

  let summary = "You are on the free plan: 1 resume, 2 templates and a watermarked PDF.";
  if (entitlements.plan === "pro") {
    const until = entitlements.activeUntil ? dateFormat.format(entitlements.activeUntil) : null;
    if (entitlements.source === "dev") summary = "Pro is unlocked for development.";
    else if (entitlements.source === "pass")
      summary = `Your job-hunt pass is active${until ? ` until ${until}` : ""}.`;
    else {
      const sub = billing.subscriptions.find((s) => s.currentPeriodEnd);
      summary = sub?.cancelAtPeriodEnd
        ? `Your Pro plan is cancelled and stays active${until ? ` until ${until}` : ""}.`
        : `Your Pro plan is active${until ? " and renews on " + until : ""}.`;
    }
  }

  return (
    <>
      <AppHeader email={session.user.email} />
      <div className="mx-auto flex max-w-2xl flex-col gap-10 px-5 py-12">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-3xl font-bold tracking-tight">Billing</h1>
          <Badge variant={entitlements.plan === "pro" ? "primary" : "default"}>
            {entitlements.plan === "pro" ? "Pro" : "Free"}
          </Badge>
        </div>

        {checkout === "success" && (
          <p role="status" className="rounded-xl border-2 border-success bg-card p-5 text-sm">
            Thank you! Your payment went through. Your plan updates within a minute. If it still
            shows Free, refresh this page.
          </p>
        )}

        <section
          aria-labelledby="current-plan"
          className="flex flex-col gap-3 rounded-xl border bg-card p-6"
        >
          <h2 id="current-plan" className="font-display text-lg font-semibold">
            Your plan
          </h2>
          <p className="text-muted-foreground">{summary}</p>
          {manageUrl && (
            <Button asChild variant="outline" size="sm" className="self-start">
              <a href={manageUrl} target="_blank" rel="noopener noreferrer">
                Manage subscription
              </a>
            </Button>
          )}
        </section>

        {entitlements.source !== "subscription" && entitlements.source !== "dev" && (
          <section aria-labelledby="upgrade" className="flex flex-col gap-5">
            <h2 id="upgrade" className="font-display text-2xl font-bold tracking-tight">
              {entitlements.plan === "pro" ? "Add more time" : "Upgrade to Pro"}
            </h2>
            {providerReady ? (
              <CheckoutForm
                defaultSku={defaultSku}
                studentDiscount={studentDiscount}
                studentPercent={STUDENT_DISCOUNT_PERCENT}
              />
            ) : (
              <div className="flex flex-col gap-2 rounded-xl border bg-card p-5 text-sm">
                <p>Payments are not available yet. Please check back soon.</p>
                {process.env.NODE_ENV === "development" && (
                  <p className="text-muted-foreground">
                    Developer note: set the LEMONSQUEEZY_* variables. See docs/billing.md.
                  </p>
                )}
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              Compare what is included on the{" "}
              <Link href="/pricing" className="font-medium underline">
                pricing page
              </Link>
              .
            </p>
          </section>
        )}
      </div>
    </>
  );
}
