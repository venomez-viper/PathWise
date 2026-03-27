import { useState, useEffect } from 'react';
import { Clock, Share2, FileText, Sparkles, Plus, CheckCircle2 } from 'lucide-react';

type TaskItem = { id: string; title: string; meta: string; icon: 'clock' | 'share2' | 'file'; done: boolean };

const DAILY: TaskItem[] = [
  { id: 'd1', title: "Complete 'SQL Basics Module 1'",               meta: '30 mins',        icon: 'clock',  done: false },
  { id: 'd2', title: 'Connect with 1 Marketing Analyst on LinkedIn', meta: 'Networking',     icon: 'share2', done: true  },
  { id: 'd3', title: 'Review 2 Job Descriptions',                    meta: 'Market Research', icon: 'file',  done: false },
];
const WEEKLY: TaskItem[] = [
  { id: 'w1', title: 'Complete Marketing Analytics module',           meta: '2 hours',    icon: 'clock',  done: false },
  { id: 'w2', title: 'Update portfolio with E-commerce Data Project', meta: 'Projects',   icon: 'file',   done: false },
  { id: 'w3', title: 'Attend 1 industry webinar',                    meta: 'Networking', icon: 'share2', done: false },
];

const MetaIcon = ({ type }: { type: 'clock' | 'share2' | 'file' }) =>
  type === 'clock' ? <Clock size={12} /> : type === 'share2' ? <Share2 size={12} /> : <FileText size={12} />;

export default function Tasks() {
  const [tab, setTab] = useState<'daily' | 'weekly'>('daily');
  const [tasks, setTasks] = useState({ daily: DAILY, weekly: WEEKLY });
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 100); }, []);

  const current = tasks[tab];
  const done = current.filter(t => t.done).length;
  const toggle = (id: string) =>
    setTasks(p => ({ ...p, [tab]: p[tab].map(t => t.id === id ? { ...t, done: !t.done } : t) }));

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">Stay on track with your daily priorities.</p>
        </div>
        <button className="btn-page-action"><Plus size={14} /> Add Task</button>
      </div>

      <div className="tasks-layout">
        {/* Main task area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Progress bar */}
          <div className="panel" style={{ padding: '1.25rem 1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--on-surface-variant)' }}>Targeting</span>
                <span style={{ marginLeft: '8px', fontWeight: 700, color: 'var(--primary)' }}>Marketing Analyst</span>
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--on-surface-variant)' }}>
                {done}/{current.length} done
              </span>
            </div>
            <div className="stat-tile__bar">
              <div className="stat-tile__fill" style={{
                width: mounted ? `${(done / current.length) * 100}%` : '0%',
                background: 'var(--primary)',
                transition: 'width 0.6s ease'
              }} />
            </div>
          </div>

          {/* Tab toggle */}
          <div className="tab-bar">
            <button className={`tab-btn${tab === 'daily' ? ' active' : ''}`} onClick={() => setTab('daily')}>
              Daily Tasks
            </button>
            <button className={`tab-btn${tab === 'weekly' ? ' active' : ''}`} onClick={() => setTab('weekly')}>
              Weekly Tasks
            </button>
          </div>

          {/* Task list */}
          <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
            {current.map((task, i) => (
              <div
                key={task.id}
                className={`task-row${task.done ? ' task-row--done' : ''}`}
                style={{ borderTop: i > 0 ? '1px solid var(--outline-variant)' : 'none' }}
                onClick={() => toggle(task.id)}
              >
                <div className={`task-row__check${task.done ? ' checked' : ''}`}>
                  {task.done && <CheckCircle2 size={16} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="task-row__title">{task.title}</p>
                  <p className="task-row__meta">
                    <MetaIcon type={task.icon} /> {task.meta}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <button className="btn-complete-all">
            <Sparkles size={15} /> Mark All Complete
          </button>
        </div>

        {/* Sidebar info */}
        <div className="tasks-sidebar">
          <div className="panel">
            <h3 className="panel__title">This Week</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
              {[
                { label: 'Tasks Done',  value: '5 / 8',   color: '#a78bfa' },
                { label: 'Est. Time',   value: '45 min',  color: '#5ef6e6' },
                { label: 'On Streak',   value: '7 days',  color: '#34d399' },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--on-surface-variant)' }}>{s.label}</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: s.color }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <h3 className="panel__title">AI Suggestion</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--on-surface-variant)', lineHeight: 1.6, marginTop: '8px' }}>
              Focus on the SQL module first — it unlocks 3 more career paths in your roadmap.
            </p>
            <button className="panel-link" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '10px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <Sparkles size={13} color="var(--primary)" />
              <span style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 600 }}>Generate more suggestions</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
