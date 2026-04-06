import { useState, useEffect } from 'react';
import { Flame } from 'lucide-react';
import { widgetTitleStyle } from './types';
import { streaks as streaksApi } from '../../lib/api';

interface StreakWidgetProps {
  userId: string;
}

export default function StreakWidget({ userId }: StreakWidgetProps) {
  const [streakData, setStreakData] = useState<any>(null);

  useEffect(() => {
    if (!userId) return;
    streaksApi.get(userId).then((data: any) => {
      setStreakData(data);
    }).catch(() => {});
  }, [userId]);

  return (
    <div className="panel" style={{ borderRadius: '1.5rem', padding: '1.1rem 1.2rem' }}>
      <h4 style={widgetTitleStyle}>
        <Flame size={15} color="#ef4444" /> Streak
      </h4>
      <div style={{ marginTop: 10 }}>
        {streakData ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#8b4f2c', fontFamily: 'var(--font-display)' }}>
                  {streakData.currentStreak ?? streakData.streak?.currentStreak ?? 0}
                </span>
                <p style={{ fontSize: '0.68rem', color: 'var(--on-surface-variant)', margin: '2px 0 0', fontWeight: 600 }}>CURRENT</p>
              </div>
              <div style={{ width: 1, height: 32, background: 'var(--outline-variant)' }} />
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#006a62', fontFamily: 'var(--font-display)' }}>
                  {streakData.bestStreak ?? streakData.streak?.bestStreak ?? 0}
                </span>
                <p style={{ fontSize: '0.68rem', color: 'var(--on-surface-variant)', margin: '2px 0 0', fontWeight: 600 }}>BEST</p>
              </div>
            </div>
            {/* 7-day indicator */}
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
              {Array.from({ length: 7 }).map((_, i) => {
                const activeDays = streakData.activeDays ?? streakData.streak?.activeDays ?? [];
                const isActive = i < (streakData.currentStreak ?? streakData.streak?.currentStreak ?? 0) || activeDays[i];
                return (
                  <div
                    key={i}
                    style={{
                      width: 10, height: 10, borderRadius: '50%',
                      background: isActive ? '#8b4f2c' : 'var(--surface-container)',
                      border: `1.5px solid ${isActive ? '#8b4f2c' : 'var(--outline-variant)'}`,
                      transition: 'background 0.2s',
                    }}
                  />
                );
              })}
            </div>
          </>
        ) : (
          <p style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)' }}>Loading streak data...</p>
        )}
      </div>
    </div>
  );
}
