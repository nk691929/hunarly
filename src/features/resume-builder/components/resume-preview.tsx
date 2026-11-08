"use client";

import { useElementSize } from "@/hooks/use-element-size";
import { useResumeStore } from "@/features/resume-builder/store";
import { getTemplate } from "@/features/templates/registry";

/** A4 at 96 dpi. Templates are laid out at this fixed size, then scaled to fit the column. */
export const A4_WIDTH = 794;
export const A4_HEIGHT = 1123;

export function ResumePreview() {
  const doc = useResumeStore((s) => s.history.present);
  const { Component } = getTemplate(doc.templateId);
  const [wrapRef, { width }] = useElementSize<HTMLDivElement>();
  const [contentRef, { height }] = useElementSize<HTMLDivElement>();

  const scale = width > 0 ? Math.min(1, width / A4_WIDTH) : 1;
  const pages = Math.max(1, Math.ceil(height / A4_HEIGHT));

  return (
    <section aria-label="Resume preview" className="mx-auto w-full" style={{ maxWidth: A4_WIDTH }}>
      <div ref={wrapRef} style={{ height: pages * A4_HEIGHT * scale }}>
        <div
          className="relative bg-white shadow-xl"
          style={{
            width: A4_WIDTH,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            minHeight: pages * A4_HEIGHT,
          }}
        >
          <div ref={contentRef}>
            <Component document={doc} />
          </div>
          {Array.from({ length: pages - 1 }, (_, i) => (
            <div
              key={i}
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 border-t border-dashed border-neutral-400"
              style={{ top: (i + 1) * A4_HEIGHT }}
            >
              <span className="absolute right-3 -translate-y-full text-[11px] text-neutral-500">
                Page {i + 2} starts here
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
