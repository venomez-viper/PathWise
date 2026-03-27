import { useState, useEffect } from 'react';
import { Clock, TrendingUp, Pencil, Zap, GraduationCap, ChevronRight, Loader2, AlertCircle, Lock, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../lib/auth-context';
import { roadmap as roadmapApi, assessment as assessmentApi, tasks as tasksApi } from '../../lib/api';

type Task = { id: string; title: string; status: string; milestoneId?: string; category?: string };

const IMPORTANCE_COLOR: Record<string, string> = {
  high: '#f87171',
  medium: '#f59e0b',
  low: '#34d399',
};

export default function Roadmap() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [skillGaps, setSkillGaps] = useState<any[]>([]);
  const [milestoneTaskMap, setMilestoneTaskMap] = useState<Record<string, Task[]>>({});
  const [completing, setCompleting] = useState<string | null>(null);

  async function loadData(userId: string, silent = false) {
    if (!silent) setLoading(true);
    const [roadmapRes, assessRes, tasksRes] = await Promise.allSettled([
      roadmapApi.get(userId),
      assessmentApi.getResult(userId),
      tasksApi.list(userId),
    ]);

    const roadmap = roadmapRes.status === 'fulfilled' ? (roadmapRes.value as any).roadmap : null;
    const gaps = assessRes.status === 'fulfilled'
      ? ((assessRes.value as any).result?.skillGaps ?? [])
      : [];
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
    setSkillGaps(gaps);
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
  const MILESTONE_COLOR: Record<string, string> = { completed: '#34d399', in_progress: '#a78bfa', locked: 'var(--outline-variant)' };

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="panel">
            <p className="panel__eyebrow">CURRENT TARGET</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '8px 0 12px' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--on-surface)' }}>
                {data.targetRole}
              </h2>
              <div className="roadmap-progress-ring">
                <svg width="64" height="64" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="26" fill="none" stroke="var(--surface-container-high)" strokeWidth="6" />
                  <circle cx="32" cy="32" r="26" fill="none" stroke="#a78bfa" strokeWidth="6"
                    strokeLinecap="round" strokeDasharray={163.4}
                    strokeDashoffset={mounted ? 163.4 * (1 - completionPct / 100) : 163.4}
                    style={{ transform: 'rotate(-90deg)', transformOrigin: '32px 32px', transition: 'stroke-dashoffset 1s ease' }}
                  />
                </svg>
                <span className="roadmap-progress-label">{completionPct}%</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span className="tag"><Clock size={12} /> {data.milestones?.length ?? 0} milestones</span>
              <span className="tag tag--teal"><TrendingUp size={12} /> {data.milestones?.filter((m: any) => m.status === 'completed').length ?? 0} completed</span>
            </div>
          </div>

          <div className="panel">
            <div className="panel__header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={16} color="#f59e0b" />
                <h2 className="panel__title">Skill Gaps</h2>
              </div>
              {skillGaps.length > 0 && (
                <span className="badge-pill badge-pill--warning">Action needed</span>
              )}
            </div>

            {skillGaps.length === 0 ? (
              <div style={{ padding: '1rem 0', textAlign: 'center' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)', marginBottom: 10 }}>
                  Take the career assessment to see your personalised skill gaps.
                </p>
                <Link to="/app/assessment" style={{ fontSize: '0.82rem', color: '#a78bfa', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  Take Assessment <ChevronRight size={13} />
                </Link>
              </div>
            ) : skillGaps.slice(0, 5).map((gap: any) => (
              <div className="skill-gap-row" key={gap.skill}>
                <div className="skill-gap-row__icon"><GraduationCap size={16} color="#a78bfa" /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <p className="skill-gap-row__title">{gap.skill}</p>
                    <span style={{
                      fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
                      color: IMPORTANCE_COLOR[gap.importance] ?? '#a78bfa',
                      background: `${IMPORTANCE_COLOR[gap.importance] ?? '#a78bfa'}18`,
                      padding: '1px 6px', borderRadius: 999,
                    }}>{gap.importance}</span>
                  </div>
                  <p className="skill-gap-row__desc">{gap.learningResource}</p>
                </div>
                <ChevronRight size={15} color="var(--on-surface-variant)" />
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel__header">
            <h2 className="panel__title">Milestones</h2>
            <span style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)' }}>{data.milestones?.length ?? 0} total</span>
          </div>
          {(data.milestones ?? []).map((m: any, i: number) => {
            const mTasks = milestoneTaskMap[m.id] ?? [];
            const isCompleting = completing === m.id;

            return (
              <div key={m.id} className="path-item" style={{ borderLeftColor: MILESTONE_COLOR[m.status], marginBottom: '8px', opacity: m.status === 'locked' ? 0.5 : 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <p className="path-item__title">{i + 1}. {m.title}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {m.status === 'completed' && (
                      <CheckCircle2 size={16} color="#34d399" />
                    )}
                    <span className="priority-tag" style={{
                      color: MILESTONE_COLOR[m.status],
                      background: `${MILESTONE_COLOR[m.status]}18`,
                      fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', padding: '2px 8px', borderRadius: '999px',
                    }}>{m.status.replace('_', ' ')}</span>
                  </div>
                </div>
                <p className="path-item__meta">{m.description}</p>
                {m.dueDate && <p className="path-item__meta" style={{ marginTop: '3px' }}>Due: {new Date(m.dueDate).toLocaleDateString()}</p>}

                {m.status === 'in_progress' && (
                  <div style={{ marginTop: '10px' }}>
                    {mTasks.length > 0 && (
                      <div style={{ marginBottom: '8px' }}>
                        <p className="path-item__meta" style={{ fontWeight: 600, marginBottom: '4px' }}>
                          Tasks ({mTasks.length}):
                        </p>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                          {mTasks.slice(0, 3).map((t) => (
                            <li key={t.id} style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)', paddingLeft: '10px', borderLeft: '2px solid #a78bfa33', marginBottom: '3px' }}>
                              {t.title}
                            </li>
                          ))}
                          {mTasks.length > 3 && (
                            <li style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', paddingLeft: '10px', fontStyle: 'italic' }}>
                              +{mTasks.length - 3} more
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                    <button
                      onClick={() => handleComplete(m.id)}
                      disabled={!!completing}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        fontSize: '0.78rem', fontWeight: 700, padding: '5px 12px',
                        borderRadius: '999px', border: 'none', cursor: completing ? 'not-allowed' : 'pointer',
                        background: '#a78bfa', color: '#fff', opacity: completing ? 0.7 : 1,
                        transition: 'opacity 0.2s',
                      }}
                    >
                      {isCompleting
                        ? <><Loader2 size={12} style={{ animation: 'spin 0.8s linear infinite' }} /> Completing...</>
                        : <><CheckCircle2 size={12} /> Mark Complete</>
                      }
                    </button>
                  </div>
                )}

                {m.status === 'locked' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: '8px' }}>
                    <Lock size={12} color="var(--on-surface-variant)" />
                    <p className="path-item__meta" style={{ margin: 0 }}>Complete previous milestone to unlock</p>
                  </div>
                )}
              </div>
            );
          })}
          {(!data.milestones || data.milestones.length === 0) && (
            <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem', padding: '1rem 0' }}>No milestones yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
