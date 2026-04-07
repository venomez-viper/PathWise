import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Hero.css';

export default function Hero() {
  return (
    <section className="hero hero--premium">
      {/* Subtle gradient overlays */}
      <div className="hero__gradient hero__gradient--1" />
      <div className="hero__gradient hero__gradient--2" />

      <div className="container hero__center">
        {/* Eyebrow */}
        <p className="hero__eyebrow">PathWise Career Intelligence</p>

        {/* Headline — big, bold, minimal */}
        <h1 className="hero__headline">
          Map your career.
          <br />
          <span className="hero__headline--accent">Build your roadmap.</span>
        </h1>

        {/* Subheadline — one clear sentence */}
        <p className="hero__sub">
          The AI-powered platform that matches you to your ideal career,
          identifies your skill gaps, and gives you a step-by-step plan to get there.
        </p>

        {/* Single strong CTA */}
        <div className="hero__cta-row">
          <Link to="/signup" className="hero__cta-primary">
            Get Started — It's Free
            <ArrowRight size={18} />
          </Link>
          <Link to="/how-it-works" className="hero__cta-secondary">
            How it works
          </Link>
        </div>

        {/* Social proof line */}
        <p className="hero__proof">
          90+ career paths &nbsp;·&nbsp; 5-minute assessment &nbsp;·&nbsp; No credit card required
        </p>
      </div>
    </section>
  );
}
