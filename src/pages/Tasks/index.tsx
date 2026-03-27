import { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, Plus, Sparkles, Loader2, X } from 'lucide-react';
import { useAuth } from '../../lib/auth-context';
import { tasks as tasksApi } from '../../lib/api';

type Task = { id: string; title: string; status: string; priority: string; description?: string };

export default function Tasks() {
  const { user } = useAuth();
  const [taskList, setTaskList] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'todo' | 'done'>('all');
  const [addingTask, setAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [addingLoading, setAddingLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const res: any = await tasksApi.list(user.id);
      setTaskList(res.tasks ?? []);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const addTask = async () => {
    if (!newTaskTitle.trim() || !user) return;
    setAddingLoading(true);
    try {
      const res: any = await tasksApi.create({ userId: user.id, title: newTaskTitle.trim(), status: 'todo', priority: 'medium' });
      setTaskList(p => [...p, res.task]);
      setNewTaskTitle('');
      setAddingTask(false);
    } catch {
      // keep form open on error
    } finally {
      setAddingLoading(false);
    }
  };

  const markAllComplete = async () => {
    if (markingAll) return;
    const pending = taskList.filter(t => t.status !== 'done');
    if (pending.length === 0) return;
    setMarkingAll(true);
    try {
      await Promise.all(pending.map(t => toggle(t)));
    } finally {
      setMarkingAll(false);
    }
  };

  const toggle = async (task: Task) => {
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    setTaskList(p => p.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
    try {
      await tasksApi.update(task.id, { status: newStatus });
    } catch {
      setTaskList(p => p.map(t => t.id === task.id ? { ...t, status: task.status } : t));
    }
  };

  const visible = taskList.filter(t => filter === 'all' ? true : filter === 'done' ? t.status === 'done' : t.status !== 'done');
  const done  = taskList.filter(t => t.status === 'done').length;
  const total = taskList.length;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">Stay on track with your career priorities.</p>
        </div>
        <button className="btn-page-action" onClick={() => setAddingTask(true)}><Plus size={14} /> Add Task</button>
      </div>

      <div className="tasks-layout">
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="panel" style={{ padding: '1.25rem 1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--on-surface)' }}>{done} of {total} tasks completed</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>{total - done} remaining</span>
            </div>
            <div className="stat-tile__bar">
              <div className="stat-tile__fill" style={{ width: total > 0 ? `${(done / total) * 100}%` : '0%', background: 'var(--primary)', transition: 'width 0.6s ease' }} />
            </div>
          </div>

          {addingTask && (
            <div className="panel" style={{ padding: '1rem 1.25rem', display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="text"
                className="settings-input"
                placeholder="Task title..."
                value={newTaskTitle}
                onChange={e => setNewTaskTitle(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') addTask(); if (e.key === 'Escape') { setAddingTask(false); setNewTaskTitle(''); } }}
                autoFocus
                style={{ flex: 1 }}
              />
              <button className="btn-page-action" onClick={addTask} disabled={addingLoading || !newTaskTitle.trim()}>
                {addingLoading ? <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> : 'Add'}
              </button>
              <button className="btn-icon" onClick={() => { setAddingTask(false); setNewTaskTitle(''); }} aria-label="Cancel">
                <X size={16} />
              </button>
            </div>
          )}

          <div className="tab-bar">
            {(['all', 'todo', 'done'] as const).map(f => (
              <button key={f} className={`tab-btn${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
                {f === 'all' ? 'All' : f === 'todo' ? 'To Do' : 'Done'}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
              <Loader2 size={24} color="var(--primary)" style={{ animation: 'spin 0.8s linear infinite' }} />
            </div>
          ) : visible.length === 0 ? (
            <div className="panel" style={{ textAlign: 'center', padding: '3rem', color: 'var(--on-surface-variant)', fontSize: '0.875rem' }}>
              {total === 0 ? 'No tasks yet — complete onboarding to generate your roadmap and tasks.' : 'No tasks in this view.'}
            </div>
          ) : (
            <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
              {visible.map((task, i) => (
                <div key={task.id}
                  className={`task-row${task.status === 'done' ? ' task-row--done' : ''}`}
                  style={{ borderTop: i > 0 ? '1px solid var(--outline-variant)' : 'none' }}
                  onClick={() => toggle(task)}
                >
                  <div className={`task-row__check${task.status === 'done' ? ' checked' : ''}`}>
                    {task.status === 'done' && <CheckCircle2 size={16} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="task-row__title">{task.title}</p>
                    {task.description && <p className="task-row__meta">{task.description}</p>}
                  </div>
                  <span style={{
                    fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', padding: '2px 8px', borderRadius: '999px',
                    color: task.priority === 'high' ? '#ef4444' : task.priority === 'medium' ? '#f59e0b' : '#34d399',
                    background: task.priority === 'high' ? 'rgba(239,68,68,0.1)' : task.priority === 'medium' ? 'rgba(245,158,11,0.1)' : 'rgba(52,211,153,0.1)',
                  }}>{task.priority}</span>
                </div>
              ))}
            </div>
          )}

          {total > 0 && taskList.some(t => t.status !== 'done') && (
            <button className="btn-complete-all" onClick={markAllComplete} disabled={markingAll}>
              {markingAll
                ? <><Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> Completing…</>
                : <><Sparkles size={15} /> Mark All Complete</>
              }
            </button>
          )}
        </div>

        <div className="tasks-sidebar">
          <div className="panel">
            <h3 className="panel__title">Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
              {[
                { label: 'Total Tasks',  value: String(total), color: '#a78bfa' },
                { label: 'Completed',    value: String(done),  color: '#34d399' },
                { label: 'Remaining',    value: String(total - done), color: '#f59e0b' },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--on-surface-variant)' }}>{s.label}</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: s.color }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
