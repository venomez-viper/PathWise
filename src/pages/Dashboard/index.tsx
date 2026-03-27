import { useState, useEffect } from 'react';
import { CheckCircle2, Compass, ClipboardList, Award, ArrowRight, TrendingUp, Zap, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const CAREER_MATCHES = [
  { title: 'Marketing Analyst', score: 88, desc: 'Strategic thinking & data visualization expertise.', color: '#a78bfa' },
  { title: 'Data Analyst',      score: 84, desc: 'Quantitative analysis & predictive modeling.',      color: '#5ef6e6' },
  { title: 'Product Manager',   score: 72, desc: 'User-centric design & agile project leadership.',   color: '#f59e0b' },
];

const QUICK_TASKS = [
  { id: 1, title: "Complete 'SQL Basics Module 1'",               meta: '30 mins',    done: false },
  { id: 2, title: 'Connect with 1 Marketing Analyst on LinkedIn', meta: 'Networking', done: true  },
  { id: 3, title: 'Review 2 Job Descriptions',                    meta: '20 mins',    done: false },
];

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 100); }, []);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, Emily 👋</h1>
          <p className="page-subtitle">Here's an overview of your career progress today.</p>
        </div>
        <Link to="/app/roadmap" className="btn-page-action">
          View Roadmap <ArrowRight size={15} />
        </Link>
      </div>

      <div className="stats-grid">
        <div className="stat-tile">
          <div className="stat-tile__icon" style={{ background: 'rgba(167,139,250,0.12)', color: '#a78bfa' }}>
            <Compass size={18} />
          </div>
          <div className="stat-tile__body">
            <span className="stat-tile__label">Roadmap Progress</span>
            <span className="stat-tile__value">32%</span>
          </div>
          <div className="stat-tile__bar">
            <div className="stat-tile__fill" style={{ width: mounted ? '32%' : '0%', background: '#a78bfa' }} />
          </div>
        </div>

        <div className="stat-tile">
          <div className="stat-tile__icon" style={{ background: 'rgba(94,246,230,0.12)', color: '#5ef6e6' }}>
            <ClipboardList size={18} />
          </div>
          <div className="stat-tile__body">
            <span className="stat-tile__label">Tasks Completed</span>
            <span className="stat-tile__value">5 / 8</span>
          </div>
          <div className="stat-tile__bar">
            <div className="stat-tile__fill" style={{ width: mounted ? '62%' : '0%', background: '#5ef6e6' }} />
          </div>
        </div>

        <div className="stat-tile">
          <div className="stat-tile__icon" style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}>
            <Award size={18} />
          </div>
          <div className="stat-tile__body">
            <span className="stat-tile__label">Job Readiness</span>
            <span className="stat-tile__value">45%</span>
          </div>
          <div className="stat-tile__bar">
            <div className="stat-tile__fill" style={{ width: mounted ? '45%' : '0%', background: '#f59e0b' }} />
          </div>
        </div>

        <div className="stat-tile">
          <div className="stat-tile__icon" style={{ background: 'rgba(52,211,153,0.12)', color: '#34d399' }}>
            <TrendingUp size={18} />
          </div>
          <div className="stat-tile__body">
            <span className="stat-tile__label">Weekly Streak</span>
            <span className="stat-tile__value">7 days</span>
          </div>
          <div className="stat-tile__bar">
            <div className="stat-tile__fill" style={{ width: mounted ? '70%' : '0%', background: '#34d399' }} />
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="panel">
          <div className="panel__header">
            <div>
              <h2 className="panel__title">Top Career Matches</h2>
              <p className="panel__sub">Based on your assessment results</p>
            </div>
            <CheckCircle2 size={16} color="#34d399" />
          </div>
          <div className="matches-list">
            {CAREER_MATCHES.map(m => (
              <div className="match-row" key={m.title}>
                <div className="match-score" style={{ color: m.color, borderColor: `${m.color}30`, background: `${m.color}12` }}>
                  {m.score}%
                </div>
                <div className="match-info">
                  <p className="match-name">{m.title}</p>
                  <p className="match-desc">{m.desc}</p>
                </div>
                <ArrowRight size={15} color="var(--on-surface-variant)" />
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-right">
          <div className="panel panel--accent">
            <div className="panel__header">
              <Zap size={16} color="#f59e0b" />
              <h2 className="panel__title">Skill Gap Alert</h2>
            </div>
            <p className="panel__sub" style={{ marginTop: '4px' }}>2 skills needed for your target role</p>
            <div className="skill-gap-pills">
              <span className="skill-pill">Google Data Analytics</span>
              <span className="skill-pill">Meta Marketing Analytics</span>
            </div>
            <Link to="/app/roadmap" className="panel-link">
              View learning plan <ArrowRight size={13} />
            </Link>
          </div>

          <div className="panel">
            <div className="panel__header">
              <div>
                <h2 className="panel__title">Today's Tasks</h2>
                <p className="panel__sub">3 tasks · 45 min estimated</p>
              </div>
              <Clock size={15} color="var(--on-surface-variant)" />
            </div>
            <div className="quick-tasks">
              {QUICK_TASKS.map(t => (
                <div className={`quick-task${t.done ? ' done' : ''}`} key={t.id}>
                  <div className={`quick-task__check${t.done ? ' checked' : ''}`} />
                  <div className="quick-task__info">
                    <p className="quick-task__title">{t.title}</p>
                    <span className="quick-task__meta">{t.meta}</span>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/app/tasks" className="panel-link">
              See all tasks <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
