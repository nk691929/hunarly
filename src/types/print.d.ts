import type { ResumeDocument } from "@/features/resume-builder/schema";

/** Data handed to the headless browser's print page. */
export interface PrintPayload {
  document: ResumeDocument;
  watermark: boolean;
}

declare global {
  interface Window {
    __HUNARLY_PRINT__?: PrintPayload;
    __HUNARLY_PRINT_READY__?: boolean;
  }
}
