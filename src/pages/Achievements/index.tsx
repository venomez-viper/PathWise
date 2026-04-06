import { useState, useEffect, type JSX } from 'react';
import { Lock, Loader2 } from 'lucide-react';
import { useAuth } from '../../lib/auth-context';
import { achievements as achievementsApi } from '../../lib/api';
import './Achievements.css';

/* ─────────────────────────────────────────────
   SVG Badge Icons — Apple Fitness-inspired
───────────────────────────────────────────── */

const BADGE_CONFIG: Record<string, { icon: JSX.Element; color: string; ringColor: string }> = {
  first_steps: {
    // Compass — career orientation
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="currentColor" stroke="none" />
      </svg>
    ),
    color: '#006a62',
    ringColor: 'rgba(0, 106, 98, 0.15)',
  },
  roadmap_starter: {
    // Map with pin — first roadmap
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3V6z" />
        <circle cx="15" cy="10" r="2" fill="currentColor" stroke="none" />
        <path d="M15 12v2" />
      </svg>
    ),
    color: '#2563eb',
    ringColor: 'rgba(37, 99, 235, 0.15)',
  },
  streak_7: {
    // Flame with 7 — weekly streak
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2c.5 3.5-1 5.5-1 8a5 5 0 0 0 10 0c0-4-3-6-4-9-1 2-2.5 3-3 4" />
        <text x="12" y="17" textAnchor="middle" fontSize="7" fontWeight="800" fill="currentColor" stroke="none" fontFamily="var(--font-display)">7</text>
      </svg>
    ),
    color: '#f59e0b',
    ringColor: 'rgba(245, 158, 11, 0.15)',
  },
  skill_master: {
    // Target with checkmark — 5 tasks done
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
        <path d="M9 12l2 2 4-4" strokeWidth="2.5" />
      </svg>
    ),
    color: '#6245a4',
    ringColor: 'rgba(98, 69, 164, 0.15)',
  },
  networker: {
    // Connected nodes — networking
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="5" r="2.5" />
        <circle cx="5" cy="17" r="2.5" />
        <circle cx="19" cy="17" r="2.5" />
        <line x1="12" y1="7.5" x2="5" y2="14.5" />
        <line x1="12" y1="7.5" x2="19" y2="14.5" />
        <line x1="7.5" y1="17" x2="16.5" y2="17" />
      </svg>
    ),
    color: '#8b4f2c',
    ringColor: 'rgba(139, 79, 44, 0.15)',
  },
  interview_ready: {
    // Microphone with stars — interview prep
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="2" width="6" height="11" rx="3" />
        <path d="M5 10a7 7 0 0 0 14 0" />
        <line x1="12" y1="17" x2="12" y2="21" />
        <line x1="9" y1="21" x2="15" y2="21" />
        <circle cx="19" cy="5" r="0.8" fill="currentColor" stroke="none" />
        <circle cx="20.5" cy="8" r="0.6" fill="currentColor" stroke="none" />
        <circle cx="17.5" cy="3" r="0.5" fill="currentColor" stroke="none" />
      </svg>
    ),
    color: '#334042',
    ringColor: 'rgba(51, 64, 66, 0.15)',
  },
  path_finisher: {
    // Trophy with laurel — 100% complete
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 21h8" />
        <path d="M12 17v4" />
        <path d="M7 4h10v5a5 5 0 0 1-10 0V4z" />
        <path d="M7 7H4a1 1 0 0 0-1 1v1a3 3 0 0 0 3 3h1" />
        <path d="M17 7h3a1 1 0 0 1 1 1v1a3 3 0 0 1-3 3h-1" />
        <path d="M5 19c1-1 1.5-3 1.5-5" />
        <path d="M19 19c-1-1-1.5-3-1.5-5" />
      </svg>
    ),
    color: '#f59e0b',
    ringColor: 'rgba(245, 158, 11, 0.15)',
  },
  top_contributor: {
    // Star with sparkles — community
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        <line x1="20" y1="3" x2="20" y2="5" strokeWidth="1.5" />
        <line x1="19" y1="4" x2="21" y2="4" strokeWidth="1.5" />
        <line x1="4" y1="14" x2="4" y2="16" strokeWidth="1.5" />
        <line x1="3" y1="15" x2="5" y2="15" strokeWidth="1.5" />
      </svg>
    ),
    color: '#006a62',
    ringColor: 'rgba(0, 106, 98, 0.15)',
  },
  task_10: {
    // Lightning bolt with 10 — 10 tasks
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L4 14h7l-2 8 9-12h-7l2-8z" fill="currentColor" fillOpacity="0.15" />
        <path d="M13 2L4 14h7l-2 8 9-12h-7l2-8z" />
      </svg>
    ),
    color: '#2563eb',
    ringColor: 'rgba(37, 99, 235, 0.15)',
  },
  task_25: {
    // Rocket launching — 25 tasks
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C6.5 6 4 11 4 16l4-1 4 5 4-5 4 1c0-5-2.5-10-8-14z" />
        <circle cx="12" cy="11" r="2" />
        <path d="M7 20l-2 2" />
        <path d="M17 20l2 2" />
      </svg>
    ),
    color: '#6245a4',
    ringColor: 'rgba(98, 69, 164, 0.15)',
  },
  early_bird: {
    // Sun rising over horizon — before 9 AM
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 18h18" />
        <path d="M12 14a5 5 0 0 1 5-5" />
        <path d="M12 14a5 5 0 0 0-5-5" />
        <path d="M7 14h10" />
        <line x1="12" y1="2" x2="12" y2="5" />
        <line x1="4.22" y1="6.22" x2="6.34" y2="8.34" />
        <line x1="19.78" y1="6.22" x2="17.66" y2="8.34" />
      </svg>
    ),
    color: '#f59e0b',
    ringColor: 'rgba(245, 158, 11, 0.15)',
  },
  milestone_3: {
    // Mountain peak with flag — 3 milestones
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 20L9 8l4 6 4-10 4 16H3z" />
        <line x1="17" y1="4" x2="17" y2="10" />
        <path d="M17 4l4 2-4 2" fill="currentColor" fillOpacity="0.2" />
        <path d="M17 4l4 2-4 2" />
      </svg>
    ),
    color: '#006a62',
    ringColor: 'rgba(0, 106, 98, 0.15)',
  },
};

