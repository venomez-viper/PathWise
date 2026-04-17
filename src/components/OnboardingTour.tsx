import { useState, useEffect, useCallback } from 'react';
import { X, ArrowRight, ArrowLeft } from 'lucide-react';

const TOUR_STEPS = [
  {
    title: 'Welcome to PathWise',
    body: 'This is your career command center. Everything starts from your Dashboard: career matches, active milestones, and your readiness score.',
    target: '.page-title',
    position: 'bottom' as const,
  },
  {
    title: 'Your Career Roadmap',
    body: 'Your roadmap is built from milestones. Each milestone represents a key phase of your career journey. Milestones unlock sequentially: you must complete one before the next opens.',
    target: '[href="/app/roadmap"]',
    position: 'right' as const,
  },
  {
    title: 'Tasks Power Your Milestones',
    body: 'Every milestone contains tasks. Complete ALL tasks in a milestone to unlock the next one. Tasks are your daily actions: learning, portfolio work, networking, and interview prep.',
    target: '[href="/app/tasks"]',
    position: 'right' as const,
  },
  {
    title: 'Focus Mode',
    body: 'When you need to ship work, jump into Focus Mode. It pulls today\'s tasks into a distraction-free view with a 25-minute pomodoro timer — one task at a time, no noise.',
    target: '[href="/app/focus"]',
    position: 'right' as const,
  },
  {
    title: 'Career Journal',
    body: 'A quiet space to reflect on your career. Type or dictate entries with voice, get AI-generated tags, daily prompts, and ask natural-language questions across your own journey.',
    target: '[href="/app/journal"]',
    position: 'right' as const,
  },
  {
    title: 'Track Your Growth',
    body: 'Your Progress dashboard shows your career readiness score, task completion rate, skill breakdown, and weekly activity. Watch your score climb as you complete tasks.',
    target: '[href="/app/progress"]',
    position: 'right' as const,
  },
  {
    title: 'Earn Your Certificate',
    body: 'Complete every task in every milestone and you will earn a Certificate of Appreciation from PathWise. You can download it, share it on LinkedIn, and add it to your portfolio.',
    target: '[href="/app/streaks"]',
    position: 'right' as const,
  },
  {
    title: 'Customize Your Experience',
    body: 'Set your avatar, manage your account, retake assessments, change your target role, or create a public profile to share your career journey.',
    target: '[href="/app/settings"]',
    position: 'right' as const,
  },
];

export default function OnboardingTour({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [visible, setVisible] = useState(false);

  const current = TOUR_STEPS[step];

  const measureTarget = useCallback(() => {
    const el = document.querySelector(current.target);
    if (el) {
      setTargetRect(el.getBoundingClientRect());
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      setTargetRect(null);
    }
  }, [current.target]);

  useEffect(() => {
    measureTarget();
    // Fade in on mount
    requestAnimationFrame(() => setVisible(true));
  }, [measureTarget]);

  // Re-measure on resize/scroll
  useEffect(() => {
    const handler = () => measureTarget();
    window.addEventListener('resize', handler);
    window.addEventListener('scroll', handler, true);
    return () => {
      window.removeEventListener('resize', handler);
      window.removeEventListener('scroll', handler, true);
    };
  }, [measureTarget]);

  const finish = useCallback(() => {
    localStorage.setItem('pathwise_tour_done', '1');
    setVisible(false);
    setTimeout(() => onComplete(), 200);
  }, [onComplete]);

  const next = () => {
    if (step < TOUR_STEPS.length - 1) setStep(s => s + 1);
    else finish();
  };

  const back = () => {
    if (step > 0) setStep(s => s - 1);
  };

  // Calculate tooltip position
  const getTooltipStyle = (): React.CSSProperties => {
    if (!targetRect) {
      return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }

    const gap = 12;
    const tooltipWidth = 320;
    const pos = current.position;

    if (pos === 'bottom') {
      return {
        top: targetRect.bottom + gap,
        left: targetRect.left + targetRect.width / 2 - tooltipWidth / 2,
      };
    }

    if (pos === 'right') {
      return {
        top: targetRect.top + targetRect.height / 2 - 60,
        left: targetRect.right + gap,
      };
    }

    if (pos === 'left') {
      return {
        top: targetRect.top + targetRect.height / 2 - 60,
        left: targetRect.left - tooltipWidth - gap,
      };
    }

    // top
    return {
      top: targetRect.top - gap - 180,
      left: targetRect.left + targetRect.width / 2 - tooltipWidth / 2,
    };
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9998,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.25s ease',
        pointerEvents: 'auto',
      }}
    >
      {/* Dark overlay background */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          zIndex: 9998,
        }}
        onClick={finish}
      />

      {/* Spotlight cutout */}
      {targetRect && (
        <div
          style={{
            position: 'fixed',
            top: targetRect.top - 4,
            left: targetRect.left - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
            borderRadius: 8,
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.6)',
            zIndex: 9999,
            pointerEvents: 'none',
            transition: 'top 0.3s ease, left 0.3s ease, width 0.3s ease, height 0.3s ease',
          }}
        />
      )}

      {/* Tooltip card */}
      <div
        style={{
          position: 'fixed',
          ...getTooltipStyle(),
          zIndex: 10000,
          background: '#fff',
          borderRadius: '1rem',
          padding: '1.5rem',
          width: 320,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          transition: 'top 0.3s ease, left 0.3s ease',
        }}
      >
        {/* Header: step counter + close */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--on-surface-variant)', fontWeight: 600 }}>
            {step + 1} of {TOUR_STEPS.length}
          </span>
          <button
            onClick={finish}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-variant)', padding: 4 }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Title */}
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--on-surface)', marginBottom: 8 }}>
          {current.title}
        </h3>

        {/* Body */}
        <p style={{ fontSize: '0.88rem', color: 'var(--on-surface-variant)', lineHeight: 1.6, marginBottom: 16 }}>
          {current.body}
        </p>

        {/* Footer: skip + nav buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={finish}
            style={{ background: 'none', border: 'none', fontSize: '0.82rem', color: 'var(--on-surface-variant)', cursor: 'pointer' }}
          >
            Skip tour
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            {step > 0 && (
              <button
                onClick={back}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4, padding: '8px 16px',
                  border: '1px solid var(--surface-container-high)', borderRadius: 'var(--radius-md)',
                  background: 'none', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                  color: 'var(--on-surface)',
                }}
              >
                <ArrowLeft size={14} /> Back
              </button>
            )}
            <button
              onClick={next}
              style={{
                display: 'flex', alignItems: 'center', gap: 4, padding: '8px 16px',
                background: 'var(--primary)', color: '#fff', border: 'none',
                borderRadius: 'var(--radius-md)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
              }}
            >
              {step === TOUR_STEPS.length - 1 ? 'Done' : 'Next'} <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
