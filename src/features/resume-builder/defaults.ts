import type {
  Certification,
  Education,
  Experience,
  Language,
  ListKey,
  PartialDate,
  Project,
  ResumeDocument,
  SectionId,
} from "@/features/resume-builder/schema";

export function newId(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === "function") return c.randomUUID();
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Fresher-friendly default: education and projects come before work experience. */
export const DEFAULT_SECTION_ORDER: SectionId[] = [
  "summary",
  "education",
  "projects",
  "experience",
  "skills",
  "certifications",
  "languages",
];

const noDate = (): PartialDate => ({ month: "", year: "" });

const factories = {
  experience: (): Experience => ({
    id: newId(),
    role: "",
    company: "",
    location: "",
    start: noDate(),
    end: noDate(),
    current: false,
    bullets: "",
  }),
  education: (): Education => ({
    id: newId(),
    school: "",
    degree: "",
    location: "",
    start: noDate(),
    end: noDate(),
    grade: "",
    details: "",
  }),
  projects: (): Project => ({
    id: newId(),
    name: "",
    finalYear: false,
    link: "",
    technologies: "",
    bullets: "",
  }),
  certifications: (): Certification => ({ id: newId(), name: "", issuer: "", year: "" }),
  languages: (): Language => ({ id: newId(), name: "", level: "" }),
} satisfies Record<ListKey, () => unknown>;

export function createItem<K extends ListKey>(key: K): ResumeDocument[K][number] {
  return factories[key]() as ResumeDocument[K][number];
}

export function createEmptyDocument(): ResumeDocument {
  return {
    schemaVersion: 1,
    title: "My resume",
    mode: "standard",
    templateId: "ats-classic",
    style: { accent: "#3140D8", font: "sans", spacing: "comfortable" },
    sectionOrder: [...DEFAULT_SECTION_ORDER],
    profile: {
      fullName: "",
      headline: "",
      email: "",
      phone: "",
      location: "",
      links: [],
      timezone: "",
      availability: "",
    },
    summary: "",
    experience: [],
    education: [],
    projects: [],
    skills: "",
    certifications: [],
    languages: [],
  };
}

/** A complete example so people can see the finished result right away. */
export function createSampleDocument(): ResumeDocument {
  return {
    ...createEmptyDocument(),
    title: "Maya Johnson, Data Analyst",
    profile: {
      fullName: "Maya Johnson",
      headline: "Junior Data Analyst",
      email: "maya.johnson@example.com",
      phone: "+44 7700 900123",
      location: "Leeds, United Kingdom",
      links: [
        { id: newId(), label: "LinkedIn", url: "linkedin.com/in/mayajohnson" },
        { id: newId(), label: "GitHub", url: "github.com/mayajohnson" },
      ],
      timezone: "UTC+0 (United Kingdom)",
      availability: "Available from July 2026",
    },
    summary:
      "Statistics graduate who turned a final-year project into a dashboard used by 40 students and staff. Strong in Python, SQL and Tableau. Looking for a junior analyst role.",
    education: [
      {
        id: newId(),
        school: "University of Leeds",
        degree: "BSc Statistics",
        location: "Leeds, United Kingdom",
        start: { month: "09", year: "2022" },
        end: { month: "06", year: "2026" },
        grade: "GPA 3.8 / 4.0",
        details: "Relevant courses: Regression, Machine Learning, Databases\nDean's List 2024",
      },
    ],
    projects: [
      {
        id: newId(),
        name: "Campus Energy Dashboard",
        finalYear: true,
        link: "github.com/mayajohnson/energy-dashboard",
        technologies: "Python, SQL, Tableau",
        bullets:
          "Analyzed 18 months of campus meter data to find peak-use patterns\nBuilt a dashboard now used by 40 students and staff",
      },
    ],
    experience: [
      {
        id: newId(),
        role: "Data Analyst Intern",
        company: "Northwind Analytics",
        location: "Remote",
        start: { month: "06", year: "2025" },
        end: { month: "08", year: "2025" },
        current: false,
        bullets:
          "Cleaned and merged 18 months of sales data using Python and SQL\nBuilt a weekly Tableau report that cut manual reporting from 3 hours to 20 minutes\nPresented findings to a team of 8 and helped prioritize 2 product fixes",
      },
    ],
    skills: "Python, SQL, Tableau, Excel, Statistics, Data cleaning, Communication",
    certifications: [
      { id: newId(), name: "Google Data Analytics Certificate", issuer: "Coursera", year: "2025" },
    ],
    languages: [
      { id: newId(), name: "English", level: "Native" },
      { id: newId(), name: "French", level: "Professional" },
    ],
  };
}
