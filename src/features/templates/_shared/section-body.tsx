import type { CSSProperties, ReactNode } from "react";
import { formatDateRange, splitLines, splitList } from "@/features/resume-builder/format";
import type { ResumeDocument, SectionId } from "@/features/resume-builder/schema";
import { displayUrl, isHttpUrl, normalizeUrl } from "@/features/resume-builder/urls";
import type { TemplateTheme } from "@/features/templates/_shared/theme";
import { MONO, MUTED } from "@/features/templates/_shared/tokens";

export const HEADINGS: Record<SectionId, string> = {
  summary: "Summary",
  experience: "Experience",
  education: "Education",
  projects: "Projects",
  skills: "Skills",
  certifications: "Certifications",
  languages: "Languages",
};

const noBreak: CSSProperties = { breakInside: "avoid" };

function Row({ left, right, mono }: { left: ReactNode; right?: string; mono: boolean }) {
  return (
    <div
      style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "baseline" }}
    >
      <div>{left}</div>
      {right ? (
        <div
          style={{
            color: MUTED,
            whiteSpace: "nowrap",
            fontSize: 12,
            fontFamily: mono ? MONO : undefined,
          }}
        >
          {right}
        </div>
      ) : null}
    </div>
  );
}

function Bullets({ text }: { text: string }) {
  const lines = splitLines(text);
  if (lines.length === 0) return null;
  return (
    <ul style={{ margin: "4px 0 0", paddingLeft: 18 }}>
      {lines.map((line, i) => (
        <li key={i} style={{ margin: "1px 0" }}>
          {line}
        </li>
      ))}
    </ul>
  );
}

/** Only real http(s) addresses become links; anything else is shown as plain text. */
export function LinkText({ url }: { url: string }) {
  const text = displayUrl(url);
  if (!isHttpUrl(url)) return <span>{text}</span>;
  return (
    <a
      href={normalizeUrl(url)}
      target="_blank"
      rel="noopener noreferrer"
      style={{ color: "inherit", textDecoration: "none" }}
    >
      {text}
    </a>
  );
}

function Skills({
  items,
  accent,
  variant,
}: {
  items: string[];
  accent: string;
  variant: TemplateTheme["skills"];
}) {
  if (variant === "text") return <p style={{ margin: 0 }}>{items.join(", ")}</p>;
  const chip: CSSProperties =
    variant === "chips"
      ? { background: `${accent}1a`, color: accent, borderRadius: 999, padding: "2px 10px" }
      : {
          border: `1px solid ${accent}`,
          color: accent,
          borderRadius: 4,
          padding: "1px 8px",
          fontFamily: MONO,
        };
  return (
    <ul
      style={{
        margin: 0,
        padding: 0,
        listStyle: "none",
        display: "flex",
        flexWrap: "wrap",
        gap: 6,
      }}
    >
      {items.map((item, i) => (
        <li key={i} style={{ ...chip, fontSize: 12, fontWeight: 500 }}>
          {item}
        </li>
      ))}
    </ul>
  );
}

export function SectionBody({
  id,
  doc,
  theme,
}: {
  id: SectionId;
  doc: ResumeDocument;
  theme: TemplateTheme;
}) {
  const { mono } = theme;
  switch (id) {
    case "summary":
      return <p style={{ margin: 0 }}>{doc.summary.trim()}</p>;
    case "experience":
      return (
        <>
          {doc.experience
            .filter((e) => e.role.trim() || e.company.trim())
            .map((e) => (
              <div key={e.id} style={{ ...noBreak, marginBottom: 8 }}>
                <Row
                  mono={mono}
                  left={<strong>{e.role}</strong>}
                  right={formatDateRange(e.start, e.end, e.current)}
                />
                <div style={{ color: MUTED }}>
                  {[e.company, e.location].filter(Boolean).join(", ")}
                </div>
                <Bullets text={e.bullets} />
              </div>
            ))}
        </>
      );
    case "education":
      return (
        <>
          {doc.education
            .filter((e) => e.degree.trim() || e.school.trim())
            .map((e) => (
              <div key={e.id} style={{ ...noBreak, marginBottom: 8 }}>
                <Row
                  mono={mono}
                  left={<strong>{e.degree}</strong>}
                  right={formatDateRange(e.start, e.end, false)}
                />
                <div style={{ color: MUTED }}>
                  {[e.school, e.location, e.grade].filter(Boolean).join(", ")}
                </div>
                <Bullets text={e.details} />
              </div>
            ))}
        </>
      );
    case "projects":
      return (
        <>
          {doc.projects
            .filter((p) => p.name.trim())
            .map((p) => (
              <div key={p.id} style={{ ...noBreak, marginBottom: 8 }}>
                <Row
                  mono={mono}
                  left={<strong>{p.finalYear ? `Final-year project: ${p.name}` : p.name}</strong>}
                  right={p.link ? displayUrl(p.link) : undefined}
                />
                {p.technologies.trim() ? (
                  <div
                    style={{
                      color: MUTED,
                      fontFamily: mono ? MONO : undefined,
                      fontSize: mono ? 12 : undefined,
                    }}
                  >
                    Technologies: {splitList(p.technologies).join(", ")}
                  </div>
                ) : null}
                <Bullets text={p.bullets} />
              </div>
            ))}
        </>
      );
    case "skills":
      return (
        <Skills items={splitList(doc.skills)} accent={doc.style.accent} variant={theme.skills} />
      );
    case "certifications":
      return (
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {doc.certifications
            .filter((c) => c.name.trim())
            .map((c) => (
              <li key={c.id}>
                {[c.name, c.issuer].filter(Boolean).join(", ")}
                {c.year ? ` (${c.year})` : ""}
              </li>
            ))}
        </ul>
      );
    case "languages":
      return (
        <p style={{ margin: 0 }}>
          {doc.languages
            .filter((l) => l.name.trim())
            .map((l) => (l.level ? `${l.name} (${l.level})` : l.name))
            .join(", ")}
        </p>
      );
  }
}
