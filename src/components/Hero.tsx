import { ArrowRight, Play, Target, Crown, Ghost, Gem, Hexagon, Triangle, Command, Cpu } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Hero.css';

const CLIENTS = [
  { name: 'Acme Corp', icon: Hexagon },
  { name: 'Quantum', icon: Triangle },
  { name: 'Command+Z', icon: Command },
  { name: 'Phantom', icon: Ghost },
  { name: 'Ruby', icon: Gem },
  { name: 'Chipset', icon: Cpu },
];

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="hero__stat">
      <div className="hero__stat-value">{value}</div>
      <div className="hero__stat-label">{label}</div>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="hero hero--purple">
      <div className="hero__orb hero__orb--1" />
      <div className="hero__orb hero__orb--2" />

      <div className="container hero__inner hero__inner--purple">
        <div className="hero__copy">
          <div className="hero__badge">AI-Powered Career Guidance</div>

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
        </div>

        <div className="hero__panel-stack">
          <div className="hero__glass-card hero__glass-card--main">
            <div className="hero__card-glow" />
            <div className="hero__card-head">
              <div className="hero__card-icon">
                <Target size={22} />
              </div>
              <div>
                <div className="hero__metric">10,000+</div>
                <div className="hero__metric-caption">Career Roadmaps Generated</div>
              </div>
            </div>

            <div className="hero__progress">
              <div className="hero__progress-row">
                <span>User Satisfaction</span>
                <span>96%</span>
              </div>
              <div className="hero__progress-track">
                <div className="hero__progress-fill" />
              </div>
            </div>

            <div className="hero__stats-grid">
              <StatItem value="Free" label="To Start" />
              <div className="hero__stats-divider" />
              <StatItem value="AI" label="Powered" />
              <div className="hero__stats-divider" />
              <StatItem value="24/7" label="Guidance" />
            </div>

            <div className="hero__chips">
              <div className="hero__chip hero__chip--live">Live Beta</div>
              <div className="hero__chip hero__chip--access">
                <Crown size={12} />
                Early Access
              </div>
            </div>
          </div>

          <div className="hero__glass-card hero__glass-card--brands">
            <h3 className="hero__brands-title">Guiding careers in every industry</h3>
            <div className="hero__brands-row">
              {[...CLIENTS, ...CLIENTS].map((client, index) => {
                const Icon = client.icon;
                return (
                  <div key={`${client.name}-${index}`} className="hero__brand">
                    <Icon size={18} />
                    <span>{client.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
