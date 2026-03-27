import { useState, useEffect } from 'react';
import { Clock, TrendingUp, Pencil, Plus, Zap, GraduationCap, FolderOpen, Users, ChevronRight } from 'lucide-react';

const COURSES = [
  { title: 'Learn SQL basics', priority: 'high', meta: '4 of 12 modules completed' },
  { title: 'Marketing Analytics Fundamentals', priority: 'medium', meta: 'Course by Google Analytics Academy' },
];
const PROJECTS = [
  { title: 'Portfolio Audit', priority: 'low', meta: 'Update resume and LinkedIn profile with new analytical keywords.' },
  { title: 'E-commerce Data Project', priority: 'high', meta: 'Clean and analyze a Kaggle dataset using Python/SQL.' },
];
const NETWORKING = [
  { title: 'Industry Coffee Chat', priority: 'medium', meta: 'Reach out to 3 senior analysts at target companies.' },
];

const PRIORITY_COLOR: Record<string, string> = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#34d399',
};

export default function Roadmap() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 100); }, []);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Career Roadmap</h1>
          <p className="page-subtitle">Your personalised path to Marketing Analyst.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-page-secondary"><Pencil size={14} /> Adjust Timeline</button>
          <button className="btn-page-action"><Plus size={14} /> Add Task</button>
        </div>
      </div>

      <div className="roadmap-grid">
        {/* Left: target + skill gaps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Target Card */}
          <div className="panel">
            <p className="panel__eyebrow">CURRENT TARGET</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '8px 0 12px' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--on-surface)' }}>
                Marketing Analyst
              </h2>
              <div className="roadmap-progress-ring">
                <svg width="64" height="64" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="26" fill="none" stroke="var(--surface-container-high)" strokeWidth="6" />
                  <circle
                    cx="32" cy="32" r="26"
                    fill="none" stroke="#a78bfa" strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={163.4}
                    strokeDashoffset={mounted ? 163.4 * 0.68 : 163.4}
                    style={{ transform: 'rotate(-90deg)', transformOrigin: '32px 32px', transition: 'stroke-dashoffset 1s ease' }}
                  />
                </svg>
                <span className="roadmap-progress-label">32%</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span className="tag"><Clock size={12} /> 6 Months Timeline</span>
              <span className="tag tag--teal"><TrendingUp size={12} /> Advanced Track</span>
            </div>
          </div>

          {/* Skill Gap */}
          <div className="panel">
            <div className="panel__header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={16} color="#f59e0b" />
                <h2 className="panel__title">Skill Gaps</h2>
              </div>
              <span className="badge-pill badge-pill--warning">2 Missing</span>
            </div>
            {[
              { title: 'Google Data Analytics Professional Certificate', desc: 'Core technical foundation' },
              { title: 'Meta Marketing Analytics Certificate', desc: 'Advanced tracking & attribution' },
            ].map(item => (
              <div className="skill-gap-row" key={item.title}>
                <div className="skill-gap-row__icon"><GraduationCap size={16} color="#a78bfa" /></div>
                <div style={{ flex: 1 }}>
                  <p className="skill-gap-row__title">{item.title}</p>
                  <p className="skill-gap-row__desc">{item.desc}</p>
                </div>
                <ChevronRight size={15} color="var(--on-surface-variant)" />
              </div>
            ))}
          </div>
        </div>

        {/* Right: learning path */}
        <div className="panel">
          <div className="panel__header">
            <h2 className="panel__title">Learning Path</h2>
            <button className="btn-icon"><Plus size={15} /></button>
          </div>

          <PathSection icon={<GraduationCap size={14} />} label="COURSES"    items={COURSES}    />
          <PathSection icon={<FolderOpen   size={14} />} label="PROJECTS"   items={PROJECTS}   />
          <PathSection icon={<Users        size={14} />} label="NETWORKING" items={NETWORKING} />
        </div>
      </div>
    </div>
  );
}

function PathSection({ icon, label, items }: {
  icon: React.ReactNode;
  label: string;
  items: { title: string; priority: string; meta: string }[];
}) {
  return (
    <div className="path-section">
      <div className="path-section__header">
        {icon}
        <span className="path-section__label">{label}</span>
      </div>
      {items.map(item => (
        <div className="path-item" key={item.title} style={{ borderLeftColor: PRIORITY_COLOR[item.priority] }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <p className="path-item__title">{item.title}</p>
            <span className="priority-tag" style={{ color: PRIORITY_COLOR[item.priority], background: `${PRIORITY_COLOR[item.priority]}15` }}>
              {item.priority}
            </span>
          </div>
          <p className="path-item__meta">{item.meta}</p>
        </div>
      ))}
    </div>
  );
}
