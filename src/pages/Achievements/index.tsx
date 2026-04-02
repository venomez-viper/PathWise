import { useState, useEffect } from 'react';
import { Award, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '../../lib/auth-context';
import { achievements as achievementsApi } from '../../lib/api';

const BADGE_ICONS: Record<string, string> = {
  first_steps: '📍', roadmap_starter: '🗺️', streak_7: '🔥', skill_master: '🎯',
  networker: '🤝', interview_ready: '💼', path_finisher: '🏆', top_contributor: '⭐',
};

const BADGE_COLORS: Record<string, string> = {
  first_steps: '#8b4f2c', roadmap_starter: '#006a62', streak_7: '#f59e0b',
  skill_master: '#6245a4', networker: '#8b4f2c', interview_ready: '#334042',
  path_finisher: '#f59e0b', top_contributor: '#006a62',
};

export default function Achievements() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    achievementsApi.get(user.id).then((res: any) => { setData(res); setLoading(false); })
      .catch(() => { setData({ achievements: [], totalBadges: 8, earnedCount: 0, totalXp: 0, seasonProgress: { level: 'Beginner', currentXp: 0, nextLevelXp: 500 } }); setLoading(false); });
  }, [user]);

  if (loading) return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <Loader2 size={28} color="#8b4f2c" style={{ animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  const sp = data?.seasonProgress ?? { level: 'Beginner', currentXp: 0, nextLevelXp: 500 };
  const xpPct = Math.round((sp.currentXp / sp.nextLevelXp) * 100);

  return (
    <div className="page" style={{ maxWidth: 640 }}>
      <h1 className="page-title">Your Achievements</h1>
      <p className="page-subtitle">Celebrating your growth and professional milestones. Each badge represents a step closer to your career goals.</p>

      {/* Season Progress */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary), var(--primary-container))',
        borderRadius: '2rem', padding: '1.5rem', marginTop: '1.5rem', marginBottom: '1.5rem', color: '#fff',
      }}>
        <p style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6 }}>Season Progress</p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 800, marginTop: 4 }}>{sp.level} Tier Achieved</h2>
        <div style={{ marginTop: '0.75rem', height: 6, background: 'rgba(255,255,255,0.2)', borderRadius: 999, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${xpPct}%`, background: '#5ef6e6', borderRadius: 999, transition: 'width 0.8s ease' }} />
        </div>
        <p style={{ fontSize: '0.78rem', opacity: 0.7, marginTop: 6 }}>{sp.currentXp} / {sp.nextLevelXp} XP to next level</p>
      </div>

      {/* Total badges */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem' }}>
        <Award size={32} color="var(--on-surface-variant)" />
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--on-surface)', marginTop: 4 }}>{data?.earnedCount ?? 0}</p>
        <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--on-surface-variant)' }}>Total Badges</p>
      </div>

      {/* Badge grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {(data?.achievements ?? []).map((a: any) => {
          const earned = !!a.earnedAt;
          const color = BADGE_COLORS[a.badgeKey] || '#334042';
          return (
            <div key={a.badgeKey} className="panel" style={{
              borderRadius: '2rem', padding: '1.25rem', textAlign: 'center',
              opacity: earned ? 1 : 0.5,
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%', margin: '0 auto 8px',
                background: earned ? color : 'var(--surface-container)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
              }}>
                {earned ? (BADGE_ICONS[a.badgeKey] || '🏅') : <Lock size={18} color="var(--on-surface-variant)" />}
              </div>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', fontWeight: 800, color: 'var(--on-surface)', marginBottom: 4 }}>{a.title}</p>
              {earned ? (
                <p style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--secondary)' }}>
                  EARNED {a.earnedAt ? new Date(a.earnedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase() : ''}
                </p>
              ) : (
                <p style={{ fontSize: '0.72rem', color: 'var(--on-surface-variant)', lineHeight: 1.4 }}>
                  {a.description}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
