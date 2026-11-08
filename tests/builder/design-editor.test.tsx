import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { DesignEditor } from "@/features/resume-builder/components/design-editor";
import { resetResumeStore, useResumeStore } from "@/features/resume-builder/store";
import { getTemplate } from "@/features/templates/registry";

const doc = () => useResumeStore.getState().history.present;

describe("DesignEditor", () => {
  beforeEach(() => resetResumeStore());

  it("switches template and takes on its default look", () => {
    render(<DesignEditor />);
    fireEvent.click(screen.getByRole("radio", { name: "Executive" }));
    expect(doc().templateId).toBe("executive");
    expect(doc().style).toEqual(getTemplate("executive").defaultStyle);
  });

  it("undoes a template switch back to the previous look", () => {
    render(<DesignEditor />);
    const before = doc().style;
    fireEvent.click(screen.getByRole("radio", { name: "Executive" }));
    act(() => useResumeStore.getState().undo());
    expect(doc().templateId).toBe("ats-classic");
    expect(doc().style).toEqual(before);
  });

  it("changes accent, font and spacing", () => {
    render(<DesignEditor />);
    fireEvent.click(screen.getByRole("radio", { name: "Crimson" }));
    expect(doc().style.accent).toBe("#B3261E");
    fireEvent.click(screen.getByRole("radio", { name: "Serif" }));
    expect(doc().style.font).toBe("serif");
    fireEvent.click(screen.getByRole("radio", { name: "Compact" }));
    expect(doc().style.spacing).toBe("compact");
  });

  it("warns when a custom color is too light", () => {
    render(<DesignEditor />);
    expect(screen.queryByText(/hard to read/)).toBeNull();
    fireEvent.change(screen.getByLabelText("Custom accent color"), {
      target: { value: "#ffff00" },
    });
    expect(screen.getByText(/hard to read/)).toBeInTheDocument();
  });
});
