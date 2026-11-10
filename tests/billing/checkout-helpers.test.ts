import { describe, expect, it } from "vitest";
import { isSku, OPTION_BY_SKU, SKU_BY_OPTION, SKUS } from "@/config/plans";
import {
  isInvalidDiscountInput,
  isStudentEmail,
  sanitizeDiscountCode,
} from "@/features/billing/checkout";

describe("isStudentEmail", () => {
  it("recognises academic addresses in many countries", () => {
    for (const email of [
      "a@mit.edu",
      "a@student.nust.edu.pk",
      "a@ox.ac.uk",
      "a@unimelb.edu.au",
      "A@IIT.AC.IN",
    ]) {
      expect(isStudentEmail(email)).toBe(true);
    }
  });

  it("rejects everything else", () => {
    for (const email of [
      "a@gmail.com",
      "a@edu.com",
      "a@education.org",
      "a@fake.edu.example",
      "not-an-email",
      "",
    ]) {
      expect(isStudentEmail(email)).toBe(false);
    }
  });
});

describe("discount codes", () => {
  it("accepts simple codes and trims spaces", () => {
    expect(sanitizeDiscountCode(" STUDENT-30 ")).toBe("STUDENT-30");
    expect(sanitizeDiscountCode("job_hunt25")).toBe("job_hunt25");
  });

  it("rejects empty, odd or oversized input", () => {
    for (const bad of ["", "   ", "has space", "<script>", "a".repeat(41), null, 5]) {
      expect(sanitizeDiscountCode(bad)).toBeNull();
    }
  });

  it("tells a typed bad code apart from nothing typed", () => {
    expect(isInvalidDiscountInput("")).toBe(false);
    expect(isInvalidDiscountInput(undefined)).toBe(false);
    expect(isInvalidDiscountInput("bad code!")).toBe(true);
    expect(isInvalidDiscountInput("GOOD10")).toBe(false);
  });
});

describe("SKUs", () => {
  it("validates and maps both ways", () => {
    expect(isSku("pro_yearly")).toBe(true);
    expect(isSku("pro_forever")).toBe(false);
    expect(isSku(undefined)).toBe(false);
    for (const sku of SKUS) expect(SKU_BY_OPTION[OPTION_BY_SKU[sku]]).toBe(sku);
  });
});
