import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { BasicsEditor } from "@/features/resume-builder/components/basics-editor";
import { resetResumeStore, useResumeStore } from "@/features/resume-builder/store";

describe("BasicsEditor", () => {
  beforeEach(() => resetResumeStore());

  it("writes typed values to the store", () => {
    render(<BasicsEditor />);
    fireEvent.change(screen.getByLabelText("Full name"), { target: { value: "Ayesha Khan" } });
    expect(useResumeStore.getState().history.present.profile.fullName).toBe("Ayesha Khan");
  });

  it("shows an email error only after the field loses focus", () => {
    render(<BasicsEditor />);
    const email = screen.getByLabelText("Email");
    fireEvent.change(email, { target: { value: "nope" } });
    expect(screen.queryByText("Enter a valid email address")).toBeNull();
    fireEvent.blur(email);
    expect(screen.getByText("Enter a valid email address")).toBeInTheDocument();
  });

  it("adds and removes links", () => {
    render(<BasicsEditor />);
    fireEvent.click(screen.getByRole("button", { name: "Add link" }));
    expect(useResumeStore.getState().history.present.profile.links).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: /Remove link/ }));
    expect(useResumeStore.getState().history.present.profile.links).toHaveLength(0);
  });

  it("shows time zone and availability fields in remote mode", () => {
    render(<BasicsEditor />);
    expect(screen.queryByLabelText("Time zone")).toBeNull();
    act(() => {
      useResumeStore.getState().setMode("remote");
    });
    expect(screen.getByLabelText("Time zone")).toBeInTheDocument();
  });
});
