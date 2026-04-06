import { useMemo } from 'react';
import { Zap, ArrowRight, CheckCircle2 } from 'lucide-react';
import type { Task } from './types';
import { CATEGORY_LABELS, widgetTitleStyle } from './types';

interface DailyFocusProps {
  tasks: Task[];
  onMoveTask: (task: Task, status: Task['status']) => void;
}

export default function DailyFocus({ tasks, onMoveTask }: DailyFocusProps) {
  const dailyFocusTask = useMemo(() => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const activeMilestoneTodos = tasks
      .filter(t => t.status === 'todo')
      .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    if (activeMilestoneTodos.length > 0) return { task: activeMilestoneTodos[0], type: 'todo' as const };
    const inProgress = tasks.filter(t => t.status === 'in_progress');
    if (inProgress.length > 0) return { task: inProgress[0], type: 'in_progress' as const };
    return null;
  }, [tasks]);

  return (
    <div className="panel" style={{ borderRadius: '1.5rem', padding: '1.1rem 1.2rem' }}>
      <h4 style={widgetTitleStyle}>
        <Zap size={15} color="#8b4f2c" /> Daily Focus
      </h4>
      <div style={{ marginTop: 10 }}>
        {tasks.length > 0 && tasks.every(t => t.status === 'done') ? (
          <div style={{ textAlign: 'center', padding: '0.75rem 0' }}>
            <CheckCircle2 size={28} color="#34d399" style={{ marginBottom: 6 }} />
            <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#059669', margin: 0 }}>
              All tasks complete!
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', margin: '4px 0 0' }}>
              Outstanding work today.
            </p>
          </div>
        ) : dailyFocusTask ? (
          <>
            <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--on-surface)', margin: '0 0 8px', lineHeight: 1.4 }}>
              {dailyFocusTask.task.title}
            </p>
            {dailyFocusTask.task.category && (
              <span className={`kanban-badge kanban-badge--${dailyFocusTask.task.category}`} style={{ marginBottom: 8, display: 'inline-flex' }}>
                {CATEGORY_LABELS[dailyFocusTask.task.category] ?? dailyFocusTask.task.category}
              </span>
            )}
            <button
              onClick={() => onMoveTask(dailyFocusTask.task, dailyFocusTask.type === 'todo' ? 'in_progress' : 'done')}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                width: '100%', padding: '8px 12px', marginTop: 6,
                border: 'none', borderRadius: '0.75rem',
                background: dailyFocusTask.type === 'todo' ? 'rgba(139,79,44,0.1)' : 'rgba(52,211,153,0.12)',
                color: dailyFocusTask.type === 'todo' ? '#8b4f2c' : '#059669',
                fontSize: '0.78rem', fontWeight: 700, fontFamily: 'var(--font-body)',
                cursor: 'pointer', transition: 'background 0.15s',
                justifyContent: 'center',
              }}
            >
              {dailyFocusTask.type === 'todo' ? (
                <><ArrowRight size={13} /> Start This Task</>
              ) : (
                <><CheckCircle2 size={13} /> Complete</>
              )}
            </button>
          </>
        ) : (
          <p style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)' }}>No tasks available.</p>
        )}
      </div>
    </div>
  );
}
