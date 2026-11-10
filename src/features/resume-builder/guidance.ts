import type { SectionId } from "@/features/resume-builder/schema";

export const SECTION_LABELS: Record<SectionId, string> = {
  summary: "Summary",
  experience: "Experience and internships",
  education: "Education",
  projects: "Projects",
  skills: "Skills",
  certifications: "Certifications",
  languages: "Languages",
};

export interface SectionGuide {
  tip: string;
  /** Example text people can insert with one click (summary only for now). */
  example?: string;
}

export const SECTION_GUIDE: Record<SectionId, SectionGuide> = {
  summary: {
    tip: 'Write 2 to 3 sentences: who you are, your strongest skill and the role you want. Skip buzzwords like "hard-working".',
    example:
      "Computer science graduate with hands-on experience from a final-year project and a three-month internship. Strong in Python and SQL. Looking for a junior data role where I can turn messy data into clear decisions.",
  },
  experience: {
    tip: "Internships, freelance work and part-time jobs all count. Start each bullet with a verb and add a number when you can.",
  },
  education: {
    tip: "Add your degree, university and dates. Include your GPA or CGPA only if it helps you, and list a few relevant courses.",
  },
  projects: {
    tip: "Your final-year project is real experience. Say what problem it solved, what you used and what happened.",
  },
  skills: {
    tip: "List tools and skills you can use today, separated by commas. Put the ones the job asks for first.",
  },
  certifications: {
    tip: "Add courses from Coursera, Google, Meta and others that match the jobs you want.",
  },
  languages: {
    tip: "Include languages you can work in, with an honest level.",
  },
};

export const BASICS_TIP_REMOTE =
  "Remote-ready mode leaves out photo and date of birth, and adds your time zone and availability. Add your portfolio, GitHub and LinkedIn links.";
