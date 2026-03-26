import React, { useRef, useState, useEffect } from 'react';
import './CTA.css';

export default function CTA() {
  const ref = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

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

        {submitted ? (
          <div className="cta-section__success fade-up">
            🎉 You're on the list! We'll be in touch soon.
          </div>
        ) : (
          <form className="cta-section__form fade-up" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="cta-section__input"
              required
            />
            <button type="submit" className="btn btn-primary btn-lg">
              Get Early Access
            </button>
          </form>
        )}

        <p className="cta-section__note fade-up">Free to start · No credit card required · Cancel anytime</p>
      </div>
    </section>
  );
}
