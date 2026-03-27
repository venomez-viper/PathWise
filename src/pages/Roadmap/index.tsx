import { useState, useEffect } from 'react';
import { Clock, TrendingUp, Pencil, Loader2, AlertCircle, Lock, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../lib/auth-context';
import { roadmap as roadmapApi, tasks as tasksApi } from '../../lib/api';

type Task = { id: string; title: string; status: string; milestoneId?: string; category?: string };

const MILESTONE_COLOR: Record<string, string> = {
  completed: '#34d399',
  in_progress: '#a78bfa',
  locked: 'var(--outline-variant)',
};

interface MilestoneCardProps {
  m: any;
  index: number;
  mTasks: Task[];
  completing: string | null;
  onComplete: (id: string) => void;
}

function MilestoneCard({ m, index, mTasks, completing, onComplete }: MilestoneCardProps) {
  const color = MILESTONE_COLOR[m.status] ?? 'var(--outline-variant)';
  const doneTasks = mTasks.filter((t) => t.status === 'done').length;
  const totalTasks = mTasks.length;
  const isCompleting = completing === m.id;

  const cardStyle: React.CSSProperties = {
    background: 'var(--surface-container-lowest)',
    borderRadius: 'var(--radius-xl)',
    border: '1px solid var(--outline-variant)',
    borderTop: `4px solid ${color}`,
    padding: '1.25rem',
    position: 'relative',
    opacity: m.status === 'locked' ? 0.45 : 1,
    boxShadow:
      m.status === 'in_progress'
        ? '0 0 0 2px rgba(167,139,250,0.3), 0 4px 20px rgba(167,139,250,0.15)'
        : undefined,
    transition: 'box-shadow 0.2s',
  };

  return (
    <div style={cardStyle}>
      {/* Number badge top-left */}
      <div
        style={{
          position: 'absolute',
          top: '1rem',
          left: '1rem',
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: color,
          color: '#fff',
          fontSize: '0.7rem',
          fontWeight: 800,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {index + 1}
      </div>

      {/* Status icon top-right */}
      <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
        {m.status === 'completed' && <CheckCircle2 size={18} color="#34d399" />}
        {m.status === 'locked' && <Lock size={16} color="var(--on-surface-variant)" />}
        {m.status === 'in_progress' && (
          <span
            style={{
              fontSize: '0.65rem',
              fontWeight: 700,
              textTransform: 'uppercase' as const,
              letterSpacing: '0.04em',
              color: '#a78bfa',
              background: 'rgba(167,139,250,0.12)',
              padding: '2px 8px',
              borderRadius: 999,
            }}
          >
            In Progress
          </span>
        )}
      </div>

      {/* Title area — padded to avoid overlap with number badge */}
      <div style={{ paddingLeft: 28, paddingRight: m.status === 'in_progress' ? 90 : 28, marginBottom: 6 }}>
        <p
          style={{
            fontSize: '0.9rem',
            fontWeight: 700,
            color: 'var(--on-surface)',
            opacity: m.status === 'completed' ? 0.75 : 1,
            lineHeight: 1.3,
          }}
        >
          {m.title}
        </p>
      </div>

      {/* Description */}
      <p
        style={{
          fontSize: '0.775rem',
          color: 'var(--on-surface-variant)',
          lineHeight: 1.5,
          marginBottom: m.status === 'in_progress' ? 12 : 0,
          opacity: m.status === 'completed' ? 0.7 : 1,
        }}
      >
        {m.description}
      </p>

      {/* Completed badge */}
      {m.status === 'completed' && (
        <div style={{ marginTop: 10 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: '0.65rem',
              fontWeight: 700,
              textTransform: 'uppercase' as const,
              letterSpacing: '0.04em',
              color: '#34d399',
              background: 'rgba(52,211,153,0.12)',
              padding: '2px 8px',
              borderRadius: 999,
            }}
          >
            <CheckCircle2 size={10} /> Completed
          </span>
        </div>
      )}

      {/* In-progress details */}
      {m.status === 'in_progress' && (
        <div>
          {/* Task list (up to 4) */}
          {mTasks.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <p
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.06em',
                  color: 'var(--on-surface-variant)',
                  marginBottom: 6,
                }}
              >
                Tasks
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {mTasks.slice(0, 4).map((t) => {
                  const done = t.status === 'done';
                  return (
                    <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: '50%',
                          border: `2px solid ${done ? '#a78bfa' : 'var(--outline-variant)'}`,
                          background: done ? 'rgba(167,139,250,0.2)' : 'transparent',
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontSize: '0.78rem',
                          color: done ? 'var(--on-surface-variant)' : 'var(--on-surface)',
                          textDecoration: done ? 'line-through' : 'none',
                          lineHeight: 1.4,
                        }}
                      >
                        {t.title}
                      </span>
                    </div>
                  );
                })}
                {mTasks.length > 4 && (
                  <span style={{ fontSize: '0.72rem', color: 'var(--on-surface-variant)', paddingLeft: 22, fontStyle: 'italic' }}>
                    +{mTasks.length - 4} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Progress bar */}
          {totalTasks > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 4,
                }}
              >
                <span style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)' }}>
                  {doneTasks} / {totalTasks} tasks done
                </span>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#a78bfa' }}>
                  {Math.round((doneTasks / totalTasks) * 100)}%
                </span>
              </div>
              <div
                style={{
                  height: 4,
                  background: 'var(--surface-container-high)',
                  borderRadius: 999,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${(doneTasks / totalTasks) * 100}%`,
                    background: '#a78bfa',
                    borderRadius: 999,
                    transition: 'width 0.6s ease',
                  }}
                />
              </div>
            </div>
          )}

          {/* Mark Complete button */}
          <button
            onClick={() => onComplete(m.id)}
            disabled={!!completing}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              fontSize: '0.875rem',
              fontWeight: 700,
              padding: '0.65rem 1rem',
              borderRadius: 'var(--radius-xl)',
              border: 'none',
              cursor: completing ? 'not-allowed' : 'pointer',
              background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
              color: '#fff',
              opacity: completing ? 0.7 : 1,
              transition: 'opacity 0.2s, transform 0.15s',
            }}
          >
            {isCompleting ? (
              <>
                <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} />
                Completing...
              </>
            ) : (
              <>
                <CheckCircle2 size={14} />
                Mark Complete
              </>
            )}
          </button>
        </div>
      )}

      {/* Locked note */}
      {m.status === 'locked' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 10 }}>
          <Lock size={11} color="var(--on-surface-variant)" />
          <p style={{ fontSize: '0.72rem', color: 'var(--on-surface-variant)', margin: 0 }}>
            Locked — complete previous milestone
          </p>
        </div>
      )}
    </div>
  );
}

export default function Roadmap() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [milestoneTaskMap, setMilestoneTaskMap] = useState<Record<string, Task[]>>({});
  const [completing, setCompleting] = useState<string | null>(null);

  async function loadData(userId: string, silent = false) {
    if (!silent) setLoading(true);
    const [roadmapRes, tasksRes] = await Promise.allSettled([
      roadmapApi.get(userId),
      tasksApi.list(userId),
    ]);

    const roadmap = roadmapRes.status === 'fulfilled' ? (roadmapRes.value as any).roadmap : null;
    const taskList: Task[] = tasksRes.status === 'fulfilled'
      ? ((tasksRes.value as any).tasks ?? [])
      : [];

    // Group tasks by milestoneId
    const taskMap: Record<string, Task[]> = {};
    for (const t of taskList) {
      if (t.milestoneId) {
        if (!taskMap[t.milestoneId]) taskMap[t.milestoneId] = [];
        taskMap[t.milestoneId].push(t);
      }
    }

    setData(roadmap);
    setMilestoneTaskMap(taskMap);
    if (!silent) {
      setLoading(false);
      setTimeout(() => setMounted(true), 100);
    }
  }

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    loadData(user.id).then(() => {
      if (cancelled) return;
      setMounted(true);
    });

    return () => { cancelled = true; };
  }, [user]);

  async function handleComplete(milestoneId: string) {
    if (!user || completing) return;
    setCompleting(milestoneId);
    try {
      await roadmapApi.completeMilestone(milestoneId);
      await loadData(user.id, true);
    } catch (err) {
      console.error('Failed to complete milestone', err);
    } finally {
      setCompleting(null);
    }
  }

  if (loading) return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <Loader2 size={28} color="var(--primary)" style={{ animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  if (!data) return (
    <div className="page">
      <div className="page-header">
        <div><h1 className="page-title">Career Roadmap</h1><p className="page-subtitle">Build your path to your dream role.</p></div>
      </div>
      <div className="panel" style={{ textAlign: 'center', padding: '3rem' }}>
        <AlertCircle size={32} color="var(--on-surface-variant)" style={{ margin: '0 auto 12px' }} />
        <p style={{ fontWeight: 600, color: 'var(--on-surface)', marginBottom: 8 }}>No roadmap yet</p>
        <p style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)', marginBottom: 16 }}>Complete onboarding to generate your personalised career roadmap.</p>
        <Link to="/app/onboarding" className="btn-page-action">Start Onboarding</Link>
      </div>
    </div>
  );

  const completionPct = data.completionPercent ?? 0;
  const milestones: any[] = data.milestones ?? [];
  const completedCount = milestones.filter((m) => m.status === 'completed').length;
  const totalCount = milestones.length;

  // Bigger ring constants: 96px SVG, r=40, circumference=251.2
  const RING_SIZE = 96;
  const RING_R = 40;
  const RING_CX = RING_SIZE / 2;
  const RING_CY = RING_SIZE / 2;
  const CIRCUMFERENCE = 2 * Math.PI * RING_R; // ~251.2

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Career Roadmap</h1>
          <p className="page-subtitle">Your personalised path to {data.targetRole}.</p>
        </div>
        <Link to="/app/onboarding" className="btn-page-secondary"><Pencil size={14} /> Change Role</Link>
      </div>

      <div className="roadmap-grid">
        {/* Left sidebar: progress ring + skill gaps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="panel">
            <p className="panel__eyebrow">CURRENT TARGET</p>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--on-surface)', margin: '8px 0 16px' }}>
              {data.targetRole}
            </h2>

            {/* Bigger progress ring centred */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ position: 'relative', width: RING_SIZE, height: RING_SIZE }}>
                <svg width={RING_SIZE} height={RING_SIZE} viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}>
                  <circle
                    cx={RING_CX} cy={RING_CY} r={RING_R}
                    fill="none"
                    stroke="var(--surface-container-high)"
                    strokeWidth="7"
                  />
                  <circle
                    cx={RING_CX} cy={RING_CY} r={RING_R}
                    fill="none"
                    stroke="#a78bfa"
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeDasharray={CIRCUMFERENCE}
                    strokeDashoffset={mounted ? CIRCUMFERENCE * (1 - completionPct / 100) : CIRCUMFERENCE}
                    style={{
                      transform: `rotate(-90deg)`,
                      transformOrigin: `${RING_CX}px ${RING_CY}px`,
                      transition: 'stroke-dashoffset 1s ease',
                    }}
                  />
                </svg>
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: 0,
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--on-surface)', lineHeight: 1 }}>
                    {completionPct}%
                  </span>
                </div>
              </div>

              {/* Milestone count stat below ring */}
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginBottom: 2 }}>Milestones completed</p>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--on-surface)' }}>
                  {completedCount} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--on-surface-variant)' }}>/ {totalCount}</span>
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span className="tag"><Clock size={12} /> {totalCount} milestones</span>
              <span className="tag tag--teal"><TrendingUp size={12} /> {completedCount} completed</span>
            </div>
          </div>

        </div>

        {/* Right panel: milestone grid */}
        <div className="panel">
          <div className="panel__header" style={{ marginBottom: '1.25rem' }}>
            <h2 className="panel__title">Milestones</h2>
            <span style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)' }}>{totalCount} total</span>
          </div>

          {milestones.length === 0 ? (
            <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem', padding: '1rem 0' }}>No milestones yet.</p>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
                gap: '1rem',
              }}
            >
              {milestones.map((m: any, i: number) => (
                <MilestoneCard
                  key={m.id}
                  m={m}
                  index={i}
                  mTasks={milestoneTaskMap[m.id] ?? []}
                  completing={completing}
                  onComplete={handleComplete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
