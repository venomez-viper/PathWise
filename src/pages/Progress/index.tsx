import { useState, useEffect } from 'react';
import { Loader2, ArrowRight, TrendingUp, TrendingDown, Minus, BarChart3, Target, Zap, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../lib/auth-context';
import { progress as progressApi, tasks as tasksApi, roadmap as roadmapApi } from '../../lib/api';
import './Progress.css';

/* ─── helper: trend arrow ─── */
function TrendBadge({ value }: { value: number }) {
  const Icon = value > 50 ? TrendingUp : value >= 25 ? Minus : TrendingDown;
  const color = value > 50 ? '#16a34a' : value >= 25 ? '#d97706' : '#dc2626';
  const bg = value > 50 ? 'rgba(22,163,106,.08)' : value >= 25 ? 'rgba(217,119,6,.08)' : 'rgba(220,38,38,.08)';
  const label = value > 50 ? 'Above avg' : value >= 25 ? 'Average' : 'Needs work';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.7rem', fontWeight: 600, color, background: bg, padding: '3px 8px', borderRadius: 'var(--radius-full)' }}>
      <Icon size={12} /> {label}
    </span>
  );
}

/* ─── SVG donut chart ─── */
function DonutChart({ segments }: { segments: { value: number; color: string; label: string }[] }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  if (total === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 160, height: 160 }}>
        <span style={{ fontSize: '0.82rem', color: 'var(--on-surface-variant)' }}>No task data</span>
      </div>
    );
  }
  const r = 56, cx = 80, cy = 80, strokeWidth = 24;
  const circ = 2 * Math.PI * r;
  let cumulative = 0;
  return (
    <svg width="160" height="160" viewBox="0 0 160 160" style={{ overflow: 'visible' }}>
      {segments.filter(s => s.value > 0).map((seg, i) => {
        const pct = seg.value / total;
        const dash = pct * circ;
        const gap = circ - dash;
        const rot = (cumulative / total) * 360 - 90;
        cumulative += seg.value;
        return (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={seg.color} strokeWidth={strokeWidth}
            strokeDasharray={`${dash} ${gap}`}
            style={{ transform: `rotate(${rot}deg)`, transformOrigin: `${cx}px ${cy}px`, transition: 'stroke-dasharray 0.8s ease' }}
          />
        );
      })}
      <text x={cx} y={cy - 6} textAnchor="middle" style={{ fontSize: '1.5rem', fontWeight: 800, fill: 'var(--on-surface)', fontFamily: 'var(--font-display)' }}>{total}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" style={{ fontSize: '0.65rem', fontWeight: 600, fill: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.06em' } as any}>Tasks</text>
    </svg>
  );
}

/* ─── Weekly bar chart (7 days) ─── */
function WeeklyChart({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const barH = 100;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: barH + 24, width: '100%' }}>
      {data.map((v, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: v > 0 ? 'var(--on-surface)' : 'var(--on-surface-variant)' }}>{v || ''}</span>
          <div style={{
            width: '100%', maxWidth: 32, borderRadius: '6px 6px 0 0',
            height: v > 0 ? Math.max((v / max) * barH, 8) : 8,
            background: v > 0 ? 'linear-gradient(180deg, var(--primary), var(--primary-light))' : 'var(--surface-container-high)',
            transition: 'height 0.6s cubic-bezier(.33,1,.68,1)',
          }} />
          <span style={{ fontSize: '0.62rem', fontWeight: 600, color: 'var(--on-surface-variant)' }}>{days[i]}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Radial gauge (career readiness) ─── */
function Gauge({ value, mounted }: { value: number; mounted: boolean }) {
  const r = 85, strokeWidth = 12;
  const size = (r + strokeWidth) * 2;
  const circ = 2 * Math.PI * r;
  const offset = mounted ? ((100 - value) / 100) * circ : circ;
  const status = value >= 80 ? 'Excellent' : value >= 60 ? 'Strong' : value >= 40 ? 'Growing' : value >= 20 ? 'Building' : 'Starting';
  const statusColor = value >= 60 ? '#16a34a' : value >= 40 ? '#d97706' : '#dc2626';
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id="gaugeArc" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--secondary)" />
            <stop offset="50%" stopColor="#00b3a1" />
            <stop offset="100%" stopColor="var(--secondary-container)" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-container-high)" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="url(#gaugeArc)" strokeWidth={strokeWidth}
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transform: 'rotate(-90deg)', transformOrigin: `${size / 2}px ${size / 2}px`, transition: 'stroke-dashoffset 1.2s cubic-bezier(0.33, 1, 0.68, 1)' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--on-surface)', fontFamily: 'var(--font-display)', letterSpacing: '-0.03em', lineHeight: 1 }}>{value}%</span>
        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: statusColor, marginTop: 4 }}>{status}</span>
        <span style={{ fontSize: '0.62rem', fontWeight: 600, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>Career Readiness</span>
      </div>
    </div>
  );
}

