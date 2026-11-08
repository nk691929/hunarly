import { splitList } from "@/features/resume-builder/format";
import {
  SECTION_IDS,
  type ListKey,
  type ResumeDocument,
  type SectionId,
} from "@/features/resume-builder/schema";

type WithId = { id: string };

export function moveInArray<T>(list: readonly T[], from: number, to: number): T[] {
  const copy = [...list];
  const [item] = copy.splice(from, 1);
  if (item !== undefined) copy.splice(to, 0, item);
  return copy;
}

function inRange(length: number, ...indexes: number[]): boolean {
  return indexes.every((i) => Number.isInteger(i) && i >= 0 && i < length);
}

export function updateItem<K extends ListKey>(
  doc: ResumeDocument,
  key: K,
  id: string,
  patch: Partial<ResumeDocument[K][number]>,
): ResumeDocument {
  const list = doc[key] as WithId[];
  return {
    ...doc,
    [key]: list.map((it) => (it.id === id ? { ...it, ...patch } : it)),
  } as ResumeDocument;
}

export function addItem<K extends ListKey>(
  doc: ResumeDocument,
  key: K,
  item: ResumeDocument[K][number],
): ResumeDocument {
  return { ...doc, [key]: [...(doc[key] as WithId[]), item] } as ResumeDocument;
}

export function removeItem(doc: ResumeDocument, key: ListKey, id: string): ResumeDocument {
  const list = doc[key] as WithId[];
  return { ...doc, [key]: list.filter((it) => it.id !== id) } as ResumeDocument;
}

/** Returns the same document when the move is a no-op, so no history entry is created. */
export function moveItem(
  doc: ResumeDocument,
  key: ListKey,
  from: number,
  to: number,
): ResumeDocument {
  const list = doc[key] as WithId[];
  if (from === to || !inRange(list.length, from, to)) return doc;
  return { ...doc, [key]: moveInArray(list, from, to) } as ResumeDocument;
}

export function reorderSections(doc: ResumeDocument, from: number, to: number): ResumeDocument {
  if (from === to || !inRange(doc.sectionOrder.length, from, to)) return doc;
  return { ...doc, sectionOrder: moveInArray(doc.sectionOrder, from, to) };
}

/** Empty sections are left out of the preview and the exported file. */
export function isSectionEmpty(doc: ResumeDocument, section: SectionId): boolean {
  switch (section) {
    case "summary":
      return doc.summary.trim() === "";
    case "experience":
      return doc.experience.every((e) => !e.role.trim() && !e.company.trim());
    case "education":
      return doc.education.every((e) => !e.degree.trim() && !e.school.trim());
    case "projects":
      return doc.projects.every((p) => !p.name.trim());
    case "skills":
      return splitList(doc.skills).length === 0;
    case "certifications":
      return doc.certifications.every((c) => !c.name.trim());
    case "languages":
      return doc.languages.every((l) => !l.name.trim());
  }
}

/** True when the person has entered anything worth keeping (used to decide whether to offer a draft import). */
export function hasContent(doc: ResumeDocument): boolean {
  const p = doc.profile;
  const profileFilled =
    [p.fullName, p.headline, p.email, p.phone, p.location].some((v) => v.trim() !== "") ||
    p.links.length > 0;
  return profileFilled || SECTION_IDS.some((id) => !isSectionEmpty(doc, id));
}
