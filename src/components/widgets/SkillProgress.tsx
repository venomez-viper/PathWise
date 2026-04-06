import { useMemo } from 'react';
import { Target } from 'lucide-react';
import type { Task } from './types';
import { CATEGORY_LABELS, CATEGORY_COLORS, widgetTitleStyle } from './types';

interface SkillProgressProps {
  tasks: Task[];
}

export default function SkillProgress({ tasks }: SkillProgressProps) {
  const skillProgress = useMemo(() => {
    const cats: Record<string, { done: number; total: number }> = {};
    tasks.forEach(t => {
      const cat = t.category || 'uncategorized';
      if (!cats[cat]) cats[cat] = { done: 0, total: 0 };
      cats[cat].total++;
      if (t.status === 'done') cats[cat].done++;
    });
    return Object.entries(cats).map(([cat, data]) => ({ category: cat, ...data }));
  }, [tasks]);

  if (skillProgress.length === 0) return null;

  return (
    <div className="panel" style={{ borderRadius: '1.5rem', padding: '1.1rem 1.2rem' }}>
      <h4 style={widgetTitleStyle}>
        <Target size={15} color="#8b4f2c" /> Skill Progress
      </h4>
      <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {skillProgress.map(({ category, done: catDone, total: catTotal }) => {
          const catPct = catTotal > 0 ? Math.round((catDone / catTotal) * 100) : 0;
          const color = CATEGORY_COLORS[category] || '#8b4f2c';
          return (
            <div key={category}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--on-surface)', textTransform: 'capitalize' }}>
                  {CATEGORY_LABELS[category] ?? category}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)' }}>
                  {catDone}/{catTotal}
                </span>
              </div>
              <div style={{
                height: 6, borderRadius: 3, background: 'var(--surface-container)',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%', borderRadius: 3, background: color,
                  width: `${catPct}%`, transition: 'width 0.5s ease',
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
