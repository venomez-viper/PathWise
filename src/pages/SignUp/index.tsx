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

export default function SignUp() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const passwordsMatch = form.confirm === '' || form.password === form.confirm;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordsMatch || !agreed) return;
    setError('');
    setLoading(true);
    try {
      const res = await auth.signup({ name: form.name, email: form.email, password: form.password });
      tokenStore.set(res.token);
      login(res.user as AuthUser);
      navigate('/app');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      setError(msg.includes('fetch') ? 'Could not reach the server. Check your connection.' : (msg || 'Sign up failed. Please try again.'));
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
        className="relative z-10 w-full max-w-md rounded-3xl p-8 md:p-10 overflow-y-auto max-h-[95svh]"
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
            Create your account
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--on-surface-variant)' }}>
            Start building your personalized career roadmap.
          </p>
        </div>

        {/* Google */}
        <div className="mb-5">
          <Button
            type="button"
            variant="outline"
            className="w-full h-11 rounded-xl bg-white/80 border-black/8 gap-2 font-medium opacity-60 cursor-not-allowed"
            style={{ color: 'var(--on-surface)' }}
            disabled
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
              <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
              <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
              <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
            </svg>
            Continue with Google
          </Button>
          <p className="text-xs text-center mt-1.5" style={{ color: 'var(--on-surface-muted)' }}>Coming soon</p>
        </div>

        {/* Divider */}
        <div className="relative mb-5">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full" style={{ borderTop: '1px solid var(--outline-variant)' }} />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="px-3 text-[var(--on-surface-muted)]" style={{ background: 'rgba(255,255,255,0.5)' }}>or</span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 mb-4">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Name + Email side by side */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="signup-name" style={{ color: 'var(--on-surface)' }}>Full Name</Label>
              <Input
                id="signup-name"
                type="text"
                placeholder="John Doe"
                value={form.name}
                onChange={set('name')}
                required
                autoComplete="name"
                className="bg-white/80 border-black/8 text-[var(--on-surface)] placeholder:text-[var(--on-surface-muted)] focus-visible:border-[var(--primary)] focus-visible:ring-[var(--primary)]/15 rounded-xl h-11"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="signup-email" style={{ color: 'var(--on-surface)' }}>Email</Label>
              <Input
                id="signup-email"
                type="email"
                placeholder="name@example.com"
                value={form.email}
                onChange={set('email')}
                required
                autoComplete="email"
                className="bg-white/80 border-black/8 text-[var(--on-surface)] placeholder:text-[var(--on-surface-muted)] focus-visible:border-[var(--primary)] focus-visible:ring-[var(--primary)]/15 rounded-xl h-11"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="signup-password" style={{ color: 'var(--on-surface)' }}>Password</Label>
            <div className="relative">
              <Input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={set('password')}
                required
                minLength={8}
                autoComplete="new-password"
                className="pr-10 bg-white/80 border-black/8 text-[var(--on-surface)] placeholder:text-[var(--on-surface-muted)] focus-visible:border-[var(--primary)] focus-visible:ring-[var(--primary)]/15 rounded-xl h-11"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: 'var(--on-surface-muted)' }}
                onClick={() => setShowPassword(p => !p)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <Label htmlFor="signup-confirm" style={{ color: 'var(--on-surface)' }}>Confirm Password</Label>
            <div className="relative">
              <Input
                id="signup-confirm"
                type={showConfirm ? 'text' : 'password'}
                placeholder="Repeat your password"
                value={form.confirm}
                onChange={set('confirm')}
                required
                autoComplete="new-password"
                className={`pr-10 bg-white/80 border-black/8 text-[var(--on-surface)] placeholder:text-[var(--on-surface-muted)] focus-visible:border-[var(--primary)] focus-visible:ring-[var(--primary)]/15 rounded-xl h-11 ${!passwordsMatch ? 'border-red-400 focus-visible:border-red-400 focus-visible:ring-red-400/15' : ''}`}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: 'var(--on-surface-muted)' }}
                onClick={() => setShowConfirm(p => !p)}
                aria-label="Toggle confirm password visibility"
              >
                {showConfirm ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
              </button>
            </div>
            {!passwordsMatch && (
              <p className="text-xs text-red-500">Passwords don't match</p>
            )}
          </div>

          {/* Terms */}
          <div className="flex items-start gap-2 pt-1">
            <Checkbox
              id="signup-terms"
              checked={agreed}
              onCheckedChange={(v) => setAgreed(v === true)}
              className="mt-0.5"
            />
            <Label
              htmlFor="signup-terms"
              className="text-xs font-normal leading-snug cursor-pointer"
              style={{ color: 'var(--on-surface-variant)' }}
            >
              I agree to the{' '}
              <Link to="/terms-of-service" className="font-medium underline underline-offset-2 transition-colors hover:text-[var(--primary-container)]" style={{ color: 'var(--primary)' }}>
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy-policy" className="font-medium underline underline-offset-2 transition-colors hover:text-[var(--primary-container)]" style={{ color: 'var(--primary)' }}>
                Privacy Policy
              </Link>
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
            disabled={loading || !passwordsMatch || !agreed}
          >
            {loading ? 'Creating account\u2026' : 'Create free account'}
          </Button>
        </form>

        {/* Footer */}
        <p className="text-sm text-center mt-5" style={{ color: 'var(--on-surface-variant)' }}>
          Already have an account?{' '}
          <Link to="/signin" className="font-semibold hover:underline" style={{ color: 'var(--primary)' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
