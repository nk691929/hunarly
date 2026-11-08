/**
 * Caps how many expensive jobs (headless browser renders) run at once.
 * `tryAcquire` returns a release function, or null when the limit is reached.
 */
export function createSemaphore(max: number) {
  let active = 0;
  return {
    tryAcquire(): (() => void) | null {
      if (active >= max) return null;
      active += 1;
      let released = false;
      return () => {
        if (released) return;
        released = true;
        active -= 1;
      };
    },
    get active() {
      return active;
    },
  };
}
