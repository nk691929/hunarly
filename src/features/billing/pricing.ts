import { PRO_PRICES, type BillingOption, type Currency } from "@/config/plans";

/** Format an amount for display, e.g. "$9", "$4.92", "PKR 2,499". */
export function formatPrice(amount: number, currency: Currency): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function getProPrice(option: BillingOption, currency: Currency): number {
  return PRO_PRICES[option][currency];
}

/** Per-month cost of a yearly price. PKR is rounded to whole rupees. */
export function monthlyEquivalent(yearlyPrice: number, currency: Currency): number {
  const raw = yearlyPrice / 12;
  return currency === "PKR" ? Math.round(raw) : Math.round(raw * 100) / 100;
}

/** How much cheaper the yearly plan is than paying monthly for 12 months, as a whole percent. */
export function yearlySavingsPercent(currency: Currency): number {
  const monthly = getProPrice("monthly", currency);
  const yearly = getProPrice("yearly", currency);
  return Math.round((1 - yearly / (monthly * 12)) * 100);
}
