export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

/** Async so a shared store (Upstash Redis) can replace the in-memory one without changing callers. */
export interface RateLimiter {
  check(key: string): Promise<RateLimitResult>;
}

/** Fixed-window limiter held in this process's memory. Good for development and a single server. */
export function createMemoryRateLimiter(options: {
  limit: number;
  windowMs: number;
  now?: () => number;
}): RateLimiter {
  const now = options.now ?? (() => Date.now());
  const windows = new Map<string, { start: number; count: number }>();

  return {
    async check(key) {
      const t = now();
      for (const [k, w] of windows) if (t - w.start >= options.windowMs) windows.delete(k);

      const current = windows.get(key);
      if (!current) {
        windows.set(key, { start: t, count: 1 });
        return { allowed: true, remaining: options.limit - 1, retryAfterSeconds: 0 };
      }
      if (current.count >= options.limit) {
        const retryAfterSeconds = Math.max(
          1,
          Math.ceil((current.start + options.windowMs - t) / 1000),
        );
        return { allowed: false, remaining: 0, retryAfterSeconds };
      }
      current.count += 1;
      return { allowed: true, remaining: options.limit - current.count, retryAfterSeconds: 0 };
    },
  };
}
