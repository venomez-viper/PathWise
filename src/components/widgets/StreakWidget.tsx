import { useState, useEffect } from 'react';
import { Flame, Zap } from 'lucide-react';
import { widgetTitleStyle } from './types';
import { streaks as streaksApi } from '../../lib/api';

interface StreakWidgetProps {
  userId: string;
}

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function StreakWidget({ userId }: StreakWidgetProps) {
  const [data, setData] = useState<any>(null);

  const load = () => {
    if (!userId) return;
    streaksApi.get(userId).then((res: any) => setData(res.streak ?? res)).catch(() => {});
  };

  useEffect(() => { load(); }, [userId]);

  // Refresh on focus
  useEffect(() => {
    const refresh = () => { if (document.visibilityState === 'visible') load(); };
    document.addEventListener('visibilitychange', refresh);
    window.addEventListener('focus', load);
    return () => {
      document.removeEventListener('visibilitychange', refresh);
      window.removeEventListener('focus', load);
    };
  }, [userId]);

  const currentStreak = data?.currentStreak ?? 0;
  const bestStreak = data?.bestStreak ?? 0;
  const weeklyProgress = data?.weeklyProgress ?? [];
  const todayIdx = new Date().getDay();
  const todayMapped = todayIdx === 0 ? 6 : todayIdx - 1;

  return (
    <div className="panel" style={{ borderRadius: '1.5rem', padding: '1.1rem 1.2rem' }}>
      <h4 style={widgetTitleStyle}>
        <Flame size={15} color="#ef4444" /> Streak
      </h4>
      <div style={{ marginTop: 10 }}>
        {data ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--copper)', fontFamily: 'var(--font-display)' }}>
                  {currentStreak}
                </span>
                <p style={{ fontSize: '0.68rem', color: 'var(--on-surface-variant)', margin: '2px 0 0', fontWeight: 600 }}>CURRENT</p>
              </div>
              <div style={{ width: 1, height: 32, background: 'var(--outline-variant)' }} />
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--secondary)', fontFamily: 'var(--font-display)' }}>
                  {bestStreak}
                </span>
                <p style={{ fontSize: '0.68rem', color: 'var(--on-surface-variant)', margin: '2px 0 0', fontWeight: 600 }}>BEST</p>
              </div>
            </div>
            {/* Weekly progress dots */}
            <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
              {DAYS.map((d, i) => {
                const active = weeklyProgress[i] ?? false;
                const isToday = i === todayMapped;
                return (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <span style={{ fontSize: '0.55rem', fontWeight: 600, color: 'var(--on-surface-muted)' }}>{d}</span>
                    <div style={{
                      width: 12, height: 12, borderRadius: '50%',
                      background: active ? 'var(--secondary)' : 'var(--surface-container)',
                      border: isToday && !active ? '1.5px solid var(--secondary)' : 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'background 0.2s',
                    }}>
                      {isToday && !active && <Zap size={6} color="var(--secondary)" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <p style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)' }}>Loading...</p>
        )}
      </div>
    </div>
  );
}
