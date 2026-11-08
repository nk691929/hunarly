// @vitest-environment node
import { beforeAll, describe, expect, it } from "vitest";
import { createSampleDocument } from "@/features/resume-builder/defaults";
import { templates } from "@/features/templates/registry";
import { extractPdfText, firstOutOfOrder } from "../helpers/pdf-text";

/**
 * The real ATS check: render each template to a PDF, read the text back the way hiring software
 * does, and verify the order. Skipped unless you opt in, because it needs the app running and
 * Chromium installed:
 *
 *   terminal 1:  pnpm dev
 *   terminal 2:  $env:RUN_PDF_TESTS="1"; pnpm vitest run tests/pdf
 */
const enabled = process.env.RUN_PDF_TESTS === "1";
const baseUrl =
  process.env.PDF_BASE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const ORDER = [
  "Maya Johnson",
  "Summary",
  "Education",
  "Projects",
  "Experience",
  "Skills",
  "Certifications",
  "Languages",
];

async function render(templateId: string, watermark: boolean) {
  const { createPlaywrightPdfRenderer } = await import("@/server/providers/pdf/playwright");
  const template = templates.find((t) => t.id === templateId)!;
  const document = { ...createSampleDocument(), templateId, style: template.defaultStyle };
  return createPlaywrightPdfRenderer({ baseUrl }).render({ document, watermark });
}

describe.skipIf(!enabled)("PDF export (needs the app running and Chromium installed)", () => {
  beforeAll(async () => {
    try {
      await fetch(`${baseUrl}/print`);
    } catch {
      throw new Error(
        `Cannot reach ${baseUrl}. Start the app with "pnpm dev" in another terminal first.`,
      );
    }
  });
  it("produces a real PDF file", async () => {
    const pdf = await render("ats-classic", false);
    expect(Buffer.from(pdf.slice(0, 5)).toString()).toBe("%PDF-");
  }, 60_000);

  it.each(templates.map((t) => [t.name, t.id] as const))(
    "%s: text is selectable and reads in the right order",
    async (_name, id) => {
      const { text, pages } = await extractPdfText(await render(id, false));
      expect(text.length).toBeGreaterThan(200);
      expect(firstOutOfOrder(text, ORDER)).toBeNull();
      expect(text).toContain("campus energy dashboard");
      expect(text).toContain("data analyst intern");
      expect(text).toContain("cleaned and merged 18 months");
      expect(text).not.toContain("skip to content");
      expect(pages.length).toBeLessThanOrEqual(2);
    },
    60_000,
  );

  it("adds the footer on free exports and leaves it off otherwise", async () => {
    const free = await extractPdfText(await render("ats-classic", true));
    const pro = await extractPdfText(await render("ats-classic", false));
    expect(free.text).toContain("made with hunarly");
    expect(pro.text).not.toContain("made with hunarly");
  }, 120_000);
});
