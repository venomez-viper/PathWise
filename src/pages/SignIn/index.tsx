import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { auth, tokenStore } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';

export default function SignIn() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [form,  setForm]  = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await auth.signin({ email: form.email, password: form.password });
      tokenStore.set(res.token);
      login(res.user as any);
      navigate('/app');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-brand">
        <img src="/logo.png" alt="PathWise" className="auth-logo" />
        <span className="auth-brand-name">PathWise</span>
      </div>

      <div className="auth-card">
        <div className="auth-card-header">
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to continue your career journey.</p>
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
                placeholder="you@example.com"
                value={form.email}
                onChange={set('email')}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <div className="input-wrap">
              <Lock size={16} className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                className="auth-input"
                placeholder="••••••••"
                value={form.password}
                onChange={set('password')}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="input-eye"
                onClick={() => setShowPassword(p => !p)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="auth-forgot-row">
            <Link to="/forgot-password" className="auth-link-sm">Forgot password?</Link>
          </div>

          <button type="submit" className="btn-auth-primary" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account?{' '}
          <Link to="/signup" className="auth-link-bold">Create one</Link>
        </p>
      </div>

      <div className="auth-glow" />
    </div>
  );
}
