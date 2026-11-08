# ADR 0006: PDF export through a print page

Status: accepted

Decision: Render PDFs by loading an internal `/print` page in headless Chromium (Playwright) and
printing it. The document is injected into the page before it loads. The page renders the template
on the client.

Alternatives considered

- `@react-pdf/renderer`: every template would need a second implementation, so preview and PDF
  would drift.
- Rendering HTML on the server and passing it to the browser: Next.js restricts
  `react-dom/server` in server code, and it would lose the app's fonts and CSS.
- A URL or token that carries the document: needs storage or very long URLs, and adds a path where
  resume content could leak into logs.

Consequences

- Same template code and fonts for preview and PDF.
- Needs a browser at runtime (see docs/pdf-export.md for deployment).
- `/print` is public but shows nothing without an injected document, and is excluded from robots.
- The PDF engine sits behind `PdfRenderer`, so it can move to a separate service later.
