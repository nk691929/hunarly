/**
 * Academic email addresses: *.edu, *.edu.xx (for example nust.edu.pk) and *.ac.xx (ox.ac.uk).
 * This is a convenience check, not proof of enrolment. The discount code itself limits the damage.
 */
export function isStudentEmail(email: string): boolean {
  const domain = email.trim().toLowerCase().split("@")[1];
  if (!domain) return false;
  return /(^|\.)edu(\.[a-z]{2})?$/.test(domain) || /(^|\.)ac\.[a-z]{2}$/.test(domain);
}

/** A discount code the person typed: letters, digits, dash and underscore only. Null when empty or invalid. */
export function sanitizeDiscountCode(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const code = input.trim();
  return /^[A-Za-z0-9_-]{1,40}$/.test(code) ? code : null;
}

/** True when something was typed but it is not a usable code (so we can say so). */
export function isInvalidDiscountInput(input: unknown): boolean {
  return typeof input === "string" && input.trim() !== "" && sanitizeDiscountCode(input) === null;
}
