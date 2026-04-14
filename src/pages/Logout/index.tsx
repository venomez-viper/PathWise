import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import posthog from 'posthog-js';
import { tokenStore } from '../../lib/api';
import { Button } from '@/components/ui/button';
import { Panda } from '../../components/panda';

export default function LogoutPage() {
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    tokenStore.clear();
    posthog.reset();
    const timer = setTimeout(() => setDone(true), 600);
    return () => clearTimeout(timer);
  }, []);

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
        className="relative z-10 w-full max-w-md rounded-3xl p-8 md:p-10 text-center"
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

        {!done ? (
          <div className="py-8">
            <div
              className="w-10 h-10 mx-auto mb-4 rounded-full animate-spin"
              style={{ border: '3px solid var(--surface-container-high)', borderTopColor: 'var(--primary)' }}
            />
            <p className="text-sm" style={{ color: 'var(--on-surface-variant)' }}>Signing you out...</p>
          </div>
        ) : (
          <>
            <div className="flex justify-center">
              <Panda mood="sad" size={120} animate />
            </div>

            <h1 className="font-['Manrope'] text-2xl font-bold tracking-tight mt-4 mb-2" style={{ color: 'var(--on-surface)' }}>
              You've been signed out
            </h1>
            <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--on-surface-variant)' }}>
              Thanks for using PathWise. Your progress is saved and waiting for you when you return.
            </p>

            <div className="flex gap-3 justify-center flex-wrap">
              <Button
                asChild
                className="h-11 rounded-xl font-semibold text-white px-6"
                style={{
                  background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%)',
                  boxShadow: '0 4px 20px rgba(98, 69, 164, 0.25)',
                }}
              >
                <Link to="/signin">
                  Sign Back In <ArrowRight size={16} className="ml-1" />
                </Link>
              </Button>
              <Button
                variant="outline"
                className="h-11 rounded-xl bg-white/80 border-black/8 hover:bg-white font-medium"
                style={{ color: 'var(--on-surface)' }}
                onClick={() => navigate('/', { replace: true })}
              >
                Go Home
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
