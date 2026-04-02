import { Link } from 'react-router-dom';
import { Trophy, TrendingUp, Flame } from 'lucide-react';

interface Props {
  userName: string;
  completedCount: number;
  streakDays: number;
  onDismiss: () => void;
}

export default function TaskCelebration({ userName, completedCount, streakDays, onDismiss }: Props) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
    }} onClick={onDismiss}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#fff', borderRadius: '2.5rem', padding: '2.5rem 2rem',
        maxWidth: 400, width: '100%', textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
      }}>
        {/* Trophy */}
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(0,106,98,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
          <Trophy size={28} color="#006a62" />
        </div>

        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.65rem', fontWeight: 800, color: 'var(--on-surface)', letterSpacing: '-0.03em' }}>
          Great work, {userName}!
        </h1>
        <p style={{ fontSize: '1.5rem', margin: '4px 0' }}>🎉</p>
        <p style={{ fontSize: '0.9rem', color: 'var(--on-surface-variant)', lineHeight: 1.5 }}>
          You've completed all {completedCount} tasks for today.
        </p>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1.5rem' }}>
          <div style={{ background: 'var(--surface-container-low)', borderRadius: 'var(--radius-xl)', padding: '1rem', textAlign: 'center' }}>
            <TrendingUp size={18} color="var(--on-surface-variant)" style={{ marginBottom: 4 }} />
            <p style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--on-surface-variant)' }}>Growth</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 800, color: 'var(--on-surface)' }}>+{Math.max(1, Math.round(completedCount * 1.5))}% readiness</p>
          </div>
          <div style={{ background: 'var(--surface-container-low)', borderRadius: 'var(--radius-xl)', padding: '1rem', textAlign: 'center' }}>
            <Flame size={18} color="var(--on-surface-variant)" style={{ marginBottom: 4 }} />
            <p style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--on-surface-variant)' }}>Consistency</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 800, color: 'var(--on-surface)' }}>{streakDays} day streak</p>
          </div>
        </div>

        {/* Weekly goal */}
        <div style={{ background: 'var(--surface-container-low)', borderRadius: 'var(--radius-xl)', padding: '1rem', marginTop: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <p style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--on-surface-variant)' }}>Weekly Goal</p>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.9rem', color: 'var(--on-surface)' }}>{Math.min(100, Math.round((completedCount / Math.max(completedCount + 2, 5)) * 100))}%</span>
          </div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 800, color: 'var(--on-surface)', marginBottom: 6 }}>
            {streakDays >= 5 ? 'Weekly Champion' : streakDays >= 3 ? 'Mid-Week Milestone' : 'Getting Started'}
          </p>
          <div style={{ height: 6, background: 'var(--surface-container)', borderRadius: 999, overflow: 'hidden', marginBottom: 6 }}>
            <div style={{ height: '100%', width: `${Math.min(100, Math.round((completedCount / Math.max(completedCount + 2, 5)) * 100))}%`, background: 'linear-gradient(90deg, #006a62, #5ef6e6)', borderRadius: 999 }} />
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)', fontStyle: 'italic' }}>
            Keep the momentum going — you're on a roll!
          </p>
        </div>

        {/* Buttons */}
        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Link to="/app/tasks" onClick={onDismiss} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0.85rem', borderRadius: 'var(--radius-full)',
            background: 'linear-gradient(135deg, var(--primary), var(--primary-container))',
            color: '#fff', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none',
          }}>
            View Tomorrow's Tasks
          </Link>
          <Link to="/app" onClick={onDismiss} style={{
            textAlign: 'center', fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', textDecoration: 'none',
          }}>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
