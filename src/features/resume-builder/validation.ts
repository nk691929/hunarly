import type { z } from "zod";

/** Flatten Zod issues to { "email": "message", "links.0.url": "message" }. First message per field wins. */
export function validateWith(schema: z.ZodType, value: unknown): Record<string, string> {
  const result = schema.safeParse(value);
  if (result.success) return {};
  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = issue.path.map(String).join(".");
    if (!(key in errors)) errors[key] = issue.message;
  }
  return errors;
}
