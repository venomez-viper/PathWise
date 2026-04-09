import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import Logo from '../../components/ui/Logo';
import { auth } from '../../lib/api';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') ?? '';
  const tokenId = params.get('id') ?? '';

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const passwordsMatch = confirm === '' || password === confirm;

  if (!token || !tokenId) {
    return (
      <div className="auth-page">
        <div className="auth-brand">
          <Logo size={32} variant="full" />
        </div>
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <h1 className="auth-title">Invalid reset link</h1>
          <p className="auth-subtitle">This password reset link is invalid or has expired.</p>
          <Link to="/forgot-password" className="btn-auth-primary" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', marginTop: '1.5rem' }}>
            Request a New Link
          </Link>
        </div>
        <div className="auth-glow" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordsMatch) return;
    setError('');
    setLoading(true);
    try {
      await auth.resetPassword({ tokenId, token, newPassword: password });
      setSuccess(true);
      setTimeout(() => navigate('/signin'), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('expired')) {
        setError('This reset link has expired. Please request a new one.');
      } else if (msg.includes('fetch')) {
        setError('Could not reach the server. Check your connection.');
      } else {
        setError(msg || 'Failed to reset password. Please try again.');
      }
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
        {success ? (
          <div style={{ textAlign: 'center' }}>
            <CheckCircle2 size={48} color="#006a62" style={{ marginBottom: '1rem' }} />
            <h1 className="auth-title">Password reset!</h1>
            <p className="auth-subtitle">Your password has been updated. Redirecting to sign in...</p>
          </div>
        ) : (
          <>
            <div className="auth-card-header">
              <h1 className="auth-title">Set new password</h1>
              <p className="auth-subtitle">Choose a strong password for your account.</p>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="input-group">
                <label className="input-label">New Password</label>
                <div className="input-wrap">
                  <Lock size={16} className="input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="auth-input"
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    autoFocus
                  />
                  <button type="button" className="input-eye" onClick={() => setShowPassword(p => !p)}
                    aria-label="Toggle password visibility">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Confirm Password</label>
                <div className={`input-wrap${!passwordsMatch ? ' input-error' : ''}`}>
                  <Lock size={16} className="input-icon" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    className="auth-input"
                    placeholder="Repeat your password"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                  <button type="button" className="input-eye" onClick={() => setShowConfirm(p => !p)}
                    aria-label="Toggle confirm password visibility">
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {!passwordsMatch && <p className="input-error-msg">Passwords don't match</p>}
              </div>

              <button type="submit" className="btn-auth-primary" disabled={loading || !passwordsMatch}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          </>
        )}
      </div>

      <div className="auth-glow" />
    </div>
  );
}
