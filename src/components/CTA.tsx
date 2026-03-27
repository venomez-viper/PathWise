import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './CTA.css';

export default function CTA() {
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
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="cta-section gradient-bg-hero" id="cta" ref={ref}>
      <div className="cta-section__orb cta-section__orb--1" />
      <div className="cta-section__orb cta-section__orb--2" />

      <div className="container cta-section__inner">
        <div className="chip chip-dark fade-up" style={{ margin: '0 auto var(--spacing-4)' }}>
          ✦ Early Access
        </div>
        <h2 className="display-lg cta-section__headline fade-up">
          Ready to find <span className="gradient-text">your path?</span>
        </h2>
        <p className="cta-section__sub fade-up">
          Join thousands of early professionals, career switchers, and students
          who are replacing uncertainty with a clear, AI-powered direction.
        </p>

        <div className="cta-section__form fade-up">
          <Link to="/signup" className="btn btn-primary btn-lg">
            Create Free Account
          </Link>
          <Link to="/signin" className="btn btn-secondary btn-lg">
            Sign In
          </Link>
        </div>

        <p className="cta-section__note fade-up">Free to start · No credit card required · Cancel anytime</p>
      </div>
    </section>
  );
}
