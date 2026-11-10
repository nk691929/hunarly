# ADR 0005: Accounts and resume storage

Status: accepted

Decisions

- Auth.js with database sessions (Prisma adapter), Google plus email links. No passwords.
- Accounts are optional at build and run time. Without configuration the site is in guest mode.
- Resumes are stored as one validated JSON document (`content`) plus `title` and `templateId`
  columns for listing. The Zod schema is the contract; the server validates every write and strips
  unknown fields.
- A repository interface sits between the service and Prisma. The service owns validation and
  ownership rules and is tested with an in-memory repository.
- Every query is scoped by the signed-in user's id, so a resume id alone never grants access.
- No middleware: pages check the session on the server. Marketing pages do not read the session,
  so they stay static for performance and SEO.
- Autosave runs one save at a time, in order, and flushes when the tab is hidden or closed.

Guest drafts move to an account through an explicit "Add to my account" step on the dashboard, and
the local draft is cleared only after the server confirms the import.

Not yet done (later milestones): one-resume limit for the free plan (M7), rate limiting on saves
and sign-in emails (M10), account data export and deletion (M10).
