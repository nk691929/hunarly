# Adding a template

A template is one folder plus one registry line. The builder, the picker, the thumbnails and the
tests all read the registry, so nothing else changes.

## 1. Create the folder

`src/features/templates/<id>/index.tsx`. Copy `modern/index.tsx` and change:

- `id` (kebab-case, never change it later: saved resumes store it)
- `name` and `description` (shown in the picker)
- `tier`: `"free"` or `"pro"` (limits are enforced on the server in M7)
- `defaultStyle`: accent color (must have 4.5:1 contrast on white), font, spacing
- `theme`: pick a header, heading, skills and links style and set sizes. See
  `_shared/theme.ts` for the options.

Need a look the theme cannot express? Write your own component instead of `ThemedTemplate`. It
receives `{ document }` and must follow the ATS rules below. Reuse `_shared/section-body.tsx`.

## 2. Register it

In `src/features/templates/registry.ts`, import it and add it to the `templates` array.

## 3. Test it

The shared test suite already covers every registered template: snapshot, ATS rules, accent,
font, spacing, remote mode and unsafe links. Create the snapshot and review it:

```bash
pnpm vitest run tests/templates -u
git diff tests/templates/__snapshots__
```

Commit the snapshot. Later layout changes show up as snapshot diffs in review.

## ATS rules every template must keep

- One column of real text in reading order. No tables, images, icons-as-text or text boxes.
- Standard section headings (Summary, Experience, Education, Projects, Skills, Certifications,
  Languages). Style them, but do not rename them.
- No `position: absolute` or `float` for content.
- Only http(s) addresses become links (use `LinkText`).
- Keep entries together with `break-inside: avoid` so a page break does not split a job.
- No wide letter-spacing (keep it at 0.03em or less). Wide tracking makes PDF text extraction read
  "SUMMARY" as "S U M M A R Y", and hiring software may miss the section.
- No wide letter-spacing (keep it at 0.03em or less). Wide tracking makes PDF text extraction read
  "SUMMARY" as "S U M M A R Y", and hiring software may miss the section.
