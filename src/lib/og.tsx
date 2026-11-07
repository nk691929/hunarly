import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };

/** Branded 1200x630 social image. Used by opengraph-image and twitter-image. */
export function renderOgImage(title: string, subtitle: string) {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#12162B",
        padding: 80,
        color: "#fff",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <svg width="88" height="88" viewBox="0 0 32 32">
          <rect width="32" height="32" rx="9" fill="#3140D8" />
          <path
            d="M10.5 9v14M21.5 13v10M10.5 18l11-4"
            fill="none"
            stroke="#fff"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <circle cx="21.5" cy="8.5" r="2.5" fill="#F4B13A" />
        </svg>
        <div style={{ fontSize: 48, fontWeight: 700 }}>Hunarly</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ fontSize: 84, fontWeight: 700, lineHeight: 1.05 }}>{title}</div>
        <div style={{ fontSize: 32, color: "#A0A7C8", maxWidth: 900 }}>{subtitle}</div>
      </div>
    </div>,
    ogSize,
  );
}
