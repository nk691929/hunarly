"use client";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ChevronDown } from "lucide-react";
import { useState, type ComponentType, type ReactNode } from "react";
import { BasicsEditor } from "@/features/resume-builder/components/basics-editor";
import { DesignEditor } from "@/features/resume-builder/components/design-editor";
import { SectionCard } from "@/features/resume-builder/components/section-card";
import {
  CertificationsEditor,
  EducationEditor,
  ExperienceEditor,
  LanguagesEditor,
  ProjectsEditor,
  SkillsEditor,
  SummaryEditor,
} from "@/features/resume-builder/components/section-editors";
import type { SectionId } from "@/features/resume-builder/schema";
import { useResumeStore } from "@/features/resume-builder/store";
import { cn } from "@/lib/utils";

const EDITORS: Record<SectionId, ComponentType> = {
  summary: SummaryEditor,
  experience: ExperienceEditor,
  education: EducationEditor,
  projects: ProjectsEditor,
  skills: SkillsEditor,
  certifications: CertificationsEditor,
  languages: LanguagesEditor,
};

type FixedId = "basics" | "design";
type OpenId = SectionId | FixedId | null;

/** A collapsible card for the parts that are not reorderable: Basics and Design. */
function FixedCard({
  id,
  title,
  open,
  onToggle,
  children,
}: {
  id: FixedId;
  title: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-card">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={`panel-${id}`}
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 rounded-xl px-5 py-4 text-left font-display font-semibold"
      >
        {title}
        <ChevronDown
          className={cn("size-4 transition-transform", open && "rotate-180")}
          aria-hidden="true"
        />
      </button>
      {open && (
        <div id={`panel-${id}`} className="border-t p-5">
          {children}
        </div>
      )}
    </div>
  );
}

export function EditorPanel() {
  const order = useResumeStore((s) => s.history.present.sectionOrder);
  const reorderSections = useResumeStore((s) => s.reorderSections);
  const [open, setOpen] = useState<OpenId>("basics");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const toggle = (id: Exclude<OpenId, null>) => setOpen((cur) => (cur === id ? null : id));

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const from = order.indexOf(active.id as SectionId);
    const to = order.indexOf(over.id as SectionId);
    if (from >= 0 && to >= 0) reorderSections(from, to);
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-3">
      <FixedCard
        id="basics"
        title="Basics"
        open={open === "basics"}
        onToggle={() => toggle("basics")}
      >
        <BasicsEditor />
      </FixedCard>
      <FixedCard
        id="design"
        title="Design"
        open={open === "design"}
        onToggle={() => toggle("design")}
      >
        <DesignEditor />
      </FixedCard>

      <p className="mt-2 px-1 text-sm text-muted-foreground">
        Drag sections to change their order on your resume.
      </p>

      <DndContext
        id="resume-sections"
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={order} strategy={verticalListSortingStrategy}>
          {order.map((id, index) => {
            const Editor = EDITORS[id];
            return (
              <SectionCard
                key={id}
                id={id}
                index={index}
                total={order.length}
                open={open === id}
                onToggle={() => toggle(id)}
                onMove={reorderSections}
              >
                <Editor />
              </SectionCard>
            );
          })}
        </SortableContext>
      </DndContext>
    </div>
  );
}
