import { z } from "zod";
import { isHttpUrl } from "@/features/resume-builder/urls";

/**
 * Resume document schema (version 1). This is the contract for everything stored or rendered:
 * localStorage drafts, the database (M5), templates and PDF export. If you change the shape,
 * bump `schemaVersion` and add a migration in draft-storage.ts.
 */

export const SECTION_IDS = [
  "summary",
  "experience",
  "education",
  "projects",
  "skills",
  "certifications",
  "languages",
] as const;
export type SectionId = (typeof SECTION_IDS)[number];
export const sectionIdSchema = z.enum(SECTION_IDS);

export type ListKey = "experience" | "education" | "projects" | "certifications" | "languages";

export const MONTHS = [
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
  "08",
  "09",
  "10",
  "11",
  "12",
] as const;
export const LANGUAGE_LEVELS = [
  "",
  "Native",
  "Fluent",
  "Professional",
  "Intermediate",
  "Basic",
] as const;

const text = (max: number) => z.string().max(max, `Keep this under ${max} characters`);
const id = z.string().min(1);

export const partialDateSchema = z
  .object({
    month: z.enum(["", ...MONTHS]),
    year: z.string().regex(/^(\d{4})?$/, "Use a 4-digit year"),
  })
  .refine((d) => d.month === "" || d.year !== "", { message: "Add a year", path: ["year"] });
export type PartialDate = z.infer<typeof partialDateSchema>;

const urlSchema = text(300).refine(
  (v) => v === "" || isHttpUrl(v),
  "Enter a valid web address, like github.com/yourname",
);

const emailSchema = text(120).refine(
  (v) => v === "" || z.email().safeParse(v).success,
  "Enter a valid email address",
);

const phoneSchema = text(30).regex(/^[0-9+().\-\s]*$/, "Use digits, spaces, + and - only");

const yearSchema = z.string().regex(/^(\d{4})?$/, "Use a 4-digit year");

export const linkSchema = z.object({ id, label: text(40), url: urlSchema });
export type ProfileLink = z.infer<typeof linkSchema>;

export const profileSchema = z.object({
  fullName: text(80),
  headline: text(120),
  email: emailSchema,
  phone: phoneSchema,
  location: text(80),
  links: z.array(linkSchema).max(6),
  /** Remote-ready mode only. */
  timezone: text(60),
  availability: text(80),
});
export type Profile = z.infer<typeof profileSchema>;

export const experienceSchema = z.object({
  id,
  role: text(100),
  company: text(100),
  location: text(80),
  start: partialDateSchema,
  end: partialDateSchema,
  current: z.boolean(),
  /** One bullet per line. */
  bullets: text(1500),
});
export type Experience = z.infer<typeof experienceSchema>;

export const educationSchema = z.object({
  id,
  school: text(120),
  degree: text(120),
  location: text(80),
  start: partialDateSchema,
  end: partialDateSchema,
  /** Free text so any grading system works: "CGPA 3.6 / 4.0", "First Class", "85%". */
  grade: text(60),
  details: text(800),
});
export type Education = z.infer<typeof educationSchema>;

export const projectSchema = z.object({
  id,
  name: text(100),
  finalYear: z.boolean(),
  link: urlSchema,
  technologies: text(200),
  bullets: text(1200),
});
export type Project = z.infer<typeof projectSchema>;

export const certificationSchema = z.object({
  id,
  name: text(120),
  issuer: text(80),
  year: yearSchema,
});
export type Certification = z.infer<typeof certificationSchema>;

export const languageSchema = z.object({
  id,
  name: text(40),
  level: z.enum(LANGUAGE_LEVELS),
});
export type Language = z.infer<typeof languageSchema>;

export const styleSchema = z.object({
  accent: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  font: z.enum(["sans", "serif"]),
  spacing: z.enum(["compact", "comfortable", "relaxed"]),
});
export type ResumeStyle = z.infer<typeof styleSchema>;

export const resumeDocumentSchema = z.object({
  schemaVersion: z.literal(1),
  title: text(80),
  mode: z.enum(["standard", "remote"]),
  templateId: z.string().min(1),
  style: styleSchema,
  sectionOrder: z
    .array(sectionIdSchema)
    .refine(
      (order) => order.length === SECTION_IDS.length && new Set(order).size === SECTION_IDS.length,
      "Section order must list every section exactly once",
    ),
  profile: profileSchema,
  summary: text(600),
  experience: z.array(experienceSchema).max(12),
  education: z.array(educationSchema).max(6),
  projects: z.array(projectSchema).max(10),
  skills: text(600),
  certifications: z.array(certificationSchema).max(20),
  languages: z.array(languageSchema).max(10),
});
export type ResumeDocument = z.infer<typeof resumeDocumentSchema>;
export type ResumeMode = ResumeDocument["mode"];
