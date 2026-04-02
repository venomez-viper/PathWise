import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Logo from '../../components/ui/Logo';
import { auth, tokenStore } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';

type AuthUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  plan: 'free' | 'premium';
};

export default function SignUp() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [form,  setForm]    = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const passwordsMatch = form.confirm === '' || form.password === form.confirm;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordsMatch) return;
    setError('');
    setLoading(true);
    try {
      const res = await auth.signup({ name: form.name, email: form.email, password: form.password });
      tokenStore.set(res.token);
      login(res.user as AuthUser);
      navigate('/app/onboarding');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      setError(msg.includes('fetch') ? 'Could not reach the server. Check your connection.' : (msg || 'Sign up failed. Please try again.'));
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
        <div className="auth-card-header">
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">Join the professional growth ecosystem.</p>
        </div>

        {/* Social login */}
        <div className="auth-social-row" style={{ marginBottom: 0 }}>
          <button type="button" className="btn-auth-social">Google</button>
          <button type="button" className="btn-auth-social">Apple</button>
        </div>

        <div className="auth-divider">
          <span>Or continue with email</span>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Full Name</label>
            <div className="input-wrap">
              <User size={16} className="input-icon" />
              <input
                type="text"
                className="auth-input"
                placeholder="John Doe"
                value={form.name}
                onChange={set('name')}
                required
                autoComplete="name"
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Email</label>
            <div className="input-wrap">
              <Mail size={16} className="input-icon" />
              <input
                type="email"
                className="auth-input"
                placeholder="john@company.com"
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
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={set('password')}
                required
                minLength={8}
                autoComplete="new-password"
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
                value={form.confirm}
                onChange={set('confirm')}
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
            {loading ? 'Creating account…' : 'Sign Up'}
          </button>
        </form>

        <p className="auth-terms">
          By creating an account, you agree to PathWise's{' '}
          <Link to="/terms-of-service" className="auth-link-bold">Terms of Service</Link> and{' '}
          <Link to="/privacy-policy" className="auth-link-bold">Privacy Policy</Link>.
          We use your data to personalize your career roadmap.
        </p>

        <p className="auth-switch">
          Already have an account?{' '}
          <Link to="/signin" className="auth-link-bold">Log In</Link>
        </p>
      </div>

      <div className="auth-glow" />
    </div>
  );
}
