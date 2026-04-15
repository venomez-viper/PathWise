import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import {
  CheckCircle2, Plus, Sparkles, Loader2, X,
  LayoutGrid, List, ArrowRight, ArrowLeft,
  Calendar, ClipboardList, Target, ArrowUpDown, Layers,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../lib/auth-context';
import { tasks as tasksApi, roadmap as roadmapApi, streaks as streaksApi } from '../../lib/api';
import TaskCelebration from '../../components/TaskCelebration';
import TaskDetailPanel from '../../components/TaskDetailPanel';
import { Panda, PandaSpot } from '../../components/panda';
import { useToast } from '../../lib/toast-context';
import Skeleton from '../../components/Skeleton';
import FirstVisitTooltip from '../../components/FirstVisitTooltip';
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
  createdAt?: string;
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


/* ================================================================
   Tasks Page Component
   ================================================================ */
export default function Tasks() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [taskList, setTaskList] = useState<Task[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>('board');

  // List view filter (preserved from original)
  const [filter, setFilter] = useState<'all' | 'todo' | 'done'>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'dueDate' | 'newest' | 'title'>('priority');

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

  // ── Task detail panel ──
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // ── Sidebar widget state ──
  const [filterMilestoneId, setFilterMilestoneId] = useState<string | null>(null);

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
      toast('Task created', 'success');
    } catch {
      toast('Something went wrong', 'error');
    } finally {
      setAddingLoading(false);
    }
  };

  /* ── Move task (optimistic) ── */
  const moveTask = useCallback(async (task: Task, newStatus: Task['status']) => {
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
  }, []);

  /* ── Toggle (for list view) ── */
  const toggle = async (task: Task) => {
    const newStatus: Task['status'] = task.status === 'done' ? 'todo' : 'done';
    await moveTask(task, newStatus);
    if (newStatus === 'done') toast('Task completed!', 'success');
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

  /* ── Derived data (memoized) ── */
  const done = useMemo(() => taskList.filter(t => t.status === 'done').length, [taskList]);
  const total = taskList.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const priorityOrder: Record<string, number> = useMemo(() => ({ high: 0, medium: 1, low: 2 }), []);

  const sortTasks = useCallback((a: Task, b: Task): number => {
    switch (sortBy) {
      case 'priority':
        return (priorityOrder[a.priority] ?? 1) - (priorityOrder[b.priority] ?? 1);
      case 'dueDate': {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      }
      case 'newest':
        return (b.createdAt ?? '').localeCompare(a.createdAt ?? '');
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  }, [sortBy, priorityOrder]);

  const todoTasks = useMemo(() => {
    let filtered = taskList.filter(t => t.status === 'todo');
    if (filterMilestoneId) filtered = filtered.filter(t => t.milestoneId === filterMilestoneId);
    return filtered.sort(sortTasks);
  }, [taskList, filterMilestoneId, sortTasks]);

  const inProgressTasks = useMemo(() => {
    let filtered = taskList.filter(t => t.status === 'in_progress');
    if (filterMilestoneId) filtered = filtered.filter(t => t.milestoneId === filterMilestoneId);
    return filtered.sort(sortTasks);
  }, [taskList, filterMilestoneId, sortTasks]);

  const doneTasks = useMemo(() => {
    let filtered = taskList.filter(t => t.status === 'done');
    if (filterMilestoneId) filtered = filtered.filter(t => t.milestoneId === filterMilestoneId);
    return filtered.sort(sortTasks);
  }, [taskList, filterMilestoneId, sortTasks]);

  const tasksByStatus = useCallback((status: Task['status']) => {
    if (status === 'todo') return todoTasks;
    if (status === 'in_progress') return inProgressTasks;
    return doneTasks;
  }, [todoTasks, inProgressTasks, doneTasks]);

  // Filtered visible list for list view
  const visibleFiltered = useMemo(() => {
    let list = taskList.filter(t =>
      filter === 'all' ? true : filter === 'done' ? t.status === 'done' : t.status !== 'done'
    );
    if (filterMilestoneId) {
      list = list.filter(t => t.milestoneId === filterMilestoneId);
    }
    return list.sort(sortTasks);
  }, [taskList, filter, filterMilestoneId, sortTasks]);

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


  /* ── Task detail panel handlers ── */
  const handleSaveTask = async (taskId: string, updates: Partial<Task>) => {
    await tasksApi.update(taskId, updates);
    await load();
    setSelectedTask(null);
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await tasksApi.delete(taskId);
      await load();
      setSelectedTask(null);
      toast('Task deleted', 'success');
    } catch {
      toast('Something went wrong', 'error');
    }
  };

  // Escape key to close detail panel
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedTask) setSelectedTask(null);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [selectedTask]);

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
            <Panda mood="curious" size={120} animate />
            <h2 className="tasks-empty__title">No tasks yet</h2>
            <p className="tasks-empty__desc">
              Complete your assessment and generate a roadmap to get started. Tasks will appear here once your roadmap is built.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/app/assessment-v2" className="tasks-empty__cta">
                <Target size={14} />
                Take Assessment
              </Link>
              <Link to="/app/onboarding" className="tasks-empty__cta" style={{ background: 'var(--surface-container-low)', color: 'var(--on-surface)' }}>
                <Sparkles size={14} />
                Set Up Roadmap
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      {/* First-visit tooltip */}
      <FirstVisitTooltip
        id="tasks-milestone-tip"
        message="Complete tasks to progress through your milestones. Finishing all tasks in a milestone unlocks the next one."
        targetSelector=".page-title"
        position="bottom"
        delay={1200}
      />

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
          <div style={{ position: 'relative' }}>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as typeof sortBy)}
              style={{
                appearance: 'none', WebkitAppearance: 'none',
                background: 'var(--surface-container-low)',
                border: '1px solid var(--surface-container-high)',
                borderRadius: 'var(--radius-md)',
                padding: '6px 32px 6px 12px',
                fontSize: '0.8rem', fontWeight: 600,
                color: 'var(--on-surface)',
                cursor: 'pointer',
              }}
            >
              <option value="priority">Priority</option>
              <option value="dueDate">Due Date</option>
              <option value="newest">Newest</option>
              <option value="title">Title A-Z</option>
            </select>
            <ArrowUpDown size={12} style={{
              position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
              pointerEvents: 'none', color: 'var(--on-surface-variant)',
            }} />
          </div>
          <button
            className="btn-page-secondary"
            onClick={() => setAiPanelOpen(v => !v)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <Sparkles size={14} />
            {aiPanelOpen ? 'Close' : 'Generate Tasks'}
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
                background: pct === 100 ? '#34d399' : 'var(--copper)',
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
              Generate Tasks
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
          {[0, 1, 2].map(colIdx => (
            <div key={colIdx} className="kanban-skeleton__col">
              <Skeleton width="60%" height={14} borderRadius="var(--radius-sm)" />
              {[0, 1, ...(colIdx < 2 ? [2] : [])].map(cardIdx => (
                <div key={cardIdx} style={{ background: 'var(--surface-container-lowest)', borderRadius: 'var(--radius-md)', padding: '1rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Skeleton width={['85%', '70%', '90%'][cardIdx]} height={12} borderRadius="var(--radius-sm)" />
                  <Skeleton width="45%" height={10} borderRadius="var(--radius-sm)" />
                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    <Skeleton width={50} height={18} borderRadius="var(--radius-full)" />
                    <Skeleton width={60} height={18} borderRadius="var(--radius-full)" />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* ── Board view ── */}
      {!loading && view === 'board' && (
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
                        <PandaSpot context="idle" position="inline" size={70} opacity={0.5} />
                        {col.key === 'todo' && 'No pending tasks'}
                        {col.key === 'in_progress' && 'Nothing in progress'}
                        {col.key === 'done' && 'No completed tasks'}
                      </div>
                    )}

                    {colTasks.map(task => (
                      <TaskCard key={task.id} task={task} milestones={milestones} onMove={moveTask} onSelect={setSelectedTask} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
      )}

      {/* ── List view ── */}
      {!loading && view === 'list' && (
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
                      style={{ borderTop: i > 0 ? '1px solid var(--outline-variant)' : 'none', cursor: 'pointer' }}
                      onClick={() => setSelectedTask(task)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedTask(task);
                        }
                      }}
                    >
                      <div
                        className={`task-row__check${task.status === 'done' ? ' checked' : ''}`}
                        onClick={e => { e.stopPropagation(); toggle(task); }}
                      >
                        {task.status === 'done' && <CheckCircle2 size={16} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p className="task-row__title">{task.title}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          {task.description && <p className="task-row__meta" style={{ margin: 0 }}>{task.description}</p>}
                          {task.milestoneId && milestones.find(m => m.id === task.milestoneId) && (
                            <Link
                              to="/app/roadmap"
                              onClick={e => e.stopPropagation()}
                              style={{
                                fontSize: '0.65rem', fontWeight: 600, padding: '1px 7px', borderRadius: '999px',
                                background: 'rgba(139,79,44,0.08)', color: 'var(--copper)', textDecoration: 'none',
                                display: 'inline-flex', alignItems: 'center', gap: 3, whiteSpace: 'nowrap',
                              }}
                            >
                              <Layers size={9} /> {milestones.find(m => m.id === task.milestoneId)!.title}
                            </Link>
                          )}
                        </div>
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

      {/* Task detail/edit panel */}
      <TaskDetailPanel
        task={selectedTask}
        milestones={milestones}
        onClose={() => setSelectedTask(null)}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
      />
    </div>
  );
}

/* ================================================================
   TaskCard — individual kanban card
   ================================================================ */
interface TaskCardProps {
  task: Task;
  milestones: Milestone[];
  onMove: (task: Task, status: Task['status']) => void;
  onSelect: (task: Task) => void;
}

const TaskCard = memo(function TaskCard({ task, milestones, onMove, onSelect }: TaskCardProps) {
  const overdue = isOverdue(task.dueDate);
  const milestone = task.milestoneId ? milestones.find(m => m.id === task.milestoneId) : null;

  return (
    <article className="kanban-card" aria-label={`Task: ${task.title}`} onClick={() => onSelect(task)} style={{ cursor: 'pointer' }}>
      <p className="kanban-card__title">{task.title}</p>

      <div className="kanban-card__badges">
        {milestone && (
          <Link
            to={`/app/roadmap`}
            onClick={e => e.stopPropagation()}
            style={{
              fontSize: '0.65rem', fontWeight: 600, padding: '2px 8px', borderRadius: '999px',
              background: 'rgba(139,79,44,0.1)', color: 'var(--copper)', textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center', gap: 3,
            }}
          >
            <Layers size={10} /> {milestone.title}
          </Link>
        )}
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
            onClick={e => { e.stopPropagation(); onMove(task, 'in_progress'); }}
            aria-label={`Start task: ${task.title}`}
          >
            Start <ArrowRight size={12} />
          </button>
        )}
        {task.status === 'in_progress' && (
          <>
            <button
              className="kanban-action-btn"
              onClick={e => { e.stopPropagation(); onMove(task, 'todo'); }}
              aria-label={`Move task back to To Do: ${task.title}`}
            >
              <ArrowLeft size={12} /> Back
            </button>
            <button
              className="kanban-action-btn kanban-action-btn--complete"
              onClick={e => { e.stopPropagation(); onMove(task, 'done'); }}
              aria-label={`Complete task: ${task.title}`}
            >
              Complete <CheckCircle2 size={12} />
            </button>
          </>
        )}
        {task.status === 'done' && (
          <button
            className="kanban-action-btn"
            onClick={e => { e.stopPropagation(); onMove(task, 'in_progress'); }}
            aria-label={`Reopen task: ${task.title}`}
          >
            <ArrowLeft size={12} /> Reopen
          </button>
        )}
      </div>
    </article>
  );
});

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
