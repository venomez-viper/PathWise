import { Rocket } from 'lucide-react';

export default function Onboarding() {
  return (
    <main className="main-content">
      <section className="hero-card">
        <h1 className="hero-title">Let's find your path.</h1>
        <p className="hero-subtitle">Answer a few questions so we can map your career identity.</p>
        <button className="btn-hero">
          <Rocket size={16} style={{ display: 'inline', marginRight: '8px' }} />
          Start Assessment
        </button>
      </section>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', paddingTop: '48px', color: 'var(--on-surface-variant)' }}>
        <p style={{ fontSize: '0.9rem', textAlign: 'center' }}>
          The AI career assessment takes about 5 minutes and covers your strengths, values, and work preferences.
        </p>
      </div>
    </main>
  );
}
