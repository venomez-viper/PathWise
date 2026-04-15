import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, X, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Panda } from './panda';

interface QuickStartChecklistProps {
  hasAssessment: boolean;
  hasCareerMatches: boolean;
  hasRoadmap: boolean;
  hasCompletedTask: boolean;
}

const STORAGE_KEY = 'pathwise_quickstart_dismissed';

export default function QuickStartChecklist({
  hasAssessment,
  hasCareerMatches,
  hasRoadmap,
  hasCompletedTask,
}: QuickStartChecklistProps) {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(localStorage.getItem(STORAGE_KEY) === '1');
  }, []);

  const allDone = hasAssessment && hasCareerMatches && hasRoadmap && hasCompletedTask;

  // Auto-dismiss when all done
  useEffect(() => {
    if (allDone && !dismissed) {
      const timer = setTimeout(() => {
        localStorage.setItem(STORAGE_KEY, '1');
        setDismissed(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [allDone, dismissed]);

  if (dismissed) return null;

  const items = [
    {
      done: hasAssessment,
      label: 'Complete your career assessment',
      link: '/app/assessment-v2',
    },
    {
      done: hasCareerMatches,
      label: 'Review your career matches',
      link: '/app/assessment-v2',
    },
    {
      done: hasRoadmap,
      label: 'Generate your roadmap',
      link: '/app/onboarding',
    },
    {
      done: hasCompletedTask,
      label: 'Complete your first task',
      link: '/app/tasks',
    },
  ];

  const doneCount = items.filter(i => i.done).length;

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setDismissed(true);
  };

  return (
    <div
      className="panel"
      style={{
        borderRadius: '2rem',
        padding: '1.5rem',
        marginBottom: '1rem',
        border: '1.5px solid rgba(139, 79, 44, 0.15)',
        position: 'relative',
      }}
    >
      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--on-surface-variant)',
          padding: 4,
        }}
        aria-label="Dismiss checklist"
      >
        <X size={16} />
      </button>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
        <Sparkles size={16} color="var(--copper)" />
        <h3 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '0.95rem',
          fontWeight: 700,
          color: 'var(--on-surface)',
          margin: 0,
        }}>
          Quick Start
        </h3>
        <span style={{
          fontSize: '0.68rem',
          fontWeight: 700,
          color: 'var(--copper)',
          background: 'rgba(139, 79, 44, 0.08)',
          padding: '2px 8px',
          borderRadius: 'var(--radius-full)',
        }}>
          {doneCount} / {items.length}
        </span>
      </div>

      {/* Progress bar */}
      <div style={{
        height: 4,
        background: 'var(--surface-container-high)',
        borderRadius: 999,
        overflow: 'hidden',
        marginBottom: '1rem',
      }}>
        <div style={{
          height: '100%',
          width: `${(doneCount / items.length) * 100}%`,
          background: 'var(--copper)',
          borderRadius: 999,
          transition: 'width 0.6s ease',
        }} />
      </div>

      {/* Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map((item, i) => (
          <Link
            key={i}
            to={item.done ? '#' : item.link}
            onClick={item.done ? (e: React.MouseEvent) => e.preventDefault() : undefined}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '0.5rem 0.65rem',
              borderRadius: 'var(--radius-lg)',
              background: item.done ? 'rgba(139, 79, 44, 0.04)' : 'var(--surface-container-low)',
              textDecoration: 'none',
              cursor: item.done ? 'default' : 'pointer',
              transition: 'background 0.15s',
            }}
          >
            {item.done ? (
              <CheckCircle2 size={16} color="var(--copper)" style={{ flexShrink: 0 }} />
            ) : (
              <Circle size={16} color="var(--on-surface-variant)" style={{ flexShrink: 0, opacity: 0.5 }} />
            )}
            <span style={{
              fontSize: '0.82rem',
              fontWeight: item.done ? 500 : 600,
              color: item.done ? 'var(--on-surface-variant)' : 'var(--on-surface)',
              textDecoration: item.done ? 'line-through' : 'none',
            }}>
              {item.label}
            </span>
          </Link>
        ))}
      </div>

      {/* Completion state */}
      {allDone && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginTop: '1rem',
          padding: '0.5rem 0.75rem',
          background: 'rgba(139, 79, 44, 0.06)',
          borderRadius: 'var(--radius-lg)',
        }}>
          <Panda mood="celebrating" size={32} />
          <span style={{
            fontSize: '0.78rem',
            fontWeight: 600,
            color: 'var(--copper)',
          }}>
            All done! You're off to a great start.
          </span>
        </div>
      )}
    </div>
  );
}
