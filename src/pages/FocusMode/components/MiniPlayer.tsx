/**
 * MiniPlayer
 * ----------
 * Floating mini-player for Focus Mode. Renders fixed bottom-right when the
 * page is hidden / not focused so the user can still see the timer + control
 * playback from a different tab or window.
 *
 * Contract:
 *  - Parent computes `visible` (typically via document.visibilityState !==
 *    'visible'). When false, this component returns null — nothing in the DOM.
 *  - Parent owns the timer (`secondsLeft`, `phase`, `running`) and the
 *    ambient track state (`ambientLabel`, `ambientIcon`). This component is
 *    presentational only; play/pause and dismiss are dispatched via callbacks.
 *  - `onTogglePlay` flips running. `onDismiss` hides the mini-player (parent
 *    is expected to suppress it for the remainder of the session, or until
 *    visibility changes again — that policy is owned by the parent).
 *
 * Visual: 220px white card, copper-accented phase pill, MM:SS countdown,
 * ambient icon+label, slide-in animation from translateY(16px) → 0 over 300ms.
 * Inline styles only — no external deps.
 */

import { useEffect, useState, type CSSProperties, type JSX } from 'react';

const COPPER = '#8b4f2c';
const COPPER_SOFT = '#f7ece4';
const TEAL = 'var(--secondary, #006a62)';
const TEAL_SOFT = '#e0f4f2';
const INK = '#1f2a2c';
const INK_SOFT = '#5a6a6c';
const BORDER = '#e6e0d8';

function formatMMSS(total: number): string {
  const s = Math.max(0, Math.floor(total || 0));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
}

function PlayIcon(): JSX.Element {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseIcon(): JSX.Element {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </svg>
  );
}

function CloseIcon(): JSX.Element {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function MiniPlayer({
  visible,
  secondsLeft,
  phase,
  running,
  ambientLabel,
  ambientIcon,
  onTogglePlay,
  onDismiss,
}: {
  visible: boolean;
  secondsLeft: number;
  phase: 'work' | 'break';
  running: boolean;
  ambientLabel: string | null;
  ambientIcon: string | null;
  onTogglePlay: () => void;
  onDismiss: () => void;
}): JSX.Element | null {
  // animate in: when visible flips true, run a 300ms transition from
  // translateY(16px)/opacity 0 → translateY(0)/opacity 1.
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (!visible) {
      setEntered(false);
      return;
    }
    // Next frame → trigger the transition.
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, [visible]);

  if (!visible) return null;

  const isWork = phase === 'work';
  const pillBg = isWork ? COPPER_SOFT : TEAL_SOFT;
  const pillFg = isWork ? COPPER : TEAL;
  const pillLabel = isWork ? 'Focus' : 'Break';

  const root: CSSProperties = {
    position: 'fixed',
    bottom: 16,
    right: 16,
    zIndex: 60,
    width: 220,
    background: '#ffffff',
    border: `1px solid ${BORDER}`,
    borderRadius: 14,
    boxShadow: '0 12px 32px rgba(20, 24, 26, 0.18)',
    padding: 12,
    fontFamily: 'inherit',
    color: INK,
    transform: entered ? 'translateY(0)' : 'translateY(16px)',
    opacity: entered ? 1 : 0,
    transition: 'transform 300ms ease, opacity 300ms ease',
    willChange: 'transform, opacity',
  };

  const headerRow: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  };

  const pill: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    padding: '3px 8px',
    borderRadius: 999,
    background: pillBg,
    color: pillFg,
    border: `1px solid ${isWork ? COPPER : 'rgba(0,106,98,0.25)'}`,
  };

  const dismissBtn: CSSProperties = {
    background: 'transparent',
    border: 'none',
    color: INK_SOFT,
    cursor: 'pointer',
    padding: 4,
    borderRadius: 6,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const timerText: CSSProperties = {
    fontSize: 28,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: '0.02em',
    color: INK,
    marginTop: 6,
    lineHeight: 1.1,
  };

  const ambientRow: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 10,
    paddingTop: 10,
    borderTop: `1px solid ${BORDER}`,
  };

  const ambientLeft: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
  };

  const ambientIconStyle: CSSProperties = {
    fontSize: 16,
    lineHeight: 1,
    width: 20,
    textAlign: 'center',
  };

  const ambientLabelStyle: CSSProperties = {
    fontSize: 12,
    color: INK_SOFT,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: 120,
  };

  const playBtn: CSSProperties = {
    background: COPPER,
    border: 'none',
    color: '#ffffff',
    width: 28,
    height: 28,
    borderRadius: 999,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 6px rgba(139, 79, 44, 0.25)',
  };

  return (
    <div
      role="region"
      aria-label="Focus mini player"
      aria-live="polite"
      style={root}
    >
      <div style={headerRow}>
        <span style={pill} aria-label={`${pillLabel} phase`}>
          {pillLabel}
        </span>
        <button
          type="button"
          onClick={onDismiss}
          style={dismissBtn}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              '#f1ede7';
            (e.currentTarget as HTMLButtonElement).style.color = INK;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              'transparent';
            (e.currentTarget as HTMLButtonElement).style.color = INK_SOFT;
          }}
          aria-label="Dismiss mini player"
        >
          <CloseIcon />
        </button>
      </div>

      <div style={timerText} aria-label={`Time remaining ${formatMMSS(secondsLeft)}`}>
        {formatMMSS(secondsLeft)}
      </div>

      <div style={ambientRow}>
        <div style={ambientLeft}>
          {ambientLabel ? (
            <>
              <span style={ambientIconStyle} aria-hidden="true">
                {ambientIcon ?? '♪'}
              </span>
              <span style={ambientLabelStyle} title={ambientLabel}>
                {ambientLabel}
              </span>
            </>
          ) : (
            <span style={{ ...ambientLabelStyle, fontStyle: 'italic' }}>
              No ambient
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onTogglePlay}
          style={playBtn}
          aria-label={running ? 'Pause timer' : 'Resume timer'}
          aria-pressed={running}
        >
          {running ? <PauseIcon /> : <PlayIcon />}
        </button>
      </div>
    </div>
  );
}

export default MiniPlayer;
