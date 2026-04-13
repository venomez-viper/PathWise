import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeOffIcon, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { auth } from '../../lib/api';

const glassStyle = {
  background: 'rgba(255, 255, 255, 0.65)',
  backdropFilter: 'blur(20px) saturate(1.4)',
  WebkitBackdropFilter: 'blur(20px) saturate(1.4)',
  border: '1px solid rgba(255, 255, 255, 0.8)',
  boxShadow: '0 8px 40px rgba(98, 69, 164, 0.08), 0 1px 3px rgba(98, 69, 164, 0.04)',
};

const btnStyle = {
  background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%)',
  boxShadow: '0 4px 20px rgba(98, 69, 164, 0.25)',
};

const inputCls = "pr-10 bg-white/80 border-black/8 text-[var(--on-surface)] placeholder:text-[var(--on-surface-muted)] focus-visible:border-[var(--primary)] focus-visible:ring-[var(--primary)]/15 rounded-xl h-11";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-svh flex items-center justify-center px-4 py-8"
      style={{ background: 'linear-gradient(145deg, #eefcfe 0%, #e8f6f8 30%, #f4f3f8 60%, #e9ddff 100%)' }}
    >
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-30" style={{ background: 'radial-gradient(circle, #a78bfa 0%, transparent 70%)' }} />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #5ef6e6 0%, transparent 70%)' }} />
      </div>
      <div className="relative z-10 w-full max-w-md rounded-3xl p-8 md:p-10" style={glassStyle}>
        <div className="flex justify-center mb-6">
          <img src="/logo.svg" alt="PathWise" className="h-12 object-contain" />
        </div>
        {children}
      </div>
    </div>
  );
}

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
      <Shell>
        <div className="text-center">
          <h1 className="font-['Manrope'] text-2xl font-bold tracking-tight mb-2" style={{ color: 'var(--on-surface)' }}>
            Invalid reset link
          </h1>
          <p className="text-sm mb-6" style={{ color: 'var(--on-surface-variant)' }}>
            This password reset link is invalid or has expired.
          </p>
          <Button asChild className="w-full h-11 rounded-xl font-semibold text-white" style={btnStyle}>
            <Link to="/forgot-password">Request a New Link</Link>
          </Button>
        </div>
      </Shell>
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
    <Shell>
      {success ? (
        <div className="text-center">
          <CheckCircle2 size={48} className="mx-auto mb-4" style={{ color: 'var(--secondary)' }} />
          <h1 className="font-['Manrope'] text-2xl font-bold tracking-tight mb-2" style={{ color: 'var(--on-surface)' }}>
            Password reset!
          </h1>
          <p className="text-sm" style={{ color: 'var(--on-surface-variant)' }}>
            Your password has been updated. Redirecting to sign in...
          </p>
        </div>
      ) : (
        <>
          <div className="text-center mb-6">
            <h1 className="font-['Manrope'] text-2xl font-bold tracking-tight" style={{ color: 'var(--on-surface)' }}>
              Set new password
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--on-surface-variant)' }}>
              Choose a strong password for your account.
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" style={{ color: 'var(--on-surface)' }}>New Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  autoFocus
                  className={inputCls}
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

            <div className="space-y-2">
              <Label htmlFor="confirm" style={{ color: 'var(--on-surface)' }}>Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirm"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Repeat your password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                  autoComplete="new-password"
                  className={`${inputCls} ${!passwordsMatch ? 'border-red-400 focus-visible:border-red-400 focus-visible:ring-red-400/15' : ''}`}
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

            <Button
              type="submit"
              className="w-full h-11 rounded-xl font-semibold text-white"
              style={btnStyle}
              disabled={loading || !passwordsMatch}
            >
              {loading ? 'Resetting\u2026' : 'Reset Password'}
            </Button>
          </form>
        </>
      )}
    </Shell>
  );
}
