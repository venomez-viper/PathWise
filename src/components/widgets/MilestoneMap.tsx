import { Check, Lock, ChevronRight, Target } from 'lucide-react';
import type { Milestone, Task } from './types';
import { widgetTitleStyle } from './types';

interface MilestoneMapProps {
  milestones: Milestone[];
  tasksByMilestone: Record<string, Task[]>;
  filterMilestoneId: string | null;
  onFilterChange: (id: string | null) => void;
}

export default function MilestoneMap({ milestones, tasksByMilestone: _tasksByMilestone, filterMilestoneId, onFilterChange }: MilestoneMapProps) {
  if (milestones.length === 0) return null;

  return (
    <div className="panel" style={{ borderRadius: '1.5rem', padding: '1.1rem 1.2rem' }}>
      <h4 style={widgetTitleStyle}>
        <Target size={15} color="#006a62" /> Milestone Map
      </h4>
      <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {filterMilestoneId && (
          <button
            onClick={() => onFilterChange(null)}
            style={{
              fontSize: '0.7rem', color: '#8b4f2c', background: 'rgba(139,79,44,0.08)',
              border: '1px solid rgba(139,79,44,0.15)', borderRadius: '0.5rem',
              padding: '3px 10px', cursor: 'pointer', marginBottom: 4,
              fontFamily: 'var(--font-body)', fontWeight: 600,
            }}
          >
            Clear filter
          </button>
        )}
        {milestones.map(m => {
          const isActive = m.status === 'in_progress';
          const isCompleted = m.status === 'completed';
          const isLocked = m.status === 'locked';
          const isFiltered = filterMilestoneId === m.id;
          return (
            <button
              key={m.id}
              onClick={() => onFilterChange(isFiltered ? null : m.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 10px', borderRadius: '0.6rem',
                border: isFiltered ? '1.5px solid #8b4f2c' : '1px solid transparent',
                background: isFiltered ? 'rgba(139,79,44,0.06)' : 'transparent',
                cursor: isLocked ? 'default' : 'pointer',
                transition: 'all 0.15s', width: '100%', textAlign: 'left',
                fontFamily: 'var(--font-body)', opacity: isLocked ? 0.5 : 1,
              }}
            >
              {isCompleted && <Check size={13} color="#059669" />}
              {isActive && (
                <span style={{
                  width: 10, height: 10, borderRadius: '50%', background: '#8b4f2c',
                  display: 'inline-block', flexShrink: 0,
                  boxShadow: '0 0 0 3px rgba(139,79,44,0.2)',
                  animation: 'pulse-dot 2s ease-in-out infinite',
                }} />
              )}
              {isLocked && <Lock size={13} color="var(--on-surface-variant)" />}
              <span style={{
                fontSize: '0.75rem', fontWeight: isActive ? 700 : 500,
                color: isActive ? '#8b4f2c' : isCompleted ? '#059669' : 'var(--on-surface-variant)',
                flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {m.title}
              </span>
              {!isLocked && <ChevronRight size={12} color="var(--on-surface-variant)" style={{ opacity: 0.5 }} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
