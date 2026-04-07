import { useEffect, useRef, type CSSProperties } from 'react';
import {
  Compass, Fingerprint, BarChart3,
  Sparkles, Map, GraduationCap,
  CalendarDays, Globe, TrendingUp,
  Briefcase, Trophy,
} from 'lucide-react';
import './Solution.css';

const LAYERS = [
  {
    name: 'Discovery',
    icon: Compass,
    color: '#a78bfa',
    bg: 'rgba(167,139,250,0.08)',
    features: [
      { icon: Fingerprint, title: 'AI Career Discovery', desc: 'Uncover who you are professionally through deep assessment.' },
      { icon: Compass, title: 'Career Identity Analysis', desc: 'Map your strengths, values and personality to real careers.' },
      { icon: BarChart3, title: 'Skill Gap Analysis', desc: 'Know exactly what stands between you and your target role.' },
    ],
  },
  {
    name: 'Planning',
    icon: Map,
    color: '#5ef6e6',
    bg: 'rgba(94,246,230,0.08)',
    features: [
      { icon: Sparkles, title: 'Career Path Matching', desc: 'AI-matched paths based on your unique profile.' },
      { icon: Map, title: 'Roadmap Generation', desc: 'Step-by-step plan from today to your dream role.' },
      { icon: GraduationCap, title: 'Skill Development', desc: 'Curated learning resources to close the gap faster.' },
    ],
  },
  {
    name: 'Execution',
    icon: CalendarDays,
    color: '#fbbf24',
    bg: 'rgba(251,191,36,0.08)',
    features: [
      { icon: CalendarDays, title: 'Daily Task Planner', desc: 'Turn your roadmap into focused daily actions.' },
      { icon: Globe, title: 'Networking Guidance', desc: 'Build the right connections at the right time.' },
      { icon: TrendingUp, title: 'Progress Tracking', desc: 'Visual dashboard to see how far you have come.' },
    ],
  },
  {
    name: 'Intelligence',
    icon: Briefcase,
    color: '#f87171',
    bg: 'rgba(248,113,113,0.08)',
    features: [
      { icon: Briefcase, title: 'Career Opportunity Insights', desc: 'Surface relevant roles as you grow.' },
      { icon: Trophy, title: 'Career Readiness Score', desc: 'Know objectively when you are ready to make the move.' },
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
            From discovering who you are to landing your dream role, all in one place.
          </p>
        </div>

        <div className="solution__grid">
          {LAYERS.map((layer, i) => {
            const LayerIcon = layer.icon;
            return (
              <div key={i} className="solution__layer-card card fade-up" style={{ '--layer-color': layer.color, '--layer-bg': layer.bg } as CSSProperties}>
                <div className="solution__layer-header">
                  <div className="solution__layer-icon" style={{ background: layer.bg, color: layer.color }}>
                    <LayerIcon size={22} />
                  </div>
                  <h3 className="solution__layer-name">{layer.name}</h3>
                </div>
                <div className="solution__features">
                  {layer.features.map((f, j) => {
                    const FeatureIcon = f.icon;
                    return (
                      <div key={j} className="solution__feature">
                        <span className="solution__feature-icon" style={{ color: layer.color }}>
                          <FeatureIcon size={18} />
                        </span>
                        <div>
                          <div className="solution__feature-title">{f.title}</div>
                          <div className="solution__feature-desc">{f.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
