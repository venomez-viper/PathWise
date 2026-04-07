import { ArrowRight, Play, Target, Compass, BookOpen, TrendingUp, Sparkles, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Hero.css';

const FEATURES = [
  { icon: Compass, label: 'AI Career Matching', desc: '90+ career paths analyzed against your personality' },
  { icon: TrendingUp, label: 'Skill Gap Analysis', desc: 'Know exactly what to learn and in what order' },
  { icon: BookOpen, label: 'Personal Roadmap', desc: 'Step-by-step milestones tailored to your timeline' },
  { icon: Target, label: 'Daily Task Planner', desc: 'Stay accountable with prioritized action items' },
];

const TRUST_POINTS = [
  'No credit card required',
  '5-minute assessment',
  'Instant career matches',
];

export default function Hero() {
  return (
    <section className="hero hero--purple">
      <div className="hero__orb hero__orb--1" />
      <div className="hero__orb hero__orb--2" />

      <div className="container hero__inner hero__inner--purple">
        <div className="hero__copy">
          <div className="hero__badge">
            <Sparkles size={14} style={{ marginRight: 6 }} />
            AI-Powered Career Guidance
          </div>

          <h1 className="hero__title">
            Your career is
            <br />
            too <span>important</span>
            <br />
            to leave to
            <br />
            chance.
          </h1>

          <p className="hero__description">
            PathWise maps your career identity, predicts your highest-fit paths, and builds a step-by-step roadmap
            that keeps you accountable every day.
          </p>

          <div className="hero__actions">
            <Link to="/signup" className="hero__button hero__button--primary">
              Start Free Today
              <ArrowRight size={18} />
            </Link>
            <Link to="/how-it-works" className="hero__button hero__button--secondary">
              <Play size={16} fill="currentColor" />
              See How It Works
            </Link>
          </div>

          <div className="hero__trust">
            {TRUST_POINTS.map(point => (
              <div key={point} className="hero__trust-item">
                <CheckCircle2 size={14} />
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="hero__panel-stack">
          <div className="hero__glass-card hero__glass-card--main">
            <div className="hero__card-glow" />

            <div className="hero__features-list">
              {FEATURES.map(({ icon: Icon, label, desc }) => (
                <div key={label} className="hero__feature-item">
                  <div className="hero__feature-icon">
                    <Icon size={20} />
                  </div>
                  <div>
                    <div className="hero__feature-label">{label}</div>
                    <div className="hero__feature-desc">{desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="hero__stats-grid">
              <div className="hero__stat">
                <div className="hero__stat-value">90+</div>
                <div className="hero__stat-label">Careers</div>
              </div>
              <div className="hero__stats-divider" />
              <div className="hero__stat">
                <div className="hero__stat-value">5 min</div>
                <div className="hero__stat-label">Assessment</div>
              </div>
              <div className="hero__stats-divider" />
              <div className="hero__stat">
                <div className="hero__stat-value">Free</div>
                <div className="hero__stat-label">To Start</div>
              </div>
            </div>
          </div>

          <div className="hero__glass-card hero__glass-card--brands">
            <div className="hero__how-it-works">
              <div className="hero__step">
                <div className="hero__step-num">1</div>
                <span>Take Assessment</span>
              </div>
              <ArrowRight size={14} className="hero__step-arrow" />
              <div className="hero__step">
                <div className="hero__step-num">2</div>
                <span>Get Matched</span>
              </div>
              <ArrowRight size={14} className="hero__step-arrow" />
              <div className="hero__step">
                <div className="hero__step-num">3</div>
                <span>Follow Roadmap</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
