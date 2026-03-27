import { useState, useEffect } from 'react';
import { TrendingUp, ClipboardList, Compass, Award, Loader2 } from 'lucide-react';
import { useAuth } from '../../lib/auth-context';
import { progress as progressApi } from '../../lib/api';

export default function Progress() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    progressApi.getStats(user.id).then((res: any) => {
      if (!cancelled) { setStats(res.stats); setLoading(false); setTimeout(() => setMounted(true), 100); }
    }).catch(() => { if (!cancelled) { setStats({}); setLoading(false); setTimeout(() => setMounted(true), 100); } });
    return () => { cancelled = true; };
  }, [user]);

  const roadmapCompletion = stats?.roadmapCompletion     ?? 0;
  const tasksFinished     = stats?.tasksFinished         ?? 0;
  const tasksRemaining    = stats?.tasksRemaining        ?? 0;
  const jobReadiness      = stats?.jobReadinessScore     ?? 0;
  const careerReadiness   = stats?.careerReadinessScore  ?? 0;
  const breakdown         = stats?.breakdown             ?? null;
  const tasksTotal        = tasksFinished + tasksRemaining;
  const taskPct           = tasksTotal > 0 ? Math.round((tasksFinished / tasksTotal) * 100) : 0;

  const breakdownItems = breakdown ? [
    {
      name: 'Milestone Progress', pct: breakdown.milestoneProgress, color: '#a78bfa', weight: '35%',
      tip: breakdown.milestoneProgress < 20 ? 'Complete your first milestone to start building momentum.' : null,
    },
    {
      name: 'Task Completion', pct: breakdown.taskCompletion, color: '#5ef6e6', weight: '20%',
      tip: breakdown.taskCompletion < 30 ? 'Tick off tasks in your roadmap to raise this score.' : null,
    },
    {
      name: 'Category Balance', pct: breakdown.categoryBalance, color: '#34d399', weight: '25%',
      tip: breakdown.categoryBalance < 50 ? 'Complete networking and portfolio tasks — not just learning.' : null,
    },
    {
      name: 'Momentum (last 14 days)', pct: breakdown.momentum, color: '#f59e0b', weight: '10%',
      tip: breakdown.momentum === 0 ? 'No recent activity — complete 3+ tasks in the next 2 weeks.' : null,
    },
  ] : [
    { name: 'Job Readiness',      pct: jobReadiness,      color: '#a78bfa', weight: '—', tip: null },
    { name: 'Career Readiness',   pct: careerReadiness,   color: '#5ef6e6', weight: '—', tip: null },
    { name: 'Roadmap Completion', pct: roadmapCompletion, color: '#34d399', weight: '—', tip: null },
    { name: 'Task Completion',    pct: taskPct,           color: '#f59e0b', weight: '—', tip: null },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Progress</h1>
          <p className="page-subtitle">Track your career readiness and skill development.</p>
        </div>
        {!loading && <div className="readiness-badge"><TrendingUp size={14} /> {jobReadiness}% job ready</div>}
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
          <Loader2 size={28} color="var(--primary)" style={{ animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-tile">
              <div className="stat-tile__icon" style={{ background: 'rgba(167,139,250,0.12)', color: '#a78bfa' }}><Award size={18} /></div>
              <div className="stat-tile__body">
                <span className="stat-tile__label">Job Readiness</span>
                <span className="stat-tile__value">{jobReadiness}%</span>
              </div>
              <div className="stat-tile__bar"><div className="stat-tile__fill" style={{ width: mounted ? `${jobReadiness}%` : '0%', background: '#a78bfa' }} /></div>
            </div>
            <div className="stat-tile">
              <div className="stat-tile__icon" style={{ background: 'rgba(94,246,230,0.12)', color: '#5ef6e6' }}><ClipboardList size={18} /></div>
              <div className="stat-tile__body">
                <span className="stat-tile__label">Tasks Completed</span>
                <span className="stat-tile__value">{tasksFinished} / {tasksTotal}</span>
              </div>
              <div className="stat-tile__bar"><div className="stat-tile__fill" style={{ width: mounted ? `${taskPct}%` : '0%', background: '#5ef6e6' }} /></div>
            </div>
            <div className="stat-tile">
              <div className="stat-tile__icon" style={{ background: 'rgba(52,211,153,0.12)', color: '#34d399' }}><Compass size={18} /></div>
              <div className="stat-tile__body">
                <span className="stat-tile__label">Roadmap Progress</span>
                <span className="stat-tile__value">{roadmapCompletion}%</span>
              </div>
              <div className="stat-tile__bar"><div className="stat-tile__fill" style={{ width: mounted ? `${roadmapCompletion}%` : '0%', background: '#34d399' }} /></div>
            </div>
            <div className="stat-tile">
              <div className="stat-tile__icon" style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}><TrendingUp size={18} /></div>
              <div className="stat-tile__body">
                <span className="stat-tile__label">Career Readiness</span>
                <span className="stat-tile__value">{careerReadiness}%</span>
              </div>
              <div className="stat-tile__bar"><div className="stat-tile__fill" style={{ width: mounted ? `${careerReadiness}%` : '0%', background: '#f59e0b' }} /></div>
            </div>
          </div>

          <div className="progress-grid">
            <div className="panel">
              <div className="panel__header">
                <div>
                  <h2 className="panel__title">Score Breakdown</h2>
                  <p className="panel__sub">How your readiness score is calculated</p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '8px' }}>
                {breakdownItems.map(s => (
                  <div key={s.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '5px' }}>
                      <div>
                        <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--on-surface)' }}>{s.name}</span>
                        {s.weight !== '—' && (
                          <span style={{ fontSize: '0.7rem', color: 'var(--on-surface-muted)', marginLeft: 6 }}>({s.weight})</span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: s.color }}>{s.pct}%</span>
                    </div>
                    <div className="stat-tile__bar">
                      <div className="stat-tile__fill" style={{ width: mounted ? `${s.pct}%` : '0%', background: s.color }} />
                    </div>
                    {s.tip && (
                      <p style={{ fontSize: '0.75rem', color: '#f59e0b', marginTop: '4px' }}>⚡ {s.tip}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
              <h2 className="panel__title" style={{ marginBottom: '1.5rem' }}>Overall Job Readiness</h2>
              <Gauge value={jobReadiness} mounted={mounted} />
              <p style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)', lineHeight: 1.6, maxWidth: '280px', marginTop: '1.25rem' }}>
                {jobReadiness >= 80
                  ? "You're in great shape! Keep completing tasks to hit 100%."
                  : jobReadiness >= 50
                  ? "Good progress — keep building skills and completing milestones."
                  : "You're just getting started. Complete milestones and balance your task categories to grow faster."}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Gauge({ value, mounted }: { value: number; mounted: boolean }) {
  const r = 70, circ = 2 * Math.PI * r;
  const offset = mounted ? ((100 - value) / 100) * circ : circ;
  return (
    <div style={{ position: 'relative', width: 160, height: 160 }}>
      <svg width="160" height="160" viewBox="0 0 160 160">
        <defs>
          <linearGradient id="gaugeG" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a78bfa" /><stop offset="100%" stopColor="#5ef6e6" />
          </linearGradient>
        </defs>
        <circle cx="80" cy="80" r={r} fill="none" stroke="var(--surface-container-high)" strokeWidth="10" />
        <circle cx="80" cy="80" r={r} fill="none" stroke="url(#gaugeG)" strokeWidth="10"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transform: 'rotate(-90deg)', transformOrigin: '80px 80px', transition: 'stroke-dashoffset 1.2s ease' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--on-surface)', fontFamily: 'var(--font-display)' }}>{value}%</span>
        <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--on-surface-variant)' }}>Ready</span>
      </div>
    </div>
  );
}
