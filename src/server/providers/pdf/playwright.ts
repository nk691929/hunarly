import { chromium, type Browser } from "playwright";
import { PdfRenderError, type PdfRenderer } from "@/server/providers/pdf";
import type { PrintPayload } from "@/types/print";

/**
 * Renders the app's own /print page in headless Chromium, so the PDF uses the exact same template
 * code, fonts and CSS as the preview, and the text stays real and selectable.
 *
 * Safety: the base URL comes from configuration, never from the request, and the browser may only
 * load files from that origin.
 */
export function createPlaywrightPdfRenderer(options: {
  baseUrl: string;
  timeoutMs?: number;
}): PdfRenderer {
  const origin = new URL(options.baseUrl).origin;
  const timeout = options.timeoutMs ?? 30_000;

  return {
    async render({ document: resume, watermark }) {
      let browser: Browser;
      try {
        browser = await chromium.launch();
      } catch {
        throw new PdfRenderError(
          "unavailable",
          "Chromium could not start. Install it with: pnpm exec playwright install chromium",
        );
      }

      try {
        const context = await browser.newContext({ viewport: { width: 794, height: 1123 } });
        const payload: PrintPayload = { document: resume, watermark };
        await context.addInitScript((data: PrintPayload) => {
          window.__HUNARLY_PRINT__ = data;
        }, payload);
        await context.route("**/*", (route) => {
          const url = route.request().url();
          return url.startsWith(origin) || url.startsWith("data:")
            ? route.continue()
            : route.abort();
        });

        const page = await context.newPage();
        page.setDefaultTimeout(timeout);
        await page.goto(`${origin}/print`, { waitUntil: "load" });
        await page.waitForFunction(() => window.__HUNARLY_PRINT_READY__ === true);
        await page.evaluate(() => document.fonts.ready);
        await page.emulateMedia({ media: "print" });
        const pdf = await page.pdf({ preferCSSPageSize: true, printBackground: true });
        return new Uint8Array(pdf);
      } catch (error) {
        if (error instanceof Error && error.name === "TimeoutError") {
          throw new PdfRenderError("timeout", "The PDF took too long to create.", { cause: error });
        }
        throw new PdfRenderError("failed", "The PDF could not be created.", { cause: error });
      } finally {
        await browser.close().catch(() => undefined);
      }
    },
  };
}
