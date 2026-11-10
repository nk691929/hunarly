# Hunarly

Premium, ATS-friendly resume builder for fresh graduates, career changers and remote job seekers worldwide.

> Status: **M0 to M2 complete** (tooling, design system, landing, pricing, legal, SEO foundation). See
> `docs/roadmap.md`.

## Setup (under 5 minutes)

Requirements: Node 20.9+ (Node 22 recommended, see `.nvmrc`) and [pnpm](https://pnpm.io/installation).

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open http://localhost:3000. The design system reference is at http://localhost:3000/design.

## Scripts

| Command              | What it does                        |
| -------------------- | ----------------------------------- |
| `pnpm dev`           | Start the dev server                |
| `pnpm build`         | Production build                    |
| `pnpm lint`          | ESLint                              |
| `pnpm typecheck`     | TypeScript strict check             |
| `pnpm format`        | Prettier write                      |
| `pnpm test`          | Unit tests (Vitest)                 |
| `pnpm test:coverage` | Unit tests with coverage thresholds |

## Project structure

```
src/app          routes, layouts, metadata
src/components   ui/ (shadcn-style primitives), brand/ (logo)
src/config       env.ts (Zod validated), site.ts (brand + nav)
src/features     self-contained feature modules (added from M3)
src/lib          shared helpers
src/server       server-only code and provider interfaces (added from M5)
src/styles       globals.css (design tokens)
tests/           unit tests
docs/            ADRs, guides
```

## Brand

Name: Hunarly (from _hunar_, Urdu for "skill"; the product is international). Colors: Ink `#12162B`, Paper `#F6F6F3`,
Lapis `#3140D8`, Spark `#F4B13A`. Fonts: Bricolage Grotesque (display), Instrument Sans (body).
Logo files: `public/logo.svg`, `src/app/icon.svg`, `src/components/brand/`.

## Git workflow

See `docs/git-workflow.md`. Commits follow Conventional Commits and are checked by commitlint.
