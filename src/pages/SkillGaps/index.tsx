import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, AlertTriangle, CheckCircle2, GraduationCap, ArrowRight, Loader2, Target, Sparkles, Code, Users, Briefcase, TrendingUp, Clock } from 'lucide-react';
import { useAuth } from '../../lib/auth-context';
import { assessment as assessmentApi, roadmap as roadmapApi } from '../../lib/api';
import { safeExternalUrl } from '../../lib/utils';

type SkillGap = { skill: string; importance: 'high' | 'medium' | 'low'; learningResource: string; scoreImpact?: number; learningHours?: number; roi?: number };
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

  const [careerRecs, setCareerRecs] = useState<{
    portfolio: any[];
    networking: any[];
    jobApplications: any[];
  } | null>(null);
  const [careerRecsLoading, setCareerRecsLoading] = useState(false);
  const [careerRecsError, setCareerRecsError] = useState('');
  const [careerRecsVisible, setCareerRecsVisible] = useState(false);

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

  async function handleCareerRecommendations() {
    if (!user || skillGaps.length === 0) return;
    setCareerRecsLoading(true);
    setCareerRecsError('');
    setCareerRecsVisible(true);
    try {
      const res = await assessmentApi.getCareerRecommendations({
        userId: user.id,
        skills: skillGaps.map((g: any) => g.skill),
        targetRole: careerMatches[0]?.title ?? targetRole ?? 'your target role',
        currentSkills: currentSkills,
      }) as any;
      setCareerRecs({
        portfolio: res.portfolio ?? [],
        networking: res.networking ?? [],
        jobApplications: res.jobApplications ?? [],
      });
    } catch (err) {
      setCareerRecsError(err instanceof Error ? err.message : 'Failed to fetch recommendations');
    } finally {
      setCareerRecsLoading(false);
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
          <Link to="/app/assessment-v2" className="btn-page-action" style={{ display: 'inline-flex' }}>
            <Sparkles size={14} /> Take Assessment
          </Link>
        </div>
      </div>
    );
  }

  // Sort skill gaps by ROI (descending), then importance as tiebreaker
  const sortedGaps = [...skillGaps].sort((a, b) => {
    const roiDiff = (b.roi ?? 0) - (a.roi ?? 0);
    if (roiDiff !== 0) return roiDiff;
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.importance] - order[b.importance];
  });

  // Group skill gaps by importance (for stat counts)
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

      {/* AI Recommendation buttons */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem', gap: 8, flexWrap: 'wrap' }}>
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
        <button
          onClick={handleCareerRecommendations}
          disabled={careerRecsLoading || skillGaps.length === 0}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '0.6rem 1.25rem',
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            color: '#fff', border: 'none', borderRadius: 'var(--radius-full)',
            fontSize: '0.875rem', fontWeight: 600,
            cursor: (careerRecsLoading || skillGaps.length === 0) ? 'not-allowed' : 'pointer',
            opacity: (careerRecsLoading || skillGaps.length === 0) ? 0.6 : 1,
          }}
        >
          {careerRecsLoading
            ? <><Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Generating...</>
            : <><Target size={14} /> Portfolio, Network & Jobs</>
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

          {/* Ranked by ROI header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 10px',
              background: 'rgba(167,139,250,0.08)',
              borderRadius: 8,
              marginBottom: 10,
            }}
          >
            <TrendingUp size={13} color="#a78bfa" />
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#a78bfa',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Ranked by ROI
            </span>
          </div>

          {/* Skill cards sorted by ROI */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {sortedGaps.map((gap, idx) => {
              const status = skillProgress[gap.skill] ?? 'not_started';
              const isDone = status === 'done';
              const isLearning = status === 'learning';
              const config = IMPORTANCE_CONFIG[gap.importance];
              const roiVal = gap.roi ?? 0;
              const roiLabel = roiVal >= 20 ? 'High ROI' : roiVal >= 8 ? 'Medium ROI' : 'Low ROI';
              const roiColor = roiVal >= 20 ? '#34d399' : roiVal >= 8 ? '#f59e0b' : '#94a3b8';
              const roiBg = roiVal >= 20 ? 'rgba(52,211,153,0.1)' : roiVal >= 8 ? 'rgba(245,158,11,0.1)' : 'rgba(148,163,184,0.1)';

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
                  {/* Rank number */}
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: idx < 3 ? 'rgba(167,139,250,0.15)' : 'var(--surface-container-high)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: idx < 3 ? '#a78bfa' : 'var(--on-surface-variant)' }}>
                      {idx + 1}
                    </span>
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
                      <p
                        style={{
                          fontSize: '0.875rem',
                          fontWeight: 650,
                          color: 'var(--on-surface)',
                          textDecoration: isDone ? 'line-through' : 'none',
                          opacity: isDone ? 0.6 : 1,
                          margin: 0,
                        }}
                      >
                        {gap.skill}
                      </p>
                      {/* Importance dot */}
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: config.color,
                          flexShrink: 0,
                        }}
                        title={config.label}
                      />
                    </div>

                    {/* ROI badges row */}
                    {gap.roi != null && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 3,
                            padding: '2px 8px',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            color: roiColor,
                            background: roiBg,
                            borderRadius: 999,
                            letterSpacing: '0.02em',
                          }}
                        >
                          <TrendingUp size={10} /> {roiLabel}
                        </span>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 3,
                            padding: '2px 8px',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            color: '#a78bfa',
                            background: 'rgba(167,139,250,0.1)',
                            borderRadius: 999,
                          }}
                        >
                          +{gap.scoreImpact} pts
                        </span>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 3,
                            padding: '2px 8px',
                            fontSize: '0.68rem',
                            fontWeight: 600,
                            color: 'var(--on-surface-variant)',
                            background: 'var(--surface-container-high)',
                            borderRadius: 999,
                          }}
                        >
                          <Clock size={10} /> {gap.learningHours}h
                        </span>
                      </div>
                    )}

                    <p
                      style={{
                        fontSize: '0.78rem',
                        color: 'var(--on-surface-variant)',
                        lineHeight: 1.4,
                        marginBottom: 8,
                      }}
                    >
                      {gap.learningResource.includes(' - https://') ? (() => {
                        const rIdx = gap.learningResource.lastIndexOf(' - https://');
                        const label = gap.learningResource.slice(0, rIdx);
                        const rawUrl = gap.learningResource.slice(rIdx + 3);
                        const url = safeExternalUrl(rawUrl);
                        if (!url) return gap.learningResource;
                        return (
                          <>
                            {label}{' - '}
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                color: 'var(--primary)',
                                textDecoration: 'underline',
                                fontWeight: 600,
                              }}
                            >
                              View Resource
                            </a>
                          </>
                        );
                      })() : gap.learningResource}
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
              <span style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)' }}>Curated for your skill gaps</span>
            </div>

            {certsLoading && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem', gap: 12 }}>
                <Loader2 size={24} color="var(--primary)" style={{ animation: 'spin 0.8s linear infinite' }} />
                <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.9rem' }}>Searching for the best certificates for your profile...</p>
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
                    {(() => {
                      const certHref = safeExternalUrl(cert.url);
                      if (!certHref) return null;
                      return (
                        <a
                          href={certHref}
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
                      );
                    })()}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Career recommendations: loading & error */}
      {careerRecsVisible && careerRecsLoading && (
        <div className="panel" style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '3rem' }}>
          <Loader2 size={24} color="var(--primary)" style={{ animation: 'spin 0.8s linear infinite' }} />
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.9rem' }}>Building your personalised career plan...</p>
        </div>
      )}
      {careerRecsVisible && careerRecsError && (
        <div className="panel" style={{ marginTop: '1.5rem', color: '#ef4444', fontSize: '0.875rem' }}>
          {careerRecsError}
        </div>
      )}

      {/* Portfolio & Projects */}
      {careerRecsVisible && careerRecs && careerRecs.portfolio.length > 0 && (
        <div style={{ marginTop: '1.5rem' }}>
          <div className="panel">
            <div className="panel__header" style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(167,139,250,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Code size={16} color="#a78bfa" />
                </div>
                <div>
                  <h2 className="panel__title">Portfolio Projects to Build</h2>
                  <p className="panel__sub">Role-specific projects to impress hiring managers</p>
                </div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '1rem' }}>
              {careerRecs.portfolio.map((item, i) => (
                <RecommendationCard key={i} item={item} accentColor="#a78bfa" accentBg="rgba(167,139,250,0.1)" />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Networking & Outreach */}
      {careerRecsVisible && careerRecs && careerRecs.networking.length > 0 && (
        <div style={{ marginTop: '1.5rem' }}>
          <div className="panel">
            <div className="panel__header" style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(94,246,230,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={16} color="#5ef6e6" />
                </div>
                <div>
                  <h2 className="panel__title">Networking & Outreach</h2>
                  <p className="panel__sub">Communities and connections to build your reputation</p>
                </div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '1rem' }}>
              {careerRecs.networking.map((item, i) => (
                <RecommendationCard key={i} item={item} accentColor="#5ef6e6" accentBg="rgba(94,246,230,0.08)" />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Job Application Targets */}
      {careerRecsVisible && careerRecs && careerRecs.jobApplications.length > 0 && (
        <div style={{ marginTop: '1.5rem' }}>
          <div className="panel">
            <div className="panel__header" style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(52,211,153,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Briefcase size={16} color="#34d399" />
                </div>
                <div>
                  <h2 className="panel__title">Job Application Targets</h2>
                  <p className="panel__sub">Where and how to apply for your target role</p>
                </div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '1rem' }}>
              {careerRecs.jobApplications.map((item, i) => (
                <RecommendationCard key={i} item={item} accentColor="#34d399" accentBg="rgba(52,211,153,0.08)" />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RecommendationCard({ item, accentColor, accentBg }: { item: any; accentColor: string; accentBg: string }) {
  return (
    <div style={{
      background: 'var(--surface-container-low)',
      border: '1px solid var(--outline-variant)',
      borderLeft: `3px solid ${accentColor}`,
      borderRadius: 'var(--radius-xl)',
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    }}>
      {/* Badges row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {item.platform && (
          <span style={{
            fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase',
            color: accentColor, background: accentBg,
            padding: '2px 8px', borderRadius: 999,
          }}>{item.platform}</span>
        )}
        {item.difficulty && (
          <span style={{
            fontSize: '0.68rem', fontWeight: 600,
            color: 'var(--on-surface-variant)', background: 'var(--surface-container-high)',
            padding: '2px 8px', borderRadius: 999,
          }}>{item.difficulty}</span>
        )}
        {item.timeEstimate && (
          <span style={{
            fontSize: '0.68rem', fontWeight: 600,
            color: 'var(--on-surface-variant)', background: 'var(--surface-container-high)',
            padding: '2px 8px', borderRadius: 999,
          }}>{item.timeEstimate}</span>
        )}
      </div>

      {/* Title */}
      <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--on-surface)', lineHeight: 1.3, margin: 0 }}>
        {item.title}
      </p>

      {/* Description */}
      <p style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)', lineHeight: 1.5, margin: 0 }}>
        {item.description}
      </p>

      {/* Why */}
      <div style={{ padding: '8px 10px', background: accentBg, borderRadius: 8 }}>
        <p style={{ fontSize: '0.75rem', color: 'var(--on-surface)', fontWeight: 500, margin: 0, lineHeight: 1.5 }}>
          {item.why}
        </p>
      </div>

      {/* Action step */}
      <p style={{ fontSize: '0.75rem', fontWeight: 600, color: accentColor, margin: 0 }}>
        {item.actionStep}
      </p>

      {/* Link */}
      {safeExternalUrl(item.url) && (
        <a
          href={safeExternalUrl(item.url)}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontSize: '0.78rem', fontWeight: 600, color: accentColor,
            textDecoration: 'none', marginTop: 2,
          }}
        >
          Visit →
        </a>
      )}
    </div>
  );
}
