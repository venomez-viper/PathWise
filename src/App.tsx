import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  MapPin, 
  ClipboardList, 
  Award,
  Home,
  Compass,
  CheckSquare,
  BarChart2,
  Settings,
  Rocket
} from 'lucide-react';
import './App.css';

const CircularProgress = ({ value, color = 'var(--secondary)' }) => {
  const [offset, setOffset] = useState(226); // roughly 2 * pi * r (where r=36 for 80px svg)
  const radius = 36;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const progressOffset = ((100 - value) / 100) * circumference;
    setOffset(progressOffset);
  }, [value, circumference]);

  return (
    <div className="circular-progress">
      <svg viewBox="0 0 80 80">
        <circle className="circle-bg" cx="40" cy="40" r={radius} />
        <circle 
          className="circle-fg" 
          cx="40" 
          cy="40" 
          r={radius} 
          style={{ strokeDasharray: circumference, strokeDashoffset: offset, stroke: color }} 
        />
      </svg>
      <div className="progress-text">{value}%</div>
    </div>
  );
};

function App() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // trigger animations
    setTimeout(() => setMounted(true), 100);
  }, []);

  return (
    <div className="app-container">
      {/* Top Header */}
      <header className="app-header">
        <div className="brand">
          <Rocket size={24} />
          <span>PathWise</span>
        </div>
        <div className="avatar">
          <img src="https://i.pravatar.cc/150?u=a042581f4e29026024d" alt="User Avatar" />
        </div>
      </header>

      <main className="main-content">
        {/* Hero Section */}
        <section className="hero-card">
          <h1 className="hero-title">Welcome back, Emily!</h1>
          <p className="hero-subtitle">Your journey to the top of your career is accelerating.</p>
          
          <div className="badge">
            <CheckCircle2 size={16} className="badge-icon" />
            CAREER ASSESSMENT 100% COMPLETED
          </div>
          
          <button className="btn-hero">View My Roadmap</button>
        </section>

        {/* Roadmap Completion Stat */}
        <section className="stat-card" style={{ backgroundColor: '#f4f3f8' }}>
          <div className="stat-header">
            <div className="stat-icon" style={{ backgroundColor: '#e9ddff', color: 'var(--primary)' }}>
              <Compass size={20} />
            </div>
            <div className="stat-value" style={{ color: 'var(--primary)' }}>32%</div>
          </div>
          <h2 className="stat-title">Roadmap Completion</h2>
          <div className="progress-track" style={{ marginTop: '8px' }}>
            <div 
              className="progress-fill fill-primary" 
              style={{ width: mounted ? '32%' : '0%' }}
            ></div>
          </div>
        </section>

        {/* Tasks Finished Stat */}
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

        {/* Job Readiness Stat */}
        <section className="stat-card" style={{ backgroundColor: '#faf6eb' }}>
          <div className="stat-header">
            <div className="stat-icon" style={{ backgroundColor: '#f2e8c9', color: 'var(--tertiary-container)' }}>
              <Award size={20} />
            </div>
            <div className="stat-value" style={{ color: '#8a6e1c' }}>45%</div>
          </div>
          <h2 className="stat-title">Job Readiness</h2>
          <div className="progress-track" style={{ marginTop: '8px' }}>
            <div 
              className="progress-fill fill-tertiary" 
              style={{ width: mounted ? '45%' : '0%' }}
            ></div>
          </div>
        </section>

        {/* Top Career Matches */}
        <section>
          <h2 className="section-title">Top Career Matches</h2>
          <p className="section-subtitle">Based on your skills and personality assessment</p>

          <div className="match-card">
            <CircularProgress value={88} color="var(--secondary)" />
            <h3 className="match-title">Marketing Analyst</h3>
            <p className="match-desc">Strategic thinking & data visualization expertise.</p>
          </div>

          <div className="match-card">
            <CircularProgress value={84} color="var(--secondary)" />
            <h3 className="match-title">Data Analyst</h3>
            <p className="match-desc">Quantitative analysis & predictive modeling.</p>
          </div>

          <div className="match-card">
            <CircularProgress value={72} color="var(--secondary)" />
            <h3 className="match-title">Product Manager</h3>
            <p className="match-desc">User-centric design & agile project leadership.</p>
          </div>
        </section>
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <a href="#" className="nav-item active">
          <Home size={22} />
          <span>Home</span>
        </a>
        <a href="#" className="nav-item">
          <Compass size={22} />
          <span>Roadmap</span>
        </a>
        <a href="#" className="nav-item">
          <CheckSquare size={22} />
          <span>Tasks</span>
        </a>
        <a href="#" className="nav-item">
          <BarChart2 size={22} />
          <span>Progress</span>
        </a>
        <a href="#" className="nav-item">
          <Settings size={22} />
          <span>Settings</span>
        </a>
      </nav>
    </div>
  );
}

export default App;
