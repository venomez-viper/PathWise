import { useState, useEffect } from 'react';
import { TrendingUp, ClipboardList, Compass, Loader2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
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
      name: 'Data Analysis (SQL)', pct: breakdown.milestoneProgress, color: 'var(--primary)',
    },
    {
      name: 'Market Research', pct: breakdown.taskCompletion, color: 'var(--primary)',
    },
    {
      name: 'Visualization (Tableau)', pct: breakdown.categoryBalance, color: 'var(--primary)',
    },
    {
      name: 'Digital Marketing', pct: breakdown.momentum, color: 'var(--primary)',
    },
  ] : [
    { name: 'Job Readiness',      pct: jobReadiness,      color: 'var(--primary)' },
    { name: 'Career Readiness',   pct: careerReadiness,   color: 'var(--primary)' },
    { name: 'Roadmap Completion', pct: roadmapCompletion, color: 'var(--primary)' },
    { name: 'Task Completion',    pct: taskPct,           color: 'var(--primary)' },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Progress</h1>
          <p className="page-subtitle">Track your career readiness and skill development.</p>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
          <Loader2 size={28} color="var(--primary)" style={{ animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : (
        <>
          {/* ── HERO GAUGE ── */}
          <div className="panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '2.5rem 2rem', marginBottom: '1.5rem' }}>
            <Gauge value={jobReadiness} mounted={mounted} />
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.5rem',
              fontWeight: 800,
              color: '#334042',
              letterSpacing: '-0.02em',
              marginTop: '1rem',
            }}>
              Overall Job Readiness
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--on-surface-variant)', lineHeight: 1.6, maxWidth: '340px', marginTop: '0.5rem' }}>
              {jobReadiness >= 80
                ? "You're making exceptional progress! Your profile strength is in the top 15%."
                : jobReadiness >= 50
                ? "Good progress — keep building skills and completing milestones."
                : "You're just getting started. Complete milestones and balance your task categories to grow faster."}
            </p>
            {jobReadiness > 0 && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                marginTop: '1rem',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(0, 106, 98, 0.06)',
                color: 'var(--secondary)',
                fontSize: '0.78rem',
                fontWeight: 700,
              }}>
                <TrendingUp size={14} /> {jobReadiness}% job ready
              </div>
            )}
          </div>

          {/* ── STAT CARDS ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="stat-tile">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div className="stat-tile__icon" style={{ background: 'rgba(98, 69, 164, 0.08)', color: 'var(--primary)' }}>
                  <ClipboardList size={18} />
                </div>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--on-surface)' }}>{tasksFinished} / {tasksTotal}</span>
              </div>
              <div style={{ marginTop: 8 }}>
                <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--on-surface)' }}>Tasks Summary</p>
                <p style={{ fontSize: '0.72rem', color: 'var(--on-surface-variant)' }}>{tasksRemaining} tasks remaining this week</p>
              </div>
              <div className="stat-tile__bar"><div className="stat-tile__fill" style={{ width: mounted ? `${taskPct}%` : '0%', background: 'var(--primary)' }} /></div>
            </div>

            <div className="stat-tile">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div className="stat-tile__icon" style={{ background: 'rgba(98, 69, 164, 0.08)', color: 'var(--primary)' }}>
                  <Compass size={18} />
                </div>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--on-surface)' }}>{roadmapCompletion}%</span>
              </div>
              <div style={{ marginTop: 8 }}>
                <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--on-surface)' }}>Roadmap Completion</p>
                <p style={{ fontSize: '0.72rem', color: 'var(--on-surface-variant)' }}>Level 2: Strategic Specialist</p>
              </div>
              <div className="stat-tile__bar"><div className="stat-tile__fill" style={{ width: mounted ? `${roadmapCompletion}%` : '0%', background: 'var(--primary)' }} /></div>
            </div>
          </div>

          {/* ── SKILL ROADMAP PROGRESS ── */}
          <div className="panel">
            <h2 className="panel__title" style={{ marginBottom: '1.25rem' }}>Skill Roadmap Progress</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {breakdownItems.map(s => (
                <div key={s.name} className="panel" style={{ padding: '1rem 1.25rem', background: 'var(--surface-container-low)', boxShadow: 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--on-surface)' }}>{s.name}</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-display)' }}>{s.pct}%</span>
                  </div>
                  <div className="stat-tile__bar">
                    <div className="stat-tile__fill" style={{ width: mounted ? `${s.pct}%` : '0%', background: s.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── QUICK LINKS ── */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <Link to="/app/tasks" className="btn-page-action" style={{ flex: 1, justifyContent: 'center' }}>
              View Tasks <ArrowRight size={14} />
            </Link>
            <Link to="/app/roadmap" className="btn-page-secondary" style={{ flex: 1, justifyContent: 'center' }}>
              View Roadmap <ArrowRight size={14} />
            </Link>
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
          <linearGradient id="gaugeGTeal" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#006a62" /><stop offset="100%" stopColor="#5ef6e6" />
          </linearGradient>
        </defs>
        <circle cx="80" cy="80" r={r} fill="none" stroke="var(--surface-container-high)" strokeWidth="10" />
        <circle cx="80" cy="80" r={r} fill="none" stroke="url(#gaugeGTeal)" strokeWidth="10"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transform: 'rotate(-90deg)', transformOrigin: '80px 80px', transition: 'stroke-dashoffset 1.2s cubic-bezier(0.33, 1, 0.68, 1)' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--on-surface)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>{value}%</span>
        <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--on-surface-variant)' }}>Ready</span>
      </div>
    </div>
  );
}
