/**
 * TaskFocusBinding
 * ----------------
 * Standalone UI for "lock the timer onto a single task".
 *
 * Contract:
 *  - Parent owns the timer state and the seconds counter. This component is
 *    purely presentational/selectional — it does NOT mutate any timer or task
 *    state itself.
 *  - When `selected` is null, renders a small banner + dropdown of `tasks`.
 *  - When `selected` is set, renders a "Working on" card with the elapsed
 *    seconds (formatted via `formatHMS`) and a Clear ghost button.
 *  - Calls `onSelect(task)` when the user picks a task from the dropdown.
 *  - Calls `onClear()` when the user clears the lock.
 *  - `totalSecondsOnSelected` is owned by the parent; this component only
 *    formats it for display.
 *
 * Visual language: Zen Stone palette, copper accent (#8b4f2c), inline styles
 * only — no Tailwind / no external deps.
 */

import { useId, type CSSProperties, type JSX } from 'react';

export type FocusTask = { id: string; title: string };

const COPPER = '#8b4f2c';
const COPPER_SOFT = '#f7ece4';
const COPPER_BORDER = '#e6d3c2';
const SURFACE = '#eefcfe';
const INK = '#1f2a2c';
const INK_SOFT = '#5a6a6c';

/** Format a seconds count into a compact human label.
 *  - < 60s         → "0m 12s"
 *  - < 3600s       → "12m 34s"
 *  - >= 3600s      → "1h 12m"
 */
export function formatHMS(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds || 0));
  if (s >= 3600) {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return `${h}h ${m}m`;
  }
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}m ${rem}s`;
}

const styles: Record<string, CSSProperties> = {
  bannerRoot: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: '10px 14px',
    background: COPPER_SOFT,
    border: `1px solid ${COPPER_BORDER}`,
    borderRadius: 12,
    fontFamily: 'inherit',
    color: INK,
  },
  bannerLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: COPPER,
    letterSpacing: '0.01em',
  },
  select: {
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    background: '#ffffff',
    border: `1px solid ${COPPER_BORDER}`,
    borderRadius: 8,
    padding: '6px 28px 6px 10px',
    fontSize: 13,
    color: INK,
    cursor: 'pointer',
    outline: 'none',
    minWidth: 180,
    backgroundImage:
      "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path fill='%238b4f2c' d='M0 0l5 6 5-6z'/></svg>\")",
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 10px center',
  },
  emptyHint: {
    fontSize: 12,
    color: INK_SOFT,
    fontStyle: 'italic',
  },
  card: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: '12px 14px',
    background: SURFACE,
    border: `1px solid ${COPPER_BORDER}`,
    borderLeft: `4px solid ${COPPER}`,
    borderRadius: 12,
    fontFamily: 'inherit',
    color: INK,
  },
  cardLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    minWidth: 0,
  },
  cardEyebrow: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: COPPER,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: INK,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: 260,
  },
  meta: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 12,
    color: INK_SOFT,
    marginTop: 2,
  },
  clearBtn: {
    background: 'transparent',
    border: 'none',
    color: COPPER,
    fontSize: 12,
    fontWeight: 600,
    padding: '6px 10px',
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'background 120ms ease',
  },
};

function ClockIcon(): JSX.Element {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

export function TaskFocusBinding({
  tasks,
  selected,
  onSelect,
  onClear,
  totalSecondsOnSelected,
}: {
  tasks: FocusTask[];
  selected: FocusTask | null;
  onSelect: (task: FocusTask) => void;
  onClear: () => void;
  totalSecondsOnSelected: number;
}): JSX.Element {
  const selectId = useId();

  if (selected) {
    return (
      <div
        style={styles.card}
        role="status"
        aria-live="polite"
        aria-label={`Focus locked on ${selected.title}`}
      >
        <div style={styles.cardLeft}>
          <span style={styles.cardEyebrow}>Working on</span>
          <span style={styles.cardTitle} title={selected.title}>
            {selected.title}
          </span>
          <span style={styles.meta}>
            <ClockIcon />
            <span>{formatHMS(totalSecondsOnSelected)}</span>
          </span>
        </div>
        <button
          type="button"
          onClick={onClear}
          style={styles.clearBtn}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              COPPER_SOFT;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              'transparent';
          }}
          onFocus={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              COPPER_SOFT;
          }}
          onBlur={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              'transparent';
          }}
          aria-label="Clear focus lock"
        >
          Clear
        </button>
      </div>
    );
  }

  const hasTasks = tasks.length > 0;

  return (
    <div style={styles.bannerRoot}>
      <label htmlFor={selectId} style={styles.bannerLabel}>
        Lock focus on a task →
      </label>
      {hasTasks ? (
        <select
          id={selectId}
          style={styles.select}
          defaultValue=""
          onChange={(e) => {
            const id = e.target.value;
            const t = tasks.find((x) => x.id === id);
            if (t) onSelect(t);
            // reset so selecting same option later still fires
            e.target.value = '';
          }}
          aria-label="Choose a task to focus on"
        >
          <option value="" disabled>
            Choose a task…
          </option>
          {tasks.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
        </select>
      ) : (
        <span style={styles.emptyHint}>no tasks today</span>
      )}
    </div>
  );
}

export default TaskFocusBinding;
