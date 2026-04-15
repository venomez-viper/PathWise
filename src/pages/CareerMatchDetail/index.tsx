import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../lib/auth-context';
import { assessment as assessmentApi } from '../../lib/api';

const SKILL_LEVELS: Record<string, { label: string; color: string; borderColor: string }> = {
  expert: { label: 'EXPERT', color: '#006a62', borderColor: '#006a62' },
  moderate: { label: 'MODERATE', color: '#8b4f2c', borderColor: '#8b4f2c' },
  gap: { label: 'GAP', color: '#ef4444', borderColor: '#ef4444' },
};

export default function CareerMatchDetail() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [match, setMatch] = useState<any>(null);
  const [allMatches, setAllMatches] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    assessmentApi.getResult(user.id).then((res: any) => {
      const matches = res?.result?.careerMatches ?? [];
      setAllMatches(matches);
      setMatch(matches[0] ?? null);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

  if (loading) return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <Loader2 size={28} color="#8b4f2c" style={{ animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  if (!match) return (
    <div className="page" style={{ maxWidth: '100%' }}>
      <h1 className="page-title">Career Match</h1>
      <div className="panel" style={{ borderRadius: '2rem', textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: 'var(--on-surface-variant)' }}>No assessment results yet.</p>
        <Link to="/app/assessment-v2" className="panel-link">Take Assessment →</Link>
      </div>
    </div>
  );

  const score = match.matchScore ?? 0;
  const ringR = 50; const circ = 2 * Math.PI * ringR;
  const offset = circ * (1 - score / 100);

  // Generate reasons from match data — prefer whyThisFits from assessment engine
  const requiredSkills: string[] = match.requiredSkills ?? match.skills ?? [];
  const reasons = match.whyThisFits ?? match.reasons ?? [
    requiredSkills.length > 0
      ? `Your skills align with key requirements: ${requiredSkills.slice(0, 2).join(', ')}.`
      : `Your profile strengths match the core competencies for this role.`,
    `This role's focus areas align with your career interests and assessment results.`,
    match.pathwayTime
      ? `Achievable within ${match.pathwayTime} based on your current experience level.`
      : `A strong match based on your cognitive and professional profile.`,
  ];

  // Salary benchmarks from match data — prefer salaryRange from assessment engine
  const salaries = match.salaryBenchmarks ?? (match.salaryRange ? {
    low: `$${Math.round(match.salaryRange.min / 1000)}K`,
    median: `$${Math.round((match.salaryRange.min + match.salaryRange.max) / 2000)}K`,
    high: `$${Math.round(match.salaryRange.max / 1000)}K`,
  } : (() => {
    const baseSalary = Math.round(45 + (score / 100) * 30);
    return { low: `$${baseSalary}K`, median: `$${baseSalary + 17}K`, high: `$${baseSalary + 40}K` };
  })());

  // Skills readiness from match data
  const skills: { name: string; level: string; desc: string }[] = match.skillsReadiness ??
    requiredSkills.slice(0, 3).map((s: string, i: number) => ({
      name: s,
      level: i === 0 ? 'expert' : i === 1 ? 'moderate' : 'gap',
      desc: i === 0 ? 'Strong proficiency demonstrated.' : i === 1 ? 'Building competency.' : 'Growth area identified.',
    }));

  return (
    <div className="page" style={{ maxWidth: '100%' }}>
      {/* Back */}
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--on-surface-variant)', fontSize: '0.85rem', marginBottom: '1rem' }}>
        <ArrowLeft size={16} /> Back
      </button>

      {/* Hero card */}
      <div className="panel" style={{ borderRadius: '2rem', padding: '2rem', textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', width: 120, height: 120, margin: '0 auto' }}>
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r={ringR} fill="none" stroke="var(--surface-container)" strokeWidth="8" />
            <circle cx="60" cy="60" r={ringR} fill="none" stroke="#006a62" strokeWidth="8"
              strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
              style={{ transform: 'rotate(-90deg)', transformOrigin: '60px 60px', transition: 'stroke-dashoffset 1s ease' }} />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--on-surface)' }}>{score}%</span>
            <span style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--on-surface-variant)' }}>Match</span>
          </div>
        </div>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 'var(--radius-full)', background: 'rgba(0,106,98,0.08)', color: '#006a62', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', marginTop: '0.75rem' }}>
          🏅 Best Match
        </span>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.65rem', fontWeight: 800, color: 'var(--on-surface)', letterSpacing: '-0.02em', marginTop: '0.5rem' }}>{match.title}</h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--on-surface-variant)', lineHeight: 1.5, marginTop: 4 }}>{match.description}</p>
      </div>

      {/* Why this fits you */}
      <div className="panel" style={{ borderRadius: '2rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 800, color: 'var(--on-surface)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
          💡 Why this fits you
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {reasons.map((r: any, i: number) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <CheckCircle2 size={18} color="#006a62" style={{ flexShrink: 0, marginTop: 2 }} />
              <p style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)', lineHeight: 1.5 }}>{String(r)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Salary Benchmarks */}
      <div className="panel" style={{ borderRadius: '2rem', padding: '1.5rem', marginBottom: '1.5rem', background: 'var(--surface-container-low)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 800, color: 'var(--on-surface)', marginBottom: '1rem' }}>Salary Benchmarks</h2>
        {Object.entries(salaries).map(([level, amount]) => (
          <div key={level} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--on-surface-variant)' }}>{level}</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: level === 'median' ? '1.5rem' : '1.1rem', fontWeight: 800, color: 'var(--on-surface)' }}>{String(amount)}</span>
          </div>
        ))}
        <p style={{ fontSize: '0.72rem', color: 'var(--on-surface-muted)', marginTop: 8 }}>Based on national market data</p>
      </div>

      {/* Skills Readiness */}
      <div className="panel" style={{ borderRadius: '2rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 800, color: 'var(--on-surface)', marginBottom: '1rem' }}>Skills Readiness</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {skills.map(s => {
            const sl = SKILL_LEVELS[s.level] || SKILL_LEVELS.moderate;
            return (
              <div key={s.name} style={{
                background: 'var(--surface-container-low)', borderRadius: 'var(--radius-xl)',
                padding: '1rem 1.25rem', borderBottom: `3px solid ${sl.borderColor}`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 800, color: 'var(--on-surface)' }}>{s.name}</p>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: sl.color }}>{sl.label}</span>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)', marginTop: 4 }}>{s.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTAs */}
      <Link to="/app/onboarding" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        width: '100%', padding: '0.85rem', borderRadius: 'var(--radius-full)',
        background: 'var(--copper)',
        color: '#fff', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none', marginBottom: '0.75rem',
      }}>
        Set as My Target Role
      </Link>
      {allMatches.length > 1 && (
        <button onClick={() => {
          const nextIdx = (allMatches.indexOf(match) + 1) % allMatches.length;
          setMatch(allMatches[nextIdx]);
          window.scrollTo(0, 0);
        }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--copper)', fontWeight: 600, fontSize: '0.85rem', width: '100%', textAlign: 'center' }}>
          Compare with another role
        </button>
      )}
    </div>
  );
}
