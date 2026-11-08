"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import type * as React from "react";
import { Button } from "@/components/ui/button";

interface EntryListProps<T extends { id: string }> {
  items: T[];
  itemLabel: (item: T, index: number) => string;
  addLabel: string;
  emptyText: string;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onMove: (from: number, to: number) => void;
  children: (item: T, index: number) => React.ReactNode;
}

/** A repeatable group of entries (jobs, schools, projects...) with add, remove and reorder. */
export function EntryList<T extends { id: string }>({
  items,
  itemLabel,
  addLabel,
  emptyText,
  onAdd,
  onRemove,
  onMove,
  children,
}: EntryListProps<T>) {
  return (
    <div className="flex flex-col gap-4">
      {items.length === 0 && <p className="text-sm text-muted-foreground">{emptyText}</p>}
      {items.map((item, index) => {
        const label = itemLabel(item, index).trim() || `Entry ${index + 1}`;
        return (
          <div key={item.id} className="flex flex-col gap-4 rounded-lg border bg-background p-4">
            <div className="flex items-center justify-between gap-2">
              <h4 className="truncate font-display text-sm font-semibold">{label}</h4>
              <div className="flex shrink-0 gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8"
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
                  className="size-8"
                  disabled={index === items.length - 1}
                  aria-label={`Move ${label} down`}
                  onClick={() => onMove(index, index + 1)}
                >
                  <ArrowDown aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  aria-label={`Remove ${label}`}
                  onClick={() => onRemove(item.id)}
                >
                  <Trash2 aria-hidden="true" />
                </Button>
              </div>
            </div>
            {children(item, index)}
          </div>
        );
      })}
      <Button type="button" variant="outline" size="sm" className="self-start" onClick={onAdd}>
        <Plus aria-hidden="true" />
        {addLabel}
      </Button>
    </div>
  );
}
