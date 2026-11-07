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
