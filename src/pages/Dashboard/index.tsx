import { useState, useEffect } from 'react';
import { CheckCircle2, Trophy, ClipboardList, Zap, ArrowRight, TrendingUp, Clock, Loader2, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../lib/auth-context';
import { assessment, roadmap, tasks, progress } from '../../lib/api';

export default function Dashboard() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    roadmapPct: number;
    targetRole: string;
    hasAssessment: boolean;
    careerMatches: { title: string; matchScore: number; description: string }[];
    recentTasks: { id: string; title: string; status: string; priority: string }[];
    stats: { tasksFinished: number; tasksTotal: number; jobReadinessScore: number };
    milestones: any[];
    todoCount: number;
    inProgCount: number;
    doneCount: number;
    activeMilestone: any;
    activeMilestoneTasks: any[];
    activeDone: number;
  }>({
    roadmapPct: 0,
    targetRole: '—',
    hasAssessment: false,
    careerMatches: [],
    recentTasks: [],
    stats: { tasksFinished: 0, tasksTotal: 0, jobReadinessScore: 0 },
    milestones: [],
    todoCount: 0,
    inProgCount: 0,
    doneCount: 0,
    activeMilestone: null,
    activeMilestoneTasks: [],
    activeDone: 0,
  });

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function load() {
      try {
        const [assessRes, roadmapRes, tasksRes, progressRes] = await Promise.allSettled([
          assessment.getResult(user!.id),
          roadmap.get(user!.id),
          tasks.list(user!.id),
          progress.getStats(user!.id),
        ]);

        if (cancelled) return;

        const assessResult = assessRes.status === 'fulfilled' ? (assessRes.value as any).result : null;
        const careerMatches = assessResult?.careerMatches ?? [];
        const hasAssessment = !!assessResult;

        const roadmapData = roadmapRes.status === 'fulfilled' ? (roadmapRes.value as any).roadmap : null;
        const taskList    = tasksRes.status === 'fulfilled'   ? (tasksRes.value as any).tasks ?? [] : [];
        const statsData   = progressRes.status === 'fulfilled' ? (progressRes.value as any).stats : null;

        const milestones = roadmapData?.milestones ?? [];
        const activeMilestone = milestones.find((m: any) => m.status === 'in_progress') ?? null;
        const completedMilestones = milestones.filter((m: any) => m.status === 'completed').length;

        const todoCount = taskList.filter((t: any) => t.status === 'todo').length;
        const inProgCount = taskList.filter((t: any) => t.status === 'in_progress').length;
        const doneCount = taskList.filter((t: any) => t.status === 'done').length;

        const activeMilestoneTasks = activeMilestone
          ? taskList.filter((t: any) => t.milestoneId === activeMilestone.id)
          : [];
        const activeDone = activeMilestoneTasks.filter((t: any) => t.status === 'done').length;

        setData({
          roadmapPct:    roadmapData?.completionPercent ?? 0,
          targetRole:    roadmapData?.targetRole ?? '—',
          hasAssessment,
          careerMatches: careerMatches.slice(0, 3),
          recentTasks:   taskList.slice(0, 3),
          stats: {
            tasksFinished:     statsData?.tasksFinished ?? doneCount,
            tasksTotal:        taskList.length,
            jobReadinessScore: statsData?.jobReadinessScore ?? 0,
          },
          milestones,
          todoCount,
          inProgCount,
          doneCount,
          activeMilestone: activeMilestone ? { ...activeMilestone, completedCount: completedMilestones, totalCount: milestones.length } : null,
          activeMilestoneTasks,
          activeDone,
        });
      } finally {
        if (!cancelled) { setLoading(false); setTimeout(() => setMounted(true), 100); }
      }
    }

    load();
    return () => { cancelled = true; };
  }, [user]);

  const {
    roadmapPct, hasAssessment, careerMatches, recentTasks,
    doneCount,
    activeMilestone, activeMilestoneTasks, activeDone,
  } = data;

  const activeMilestoneTotal = activeMilestoneTasks.length;
  const activeMilestoneRemaining = activeMilestoneTotal - activeDone;
  const activeMilestonePct = activeMilestoneTotal > 0 ? (activeDone / activeMilestoneTotal) * 100 : 0;

  return (
    <div className="page">

      {/* CTA for users without assessment */}
      {!loading && !hasAssessment && (
        <div className="panel panel--accent" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <p style={{ fontWeight: 700, color: 'var(--on-surface)', marginBottom: 4 }}>Take the Career Assessment</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>AI-analyse your strengths and get your top 3 career matches.</p>
          </div>
          <Link to="/app/assessment" className="btn-page-action" style={{ whiteSpace: 'nowrap' }}>
            Start <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
          <Loader2 size={28} color="var(--primary)" style={{ animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : (
        <>
          {/* ── HERO BANNER ── */}
          <div style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%)',
            borderRadius: 'var(--radius-2xl)',
            padding: '2rem 2rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem',
            color: '#fff',
          }}>
            <div>
              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.65rem',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                lineHeight: 1.2,
                marginBottom: '0.5rem',
              }}>
                Welcome back, {user?.name?.split(' ')[0]}!
              </h1>
              <p style={{ fontSize: '0.88rem', opacity: 0.85, lineHeight: 1.5 }}>
                Your journey to the top of your career is accelerating.
              </p>
              {hasAssessment && (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  marginTop: '0.75rem',
                  background: 'rgba(255,255,255,0.15)',
                  borderRadius: 'var(--radius-full)',
                  padding: '5px 12px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase' as const,
                }}>
                  <CheckCircle2 size={12} /> Career Assessment Completed
                </div>
              )}
              <div style={{ marginTop: '1rem' }}>
                <Link to="/app/roadmap" style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '0.6rem 1.25rem',
                  background: '#fff',
                  color: 'var(--primary)',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase' as const,
                }}>
                  View My Roadmap
                </Link>
              </div>
            </div>
          </div>

          {/* ── 3-STAT CARDS ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            {/* Roadmap Completion */}
            <div className="stat-tile">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div className="stat-tile__icon" style={{ background: 'rgba(98, 69, 164, 0.10)', color: 'var(--primary)' }}>
                  <Zap size={18} />
                </div>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>{roadmapPct}%</span>
              </div>
              <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--on-surface)', marginTop: 4 }}>Roadmap Completion</p>
              <div className="stat-tile__bar"><div className="stat-tile__fill" style={{ width: mounted ? `${roadmapPct}%` : '0%', background: 'var(--primary)' }} /></div>
            </div>

            {/* Tasks Finished */}
            <div className="stat-tile">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div className="stat-tile__icon" style={{ background: 'rgba(0, 106, 98, 0.08)', color: 'var(--secondary)' }}>
                  <ClipboardList size={18} />
                </div>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--secondary)' }}>{String(doneCount).padStart(2, '0')}</span>
              </div>
              <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--on-surface)', marginTop: 4 }}>Tasks Finished</p>
              <p style={{ fontSize: '0.72rem', color: 'var(--on-surface-variant)' }}>{data.stats.tasksTotal - doneCount} tasks remaining this week</p>
            </div>

            {/* Job Readiness */}
            <div className="stat-tile">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div className="stat-tile__icon" style={{ background: 'rgba(202, 168, 66, 0.08)', color: '#8b6914' }}>
                  <Trophy size={18} />
                </div>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: '#8b6914' }}>{data.stats.jobReadinessScore}%</span>
              </div>
              <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--on-surface)', marginTop: 4 }}>Job Readiness</p>
              <div className="stat-tile__bar"><div className="stat-tile__fill" style={{ width: mounted ? `${data.stats.jobReadinessScore}%` : '0%', background: 'linear-gradient(90deg, #caa842, #8b6914)' }} /></div>
            </div>
          </div>

          {/* ── CAREER MATCHES ── */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--on-surface)', letterSpacing: '-0.02em', marginBottom: 4 }}>
              Top Career Matches
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)', marginBottom: '1rem' }}>
              Based on your skills and personality assessment
            </p>

            {careerMatches.length === 0 ? (
              <div className="panel" style={{ textAlign: 'center', padding: '2rem' }}>
                <Target size={28} color="var(--on-surface-variant)" style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                <p style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)', marginBottom: '8px' }}>
                  No assessment yet.
                </p>
                <Link to="/app/assessment" className="panel-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  Take the assessment <ArrowRight size={13} />
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {careerMatches.map((m: any) => (
                  <div className="panel" key={m.title} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '1.75rem' }}>
                    {/* Circular gauge */}
                    <div style={{ position: 'relative', width: 80, height: 80, marginBottom: '0.75rem' }}>
                      <svg width="80" height="80" viewBox="0 0 80 80">
                        <circle cx="40" cy="40" r="34" fill="none" stroke="var(--surface-container-high)" strokeWidth="5" />
                        <circle cx="40" cy="40" r="34" fill="none" stroke="var(--secondary)" strokeWidth="5"
                          strokeLinecap="round"
                          strokeDasharray={2 * Math.PI * 34}
                          strokeDashoffset={mounted ? (2 * Math.PI * 34) * (1 - m.matchScore / 100) : 2 * Math.PI * 34}
                          style={{ transform: 'rotate(-90deg)', transformOrigin: '40px 40px', transition: 'stroke-dashoffset 1s cubic-bezier(0.33, 1, 0.68, 1)' }}
                        />
                      </svg>
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 800, color: 'var(--secondary)' }}>
                        {m.matchScore}%
                      </div>
                    </div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 800, color: 'var(--on-surface)', letterSpacing: '-0.01em' }}>{m.title}</h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--on-surface-variant)', marginTop: 4, lineHeight: 1.5 }}>{m.description}</p>
                    <Link to="/app/assessment" style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      marginTop: '0.75rem',
                      padding: '0.5rem 1.25rem',
                      borderRadius: 'var(--radius-full)',
                      background: 'transparent',
                      color: 'var(--on-surface)',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      boxShadow: 'var(--shadow-sm)',
                    }}>
                      View Details <ArrowRight size={13} />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── ACTIVE MILESTONE ── */}
          <div className="panel" style={{ marginBottom: '1rem' }}>
            <div className="panel__header">
              <h2 className="panel__title">Active Milestone</h2>
              <Zap size={15} color="#caa842" />
            </div>

            {!activeMilestone ? (
              <div style={{ padding: '1.5rem 0', textAlign: 'center' }}>
                <TrendingUp size={28} color="var(--on-surface-variant)" style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                <p style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)', lineHeight: 1.5 }}>
                  Complete onboarding to generate your roadmap
                </p>
                <Link to="/app/roadmap" className="panel-link" style={{ marginTop: '12px', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  Go to Roadmap <ArrowRight size={13} />
                </Link>
              </div>
            ) : (
              <div>
                <div style={{
                  borderLeft: '3px solid var(--primary)',
                  paddingLeft: '12px',
                  marginBottom: '1rem',
                  borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                }}>
                  <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--on-surface)', lineHeight: 1.3 }}>
                    {activeMilestone.title ?? activeMilestone.name ?? 'Current Milestone'}
                  </p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', marginTop: '4px' }}>
                    {activeDone} / {activeMilestoneTotal} tasks done
                    {activeMilestoneRemaining > 0 && ` (${activeMilestoneRemaining} remaining)`}
                  </p>
                </div>

                <div style={{
                  height: '6px',
                  background: 'var(--surface-container-high)',
                  borderRadius: 'var(--radius-full)',
                  overflow: 'hidden',
                  marginBottom: '1rem',
                }}>
                  <div style={{
                    height: '100%',
                    width: mounted ? `${activeMilestonePct}%` : '0%',
                    background: 'linear-gradient(90deg, var(--primary), var(--primary-container))',
                    borderRadius: 'var(--radius-full)',
                    transition: 'width 0.9s cubic-bezier(0.33, 1, 0.68, 1)',
                  }} />
                </div>

                <Link to="/app/roadmap" className="panel-link">
                  Go to Roadmap <ArrowRight size={13} />
                </Link>
              </div>
            )}
          </div>

          {/* ── RECENT TASKS ── */}
          <div className="panel">
            <div className="panel__header">
              <div>
                <h2 className="panel__title">Recent Tasks</h2>
                <p className="panel__sub">{data.stats.tasksFinished} of {data.stats.tasksTotal} done</p>
              </div>
              <Clock size={15} color="var(--on-surface-variant)" />
            </div>

            {recentTasks.length === 0 ? (
              <p style={{ fontSize: '0.82rem', color: 'var(--on-surface-variant)', padding: '12px 0' }}>
                No tasks yet — your roadmap will generate them.
              </p>
            ) : (
              <div className="quick-tasks">
                {recentTasks.map((t: any) => (
                  <div className={`quick-task${t.status === 'done' ? ' done' : ''}`} key={t.id}>
                    <div className={`quick-task__check${t.status === 'done' ? ' checked' : ''}`} />
                    <div className="quick-task__info">
                      <p className="quick-task__title">{t.title}</p>
                      <span className="quick-task__meta">{t.priority} priority</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Link to="/app/tasks" className="panel-link">
              See all tasks <ArrowRight size={13} />
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
