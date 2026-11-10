import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import type { Plan } from "@/config/plans";
import { DesignEditor } from "@/features/resume-builder/components/design-editor";
import { PlanProvider } from "@/features/resume-builder/plan-context";
import { resetResumeStore, useResumeStore } from "@/features/resume-builder/store";
import { getTemplate } from "@/features/templates/registry";

const doc = () => useResumeStore.getState().history.present;
const renderWith = (plan: Plan) =>
  render(
    <PlanProvider value={plan}>
      <DesignEditor />
    </PlanProvider>,
  );

describe("DesignEditor on Pro", () => {
  beforeEach(() => resetResumeStore());

  it("switches template and takes on its default look", () => {
    renderWith("pro");
    fireEvent.click(screen.getByRole("radio", { name: "Executive" }));
    expect(doc().templateId).toBe("executive");
    expect(doc().style).toEqual(getTemplate("executive").defaultStyle);
  });

  it("undoes a template switch back to the previous look", () => {
    renderWith("pro");
    const before = doc().style;
    fireEvent.click(screen.getByRole("radio", { name: "Executive" }));
    act(() => useResumeStore.getState().undo());
    expect(doc().templateId).toBe("ats-classic");
    expect(doc().style).toEqual(before);
  });

  it("changes accent, font and spacing", () => {
    renderWith("pro");
    fireEvent.click(screen.getByRole("radio", { name: "Crimson" }));
    expect(doc().style.accent).toBe("#B3261E");
    fireEvent.click(screen.getByRole("radio", { name: "Serif" }));
    expect(doc().style.font).toBe("serif");
    fireEvent.click(screen.getByRole("radio", { name: "Compact" }));
    expect(doc().style.spacing).toBe("compact");
  });

  it("warns when a custom color is too light", () => {
    renderWith("pro");
    expect(screen.queryByText(/hard to read/)).toBeNull();
    fireEvent.change(screen.getByLabelText("Custom accent color"), {
      target: { value: "#ffff00" },
    });
    expect(screen.getByText(/hard to read/)).toBeInTheDocument();
  });

  it("does not show upgrade prompts", () => {
    renderWith("pro");
    expect(screen.queryByText(/need an upgrade/)).toBeNull();
  });
});

describe("DesignEditor on the free plan", () => {
  beforeEach(() => resetResumeStore());

  it("locks Pro templates and keeps free ones available", () => {
    renderWith("free");
    for (const name of ["Modern", "Minimal", "Executive", "Remote / Tech"]) {
      expect(screen.getByRole("radio", { name: `${name} (Pro)` })).toBeDisabled();
    }
    expect(screen.getByRole("radio", { name: "ATS Classic" })).toBeEnabled();
    expect(screen.getByRole("radio", { name: "Fresher-Friendly" })).toBeEnabled();
  });

  it("points to the plans and lets a free template be chosen", () => {
    renderWith("free");
    expect(screen.getByRole("link", { name: "See plans" })).toHaveAttribute("href", "/pricing");
    fireEvent.click(screen.getByRole("radio", { name: "Fresher-Friendly" }));
    expect(doc().templateId).toBe("fresher-friendly");
  });

  it("explains when a resume already uses a Pro template", () => {
    act(() =>
      useResumeStore.getState().applyTemplate("executive", getTemplate("executive").defaultStyle),
    );
    renderWith("free");
    expect(screen.getByText(/uses a Pro template/)).toBeInTheDocument();
  });
});
