import { useState, useEffect } from 'react';
import { Clock, TrendingUp, Pencil, Zap, GraduationCap, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../lib/auth-context';
import { roadmap as roadmapApi, assessment as assessmentApi } from '../../lib/api';

const IMPORTANCE_COLOR: Record<string, string> = {
  high: '#f87171',
  medium: '#f59e0b',
  low: '#34d399',
};

export default function Roadmap() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [skillGaps, setSkillGaps] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    Promise.allSettled([
      roadmapApi.get(user.id),
      assessmentApi.getResult(user.id),
    ]).then(([roadmapRes, assessRes]) => {
      if (cancelled) return;
      const roadmap = roadmapRes.status === 'fulfilled' ? (roadmapRes.value as any).roadmap : null;
      const gaps = assessRes.status === 'fulfilled'
        ? ((assessRes.value as any).result?.skillGaps ?? [])
        : [];
      setData(roadmap);
      setSkillGaps(gaps);
      setLoading(false);
      setTimeout(() => setMounted(true), 100);
    });

    return () => { cancelled = true; };
  }, [user]);

  if (loading) return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <Loader2 size={28} color="var(--primary)" style={{ animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  if (!data) return (
    <div className="page">
      <div className="page-header">
        <div><h1 className="page-title">Career Roadmap</h1><p className="page-subtitle">Build your path to your dream role.</p></div>
      </div>
      <div className="panel" style={{ textAlign: 'center', padding: '3rem' }}>
        <AlertCircle size={32} color="var(--on-surface-variant)" style={{ margin: '0 auto 12px' }} />
        <p style={{ fontWeight: 600, color: 'var(--on-surface)', marginBottom: 8 }}>No roadmap yet</p>
        <p style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)', marginBottom: 16 }}>Complete onboarding to generate your personalised career roadmap.</p>
        <Link to="/app/onboarding" className="btn-page-action">Start Onboarding</Link>
      </div>
    </div>
  );

  const completionPct = data.completionPercent ?? 0;
  const MILESTONE_COLOR: Record<string, string> = { completed: '#34d399', in_progress: '#a78bfa', locked: 'var(--outline-variant)' };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Career Roadmap</h1>
          <p className="page-subtitle">Your personalised path to {data.targetRole}.</p>
        </div>
        <Link to="/app/onboarding" className="btn-page-secondary"><Pencil size={14} /> Change Role</Link>
      </div>

      <div className="roadmap-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="panel">
            <p className="panel__eyebrow">CURRENT TARGET</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '8px 0 12px' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--on-surface)' }}>
                {data.targetRole}
              </h2>
              <div className="roadmap-progress-ring">
                <svg width="64" height="64" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="26" fill="none" stroke="var(--surface-container-high)" strokeWidth="6" />
                  <circle cx="32" cy="32" r="26" fill="none" stroke="#a78bfa" strokeWidth="6"
                    strokeLinecap="round" strokeDasharray={163.4}
                    strokeDashoffset={mounted ? 163.4 * (1 - completionPct / 100) : 163.4}
                    style={{ transform: 'rotate(-90deg)', transformOrigin: '32px 32px', transition: 'stroke-dashoffset 1s ease' }}
                  />
                </svg>
                <span className="roadmap-progress-label">{completionPct}%</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span className="tag"><Clock size={12} /> {data.milestones?.length ?? 0} milestones</span>
              <span className="tag tag--teal"><TrendingUp size={12} /> {data.milestones?.filter((m: any) => m.status === 'completed').length ?? 0} completed</span>
            </div>
          </div>

          <div className="panel">
            <div className="panel__header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={16} color="#f59e0b" />
                <h2 className="panel__title">Skill Gaps</h2>
              </div>
              {skillGaps.length > 0 && (
                <span className="badge-pill badge-pill--warning">Action needed</span>
              )}
            </div>

            {skillGaps.length === 0 ? (
              <div style={{ padding: '1rem 0', textAlign: 'center' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)', marginBottom: 10 }}>
                  Take the career assessment to see your personalised skill gaps.
                </p>
                <Link to="/app/assessment" style={{ fontSize: '0.82rem', color: '#a78bfa', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  Take Assessment <ChevronRight size={13} />
                </Link>
              </div>
            ) : skillGaps.slice(0, 5).map((gap: any) => (
              <div className="skill-gap-row" key={gap.skill}>
                <div className="skill-gap-row__icon"><GraduationCap size={16} color="#a78bfa" /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <p className="skill-gap-row__title">{gap.skill}</p>
                    <span style={{
                      fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
                      color: IMPORTANCE_COLOR[gap.importance] ?? '#a78bfa',
                      background: `${IMPORTANCE_COLOR[gap.importance] ?? '#a78bfa'}18`,
                      padding: '1px 6px', borderRadius: 999,
                    }}>{gap.importance}</span>
                  </div>
                  <p className="skill-gap-row__desc">{gap.learningResource}</p>
                </div>
                <ChevronRight size={15} color="var(--on-surface-variant)" />
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel__header">
            <h2 className="panel__title">Milestones</h2>
            <span style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)' }}>{data.milestones?.length ?? 0} total</span>
          </div>
          {(data.milestones ?? []).map((m: any, i: number) => (
            <div key={m.id} className="path-item" style={{ borderLeftColor: MILESTONE_COLOR[m.status], marginBottom: '8px', opacity: m.status === 'locked' ? 0.5 : 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <p className="path-item__title">{i + 1}. {m.title}</p>
                <span className="priority-tag" style={{
                  color: MILESTONE_COLOR[m.status],
                  background: `${MILESTONE_COLOR[m.status]}18`,
                  fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', padding: '2px 8px', borderRadius: '999px',
                }}>{m.status.replace('_', ' ')}</span>
              </div>
              <p className="path-item__meta">{m.description}</p>
              {m.dueDate && <p className="path-item__meta" style={{ marginTop: '3px' }}>Due: {new Date(m.dueDate).toLocaleDateString()}</p>}
            </div>
          ))}
          {(!data.milestones || data.milestones.length === 0) && (
            <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem', padding: '1rem 0' }}>No milestones yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
