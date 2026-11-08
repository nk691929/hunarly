/** Pure undo/redo history. The store decides when edits are merged (coalesced) into one step. */
export const MAX_HISTORY = 100;
export const COALESCE_WINDOW_MS = 1200;

export interface History<T> {
  past: T[];
  present: T;
  future: T[];
}

export interface LastEdit {
  key: string;
  at: number;
}

export function createHistory<T>(present: T): History<T> {
  return { past: [], present, future: [] };
}

/** Keep typing in one field as a single undo step: same key, within the time window. */
export function shouldCoalesce(
  last: LastEdit | null,
  key: string,
  now: number,
  windowMs: number = COALESCE_WINDOW_MS,
): boolean {
  return last !== null && last.key === key && now - last.at < windowMs;
}

export function commit<T>(history: History<T>, next: T, coalesce: boolean): History<T> {
  if (coalesce) return { past: history.past, present: next, future: [] };
  return {
    past: [...history.past.slice(-(MAX_HISTORY - 1)), history.present],
    present: next,
    future: [],
  };
}

export function undo<T>(history: History<T>): History<T> {
  const previous = history.past.at(-1);
  if (previous === undefined) return history;
  return {
    past: history.past.slice(0, -1),
    present: previous,
    future: [history.present, ...history.future],
  };
}

export function redo<T>(history: History<T>): History<T> {
  const [next, ...rest] = history.future;
  if (next === undefined) return history;
  return { past: [...history.past, history.present], present: next, future: rest };
}