/* ─── main page ─── */
export default function Progress() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [taskList, setTaskList] = useState<any[]>([]);
  const [, setRoadmapData] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    Promise.allSettled([
      progressApi.getStats(user.id),
      tasksApi.list(user.id),
      roadmapApi.get(user.id),
    ]).then(([statsRes, tasksRes, roadmapRes]) => {
      if (cancelled) return;
      setStats(statsRes.status === 'fulfilled' ? (statsRes.value as any)?.stats ?? {} : {});
      setTaskList(tasksRes.status === 'fulfilled' ? (tasksRes.value as any)?.tasks ?? [] : []);
      setRoadmapData(roadmapRes.status === 'fulfilled' ? (roadmapRes.value as any) : null);
      setLoading(false);
      setTimeout(() => setMounted(true), 80);
    });

    return () => { cancelled = true; };
  }, [user]);

  /* derived stats */
  const roadmapCompletion = stats?.roadmapCompletion ?? 0;
  const tasksFinished = stats?.tasksFinished ?? 0;
  const tasksRemaining = stats?.tasksRemaining ?? 0;
  const jobReadiness = stats?.jobReadinessScore ?? 0;
  const careerReadiness = stats?.careerReadinessScore ?? 0;
  const breakdown = stats?.breakdown ?? null;
  const tasksTotal = tasksFinished + tasksRemaining;

  /* momentum label */
  const momentumPct = breakdown?.momentum ?? 0;
  const momentumLabel = momentumPct >= 75 ? 'High' : momentumPct >= 40 ? 'Moderate' : momentumPct > 0 ? 'Low' : '—';

  /* task status distribution */
  const todoCount = taskList.filter((t: any) => t.status === 'todo' || t.status === 'not_started').length;
  const inProgressCount = taskList.filter((t: any) => t.status === 'in_progress').length;
  const doneCount = taskList.filter((t: any) => t.status === 'done' || t.status === 'completed').length;

  /* weekly activity (last 7 days) */
  const weeklyData = (() => {
    const now = new Date();
    const dayOfWeek = (now.getDay() + 6) % 7; // Monday=0
    const monday = new Date(now);
    monday.setDate(now.getDate() - dayOfWeek);
    monday.setHours(0, 0, 0, 0);

    const counts = [0, 0, 0, 0, 0, 0, 0];
    taskList.forEach((t: any) => {
      const d = t.completedAt || t.completed_at;
      if (!d) return;
      const date = new Date(d);
      if (date >= monday) {
        const idx = (date.getDay() + 6) % 7;
        if (idx >= 0 && idx < 7) counts[idx]++;
      }
    });
    return counts;
  })();

  /* breakdown bars */
  const breakdownBars = [
    { name: 'Milestones', pct: breakdown?.milestoneProgress ?? jobReadiness, color: 'var(--primary)' },
    { name: 'Tasks', pct: breakdown?.taskCompletion ?? (tasksTotal > 0 ? Math.round((tasksFinished / tasksTotal) * 100) : 0), color: 'var(--secondary)' },
    { name: 'Balance', pct: breakdown?.categoryBalance ?? 0, color: '#d97706' },
    { name: 'Momentum', pct: breakdown?.momentum ?? 0, color: '#2563eb' },
  ];

  /* ── KPI card style ── */
  const kpiCard = (accent: string): React.CSSProperties => ({
    background: 'var(--surface-container-lowest)',
    borderRadius: '1.25rem',
    padding: '1.25rem 1rem',
    boxShadow: 'var(--shadow-sm)',
    borderLeft: `4px solid ${accent}`,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  });

  const panelStyle: React.CSSProperties = {
    background: 'var(--surface-container-lowest)',
    borderRadius: '1.25rem',
    padding: '1.5rem',
    boxShadow: 'var(--shadow-sm)',
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BarChart3 size={22} style={{ color: 'var(--primary)' }} /> Progress Dashboard
          </h1>
          <p className="page-subtitle">Analytics overview of your career readiness and skill development.</p>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
          <Loader2 size={28} color="var(--primary)" style={{ animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* ═══ ROW 1: KPI CARDS ═══ */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }} className="kpi-grid">
            {/* Job Readiness */}
            <div style={kpiCard('var(--primary)')}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--on-surface)', letterSpacing: '-0.02em', lineHeight: 1 }}>{jobReadiness}%</span>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--on-surface-variant)' }}>Job Readiness</span>
              <TrendBadge value={jobReadiness} />
            </div>

            {/* Tasks Done */}
            <div style={kpiCard('var(--secondary)')}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--on-surface)', letterSpacing: '-0.02em', lineHeight: 1 }}>{tasksFinished}<span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--on-surface-variant)' }}>/{tasksTotal}</span></span>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--on-surface-variant)' }}>Tasks Done</span>
              <TrendBadge value={tasksTotal > 0 ? Math.round((tasksFinished / tasksTotal) * 100) : 0} />
            </div>

            {/* Roadmap */}
            <div style={kpiCard('#d97706')}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--on-surface)', letterSpacing: '-0.02em', lineHeight: 1 }}>{roadmapCompletion}%</span>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--on-surface-variant)' }}>Roadmap</span>
              <TrendBadge value={roadmapCompletion} />
            </div>

            {/* Momentum */}
            <div style={kpiCard('#2563eb')}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--on-surface)', letterSpacing: '-0.02em', lineHeight: 1 }}>{momentumLabel}</span>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--on-surface-variant)' }}>Momentum</span>
              <TrendBadge value={momentumPct} />
            </div>
          </div>

          {/* ═══ ROW 2: GAUGE + BREAKDOWN ═══ */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="charts-grid">
            {/* Left: Radial Gauge */}
            <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Gauge value={careerReadiness} mounted={mounted} />
              <p style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)', textAlign: 'center', maxWidth: 260, marginTop: 4 }}>
                {careerReadiness >= 80
                  ? 'Exceptional — you\'re ahead of most candidates.'
                  : careerReadiness >= 50
                  ? 'Good progress — keep completing milestones.'
                  : 'Build momentum by finishing tasks across categories.'}
              </p>
            </div>

            {/* Right: Breakdown bars */}
            <div style={panelStyle}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.92rem', fontWeight: 700, color: 'var(--on-surface)', marginBottom: '1.25rem', letterSpacing: '-0.01em' }}>Performance Breakdown</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {breakdownBars.map(bar => (
                  <div key={bar.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--on-surface)' }}>{bar.name}</span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: bar.color, fontFamily: 'var(--font-display)' }}>{bar.pct}%</span>
                    </div>
                    <div style={{ width: '100%', height: 10, borderRadius: 5, background: 'var(--surface-container-high)', overflow: 'hidden' }}>
                      <div style={{
                        width: mounted ? `${bar.pct}%` : '0%',
                        height: '100%',
                        borderRadius: 5,
                        background: `linear-gradient(90deg, ${bar.color}, ${bar.color}cc)`,
                        transition: 'width 1s cubic-bezier(.33,1,.68,1)',
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ═══ ROW 3: DONUT + WEEKLY ═══ */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="charts-grid">
            {/* Left: Donut */}
            <div style={panelStyle}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.92rem', fontWeight: 700, color: 'var(--on-surface)', marginBottom: '1.25rem', letterSpacing: '-0.01em' }}>Task Distribution</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <DonutChart segments={[
                  { value: todoCount, color: '#94a3b8', label: 'To Do' },
                  { value: inProgressCount, color: '#d97706', label: 'In Progress' },
                  { value: doneCount, color: '#16a34a', label: 'Done' },
                ]} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { label: 'To Do', count: todoCount, color: '#94a3b8' },
                    { label: 'In Progress', count: inProgressCount, color: '#d97706' },
                    { label: 'Done', count: doneCount, color: '#16a34a' },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 3, background: item.color, flexShrink: 0 }} />
                      <span style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)', fontWeight: 500 }}>{item.label}</span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--on-surface)', fontFamily: 'var(--font-display)', marginLeft: 'auto' }}>{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Weekly activity */}
            <div style={panelStyle}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.92rem', fontWeight: 700, color: 'var(--on-surface)', marginBottom: '1.25rem', letterSpacing: '-0.01em' }}>This Week's Activity</h3>
              <WeeklyChart data={weeklyData} />
            </div>
          </div>

          {/* ═══ ROW 4: QUICK ACTIONS ═══ */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }} className="actions-grid">
            <Link to="/app/tasks" style={{ textDecoration: 'none' }}>
              <div className="progress-action-card" style={{ ...panelStyle, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(0,106,98,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <CheckCircle2 size={18} color="var(--secondary)" />
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--on-surface)' }}>View Tasks</span>
                  <p style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', margin: 0 }}>{tasksRemaining} remaining</p>
                </div>
                <ArrowRight size={14} color="var(--on-surface-variant)" />
              </div>
            </Link>

            <Link to="/app/roadmap" style={{ textDecoration: 'none' }}>
              <div className="progress-action-card" style={{ ...panelStyle, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(98,69,164,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Target size={18} color="var(--primary)" />
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--on-surface)' }}>View Roadmap</span>
                  <p style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', margin: 0 }}>{roadmapCompletion}% complete</p>
                </div>
                <ArrowRight size={14} color="var(--on-surface-variant)" />
              </div>
            </Link>

            <Link to="/app/streaks" style={{ textDecoration: 'none' }}>
              <div className="progress-action-card" style={{ ...panelStyle, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(37,99,235,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Zap size={18} color="#2563eb" />
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--on-surface)' }}>Streaks</span>
                  <p style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', margin: 0 }}>Keep momentum</p>
                </div>
                <ArrowRight size={14} color="var(--on-surface-variant)" />
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* responsive overrides moved to Progress.css */}
    </div>
  );
}
