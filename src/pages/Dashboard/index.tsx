import { useState, useEffect, useMemo, useRef } from 'react';
import { ArrowRight, Target, TrendingUp, CheckCircle2, Crosshair } from 'lucide-react';
import DashboardSkeleton from './DashboardSkeleton';
import { Link } from 'react-router-dom';
import { useAuth } from '../../lib/auth-context';
import { assessment, roadmap, tasks, progress } from '../../lib/api';
import { Panda } from '../../components/panda';
import OnboardingTour from '../../components/OnboardingTour';
import ShareButton from '../../components/ShareButton';
import QuickStartChecklist from '../../components/QuickStartChecklist';
import FirstVisitTooltip from '../../components/FirstVisitTooltip';

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
    allTasks: any[];
    stats: { tasksFinished: number; tasksTotal: number; jobReadinessScore: number };
    milestones: any[];
    activeMilestone: any;
    activeMilestoneTasks: any[];
    activeDone: number;
    doneCount: number;
  }>({
    roadmapPct: 0, targetRole: '—', hasAssessment: false, careerMatches: [], recentTasks: [],
    allTasks: [],
    stats: { tasksFinished: 0, tasksTotal: 0, jobReadinessScore: 0 },
    milestones: [], activeMilestone: null, activeMilestoneTasks: [], activeDone: 0, doneCount: 0,
  });

  const [loadKey, setLoadKey] = useState(0);
  const lastDashFetchRef = useRef(0);

  // Refetch when page becomes visible (user navigates back from Tasks, etc.) — only if stale (>30s)
  useEffect(() => {
    const onFocus = () => {
      if (Date.now() - lastDashFetchRef.current > 30_000) setLoadKey(k => k + 1);
    };
    const onVisibility = () => {
      if (document.visibilityState === 'visible' && Date.now() - lastDashFetchRef.current > 30_000) {
        setLoadKey(k => k + 1);
      }
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    let mountTimer: ReturnType<typeof setTimeout>;
    async function load() {
      lastDashFetchRef.current = Date.now();
      try {
        const [assessRes, roadmapRes, tasksRes, progressRes] = await Promise.allSettled([
          assessment.getResult(user!.id), roadmap.get(user!.id),
          tasks.list(user!.id), progress.getStats(user!.id),
        ]);
        if (cancelled) return;
        const assessResult = assessRes.status === 'fulfilled' ? (assessRes.value as any).result : null;
        const roadmapData = roadmapRes.status === 'fulfilled' ? (roadmapRes.value as any).roadmap : null;
        const taskList = tasksRes.status === 'fulfilled' ? (tasksRes.value as any).tasks ?? [] : [];
        const statsData = progressRes.status === 'fulfilled' ? (progressRes.value as any).stats : null;
        const milestones = roadmapData?.milestones ?? [];
        const activeMilestone = milestones.find((m: any) => m.status === 'in_progress') ?? null;
        const doneCount = taskList.filter((t: any) => t.status === 'done').length;
        const activeMilestoneTasks = activeMilestone ? taskList.filter((t: any) => t.milestoneId === activeMilestone.id) : [];
        const activeDone = activeMilestoneTasks.filter((t: any) => t.status === 'done').length;

        // Show most recent tasks: pending first, then recently completed
        const pending = taskList.filter((t: any) => t.status !== 'done');
        const done = taskList.filter((t: any) => t.status === 'done');
        const recentTasks = [...pending.slice(0, 3), ...done.slice(0, 1)].slice(0, 4);

        setData({
          roadmapPct: roadmapData?.completionPercent ?? 0,
          targetRole: roadmapData?.targetRole ?? '—',
          hasAssessment: !!assessResult,
          careerMatches: (assessResult?.careerMatches ?? []).slice(0, 3),
          recentTasks,
          allTasks: taskList,
          stats: { tasksFinished: statsData?.tasksFinished ?? doneCount, tasksTotal: taskList.length, jobReadinessScore: statsData?.jobReadinessScore ?? 0 },
          milestones, activeMilestone, activeMilestoneTasks, activeDone, doneCount,
        });
      } finally { if (!cancelled) { setLoading(false); const t = setTimeout(() => setMounted(true), 100); mountTimer = t; } }
    }
    load();
    return () => { cancelled = true; clearTimeout(mountTimer); };
  }, [user, loadKey]);

  const [showTour, setShowTour] = useState(false);

  const allMilestonesComplete = useMemo(() =>
    data.milestones.length > 0 &&
    data.milestones.every((m: any) => m.status === 'completed'),
  [data.milestones]);

  useEffect(() => {
    if (data.hasAssessment && !localStorage.getItem('pathwise_tour_done')) {
      // Small delay to let the page render first
      const timer = setTimeout(() => setShowTour(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [data.hasAssessment]);

  const { roadmapPct, targetRole, hasAssessment, careerMatches, recentTasks, activeMilestone, activeMilestoneTasks, activeDone } = data;
  const ringSize = 90; const ringR = 38; const circ = 2 * Math.PI * ringR;
  const strokeOff = mounted ? circ * (1 - roadmapPct / 100) : circ;

  if (loading) return <DashboardSkeleton />;

  if (!loading && !data.hasAssessment) {
    const firstName = user?.name?.split(' ')[0] ?? '';
    return (
      <div className="page" style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: '70vh', padding: '2rem',
      }}>
        <div style={{
          background: 'var(--surface-container-lowest)',
          borderRadius: '2.5rem', padding: '3rem 2.5rem', maxWidth: 480,
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          textAlign: 'center',
        }}>
          {/* Step indicator */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(139, 79, 44, 0.08)', borderRadius: 'var(--radius-full)',
            padding: '4px 14px', marginBottom: '1.25rem',
          }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--copper)' }}>Step 1 of 3</span>
          </div>

          <Panda mood="waving" size={120} animate />

          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800,
            color: 'var(--on-surface)', letterSpacing: '-0.03em', marginTop: '1.25rem',
            lineHeight: 1.2,
          }}>
            {firstName ? `Hey ${firstName}, welcome!` : 'Welcome to PathWise!'}
          </h1>

          <p style={{
            fontSize: '0.95rem', color: 'var(--on-surface-variant)', lineHeight: 1.65,
            marginTop: '0.75rem', marginBottom: '1.25rem', maxWidth: 360, marginLeft: 'auto', marginRight: 'auto',
          }}>
            Your career journey starts here. Three simple steps to a personalized career plan.
          </p>

          {/* 3-step flow */}
          <div style={{
            display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '2rem',
            maxWidth: 320, marginLeft: 'auto', marginRight: 'auto',
          }}>
            {[
              { step: 1, icon: <Target size={16} color="var(--copper)" />, text: 'Take Assessment', sub: 'Answer a few questions about your skills', active: true },
              { step: 2, icon: <TrendingUp size={16} color="var(--on-surface-variant)" />, text: 'Get Career Matches', sub: 'See roles that fit your strengths', active: false },
              { step: 3, icon: <CheckCircle2 size={16} color="var(--on-surface-variant)" />, text: 'Build Your Roadmap', sub: 'Milestones and tasks tailored to you', active: false },
            ].map((item) => (
              <div key={item.step} style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                background: item.active ? 'rgba(139, 79, 44, 0.06)' : 'var(--surface-container-low)',
                border: item.active ? '1.5px solid rgba(139, 79, 44, 0.2)' : '1.5px solid transparent',
                borderRadius: 'var(--radius-xl)',
                padding: '0.7rem 1rem', textAlign: 'left',
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 'var(--radius-full)',
                  background: item.active ? 'rgba(139, 79, 44, 0.12)' : 'rgba(98,69,164,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {item.icon}
                </div>
                <div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: item.active ? 'var(--on-surface)' : 'var(--on-surface-variant)', display: 'block' }}>
                    {item.text}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--on-surface-variant)', lineHeight: 1.3 }}>
                    {item.sub}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <Link to="/app/assessment-v2" style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            background: 'var(--copper)', width: '100%', maxWidth: 320,
            color: '#fff', padding: '0.9rem 2rem', borderRadius: 'var(--radius-full)',
            fontWeight: 700, fontSize: '1rem', textDecoration: 'none', cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(139,79,44,0.25)', transition: 'transform 0.15s, box-shadow 0.15s',
          }}>
            Start Your Assessment <ArrowRight size={18} />
          </Link>

          <p style={{
            fontSize: '0.75rem', color: 'var(--on-surface-muted, #999)', marginTop: '1rem',
          }}>
            Takes about 5 minutes
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      {/* ── COMPLETION BANNER — shown when all milestones are done ── */}
      {allMilestonesComplete && (
        <div className="panel" style={{
          borderRadius: '2rem', padding: '2rem', marginBottom: '1.5rem',
          background: 'linear-gradient(135deg, rgba(139,79,44,0.06), rgba(0,106,98,0.06))',
          border: '2px solid rgba(139,79,44,0.15)',
          textAlign: 'center',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
        }}>
          <Panda mood="celebrating" size={100} animate />
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800,
            color: 'var(--on-surface)', marginTop: '1rem',
          }}>
            Roadmap Complete!
          </h2>
          <p style={{ color: 'var(--on-surface-variant)', marginTop: '0.5rem' }}>
            Congratulations! You've completed all milestones for {data.targetRole}.
          </p>
          <Link
            to="/app/certificate"
            className="btn-page-action"
            style={{ marginTop: '1rem', background: 'var(--copper)', textDecoration: 'none', cursor: 'pointer' }}
          >
            View Certificate
          </Link>
        </div>
      )}

      {/* ── HERO BANNER — Zen Stone gradient ── */}
      <div style={{
        background: `linear-gradient(135deg, var(--surface-container) 0%, #4a5759 60%, #5a6b6e 100%)`,
        borderRadius: '2.5rem',
        padding: '2.25rem 2.5rem',
        marginBottom: '1.5rem',
        color: '#fff',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <p style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6, marginBottom: 6 }}>
          CLUSTER HUB &middot; Main Dashboard
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>
          Welcome back, {user?.name?.split(' ')[0]}.
        </h1>
        <p style={{ fontSize: '0.85rem', opacity: 0.7, lineHeight: 1.5, maxWidth: 400 }}>
          {roadmapPct > 0
            ? `Your strategic roadmap is evolving. You've completed ${roadmapPct}% of your path to ${targetRole}.`
            : `Your career journey is about to begin. Start building your path to ${targetRole}.`}
        </p>
        <div style={{ display: 'flex', gap: 10, marginTop: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <Link to="/app/roadmap" style={{
            padding: '0.6rem 1.4rem', borderRadius: 'var(--radius-full)',
            background: 'var(--copper)', color: '#fff', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', textDecoration: 'none',
          }}>View Roadmap</Link>
          <Link to="/app/onboarding" style={{
            padding: '0.6rem 1.4rem', borderRadius: 'var(--radius-full)',
            background: 'rgba(255,255,255,0.12)', color: '#fff', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', textDecoration: 'none',
          }}>Update Goals</Link>
          <ShareButton
            url="https://pathwise.fit"
            title="PathWise - Career Guidance"
            text="I'm using PathWise to map my career path and build a personalized roadmap. Try it free!"
          />
        </div>
        <Panda mood="waving" size={130} style={{ position: 'absolute', bottom: -10, right: 24, opacity: 0.95 }} animate />
      </div>

      {/* ── QUICK START CHECKLIST — for users still getting started ── */}
      <QuickStartChecklist
        hasAssessment={hasAssessment}
        hasCareerMatches={careerMatches.length > 0}
        hasRoadmap={data.milestones.length > 0}
        hasCompletedTask={data.doneCount > 0}
      />

      {/* ── FIRST-VISIT TOOLTIP on progress ring ── */}
      <FirstVisitTooltip
        id="dashboard-progress-ring"
        message="This ring shows your overall roadmap completion. It fills up as you finish milestones."
        targetSelector=".panel svg circle[stroke='var(--copper)']"
        position="right"
        delay={1500}
      />

      {/* ── MAIN GRID — Progress + Career Matches ── */}
      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>

        {/* PROGRESS FILES */}
        <div className="panel" style={{ borderRadius: '2rem' }}>
          <p style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--on-surface-variant)', marginBottom: '1rem' }}>
            Progress Files
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            {/* Roadmap ring */}
            <div>
              <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--on-surface)', marginBottom: 6 }}>Roadmap Completion</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ position: 'relative', width: ringSize, height: ringSize }}>
                  <svg width={ringSize} height={ringSize} viewBox={`0 0 ${ringSize} ${ringSize}`}>
                    <circle cx={ringSize/2} cy={ringSize/2} r={ringR} fill="none" stroke="var(--surface-container)" strokeWidth={6} />
                    <circle cx={ringSize/2} cy={ringSize/2} r={ringR} fill="none" stroke="var(--copper)" strokeWidth={6}
                      strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={strokeOff}
                      style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 1s cubic-bezier(0.33, 1, 0.68, 1)' }}
                    />
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 800 }}>
                    {roadmapPct}%
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', lineHeight: 1.4 }}>
                    You've completed {roadmapPct}% of milestones in your pathway.
                  </p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--copper)', fontWeight: 600, marginTop: 4 }}>Optional Guidance</p>
                </div>
              </div>
            </div>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', gap: 8 }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--on-surface-variant)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <TrendingUp size={12} /> Job Readiness
            </span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.85rem', color: 'var(--on-surface)' }}>
              {data.stats.jobReadinessScore}%
            </span>
          </div>
        </div>

        {/* ALIGNED NEW JOBS */}
        <div className="panel" style={{ borderRadius: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--on-surface-variant)' }}>
              Aligned New Jobs
            </p>
            <Link to="/app/assessment-v2" style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--copper)', cursor: 'pointer', textDecoration: 'none' }}>
              Explore All Matches &rarr;
            </Link>
          </div>

          {careerMatches.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <p style={{ fontSize: '0.82rem', color: 'var(--on-surface-variant)' }}>Take the assessment to see matches.</p>
              <Link to="/app/assessment-v2" className="panel-link">Start Assessment <ArrowRight size={13} /></Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
              {careerMatches.map((m, i) => (
                <Link to="/app/assessment-v2" key={m.title} style={{
                  background: 'var(--surface-container-low)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '1.25rem 1rem',
                  textAlign: 'center',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  cursor: 'pointer', textDecoration: 'none',
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 'var(--radius-md)',
                    background: i === 0 ? 'rgba(139, 79, 44, 0.1)' : 'var(--surface-container)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Target size={20} color={i === 0 ? 'var(--copper)' : 'var(--on-surface-variant)'} />
                  </div>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', fontWeight: 700, color: 'var(--on-surface)' }}>{m.title}</p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', lineHeight: 1.4 }}>{m.description?.slice(0, 60)}</p>
                  <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--copper)' }}>{m.matchScore}% match</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── BOTTOM ROW — Active Milestone + Recent Tasks + Insights ── */}
      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '1rem' }}>

        {/* ACTIVE MILESTONE */}
        <div className="panel" style={{ borderRadius: '2rem' }}>
          <div className="panel__header">
            <h2 className="panel__title">Active Milestone</h2>
          </div>
          {!activeMilestone ? (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>Complete onboarding to generate your roadmap.</p>
              <Link to="/app/roadmap" className="panel-link">Go to Roadmap <ArrowRight size={13} /></Link>
            </div>
          ) : (
            <div>
              <div style={{ borderLeft: '3px solid var(--copper)', paddingLeft: 12, marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--on-surface)' }}>{activeMilestone.title ?? 'Current Milestone'}</p>
                <p style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)', marginTop: 3 }}>
                  {activeDone} / {activeMilestoneTasks.length} tasks done
                </p>
              </div>
              <div style={{ height: 5, background: 'var(--surface-container)', borderRadius: 999, overflow: 'hidden', marginBottom: '0.75rem' }}>
                <div style={{ height: '100%', width: mounted ? `${activeMilestoneTasks.length > 0 ? (activeDone/activeMilestoneTasks.length)*100 : 0}%` : '0%', background: 'var(--copper)', borderRadius: 999, transition: 'width 0.9s ease' }} />
              </div>
              <Link to="/app/roadmap" className="panel-link">Go to Roadmap <ArrowRight size={13} /></Link>
            </div>
          )}
        </div>

        {/* EXPERT INSIGHTS / RECENT TASKS */}
        <div className="panel" style={{ borderRadius: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <p style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--on-surface-variant)', margin: 0 }}>
              Recent Tasks
            </p>
            <Link to="/app/focus" style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '3px 10px', borderRadius: 'var(--radius-full)',
              background: 'rgba(139,79,44,0.08)', color: 'var(--copper)',
              fontSize: '0.68rem', fontWeight: 600, textDecoration: 'none',
            }}>
              <Crosshair size={11} /> Focus
            </Link>
          </div>
          {recentTasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <p style={{ fontSize: '0.82rem', color: 'var(--on-surface-variant)', marginBottom: '0.75rem' }}>No tasks yet — your roadmap will generate them.</p>
              <Link to="/app/roadmap" style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '0.5rem 1.15rem', borderRadius: 'var(--radius-full)',
                background: 'var(--copper)', color: '#fff', fontWeight: 700,
                fontSize: '0.78rem', textDecoration: 'none',
              }}>Generate your roadmap <ArrowRight size={13} /></Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recentTasks.map((t: any) => {
                const dueDate = t.dueDate ? new Date(t.dueDate) : null;
                const now = new Date();
                const isOverdue = dueDate && dueDate < now && t.status !== 'done';
                const isDueSoon = dueDate && !isOverdue && t.status !== 'done' && (dueDate.getTime() - now.getTime()) < 3 * 86400000;
                return (
                  <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                      border: `2px solid ${t.status === 'done' ? 'var(--copper)' : isOverdue ? '#ef4444' : 'var(--surface-container-high)'}`,
                      background: t.status === 'done' ? 'rgba(139,79,44,0.15)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {t.status === 'done' && <CheckCircle2 size={10} color="var(--copper)" />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{
                        fontSize: '0.82rem', fontWeight: 500, color: t.status === 'done' ? 'var(--on-surface-variant)' : 'var(--on-surface)',
                        textDecoration: t.status === 'done' ? 'line-through' : 'none',
                        display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>{t.title}</span>
                      {dueDate && t.status !== 'done' && (
                        <span style={{
                          fontSize: '0.68rem', fontWeight: 600,
                          color: isOverdue ? '#ef4444' : isDueSoon ? '#f59e0b' : 'var(--on-surface-muted)',
                        }}>
                          {isOverdue ? 'Overdue' : isDueSoon ? 'Due soon' : `Due ${dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <Link to="/app/tasks" className="panel-link" style={{ marginTop: '0.75rem' }}>
            See all tasks <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* CTA for no assessment */}
      {!hasAssessment && (
        <div className="panel panel--accent" style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', borderRadius: '2rem' }}>
          <div>
            <p style={{ fontWeight: 700, color: 'var(--on-surface)', marginBottom: 4 }}>Take the Career Assessment</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>Analyse your strengths and get career matches.</p>
          </div>
          <Link to="/app/assessment-v2" className="btn-page-action">Start <ArrowRight size={14} /></Link>
        </div>
      )}

      {showTour && <OnboardingTour onComplete={() => setShowTour(false)} />}

    </div>
  );
}
