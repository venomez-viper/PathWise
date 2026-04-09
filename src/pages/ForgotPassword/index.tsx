import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Logo from '../../components/ui/Logo';
import { auth } from '../../lib/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await auth.forgotPassword({ email });
      setSent(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      setError(msg.includes('fetch') ? 'Could not reach the server. Check your connection.' : (msg || 'Something went wrong. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-brand">
        <Logo size={32} variant="full" />
      </div>

      <div className="auth-card">
        {sent ? (
          <>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <CheckCircle2 size={48} color="#006a62" style={{ marginBottom: '1rem' }} />
              <h1 className="auth-title">Check your email</h1>
              <p className="auth-subtitle">
                If an account exists for <strong>{email}</strong>, we've sent a password reset link.
                Check your inbox and spam folder.
              </p>
            </div>
            <Link to="/signin" className="btn-auth-primary" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
              Back to Sign In
            </Link>
          </>
        ) : (
          <>
            <div className="auth-card-header">
              <h1 className="auth-title">Forgot password?</h1>
              <p className="auth-subtitle">Enter your email and we'll send you a reset link.</p>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="input-group">
                <label className="input-label">Email</label>
                <div className="input-wrap">
                  <Mail size={16} className="input-icon" />
                  <input
                    type="email"
                    className="auth-input"
                    placeholder="name@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    autoFocus
                  />
                </div>
              </div>

              <button type="submit" className="btn-auth-primary" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            <p className="auth-switch" style={{ marginTop: '1.5rem' }}>
              <Link to="/signin" className="auth-link-bold" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <ArrowLeft size={14} /> Back to Sign In
              </Link>
            </p>
          </>
        )}
      </div>

      <div className="auth-glow" />
    </div>
  );
}
