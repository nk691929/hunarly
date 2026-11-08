import type { ResumeDocument } from "@/features/resume-builder/schema";

/** A file name that is safe on every system: lowercase ASCII, or "resume.pdf" when nothing is left. */
export function pdfFileName(doc: ResumeDocument): string {
  const base = doc.profile.fullName.trim() || doc.title.trim();
  const slug = base
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug ? `${slug}-resume.pdf` : "resume.pdf";
}

/** Read the file name from a Content-Disposition header; never trust it to be a path. */
export function filenameFromDisposition(header: string | null): string {
  const match = header ? /filename="?([^";]+)"?/i.exec(header) : null;
  const name = match?.[1]?.replace(/[\\/]/g, "").trim();
  return name && name.toLowerCase().endsWith(".pdf") ? name : "resume.pdf";
}

/** A message when the resume is not ready to export, or null when it is. */
export function exportBlockedReason(doc: ResumeDocument): string | null {
  if (!doc.profile.fullName.trim()) return "Add your full name in Basics before downloading.";
  return null;
}
