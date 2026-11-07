import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PricingTable } from "@/features/billing/components/pricing-table";

describe("PricingTable", () => {
  it("shows the yearly USD price by default", () => {
    render(<PricingTable />);
    expect(screen.getByText("$59")).toBeInTheDocument();
  });

  it("switches currency and billing option", () => {
    render(<PricingTable />);
    fireEvent.change(screen.getByLabelText("Currency"), { target: { value: "PKR" } });
    expect(screen.getByText(/PKR\s*15,999/)).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Monthly"));
    expect(screen.getByText(/PKR\s*2,499/)).toBeInTheDocument();
  });
});
