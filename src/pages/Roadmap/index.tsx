import { useState, useEffect } from 'react';
import {
  Clock, TrendingUp, Pencil, Plus, Zap,
  ChevronRight, GraduationCap, FolderOpen, Users,
} from 'lucide-react';
import CircularProgress from '../../components/CircularProgress';

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

export default function Roadmap() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 100); }, []);

  return (
    <main className="main-content">

      {/* ── Current Target ── */}
      <section className={`roadmap-target-card fade-in${mounted ? ' visible' : ''}`}>
        <span className="label-caps" style={{ color: 'var(--on-surface-variant)', marginBottom: '4px', display: 'block' }}>
          CURRENT TARGET
        </span>
        <div className="roadmap-target-row">
          <h1 className="roadmap-target-title">Marketing<br />Analyst</h1>
          <CircularProgress value={32} />
        </div>
        <div className="chip-row">
          <span className="chip">
            <Clock size={13} style={{ flexShrink: 0 }} />
            6 Months Timeline
          </span>
          <span className="chip chip-teal">
            <TrendingUp size={13} style={{ flexShrink: 0 }} />
            Advanced Track
          </span>
        </div>
        <div className="roadmap-action-row">
          <button className="btn-primary-sm">
            <Pencil size={13} /> Adjust Timeline
          </button>
          <button className="btn-ghost-sm">
            <Plus size={13} /> Add Custom Task
          </button>
        </div>
      </section>

      {/* ── Skill Gap Indicator ── */}
      <section className="skill-gap-card">
        <div className="skill-gap-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="skill-gap-icon">
              <Zap size={18} color="var(--tertiary-container)" />
            </div>
            <h2 className="skill-gap-title">Skill Gap Indicator</h2>
          </div>
          <span className="missing-badge">2 MISSING SKILLS IDENTIFIED</span>
        </div>

        {[
          { title: 'Google Data Analytics Professional Certificate', desc: 'Recommended for core technical foundation' },
          { title: 'Meta Marketing Analytics Certificate', desc: 'Advanced tracking and attribution mastery' },
        ].map((item) => (
          <div className="skill-gap-item" key={item.title}>
            <div className="skill-gap-item-icon">
              <GraduationCap size={18} color="var(--primary)" />
            </div>
            <div style={{ flex: 1 }}>
              <p className="skill-gap-item-title">{item.title}</p>
              <p className="skill-gap-item-desc">{item.desc}</p>
            </div>
            <ChevronRight size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
          </div>
        ))}
      </section>

      {/* ── My Learning Path ── */}
      <section style={{ marginBottom: '16px' }}>
        <h2 className="section-title">My Learning Path</h2>

        <PathSection icon={<GraduationCap size={14} />} label="COURSES"    items={COURSES}    />
        <PathSection icon={<FolderOpen   size={14} />} label="PROJECTS"   items={PROJECTS}   />
        <PathSection icon={<Users        size={14} />} label="NETWORKING" items={NETWORKING} addLabel="New Networking Task" />
      </section>

    </main>
  );
}

function PathSection({
  icon, label, items, addLabel,
}: {
  icon: React.ReactNode;
  label: string;
  items: { title: string; priority: string; meta: string }[];
  addLabel?: string;
}) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <div className="path-section-header">
        {icon}
        <span className="label-caps">{label}</span>
      </div>
      {items.map((item) => (
        <div className="path-item" key={item.title}>
          <span className={`priority-badge priority-${item.priority}`}>
            {item.priority.toUpperCase()} PRIORITY
          </span>
          <p className="path-item-title">{item.title}</p>
          <p className="path-item-meta">{item.meta}</p>
        </div>
      ))}
      {addLabel && (
        <button className="add-item-btn">
          <Plus size={13} /> {addLabel}
        </button>
      )}
    </div>
  );
}
