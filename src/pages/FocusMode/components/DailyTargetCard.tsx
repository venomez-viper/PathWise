import { useEffect, useRef, useState, type ReactElement } from 'react';

const COPPER = '#8b4f2c';
const COPPER_TRACK = 'rgba(139, 79, 44, 0.18)';
const RING_SIZE = 56;
const RING_STROKE = 6;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRC = 2 * Math.PI * RING_RADIUS;

export function DailyTargetCard({
  pomodorosCompleted,
  totalFocusSeconds,
  target,
  onTargetChange,
  onPomodoroCompletedExternal,
}: {
  pomodorosCompleted: number;
  totalFocusSeconds: number;
  target: number;
  onTargetChange: (next: number) => void;
  onPomodoroCompletedExternal?: () => void;
}): ReactElement {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<string>(String(target));
  const inputRef = useRef<HTMLInputElement | null>(null);
  const lastCompletedRef = useRef<number>(pomodorosCompleted);

  const safeTarget = Math.max(1, target);
  const ratio = Math.min(1, pomodorosCompleted / safeTarget);
  const complete = pomodorosCompleted >= safeTarget;
  const dashOffset = RING_CIRC * (1 - ratio);
  const minutes = Math.ceil(Math.max(0, totalFocusSeconds) / 60);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);
  useEffect(() => { setDraft(String(target)); }, [target]);

  useEffect(() => {
    if (pomodorosCompleted > lastCompletedRef.current) onPomodoroCompletedExternal?.();
    lastCompletedRef.current = pomodorosCompleted;
  }, [pomodorosCompleted, onPomodoroCompletedExternal]);

  const commit = () => {
    const parsed = Number.parseInt(draft, 10);
    if (!Number.isNaN(parsed)) onTargetChange(Math.min(12, Math.max(1, parsed)));
    setEditing(false);
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14, width: '100%', maxWidth: 720,
      padding: '14px 16px', borderRadius: 14,
      background: 'var(--surface-container-low, var(--surface-container))',
      border: '1px solid var(--outline-variant)', boxSizing: 'border-box',
    }}>
      <div style={{ flexShrink: 0, width: RING_SIZE, height: RING_SIZE, position: 'relative' }}>
        <svg width={RING_SIZE} height={RING_SIZE} role="img"
          aria-label={`${pomodorosCompleted} of ${safeTarget} pomodoros completed`}>
          <circle cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RING_RADIUS}
            fill="none" stroke={COPPER_TRACK} strokeWidth={RING_STROKE} />
          <circle cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RING_RADIUS}
            fill="none" stroke={COPPER} strokeWidth={RING_STROKE} strokeLinecap="round"
            strokeDasharray={RING_CIRC} strokeDashoffset={dashOffset}
            transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
            style={{ transition: 'stroke-dashoffset 320ms ease' }} />
        </svg>
        {complete && (
          <span aria-hidden="true" style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: COPPER, fontSize: 18, fontWeight: 700,
          }}>✓</span>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ fontSize: 14, lineHeight: 1.3 }}>
          <span style={{ color: COPPER, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}>
            {pomodorosCompleted}
          </span>
          <span style={{ color: 'var(--on-surface-variant)' }}>/{safeTarget} pomodoros today</span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>
          {minutes}m focused
        </div>
        <div style={{ marginTop: 4, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8 }}>
          {editing ? (
            <>
              <input ref={inputRef} type="number" min={1} max={12} value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={commit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commit();
                  else if (e.key === 'Escape') { setDraft(String(target)); setEditing(false); }
                }}
                aria-label="Daily pomodoro target"
                style={{ width: 56, padding: '2px 6px', fontSize: 12, borderRadius: 6,
                  border: '1px solid var(--outline-variant)', background: 'var(--surface)',
                  color: 'var(--on-surface)' }} />
            </>
          ) : (
            <button type="button" onClick={() => setEditing(true)}
              style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
                fontSize: 12, color: COPPER, textDecoration: 'underline' }}>
              Edit target
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
