/**
 * useDocumentTitle — Live-updates the browser tab title with the pomodoro
 * countdown so the user can glance at any background tab and see remaining time.
 *
 * WHEN to call:
 *   Call once at the top of the FocusMode page, passing the live timer state.
 *   - `running === true`  → title becomes "MM:SS — Focus | PathWise" (or Break)
 *   - `running === false` → restores whatever the title was when the hook
 *     mounted (typical SPA case: "PathWise" or the prior route title)
 *   On unmount the original title is always restored.
 */
import { useEffect, useRef } from 'react';

const pad = (n: number) => n.toString().padStart(2, '0');
const fmt = (secs: number) => {
  const safe = Math.max(0, Math.floor(secs));
  return `${pad(Math.floor(safe / 60))}:${pad(safe % 60)}`;
};

export function useDocumentTitle(
  secondsLeft: number,
  phase: 'work' | 'break',
  running: boolean,
): void {
  const originalRef = useRef<string | null>(null);

  // Capture the original title exactly once, on first mount.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    originalRef.current = document.title;
    return () => {
      if (originalRef.current !== null) {
        document.title = originalRef.current;
      }
    };
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (running) {
      const label = phase === 'work' ? 'Focus' : 'Break';
      document.title = `${fmt(secondsLeft)} — ${label} | PathWise`;
    } else if (originalRef.current !== null) {
      document.title = originalRef.current;
    }
  }, [secondsLeft, phase, running]);
}
