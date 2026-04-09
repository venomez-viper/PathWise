/**
 * App-level Widget Panel — sits in the right gutter via flex layout
 * Fetches its own data and renders widgets.
 *
 * Shown on: Roadmap, Tasks, Progress, Streaks, Achievements, Certificates, Search, Help
 * Hidden on: Dashboard, Assessment, Settings, Onboarding, SkillGapAssessment
 */
import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/auth-context';
import { tasks as tasksApi, roadmap as roadmapApi } from '../../lib/api';
import type { Task, Milestone } from './types';
import WidgetSidebar from './WidgetSidebar';

/** Routes where the widget panel should NOT appear */
const HIDDEN_ROUTES = new Set([
  '/app',           // Dashboard (index)
  '/app/assessment',
  '/app/skill-gap-assessment',
  '/app/settings',
  '/app/onboarding',
]);

export default function AppWidgetPanel() {
  const { user } = useAuth();
  const location = useLocation();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loaded, setLoaded] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const [tasksRes, roadmapRes] = await Promise.allSettled([
        tasksApi.list(user.id),
        roadmapApi.get(user.id),
      ]);
      const fetchedTasks = tasksRes.status === 'fulfilled' ? ((tasksRes.value as any).tasks ?? []) : [];
      const roadmapData = roadmapRes.status === 'fulfilled' ? (roadmapRes.value as any).roadmap : null;
      setTasks(fetchedTasks);
      setMilestones(roadmapData?.milestones ?? []);
    } finally {
      setLoaded(true);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (loaded) loadData();
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // Refresh when page becomes visible (user switches tabs, navigates back)
  useEffect(() => {
    const refresh = () => { if (document.visibilityState === 'visible') loadData(); };
    document.addEventListener('visibilitychange', refresh);
    window.addEventListener('focus', loadData);
    return () => {
      document.removeEventListener('visibilitychange', refresh);
      window.removeEventListener('focus', loadData);
    };
  }, [loadData]);

  // Check if we should show the panel on this route
  const currentPath = location.pathname.replace(/\/$/, '') || '/app';
  if (HIDDEN_ROUTES.has(currentPath)) return null;
  if (!user || !loaded) return null;

  const handleMoveTask = async (task: Task, newStatus: Task['status']) => {
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
    try {
      await tasksApi.update(task.id, { status: newStatus });
    } catch {
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: task.status } : t));
    }
  };

  return (
    <aside className="app-widget-panel">
      <WidgetSidebar
        widgets={['dailyFocus', 'quickStart', 'skillProgress', 'streak', 'milestoneMap', 'quote', 'resourceTip', 'weeklyOverview']}
        tasks={tasks}
        milestones={milestones}
        userId={user.id}
        onMoveTask={handleMoveTask}
      />
    </aside>
  );
}
