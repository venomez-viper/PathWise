import { useState, useMemo, useCallback } from 'react';
import { X, Plus, ChevronDown } from 'lucide-react';
import type { Task, Milestone } from './types';
import DailyFocus from './DailyFocus';
import QuickStart from './QuickStart';
import SkillProgress from './SkillProgress';
import StreakWidget from './StreakWidget';
import MilestoneMap from './MilestoneMap';
import MotivationalQuote from './MotivationalQuote';
import ResourceTip from './ResourceTip';
import WeeklyOverview from './WeeklyOverview';

export type WidgetName =
  | 'dailyFocus'
  | 'quickStart'
  | 'skillProgress'
  | 'streak'
  | 'milestoneMap'
  | 'quote'
  | 'resourceTip'
  | 'weeklyOverview';

const WIDGET_LABELS: Record<WidgetName, string> = {
  dailyFocus: 'Daily Focus',
  quickStart: 'Quick Start',
  skillProgress: 'Skill Progress',
  streak: 'Streak',
  milestoneMap: 'Milestone Map',
  quote: 'Motivational Quote',
  resourceTip: 'Resource Tip',
  weeklyOverview: 'Weekly Overview',
};

const STORAGE_KEY = 'pw_hidden_widgets';

function getHiddenWidgets(): Set<WidgetName> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return new Set(JSON.parse(raw));
  } catch {}
  return new Set();
}

function saveHiddenWidgets(hidden: Set<WidgetName>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...hidden]));
}

interface WidgetSidebarProps {
  widgets: WidgetName[];
  tasks?: Task[];
  milestones?: Milestone[];
  userId?: string;
  onMoveTask?: (task: Task, status: Task['status']) => void;
  filterMilestoneId?: string | null;
  onFilterChange?: (id: string | null) => void;
}

export default function WidgetSidebar({
  widgets,
  tasks = [],
  milestones = [],
  userId = '',
  onMoveTask,
  filterMilestoneId = null,
  onFilterChange,
}: WidgetSidebarProps) {
  const [hidden, setHidden] = useState<Set<WidgetName>>(getHiddenWidgets);
  const [showManage, setShowManage] = useState(false);

  const hideWidget = useCallback((name: WidgetName) => {
    setHidden(prev => {
      const next = new Set(prev);
      next.add(name);
      saveHiddenWidgets(next);
      return next;
    });
  }, []);

  const showWidget = useCallback((name: WidgetName) => {
    setHidden(prev => {
      const next = new Set(prev);
      next.delete(name);
      saveHiddenWidgets(next);
      return next;
    });
  }, []);

  const todoTasks = useMemo(() => tasks.filter(t => t.status === 'todo'), [tasks]);
  const taskCategories = useMemo(() => tasks.map(t => t.category).filter(Boolean) as string[], [tasks]);
  const tasksByMilestone = useMemo(() => {
    const map: Record<string, Task[]> = {};
    tasks.forEach(t => {
      if (t.milestoneId) {
        if (!map[t.milestoneId]) map[t.milestoneId] = [];
        map[t.milestoneId].push(t);
      }
    });
    return map;
  }, [tasks]);

  const handleMoveTask = onMoveTask ?? (() => {});
  const handleFilterChange = onFilterChange ?? (() => {});

  const widgetSet = new Set(widgets);
  const hiddenWidgets = widgets.filter(w => widgetSet.has(w) && hidden.has(w));
  const visibleWidgets = widgets.filter(w => widgetSet.has(w) && !hidden.has(w));

  const renderWidget = (name: WidgetName) => {
    switch (name) {
      case 'dailyFocus': return <DailyFocus tasks={tasks} onMoveTask={handleMoveTask} />;
      case 'quickStart': return <QuickStart todoTasks={todoTasks} onMoveTask={handleMoveTask} />;
      case 'skillProgress': return <SkillProgress tasks={tasks} milestones={milestones} />;
      case 'streak': return userId ? <StreakWidget userId={userId} /> : null;
      case 'milestoneMap': return <MilestoneMap milestones={milestones} tasksByMilestone={tasksByMilestone} filterMilestoneId={filterMilestoneId} onFilterChange={handleFilterChange} />;
      case 'quote': return <MotivationalQuote />;
      case 'resourceTip': return <ResourceTip taskCategories={taskCategories} />;
      case 'weeklyOverview': return <WeeklyOverview tasks={tasks} />;
      default: return null;
    }
  };

  return (
    <div className="tasks-widget-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flexShrink: 0 }}>
      {visibleWidgets.map(name => (
        <div key={name} style={{ position: 'relative' }}>
          <button
            onClick={() => hideWidget(name)}
            title={`Hide ${WIDGET_LABELS[name]}`}
            style={{
              position: 'absolute', top: 8, right: 8, zIndex: 2,
              width: 22, height: 22, borderRadius: '50%',
              background: 'var(--surface-container)', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', opacity: 0, transition: 'opacity 0.15s',
              color: 'var(--on-surface-variant)',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '1'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '0'; }}
          >
            <X size={12} />
          </button>
          <div
            onMouseEnter={e => {
              const btn = e.currentTarget.querySelector('button') as HTMLButtonElement;
              if (btn) btn.style.opacity = '1';
            }}
            onMouseLeave={e => {
              const btn = e.currentTarget.querySelector('button') as HTMLButtonElement;
              if (btn) btn.style.opacity = '0';
            }}
          >
            {renderWidget(name)}
          </div>
        </div>
      ))}

      {/* Manage hidden widgets */}
      {hiddenWidgets.length > 0 && (
        <div>
          <button
            onClick={() => setShowManage(v => !v)}
            style={{
              width: '100%', padding: '0.6rem 0.75rem',
              background: 'var(--surface-container-lowest)',
              border: '1px dashed var(--outline-variant)',
              borderRadius: 'var(--radius-lg)',
              color: 'var(--on-surface-variant)',
              fontSize: '0.78rem', fontWeight: 600,
              cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', gap: 6,
              transition: 'background 0.15s',
            }}
          >
            <Plus size={14} />
            {hiddenWidgets.length} hidden widget{hiddenWidgets.length > 1 ? 's' : ''}
            <ChevronDown size={14} style={{ transform: showManage ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>

          {showManage && (
            <div style={{
              marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.35rem',
            }}>
              {hiddenWidgets.map(name => (
                <button
                  key={name}
                  onClick={() => showWidget(name)}
                  style={{
                    padding: '0.5rem 0.75rem',
                    background: 'var(--surface-container-lowest)',
                    border: '1px solid var(--outline-variant)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--on-surface)',
                    fontSize: '0.78rem', fontWeight: 600,
                    cursor: 'pointer', display: 'flex',
                    alignItems: 'center', gap: 8,
                    transition: 'background 0.15s',
                  }}
                >
                  <Plus size={13} color="var(--secondary)" />
                  {WIDGET_LABELS[name]}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
