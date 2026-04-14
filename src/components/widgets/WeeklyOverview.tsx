import { useMemo } from 'react';
import { BarChart3 } from 'lucide-react';
import type { Task } from './types';
import { widgetTitleStyle } from './types';

interface WeeklyOverviewProps {
  tasks: Task[];
}

export default function WeeklyOverview({ tasks }: WeeklyOverviewProps) {
  const weeklyData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon, ...
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);

    const counts = new Array(7).fill(0);
    tasks.forEach(t => {
      if (t.status === 'done' && t.completedAt) {
        const d = new Date(t.completedAt);
        const diff = Math.floor((d.getTime() - monday.getTime()) / (1000 * 60 * 60 * 24));
        if (diff >= 0 && diff < 7) counts[diff]++;
      }
    });
    const max = Math.max(...counts, 1);
    return days.map((day, i) => ({ day, count: counts[i], pct: (counts[i] / max) * 100 }));
  }, [tasks]);

  const hasWeeklyActivity = weeklyData.some(d => d.count > 0);

  return (
    <div className="panel" style={{ borderRadius: '1.5rem', padding: '1.1rem 1.2rem' }}>
      <h4 style={widgetTitleStyle}>
        <BarChart3 size={15} color="var(--copper)" /> Weekly Overview
      </h4>
      <div style={{ marginTop: 10 }}>
        {hasWeeklyActivity ? (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 60 }}>
            {weeklyData.map(d => (
              <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{
                  width: '100%', maxWidth: 24, borderRadius: 3,
                  background: d.count > 0 ? 'var(--copper)' : 'var(--surface-container)',
                  height: `${Math.max(d.pct, d.count > 0 ? 15 : 4)}%`,
                  minHeight: 3,
                  transition: 'height 0.4s ease',
                }} />
                <span style={{ fontSize: '0.6rem', color: 'var(--on-surface-variant)', fontWeight: 600 }}>
                  {d.day}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)', textAlign: 'center', padding: '0.5rem 0' }}>
            Complete tasks to see your weekly activity
          </p>
        )}
      </div>
    </div>
  );
}
