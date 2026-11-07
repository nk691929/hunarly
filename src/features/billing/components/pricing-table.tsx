"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  BILLING_OPTIONS,
  CURRENCIES,
  CURRENCY_LABELS,
  FREE_FEATURES,
  PASS_DAYS,
  PRO_FEATURES,
  STUDENT_DISCOUNT_PERCENT,
  type BillingOption,
  type Currency,
} from "@/config/plans";
import { cn } from "@/lib/utils";
import {
  formatPrice,
  getProPrice,
  monthlyEquivalent,
  yearlySavingsPercent,
} from "@/features/billing/pricing";

function FeatureList({ items }: { items: readonly string[] }) {
  return (
    <ul className="flex flex-col gap-3 text-sm">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function PricingTable() {
  const [currency, setCurrency] = useState<Currency>("USD");
  const [option, setOption] = useState<BillingOption>("yearly");

  const price = getProPrice(option, currency);
  const suffix =
    option === "monthly"
      ? "per month"
      : option === "yearly"
        ? "per year"
        : `one-time, ${PASS_DAYS} days of Pro`;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <fieldset className="flex rounded-lg border bg-card p-1">
          <legend className="sr-only">Billing option</legend>
          {BILLING_OPTIONS.map((o) => (
            <label key={o.id} className="cursor-pointer">
              <input
                type="radio"
                name="billing"
                value={o.id}
                checked={option === o.id}
                onChange={() => setOption(o.id)}
                className="peer sr-only"
              />
              <span className="block rounded-md px-4 py-2 text-sm font-medium transition-colors peer-checked:bg-primary peer-checked:text-primary-foreground peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring">
                {o.label}
              </span>
            </label>
          ))}
        </fieldset>

        <div className="flex items-center gap-3">
          <label htmlFor="currency" className="text-sm text-muted-foreground">
            Currency
          </label>
          <select
            id="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value as Currency)}
            className="h-10 rounded-lg border border-input bg-card px-3 text-sm"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {CURRENCY_LABELS[c]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section
          aria-labelledby="plan-free"
          className="flex flex-col gap-6 rounded-xl border bg-card p-8"
        >
          <div>
            <h3 id="plan-free" className="font-display text-xl font-semibold">
              Free
            </h3>
            <p className="mt-4 font-display text-5xl font-bold tracking-tight">
              {formatPrice(0, currency)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">free forever</p>
          </div>
          <FeatureList items={FREE_FEATURES} />
          <Button asChild variant="outline" size="lg" className="mt-auto">
            <Link href="/builder">Start free</Link>
          </Button>
        </section>

        <section
          aria-labelledby="plan-pro"
          className={cn("flex flex-col gap-6 rounded-xl border-2 border-primary bg-card p-8")}
        >
          <div>
            <h3 id="plan-pro" className="font-display text-xl font-semibold">
              Pro
            </h3>
            <p className="mt-4 font-display text-5xl font-bold tracking-tight">
              {formatPrice(price, currency)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{suffix}</p>
            {option === "yearly" && (
              <p className="mt-2 text-sm text-success">
                {formatPrice(monthlyEquivalent(price, currency), currency)} per month,{" "}
                {yearlySavingsPercent(currency)}% less than paying monthly
              </p>
            )}
          </div>
          <FeatureList items={PRO_FEATURES} />
          <Button asChild size="lg" className="mt-auto">
            <Link href={`/builder?plan=pro-${option}`}>Get Pro</Link>
          </Button>
        </section>
      </div>

      <p className="text-sm text-muted-foreground">
        Students get {STUDENT_DISCOUNT_PERCENT}% off with a university email or student ID. Apply it
        at checkout. Local taxes are added at checkout where required.
      </p>
    </div>
  );
}
