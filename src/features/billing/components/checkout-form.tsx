"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OPTION_BY_SKU, PASS_DAYS, PRO_PRICES, SKU_LABELS, SKUS, type Sku } from "@/config/plans";
import { startCheckoutAction } from "@/features/billing/actions";
import { formatPrice } from "@/features/billing/pricing";

const SUFFIX: Record<Sku, string> = {
  pro_monthly: "per month",
  pro_yearly: "per year",
  job_hunt_pass: `one-time, ${PASS_DAYS} days`,
};

export function CheckoutForm({
  defaultSku,
  studentPercent,
  studentDiscount,
}: {
  defaultSku: Sku;
  studentPercent: number;
  studentDiscount: boolean;
}) {
  const [sku, setSku] = useState<Sku>(defaultSku);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        startTransition(async () => {
          const result = await startCheckoutAction({ sku, discountCode: code });
          if (result.ok) window.location.assign(result.url);
          else setError(result.error);
        });
      }}
    >
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 text-sm font-medium">Choose a plan</legend>
        {SKUS.map((s) => (
          <label key={s} className="cursor-pointer">
            <input
              type="radio"
              name="sku"
              value={s}
              checked={sku === s}
              onChange={() => setSku(s)}
              className="peer sr-only"
            />
            <span className="flex items-center justify-between gap-4 rounded-lg border bg-card p-4 peer-checked:border-primary peer-checked:ring-2 peer-checked:ring-primary peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring">
              <span className="font-medium">{SKU_LABELS[s]}</span>
              <span className="text-right">
                <span className="font-display text-xl font-bold">
                  {formatPrice(PRO_PRICES[OPTION_BY_SKU[s]].USD, "USD")}
                </span>
                <span className="block text-xs text-muted-foreground">{SUFFIX[s]}</span>
              </span>
            </span>
          </label>
        ))}
        <p className="text-xs text-muted-foreground">
          Prices are in US dollars. At checkout you may see your local currency, and local taxes are
          added where required.
        </p>
      </fieldset>

      <div className="flex max-w-sm flex-col gap-2">
        <Label htmlFor="discount">Discount code (optional)</Label>
        <Input
          id="discount"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          autoComplete="off"
          maxLength={40}
        />
        {studentDiscount && code.trim() === "" && (
          <p className="text-xs text-success">
            Student discount: {studentPercent}% off is applied automatically at checkout.
          </p>
        )}
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <Button type="submit" size="lg" disabled={pending} className="self-start">
        {pending ? "Opening checkout..." : "Continue to checkout"}
      </Button>
    </form>
  );
}
