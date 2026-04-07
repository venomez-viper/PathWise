import { useState, useEffect } from 'react';
import { ArrowRight, Loader2, Target, TrendingUp, CheckCircle2, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../lib/auth-context';
import { assessment, roadmap, tasks, progress } from '../../lib/api';
import { Panda } from '../../components/panda';

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

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    async function load() {
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
        setData({
          roadmapPct: roadmapData?.completionPercent ?? 0,
          targetRole: roadmapData?.targetRole ?? '—',
          hasAssessment: !!assessResult,
          careerMatches: (assessResult?.careerMatches ?? []).slice(0, 3),
          recentTasks: taskList.slice(0, 4),
          allTasks: taskList,
          stats: { tasksFinished: statsData?.tasksFinished ?? doneCount, tasksTotal: taskList.length, jobReadinessScore: statsData?.jobReadinessScore ?? 0 },
          milestones, activeMilestone, activeMilestoneTasks, activeDone, doneCount,
        });
      } finally { if (!cancelled) { setLoading(false); setTimeout(() => setMounted(true), 100); } }
    }
    load();
    return () => { cancelled = true; };
  }, [user]);

  const { roadmapPct, targetRole, hasAssessment, careerMatches, recentTasks, activeMilestone, activeMilestoneTasks, activeDone } = data;
  const ringSize = 90; const ringR = 38; const circ = 2 * Math.PI * ringR;
  const strokeOff = mounted ? circ * (1 - roadmapPct / 100) : circ;

  if (loading) return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <Loader2 size={22} color="var(--primary)" style={{ animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  if (!loading && !data.hasAssessment) {
    return (
      <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', textAlign: 'center', gap: '1.5rem' }}>
        <div style={{ fontSize: '3rem' }}>
          <Sparkles size={48} color="var(--primary)" />
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, color: 'var(--on-surface)', letterSpacing: '-0.03em' }}>
          Welcome to PathWise!
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--on-surface-variant)', maxWidth: '480px', lineHeight: 1.6 }}>
          Take a quick 5-minute career assessment to unlock your personalized roadmap, tasks, and skill insights. This is your first step toward career mastery.
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
          {['Personalized Career Matches', 'Custom Roadmap & Milestones', 'AI-Generated Tasks', 'Skill Gap Analysis'].map(item => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>
              <CheckCircle2 size={16} color="var(--primary)" />
              {item}
            </div>
          ))}
        </div>
        <Link
          to="/app/assessment"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '14px 32px', borderRadius: 'var(--radius-full)',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%)',
            color: '#fff', fontWeight: 700, fontSize: '1rem',
            textDecoration: 'none', marginTop: '0.5rem',
            boxShadow: 'var(--shadow-md)', transition: 'transform 0.15s, box-shadow 0.15s',
          }}
        >
          Start Your Assessment <ArrowRight size={18} />
        </Link>
        <p style={{ fontSize: '0.78rem', color: 'var(--on-surface-muted)', marginTop: '0.5rem' }}>
          Takes about 5 minutes. You can retake it anytime.
        </p>
      </div>
    );
  }

  return (
    <div className="page">
      {/* ── HERO BANNER — Zen Stone gradient ── */}
      <div style={{
        background: 'linear-gradient(135deg, #334042 0%, #4a5759 60%, #5a6b6e 100%)',
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
        <div style={{ display: 'flex', gap: 10, marginTop: '1.25rem' }}>
          <Link to="/app/roadmap" style={{
            padding: '0.6rem 1.4rem', borderRadius: 'var(--radius-full)',
            background: '#8b4f2c', color: '#fff', fontWeight: 700, fontSize: '0.82rem',
          }}>View Roadmap</Link>
          <Link to="/app/onboarding" style={{
            padding: '0.6rem 1.4rem', borderRadius: 'var(--radius-full)',
            background: 'rgba(255,255,255,0.12)', color: '#fff', fontWeight: 600, fontSize: '0.82rem',
          }}>Update Goals</Link>
        </div>
        <Panda mood="waving" size={130} style={{ position: 'absolute', bottom: -10, right: 24, opacity: 0.95 }} animate />
      </div>

      {/* ── MAIN GRID — Progress + Career Matches ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>

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
                    <circle cx={ringSize/2} cy={ringSize/2} r={ringR} fill="none" stroke="#8b4f2c" strokeWidth={6}
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
                  <p style={{ fontSize: '0.72rem', color: '#8b4f2c', fontWeight: 600, marginTop: 4 }}>Optional Guidance</p>
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
            <Link to="/app/assessment" style={{ fontSize: '0.72rem', fontWeight: 600, color: '#8b4f2c' }}>
              Explore All Matches &rarr;
            </Link>
          </div>

          {careerMatches.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <p style={{ fontSize: '0.82rem', color: 'var(--on-surface-variant)' }}>Take the assessment to see matches.</p>
              <Link to="/app/assessment" className="panel-link">Start Assessment <ArrowRight size={13} /></Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
              {careerMatches.map((m, i) => (
                <Link to="/app/assessment" key={m.title} style={{
                  background: 'var(--surface-container-low)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '1.25rem 1rem',
                  textAlign: 'center',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 'var(--radius-md)',
                    background: i === 0 ? 'rgba(139, 79, 44, 0.1)' : 'var(--surface-container)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Target size={20} color={i === 0 ? '#8b4f2c' : 'var(--on-surface-variant)'} />
                  </div>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', fontWeight: 700, color: 'var(--on-surface)' }}>{m.title}</p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', lineHeight: 1.4 }}>{m.description?.slice(0, 60)}</p>
                  <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#8b4f2c' }}>{m.matchScore}% match</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── BOTTOM ROW — Active Milestone + Recent Tasks + Insights ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>

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
              <div style={{ borderLeft: '3px solid #8b4f2c', paddingLeft: 12, marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--on-surface)' }}>{activeMilestone.title ?? 'Current Milestone'}</p>
                <p style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)', marginTop: 3 }}>
                  {activeDone} / {activeMilestoneTasks.length} tasks done
                </p>
              </div>
              <div style={{ height: 5, background: 'var(--surface-container)', borderRadius: 999, overflow: 'hidden', marginBottom: '0.75rem' }}>
                <div style={{ height: '100%', width: mounted ? `${activeMilestoneTasks.length > 0 ? (activeDone/activeMilestoneTasks.length)*100 : 0}%` : '0%', background: '#8b4f2c', borderRadius: 999, transition: 'width 0.9s ease' }} />
              </div>
              <Link to="/app/roadmap" className="panel-link">Go to Roadmap <ArrowRight size={13} /></Link>
            </div>
          )}
        </div>

        {/* EXPERT INSIGHTS / RECENT TASKS */}
        <div className="panel" style={{ borderRadius: '2rem' }}>
          <p style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--on-surface-variant)', marginBottom: '0.75rem' }}>
            Recent Tasks
          </p>
          {recentTasks.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <p style={{ fontSize: '0.82rem', color: 'var(--on-surface-variant)' }}>No tasks yet — your roadmap will generate them.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recentTasks.map((t: any) => (
                <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                    border: `2px solid ${t.status === 'done' ? '#8b4f2c' : 'var(--surface-container-high)'}`,
                    background: t.status === 'done' ? 'rgba(139,79,44,0.15)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {t.status === 'done' && <CheckCircle2 size={10} color="#8b4f2c" />}
                  </div>
                  <span style={{
                    fontSize: '0.82rem', fontWeight: 500, color: t.status === 'done' ? 'var(--on-surface-variant)' : 'var(--on-surface)',
                    textDecoration: t.status === 'done' ? 'line-through' : 'none',
                  }}>{t.title}</span>
                </div>
              ))}
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
            <p style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>AI-analyse your strengths and get career matches.</p>
          </div>
          <Link to="/app/assessment" className="btn-page-action">Start <ArrowRight size={14} /></Link>
        </div>
      )}
    </div>
  );
}
