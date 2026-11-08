"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowDown, ArrowUp, ChevronDown, GripVertical } from "lucide-react";
import type * as React from "react";
import { Button } from "@/components/ui/button";
import { SECTION_GUIDE, SECTION_LABELS } from "@/features/resume-builder/guidance";
import type { SectionId } from "@/features/resume-builder/schema";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  id: SectionId;
  index: number;
  total: number;
  open: boolean;
  onToggle: () => void;
  onMove: (from: number, to: number) => void;
  children: React.ReactNode;
}

/**
 * A collapsible section that can be reordered three ways: drag the handle with a mouse or
 * touch, press Space on the handle and use arrow keys, or use the Move up/down buttons
 * (the single-pointer alternative required by WCAG 2.2).
 */
export function SectionCard({
  id,
  index,
  total,
  open,
  onToggle,
  onMove,
  children,
}: SectionCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  const label = SECTION_LABELS[id];

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("rounded-xl border bg-card", isDragging && "relative z-10 shadow-lg")}
    >
      <div className="flex items-center gap-1 p-2">
        <button
          type="button"
          ref={setActivatorNodeRef}
          aria-label={`Drag to reorder ${label}`}
          className="flex size-9 shrink-0 cursor-grab touch-none items-center justify-center rounded-lg text-muted-foreground hover:bg-muted active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={`panel-${id}`}
          onClick={onToggle}
          className="flex min-w-0 flex-1 items-center justify-between gap-3 rounded-lg px-2 py-2 text-left font-display font-semibold"
        >
          <span className="truncate">{label}</span>
          <ChevronDown
            className={cn("size-4 shrink-0 transition-transform", open && "rotate-180")}
            aria-hidden="true"
          />
        </button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-9"
          disabled={index === 0}
          aria-label={`Move ${label} up`}
          onClick={() => onMove(index, index - 1)}
        >
          <ArrowUp aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-9"
          disabled={index === total - 1}
          aria-label={`Move ${label} down`}
          onClick={() => onMove(index, index + 1)}
        >
          <ArrowDown aria-hidden="true" />
        </Button>
      </div>
      {open && (
        <div id={`panel-${id}`} className="flex flex-col gap-5 border-t p-5">
          <p className="rounded-lg bg-secondary px-4 py-3 text-sm">
            <span className="font-semibold">Tip: </span>
            {SECTION_GUIDE[id].tip}
          </p>
          {children}
        </div>
      )}
    </div>
  );
}
