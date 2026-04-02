import { useState, useEffect } from 'react';
import { Flame, TrendingUp, Zap, Loader2, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../lib/auth-context';
import { streaks as streaksApi } from '../../lib/api';

export default function Streaks() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    streaksApi.get(user.id).then((res: any) => { setData(res.streak); setLoading(false); })
      .catch(() => { setData({ currentStreak: 0, bestStreak: 0, consistencyScore: 0, weeklyProgress: [false,false,false,false,false,false,false] }); setLoading(false); });
  }, [user]);

  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const todayIdx = new Date().getDay();
  const todayMapped = todayIdx === 0 ? 6 : todayIdx - 1;

  if (loading) return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <Loader2 size={28} color="#8b4f2c" style={{ animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  return (
    <div className="page" style={{ maxWidth: 640 }}>
      <h1 className="page-title">Momentum</h1>
      <p className="page-subtitle">You're building momentum!</p>

      {/* Streak card */}
      <div className="panel" style={{ borderRadius: '2rem', padding: '2rem', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(0,106,98,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Flame size={24} color="var(--secondary)" />
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--on-surface)', display: 'flex', alignItems: 'center', gap: 8 }}>
              🔥 {data?.currentStreak ?? 0}-day streak
            </p>
            <p style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--on-surface-variant)' }}>
              Your Best: {data?.bestStreak ?? 0} Days
            </p>
          </div>
        </div>

        {/* Weekly progress */}
        <div style={{ marginTop: '1.5rem', background: 'var(--surface-container-low)', borderRadius: 'var(--radius-xl)', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--on-surface-variant)' }}>Weekly Progress</span>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--secondary)' }}>
              {data?.weeklyProgress?.filter(Boolean).length ?? 0}/7 Complete
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
            {days.map((d, i) => {
              const active = data?.weeklyProgress?.[i];
              const isToday = i === todayMapped;
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--on-surface-variant)' }}>{d}</span>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: active ? 'var(--secondary)' : isToday ? 'linear-gradient(135deg, var(--secondary), #5ef6e6)' : 'var(--surface-container)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: isToday ? '0 0 0 3px rgba(0,106,98,0.2)' : 'none',
                  }}>
                    {active ? <CheckCircle2 size={18} color="#fff" /> : isToday ? <Zap size={16} color="#fff" /> : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Power Hour */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary), var(--primary-container))',
        borderRadius: '2rem', padding: '1.5rem', marginBottom: '1.5rem', color: '#fff',
      }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 800 }}>Power Hour</h3>
        <p style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: 4, lineHeight: 1.5 }}>
          You're most active at 9:00 AM. Keep the morning momentum!
        </p>
      </div>

      {/* Consistency */}
      <div className="panel" style={{ borderRadius: '2rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem', color: 'var(--on-surface)' }}>Consistency</h3>
          <TrendingUp size={18} color="var(--secondary)" />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--on-surface-variant)' }}>Consistency Score</span>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--on-surface)' }}>{data?.consistencyScore ?? 0}%</span>
        </div>
        <div style={{ height: 6, background: 'var(--surface-container)', borderRadius: 999, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${data?.consistencyScore ?? 0}%`, background: 'var(--secondary)', borderRadius: 999, transition: 'width 0.8s ease' }} />
        </div>
      </div>

      {/* CTA */}
      <Link to="/app/tasks" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        width: '100%', padding: '0.85rem', borderRadius: 'var(--radius-full)',
        background: 'linear-gradient(135deg, #334042, #4a5759)', color: '#fff',
        fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none',
      }}>
        <Zap size={16} /> Complete Today's Tasks
      </Link>
    </div>
  );
}
