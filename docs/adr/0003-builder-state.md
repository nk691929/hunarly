# ADR 0003: Builder state

Status: accepted

Decision: One Zustand store holds the whole resume document and its undo history. Inputs are
controlled and write straight to the store. Zod validates each field and the whole document, and
errors show after a field loses focus.

Why not React Hook Form: the document is also read by the live preview, undo/redo and autosave.
Keeping a second form state in sync with the store causes loops and breaks undo. A single source of
truth is simpler and testable without a browser.

Details

- Typing in one field is merged into one undo step (same key, 1.2 s window); structural changes
  (add, remove, reorder, mode, load sample) are separate steps. History is capped at 100 steps.
- Drafts are saved to localStorage 600 ms after the last change and flushed when the tab is hidden.
  The saved envelope is versioned (`version: 1`) and validated on load; invalid data is ignored.
- The schema carries `schemaVersion`. When it changes, bump it and add a migration in
  `draft-storage.ts`.
