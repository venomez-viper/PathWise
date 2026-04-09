import { useMemo } from 'react';
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

  // Noop fallback for move handler
  const handleMoveTask = onMoveTask ?? (() => {});
  const handleFilterChange = onFilterChange ?? (() => {});

  const widgetSet = new Set(widgets);

  return (
    <div className="tasks-widget-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flexShrink: 0 }}>
      {widgetSet.has('dailyFocus') && (
        <DailyFocus tasks={tasks} onMoveTask={handleMoveTask} />
      )}
      {widgetSet.has('quickStart') && (
        <QuickStart todoTasks={todoTasks} onMoveTask={handleMoveTask} />
      )}
      {widgetSet.has('skillProgress') && (
        <SkillProgress tasks={tasks} milestones={milestones} />
      )}
      {widgetSet.has('streak') && userId && (
        <StreakWidget userId={userId} />
      )}
      {widgetSet.has('milestoneMap') && (
        <MilestoneMap
          milestones={milestones}
          tasksByMilestone={tasksByMilestone}
          filterMilestoneId={filterMilestoneId}
          onFilterChange={handleFilterChange}
        />
      )}
      {widgetSet.has('quote') && (
        <MotivationalQuote />
      )}
      {widgetSet.has('resourceTip') && (
        <ResourceTip taskCategories={taskCategories} />
      )}
      {widgetSet.has('weeklyOverview') && (
        <WeeklyOverview tasks={tasks} />
      )}
    </div>
  );
}
