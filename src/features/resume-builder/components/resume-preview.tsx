"use client";

import { A4_HEIGHT, A4_WIDTH, PAGE_MARGIN, pageBreaks } from "@/features/resume-builder/pagination";
import { useResumeStore } from "@/features/resume-builder/store";
import { getTemplate } from "@/features/templates/registry";
import { useElementSize } from "@/hooks/use-element-size";

export function ResumePreview() {
  const doc = useResumeStore((s) => s.history.present);
  const { Component } = getTemplate(doc.templateId);
  const [wrapRef, { width }] = useElementSize<HTMLDivElement>();
  const [contentRef, { height }] = useElementSize<HTMLDivElement>();

  const scale = width > 0 ? Math.min(1, width / A4_WIDTH) : 1;
  const breaks = pageBreaks(height);
  const pages = breaks.length + 1;
  const paperHeight = Math.max(A4_HEIGHT, height + PAGE_MARGIN);

  return (
    <section aria-label="Resume preview" className="mx-auto w-full" style={{ maxWidth: A4_WIDTH }}>
      <div ref={wrapRef} style={{ height: paperHeight * scale }}>
        <div
          className="relative bg-white shadow-xl"
          style={{
            width: A4_WIDTH,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            minHeight: paperHeight,
          }}
        >
          <div ref={contentRef}>
            <Component document={doc} />
          </div>
          {breaks.map((y, i) => (
            <div
              key={y}
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 border-t border-dashed border-neutral-400"
              style={{ top: y }}
            >
              <span className="absolute right-3 -translate-y-full text-[11px] text-neutral-500">
                Page {i + 2} starts about here
              </span>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        {pages === 1 ? "1 page" : `${pages} pages`} (A4). Most employers prefer one page for early
        careers.
      </p>
    </section>
  );
}
