import type { CSSProperties, ReactNode } from "react";
import { isSectionEmpty } from "@/features/resume-builder/document-ops";
import type { TemplateProps } from "@/features/templates/types";
import { HEADINGS, LinkText, SectionBody } from "@/features/templates/_shared/section-body";
import type { HeadingVariant, TemplateTheme } from "@/features/templates/_shared/theme";
import { FONTS, GAP, INK, MONO, MUTED, TEXT } from "@/features/templates/_shared/tokens";

function headingStyle(variant: HeadingVariant, accent: string, mono: boolean): CSSProperties {
  const base: CSSProperties = {
    margin: "0 0 6px",
    fontFamily: mono ? MONO : undefined,
    breakAfter: "avoid",
  };
  switch (variant) {
    case "underline":
      return {
        ...base,
        fontSize: 13.5,
        fontWeight: 700,
        letterSpacing: "0.02em",
        color: accent,
        borderBottom: `1.5px solid ${accent}`,
        paddingBottom: 3,
      };
    case "bar":
      return {
        ...base,
        fontSize: 14,
        fontWeight: 700,
        lineHeight: 1.2,
        color: INK,
        borderLeft: `4px solid ${accent}`,
        paddingLeft: 10,
      };
    case "hairline":
      return {
        ...base,
        fontSize: 11.5,
        fontWeight: 600,
        textTransform: "uppercase",
        color: MUTED,
        borderBottom: "1px solid #d9dbe6",
        paddingBottom: 4,
      };
    case "caps":
      return {
        ...base,
        fontSize: 12.5,
        fontWeight: 700,
        textTransform: "uppercase",
        color: INK,
        borderBottom: `3px double ${accent}`,
        paddingBottom: 3,
      };
    case "pill":
      return {
        ...base,
        fontSize: 13,
        fontWeight: 700,
        color: accent,
        background: `${accent}1a`,
        padding: "4px 10px",
        borderRadius: 6,
        margin: "0 0 8px",
      };
  }
}

/**
 * One renderer for every template. A template is a theme (header, heading, skills and link
 * styles, sizes) plus defaults. Single column, standard headings and real text keep the output
 * readable by applicant tracking systems.
 */
export function ThemedTemplate({ document: doc, theme }: TemplateProps & { theme: TemplateTheme }) {
  const { profile, style } = doc;
  const accent = style.accent;
  const gap = GAP[style.spacing];
  const band = theme.header === "band";
  const center = theme.header === "center";

  const personal = [profile.email, profile.phone, profile.location].filter(Boolean);
  const links = profile.links.filter((l) => l.url.trim());
  const linkNode = (l: (typeof links)[number]) => (
    <>
      {l.label ? `${l.label}: ` : ""}
      <LinkText url={l.url} />
    </>
  );

  const inlineItems: ReactNode[] = [...personal];
  if (theme.links === "inline") {
    for (const l of links) inlineItems.push(<span key={l.id}>{linkNode(l)}</span>);
  }

  const remoteLine =
    doc.mode === "remote"
      ? [
          profile.timezone && `Time zone: ${profile.timezone}`,
          profile.availability && `Availability: ${profile.availability}`,
        ].filter(Boolean)
      : [];

  const subtle = band ? "rgba(255,255,255,0.88)" : MUTED;
  const chipBorder = band ? "rgba(255,255,255,0.6)" : accent;

  return (
    <div
      style={{
        fontFamily: FONTS[style.font],
        fontSize: theme.bodySize,
        lineHeight: 1.45,
        color: TEXT,
      }}
    >
      <header
        style={{
          padding: band ? `40px ${theme.padX}px 26px` : `${theme.padY}px ${theme.padX}px 0`,
          background: band ? accent : undefined,
          color: band ? "#ffffff" : undefined,
          textAlign: center ? "center" : "left",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: theme.nameSize,
            fontWeight: theme.nameWeight,
            letterSpacing: theme.nameTracking,
            lineHeight: 1.15,
            color: profile.fullName
              ? band
                ? "#ffffff"
                : INK
              : band
                ? "rgba(255,255,255,0.6)"
                : "#9aa0b8",
          }}
        >
          {profile.fullName || "Your name"}
        </h1>
        {profile.headline ? (
          <p
            style={{
              margin: "4px 0 0",
              fontSize: 15,
              fontWeight: 500,
              color: band ? "rgba(255,255,255,0.92)" : accent,
            }}
          >
            {profile.headline}
          </p>
        ) : null}
        {inlineItems.length > 0 ? (
          <p style={{ margin: "6px 0 0", color: subtle, fontSize: 12 }}>
            {inlineItems.map((item, i) => (
              <span key={i}>
                {i > 0 ? " | " : ""}
                {item}
              </span>
            ))}
          </p>
        ) : null}
        {theme.links === "chips" && links.length > 0 ? (
          <ul
            style={{
              margin: "8px 0 0",
              padding: 0,
              listStyle: "none",
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
              justifyContent: center ? "center" : "flex-start",
            }}
          >
            {links.map((l) => (
              <li
                key={l.id}
                style={{
                  border: `1px solid ${chipBorder}`,
                  color: band ? "#ffffff" : accent,
                  borderRadius: 4,
                  padding: "1px 8px",
                  fontFamily: MONO,
                  fontSize: 11.5,
                }}
              >
                {linkNode(l)}
              </li>
            ))}
          </ul>
        ) : null}
        {remoteLine.length > 0 ? (
          <p
            style={{
              margin: "4px 0 0",
              color: subtle,
              fontSize: 12,
              fontFamily: theme.mono ? MONO : undefined,
            }}
          >
            {remoteLine.join(" | ")}
          </p>
        ) : null}
      </header>

      {/* No bottom padding: spacing below the last line comes from the page margin, so a PDF never ends with a blank page. */}
      <div style={{ padding: `${band ? 4 : 0}px ${theme.padX}px 0` }}>
        {doc.sectionOrder
          .filter((id) => !isSectionEmpty(doc, id))
          .map((id) => (
            <section key={id} style={{ marginTop: gap }}>
              <h2 style={headingStyle(theme.heading, accent, theme.mono)}>{HEADINGS[id]}</h2>
              <SectionBody id={id} doc={doc} theme={theme} />
            </section>
          ))}
      </div>
    </div>
  );
}
