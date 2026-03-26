import { useState, useEffect } from 'react';
import { CheckCircle2, Compass, ClipboardList, Award } from 'lucide-react';
import CircularProgress from '../../components/CircularProgress';

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 100);
  }, []);

  return (
    <main className="main-content">
      {/* Hero */}
      <section className="hero-card">
        <h1 className="hero-title">Welcome back, Emily!</h1>
        <p className="hero-subtitle">Your journey to the top of your career is accelerating.</p>
        <div className="badge">
          <CheckCircle2 size={16} className="badge-icon" />
          CAREER ASSESSMENT 100% COMPLETED
        </div>
        <button className="btn-hero">View My Roadmap</button>
      </section>

      {/* Stats */}
      <section className="stat-card" style={{ backgroundColor: '#f4f3f8' }}>
        <div className="stat-header">
          <div className="stat-icon" style={{ backgroundColor: '#e9ddff', color: 'var(--primary)' }}>
            <Compass size={20} />
          </div>
          <div className="stat-value" style={{ color: 'var(--primary)' }}>32%</div>
        </div>
        <h2 className="stat-title">Roadmap Completion</h2>
        <div className="progress-track" style={{ marginTop: '8px' }}>
          <div className="progress-fill fill-primary" style={{ width: mounted ? '32%' : '0%' }} />
        </div>
      </section>

      <section className="stat-card" style={{ backgroundColor: '#eef8f6' }}>
        <div className="stat-header">
          <div className="stat-icon" style={{ backgroundColor: '#d0f2f0', color: 'var(--secondary)' }}>
            <ClipboardList size={20} />
          </div>
          <div className="stat-value" style={{ color: 'var(--secondary)' }}>05</div>
        </div>
        <h2 className="stat-title">Tasks Finished</h2>
        <p className="stat-subtitle">3 tasks remaining this week</p>
      </section>

      <section className="stat-card" style={{ backgroundColor: '#faf6eb' }}>
        <div className="stat-header">
          <div className="stat-icon" style={{ backgroundColor: '#f2e8c9', color: 'var(--tertiary-container)' }}>
            <Award size={20} />
          </div>
          <div className="stat-value" style={{ color: '#8a6e1c' }}>45%</div>
        </div>
        <h2 className="stat-title">Job Readiness</h2>
        <div className="progress-track" style={{ marginTop: '8px' }}>
          <div className="progress-fill fill-tertiary" style={{ width: mounted ? '45%' : '0%' }} />
        </div>
      </section>

      {/* Career Matches */}
      <section>
        <h2 className="section-title">Top Career Matches</h2>
        <p className="section-subtitle">Based on your skills and personality assessment</p>
        {[
          { title: 'Marketing Analyst', score: 88, desc: 'Strategic thinking & data visualization expertise.' },
          { title: 'Data Analyst',      score: 84, desc: 'Quantitative analysis & predictive modeling.' },
          { title: 'Product Manager',   score: 72, desc: 'User-centric design & agile project leadership.' },
        ].map((match) => (
          <div className="match-card" key={match.title}>
            <CircularProgress value={match.score} />
            <h3 className="match-title">{match.title}</h3>
            <p className="match-desc">{match.desc}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
