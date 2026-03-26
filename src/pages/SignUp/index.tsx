import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function SignUp() {
  const [showPassword, setShowPassword]   = useState(false);
  const [showConfirm,  setShowConfirm]    = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const passwordsMatch = form.confirm === '' || form.password === form.confirm;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordsMatch) return;
    // TODO: wire to POST /users + auth API
  };

  return (
    <div className="auth-page">
      {/* Brand */}
      <div className="auth-brand">
        <img src="/logo.png" alt="PathWise" className="auth-logo" />
        <span className="auth-brand-name">PathWise</span>
      </div>

      {/* Card */}
      <div className="auth-card">
        <div className="auth-card-header">
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">Start mapping your career path today.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="input-group">
            <label className="input-label">Full Name</label>
            <div className="input-wrap">
              <User size={16} className="input-icon" />
              <input
                type="text"
                className="auth-input"
                placeholder="Emily Carter"
                value={form.name}
                onChange={set('name')}
                required
                autoComplete="name"
              />
            </div>
          </div>

          {/* Email */}
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

          {/* Password */}
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

          {/* Confirm Password */}
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
              <button
                type="button"
                className="input-eye"
                onClick={() => setShowConfirm(p => !p)}
                aria-label="Toggle confirm password visibility"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {!passwordsMatch && (
              <p className="input-error-msg">Passwords don't match</p>
            )}
          </div>

          <button type="submit" className="btn-auth-primary" disabled={!passwordsMatch}>
            Create Account
          </button>
        </form>

        <p className="auth-terms">
          By signing up you agree to our{' '}
          <span className="auth-link-bold">Terms</span> and{' '}
          <span className="auth-link-bold">Privacy Policy</span>.
        </p>

        <p className="auth-switch">
          Already have an account?{' '}
          <Link to="/signin" className="auth-link-bold">Sign in</Link>
        </p>
      </div>

      {/* Decorative glow */}
      <div className="auth-glow" />
    </div>
  );
}
