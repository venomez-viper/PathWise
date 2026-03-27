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

        // Milestone extraction
        const milestones = roadmapData?.milestones ?? [];
        const activeMilestone = milestones.find((m: any) => m.status === 'in_progress') ?? null;
        const completedMilestones = milestones.filter((m: any) => m.status === 'completed').length;
        const totalMilestones = milestones.length;

        // Task counts by status
        const todoCount = taskList.filter((t: any) => t.status === 'todo').length;
        const inProgCount = taskList.filter((t: any) => t.status === 'in_progress').length;
        const doneCount = taskList.filter((t: any) => t.status === 'done').length;

        // Tasks linked to active milestone
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
          activeMilestone: activeMilestone ? { ...activeMilestone, completedCount: completedMilestones, totalCount: totalMilestones } : null,
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
    roadmapPct, targetRole, hasAssessment, careerMatches, recentTasks,
    todoCount, inProgCount, doneCount,
    activeMilestone, activeMilestoneTasks, activeDone,
  } = data;

  const completedMilestones = data.milestones.filter((m: any) => m.status === 'completed').length;
  const totalMilestones = data.milestones.length;

  const MATCH_COLORS = ['#a78bfa', '#5ef6e6', '#f59e0b'];

  // Progress ring calculations
  const ringSize = 80;
  const ringRadius = 34;
  const circumference = 2 * Math.PI * ringRadius; // ~213.6
  const strokeOffset = mounted ? circumference * (1 - roadmapPct / 100) : circumference;

  // Active milestone progress
  const activeMilestoneTotal = activeMilestoneTasks.length;
  const activeMilestoneRemaining = activeMilestoneTotal - activeDone;
  const activeMilestonePct = activeMilestoneTotal > 0 ? (activeDone / activeMilestoneTotal) * 100 : 0;

  return (
    <div className="page">

      {/* CTA banner for users without assessment */}
      {!loading && !hasAssessment && (
        <div className="panel panel--cta" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(167,139,250,0.12), rgba(94,246,230,0.06))', border: '1px solid rgba(167,139,250,0.25)' }}>
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
            background: 'linear-gradient(135deg, rgba(167,139,250,0.15) 0%, rgba(94,246,230,0.08) 50%, rgba(245,158,11,0.08) 100%)',
            border: '1px solid rgba(167,139,250,0.2)',
            borderRadius: 'var(--radius-xl)',
            padding: '2rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem',
          }}>
            {/* Left side */}
            <div>
              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.65rem',
                fontWeight: 800,
                color: 'var(--on-surface)',
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
                marginBottom: '0.5rem',
              }}>
                Welcome back, {user?.name?.split(' ')[0]}
              </h1>
              <p style={{
                fontSize: '0.9rem',
                color: 'var(--on-surface-variant)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                <Target size={15} color="#a78bfa" />
                Target: <span style={{ fontWeight: 600, color: 'var(--on-surface)' }}>{targetRole}</span>
              </p>
            </div>

            {/* Right side — Progress ring */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ position: 'relative', width: ringSize, height: ringSize }}>
                <svg width={ringSize} height={ringSize} viewBox={`0 0 ${ringSize} ${ringSize}`}>
                  {/* Background track */}
                  <circle
                    cx={ringSize / 2}
                    cy={ringSize / 2}
                    r={ringRadius}
                    fill="none"
                    stroke="var(--surface-container-high)"
                    strokeWidth={6}
                  />
                  {/* Progress arc */}
                  <circle
                    cx={ringSize / 2}
                    cy={ringSize / 2}
                    r={ringRadius}
                    fill="none"
                    stroke="#a78bfa"
                    strokeWidth={6}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeOffset}
                    style={{
                      transition: 'stroke-dashoffset 1s cubic-bezier(0.33, 1, 0.68, 1)',
                      transform: 'rotate(-90deg)',
                      transformOrigin: '50% 50%',
                    }}
                  />
                </svg>
                {/* Center label */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-display)',
                  fontSize: '1rem',
                  fontWeight: 800,
                  color: 'var(--on-surface)',
                }}>
                  {roadmapPct}%
                </div>
              </div>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 600,
                color: 'var(--on-surface-variant)',
                marginTop: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                Career progress
              </span>
            </div>
          </div>

          {/* ── 4-STAT ROW ── */}
          <div className="stats-grid">
            {/* Milestones */}
            <div className="stat-tile">
              <div className="stat-tile__icon" style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}>
                <Trophy size={18} />
              </div>
              <div className="stat-tile__body">
                <span className="stat-tile__label">Milestones Done</span>
                <span className="stat-tile__value">{completedMilestones} / {totalMilestones}</span>
              </div>
            </div>

            {/* To Do */}
            <div className="stat-tile">
              <div className="stat-tile__icon" style={{ background: 'rgba(167,139,250,0.12)', color: '#a78bfa' }}>
                <ClipboardList size={18} />
              </div>
              <div className="stat-tile__body">
                <span className="stat-tile__label">To Do</span>
                <span className="stat-tile__value">{todoCount}</span>
              </div>
            </div>

            {/* In Progress */}
            <div className="stat-tile">
              <div className="stat-tile__icon" style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}>
                <Zap size={18} />
              </div>
              <div className="stat-tile__body">
                <span className="stat-tile__label">In Progress</span>
                <span className="stat-tile__value">{inProgCount}</span>
              </div>
            </div>

            {/* Done */}
            <div className="stat-tile">
              <div className="stat-tile__icon" style={{ background: 'rgba(94,246,230,0.12)', color: '#5ef6e6' }}>
                <CheckCircle2 size={18} />
              </div>
              <div className="stat-tile__body">
                <span className="stat-tile__label">Completed</span>
                <span className="stat-tile__value">{doneCount}</span>
              </div>
            </div>
          </div>

          {/* ── ACTIVE MILESTONE + CAREER MATCHES ── */}
          <div className="dashboard-grid">
            {/* Active Milestone panel */}
            <div className="panel">
              <div className="panel__header">
                <h2 className="panel__title">Active Milestone</h2>
                <Zap size={15} color="#f59e0b" />
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
                  {/* Milestone title with violet accent */}
                  <div style={{
                    borderLeft: '3px solid #a78bfa',
                    paddingLeft: '12px',
                    marginBottom: '1rem',
                  }}>
                    <p style={{
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: 'var(--on-surface)',
                      lineHeight: 1.3,
                    }}>
                      {activeMilestone.title ?? activeMilestone.name ?? 'Current Milestone'}
                    </p>
                    <p style={{
                      fontSize: '0.8rem',
                      color: 'var(--on-surface-variant)',
                      marginTop: '4px',
                    }}>
                      {activeDone} / {activeMilestoneTotal} tasks done
                      {activeMilestoneRemaining > 0 && ` (${activeMilestoneRemaining} remaining)`}
                    </p>
                  </div>

                  {/* Mini progress bar */}
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
                      background: '#a78bfa',
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

            {/* Career Matches panel */}
            <div className="panel">
              <div className="panel__header">
                <div>
                  <h2 className="panel__title">Career Matches</h2>
                  <p className="panel__sub">Based on your assessment results</p>
                </div>
                {careerMatches.length > 0 && <CheckCircle2 size={16} color="#34d399" />}
              </div>

              {careerMatches.length === 0 ? (
                <div style={{ padding: '1.5rem 0', textAlign: 'center' }}>
                  <Target size={28} color="var(--on-surface-variant)" style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                  <p style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)', marginBottom: '8px' }}>
                    No assessment yet.
                  </p>
                  <Link to="/app/assessment" className="panel-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    Take the assessment <ArrowRight size={13} />
                  </Link>
                </div>
              ) : (
                <div className="matches-list">
                  {careerMatches.map((m: any, i: number) => (
                    <div className="match-row" key={m.title}>
                      <div className="match-score" style={{ color: MATCH_COLORS[i], borderColor: `${MATCH_COLORS[i]}30`, background: `${MATCH_COLORS[i]}12` }}>
                        {m.matchScore}%
                      </div>
                      <div className="match-info">
                        <p className="match-name">{m.title}</p>
                        <p className="match-desc">{m.description}</p>
                      </div>
                      <ArrowRight size={15} color="var(--on-surface-variant)" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── RECENT TASKS ── */}
          <div className="panel" style={{ marginTop: '1rem' }}>
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
