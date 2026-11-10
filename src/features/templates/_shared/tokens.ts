/** Shared sizes and colors. Templates use px because the page is laid out at a fixed A4 width. */
export const FONTS = {
  sans: 'Arial, Helvetica, "Liberation Sans", sans-serif',
  serif: 'Georgia, "Times New Roman", serif',
} as const;

export const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace';

/** Space between sections for each spacing choice. */
export const GAP = { compact: 10, comfortable: 14, relaxed: 18 } as const;

export const INK = "#12162b";
export const TEXT = "#1a1d2e";
export const MUTED = "#555b73";
