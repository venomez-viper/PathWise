import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, ArrowRight } from 'lucide-react';
import { tokenStore } from '../../lib/api';
import { Panda } from '../../components/panda';
import Logo from '../../components/ui/Logo';

export default function LogoutPage() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    tokenStore.clear();
    // Brief delay for the animation
    const timer = setTimeout(() => setDone(true), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="auth-page">
      <div className="auth-brand">
        <Logo size={32} variant="full" />
      </div>

      <div className="auth-card" style={{ textAlign: 'center' }}>
        {!done ? (
          <div style={{ padding: '3rem 1rem' }}>
            <div style={{
              width: 40, height: 40, margin: '0 auto 1.5rem',
              border: '3px solid rgba(98,69,164,0.2)', borderTopColor: '#6245a4',
              borderRadius: '50%', animation: 'spin 0.8s linear infinite',
            }} />
            <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.95rem' }}>
              Signing you out...
            </p>
          </div>
        ) : (
          <div style={{ padding: '2rem 1rem' }}>
            <Panda mood="sad" size={120} animate />

            <h1 style={{
              fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800,
              color: 'var(--on-surface)', letterSpacing: '-0.03em', marginTop: '1.5rem',
            }}>
              You've been signed out
            </h1>

            <p style={{
              fontSize: '0.95rem', color: 'var(--on-surface-variant)', lineHeight: 1.6,
              marginTop: '0.5rem', marginBottom: '2rem',
            }}>
              Thanks for using PathWise. Your progress is saved and waiting for you when you return.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/signin" className="btn-auth-primary" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '0.85rem 2rem', borderRadius: 'var(--radius-full)',
                textDecoration: 'none', width: 'auto',
              }}>
                Sign Back In <ArrowRight size={16} />
              </Link>

              <Link to="/" style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '0.85rem 1.5rem', borderRadius: 'var(--radius-full)',
                border: '1px solid var(--surface-container-high)',
                background: 'var(--surface-container-lowest)',
                color: 'var(--on-surface)', fontWeight: 600, fontSize: '0.9rem',
                textDecoration: 'none',
              }}>
                <LogOut size={14} />
                Logout
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="auth-glow" />
    </div>
  );
}
