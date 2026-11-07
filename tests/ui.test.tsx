import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LogoMark } from "@/components/brand/logo-mark";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders its label and respects disabled", () => {
    render(<Button disabled>Export</Button>);
    expect(screen.getByRole("button", { name: "Export" })).toBeDisabled();
  });

  it("renders the child element when asChild is set", () => {
    render(
      <Button asChild>
        <a href="/pricing">Pricing</a>
      </Button>,
    );
    expect(screen.getByRole("link", { name: "Pricing" })).toHaveAttribute("href", "/pricing");
  });
});

describe("Badge", () => {
  it("renders text", () => {
    render(<Badge>Pro</Badge>);
    expect(screen.getByText("Pro")).toBeInTheDocument();
  });
});

describe("LogoMark", () => {
  it("is hidden from assistive tech (decorative next to the wordmark)", () => {
    const { container } = render(<LogoMark />);
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });
});
