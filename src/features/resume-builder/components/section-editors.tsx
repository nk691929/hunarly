"use client";

import { Button } from "@/components/ui/button";
import {
  CheckboxField,
  DateField,
  SelectField,
  TextAreaField,
  TextField,
} from "@/features/resume-builder/components/fields";
import { EntryList } from "@/features/resume-builder/components/entry-list";
import { SECTION_GUIDE } from "@/features/resume-builder/guidance";
import {
  certificationSchema,
  educationSchema,
  experienceSchema,
  languageSchema,
  LANGUAGE_LEVELS,
  projectSchema,
  type ListKey,
  type ResumeDocument,
} from "@/features/resume-builder/schema";
import { useResumeStore } from "@/features/resume-builder/store";
import { validateWith } from "@/features/resume-builder/validation";

function useListActions<K extends ListKey>(key: K) {
  const addItem = useResumeStore((s) => s.addItem);
  const updateItem = useResumeStore((s) => s.updateItem);
  const removeItem = useResumeStore((s) => s.removeItem);
  const moveItem = useResumeStore((s) => s.moveItem);
  return {
    add: () => addItem(key),
    update: (id: string, patch: Partial<ResumeDocument[K][number]>) => updateItem(key, id, patch),
    remove: (id: string) => removeItem(key, id),
    move: (from: number, to: number) => moveItem(key, from, to),
  };
}

export function SummaryEditor() {
  const summary = useResumeStore((s) => s.history.present.summary);
  const setSummary = useResumeStore((s) => s.setSummary);
  const example = SECTION_GUIDE.summary.example;
  return (
    <div className="flex flex-col gap-3">
      <TextAreaField
        label="Professional summary"
        value={summary}
        onChange={setSummary}
        rows={5}
        maxLength={600}
        error={summary.length > 600 ? "Keep this under 600 characters" : undefined}
      />
      {example && summary.trim() === "" && (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="self-start"
          onClick={() => setSummary(example)}
        >
          Insert example text
        </Button>
      )}
    </div>
  );
}

export function ExperienceEditor() {
  const items = useResumeStore((s) => s.history.present.experience);
  const { add, update, remove, move } = useListActions("experience");
  return (
    <EntryList
      items={items}
      itemLabel={(e) => [e.role, e.company].filter(Boolean).join(" at ")}
      addLabel="Add experience or internship"
      emptyText="No experience yet? Add an internship, freelance job or volunteer role. It all counts."
      onAdd={add}
      onRemove={remove}
      onMove={move}
    >
      {(item) => {
        const errors = validateWith(experienceSchema, item);
        return (
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Job title"
              value={item.role}
              onChange={(role) => update(item.id, { role })}
              error={errors.role}
              placeholder="Data Analyst Intern"
            />
            <TextField
              label="Company"
              value={item.company}
              onChange={(company) => update(item.id, { company })}
              error={errors.company}
            />
            <TextField
              label="Location"
              value={item.location}
              onChange={(location) => update(item.id, { location })}
              placeholder="City, country, or Remote"
              className="sm:col-span-2"
            />
            <DateField
              label="Start date"
              value={item.start}
              onChange={(start) => update(item.id, { start })}
              error={errors["start.year"]}
            />
            <DateField
              label="End date"
              value={item.end}
              onChange={(end) => update(item.id, { end })}
              error={errors["end.year"]}
              disabled={item.current}
            />
            <div className="sm:col-span-2">
              <CheckboxField
                label="I currently work here"
                checked={item.current}
                onChange={(current) => update(item.id, { current })}
              />
            </div>
            <TextAreaField
              className="sm:col-span-2"
              label="What you did"
              rows={4}
              maxLength={1500}
              value={item.bullets}
              onChange={(bullets) => update(item.id, { bullets })}
              error={errors.bullets}
              hint="One achievement per line. Start with a verb and add numbers when you can."
              placeholder={
                "Cleaned and analyzed sales data in Excel and SQL\nBuilt a weekly report that saved the team 3 hours"
              }
            />
          </div>
        );
      }}
    </EntryList>
  );
}

export function EducationEditor() {
  const items = useResumeStore((s) => s.history.present.education);
  const { add, update, remove, move } = useListActions("education");
  return (
    <EntryList
      items={items}
      itemLabel={(e) => [e.degree, e.school].filter(Boolean).join(", ")}
      addLabel="Add education"
      emptyText="Add your degree or most recent school."
      onAdd={add}
      onRemove={remove}
      onMove={move}
    >
      {(item) => {
        const errors = validateWith(educationSchema, item);
        return (
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Degree"
              value={item.degree}
              onChange={(degree) => update(item.id, { degree })}
              error={errors.degree}
              placeholder="BSc Computer Science"
            />
            <TextField
              label="School or university"
              value={item.school}
              onChange={(school) => update(item.id, { school })}
              error={errors.school}
            />
            <TextField
              label="Location"
              value={item.location}
              onChange={(location) => update(item.id, { location })}
            />
            <TextField
              label="Grade or GPA (optional)"
              value={item.grade}
              onChange={(grade) => update(item.id, { grade })}
              error={errors.grade}
              placeholder="CGPA 3.6 / 4.0, or First Class"
            />
            <DateField
              label="Start date"
              value={item.start}
              onChange={(start) => update(item.id, { start })}
              error={errors["start.year"]}
            />
            <DateField
              label="End date (or expected)"
              value={item.end}
              onChange={(end) => update(item.id, { end })}
              error={errors["end.year"]}
            />
            <TextAreaField
              className="sm:col-span-2"
              label="Relevant courses or honors"
              rows={3}
              maxLength={800}
              value={item.details}
              onChange={(details) => update(item.id, { details })}
              error={errors.details}
              hint="One per line. Skip this if it would just repeat your degree."
            />
          </div>
        );
      }}
    </EntryList>
  );
}

