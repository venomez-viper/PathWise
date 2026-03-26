import { useState, useEffect } from 'react';
import { Clock, Share2, FileText, ChevronRight, Sparkles } from 'lucide-react';

type TaskItem = { id: string; title: string; meta: string; icon: 'clock' | 'share2' | 'file'; done: boolean };

const DAILY: TaskItem[] = [
  { id: 'd1', title: "Complete 'SQL Basics Module 1'",                    meta: '30 mins',        icon: 'clock',  done: false },
  { id: 'd2', title: 'Connect with 1 Marketing Analyst on LinkedIn',      meta: 'Networking',     icon: 'share2', done: false },
  { id: 'd3', title: 'Review 2 Job Descriptions',                         meta: 'Market Research', icon: 'file',  done: false },
];
const WEEKLY: TaskItem[] = [
  { id: 'w1', title: 'Complete Marketing Analytics module',               meta: '2 hours',        icon: 'clock',  done: false },
  { id: 'w2', title: 'Update portfolio with E-commerce Data Project',     meta: 'Projects',       icon: 'file',   done: false },
  { id: 'w3', title: 'Attend 1 industry webinar',                         meta: 'Networking',     icon: 'share2', done: false },
];

const MetaIcon = ({ type }: { type: 'clock' | 'share2' | 'file' }) =>
  type === 'clock' ? <Clock size={12} /> : type === 'share2' ? <Share2 size={12} /> : <FileText size={12} />;

export default function Tasks() {
  const [tab, setTab] = useState<'daily' | 'weekly'>('daily');
  const [tasks, setTasks] = useState<{ daily: TaskItem[]; weekly: TaskItem[] }>({ daily: DAILY, weekly: WEEKLY });
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 100); }, []);

  const current = tasks[tab];
  const toggle = (id: string) =>
    setTasks(p => ({ ...p, [tab]: p[tab].map(t => t.id === id ? { ...t, done: !t.done } : t) }));

  return (
    <main className="main-content">

      {/* ── Header ── */}
      <div className={`tasks-header fade-in${mounted ? ' visible' : ''}`}>
        <h1 className="tasks-title">Stay on track with today's priorities</h1>
        <div className="tasks-meta-row">
          <div className="tasks-meta-item">
            <span className="label-caps">TARGETING</span>
            <span className="tasks-meta-value" style={{ color: 'var(--primary)' }}>Marketing Analyst</span>
          </div>
          <div className="tasks-meta-divider" />
          <div className="tasks-meta-item">
            <span className="label-caps">PROGRESS</span>
            <span className="tasks-meta-value" style={{ color: 'var(--secondary)' }}>32%</span>
          </div>
        </div>
        <div className="progress-track" style={{ marginTop: '10px' }}>
          <div className="progress-fill fill-secondary" style={{ width: mounted ? '32%' : '0%' }} />
        </div>
      </div>

      {/* ── Daily / Weekly Toggle ── */}
      <div className="toggle-pill">
        <button className={`toggle-option${tab === 'daily'  ? ' active' : ''}`} onClick={() => setTab('daily')}>Daily</button>
        <button className={`toggle-option${tab === 'weekly' ? ' active' : ''}`} onClick={() => setTab('weekly')}>Weekly</button>
      </div>

      {/* ── Task List ── */}
      <div className="task-list">
        {current.map(task => (
          <div className={`task-item${task.done ? ' done' : ''}`} key={task.id} onClick={() => toggle(task.id)}>
            <div className={`task-checkbox${task.done ? ' checked' : ''}`} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p className="task-item-title">{task.title}</p>
              <p className="task-item-meta">
                <MetaIcon type={task.icon} />
                {' '}{task.meta}
              </p>
            </div>
            <ChevronRight size={16} color="var(--on-surface-variant)" style={{ flexShrink: 0 }} />
          </div>
        ))}
      </div>

      {/* ── CTA ── */}
      <div className="tasks-cta-area">
        <button className="btn-complete-tasks">
          COMPLETE TASKS <Sparkles size={16} />
        </button>
        <p className="tasks-estimated">ESTIMATED TIME: 45 MINUTES</p>
      </div>

    </main>
  );
}
