import { useEffect, useRef } from 'react';
import './Problem.css';

const TOOLS = [
  {
    name: 'Job Boards',
    icon: '🔍',
    does: 'Find open job listings',
    missing: ['Career identity', 'Direction & planning', 'Daily guidance'],
    accent: '#ef4444',
  },
  {
    name: 'LinkedIn',
    icon: '🔗',
    does: '1B+ users — but revenue from job clicks, not career clarity',
    missing: ['Career identity', 'Personalized direction', 'Daily action plans'],
    accent: '#f59e0b',
  },
  {
    name: 'Resume Tools',
    icon: '📄',
    does: 'Fix your formatting',
    missing: ['Path planning', 'Skill gap analysis', 'Coaching & clarity'],
    accent: '#f59e0b',
  },
];

const NEEDS = [
  { emoji: '🎯', type: 'Functional', text: '"Help me figure out the right career path and create a plan to get there."' },
  { emoji: '💙', type: 'Emotional', text: '"Help me reduce the fear of making the wrong career decision."' },
  { emoji: '🌟', type: 'Social', text: '"Help me appear proactive and confident about my career path."' },
];

export default function Problem() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.querySelectorAll('.fade-up').forEach((el, i) => {
            setTimeout(() => el.classList.add('visible'), i * 100);
          });
        }
      }),
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
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
          {TOOLS.map((tool, i) => (
            <div key={i} className="problem__tool-card card fade-up">
              <div className="problem__tool-header">
                <span className="problem__tool-icon">{tool.icon}</span>
                <span className="problem__tool-name">{tool.name}</span>
              </div>
              <p className="problem__tool-does">✅ {tool.does}</p>
              <div className="problem__tool-missing">
                {tool.missing.map((item, j) => (
                  <div key={j} className="problem__missing-item">
                    <span className="problem__x">✗</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* User needs */}
        <div className="problem__needs">
          <h3 className="problem__needs-title fade-up">What people actually need:</h3>
          <div className="problem__needs-grid">
            {NEEDS.map((need, i) => (
              <div key={i} className="problem__need-card glass-card fade-up">
                <div className="problem__need-emoji">{need.emoji}</div>
                <div className="problem__need-type">{need.type}</div>
                <p className="problem__need-text">{need.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
