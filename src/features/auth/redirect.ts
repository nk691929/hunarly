/**
 * Only allow redirects to paths on this site. Blocks open redirects such as
 * "//evil.com", "https://evil.com" and "/\evil.com".
 */
export function safeRedirect(value: unknown, fallback = "/dashboard"): string {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;
  return value;
}
