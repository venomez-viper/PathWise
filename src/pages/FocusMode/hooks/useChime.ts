/**
 * useChime — End-of-pomodoro soft bell tone, synthesized via Web Audio.
 *
 * WHEN to call:
 *   Call `play()` at the moment a pomodoro phase boundary fires (work→break,
 *   break→work, or session complete). Lazy-initialises the AudioContext on the
 *   first invocation so we never trigger autoplay-policy warnings before a
 *   user gesture has occurred.
 *
 * Tone profile: sine 880Hz → 660Hz over 1.4s with a soft attack/decay envelope.
 * No external assets. Errors (Safari private mode, locked-down browsers) are
 * swallowed silently — chiming is an enhancement, never a hard requirement.
 */
import { useCallback, useRef } from 'react';

type AudioCtxCtor = typeof AudioContext;

export function useChime(): { play: () => void } {
  const ctxRef = useRef<AudioContext | null>(null);

  const play = useCallback(() => {
    try {
      if (!ctxRef.current) {
        const Ctor: AudioCtxCtor | undefined =
          typeof window !== 'undefined'
            ? window.AudioContext ??
              (window as unknown as { webkitAudioContext?: AudioCtxCtor }).webkitAudioContext
            : undefined;
        if (!Ctor) return;
        ctxRef.current = new Ctor();
      }

      const ctx = ctxRef.current;
      if (ctx.state === 'suspended') {
        void ctx.resume();
      }

      const now = ctx.currentTime;
      const duration = 1.4;

      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(660, now + duration);

      const gain = ctx.createGain();
      // Soft attack (80ms) → sustain → smooth decay
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.25, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + duration + 0.05);
    } catch {
      // Some browsers (Safari private, hardened modes) throw on construction
      // or when not yet user-activated. Chime is non-essential — fail silent.
    }
  }, []);

  return { play };
}
