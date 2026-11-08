"use client";

import { useEffect, useSyncExternalStore } from "react";
import { WATERMARK_TEXT } from "@/server/providers/pdf";
import { getTemplate } from "@/features/templates/registry";

const noopSubscribe = () => () => {};

/**
 * Renders a resume for the headless browser. The document is placed on `window` by the PDF
 * renderer before the page loads, so nothing travels through the URL and no data is stored.
 * Visiting /print by hand shows a blank page.
 */
export function PrintView() {
  const payload = useSyncExternalStore(
    noopSubscribe,
    () => window.__HUNARLY_PRINT__ ?? null,
    () => null,
  );

  useEffect(() => {
    if (payload) window.__HUNARLY_PRINT_READY__ = true;
  }, [payload]);

  if (!payload) return null;
  const { Component } = getTemplate(payload.document.templateId);

  // Page margins: none above page 1 (templates draw their own top spacing), 12 mm elsewhere.
  // Free exports get a footer through a page margin box, so it never overlaps the resume.
  const css = `
    @page { size: A4; margin: 12mm 0; ${
      payload.watermark
        ? `@bottom-center { content: "${WATERMARK_TEXT}"; font: 9px Arial, Helvetica, sans-serif; color: #9aa0b8; vertical-align: middle; }`
        : ""
    } }
    @page :first { margin-top: 0; }
    html, body { background: #fff !important; margin: 0; }
    * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    a[href="#main"], nextjs-portal { display: none !important; }
  `;

  return (
    <>
      <style>{css}</style>
      <div style={{ width: "210mm", background: "#fff" }}>
        <Component document={payload.document} />
      </div>
    </>
  );
}
