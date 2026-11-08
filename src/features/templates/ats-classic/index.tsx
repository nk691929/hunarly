import type { CSSProperties, ReactNode } from "react";
import { isSectionEmpty } from "@/features/resume-builder/document-ops";
import { formatDateRange, splitLines, splitList } from "@/features/resume-builder/format";
import type { ResumeDocument, SectionId } from "@/features/resume-builder/schema";
import { displayUrl, isHttpUrl, normalizeUrl } from "@/features/resume-builder/urls";
import type { TemplateDefinition, TemplateProps } from "@/features/templates/types";

/**
 * ATS Classic: one column, standard headings, real text, no tables or images.
 * Sizes are in px because the preview and PDF render the page at a fixed A4 width.
 */
const FONTS = {
  sans: "var(--font-body), Arial, Helvetica, sans-serif",
  serif: 'Georgia, "Times New Roman", serif',
} as const;
const GAP = { compact: 10, comfortable: 14, relaxed: 18 } as const;

const HEADINGS: Record<SectionId, string> = {
  summary: "Summary",
  experience: "Experience",
  education: "Education",
  projects: "Projects",
  skills: "Skills",
  certifications: "Certifications",
  languages: "Languages",
};

const muted = "#555b73";
const noBreak: CSSProperties = { breakInside: "avoid" };

function Row({ left, right }: { left: ReactNode; right?: string }) {
  return (
    <div
      style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "baseline" }}
    >
      <div>{left}</div>
      {right ? (
        <div style={{ color: muted, whiteSpace: "nowrap", fontSize: 12 }}>{right}</div>
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

function LinkText({ url }: { url: string }) {
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

function SectionBody({ id, doc }: { id: SectionId; doc: ResumeDocument }) {
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
                  left={<strong>{e.role}</strong>}
                  right={formatDateRange(e.start, e.end, e.current)}
                />
                <div style={{ color: muted }}>
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
                  left={<strong>{e.degree}</strong>}
                  right={formatDateRange(e.start, e.end, false)}
                />
                <div style={{ color: muted }}>
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
                  left={<strong>{p.finalYear ? `Final-year project: ${p.name}` : p.name}</strong>}
                  right={p.link ? displayUrl(p.link) : undefined}
                />
                {p.technologies.trim() ? (
                  <div style={{ color: muted }}>
                    Technologies: {splitList(p.technologies).join(", ")}
                  </div>
                ) : null}
                <Bullets text={p.bullets} />
              </div>
            ))}
        </>
      );
    case "skills":
      return <p style={{ margin: 0 }}>{splitList(doc.skills).join(", ")}</p>;
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

function AtsClassic({ document: doc }: TemplateProps) {
  const { profile, style } = doc;
  const accent = style.accent;
  const gap = GAP[style.spacing];

  const contact: ReactNode[] = [];
  if (profile.email) contact.push(profile.email);
  if (profile.phone) contact.push(profile.phone);
  if (profile.location) contact.push(profile.location);
  for (const link of profile.links) {
    if (!link.url.trim()) continue;
    contact.push(
      <span key={link.id}>
        {link.label ? `${link.label}: ` : ""}
        <LinkText url={link.url} />
      </span>,
    );
  }

  const remoteLine =
    doc.mode === "remote"
      ? [
          profile.timezone && `Time zone: ${profile.timezone}`,
          profile.availability && `Availability: ${profile.availability}`,
        ].filter(Boolean)
      : [];

  return (
    <div
      style={{
        fontFamily: FONTS[style.font],
        fontSize: 13,
        lineHeight: 1.45,
        color: "#1a1d2e",
        padding: "48px 52px",
      }}
    >
      <header style={{ marginBottom: gap }}>
        <h1
          style={{
            margin: 0,
            fontSize: 28,
            lineHeight: 1.15,
            fontWeight: 700,
            color: profile.fullName ? "#12162b" : "#9aa0b8",
          }}
        >
          {profile.fullName || "Your name"}
        </h1>
        {profile.headline ? (
          <p style={{ margin: "4px 0 0", fontSize: 15, fontWeight: 500, color: accent }}>
            {profile.headline}
          </p>
        ) : null}
        {contact.length > 0 ? (
          <p style={{ margin: "6px 0 0", color: muted, fontSize: 12 }}>
            {contact.map((item, i) => (
              <span key={i}>
                {i > 0 ? " | " : ""}
                {item}
              </span>
            ))}
          </p>
        ) : null}
        {remoteLine.length > 0 ? (
          <p style={{ margin: "2px 0 0", color: muted, fontSize: 12 }}>{remoteLine.join(" | ")}</p>
        ) : null}
      </header>

      {doc.sectionOrder
        .filter((id) => !isSectionEmpty(doc, id))
        .map((id) => (
          <section key={id} style={{ marginTop: gap }}>
            <h2
              style={{
                margin: "0 0 6px",
                fontSize: 13.5,
                fontWeight: 700,
                letterSpacing: "0.02em",
                color: accent,
                borderBottom: `1.5px solid ${accent}`,
                paddingBottom: 3,
              }}
            >
              {HEADINGS[id]}
            </h2>
            <SectionBody id={id} doc={doc} />
          </section>
        ))}
    </div>
  );
}

export const atsClassic: TemplateDefinition = {
  id: "ats-classic",
  name: "ATS Classic",
  description: "A clean single-column layout that hiring software reads reliably.",
  atsSafe: true,
  Component: AtsClassic,
};
