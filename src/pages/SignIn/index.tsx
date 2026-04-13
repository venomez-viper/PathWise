import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { auth, tokenStore } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';

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

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

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

  return (
    <div
      className="min-h-svh flex items-center justify-center px-4 py-8"
      style={{
        background: 'linear-gradient(145deg, #eefcfe 0%, #e8f6f8 30%, #f4f3f8 60%, #e9ddff 100%)',
      }}
    >
      {/* Ambient glow orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-30"
          style={{ background: 'radial-gradient(circle, #a78bfa 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #5ef6e6 0%, transparent 70%)' }}
        />
      </div>

      {/* Glass card */}
      <div
        className="relative z-10 w-full max-w-md rounded-3xl p-8 md:p-10"
        style={{
          background: 'rgba(255, 255, 255, 0.65)',
          backdropFilter: 'blur(20px) saturate(1.4)',
          WebkitBackdropFilter: 'blur(20px) saturate(1.4)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          boxShadow: '0 8px 40px rgba(98, 69, 164, 0.08), 0 1px 3px rgba(98, 69, 164, 0.04)',
        }}
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src="/logo.svg" alt="PathWise" className="h-12 object-contain" />
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="font-['Manrope'] text-2xl font-bold tracking-tight" style={{ color: 'var(--on-surface)' }}>
            Welcome back
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--on-surface-variant)' }}>
            Sign in to continue your career journey
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" style={{ color: 'var(--on-surface)' }}>Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={form.email}
              onChange={set('email')}
              required
              autoComplete="email"
              className="bg-white/80 border-black/8 text-[var(--on-surface)] placeholder:text-[var(--on-surface-muted)] focus-visible:border-[var(--primary)] focus-visible:ring-[var(--primary)]/15 rounded-xl h-11"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" style={{ color: 'var(--on-surface)' }}>Password</Label>
              <Link
                to="/forgot-password"
                className="text-xs font-medium transition-colors"
                style={{ color: 'var(--primary)' }}
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={set('password')}
                required
                autoComplete="current-password"
                className="pr-10 bg-white/80 border-black/8 text-[var(--on-surface)] placeholder:text-[var(--on-surface-muted)] focus-visible:border-[var(--primary)] focus-visible:ring-[var(--primary)]/15 rounded-xl h-11"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: 'var(--on-surface-muted)' }}
                onClick={() => setShowPassword(p => !p)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Remember me */}
          <div className="flex items-center space-x-2">
            <Checkbox id="remember" />
            <Label htmlFor="remember" className="text-sm font-normal cursor-pointer" style={{ color: 'var(--on-surface-variant)' }}>
              Remember me
            </Label>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full h-11 rounded-xl font-semibold text-white"
            style={{
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%)',
              boxShadow: '0 4px 20px rgba(98, 69, 164, 0.25)',
            }}
            disabled={loading}
          >
            {loading ? 'Signing in\u2026' : 'Sign In'}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full" style={{ borderTop: '1px solid var(--outline-variant)' }} />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="px-3 text-[var(--on-surface-muted)]" style={{ background: 'rgba(255,255,255,0.5)' }}>or</span>
          </div>
        </div>

        {/* Google */}
        <div className="relative group">
          <Button
            variant="outline"
            className="w-full h-11 rounded-xl bg-white/80 border-black/8 font-medium opacity-60 cursor-not-allowed"
            style={{ color: 'var(--on-surface)' }}
            type="button"
            disabled
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </Button>
          <p className="text-xs text-center mt-1.5" style={{ color: 'var(--on-surface-muted)' }}>Coming soon</p>
        </div>

        {/* Footer */}
        <p className="text-sm text-center mt-6" style={{ color: 'var(--on-surface-variant)' }}>
          New to PathWise?{' '}
          <Link to="/signup" className="font-semibold hover:underline" style={{ color: 'var(--primary)' }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
