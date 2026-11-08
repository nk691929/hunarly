import { env } from "@/config/env";
import { siteConfig } from "@/config/site";
import type { PdfRenderer } from "@/server/providers/pdf";
import { createPlaywrightPdfRenderer } from "@/server/providers/pdf/playwright";

let renderer: PdfRenderer | undefined;

/** The PDF engine used by the API. Set PDF_BASE_URL if the app is reachable at a different address. */
export function getPdfRenderer(): PdfRenderer {
  renderer ??= createPlaywrightPdfRenderer({ baseUrl: env.PDF_BASE_URL ?? siteConfig.url });
  return renderer;
}
