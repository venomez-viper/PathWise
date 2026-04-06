import { useState, useEffect } from 'react';
import { Flame, TrendingUp, Zap, Clock, Loader2, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../lib/auth-context';
import { streaks as streaksApi } from '../../lib/api';
import { Panda } from '../../components/panda';
import './Streaks.css';

export default function Streaks() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    streaksApi.get(user.id).then((res: any) => { setData(res.streak); setLoading(false); })
      .catch(() => { setData({ currentStreak: 0, bestStreak: 0, consistencyScore: 0, totalXp: 0, weeklyProgress: [false,false,false,false,false,false,false] }); setLoading(false); });
  }, [user]);

  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const todayIdx = new Date().getDay();
  const todayMapped = todayIdx === 0 ? 6 : todayIdx - 1;
  const weeklyDone = data?.weeklyProgress?.filter(Boolean).length ?? 0;

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
        <p className="streaks__subtitle">
          {data?.currentStreak > 0
            ? "You're building momentum — keep it going!"
            : "Start completing tasks to build your streak."}
        </p>
      </div>

      {/* Streak Hero */}
      <div className="streaks__hero" style={{ position: 'relative' }}>
        <div className="streaks__hero-top">
          <div className="streaks__flame-icon">
            <Flame size={24} color="var(--secondary)" />
          </div>
          <div>
            <p className="streaks__count">{data?.currentStreak ?? 0}-day streak</p>
            <p className="streaks__best">Personal best: {data?.bestStreak ?? 0} days</p>
          </div>
          {data?.currentStreak > 0
            ? <Panda mood="celebrating" size={130} animate />
            : <Panda mood="sleepy" size={130} animate />
          }
        </div>

        {/* Weekly Progress */}
        <div className="streaks__weekly">
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
        </div>
      </div>

      {/* Stats Grid */}
      <div className="streaks__stats">
        <div className="streaks__stat-card">
          <p className="streaks__stat-label">Peak Hour</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock size={18} color="var(--secondary)" />
            <span className="streaks__stat-value">9 AM</span>
          </div>
          <p className="streaks__stat-detail">Your most productive time</p>
        </div>
        <div className="streaks__stat-card">
          <p className="streaks__stat-label">Total XP</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Zap size={18} color="var(--primary)" />
            <span className="streaks__stat-value">{data?.totalXp ?? 0}</span>
          </div>
          <p className="streaks__stat-detail">Experience points earned</p>
        </div>
      </div>

      {/* Consistency */}
      <div className="streaks__consistency">
        <div className="streaks__consistency-header">
          <span className="streaks__consistency-title">Consistency Score</span>
          <TrendingUp size={18} color="var(--secondary)" />
        </div>
        <div className="streaks__consistency-row">
          <span className="streaks__consistency-label">14-day rolling average</span>
          <span className="streaks__consistency-pct">{data?.consistencyScore ?? 0}%</span>
        </div>
        <div className="streaks__bar-track">
          <div className="streaks__bar-fill" style={{ width: `${data?.consistencyScore ?? 0}%` }} />
        </div>
      </div>

      {/* CTA */}
      <Link to="/app/tasks" className="streaks__cta">
        <Zap size={16} /> Complete Today's Tasks
      </Link>
    </div>
  );
}