const DEFAULT_BADGE = {
  icon: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4l3 3" />
    </svg>
  ),
  color: '#334042',
  ringColor: 'rgba(51, 64, 66, 0.15)',
};

function formatEarnedDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
}

export default function Achievements() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    achievementsApi
      .get(user.id)
      .then((res: any) => {
        setData(res);
        setLoading(false);
      })
      .catch(() => {
        setData({
          achievements: [],
          totalBadges: 12,
          earnedCount: 0,
          totalXp: 0,
          seasonProgress: { level: 'Beginner', currentXp: 0, nextLevelXp: 500 },
        });
        setLoading(false);
      });
  }, [user]);

  if (loading) {
    return (
      <div className="page achievements__loading">
        <Loader2 size={28} color="#006a62" className="achievements__spinner" />
      </div>
    );
  }

  const sp = data?.seasonProgress ?? { level: 'Beginner', currentXp: 0, nextLevelXp: 500 };
  const xpPct = Math.round((sp.currentXp / sp.nextLevelXp) * 100);
  const earnedCount = data?.earnedCount ?? 0;
  const totalXp = data?.totalXp ?? 0;

  return (
    <div className="page achievements">
      <h1 className="page-title">Your Achievements</h1>
      <p className="page-subtitle">
        Celebrating your growth and professional milestones. Each badge represents a step closer to your career goals.
      </p>

      {/* Season Progress */}
      <div className="achievements__season">
        <p className="achievements__season-eyebrow">Season Progress</p>
        <h2 className="achievements__season-title">{sp.level} Tier Achieved</h2>
        <div className="achievements__season-track">
          <div className="achievements__season-fill" style={{ width: `${xpPct}%` }} />
        </div>
        <p className="achievements__season-xp">
          {sp.currentXp} / {sp.nextLevelXp} XP to next level
        </p>
      </div>

      {/* Stats Row */}
      <div className="achievements__stats">
        <div className="achievements__stat-card">
          <div className="achievements__stat-value">{earnedCount}</div>
          <div className="achievements__stat-label">Badges Earned</div>
        </div>
        <div className="achievements__stat-card">
          <div className="achievements__stat-value">{totalXp.toLocaleString()}</div>
          <div className="achievements__stat-label">Total XP</div>
        </div>
        <div className="achievements__stat-card">
          <div className="achievements__stat-badge">{sp.level}</div>
          <div className="achievements__stat-label">Current Tier</div>
        </div>
      </div>

      {/* Badge Grid */}
      <div className="achievements__grid">
        {(data?.achievements ?? []).map((a: any) => {
          const earned = !!a.earnedAt;
          const cfg = BADGE_CONFIG[a.badgeKey] ?? DEFAULT_BADGE;

          return (
            <div
              key={a.badgeKey}
              className={`achievements__badge${earned ? '' : ' achievements__badge--locked'}`}
            >
              {/* Icon circle */}
              {earned ? (
                <div
                  className="achievements__icon-wrap achievements__icon-wrap--earned"
                  style={{ background: cfg.color, '--ring-color': cfg.ringColor } as React.CSSProperties}
                >
                  {cfg.icon}
                </div>
              ) : (
                <div className="achievements__icon-wrap achievements__icon-wrap--locked">
                  {cfg.icon}
                  <span className="achievements__lock-overlay">
                    <Lock size={10} />
                  </span>
                </div>
              )}

              {/* Badge info */}
              <p className="achievements__badge-title">{a.title}</p>

              {earned ? (
                <p className="achievements__badge-date">
                  Earned {formatEarnedDate(a.earnedAt)}
                </p>
              ) : (
                <>
                  <p className="achievements__badge-desc">{a.description}</p>
                  {a.progress != null && a.progressMax != null && (
                    <>
                      <p className="achievements__badge-progress">
                        {a.progress} / {a.progressMax} {a.progressLabel ?? ''}
                      </p>
                      <div className="achievements__progress-track">
                        <div
                          className="achievements__progress-fill"
                          style={{ width: `${Math.round((a.progress / a.progressMax) * 100)}%` }}
                        />
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
