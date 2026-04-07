import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import Logo from '../../components/ui/Logo';
import GoogleIcon from '../../components/icons/GoogleIcon';
import AppleIcon from '../../components/icons/AppleIcon';
import { auth, tokenStore } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import { generateNonce, loadAppleSDK } from '../../lib/oauth';

type AuthUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  plan: 'free' | 'premium';
};

export default function SignIn() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'apple' | null>(null);

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const handleOAuthSuccess = (res: { token: string; user: AuthUser; isNewUser: boolean }) => {
    tokenStore.set(res.token);
    login(res.user);
    navigate(res.isNewUser ? '/app/onboarding' : '/app');
  };

  // ── Google ──
  const googleLogin = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: async (codeResponse) => {
      setError('');
      try {
        const res = await auth.oauth({
          provider: 'google',
          code: codeResponse.code,
          platform: 'web',
        });
        handleOAuthSuccess(res as { token: string; user: AuthUser; isNewUser: boolean });
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Google sign-in failed. Please try again.');
      } finally {
        setOauthLoading(null);
      }
    },
    onError: () => {
      setOauthLoading(null);
      setError('Google sign-in was cancelled.');
    },
  });

  // ── Apple ──
  const handleAppleLogin = async () => {
    setOauthLoading('apple');
    setError('');
    try {
      await loadAppleSDK();
      const nonce = generateNonce();

      window.AppleID.auth.init({
        clientId: import.meta.env.VITE_APPLE_SERVICE_ID ?? '',
        scope: 'name email',
        redirectURI: window.location.origin,
        nonce,
        usePopup: true,
      });

      const appleRes = await window.AppleID.auth.signIn();
      const name = appleRes.user?.name
        ? `${appleRes.user.name.firstName ?? ''} ${appleRes.user.name.lastName ?? ''}`.trim()
        : undefined;

      const res = await auth.oauth({
        provider: 'apple',
        code: appleRes.authorization.code,
        name,
        nonce,
        platform: 'web',
      });
      handleOAuthSuccess(res as { token: string; user: AuthUser; isNewUser: boolean });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (!msg.includes('popup_closed')) {
        setError(msg || 'Apple sign-in failed. Please try again.');
      }
    } finally {
      setOauthLoading(null);
    }
  };

  // ── Email/Password ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await auth.signin({ email: form.email, password: form.password });
      tokenStore.set(res.token);
      login(res.user as AuthUser);
      navigate('/app');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      setError(msg.includes('fetch') ? 'Could not reach the server. Check your connection.' : (msg || 'Sign in failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const isLoading = loading || oauthLoading !== null;

  return (
    <div className="auth-page">
      <div className="auth-brand">
        <Logo size={32} variant="full" />
      </div>

      <div className="auth-card">
        <div className="auth-card-header">
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Continue your journey to career mastery.</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <div className="input-label-row">
              <label className="input-label">Email</label>
            </div>
            <div className="input-wrap">
              <Mail size={16} className="input-icon" />
              <input
                type="email"
                className="auth-input"
                placeholder="name@example.com"
                value={form.email}
                onChange={set('email')}
                required
                autoComplete="email"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="input-group">
            <div className="input-label-row">
              <label className="input-label">Password</label>
              <span className="auth-link-sm" style={{ opacity: 0.5, cursor: 'not-allowed' }}>Forgot password?</span>
            </div>
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
                disabled={isLoading}
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

          <button type="submit" className="btn-auth-primary" disabled={isLoading}>
            {loading ? 'Signing in…' : <>Log In <ArrowRight size={16} /></>}
          </button>
        </form>

        <div className="auth-divider">
          <span>Or continue with</span>
        </div>

        <div className="auth-social-row">
          <button
            type="button"
            className="btn-auth-social"
            onClick={() => { setOauthLoading('google'); googleLogin(); }}
            disabled={isLoading}
          >
            <GoogleIcon size={18} />
            {oauthLoading === 'google' ? 'Signing in…' : 'Continue with Google'}
          </button>
          <button
            type="button"
            className="btn-auth-social btn-auth-social--apple"
            onClick={handleAppleLogin}
            disabled={isLoading}
          >
            <AppleIcon size={18} color="#fff" />
            {oauthLoading === 'apple' ? 'Signing in…' : 'Continue with Apple'}
          </button>
        </div>

        <p className="auth-switch auth-switch--spaced">
          Don't have an account?{' '}
          <Link to="/signup" className="auth-link-bold">Sign Up</Link>
        </p>
      </div>

      <div className="auth-footer">
        <Link to="/privacy-policy">Privacy Policy</Link>
        <Link to="/terms-of-service">Terms of Service</Link>
        <span style={{ cursor: 'default' }}>Support</span>
      </div>

      <div className="auth-glow" />
    </div>
  );
}
