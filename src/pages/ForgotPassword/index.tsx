import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    <div
      className="min-h-svh flex items-center justify-center px-4 py-8"
      style={{
        background: 'linear-gradient(145deg, #eefcfe 0%, #e8f6f8 30%, #f4f3f8 60%, #e9ddff 100%)',
      }}
    >
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-30" style={{ background: 'radial-gradient(circle, #a78bfa 0%, transparent 70%)' }} />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #5ef6e6 0%, transparent 70%)' }} />
      </div>

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
        <div className="flex justify-center mb-6">
          <img src="/logo.svg" alt="PathWise" className="h-12 object-contain" />
        </div>

        {sent ? (
          <div className="text-center">
            <CheckCircle2 size={48} className="mx-auto mb-4" style={{ color: 'var(--secondary)' }} />
            <h1 className="font-['Manrope'] text-2xl font-bold tracking-tight mb-2" style={{ color: 'var(--on-surface)' }}>
              Check your email
            </h1>
            <p className="text-sm mb-6 leading-relaxed" style={{ color: 'var(--on-surface-variant)' }}>
              If an account exists for <strong style={{ color: 'var(--on-surface)' }}>{email}</strong>, we've sent a password reset link. Check your inbox and spam folder.
            </p>
            <Button
              asChild
              className="w-full h-11 rounded-xl font-semibold text-white"
              style={{
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%)',
                boxShadow: '0 4px 20px rgba(98, 69, 164, 0.25)',
              }}
            >
              <Link to="/signin">Back to Sign In</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <h1 className="font-['Manrope'] text-2xl font-bold tracking-tight" style={{ color: 'var(--on-surface)' }}>
                Forgot password?
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--on-surface-variant)' }}>
                Enter your email and we'll send you a reset link.
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" style={{ color: 'var(--on-surface)' }}>Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  autoFocus
                  className="bg-white/80 border-black/8 text-[var(--on-surface)] placeholder:text-[var(--on-surface-muted)] focus-visible:border-[var(--primary)] focus-visible:ring-[var(--primary)]/15 rounded-xl h-11"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 rounded-xl font-semibold text-white"
                style={{
                  background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%)',
                  boxShadow: '0 4px 20px rgba(98, 69, 164, 0.25)',
                }}
                disabled={loading}
              >
                {loading ? 'Sending\u2026' : 'Send Reset Link'}
              </Button>
            </form>

            <p className="text-center mt-6">
              <Link to="/signin" className="text-sm inline-flex items-center gap-1.5 transition-colors hover:underline" style={{ color: 'var(--primary)' }}>
                <ArrowLeft size={14} /> Back to Sign In
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
