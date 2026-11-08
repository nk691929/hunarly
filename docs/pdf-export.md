# PDF export

## How it works

1. The builder sends the current resume to `POST /api/pdf`.
2. The API checks the request (same origin, size, valid document, rate limit), decides whether the
   file gets the free-plan footer, and asks the PDF renderer for the file.
3. The renderer opens headless Chromium, which loads the app's own `/print` page. The resume is
   placed on `window` before the page loads (nothing goes through the URL or is stored).
4. `/print` draws the resume with the same template code and fonts as the preview, and Chromium
   prints it. The result is a real PDF with selectable text, not an image.

Because one template feeds both the preview and the PDF, they cannot drift apart.

## One-time setup

```bash
pnpm add playwright
pnpm add -D pdfjs-dist
pnpm exec playwright install chromium     # downloads a browser, roughly 150 to 300 MB
```

Restart `pnpm dev` after adding `serverExternalPackages` to `next.config.ts` (already done).

The renderer opens `NEXT_PUBLIC_SITE_URL` (default `http://localhost:3000`). If your dev server
runs on another port, set `PDF_BASE_URL` in `.env.local`.

To see the clean (Pro) output while developing, set `DEV_PRO_UNLOCK=1` in `.env.local`. It only
works when `NODE_ENV` is `development`.

## Checking that hiring software can read it

`tests/pdf/pdf-ats.integration.test.ts` renders every template to a PDF, reads the text back out
the way an applicant tracking system does, and checks the name and section headings come out in
order. It is skipped unless you opt in (it needs the app running and Chromium installed):

```bash
# terminal 1
pnpm dev
# terminal 2 (PowerShell)
$env:RUN_PDF_TESTS="1"; pnpm vitest run tests/pdf
```

CI will run it against a built app in M12.

## Page layout

- A4, 12 mm margin at the top of pages 2 and later and at the bottom of every page. Page 1 has no
  top margin so templates (like the Fresher-Friendly header band) can reach the edge.
- Entries are kept together (`break-inside: avoid`), and headings stay with the text that follows.
- The preview marks where page 2 starts. It is a close estimate: an entry that does not fit can
  move to the next page, so the real break may be a little earlier.
- The free-plan footer ("Made with Hunarly") is drawn in the bottom page margin, so it never
  overlaps the resume. It needs a Chromium with CSS margin-box support (Chromium 131 or newer; the
  version Playwright installs is newer). The integration test checks the footer appears.

## Safety limits

- Same-origin requests only; bodies over 250 KB are refused.
- 8 PDFs per minute per person (signed-in user, or IP address for guests), at most 2 renders at
  once. Both are in memory for now; M10 moves the rate limit to a shared store.
- The browser can only load files from the app's own address, and the address comes from
  configuration, never from the request.
- Resume content is never logged. Errors log only a type (unavailable, timeout, failed).

## Deploying (M12)

Chromium needs more space and memory than most serverless functions allow. Two options, both
behind the `PdfRenderer` interface in `src/server/providers/pdf/`:

- Use `@sparticuz/chromium` with `playwright-core` on a host with a large enough function limit.
- Run the renderer as a small container service (recommended if cold starts or size limits hurt).

Fonts: resumes use standard system fonts (Arial, with Liberation Sans as a metric-compatible fallback
on servers) instead of the site's web fonts. Chromium's PDF output squeezed the spaces out of
variable web fonts, which hurts both looks and text extraction. The same fonts are used in the
preview, so line and page breaks match.
