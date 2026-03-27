import { useEffect, useRef, type CSSProperties } from 'react';
import './Solution.css';

const LAYERS = [
  {
    name: 'Discovery Layer',
    emoji: '🔭',
    color: '#a78bfa',
    bg: 'rgba(167,139,250,0.1)',
    features: [
      { icon: '🧬', title: 'AI Career Discovery', desc: 'Uncover who you are professionally through deep assessment.' },
      { icon: '🪞', title: 'Career Identity Analysis', desc: 'Map your strengths, values & personality to real careers.' },
      { icon: '📊', title: 'Skill Gap Analysis', desc: 'Know exactly what\'s between you and your target role.' },
    ],
  },
  {
    name: 'Planning Layer',
    emoji: '🗺️',
    color: '#5ef6e6',
    bg: 'rgba(94,246,230,0.1)',
    features: [
      { icon: '✨', title: 'Career Path Recommendation', desc: 'AI-matched paths based on your unique profile.' },
      { icon: '🛣️', title: 'Roadmap Generation', desc: 'Step-by-step plan from today to your dream role.' },
      { icon: '🎓', title: 'Skill Development', desc: 'Curated learning to close the gap faster.' },
    ],
  },
  {
    name: 'Execution Layer',
    emoji: '⚡',
    color: '#fbbf24',
    bg: 'rgba(251,191,36,0.1)',
    features: [
      { icon: '📅', title: 'Daily / Weekly Planner', desc: 'Turn your roadmap into focused daily actions.' },
      { icon: '🌐', title: 'Networking Guidance', desc: 'Build the right connections at the right time.' },
      { icon: '📈', title: 'Progress Tracking', desc: 'Visual dashboard to see how far you\'ve come.' },
    ],
  },
  {
    name: 'Intelligence Layer',
    emoji: '🧠',
    color: '#f87171',
    bg: 'rgba(248,113,113,0.1)',
    features: [
      { icon: '💼', title: 'Career Opportunity Insights', desc: 'Surface relevant roles as you grow.' },
      { icon: '🏆', title: 'Career Readiness Score', desc: 'Know objectively when you\'re ready to make the move.' },
    ],
  },
];

export default function Solution() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.querySelectorAll('.fade-up').forEach((el, i) => {
            setTimeout(() => el.classList.add('visible'), i * 80);
          });
        }
      }),
      { threshold: 0.05 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="solution" id="solution" ref={ref}>
      <div className="container">
        <div className="section-header fade-up">
          <span className="section-label">Our Solution</span>
          <h2 className="section-title">One platform. Every step of your career.</h2>
          <p className="section-subtitle">
            The complete Zafuture Product Experience Framework - from discovering who you are to landing your dream role.
          </p>
        </div>

        <div className="solution__grid">
          {LAYERS.map((layer, i) => (
            <div key={i} className="solution__layer-card card fade-up" style={{ '--layer-color': layer.color, '--layer-bg': layer.bg } as CSSProperties}>
              <div className="solution__layer-header">
                <div className="solution__layer-icon">{layer.emoji}</div>
                <h3 className="solution__layer-name">{layer.name}</h3>
              </div>
              <div className="solution__features">
                {layer.features.map((f, j) => (
                  <div key={j} className="solution__feature">
                    <span className="solution__feature-icon">{f.icon}</span>
                    <div>
                      <div className="solution__feature-title">{f.title}</div>
                      <div className="solution__feature-desc">{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
