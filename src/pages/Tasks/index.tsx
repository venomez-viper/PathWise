import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  CheckCircle2, Plus, Sparkles, Loader2, X,
  LayoutGrid, List, ArrowRight, ArrowLeft,
  Calendar, ClipboardList,
  Flame, Zap, Target, BookOpen, BarChart3, MessageCircle,
  Shuffle, Lock, ChevronRight, Check,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../lib/auth-context';
import { tasks as tasksApi, roadmap as roadmapApi, streaks as streaksApi } from '../../lib/api';
import TaskCelebration from '../../components/TaskCelebration';
import './Tasks.css';

/* ── Types ── */
type Task = {
  id: string;
  title: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  description?: string;
  category?: string;
  dueDate?: string;
  milestoneId?: string;
  completedAt?: string;
};

type ViewMode = 'board' | 'list';
type Milestone = { id: string; title: string; status: string };

/* ── Category display map ── */
const CATEGORY_LABELS: Record<string, string> = {
  learning: 'Learning',
  portfolio: 'Portfolio',
  networking: 'Networking',
  interview_prep: 'Interview Prep',
  certification: 'Certification',
  reflection: 'Reflection',
};

const CATEGORIES = Object.keys(CATEGORY_LABELS);

/* ── Column config ── */
const COLUMNS: { key: Task['status']; label: string }[] = [
  { key: 'todo', label: 'To Do' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'done', label: 'Done' },
];

/* ── Helpers ── */
function isOverdue(dateStr?: string): boolean {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date(new Date().toDateString());
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/* ── Motivational quotes ── */
const MOTIVATIONAL_QUOTES = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "Your career is a marathon, not a sprint. Pace yourself and keep moving.", author: "Unknown" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "Opportunities don't happen. You create them.", author: "Chris Grosser" },
  { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "Everything you've ever wanted is on the other side of fear.", author: "George Addair" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
  { text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.", author: "Ralph Waldo Emerson" },
  { text: "A person who never made a mistake never tried anything new.", author: "Albert Einstein" },
  { text: "Your limitation is only your imagination.", author: "Unknown" },
  { text: "Hard work beats talent when talent doesn't work hard.", author: "Tim Notke" },
  { text: "Dream big, start small, act now.", author: "Robin Sharma" },
];

/* ── Resource tips by category ── */
const RESOURCE_TIPS: Record<string, string> = {
  learning: "Try a focused 25-min study session (Pomodoro technique)",
  portfolio: "Commit one small improvement to a project today",
  networking: "Send one LinkedIn message to someone in your target field",
  interview_prep: "Practice one behavioral question using the STAR method",
  certification: "Review 10 flashcards for your certification exam",
  research: "Read one industry article and summarize key takeaways",
  reflection: "Write a 5-minute journal entry about your career progress",
};

/* ── Category colors for progress bars ── */
const CATEGORY_COLORS: Record<string, string> = {
  learning: '#7c3aed',
  portfolio: '#2563eb',
  networking: '#0d9488',
  interview_prep: '#b45309',
  certification: '#059669',
  reflection: '#6b7280',
  research: '#8b4f2c',
};

/* ── Widget title style helper ── */
const widgetTitleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: '0.85rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: 'var(--on-surface)',
  margin: 0,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
};

/* ================================================================
   Tasks Page Component
   ================================================================ */
