"use client";

import { memo, useMemo } from "react";
import { createSampleDocument } from "@/features/resume-builder/defaults";
import { A4_HEIGHT, A4_WIDTH } from "@/features/resume-builder/pagination";
import type { TemplateDefinition } from "@/features/templates/types";

const THUMB_WIDTH = 132;
const SCALE = THUMB_WIDTH / A4_WIDTH;

/** A real, scaled-down render of the template with sample content. Hidden from screen readers. */
export const TemplateThumbnail = memo(function TemplateThumbnail({
  template,
}: {
  template: TemplateDefinition;
}) {
  const doc = useMemo(
    () => ({ ...createSampleDocument(), templateId: template.id, style: template.defaultStyle }),
    [template],
  );
  const { Component } = template;
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none mx-auto block overflow-hidden rounded border bg-white"
      style={{ width: THUMB_WIDTH, height: A4_HEIGHT * SCALE }}
    >
      <span
        className="block origin-top-left"
        style={{ width: A4_WIDTH, transform: `scale(${SCALE})` }}
      >
        <Component document={doc} />
      </span>
    </span>
  );
});
