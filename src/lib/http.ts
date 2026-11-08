/**
 * Browsers send an Origin header on cross-site and same-site POSTs. Reject requests that name a
 * different origin than this site. A missing header (curl, server-to-server) is allowed.
 */
export function isSameOrigin(originHeader: string | null, siteUrl: string): boolean {
  if (!originHeader) return true;
  try {
    return new URL(originHeader).origin === new URL(siteUrl).origin;
  } catch {
    return false;
  }
}

/** Who a rate limit applies to: the signed-in user, otherwise the caller's IP address (best effort). */
export function clientKey(headers: Pick<Headers, "get">, userId: string | null): string {
  if (userId) return `user:${userId}`;
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return `ip:${forwarded || headers.get("x-real-ip") || "unknown"}`;
}
