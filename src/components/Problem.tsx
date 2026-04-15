import { useEffect, useRef } from 'react';
import { Search, Link2, FileText, Check, X, Target, Heart, Sparkles } from 'lucide-react';
import './Problem.css';

const TOOLS = [
  {
    name: 'Job Boards',
    icon: Search,
    does: 'Find open job listings',
    missing: ['Career identity', 'Direction & planning', 'Daily guidance'],
  },
  {
    name: 'LinkedIn',
    icon: Link2,
    does: '1B+ users, but revenue from job clicks, not career clarity',
    missing: ['Career identity', 'Personalized direction', 'Daily action plans'],
  },
  {
    name: 'Resume Tools',
    icon: FileText,
    does: 'Fix your formatting',
    missing: ['Path planning', 'Skill gap analysis', 'Coaching & clarity'],
  },
];

const NEEDS = [
  { icon: Target, type: 'Functional', color: '#6245a4', text: '"Help me figure out the right career path and create a plan to get there."' },
  { icon: Heart, type: 'Emotional', color: '#0e7490', text: '"Help me reduce the fear of making the wrong career decision."' },
  { icon: Sparkles, type: 'Social', color: '#b45309', text: '"Help me appear proactive and confident about my career path."' },
];

export default function Problem() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.querySelectorAll('.fade-up').forEach((el, i) => {
            timers.push(setTimeout(() => el.classList.add('visible'), i * 100));
          });
        }
      }),
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => {
      observer.disconnect();
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <section className="problem" id="problem" ref={ref}>
      <div className="container">
        <div className="section-header fade-up">
          <span className="section-label">The Problem</span>
          <h2 className="section-title">Every year, millions face the same question</h2>
          <div className="hero-question">
            "What should I do with my career?"
          </div>
          <p className="section-subtitle">
            Current tools only solve fragments. Nobody answers the real question: <strong>what are the exact steps between me and my dream career?</strong>
          </p>
        </div>

        {/* Tool comparison */}
        <div className="problem__tools">
          {TOOLS.map((tool, i) => {
            const Icon = tool.icon;
            return (
              <div key={i} className="problem__tool-card card fade-up">
                <div className="problem__tool-header">
                  <span className="problem__tool-icon">
                    <Icon size={20} />
                  </span>
                  <span className="problem__tool-name">{tool.name}</span>
                </div>
                <p className="problem__tool-does">
                  <Check size={14} style={{ color: '#16a34a', flexShrink: 0 }} />
                  <span>{tool.does}</span>
                </p>
                <div className="problem__tool-missing">
                  {tool.missing.map((item, j) => (
                    <div key={j} className="problem__missing-item">
                      <X size={14} className="problem__x" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* User needs */}
        <div className="problem__needs">
          <h3 className="problem__needs-title fade-up">What people actually need:</h3>
          <div className="problem__needs-grid">
            {NEEDS.map((need, i) => {
              const Icon = need.icon;
              return (
                <div key={i} className="problem__need-card glass-card fade-up">
                  <div className="problem__need-icon" style={{ color: need.color }}>
                    <Icon size={24} />
                  </div>
                  <div className="problem__need-type" style={{ color: need.color }}>{need.type}</div>
                  <p className="problem__need-text">{need.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
