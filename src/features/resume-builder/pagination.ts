/**
 * Page geometry shared by the preview and the PDF. A4 at 96 dpi is 794 x 1123 px.
 * The PDF uses 12 mm top and bottom page margins (none above page 1, where each template draws its
 * own top spacing). Entries that must stay together can move to the next page, so the preview's
 * page lines are a close estimate, not a guarantee.
 */
export const A4_WIDTH = 794;
export const A4_HEIGHT = 1123;
export const PAGE_MARGIN = 45; // 12 mm

/** Content heights where a new page begins, for content of the given height. */
export function pageBreaks(contentHeight: number): number[] {
  const firstPage = A4_HEIGHT - PAGE_MARGIN;
  const laterPages = A4_HEIGHT - 2 * PAGE_MARGIN;
  const breaks: number[] = [];
  for (let y = firstPage; y < contentHeight; y += laterPages) breaks.push(y);
  return breaks;
}

export function pageCount(contentHeight: number): number {
  return pageBreaks(contentHeight).length + 1;
}
