import { describe, expect, it } from "vitest";
import { safeRedirect } from "@/features/auth/redirect";
import { resolveAuthStatus } from "@/features/auth/status";

const base = { NODE_ENV: "production" };

describe("resolveAuthStatus", () => {
  it("is off with no configuration (guest mode)", () => {
    expect(resolveAuthStatus(base)).toEqual({
      configured: false,
      google: false,
      email: false,
      emailTransport: null,
    });
  });

  it("needs both a database and a secret", () => {
    const google = { AUTH_GOOGLE_ID: "id", AUTH_GOOGLE_SECRET: "secret" };
    expect(
      resolveAuthStatus({ ...base, ...google, DATABASE_URL: "postgresql://x" }).configured,
    ).toBe(false);
    expect(resolveAuthStatus({ ...base, ...google, AUTH_SECRET: "s".repeat(32) }).configured).toBe(
      false,
    );
  });

  it("turns on Google when the database, secret and Google keys are set", () => {
    const status = resolveAuthStatus({
      ...base,
      DATABASE_URL: "postgresql://x",
      AUTH_SECRET: "s".repeat(32),
      AUTH_GOOGLE_ID: "id",
      AUTH_GOOGLE_SECRET: "secret",
    });
    expect(status).toMatchObject({ configured: true, google: true, email: false });
  });

  it("uses Resend for email links when the key and sender are set", () => {
    const status = resolveAuthStatus({
      ...base,
      DATABASE_URL: "postgresql://x",
      AUTH_SECRET: "s".repeat(32),
      RESEND_API_KEY: "re_x",
      EMAIL_FROM: "Hunarly <a@b.co>",
    });
    expect(status).toMatchObject({ configured: true, email: true, emailTransport: "resend" });
  });

  it("prints email links to the terminal in development, but never in production", () => {
    const dev = resolveAuthStatus({
      NODE_ENV: "development",
      DATABASE_URL: "postgresql://x",
      AUTH_SECRET: "s".repeat(32),
    });
    expect(dev).toMatchObject({ configured: true, email: true, emailTransport: "console" });
    const prod = resolveAuthStatus({
      ...base,
      DATABASE_URL: "postgresql://x",
      AUTH_SECRET: "s".repeat(32),
    });
    expect(prod.configured).toBe(false);
  });
});

describe("safeRedirect", () => {
  it("allows paths on this site", () => {
    expect(safeRedirect("/dashboard")).toBe("/dashboard");
    expect(safeRedirect("/builder/abc?x=1")).toBe("/builder/abc?x=1");
  });

  it("falls back for anything that could leave the site", () => {
    for (const bad of [
      "https://evil.com",
      "//evil.com",
      "/\\evil.com",
      "javascript:alert(1)",
      "dashboard",
      "",
      null,
      42,
    ]) {
      expect(safeRedirect(bad)).toBe("/dashboard");
    }
    expect(safeRedirect("//evil.com", "/")).toBe("/");
  });
});
