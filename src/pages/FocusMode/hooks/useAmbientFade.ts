/**
 * useAmbientFade — Smooth crossfades for an ambient-loop <audio> element.
 *
 * WHEN to call:
 *   - `play(src)` when the user picks an ambient track (rain, forest, etc.).
 *     If audio is already playing, it fades the current volume to 0 over 600ms,
 *     swaps the src, then fades up to `targetVolume`. If nothing is playing,
 *     it just fades in.
 *   - `stop()` when the user disables ambient sound. Fades out, then pauses.
 *
 * Pass a ref to a single persistent <audio loop> element rendered in the page.
 * `targetVolume` is read fresh on each play() call, so it stays reactive to
 * a volume slider without needing to re-bind callbacks.
 */
import { useCallback, useEffect, useRef } from 'react';

const FADE_MS = 600;

export function useAmbientFade(
  audioRef: React.RefObject<HTMLAudioElement | null>,
  targetVolume: number,
): { play: (src: string) => void; stop: () => void } {
  const rafRef = useRef<number | null>(null);
  const targetRef = useRef(targetVolume);
  targetRef.current = targetVolume;

  const cancelRamp = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const ramp = useCallback((to: number, onDone?: () => void) => {
    const el = audioRef.current;
    if (!el) {
      onDone?.();
      return;
    }
    cancelRamp();
    const from = el.volume;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / FADE_MS);
      const v = from + (to - from) * t;
      try {
        el.volume = Math.max(0, Math.min(1, v));
      } catch {
        // ignore — element may have been removed mid-ramp
      }
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
        onDone?.();
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [audioRef]);

  const play = useCallback((src: string) => {
    const el = audioRef.current;
    if (!el) return;

    // Already playing something — crossfade: ramp current to 0, swap src,
    // start the new track at 0, ramp up to target.
    if (!el.paused && el.src) {
      ramp(0, () => {
        try {
          el.src = src;
          el.volume = 0;
          const p = el.play();
          if (p && typeof p.catch === 'function') {
            // play() may reject if the gesture chain expired during the
            // 600 ms fadeout. Recover by leaving volume at target so the
            // user's next interaction (or the volume slider) reactivates
            // playback at the right level.
            p.then(() => ramp(targetRef.current))
             .catch(() => { try { el.volume = targetRef.current; } catch { /* noop */ } });
          } else {
            ramp(targetRef.current);
          }
        } catch { /* swallow */ }
      });
      return;
    }

    // Cold start — set src, volume = target, play synchronously inside
    // the user gesture. No ramp here: ramping FROM 0 means a play()
    // that succeeds but then has its volume.write contended by the live
    // useEffect on `volume` ends up effectively muted, which is the bug
    // that broke ambient on cold-start. Match the original behaviour:
    // play at full target volume immediately.
    try {
      if (el.src !== src) el.src = src;
      el.volume = targetRef.current;
      const p = el.play();
      if (p && typeof p.catch === 'function') p.catch(() => { /* autoplay blocked */ });
    } catch { /* swallow */ }
  }, [audioRef, ramp]);

  const stop = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    ramp(0, () => {
      try { el.pause(); } catch { /* noop */ }
    });
  }, [audioRef, ramp]);

  useEffect(() => () => cancelRamp(), []);

  return { play, stop };
}
