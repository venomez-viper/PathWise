import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface FirstVisitTooltipProps {
  id: string;
  message: string;
  targetSelector: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

const STORAGE_PREFIX = 'pathwise_tooltip_seen_';

export default function FirstVisitTooltip({
  id,
  message,
  targetSelector,
  position = 'bottom',
  delay = 800,
}: FirstVisitTooltipProps) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const key = STORAGE_PREFIX + id;
    if (localStorage.getItem(key)) return;

    const timer = setTimeout(() => {
      const el = document.querySelector(targetSelector);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const gap = 10;

      let top = 0;
      let left = 0;

      if (position === 'bottom') {
        top = rect.bottom + gap;
        left = rect.left + rect.width / 2;
      } else if (position === 'top') {
        top = rect.top - gap;
        left = rect.left + rect.width / 2;
      } else if (position === 'right') {
        top = rect.top + rect.height / 2;
        left = rect.right + gap;
      } else {
        top = rect.top + rect.height / 2;
        left = rect.left - gap;
      }

      setCoords({ top, left });
      setVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [id, targetSelector, position, delay]);

  const dismiss = () => {
    localStorage.setItem(STORAGE_PREFIX + id, '1');
    setVisible(false);
  };

  if (!visible || !coords) return null;

  const isVertical = position === 'top' || position === 'bottom';
  const transformMap: Record<string, string> = {
    top: 'translateX(-50%) translateY(-100%)',
    bottom: 'translateX(-50%)',
    left: 'translateX(-100%) translateY(-50%)',
    right: 'translateY(-50%)',
  };

  // Arrow styles
  const arrowBase: React.CSSProperties = {
    position: 'absolute',
    width: 0,
    height: 0,
  };

  const arrowMap: Record<string, React.CSSProperties> = {
    bottom: {
      ...arrowBase,
      top: -6,
      left: '50%',
      transform: 'translateX(-50%)',
      borderLeft: '6px solid transparent',
      borderRight: '6px solid transparent',
      borderBottom: '6px solid var(--copper)',
    },
    top: {
      ...arrowBase,
      bottom: -6,
      left: '50%',
      transform: 'translateX(-50%)',
      borderLeft: '6px solid transparent',
      borderRight: '6px solid transparent',
      borderTop: '6px solid var(--copper)',
    },
    right: {
      ...arrowBase,
      left: -6,
      top: '50%',
      transform: 'translateY(-50%)',
      borderTop: '6px solid transparent',
      borderBottom: '6px solid transparent',
      borderRight: '6px solid var(--copper)',
    },
    left: {
      ...arrowBase,
      right: -6,
      top: '50%',
      transform: 'translateY(-50%)',
      borderTop: '6px solid transparent',
      borderBottom: '6px solid transparent',
      borderLeft: '6px solid var(--copper)',
    },
  };

  return (
    <div
      ref={tooltipRef}
      style={{
        position: 'fixed',
        top: coords.top,
        left: coords.left,
        transform: transformMap[position],
        zIndex: 9000,
        background: 'var(--surface-container-lowest)',
        border: '1.5px solid var(--copper)',
        borderRadius: '0.75rem',
        padding: '0.65rem 0.85rem',
        maxWidth: 240,
        boxShadow: '0 8px 24px rgba(139, 79, 44, 0.12)',
        animation: 'tooltip-fade-in 0.3s ease',
      }}
    >
      <div style={arrowMap[position]} />
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <p style={{
          fontSize: '0.78rem',
          fontWeight: 500,
          color: 'var(--on-surface)',
          lineHeight: 1.5,
          margin: 0,
          flex: 1,
        }}>
          {message}
        </p>
        <button
          onClick={dismiss}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 2,
            color: 'var(--on-surface-variant)',
            flexShrink: 0,
            marginTop: -1,
          }}
          aria-label="Dismiss tooltip"
        >
          <X size={13} />
        </button>
      </div>
    </div>
  );
}
