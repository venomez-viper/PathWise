/**
 * BreathworkInterlude
 * -------------------
 * 60-second box-breathing pacer overlay. Mounted by the parent on a
 * work -> break transition; unmounted when `onComplete` or `onSkip` fires.
 *
 * Box pattern: inhale 4s -> hold 4s -> exhale 4s -> hold 4s, repeated
 * for 4 cycles (~60s total). The centred ring scales smoothly to
 * visualise the current phase (0.6 -> 1.0 on inhale, hold large,
 * 1.0 -> 0.6 on exhale, hold small) with a CSS transition matching the
 * 4-second phase length.
 *
 * Contract:
 *   - Calls `onComplete()` exactly once after 60s of running.
 *   - Calls `onSkip()` if the user clicks Skip (parent decides whether
 *     to short-circuit to the break).
 *   - Honours `prefers-reduced-motion: reduce` — the ring scale animation
 *     is suppressed; phase label and seconds counter still update.
 *   - Inline styles only (no external CSS).
 */

import { useEffect, useRef, useState, type JSX } from 'react';

type Phase = 'inhale' | 'hold-in' | 'exhale' | 'hold-out';

const PHASE_ORDER: Phase[] = ['inhale', 'hold-in', 'exhale', 'hold-out'];
const PHASE_SECONDS = 4;
const TOTAL_CYCLES = 4; // 4 phases * 4s * 4 cycles = 64s; we cap at 60s
const TOTAL_DURATION_S = 60;

const PHASE_LABEL: Record<Phase, string> = {
  inhale: 'Inhale',
  'hold-in': 'Hold',
  exhale: 'Exhale',
  'hold-out': 'Hold',
};

function phaseScale(phase: Phase): number {
  // Target scale at the END of this phase. The ring transitions to this
  // value over PHASE_SECONDS, producing the box-breathing rhythm.
  switch (phase) {
    case 'inhale':
      return 1.0;
    case 'hold-in':
      return 1.0;
    case 'exhale':
      return 0.6;
    case 'hold-out':
      return 0.6;
  }
}

export function BreathworkInterlude({
  onComplete,
  onSkip,
}: {
  onComplete: () => void;
  onSkip: () => void;
}): JSX.Element {
  const [elapsed, setElapsed] = useState(0); // total seconds elapsed
  const [reduced, setReduced] = useState(false);
  const completedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 1;
        if (next >= TOTAL_DURATION_S && !completedRef.current) {
          completedRef.current = true;
          window.clearInterval(interval);
          // Defer the callback so the state update flushes first.
          window.setTimeout(() => onComplete(), 0);
          return TOTAL_DURATION_S;
        }
        return next;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [onComplete]);

  // Determine current phase from elapsed.
  const phaseIndex = Math.floor(elapsed / PHASE_SECONDS) % PHASE_ORDER.length;
  const phase: Phase = PHASE_ORDER[phaseIndex];
  const secondInPhase = elapsed % PHASE_SECONDS;
  const secondsRemainingInPhase = PHASE_SECONDS - secondInPhase;
  const cyclesCompleted = Math.floor(elapsed / (PHASE_SECONDS * PHASE_ORDER.length));

  // Ring scale: at the start of each phase we set the *target* end-of-phase
  // scale and let CSS transition over PHASE_SECONDS.
  const targetScale = reduced ? 0.85 : phaseScale(phase);

  // Suppress unused-var lint when cycles aren't surfaced to UI.
  void cyclesCompleted;
  void TOTAL_CYCLES;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Box breathing interlude"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15,17,30,0.6)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#f5ecdc',
        fontFamily: 'inherit',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: 240,
          height: 240,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '4px solid #8b4f2c',
            boxShadow: '0 0 60px rgba(139,79,44,0.35), inset 0 0 30px rgba(139,79,44,0.2)',
            transform: `scale(${targetScale})`,
            transition: reduced ? 'none' : `transform ${PHASE_SECONDS}s linear`,
            background: 'radial-gradient(circle, rgba(139,79,44,0.12) 0%, rgba(139,79,44,0.0) 70%)',
          }}
        />
        <div
          style={{
            position: 'relative',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <div
            aria-live="polite"
            style={{
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: '0.04em',
              color: '#f5ecdc',
            }}
          >
            {PHASE_LABEL[phase]}
          </div>
          <div
            aria-hidden="true"
            style={{
              fontSize: 44,
              fontWeight: 300,
              fontVariantNumeric: 'tabular-nums',
              color: '#f5ecdc',
              opacity: 0.9,
              lineHeight: 1,
            }}
          >
            {secondsRemainingInPhase}
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: 36,
          textAlign: 'center',
          maxWidth: 360,
          fontSize: 14,
          lineHeight: 1.5,
          opacity: 0.8,
        }}
      >
        Box breathing &middot; 4-4-4-4 &middot;{' '}
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>
          {Math.max(0, TOTAL_DURATION_S - elapsed)}s remaining
        </span>
      </div>

      <button
        type="button"
        onClick={onSkip}
        aria-label="Skip breathing interlude"
        style={{
          position: 'fixed',
          right: 24,
          bottom: 24,
          padding: '10px 18px',
          background: 'rgba(245,236,220,0.08)',
          border: '1px solid rgba(245,236,220,0.25)',
          color: '#f5ecdc',
          borderRadius: 999,
          fontSize: 13,
          letterSpacing: '0.02em',
          cursor: 'pointer',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          transition: 'background 160ms ease, border-color 160ms ease',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(245,236,220,0.16)';
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(245,236,220,0.45)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(245,236,220,0.08)';
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(245,236,220,0.25)';
        }}
        onFocus={(e) => {
          (e.currentTarget as HTMLButtonElement).style.outline = '2px solid #8b4f2c';
          (e.currentTarget as HTMLButtonElement).style.outlineOffset = '2px';
        }}
        onBlur={(e) => {
          (e.currentTarget as HTMLButtonElement).style.outline = 'none';
        }}
      >
        Skip
      </button>
    </div>
  );
}
