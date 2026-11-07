import { describe, expect, it } from "vitest";
import { BILLING_OPTIONS, CURRENCIES, PRO_PRICES } from "@/config/plans";
import {
  formatPrice,
  getProPrice,
  monthlyEquivalent,
  yearlySavingsPercent,
} from "@/features/billing/pricing";

describe("formatPrice", () => {
  it("drops decimals for whole amounts and keeps two for fractions", () => {
    expect(formatPrice(9, "USD")).toBe("$9");
    expect(formatPrice(4.92, "USD")).toBe("$4.92");
  });

  it("formats rupees with the PKR code", () => {
    expect(formatPrice(2499, "PKR")).toMatch(/PKR\s*2,499/);
  });
});

describe("monthlyEquivalent", () => {
  it("divides the yearly price by 12 and rounds to cents", () => {
    expect(monthlyEquivalent(59, "USD")).toBe(4.92);
  });

  it("rounds PKR to whole rupees", () => {
    expect(monthlyEquivalent(15999, "PKR")).toBe(1333);
  });
});

describe("price table integrity", () => {
  it("has a positive price for every billing option and currency", () => {
    for (const option of BILLING_OPTIONS) {
      for (const currency of CURRENCIES) {
        expect(getProPrice(option.id, currency)).toBeGreaterThan(0);
      }
    }
  });

  it("makes yearly cheaper than 12 months of monthly, with sensible savings", () => {
    for (const currency of CURRENCIES) {
      expect(PRO_PRICES.yearly[currency]).toBeLessThan(PRO_PRICES.monthly[currency] * 12);
      const savings = yearlySavingsPercent(currency);
      expect(savings).toBeGreaterThan(10);
      expect(savings).toBeLessThan(70);
    }
  });
});
