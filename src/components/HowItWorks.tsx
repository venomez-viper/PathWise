import { useEffect, useRef } from 'react';
import { MagicTextReveal } from '@/components/ui/magic-text-reveal';
import './HowItWorks.css';

const STEPS = [
  {
    step: '01',
    icon: '🧬',
    title: 'Discover Your Career Identity',
    desc: 'A five-minute assessment built on four validated psychological frameworks scores you across 12 dimensions and matches you to career paths that actually fit.',
    color: '#a78bfa',
  },
  {
    step: '02',
    icon: '🛣️',
    title: 'Get Your Personalized Roadmap',
    desc: 'PathWise generates a step-by-step career roadmap with curated skill development, certifications, and networking milestones - built for you.',
    color: '#5ef6e6',
  },
  {
    step: '03',
    icon: '🏆',
    title: 'Track Progress & Stay On Course',
    desc: 'Daily and weekly task planners, a career readiness score, and real-time opportunity insights keep you moving toward your goal.',
    color: '#fbbf24',
  },
];

export default function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.querySelectorAll('.fade-up').forEach((el, i) => {
            setTimeout(() => el.classList.add('visible'), i * 120);
          });
        }
      }),
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="how" id="how-it-works" ref={ref}>
      <div className="how__bg-accent" />
      <div className="container">
        <div className="how__header fade-up">
          <span className="how__eyebrow">How It Works</span>
          <div className="how__magic-reveal">
            <MagicTextReveal
              text="From uncertainty to clarity"
              color="rgba(255, 255, 255, 1)"
              fontSize={52}
              fontFamily="Manrope, sans-serif"
              fontWeight={800}
              spread={35}
              speed={0.4}
              density={4}
              resetOnMouseLeave={true}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                backdropFilter: 'none',
              }}
            />
          </div>
          <p className="how__subtitle">Three steps. Five minutes. A roadmap built around you.</p>
        </div>

        <div className="how__steps">
          {STEPS.map((s, i) => (
            <div key={i} className="how__step fade-up">
              <div className="how__connector" style={{ display: i === STEPS.length - 1 ? 'none' : undefined }} />
              <div className="how__step-number" style={{ color: s.color, borderColor: s.color }}>
                {s.step}
              </div>
              <div className="how__step-icon" style={{ background: `${s.color}18`, color: s.color }}>
                {s.icon}
              </div>
              <div className="how__step-body">
                <h3 className="how__step-title">{s.title}</h3>
                <p className="how__step-desc">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
