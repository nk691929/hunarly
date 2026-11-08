import { describe, expect, it } from "vitest";
import { createSemaphore } from "@/server/concurrency";
import { resolveEntitlements } from "@/server/entitlements";
import { createMemoryRateLimiter } from "@/server/rate-limit";

describe("memory rate limiter", () => {
  it("allows up to the limit, then blocks with a retry time", async () => {
    let now = 1_000;
    const limiter = createMemoryRateLimiter({ limit: 2, windowMs: 60_000, now: () => now });
    expect((await limiter.check("a")).allowed).toBe(true);
    expect((await limiter.check("a")).remaining).toBe(0);
    now += 10_000;
    const blocked = await limiter.check("a");
    expect(blocked).toMatchObject({ allowed: false, retryAfterSeconds: 50 });
  });

  it("tracks each key separately and resets after the window", async () => {
    let now = 0;
    const limiter = createMemoryRateLimiter({ limit: 1, windowMs: 1_000, now: () => now });
    expect((await limiter.check("a")).allowed).toBe(true);
    expect((await limiter.check("b")).allowed).toBe(true);
    expect((await limiter.check("a")).allowed).toBe(false);
    now += 1_000;
    expect((await limiter.check("a")).allowed).toBe(true);
  });
});

describe("semaphore", () => {
  it("refuses work beyond the limit and frees a slot on release", () => {
    const sem = createSemaphore(2);
    const a = sem.tryAcquire();
    const b = sem.tryAcquire();
    expect(a && b).toBeTruthy();
    expect(sem.tryAcquire()).toBeNull();
    a!();
    expect(sem.active).toBe(1);
    expect(sem.tryAcquire()).not.toBeNull();
  });

  it("ignores a second release of the same slot", () => {
    const sem = createSemaphore(1);
    const release = sem.tryAcquire()!;
    release();
    release();
    expect(sem.active).toBe(0);
  });
});

describe("entitlements", () => {
  it("watermarks free exports", () => {
    expect(
      resolveEntitlements({ userId: null, devProUnlock: false, isDevelopment: false }),
    ).toEqual({
      plan: "free",
      pdfWatermark: true,
    });
  });

  it("lets development builds unlock Pro, but never production", () => {
    expect(
      resolveEntitlements({ userId: "u", devProUnlock: true, isDevelopment: true }).pdfWatermark,
    ).toBe(false);
    expect(
      resolveEntitlements({ userId: "u", devProUnlock: true, isDevelopment: false }).pdfWatermark,
    ).toBe(true);
  });
});
