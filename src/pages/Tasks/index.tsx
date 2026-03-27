import { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2, Plus, Sparkles, Loader2, X,
  LayoutGrid, List, ArrowRight, ArrowLeft,
  Calendar, ClipboardList,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../lib/auth-context';
import { tasks as tasksApi, roadmap as roadmapApi } from '../../lib/api';
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

  // Mark all
  const [markingAll, setMarkingAll] = useState(false);

  /* ── Load tasks + milestones ── */
  const load = useCallback(async () => {
    if (!user) return;
    try {
      const [tasksRes, roadmapRes] = await Promise.allSettled([
        tasksApi.list(user.id),
        roadmapApi.get(user.id),
      ]);
      const fetchedTasks = tasksRes.status === 'fulfilled' ? ((tasksRes.value as any).tasks ?? []) : [];
      const fetchedMilestones: Milestone[] = roadmapRes.status === 'fulfilled'
        ? ((roadmapRes.value as any).roadmap?.milestones ?? [])
        : [];
      setTaskList(fetchedTasks);
      setMilestones(fetchedMilestones);
      // Default new task milestone to the current in_progress one
      const active = fetchedMilestones.find((m: Milestone) => m.status === 'in_progress');
      if (active) setNewTaskMilestoneId(active.id);
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
      prev.map(t => (t.id === task.id ? { ...t, status: newStatus } : t))
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

  const tasksByStatus = (status: Task['status']) =>
    taskList.filter(t => t.status === status);

  /* ── Reset add form ── */
  const cancelAdd = () => {
    setAddingTask(false);
    setNewTaskTitle('');
    setNewTaskPriority('medium');
    setNewTaskCategory('');
    // restore default milestone to active one
    const active = milestones.find(m => m.status === 'in_progress');
    if (active) setNewTaskMilestoneId(active.id);
  };

  /* ================================================================
     RENDER
     ================================================================ */

  /* ── Empty state ── */
  if (!loading && total === 0) {
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
      )}

      {/* ── List view (original) ── */}
      {!loading && view === 'list' && (
        <div className="tasks-layout">
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

            {visible.length === 0 ? (
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
                {visible.map((task, i) => (
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

          <div className="tasks-sidebar">
            <div className="panel">
              <h3 className="panel__title">Summary</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                {[
                  { label: 'Total Tasks', value: String(total), color: '#a78bfa' },
                  { label: 'Completed', value: String(done), color: '#34d399' },
                  { label: 'Remaining', value: String(total - done), color: '#f59e0b' },
                ].map(s => (
                  <div
                    key={s.label}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontSize: '0.82rem', color: 'var(--on-surface-variant)' }}>
                      {s.label}
                    </span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: s.color }}>
                      {s.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
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
