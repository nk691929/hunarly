import type { ResumeDocument } from "@/features/resume-builder/schema";

export const WATERMARK_TEXT = "Made with Hunarly";

export interface PdfRenderInput {
  document: ResumeDocument;
  watermark: boolean;
}

/** Turns a resume into PDF bytes. Swap the engine (a container service, another library) here. */
export interface PdfRenderer {
  render(input: PdfRenderInput): Promise<Uint8Array>;
}

export type PdfErrorCode = "unavailable" | "timeout" | "failed";

export class PdfRenderError extends Error {
  constructor(
    public readonly code: PdfErrorCode,
    message: string,
    options?: { cause?: unknown },
  ) {
    super(message, options);
    this.name = "PdfRenderError";
  }
}
