import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, AlertTriangle, CheckCircle2, GraduationCap, ArrowRight, Loader2, Target, Sparkles } from 'lucide-react';
import { useAuth } from '../../lib/auth-context';
import { assessment as assessmentApi, roadmap as roadmapApi } from '../../lib/api';

type SkillGap = { skill: string; importance: 'high' | 'medium' | 'low'; learningResource: string };
type CareerMatch = { title: string; matchScore: number; description: string };
type SkillStatus = 'not_started' | 'learning' | 'done';

const STORAGE_KEY = 'pathwise_skill_progress';

const IMPORTANCE_CONFIG = {
  high:   { label: 'High Priority',   color: '#f87171', bg: 'rgba(248,113,113,0.1)' },
  medium: { label: 'Medium Priority',  color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  low:    { label: 'Lower Priority',   color: '#34d399', bg: 'rgba(52,211,153,0.1)' },
};

export default function SkillGaps() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([]);
  const [currentSkills, setCurrentSkills] = useState<string[]>([]);
  const [careerMatches, setCareerMatches] = useState<CareerMatch[]>([]);
  const [targetRole, setTargetRole] = useState<string | null>(null);

  const [certs, setCerts] = useState<any[]>([]);
  const [certsLoading, setCertsLoading] = useState(false);
  const [certsError, setCertsError] = useState('');
  const [certsVisible, setCertsVisible] = useState(false);

  const [skillProgress, setSkillProgress] = useState<Record<string, SkillStatus>>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}'); } catch { return {}; }
  });

  async function handleFindCertificates() {
    if (!user || skillGaps.length === 0) return;
    setCertsLoading(true);
    setCertsError('');
    setCertsVisible(true);
    try {
      const res = await assessmentApi.getCertificates({
        userId: user.id,
        skills: skillGaps.map(g => g.skill),
        targetRole: careerMatches[0]?.title ?? targetRole ?? 'your target role',
      }) as any;
      setCerts(res.recommendations ?? []);
    } catch (err) {
      setCertsError(err instanceof Error ? err.message : 'Failed to fetch recommendations');
    } finally {
      setCertsLoading(false);
    }
  }

  function setSkillStatus(skill: string, status: SkillStatus) {
    const updated = { ...skillProgress, [skill]: status };
    setSkillProgress(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  useEffect(() => {
    if (!user) return;
    Promise.allSettled([
      assessmentApi.getResult(user.id),
      roadmapApi.get(user.id),
    ]).then(([assessRes, roadmapRes]) => {
      const result = assessRes.status === 'fulfilled' ? (assessRes.value as any).result : null;
      const roadmapData = roadmapRes.status === 'fulfilled' ? (roadmapRes.value as any).roadmap : null;
      setSkillGaps(result?.skillGaps ?? []);
      setCurrentSkills(result?.currentSkills ?? []);
      setCareerMatches(result?.careerMatches ?? []);
      setTargetRole(roadmapData?.targetRole ?? null);
      setLoading(false);
    });
  }, [user]);

  // Loading state
  if (loading) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
        <Loader2 size={28} color="var(--primary)" style={{ animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  // Empty state — no assessment taken yet
  if (skillGaps.length === 0 && currentSkills.length === 0 && careerMatches.length === 0) {
    return (
      <div className="page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Skill Gap Analysis</h1>
            <p className="page-subtitle">See exactly what skills to build for your target role.</p>
          </div>
        </div>
        <div className="panel" style={{ textAlign: 'center', padding: '3rem' }}>
          <GraduationCap size={36} color="var(--on-surface-variant)" style={{ margin: '0 auto 12px', display: 'block' }} />
          <p style={{ fontWeight: 700, color: 'var(--on-surface)', marginBottom: 8, fontSize: '1.05rem' }}>
            Complete the career assessment first
          </p>
          <p style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)', marginBottom: 20, maxWidth: 380, margin: '0 auto 20px' }}>
            Take the assessment to discover your current skills, identify gaps, and get personalised learning recommendations.
          </p>
          <Link to="/app/assessment" className="btn-page-action" style={{ display: 'inline-flex' }}>
            <Sparkles size={14} /> Take Assessment
          </Link>
        </div>
      </div>
    );
  }

  // Group skill gaps by importance
  const grouped = {
    high:   skillGaps.filter(g => g.importance === 'high'),
    medium: skillGaps.filter(g => g.importance === 'medium'),
    low:    skillGaps.filter(g => g.importance === 'low'),
  };

  // Derived stat counts
  const totalGaps = skillGaps.length;
  const highPriority = grouped.high.length;
  const inProgressCount = skillGaps.filter(g => skillProgress[g.skill] === 'learning').length;
  const completedCount = skillGaps.filter(g => skillProgress[g.skill] === 'done').length;

  const topMatch = careerMatches.length > 0 ? careerMatches[0] : null;

  return (
    <div className="page">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Skill Gap Analysis</h1>
          <p className="page-subtitle">See exactly what skills to build for your target role.</p>
        </div>
      </div>

      {/* Stat tiles */}
      <div className="stats-grid">
        {/* Total Gaps */}
        <div className="stat-tile">
          <div className="stat-tile__icon" style={{ background: 'rgba(167,139,250,0.12)' }}>
            <BookOpen size={18} color="#a78bfa" />
          </div>
          <div className="stat-tile__body">
            <span className="stat-tile__label">Total Gaps</span>
            <span className="stat-tile__value">{totalGaps}</span>
          </div>
        </div>

        {/* High Priority */}
        <div className="stat-tile">
          <div className="stat-tile__icon" style={{ background: 'rgba(248,113,113,0.12)' }}>
            <AlertTriangle size={18} color="#f87171" />
          </div>
          <div className="stat-tile__body">
            <span className="stat-tile__label">High Priority</span>
            <span className="stat-tile__value">{highPriority}</span>
          </div>
        </div>

        {/* In Progress */}
        <div className="stat-tile">
          <div className="stat-tile__icon" style={{ background: 'rgba(245,158,11,0.12)' }}>
            <Loader2 size={18} color="#f59e0b" />
          </div>
          <div className="stat-tile__body">
            <span className="stat-tile__label">In Progress</span>
            <span className="stat-tile__value">{inProgressCount}</span>
          </div>
        </div>

        {/* Completed */}
        <div className="stat-tile">
          <div className="stat-tile__icon" style={{ background: 'rgba(52,211,153,0.12)' }}>
            <CheckCircle2 size={18} color="#34d399" />
          </div>
          <div className="stat-tile__body">
            <span className="stat-tile__label">Completed</span>
            <span className="stat-tile__value">{completedCount}</span>
          </div>
        </div>
      </div>

      {/* Find Certificates button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button
          onClick={handleFindCertificates}
          disabled={certsLoading || skillGaps.length === 0}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '0.6rem 1.25rem',
            background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
            color: '#fff', border: 'none', borderRadius: 'var(--radius-full)',
            fontSize: '0.875rem', fontWeight: 600, cursor: certsLoading ? 'not-allowed' : 'pointer',
            opacity: (certsLoading || skillGaps.length === 0) ? 0.6 : 1,
          }}
        >
          {certsLoading
            ? <><Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Finding certificates...</>
            : <><Sparkles size={14} /> Find Recommended Certificates</>
          }
        </button>
      </div>

      {/* Main two-column layout */}
      <div className="dashboard-grid">
        {/* Left: Skill Gaps List */}
        <div className="panel">
          <div className="panel__header" style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Target size={16} color="var(--primary)" />
              <h2 className="panel__title">Skill Gaps</h2>
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)' }}>
              {totalGaps} {totalGaps === 1 ? 'skill' : 'skills'} to develop
            </span>
          </div>

          {(['high', 'medium', 'low'] as const).map(level => {
            const items = grouped[level];
            if (items.length === 0) return null;
            const config = IMPORTANCE_CONFIG[level];

            return (
              <div key={level} style={{ marginBottom: 20 }}>
                {/* Group header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '6px 10px',
                    background: config.bg,
                    borderRadius: 8,
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: config.color,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: config.color,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {config.label} ({items.length})
                  </span>
                </div>

                {/* Skill cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {items.map(gap => {
                    const status = skillProgress[gap.skill] ?? 'not_started';
                    const isDone = status === 'done';
                    const isLearning = status === 'learning';

                    return (
                      <div
                        key={gap.skill}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 12,
                          padding: '12px',
                          borderRadius: 10,
                          background: 'var(--surface-container-low)',
                          border: '1px solid var(--outline-variant)',
                          transition: 'background 0.15s',
                        }}
                      >
                        {/* Importance dot */}
                        <div
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            background: config.color,
                            flexShrink: 0,
                            marginTop: 4,
                          }}
                        />

                        {/* Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p
                            style={{
                              fontSize: '0.875rem',
                              fontWeight: 650,
                              color: 'var(--on-surface)',
                              textDecoration: isDone ? 'line-through' : 'none',
                              opacity: isDone ? 0.6 : 1,
                              marginBottom: 2,
                            }}
                          >
                            {gap.skill}
                          </p>
                          <p
                            style={{
                              fontSize: '0.78rem',
                              color: 'var(--on-surface-variant)',
                              lineHeight: 1.4,
                              marginBottom: 8,
                            }}
                          >
                            {gap.learningResource}
                          </p>

                          {/* Status toggle buttons */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            {status === 'not_started' && (
                              <button
                                onClick={() => setSkillStatus(gap.skill, 'learning')}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  padding: '4px 12px',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  color: 'var(--primary)',
                                  background: 'transparent',
                                  border: '1.5px solid var(--primary)',
                                  borderRadius: 999,
                                  cursor: 'pointer',
                                  transition: 'background 0.15s, color 0.15s',
                                }}
                                onMouseEnter={e => { (e.target as HTMLButtonElement).style.background = 'rgba(167,139,250,0.1)'; }}
                                onMouseLeave={e => { (e.target as HTMLButtonElement).style.background = 'transparent'; }}
                              >
                                <ArrowRight size={12} /> Start Learning
                              </button>
                            )}

                            {isLearning && (
                              <>
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 4,
                                    padding: '3px 10px',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    color: '#3b82f6',
                                    background: 'rgba(59,130,246,0.1)',
                                    borderRadius: 999,
                                    letterSpacing: '0.02em',
                                  }}
                                >
                                  <Loader2 size={11} /> In Progress
                                </span>
                                <button
                                  onClick={() => setSkillStatus(gap.skill, 'done')}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 4,
                                    padding: '4px 12px',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    color: '#34d399',
                                    background: 'transparent',
                                    border: '1.5px solid #34d399',
                                    borderRadius: 999,
                                    cursor: 'pointer',
                                    transition: 'background 0.15s',
                                  }}
                                  onMouseEnter={e => { (e.target as HTMLButtonElement).style.background = 'rgba(52,211,153,0.1)'; }}
                                  onMouseLeave={e => { (e.target as HTMLButtonElement).style.background = 'transparent'; }}
                                >
                                  <CheckCircle2 size={12} /> Mark Done
                                </button>
                              </>
                            )}

                            {isDone && (
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  padding: '3px 10px',
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  color: '#34d399',
                                  background: 'rgba(52,211,153,0.1)',
                                  borderRadius: 999,
                                  letterSpacing: '0.02em',
                                }}
                              >
                                <CheckCircle2 size={11} /> Completed
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right column */}
        <div className="dashboard-right">
          {/* Current Skills */}
          <div className="panel">
            <div className="panel__header">
              <h2 className="panel__title">Your Current Skills</h2>
              <span style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)' }}>{currentSkills.length}</span>
            </div>

            {currentSkills.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)', padding: '0.5rem 0' }}>
                No skills recorded yet — take the assessment.
              </p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {currentSkills.map(skill => (
                  <span
                    key={skill}
                    style={{
                      background: 'rgba(167,139,250,0.1)',
                      border: '1px solid rgba(167,139,250,0.2)',
                      color: '#a78bfa',
                      padding: '4px 12px',
                      borderRadius: 999,
                      fontSize: '0.8rem',
                      fontWeight: 600,
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Top Career Match */}
          {topMatch && (
            <div className="panel" style={{ background: 'linear-gradient(135deg, rgba(167,139,250,0.06) 0%, rgba(52,211,153,0.06) 100%)' }}>
              <p className="panel__eyebrow">TOP CAREER MATCH</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '10px 0 8px' }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    border: '1.5px solid rgba(167,139,250,0.3)',
                    background: 'rgba(167,139,250,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-display)',
                    fontSize: '1rem',
                    fontWeight: 800,
                    color: '#a78bfa',
                    flexShrink: 0,
                  }}
                >
                  {topMatch.matchScore}%
                </div>
                <div>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--on-surface)' }}>
                    {topMatch.title}
                  </p>
                </div>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', lineHeight: 1.5, marginBottom: 12 }}>
                {topMatch.description}
              </p>
              <Link to="/app/roadmap" className="panel-link">
                Build roadmap for this role <ArrowRight size={13} />
              </Link>
            </div>
          )}

          {/* Target role quick info */}
          {targetRole && (
            <div className="panel">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Target size={15} color="var(--primary)" />
                <p className="panel__eyebrow">ACTIVE ROADMAP TARGET</p>
              </div>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: 'var(--on-surface)' }}>
                {targetRole}
              </p>
              <Link to="/app/roadmap" className="panel-link">
                View roadmap <ArrowRight size={13} />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Certificate recommendations section */}
      {certsVisible && (
        <div style={{ marginTop: '1.5rem' }}>
          <div className="panel">
            <div className="panel__header">
              <h2 className="panel__title">Recommended Certificates</h2>
              <span style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)' }}>AI-curated for your skill gaps</span>
            </div>

            {certsLoading && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem', gap: 12 }}>
                <Loader2 size={24} color="var(--primary)" style={{ animation: 'spin 0.8s linear infinite' }} />
                <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.9rem' }}>Claude is searching for the best certificates for your profile...</p>
              </div>
            )}

            {certsError && (
              <p style={{ color: '#ef4444', fontSize: '0.875rem', padding: '1rem 0' }}>{certsError}</p>
            )}

            {!certsLoading && certs.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
                {certs.map((cert, i) => (
                  <div key={i} style={{
                    background: 'var(--surface-container-low)',
                    border: '1px solid var(--outline-variant)',
                    borderRadius: 'var(--radius-xl)',
                    padding: '1.25rem',
                    display: 'flex', flexDirection: 'column', gap: 8,
                  }}>
                    {/* Provider + level badges */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                        color: '#a78bfa', background: 'rgba(167,139,250,0.12)',
                        padding: '2px 8px', borderRadius: 999,
                      }}>{cert.provider}</span>
                      <span style={{
                        fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase',
                        color: cert.cost === 'Free' || cert.cost?.toLowerCase().includes('free') ? '#34d399' : '#f59e0b',
                        background: cert.cost === 'Free' || cert.cost?.toLowerCase().includes('free') ? 'rgba(52,211,153,0.12)' : 'rgba(245,158,11,0.12)',
                        padding: '2px 8px', borderRadius: 999,
                      }}>{cert.cost}</span>
                      <span style={{
                        fontSize: '0.68rem', fontWeight: 600, color: 'var(--on-surface-variant)',
                        background: 'var(--surface-container-high)',
                        padding: '2px 8px', borderRadius: 999,
                      }}>{cert.level}</span>
                    </div>

                    {/* Cert name */}
                    <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--on-surface)', lineHeight: 1.3 }}>
                      {cert.certName}
                    </p>

                    {/* Skill tag */}
                    <p style={{ fontSize: '0.72rem', color: 'var(--on-surface-variant)', margin: 0 }}>
                      Covers: <strong style={{ color: 'var(--on-surface)' }}>{cert.skill}</strong> · {cert.duration}
                    </p>

                    {/* Why recommended */}
                    <p style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)', lineHeight: 1.5, margin: 0 }}>
                      {cert.whyRecommended}
                    </p>

                    {/* Link */}
                    <a
                      href={cert.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        fontSize: '0.8rem', fontWeight: 600, color: '#a78bfa',
                        marginTop: 4, textDecoration: 'none',
                      }}
                    >
                      View Certificate →
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
