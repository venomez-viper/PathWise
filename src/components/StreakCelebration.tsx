import { useState, useEffect, useMemo } from 'react';
import { Panda } from './panda';

const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100];
const STORAGE_KEY = 'pathwise_streak_celebrated';

const MILESTONE_LABELS: Record<number, string> = {
  3: '3-Day Spark',
  7: '1-Week Focus',
  14: '2-Week Habit',
  30: 'Monthly Master',
  60: '60-Day Champion',
  100: 'Centurion',
};

function getCelebratedMilestones(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function markCelebrated(milestone: number) {
  const current = getCelebratedMilestones();
  if (!current.includes(milestone)) {
    current.push(milestone);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  }
}

/**
 * Returns the highest uncelebrated milestone the user qualifies for,
 * or null if there is nothing to celebrate.
 */
export function getUncelebratedMilestone(currentStreak: number): number | null {
  const celebrated = getCelebratedMilestones();
  // Check from highest to lowest so we show the biggest achievement first
  for (let i = STREAK_MILESTONES.length - 1; i >= 0; i--) {
    const m = STREAK_MILESTONES[i];
    if (currentStreak >= m && !celebrated.includes(m)) {
      return m;
    }
  }
  return null;
}

// Copper and gold color palette for particles
const PARTICLE_COLORS = [
  '#8b4f2c', // copper
  '#b8733d', // light copper
  '#caa842', // gold / tertiary
  '#d4a843', // warm gold
  '#e8c560', // pale gold
  '#a0612e', // dark copper
  '#c9983a', // amber gold
  '#d9b86c', // soft gold
];

interface ParticleData {
  tx: number;
  ty: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
}

function generateParticles(count: number): ParticleData[] {
  const particles: ParticleData[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (360 / count) * i + (Math.random() * 20 - 10);
    const distance = 120 + Math.random() * 160;
    const rad = (angle * Math.PI) / 180;
    const size = 6 + Math.random() * 8;

    particles.push({
      tx: Math.cos(rad) * distance,
      ty: Math.sin(rad) * distance,
      size,
      color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
      duration: 0.6 + Math.random() * 0.6,
      delay: Math.random() * 0.2,
    });
  }
  return particles;
}

function buildParticleKeyframes(particles: ParticleData[]): string {
  return particles
    .map(
      (p, i) => `
      @keyframes sp${i} {
        0% { opacity: 1; transform: translate(-50%, -50%) scale(0.3); }
        30% { opacity: 1; }
        100% { opacity: 0; transform: translate(${p.tx}px, ${p.ty}px) scale(0.6); }
      }`
    )
    .join('\n');
}

interface StreakCelebrationProps {
  milestone: number;
  onDismiss: () => void;
}

export default function StreakCelebration({ milestone, onDismiss }: StreakCelebrationProps) {
  const [particles] = useState(() => generateParticles(28));
  const [fadeOut, setFadeOut] = useState(false);
  const [visible, setVisible] = useState(true);

  const keyframesCSS = useMemo(() => buildParticleKeyframes(particles), [particles]);

  useEffect(() => {
    markCelebrated(milestone);
  }, [milestone]);

  // Auto-dismiss after 3 seconds
  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadeOut(true), 2500);
    const hideTimer = setTimeout(() => {
      setVisible(false);
      onDismiss();
    }, 3200);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [onDismiss]);

  if (!visible) return null;

  const label = MILESTONE_LABELS[milestone] || `${milestone}-Day Streak`;

  return (
    <div
      className="streak-celebration-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        background: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 0.7s ease-out',
        cursor: 'pointer',
      }}
      onClick={() => {
        setVisible(false);
        onDismiss();
      }}
    >
      {/* Particle burst container */}
      <div
        style={{
          position: 'absolute',
          width: 0,
          height: 0,
          left: '50%',
          top: '50%',
        }}
      >
        {particles.map((p, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              background: p.color,
              opacity: 0,
              animation: `sp${i} ${p.duration}s ${p.delay}s ease-out forwards`,
            }}
          />
        ))}
      </div>

      {/* Center content */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
          animation: 'streakCardEntrance 0.5s ease-out forwards',
        }}
      >
        <Panda mood="celebrating" size={140} animate />

        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '3.5rem',
            fontWeight: 900,
            color: '#fff',
            lineHeight: 1,
            textShadow: '0 2px 20px rgba(0,0,0,0.3)',
            letterSpacing: '-0.03em',
          }}
        >
          {milestone}
        </div>

        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.3rem',
            fontWeight: 700,
            color: '#e8c560',
            textShadow: '0 1px 10px rgba(0,0,0,0.3)',
          }}
        >
          {label}!
        </div>

        <div
          style={{
            fontSize: '0.9rem',
            fontWeight: 600,
            color: 'rgba(255, 255, 255, 0.85)',
            marginTop: '0.25rem',
          }}
        >
          Keep the momentum going
        </div>

        <div
          style={{
            fontSize: '0.72rem',
            color: 'rgba(255, 255, 255, 0.5)',
            marginTop: '0.5rem',
          }}
        >
          Tap anywhere to dismiss
        </div>
      </div>

      <style>{`
        ${keyframesCSS}

        @keyframes streakCardEntrance {
          0% {
            opacity: 0;
            transform: scale(0.7) translateY(20px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
