/** Reads the text out of a PDF the way a hiring system would: in the order it is drawn. */
export async function extractPdfText(data: Uint8Array): Promise<{ pages: string[]; text: string }> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const doc = await pdfjs.getDocument({ data: new Uint8Array(data), useSystemFonts: true }).promise;
  const pages: string[] = [];
  for (let n = 1; n <= doc.numPages; n++) {
    const page = await doc.getPage(n);
    const content = await page.getTextContent();
    pages.push(
      content.items
        .map((item) => ("str" in item ? item.str + (item.hasEOL ? "\n" : " ") : ""))
        .join(""),
    );
  }
  const text = pages.join("\n").replace(/\s+/g, " ").trim().toLowerCase();
  return { pages, text };
}

/** True when each phrase appears after the one before it. Returns the first phrase that is out of place. */
export function firstOutOfOrder(text: string, phrases: string[]): string | null {
  let from = 0;
  for (const phrase of phrases) {
    const at = text.indexOf(phrase.toLowerCase(), from);
    if (at === -1) return phrase;
    from = at + phrase.length;
  }
  return null;
}
