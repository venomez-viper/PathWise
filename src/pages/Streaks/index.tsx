import { useState, useEffect, useMemo } from 'react';
import { Flame, Zap, Clock, Loader2, CheckCircle2, Award, Target, Calendar, ArrowRight, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../lib/auth-context';
import { streaks as streaksApi } from '../../lib/api';
import { Panda } from '../../components/panda';
import './Streaks.css';

type ViewMode = 'week' | 'month' | 'year';

const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const STREAK_MILESTONES = [
  { days: 3, label: '3-Day Spark', emoji: '⚡' },
  { days: 7, label: '1-Week Focus', emoji: '🔥' },
  { days: 14, label: '2-Week Habit', emoji: '💪' },
  { days: 30, label: 'Monthly Master', emoji: '🏆' },
  { days: 60, label: '60-Day Champion', emoji: '⭐' },
  { days: 100, label: 'Centurion', emoji: '👑' },
];

function getStreakMessage(streak: number): string {
  if (streak === 0) return "Start completing tasks to ignite your streak!";
  if (streak === 1) return "Day one done — the hardest part is starting!";
  if (streak < 3) return "Building momentum — keep showing up!";
  if (streak < 7) return "You're on fire! A week is within reach.";
  if (streak < 14) return "Incredible consistency — you're forming a real habit!";
  if (streak < 30) return "Two weeks strong! You're in the top 10% of users.";
  if (streak < 60) return "A full month of growth — that's elite dedication.";
  return "Unstoppable. You're a career growth machine.";
}

function getPandaMood(streak: number) {
  if (streak >= 30) return 'cool' as const;
  if (streak >= 14) return 'celebrating' as const;
  if (streak >= 7) return 'happy' as const;
  if (streak >= 3) return 'loving' as const;
  if (streak >= 1) return 'curious' as const;
  return 'sleepy' as const;
}

export default function Streaks() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    streaksApi.get(user.id).then((res: any) => { setData(res.streak); setLoading(false); })
      .catch(() => { setData({ currentStreak: 0, bestStreak: 0, consistencyScore: 0, totalXp: 0, weeklyProgress: [false,false,false,false,false,false,false] }); setLoading(false); });
  }, [user]);

  // Refresh on focus
  useEffect(() => {
    if (!user) return;
    const refresh = () => {
      if (document.visibilityState === 'visible') {
        streaksApi.get(user.id).then((res: any) => setData(res.streak)).catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', refresh);
    return () => document.removeEventListener('visibilitychange', refresh);
  }, [user]);

  const [viewMode, setViewMode] = useState<ViewMode>('week');

  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const now = new Date();
  const todayIdx = now.getDay();
  const todayMapped = todayIdx === 0 ? 6 : todayIdx - 1;
  const weeklyDone = data?.weeklyProgress?.filter(Boolean).length ?? 0;
  const currentStreak = data?.currentStreak ?? 0;

  // Build a set of active dates for fast lookup
  const activeDaysSet = useMemo(() => new Set(data?.activeDays ?? []), [data?.activeDays]);

  // Month view: build a grid of weeks for the current month
  const monthGrid = useMemo(() => {
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    const todayDate = now.getDate();

    const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;
    const cells: Array<{ date: number; inMonth: boolean; active: boolean; isToday: boolean }> = [];

    for (let i = 0; i < totalCells; i++) {
      const dayNum = i - startOffset + 1;
      const inMonth = dayNum >= 1 && dayNum <= daysInMonth;
      const isToday = inMonth && dayNum === todayDate;

      // Check activity from activeDays log
      let active = false;
      if (inMonth) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
        active = activeDaysSet.has(dateStr);
      }

      cells.push({ date: dayNum, inMonth, active, isToday });
    }

    const activeCount = cells.filter(c => c.active).length;
    return { cells, monthName: MONTH_LABELS[month], year, activeCount };
  }, [data, activeDaysSet, now.getMonth(), now.getFullYear(), now.getDate()]);

  // Year view: 12 months, current month highlighted
  const currentMonth = now.getMonth();
  const bestStreak = data?.bestStreak ?? 0;
  const nextMilestone = STREAK_MILESTONES.find(m => m.days > currentStreak);
  const daysToNext = nextMilestone ? nextMilestone.days - currentStreak : 0;
  if (loading) return (
    <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300, gap: 12 }}>
      <Panda mood="thinking" size={130} animate />
      <Loader2 size={22} color="var(--secondary)" style={{ animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  return (
    <div className="page streaks">
      {/* Header */}
      <div className="streaks__header">
        <h1 className="streaks__title">Momentum</h1>
        <p className="streaks__subtitle">{getStreakMessage(currentStreak)}</p>
      </div>

      {/* Streak Hero */}
      <div className="streaks__hero">
        <div className="streaks__hero-top">
          <div>
            <div className="streaks__flame-icon">
              <Flame size={24} color="var(--secondary)" />
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <p className="streaks__count">{currentStreak}-day streak</p>
            <p className="streaks__best">Personal best: {bestStreak} days</p>
            {nextMilestone && (
              <p style={{ fontSize: '0.78rem', color: 'var(--secondary)', fontWeight: 600, marginTop: '0.3rem' }}>
                {nextMilestone.emoji} {daysToNext} day{daysToNext !== 1 ? 's' : ''} to "{nextMilestone.label}"
              </p>
            )}
          </div>
          <Panda mood={getPandaMood(currentStreak)} size={110} animate />
        </div>

        {/* Activity View */}
        <div className="streaks__weekly">
          {/* Segmented Toggle */}
          <div className="streaks__view-toggle">
            {(['week', 'month', 'year'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                className={`streaks__view-btn${viewMode === mode ? ' streaks__view-btn--active' : ''}`}
                onClick={() => setViewMode(mode)}
                style={{ cursor: 'pointer' }}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>

          {/* Week View */}
          {viewMode === 'week' && (
            <>
              <div className="streaks__weekly-header">
                <span className="streaks__weekly-label">This Week</span>
                <span className="streaks__weekly-count">{weeklyDone}/7 complete</span>
              </div>
              <div className="streaks__days">
                {days.map((d, i) => {
                  const active = data?.weeklyProgress?.[i];
                  const isToday = i === todayMapped;
                  let circleClass = 'streaks__day-circle';
                  if (active) circleClass += ' streaks__day-circle--done';
                  else if (isToday) circleClass += ' streaks__day-circle--today';
                  else circleClass += ' streaks__day-circle--empty';

                  return (
                    <div key={i} className="streaks__day">
                      <span className="streaks__day-label">{d}</span>
                      <div className={circleClass}>
                        {active && <CheckCircle2 size={16} color="#fff" strokeWidth={2.5} />}
                        {isToday && !active && <Zap size={14} color="var(--secondary)" />}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: '1rem' }}>
                <div className="streaks__bar-track">
                  <div className="streaks__bar-fill" style={{ width: `${(weeklyDone / 7) * 100}%` }} />
                </div>
              </div>
            </>
          )}

          {/* Month View */}
          {viewMode === 'month' && (
            <>
              <div className="streaks__weekly-header">
                <span className="streaks__weekly-label">{monthGrid.monthName} {monthGrid.year}</span>
                <span className="streaks__weekly-count">{monthGrid.activeCount} active day{monthGrid.activeCount !== 1 ? 's' : ''}</span>
              </div>
              <div className="streaks__month-grid">
                {days.map((d, i) => (
                  <span key={`hdr-${i}`} className="streaks__month-header">{d}</span>
                ))}
                {monthGrid.cells.map((cell, i) => {
                  let cellClass = 'streaks__month-cell';
                  if (!cell.inMonth) cellClass += ' streaks__month-cell--outside';
                  else if (cell.active) cellClass += ' streaks__month-cell--active';
                  else if (cell.isToday && !cell.active) cellClass += ' streaks__month-cell--today';
                  return (
                    <div key={i} className={cellClass} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {cell.inMonth && (
                        <span style={{
                          fontSize: '0.62rem', fontWeight: cell.isToday ? 700 : 500,
                          color: cell.active ? '#fff' : cell.isToday ? 'var(--secondary)' : 'var(--on-surface-muted)',
                          lineHeight: 1,
                        }}>
                          {cell.date}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Year View */}
          {viewMode === 'year' && (
            <>
              <div className="streaks__weekly-header">
                <span className="streaks__weekly-label">{now.getFullYear()} Overview</span>
              </div>
              <div className="streaks__year-grid">
                {MONTH_LABELS.map((label, i) => {
                  const isCurrent = i === currentMonth;
                  const isPast = i < currentMonth;
                  let blockClass = 'streaks__year-block';
                  if (isCurrent) blockClass += ' streaks__year-block--current';
                  else if (isPast) blockClass += ' streaks__year-block--past';
                  return (
                    <div key={label} className={blockClass}>
                      <span className="streaks__year-label">{label}</span>
                      {isCurrent && (
                        <span className="streaks__year-badge">Now</span>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="streaks__month-legend">
                <Info size={12} color="var(--on-surface-muted)" />
                <span>Monthly activity tracking coming soon</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Stats Grid — 3 columns */}
      <div className="streaks__stats" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
        <div className="streaks__stat-card">
          <div className="streaks__stat-icon-wrap">
            <Zap size={18} color="var(--primary)" />
          </div>
          <span className="streaks__stat-value">{data?.totalXp ?? 0}</span>
          <p className="streaks__stat-label">Total XP</p>
        </div>
        <div className="streaks__stat-card">
          <div className="streaks__stat-icon-wrap">
            <Clock size={18} color="var(--secondary)" />
          </div>
          <span className="streaks__stat-value">9 AM</span>
          <p className="streaks__stat-label">Peak Hour</p>
        </div>
        <div className="streaks__stat-card">
          <div className="streaks__stat-icon-wrap">
            <Calendar size={18} color="var(--copper)" />
          </div>
          <span className="streaks__stat-value">{weeklyDone}</span>
          <p className="streaks__stat-label">This Week</p>
        </div>
      </div>

      {/* Consistency Score */}
      <div className="streaks__consistency">
        <div className="streaks__consistency-header">
          <div>
            <span className="streaks__consistency-title">Consistency Score</span>
            <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginTop: '0.15rem' }}>14-day rolling average</p>
          </div>
          <span style={{
            fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800,
            color: (data?.consistencyScore ?? 0) >= 70 ? 'var(--secondary)' : (data?.consistencyScore ?? 0) >= 40 ? 'var(--copper)' : 'var(--on-surface-variant)',
          }}>
            {data?.consistencyScore ?? 0}%
          </span>
        </div>
        <div className="streaks__bar-track" style={{ height: 8 }}>
          <div className="streaks__bar-fill" style={{
            width: `${data?.consistencyScore ?? 0}%`,
            background: (data?.consistencyScore ?? 0) >= 70 ? 'var(--secondary)' : (data?.consistencyScore ?? 0) >= 40 ? 'var(--copper)' : 'var(--on-surface-variant)',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
          <span style={{ fontSize: '0.68rem', color: 'var(--on-surface-muted)' }}>Getting started</span>
          <span style={{ fontSize: '0.68rem', color: 'var(--on-surface-muted)' }}>On track</span>
          <span style={{ fontSize: '0.68rem', color: 'var(--on-surface-muted)' }}>Crushing it</span>
        </div>
      </div>

      {/* Streak Milestones */}
      <div className="streaks__milestones">
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700,
          color: 'var(--on-surface)', marginBottom: '0.75rem',
        }}>
          Streak Milestones
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {STREAK_MILESTONES.map((m) => {
            const achieved = currentStreak >= m.days;
            const isCurrent = nextMilestone?.days === m.days;
            const progress = isCurrent ? Math.round((currentStreak / m.days) * 100) : achieved ? 100 : 0;
            return (
              <div key={m.days} style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                background: achieved ? 'rgba(0,106,98,0.06)' : 'var(--surface-container-lowest)',
                borderRadius: 'var(--radius-lg)', padding: '0.75rem 1rem',
                border: isCurrent ? '1.5px solid var(--secondary)' : '1px solid var(--outline-variant)',
                opacity: !achieved && !isCurrent ? 0.5 : 1,
              }}>
                <span style={{ fontSize: '1.25rem', width: 28, textAlign: 'center' }}>
                  {achieved ? m.emoji : <Award size={18} color="var(--on-surface-muted)" />}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      fontSize: '0.85rem', fontWeight: 700,
                      color: achieved ? 'var(--secondary)' : 'var(--on-surface)',
                    }}>{m.label}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--on-surface-muted)', fontWeight: 600 }}>
                      {m.days} days
                    </span>
                  </div>
                  {isCurrent && (
                    <div style={{ marginTop: '0.35rem' }}>
                      <div className="streaks__bar-track" style={{ height: 4 }}>
                        <div className="streaks__bar-fill" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  )}
                </div>
                {achieved && <CheckCircle2 size={16} color="var(--secondary)" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <Link to="/app/tasks" className="streaks__cta">
        <Target size={16} /> {currentStreak === 0 ? 'Start Your Streak' : "Complete Today's Tasks"} <ArrowRight size={16} />
      </Link>
    </div>
  );
}