export function ProjectsEditor() {
  const items = useResumeStore((s) => s.history.present.projects);
  const { add, update, remove, move } = useListActions("projects");
  return (
    <EntryList
      items={items}
      itemLabel={(p) => p.name}
      addLabel="Add project"
      emptyText="Add your final-year project or a project you built on your own."
      onAdd={add}
      onRemove={remove}
      onMove={move}
    >
      {(item) => {
        const errors = validateWith(projectSchema, item);
        return (
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Project name"
              value={item.name}
              onChange={(name) => update(item.id, { name })}
              error={errors.name}
              className="sm:col-span-2"
            />
            <div className="sm:col-span-2">
              <CheckboxField
                label="This is my final-year project"
                checked={item.finalYear}
                onChange={(finalYear) => update(item.id, { finalYear })}
              />
            </div>
            <TextField
              label="Link (optional)"
              value={item.link}
              onChange={(link) => update(item.id, { link })}
              error={errors.link}
              placeholder="github.com/yourname/project"
            />
            <TextField
              label="Technologies"
              value={item.technologies}
              onChange={(technologies) => update(item.id, { technologies })}
              error={errors.technologies}
              placeholder="Python, SQL, React"
            />
            <TextAreaField
              className="sm:col-span-2"
              label="What it does and what you achieved"
              rows={4}
              maxLength={1200}
              value={item.bullets}
              onChange={(bullets) => update(item.id, { bullets })}
              error={errors.bullets}
              hint="One point per line: the problem, what you built, the result."
            />
          </div>
        );
      }}
    </EntryList>
  );
}

export function SkillsEditor() {
  const skills = useResumeStore((s) => s.history.present.skills);
  const setSkills = useResumeStore((s) => s.setSkills);
  return (
    <TextAreaField
      label="Skills"
      value={skills}
      onChange={setSkills}
      rows={3}
      maxLength={600}
      hint="Separate with commas."
      placeholder="Python, SQL, Excel, Figma, Communication"
    />
  );
}

export function CertificationsEditor() {
  const items = useResumeStore((s) => s.history.present.certifications);
  const { add, update, remove, move } = useListActions("certifications");
  return (
    <EntryList
      items={items}
      itemLabel={(c) => c.name}
      addLabel="Add certification"
      emptyText="Add courses and certificates that match the jobs you want."
      onAdd={add}
      onRemove={remove}
      onMove={move}
    >
      {(item) => {
        const errors = validateWith(certificationSchema, item);
        return (
          <div className="grid gap-4 sm:grid-cols-3">
            <TextField
              label="Name"
              value={item.name}
              onChange={(name) => update(item.id, { name })}
              error={errors.name}
              className="sm:col-span-3"
              placeholder="Google Data Analytics Certificate"
            />
            <TextField
              label="Issuer"
              value={item.issuer}
              onChange={(issuer) => update(item.id, { issuer })}
              error={errors.issuer}
              className="sm:col-span-2"
              placeholder="Coursera"
            />
            <TextField
              label="Year"
              value={item.year}
              onChange={(year) => update(item.id, { year: year.replace(/\D/g, "").slice(0, 4) })}
              error={errors.year}
              inputMode="numeric"
              maxLength={4}
            />
          </div>
        );
      }}
    </EntryList>
  );
}

const levelOptions = LANGUAGE_LEVELS.map((l) => ({ value: l, label: l || "Level" }));

export function LanguagesEditor() {
  const items = useResumeStore((s) => s.history.present.languages);
  const { add, update, remove, move } = useListActions("languages");
  return (
    <EntryList
      items={items}
      itemLabel={(l) => l.name}
      addLabel="Add language"
      emptyText="Add languages you can work in."
      onAdd={add}
      onRemove={remove}
      onMove={move}
    >
      {(item) => {
        const errors = validateWith(languageSchema, item);
        return (
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Language"
              value={item.name}
              onChange={(name) => update(item.id, { name })}
              error={errors.name}
              placeholder="English"
            />
            <SelectField
              label="Level"
              value={item.level}
              onChange={(level) =>
                update(item.id, { level: level as (typeof LANGUAGE_LEVELS)[number] })
              }
              options={levelOptions}
            />
          </div>
        );
      }}
    </EntryList>
  );
}
