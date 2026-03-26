import { useState, useEffect } from 'react';
import { ClipboardList, Compass, TrendingUp } from 'lucide-react';

const SKILLS = [
  { name: 'Data Analysis (SQL)',      pct: 85 },
  { name: 'Market Research',          pct: 60 },
  { name: 'Visualization (Tableau)',  pct: 40 },
  { name: 'Digital Marketing',        pct: 25 },
];

export default function Progress() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 100); }, []);

  return (
    <main className="main-content">

      {/* ── Overall Job Readiness ── */}
      <section className={`readiness-card fade-in${mounted ? ' visible' : ''}`}>
        <LargeCircularGauge value={73} mounted={mounted} />
        <h2 className="readiness-title">Overall Job Readiness</h2>
        <p className="readiness-desc">
          You're making exceptional progress! Your profile strength is in the top 15% of aspiring Marketing Analysts this month.
        </p>
        <div className="readiness-chip">
          <TrendingUp size={13} />
          +12% from last week
        </div>
      </section>

      {/* ── Tasks Summary ── */}
      <section className="stat-card" style={{ backgroundColor: 'var(--surface-container-low)' }}>
        <div className="stat-header">
          <div className="stat-icon" style={{ backgroundColor: '#e9ddff', color: 'var(--primary)' }}>
            <ClipboardList size={20} />
          </div>
          <div className="stat-value" style={{ color: 'var(--on-surface)' }}>24 / 32</div>
        </div>
        <h2 className="stat-title">Tasks Summary</h2>
        <p className="stat-subtitle">8 tasks remaining this week</p>
        <div className="progress-track">
          <div className="progress-fill fill-primary" style={{ width: mounted ? '75%' : '0%' }} />
        </div>
      </section>

      {/* ── Roadmap Completion ── */}
      <section className="stat-card" style={{ backgroundColor: '#eef8f6' }}>
        <div className="stat-header">
          <div className="stat-icon" style={{ backgroundColor: '#d0f2f0', color: 'var(--secondary)' }}>
            <Compass size={20} />
          </div>
          <div className="stat-value" style={{ color: 'var(--secondary)' }}>32%</div>
        </div>
        <h2 className="stat-title">Roadmap Completion</h2>
        <p className="stat-subtitle">Level 2: Strategic Specialist</p>
        <div className="progress-track">
          <div className="progress-fill fill-secondary" style={{ width: mounted ? '32%' : '0%' }} />
        </div>
      </section>

      {/* ── Skill Roadmap Progress ── */}
      <section className="skill-progress-section">
        <h2 className="section-title" style={{ marginTop: '8px' }}>Skill Roadmap Progress</h2>
        {SKILLS.map(skill => (
          <div className="skill-row" key={skill.name}>
            <div className="skill-row-header">
              <span className="skill-name">{skill.name}</span>
              <span className="skill-pct">{skill.pct}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill fill-primary" style={{ width: mounted ? `${skill.pct}%` : '0%' }} />
            </div>
          </div>
        ))}
      </section>

    </main>
  );
}

function LargeCircularGauge({ value, mounted }: { value: number; mounted: boolean }) {
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const offset = mounted ? ((100 - value) / 100) * circumference : circumference;

  return (
    <div className="large-circular-progress">
      <svg viewBox="0 0 140 140" width="140" height="140" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--secondary)" />
            <stop offset="100%" stopColor="var(--secondary-container)" />
          </linearGradient>
        </defs>
        <circle cx="70" cy="70" r={radius} fill="none" stroke="var(--surface-container-highest)" strokeWidth="10" />
        <circle
          cx="70" cy="70" r={radius}
          fill="none"
          stroke="url(#gaugeGrad)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: '70px 70px',
            transition: 'stroke-dashoffset 1.2s cubic-bezier(0.33, 1, 0.68, 1)',
          }}
        />
      </svg>
      <div className="large-progress-inner">
        <span className="large-progress-value">{value}%</span>
        <span className="large-progress-label">READY</span>
      </div>
    </div>
  );
}