export default function Tasks() {
  const { user } = useAuth();
  const [taskList, setTaskList] = useState<Task[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>('board');

  // List view filter (preserved from original)
  const [filter, setFilter] = useState<'all' | 'todo' | 'done'>('all');

  // Add task form
  const [addingTask, setAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<Task['priority']>('medium');
  const [newTaskCategory, setNewTaskCategory] = useState('');
  const [newTaskMilestoneId, setNewTaskMilestoneId] = useState('');
  const [addingLoading, setAddingLoading] = useState(false);

  // AI panel
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiMilestoneId, setAiMilestoneId] = useState('');
  const [aiCount, setAiCount] = useState(4);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  // Target role (from roadmap, used in AI generation)
  const [_targetRole, _setTargetRole] = useState('');

  // Mark all + celebration
  const [markingAll, setMarkingAll] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // ── Sidebar widget state ──
  const [streakData, setStreakData] = useState<any>(null);
  const [filterMilestoneId, setFilterMilestoneId] = useState<string | null>(null);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(() => Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length));
  const [resourceTipIndex, setResourceTipIndex] = useState(0);
  const [tipNoted, setTipNoted] = useState(false);
  const [shuffleAnimating, setShuffleAnimating] = useState(false);

  /* ── Load tasks + milestones ── */
  const load = useCallback(async () => {
    if (!user) return;
    try {
      const [tasksRes, roadmapRes] = await Promise.allSettled([
        tasksApi.list(user.id),
        roadmapApi.get(user.id),
      ]);
      const fetchedTasks = tasksRes.status === 'fulfilled' ? ((tasksRes.value as any).tasks ?? []) : [];
      const roadmapData = roadmapRes.status === 'fulfilled' ? (roadmapRes.value as any).roadmap : null;
      const fetchedMilestones: Milestone[] = roadmapData?.milestones ?? [];
      setTaskList(fetchedTasks);
      setMilestones(fetchedMilestones);
      _setTargetRole(roadmapData?.targetRole ?? '');
      // Default new task milestone to the current in_progress one
      const active = fetchedMilestones.find((m: Milestone) => m.status === 'in_progress');
      if (active) { setNewTaskMilestoneId(active.id); setAiMilestoneId(active.id); }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  /* ── Fetch streak data on mount ── */
  useEffect(() => {
    if (!user) return;
    streaksApi.get(user.id).then((data: any) => {
      setStreakData(data);
    }).catch(() => {});
  }, [user]);

  /* ── Add task ── */
  const addTask = async () => {
    if (!newTaskTitle.trim() || !user) return;
    setAddingLoading(true);
    try {
      const res = await tasksApi.create({
        userId: user.id,
        title: newTaskTitle.trim(),
        status: 'todo',
        priority: newTaskPriority,
        ...(newTaskCategory ? { category: newTaskCategory } : {}),
        ...(newTaskMilestoneId ? { milestoneId: newTaskMilestoneId } : {}),
      }) as { task: Task };
      setTaskList(prev => [...prev, res.task]);
      setNewTaskTitle('');
      setNewTaskPriority('medium');
      setNewTaskCategory('');
      setAddingTask(false);
    } catch {
      // keep form open on error
    } finally {
      setAddingLoading(false);
    }
  };

  /* ── Move task (optimistic) ── */
  const moveTask = async (task: Task, newStatus: Task['status']) => {
    const prevStatus = task.status;
    // Optimistic update
    setTaskList(prev =>
      prev.map(t => (t.id === task.id ? { ...t, status: newStatus, ...(newStatus === 'done' ? { completedAt: new Date().toISOString() } : {}) } : t))
    );
    try {
      await tasksApi.update(task.id, { status: newStatus });
    } catch {
      // Revert on error
      setTaskList(prev =>
        prev.map(t => (t.id === task.id ? { ...t, status: prevStatus } : t))
      );
    }
  };

  /* ── Toggle (for list view) ── */
  const toggle = async (task: Task) => {
    const newStatus: Task['status'] = task.status === 'done' ? 'todo' : 'done';
    await moveTask(task, newStatus);
  };

  /* ── Mark all complete ── */
  const markAllComplete = async () => {
    if (markingAll) return;
    const pending = taskList.filter(t => t.status !== 'done');
    if (pending.length === 0) return;
    setMarkingAll(true);
    try {
      await Promise.all(pending.map(t => moveTask(t, 'done')));
      // Record streak activity and show celebration
      if (user) {
        try { await streaksApi.recordActivity(user.id); } catch {}
      }
      setShowCelebration(true);
    } finally {
      setMarkingAll(false);
    }
  };

  /* ── Derived data ── */
  const done = taskList.filter(t => t.status === 'done').length;
  const total = taskList.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const visible = taskList.filter(t =>
    filter === 'all' ? true : filter === 'done' ? t.status === 'done' : t.status !== 'done'
  );

  const tasksByStatus = (status: Task['status']) => {
    let filtered = taskList.filter(t => t.status === status);
    if (filterMilestoneId) {
      filtered = filtered.filter(t => t.milestoneId === filterMilestoneId);
    }
    return filtered;
  };

  // Filtered visible list for list view
  const visibleFiltered = useMemo(() => {
    let list = visible;
    if (filterMilestoneId) {
      list = list.filter(t => t.milestoneId === filterMilestoneId);
    }
    return list;
  }, [visible, filterMilestoneId]);

  /* ── Reset add form ── */
  const cancelAdd = () => {
    setAddingTask(false);
    setNewTaskTitle('');
    setNewTaskPriority('medium');
    setNewTaskCategory('');
    // restore default milestone to active one
    const active = milestones.find(m => m.status === 'in_progress');
    if (active) { setNewTaskMilestoneId(active.id); setAiMilestoneId(active.id); }
  };

  /* ── Generate AI tasks from free-text prompt ── */
  const generateAiTasks = async () => {
    if (!aiPrompt.trim() || !user) return;
    setAiLoading(true);
    setAiError('');
    try {
      const res = await tasksApi.customGenerate({
        userId: user.id,
        prompt: aiPrompt.trim(),
        milestoneId: aiMilestoneId || undefined,
        count: aiCount,
        targetRole: _targetRole || undefined,
      }) as { tasks: Task[] };
      setTaskList(prev => [...prev, ...res.tasks]);
      setAiPrompt('');
      setAiPanelOpen(false);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Generation failed. Try again.');
    } finally {
      setAiLoading(false);
    }
  };

  /* ── Widget helpers ── */
  const activeMilestone = milestones.find(m => m.status === 'in_progress');

  // Daily Focus: highest priority todo from active milestone
  const dailyFocusTask = useMemo(() => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const activeTodos = taskList
      .filter(t => t.status === 'todo' && (!activeMilestone || t.milestoneId === activeMilestone.id))
      .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    if (activeTodos.length > 0) return { task: activeTodos[0], type: 'todo' as const };
    const inProgress = taskList.filter(t => t.status === 'in_progress');
    if (inProgress.length > 0) return { task: inProgress[0], type: 'in_progress' as const };
    return null;
  }, [taskList, activeMilestone]);

  // Skill progress by category
  const skillProgress = useMemo(() => {
    const cats: Record<string, { done: number; total: number }> = {};
    taskList.forEach(t => {
      const cat = t.category || 'uncategorized';
      if (!cats[cat]) cats[cat] = { done: 0, total: 0 };
      cats[cat].total++;
      if (t.status === 'done') cats[cat].done++;
    });
    return Object.entries(cats).map(([cat, data]) => ({ category: cat, ...data }));
  }, [taskList]);

  // Resource tips based on task categories
  const availableTips = useMemo(() => {
    const cats = new Set(taskList.map(t => t.category).filter(Boolean));
    const tips: { category: string; tip: string }[] = [];
    cats.forEach(cat => {
      if (cat && RESOURCE_TIPS[cat]) tips.push({ category: cat, tip: RESOURCE_TIPS[cat] });
    });
    // Always include at least a few
    if (tips.length === 0) {
      Object.entries(RESOURCE_TIPS).forEach(([cat, tip]) => tips.push({ category: cat, tip }));
    }
    return tips;
  }, [taskList]);

  // Weekly overview data
  const weeklyData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon, ...
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);

    const counts = new Array(7).fill(0);
    taskList.forEach(t => {
      if (t.status === 'done' && t.completedAt) {
        const d = new Date(t.completedAt);
        const diff = Math.floor((d.getTime() - monday.getTime()) / (1000 * 60 * 60 * 24));
        if (diff >= 0 && diff < 7) counts[diff]++;
      }
    });
    const max = Math.max(...counts, 1);
    return days.map((day, i) => ({ day, count: counts[i], pct: (counts[i] / max) * 100 }));
  }, [taskList]);

  const hasWeeklyActivity = weeklyData.some(d => d.count > 0);

  // Todo count for quick-start
  const todoCount = taskList.filter(t => t.status === 'todo').length;

  // Pick random todo task
  const pickRandomTask = () => {
    const todos = taskList.filter(t => t.status === 'todo');
    if (todos.length === 0) return;
    setShuffleAnimating(true);
    setTimeout(() => {
      const random = todos[Math.floor(Math.random() * todos.length)];
      moveTask(random, 'in_progress');
      setShuffleAnimating(false);
    }, 400);
  };

  /* ================================================================
     RENDER
     ================================================================ */

  /* ── Empty state ── */
  if (!loading && total === 0 && milestones.length === 0) {
    return (
      <div className="page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Tasks</h1>
            <p className="page-subtitle">Stay on track with your career priorities.</p>
          </div>
        </div>
        <div className="panel">
          <div className="tasks-empty">
            <div className="tasks-empty__icon">
              <ClipboardList size={28} />
            </div>
            <h2 className="tasks-empty__title">No tasks yet</h2>
            <p className="tasks-empty__desc">
              Complete onboarding to generate your personalized career roadmap and tasks.
            </p>
            <Link to="/app/onboarding" className="tasks-empty__cta">
              <Sparkles size={14} />
              Start Onboarding
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ── Sidebar widgets ── */
  const renderSidebar = () => (
    <div className="tasks-widget-sidebar">
      {/* Widget 1: Daily Focus */}
      <div className="panel" style={{ borderRadius: '1.5rem', padding: '1.1rem 1.2rem' }}>
        <h4 style={widgetTitleStyle}>
          <Zap size={15} color="#8b4f2c" /> Daily Focus
        </h4>
        <div style={{ marginTop: 10 }}>
          {taskList.every(t => t.status === 'done') ? (
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
                onClick={() => moveTask(dailyFocusTask.task, dailyFocusTask.type === 'todo' ? 'in_progress' : 'done')}
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

      {/* Widget 2: Quick-Start Prompt */}
      <div className="panel" style={{ borderRadius: '1.5rem', padding: '1.1rem 1.2rem' }}>
        <h4 style={widgetTitleStyle}>
          <Shuffle size={15} color="#006a62" /> Quick Start
        </h4>
        <div style={{ marginTop: 10 }}>
          <p style={{ fontSize: '0.82rem', color: 'var(--on-surface)', margin: '0 0 10px' }}>
            You have <strong style={{ color: '#8b4f2c' }}>{todoCount}</strong> task{todoCount !== 1 ? 's' : ''} ready
          </p>
          <button
            onClick={pickRandomTask}
            disabled={todoCount === 0}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center',
              width: '100%', padding: '8px 12px',
              border: '1.5px solid rgba(0,106,98,0.2)', borderRadius: '0.75rem',
              background: 'rgba(0,106,98,0.06)', color: '#006a62',
              fontSize: '0.78rem', fontWeight: 700, fontFamily: 'var(--font-body)',
              cursor: todoCount > 0 ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s', opacity: todoCount === 0 ? 0.5 : 1,
            }}
          >
            <Shuffle size={13} style={{ transition: 'transform 0.4s', transform: shuffleAnimating ? 'rotate(360deg)' : 'none' }} />
            {shuffleAnimating ? 'Picking...' : 'Pick a random task'}
          </button>
        </div>
      </div>

      {/* Widget 3: Skill Progress */}
      {skillProgress.length > 0 && (
        <div className="panel" style={{ borderRadius: '1.5rem', padding: '1.1rem 1.2rem' }}>
          <h4 style={widgetTitleStyle}>
            <Target size={15} color="#8b4f2c" /> Skill Progress
          </h4>
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {skillProgress.map(({ category, done: catDone, total: catTotal }) => {
              const catPct = catTotal > 0 ? Math.round((catDone / catTotal) * 100) : 0;
              const color = CATEGORY_COLORS[category] || '#8b4f2c';
              return (
                <div key={category}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--on-surface)', textTransform: 'capitalize' }}>
                      {CATEGORY_LABELS[category] ?? category}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)' }}>
                      {catDone}/{catTotal}
                    </span>
                  </div>
                  <div style={{
                    height: 6, borderRadius: 3, background: 'var(--surface-container)',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%', borderRadius: 3, background: color,
                      width: `${catPct}%`, transition: 'width 0.5s ease',
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Widget 4: Streak Widget */}
      <div className="panel" style={{ borderRadius: '1.5rem', padding: '1.1rem 1.2rem' }}>
        <h4 style={widgetTitleStyle}>
          <Flame size={15} color="#ef4444" /> Streak
        </h4>
        <div style={{ marginTop: 10 }}>
          {streakData ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#8b4f2c', fontFamily: 'var(--font-display)' }}>
                    {streakData.currentStreak ?? streakData.streak?.currentStreak ?? 0}
                  </span>
                  <p style={{ fontSize: '0.68rem', color: 'var(--on-surface-variant)', margin: '2px 0 0', fontWeight: 600 }}>CURRENT</p>
                </div>
                <div style={{ width: 1, height: 32, background: 'var(--outline-variant)' }} />
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#006a62', fontFamily: 'var(--font-display)' }}>
                    {streakData.bestStreak ?? streakData.streak?.bestStreak ?? 0}
                  </span>
                  <p style={{ fontSize: '0.68rem', color: 'var(--on-surface-variant)', margin: '2px 0 0', fontWeight: 600 }}>BEST</p>
                </div>
              </div>
              {/* 7-day indicator */}
              <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                {Array.from({ length: 7 }).map((_, i) => {
                  const activeDays = streakData.activeDays ?? streakData.streak?.activeDays ?? [];
                  const isActive = i < (streakData.currentStreak ?? streakData.streak?.currentStreak ?? 0) || activeDays[i];
                  return (
                    <div
                      key={i}
                      style={{
                        width: 10, height: 10, borderRadius: '50%',
                        background: isActive ? '#8b4f2c' : 'var(--surface-container)',
                        border: `1.5px solid ${isActive ? '#8b4f2c' : 'var(--outline-variant)'}`,
                        transition: 'background 0.2s',
                      }}
                    />
                  );
                })}
              </div>
            </>
          ) : (
            <p style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)' }}>Loading streak data...</p>
          )}
        </div>
      </div>

      {/* Widget 5: Milestone Mini-Map */}
      {milestones.length > 0 && (
        <div className="panel" style={{ borderRadius: '1.5rem', padding: '1.1rem 1.2rem' }}>
          <h4 style={widgetTitleStyle}>
            <Target size={15} color="#006a62" /> Milestone Map
          </h4>
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {filterMilestoneId && (
              <button
                onClick={() => setFilterMilestoneId(null)}
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
                  onClick={() => setFilterMilestoneId(isFiltered ? null : m.id)}
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
      )}

      {/* Widget 6: Motivational Quote */}
      <div className="panel" style={{ borderRadius: '1.5rem', padding: '1.1rem 1.2rem' }}>
        <h4 style={widgetTitleStyle}>
          <MessageCircle size={15} color="#8b4f2c" /> Motivation
        </h4>
        <div style={{ marginTop: 10 }}>
          <div style={{ position: 'relative', padding: '0 4px' }}>
            <span style={{ position: 'absolute', top: -4, left: -2, fontSize: '1.8rem', color: 'rgba(139,79,44,0.15)', fontFamily: 'Georgia, serif', lineHeight: 1 }}>&ldquo;</span>
            <p style={{
              fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--on-surface)',
              lineHeight: 1.55, margin: '0 0 6px', paddingLeft: 14,
            }}>
              {MOTIVATIONAL_QUOTES[currentQuoteIndex].text}
            </p>
            <p style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', margin: 0, paddingLeft: 14, fontWeight: 600 }}>
              -- {MOTIVATIONAL_QUOTES[currentQuoteIndex].author}
            </p>
          </div>
          <button
            onClick={() => setCurrentQuoteIndex((currentQuoteIndex + 1) % MOTIVATIONAL_QUOTES.length)}
            style={{
              display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center',
              width: '100%', marginTop: 10, padding: '6px',
              border: '1px solid var(--outline-variant)', borderRadius: '0.5rem',
              background: 'transparent', color: 'var(--on-surface-variant)',
              fontSize: '0.72rem', fontWeight: 600, fontFamily: 'var(--font-body)',
              cursor: 'pointer', transition: 'background 0.15s',
            }}
          >
            <Shuffle size={11} /> Next
          </button>
        </div>
      </div>

      {/* Widget 7: Resource of the Day */}
      <div className="panel" style={{ borderRadius: '1.5rem', padding: '1.1rem 1.2rem' }}>
        <h4 style={widgetTitleStyle}>
          <BookOpen size={15} color="#006a62" /> Resource Tip
        </h4>
        <div style={{ marginTop: 10 }}>
          {availableTips.length > 0 ? (
            <>
              <div
                onClick={() => !tipNoted && setTipNoted(true)}
                style={{
                  padding: '10px 12px', borderRadius: '0.75rem',
                  background: tipNoted ? 'rgba(52,211,153,0.08)' : 'rgba(0,106,98,0.05)',
                  border: `1px solid ${tipNoted ? 'rgba(52,211,153,0.2)' : 'rgba(0,106,98,0.1)'}`,
                  cursor: tipNoted ? 'default' : 'pointer', transition: 'all 0.2s',
                }}
              >
                <span className={`kanban-badge kanban-badge--${availableTips[resourceTipIndex % availableTips.length].category}`} style={{ marginBottom: 6, display: 'inline-flex' }}>
                  {CATEGORY_LABELS[availableTips[resourceTipIndex % availableTips.length].category] ?? availableTips[resourceTipIndex % availableTips.length].category}
                </span>
                <p style={{ fontSize: '0.8rem', color: 'var(--on-surface)', margin: '6px 0 0', lineHeight: 1.45 }}>
                  {availableTips[resourceTipIndex % availableTips.length].tip}
                </p>
                {tipNoted && (
                  <p style={{ fontSize: '0.7rem', color: '#059669', margin: '6px 0 0', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Check size={11} /> Noted!
                  </p>
                )}
              </div>
              <button
                onClick={() => { setResourceTipIndex(i => i + 1); setTipNoted(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center',
                  width: '100%', marginTop: 8, padding: '6px',
                  border: '1px solid var(--outline-variant)', borderRadius: '0.5rem',
                  background: 'transparent', color: 'var(--on-surface-variant)',
                  fontSize: '0.72rem', fontWeight: 600, fontFamily: 'var(--font-body)',
                  cursor: 'pointer', transition: 'background 0.15s',
                }}
              >
                <Shuffle size={11} /> New Tip
              </button>
            </>
          ) : (
            <p style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)' }}>Add tasks to get personalized tips.</p>
          )}
        </div>
      </div>

      {/* Widget 8: Weekly Overview */}
      <div className="panel" style={{ borderRadius: '1.5rem', padding: '1.1rem 1.2rem' }}>
        <h4 style={widgetTitleStyle}>
          <BarChart3 size={15} color="#8b4f2c" /> Weekly Overview
        </h4>
        <div style={{ marginTop: 10 }}>
          {hasWeeklyActivity ? (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 60 }}>
              {weeklyData.map(d => (
                <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{
                    width: '100%', maxWidth: 24, borderRadius: 3,
                    background: d.count > 0 ? '#8b4f2c' : 'var(--surface-container)',
                    height: `${Math.max(d.pct, d.count > 0 ? 15 : 4)}%`,
                    minHeight: 3,
                    transition: 'height 0.4s ease',
                  }} />
                  <span style={{ fontSize: '0.6rem', color: 'var(--on-surface-variant)', fontWeight: 600 }}>
                    {d.day}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)', textAlign: 'center', padding: '0.5rem 0' }}>
              Complete tasks to see your weekly activity
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="page">
      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">Stay on track with your career priorities.</p>
        </div>
        <div className="tasks-header-actions">
          <div className="view-toggle" role="tablist" aria-label="View mode">
            <button
              role="tab"
              aria-selected={view === 'board'}
              className={`view-toggle__btn${view === 'board' ? ' view-toggle__btn--active' : ''}`}
              onClick={() => setView('board')}
            >
              <LayoutGrid size={14} style={{ marginRight: 4, verticalAlign: -2 }} />
              Board
            </button>
            <button
              role="tab"
              aria-selected={view === 'list'}
              className={`view-toggle__btn${view === 'list' ? ' view-toggle__btn--active' : ''}`}
              onClick={() => setView('list')}
            >
              <List size={14} style={{ marginRight: 4, verticalAlign: -2 }} />
              List
            </button>
          </div>
          <button
            className="btn-page-secondary"
            onClick={() => setAiPanelOpen(v => !v)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <Sparkles size={14} />
            {aiPanelOpen ? 'Close AI' : 'Generate with AI'}
          </button>
          <button className="btn-page-action" onClick={() => setAddingTask(true)}>
            <Plus size={14} /> Add Task
          </button>
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div className="tasks-progress">
        <div className="panel" style={{ padding: '1.25rem 1.5rem' }}>
          <div className="tasks-progress__info">
            <span className="tasks-progress__label">
              {done} of {total} tasks completed
            </span>
            <span className="tasks-progress__sub">
              {pct}% &middot; {total - done} remaining
            </span>
          </div>
          <div className="stat-tile__bar">
            <div
              className="stat-tile__fill"
              style={{
                width: `${pct}%`,
                background: pct === 100 ? '#34d399' : 'var(--primary)',
                transition: 'width 0.6s ease',
              }}
            />
          </div>
        </div>
      </div>

      {/* ── AI Generation Panel ── */}
      {aiPanelOpen && (
        <div className="panel" style={{ marginBottom: '1rem', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
            <Sparkles size={16} color="#a78bfa" />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: 'var(--on-surface)', margin: 0 }}>
              Generate Tasks with AI
            </h3>
          </div>

          <textarea
            value={aiPrompt}
            onChange={e => setAiPrompt(e.target.value)}
            placeholder='Describe what you need help with... e.g. "prepare me for a Google interview", "learn React hooks", "build a portfolio project with Python"'
            rows={3}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1.5px solid var(--outline-variant)',
              borderRadius: '12px',
              background: 'var(--surface-container-low)',
              color: 'var(--on-surface)',
              fontSize: '0.9rem',
              fontFamily: 'var(--font-body)',
              resize: 'vertical',
              outline: 'none',
              boxSizing: 'border-box',
              marginBottom: '0.75rem',
              lineHeight: 1.5,
            }}
            onFocus={e => { e.target.style.borderColor = 'rgba(167,139,250,0.5)'; }}
            onBlur={e => { e.target.style.borderColor = 'var(--outline-variant)'; }}
            autoFocus
          />

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Count selector */}
            <select
              value={aiCount}
              onChange={e => setAiCount(Number(e.target.value))}
              className="kanban-add-form__select"
              aria-label="Number of tasks"
            >
              <option value={2}>2 tasks</option>
              <option value={4}>4 tasks</option>
              <option value={6}>6 tasks</option>
            </select>

            {/* Milestone selector */}
            {milestones.length > 0 && (
              <select
                value={aiMilestoneId}
                onChange={e => setAiMilestoneId(e.target.value)}
                className="kanban-add-form__select"
                style={{ flex: 1, minWidth: 160 }}
                aria-label="Link to milestone"
              >
                <option value="">No milestone</option>
                {milestones.map(m => (
                  <option key={m.id} value={m.id} disabled={m.status === 'locked'}>
                    {m.status === 'in_progress' ? '▶ ' : m.status === 'completed' ? '✓ ' : '🔒 '}
                    {m.title}
                  </option>
                ))}
              </select>
            )}

            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              <button
                className="kanban-cancel-btn"
                onClick={() => { setAiPanelOpen(false); setAiPrompt(''); setAiError(''); }}
                type="button"
              >
                Cancel
              </button>
              <button
                className="btn-page-action"
                onClick={generateAiTasks}
                disabled={aiLoading || !aiPrompt.trim()}
                style={{ opacity: (aiLoading || !aiPrompt.trim()) ? 0.6 : 1 }}
                type="button"
              >
                {aiLoading
                  ? <><Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Generating...</>
                  : <><Sparkles size={14} /> Generate</>
                }
              </button>
            </div>
          </div>

          {aiError && (
            <p style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: 8, margin: '8px 0 0' }}>{aiError}</p>
          )}

          {/* Prompt suggestions */}
          <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {[
              'Prepare for a technical interview',
              'Build a portfolio project',
              'Learn the top skills for my role',
              'Practice networking outreach',
              'Prepare my resume and LinkedIn',
            ].map(suggestion => (
              <button
                key={suggestion}
                onClick={() => setAiPrompt(suggestion)}
                style={{
                  fontSize: '0.75rem', padding: '3px 10px',
                  borderRadius: 999, border: '1px solid var(--outline-variant)',
                  background: 'var(--surface-container-low)',
                  color: 'var(--on-surface-variant)',
                  cursor: 'pointer', transition: 'background 0.15s',
                }}
                type="button"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Milestone filter indicator ── */}
      {filterMilestoneId && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.75rem',
          padding: '8px 14px', borderRadius: '0.75rem',
          background: 'rgba(139,79,44,0.06)', border: '1px solid rgba(139,79,44,0.15)',
        }}>
          <Target size={13} color="#8b4f2c" />
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#8b4f2c' }}>
            Filtered: {milestones.find(m => m.id === filterMilestoneId)?.title ?? 'Milestone'}
          </span>
          <button
            onClick={() => setFilterMilestoneId(null)}
            style={{
              marginLeft: 'auto', border: 'none', background: 'transparent',
              cursor: 'pointer', color: '#8b4f2c', display: 'flex', alignItems: 'center',
            }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── Loading skeleton ── */}
      {loading && (
        <div className="kanban-skeleton" aria-busy="true" aria-label="Loading tasks">
          {[0, 1, 2].map(i => (
            <div key={i} className="kanban-skeleton__col">
              <div className="kanban-skeleton__bar" style={{ width: '60%' }} />
              <div className="kanban-skeleton__card" />
              <div className="kanban-skeleton__card" style={{ height: 60, animationDelay: '0.2s' }} />
            </div>
          ))}
        </div>
      )}

      {/* ── Board view with sidebar ── */}
      {!loading && view === 'board' && (
        <div className="tasks-board-wrapper">
          <div className="kanban-board" role="region" aria-label="Kanban task board">
            {COLUMNS.map(col => {
              const colTasks = tasksByStatus(col.key);
              return (
                <div
                  key={col.key}
                  className={`kanban-col kanban-col--${col.key === 'in_progress' ? 'in-progress' : col.key}`}
                >
                  <div className="kanban-col__header">
                    <div className="kanban-col__header-left">
                      <div className="kanban-col__accent" />
                      <span className="kanban-col__title">{col.label}</span>
                    </div>
                    <span className="kanban-col__count">{colTasks.length}</span>
                  </div>
                  <div className="kanban-col__body">
                    {/* Add form in To Do column */}
                    {col.key === 'todo' && addingTask && (
                      <AddTaskForm
                        title={newTaskTitle}
                        priority={newTaskPriority}
                        category={newTaskCategory}
                        milestoneId={newTaskMilestoneId}
                        milestones={milestones}
                        loading={addingLoading}
                        onTitleChange={setNewTaskTitle}
                        onPriorityChange={setNewTaskPriority}
                        onCategoryChange={setNewTaskCategory}
                        onMilestoneChange={setNewTaskMilestoneId}
                        onSubmit={addTask}
                        onCancel={cancelAdd}
                      />
                    )}

                    {colTasks.length === 0 && !(col.key === 'todo' && addingTask) && (
                      <div className="kanban-col__empty">
                        {col.key === 'todo' && 'No pending tasks'}
                        {col.key === 'in_progress' && 'Nothing in progress'}
                        {col.key === 'done' && 'No completed tasks'}
                      </div>
                    )}

                    {colTasks.map(task => (
                      <TaskCard key={task.id} task={task} onMove={moveTask} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          {renderSidebar()}
        </div>
      )}

      {/* ── List view (original) with sidebar ── */}
      {!loading && view === 'list' && (
        <div className="tasks-board-wrapper">
          <div className="tasks-layout" style={{ flex: 1, minWidth: 0 }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Inline add form for list view */}
              {addingTask && (
                <div className="panel" style={{ padding: '1rem 1.25rem', display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    type="text"
                    className="settings-input"
                    placeholder="Task title..."
                    value={newTaskTitle}
                    onChange={e => setNewTaskTitle(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') addTask();
                      if (e.key === 'Escape') cancelAdd();
                    }}
                    autoFocus
                    style={{ flex: 1 }}
                  />
                  <button
                    className="btn-page-action"
                    onClick={addTask}
                    disabled={addingLoading || !newTaskTitle.trim()}
                  >
                    {addingLoading ? (
                      <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} />
                    ) : (
                      'Add'
                    )}
                  </button>
                  <button className="btn-icon" onClick={cancelAdd} aria-label="Cancel">
                    <X size={16} />
                  </button>
                </div>
              )}

              <div className="tab-bar">
                {(['all', 'todo', 'done'] as const).map(f => (
                  <button
                    key={f}
                    className={`tab-btn${filter === f ? ' active' : ''}`}
                    onClick={() => setFilter(f)}
                  >
                    {f === 'all' ? 'All' : f === 'todo' ? 'To Do' : 'Done'}
                  </button>
                ))}
              </div>

              {visibleFiltered.length === 0 ? (
                <div
                  className="panel"
                  style={{
                    textAlign: 'center',
                    padding: '3rem',
                    color: 'var(--on-surface-variant)',
                    fontSize: '0.875rem',
                  }}
                >
                  No tasks in this view.
                </div>
              ) : (
                <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
                  {visibleFiltered.map((task, i) => (
                    <div
                      key={task.id}
                      className={`task-row${task.status === 'done' ? ' task-row--done' : ''}`}
                      style={{ borderTop: i > 0 ? '1px solid var(--outline-variant)' : 'none' }}
                      onClick={() => toggle(task)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          toggle(task);
                        }
                      }}
                    >
                      <div className={`task-row__check${task.status === 'done' ? ' checked' : ''}`}>
                        {task.status === 'done' && <CheckCircle2 size={16} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p className="task-row__title">{task.title}</p>
                        {task.description && <p className="task-row__meta">{task.description}</p>}
                      </div>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          padding: '2px 8px',
                          borderRadius: '999px',
                          color:
                            task.priority === 'high'
                              ? '#ef4444'
                              : task.priority === 'medium'
                                ? '#f59e0b'
                                : '#34d399',
                          background:
                            task.priority === 'high'
                              ? 'rgba(239,68,68,0.1)'
                              : task.priority === 'medium'
                                ? 'rgba(245,158,11,0.1)'
                                : 'rgba(52,211,153,0.1)',
                        }}
                      >
                        {task.priority}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {taskList.some(t => t.status !== 'done') && (
                <button className="btn-complete-all" onClick={markAllComplete} disabled={markingAll}>
                  {markingAll ? (
                    <>
                      <Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> Completing...
                    </>
                  ) : (
                    <>
                      <Sparkles size={15} /> Mark All Complete
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
          {renderSidebar()}
        </div>
      )}

      {/* Celebration modal */}
      {showCelebration && (
        <TaskCelebration
          userName={user?.name?.split(' ')[0] ?? 'You'}
          completedCount={taskList.filter(t => t.status === 'done').length}
          streakDays={1}
          onDismiss={() => setShowCelebration(false)}
        />
      )}
    </div>
  );
}

/* ================================================================
   TaskCard — individual kanban card
   ================================================================ */
interface TaskCardProps {
  task: Task;
  onMove: (task: Task, status: Task['status']) => void;
}

function TaskCard({ task, onMove }: TaskCardProps) {
  const overdue = isOverdue(task.dueDate);

  return (
    <article className="kanban-card" aria-label={`Task: ${task.title}`}>
      <p className="kanban-card__title">{task.title}</p>

      <div className="kanban-card__badges">
        {task.category && (
          <span className={`kanban-badge kanban-badge--${task.category}`}>
            {CATEGORY_LABELS[task.category] ?? task.category}
          </span>
        )}
        <span className={`kanban-badge kanban-badge--${task.priority}`}>
          {task.priority}
        </span>
      </div>

      {task.dueDate && (
        <div className={`kanban-card__due${overdue ? ' kanban-card__due--overdue' : ''}`}>
          <Calendar size={12} />
          {overdue ? 'Overdue: ' : ''}{formatDate(task.dueDate)}
        </div>
      )}

      <div className="kanban-card__actions">
        {task.status === 'todo' && (
          <button
            className="kanban-action-btn kanban-action-btn--forward"
            onClick={() => onMove(task, 'in_progress')}
            aria-label={`Start task: ${task.title}`}
          >
            Start <ArrowRight size={12} />
          </button>
        )}
        {task.status === 'in_progress' && (
          <>
            <button
              className="kanban-action-btn"
              onClick={() => onMove(task, 'todo')}
              aria-label={`Move task back to To Do: ${task.title}`}
            >
              <ArrowLeft size={12} /> Back
            </button>
            <button
              className="kanban-action-btn kanban-action-btn--complete"
              onClick={() => onMove(task, 'done')}
              aria-label={`Complete task: ${task.title}`}
            >
              Complete <CheckCircle2 size={12} />
            </button>
          </>
        )}
        {task.status === 'done' && (
          <button
            className="kanban-action-btn"
            onClick={() => onMove(task, 'in_progress')}
            aria-label={`Reopen task: ${task.title}`}
          >
            <ArrowLeft size={12} /> Reopen
          </button>
        )}
      </div>
    </article>
  );
}

/* ================================================================
   AddTaskForm — inline form at top of To Do column
   ================================================================ */
interface AddTaskFormProps {
  title: string;
  priority: Task['priority'];
  category: string;
  milestoneId: string;
  milestones: Milestone[];
  loading: boolean;
  onTitleChange: (v: string) => void;
  onPriorityChange: (v: Task['priority']) => void;
  onCategoryChange: (v: string) => void;
  onMilestoneChange: (v: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

function AddTaskForm({
  title,
  priority,
  category,
  milestoneId,
  milestones,
  loading,
  onTitleChange,
  onPriorityChange,
  onCategoryChange,
  onMilestoneChange,
  onSubmit,
  onCancel,
}: AddTaskFormProps) {
  return (
    <div className="kanban-add-form" role="form" aria-label="Add new task">
      <input
        type="text"
        className="kanban-add-form__input"
        placeholder="Task title..."
        value={title}
        onChange={e => onTitleChange(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' && title.trim()) onSubmit();
          if (e.key === 'Escape') onCancel();
        }}
        autoFocus
        aria-label="Task title"
      />
      <div className="kanban-add-form__row">
        <select
          className="kanban-add-form__select"
          value={priority}
          onChange={e => onPriorityChange(e.target.value as Task['priority'])}
          aria-label="Priority"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <select
          className="kanban-add-form__select"
          value={category}
          onChange={e => onCategoryChange(e.target.value)}
          aria-label="Category"
        >
          <option value="">No category</option>
          {CATEGORIES.map(cat => (
            <option key={cat} value={cat}>
              {CATEGORY_LABELS[cat]}
            </option>
          ))}
        </select>
      </div>
      {milestones.length > 0 && (
        <select
          className="kanban-add-form__select"
          style={{ width: '100%' }}
          value={milestoneId}
          onChange={e => onMilestoneChange(e.target.value)}
          aria-label="Milestone"
        >
          <option value="">No milestone</option>
          {milestones.map(m => (
            <option key={m.id} value={m.id} disabled={m.status === 'locked'}>
              {m.status === 'in_progress' ? '▶ ' : m.status === 'completed' ? '✓ ' : '🔒 '}
              {m.title}
            </option>
          ))}
        </select>
      )}
      <div className="kanban-add-form__actions">
        <button className="kanban-cancel-btn" onClick={onCancel} type="button">
          Cancel
        </button>
        <button
          className="kanban-add-btn"
          onClick={onSubmit}
          disabled={loading || !title.trim()}
          type="button"
        >
          {loading ? <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> : 'Add Task'}
        </button>
      </div>
    </div>
  );
}
