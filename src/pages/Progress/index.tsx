import { useState, useEffect } from 'react';
import { TrendingUp, ClipboardList, Compass, Award } from 'lucide-react';

const SKILLS = [
  { name: 'Data Analysis (SQL)',     pct: 85, color: '#a78bfa' },
  { name: 'Market Research',         pct: 60, color: '#5ef6e6' },
  { name: 'Visualization (Tableau)', pct: 40, color: '#f59e0b' },
  { name: 'Digital Marketing',       pct: 25, color: '#34d399' },
];

export default function Progress() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 100); }, []);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Progress</h1>
          <p className="page-subtitle">Track your career readiness and skill development.</p>
        </div>
        <div className="readiness-badge">
          <TrendingUp size={14} />
          +12% from last week
        </div>
      </div>

      {/* Stats row */}
      <div className="stats-grid">
        <div className="stat-tile">
          <div className="stat-tile__icon" style={{ background: 'rgba(167,139,250,0.12)', color: '#a78bfa' }}>
            <Award size={18} />
          </div>
          <div className="stat-tile__body">
            <span className="stat-tile__label">Job Readiness</span>
            <span className="stat-tile__value">73%</span>
          </div>
          <div className="stat-tile__bar">
            <div className="stat-tile__fill" style={{ width: mounted ? '73%' : '0%', background: '#a78bfa' }} />
          </div>
        </div>

        <div className="stat-tile">
          <div className="stat-tile__icon" style={{ background: 'rgba(94,246,230,0.12)', color: '#5ef6e6' }}>
            <ClipboardList size={18} />
          </div>
          <div className="stat-tile__body">
            <span className="stat-tile__label">Tasks Summary</span>
            <span className="stat-tile__value">24 / 32</span>
          </div>
          <div className="stat-tile__bar">
            <div className="stat-tile__fill" style={{ width: mounted ? '75%' : '0%', background: '#5ef6e6' }} />
          </div>
        </div>

        <div className="stat-tile">
          <div className="stat-tile__icon" style={{ background: 'rgba(52,211,153,0.12)', color: '#34d399' }}>
            <Compass size={18} />
          </div>
          <div className="stat-tile__body">
            <span className="stat-tile__label">Roadmap Progress</span>
            <span className="stat-tile__value">32%</span>
          </div>
          <div className="stat-tile__bar">
            <div className="stat-tile__fill" style={{ width: mounted ? '32%' : '0%', background: '#34d399' }} />
          </div>
        </div>

        <div className="stat-tile">
          <div className="stat-tile__icon" style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}>
            <TrendingUp size={18} />
          </div>
          <div className="stat-tile__body">
            <span className="stat-tile__label">Profile Rank</span>
            <span className="stat-tile__value">Top 15%</span>
          </div>
          <div className="stat-tile__bar">
            <div className="stat-tile__fill" style={{ width: mounted ? '85%' : '0%', background: '#f59e0b' }} />
          </div>
        </div>
      </div>

      <div className="progress-grid">
        {/* Skill Breakdown */}
        <div className="panel">
          <div className="panel__header">
            <div>
              <h2 className="panel__title">Skill Breakdown</h2>
              <p className="panel__sub">Progress toward Marketing Analyst requirements</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '8px' }}>
            {SKILLS.map(skill => (
              <div key={skill.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--on-surface)' }}>{skill.name}</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: skill.color }}>{skill.pct}%</span>
                </div>
                <div className="stat-tile__bar">
                  <div className="stat-tile__fill" style={{ width: mounted ? `${skill.pct}%` : '0%', background: skill.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Job Readiness Gauge */}
        <div className="panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <h2 className="panel__title" style={{ marginBottom: '1.5rem' }}>Overall Job Readiness</h2>
          <Gauge value={73} mounted={mounted} />
          <p style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)', lineHeight: 1.6, maxWidth: '280px', marginTop: '1.25rem' }}>
            You're in the top 15% of aspiring Marketing Analysts. Keep building your SQL and digital marketing skills to reach 90%.
          </p>
          <div className="readiness-badge" style={{ marginTop: '1rem' }}>
            <TrendingUp size={13} /> +12% from last week
          </div>
        </div>
      </div>
    </div>
  );
}

function Gauge({ value, mounted }: { value: number; mounted: boolean }) {
  const r = 70;
  const circ = 2 * Math.PI * r;
  const offset = mounted ? ((100 - value) / 100) * circ : circ;
  return (
    <div style={{ position: 'relative', width: 160, height: 160 }}>
      <svg width="160" height="160" viewBox="0 0 160 160">
        <defs>
          <linearGradient id="gaugeG" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#5ef6e6" />
          </linearGradient>
        </defs>
        <circle cx="80" cy="80" r={r} fill="none" stroke="var(--surface-container-high)" strokeWidth="10" />
        <circle
          cx="80" cy="80" r={r}
          fill="none" stroke="url(#gaugeG)" strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
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
