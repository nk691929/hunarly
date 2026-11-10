/**
 * Plans and prices. Display prices are set by hand per currency (no live FX).
 * Entitlements and server-side enforcement are added in M7; keep limits here.
 */
export const CURRENCIES = ["USD", "EUR", "GBP", "PKR"] as const;
export type Currency = (typeof CURRENCIES)[number];

export const CURRENCY_LABELS: Record<Currency, string> = {
  USD: "US dollar (USD)",
  EUR: "Euro (EUR)",
  GBP: "British pound (GBP)",
  PKR: "Pakistani rupee (PKR)",
};

export type BillingOption = "monthly" | "yearly" | "pass";

export const BILLING_OPTIONS: { id: BillingOption; label: string }[] = [
  { id: "monthly", label: "Monthly" },
  { id: "yearly", label: "Yearly" },
  { id: "pass", label: "Job-hunt pass" },
];

/** Length of the one-time job-hunt pass. */
export const PASS_DAYS = 60;

export const STUDENT_DISCOUNT_PERCENT = 30;

export const PRO_PRICES: Record<BillingOption, Record<Currency, number>> = {
  monthly: { USD: 9, EUR: 9, GBP: 8, PKR: 2499 },
  yearly: { USD: 59, EUR: 55, GBP: 49, PKR: 15999 },
  pass: { USD: 19, EUR: 18, GBP: 16, PKR: 4999 },
};

export const FREE_FEATURES = [
  "1 resume",
  "2 templates",
  "Text-selectable PDF export with a small watermark",
  "Guided tips and example text for every section",
  "ATS score checker",
] as const;

export const PRO_FEATURES = [
  "Unlimited resumes",
  "All 6 templates with full color, font and spacing control",
  "PDF and DOCX export without a watermark",
  "AI summary and bullet-point writer",
  "ATS keyword match against a job description",
  "Cover letter builder",
  "Shareable resume link with view analytics",
  "Priority support",
] as const;

export type Plan = "free" | "pro";

/** What can be bought. Each maps to a product variant in the payment provider's dashboard. */
export const SKUS = ["pro_monthly", "pro_yearly", "job_hunt_pass"] as const;
export type Sku = (typeof SKUS)[number];

export const SKU_BY_OPTION: Record<BillingOption, Sku> = {
  monthly: "pro_monthly",
  yearly: "pro_yearly",
  pass: "job_hunt_pass",
};

export const OPTION_BY_SKU: Record<Sku, BillingOption> = {
  pro_monthly: "monthly",
  pro_yearly: "yearly",
  job_hunt_pass: "pass",
};

export const SKU_LABELS: Record<Sku, string> = {
  pro_monthly: "Pro, monthly",
  pro_yearly: "Pro, yearly",
  job_hunt_pass: `Job-hunt pass (${PASS_DAYS} days)`,
};

export function isSku(value: unknown): value is Sku {
  return typeof value === "string" && (SKUS as readonly string[]).includes(value);
}

/** Free plan limits. Enforced on the server (see src/server/billing and src/server/resumes). */
export const FREE_MAX_RESUMES = 1;
