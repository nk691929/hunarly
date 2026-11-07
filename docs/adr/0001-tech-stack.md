# ADR 0001: Tech stack

Status: accepted

Decision: Next.js (App Router) with strict TypeScript, Tailwind CSS 4, shadcn-style components,
pnpm, Vitest, ESLint 9 flat config.

Why: Server Components keep marketing pages light for Core Web Vitals; Tailwind tokens in CSS
variables give dark mode with no JS cost; owning the UI components avoids a heavy UI dependency.

Consequences: Tooling versions move quickly. The lockfile pins versions after the first install.
