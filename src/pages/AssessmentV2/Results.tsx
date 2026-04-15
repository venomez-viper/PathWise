import { useState, useEffect, useRef, type CSSProperties } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/auth-context';
import { assessment as assessmentApi } from '../../lib/api';
import ArchetypeShareCard from '../../components/ArchetypeShareCard';
import CareerExplorer from './CareerExplorer';
import WhatIfPanel, { generateWhatIfSkills } from './WhatIfPanel';

/* ─── Types ─────────────────────────────────────────────────────── */
interface RIASECScores {
  realistic: number; investigative: number; artistic: number;
  social: number; enterprising: number; conventional: number;
}

interface BigFiveScores {
  openness: number; conscientiousness: number; extraversion: number;
  agreeableness: number; emotionalStability: number;
}

interface Archetype {
  name: string; tagline: string; description: string;
  superpower: string; growthEdge: string;
}

interface CareerMatch {
  title: string; matchScore: number; careerFamily?: string;
  whyThisFits?: string[]; salaryRange?: { min: number; max: number };
  growthOutlook?: string; description: string;
  requiredSkills?: string[]; pathwayTime?: string; domain?: string;
}

type MatchTier = 'excellent' | 'strong' | 'good' | 'developing';
/* ─── Constants ─────────────────────────────────────────────────── */
const TEAL = '#006a62';
const COPPER = '#8b4f2c';
const TEAL_LIGHT = '#00a396';
const TEAL_20 = 'rgba(0,106,98,0.20)';

const TIER_CONFIG: Record<MatchTier, { label: string; color: string }> = {
  excellent:  { label: 'Excellent Match', color: TEAL },
  strong:     { label: 'Strong Match',    color: TEAL_LIGHT },
  good:       { label: 'Good Match',      color: '#7ec8c0' },
  developing: { label: 'Developing',      color: COPPER },
};

const DOMAIN_COLORS: Record<string, string> = {
  Technology:  '#006a62',
  Healthcare:  '#0e7490',
  Finance:     '#8b4f2c',
  Design:      '#d97706',
  Marketing:   '#9333ea',
  Education:   '#0369a1',
  Research:    '#0f766e',
  Engineering: '#1d4ed8',
  Legal:       '#7c3aed',
  Other:       '#64748b',
};

function getMatchTier(score: number): MatchTier {
  if (score >= 85) return 'excellent';
  if (score >= 70) return 'strong';
  if (score >= 55) return 'good';
  return 'developing';
}

function getDomainColor(domain?: string): string {
  if (!domain) return DOMAIN_COLORS.Other;
  return DOMAIN_COLORS[domain] ?? DOMAIN_COLORS.Other;
}

/* ─── Mock Data ─────────────────────────────────────────────────── */
const MOCK_ARCHETYPE: Archetype = {
  name: 'The Analytical Architect',
  tagline: 'You build systems that make sense of chaos.',
  description:
    'Your mind naturally deconstructs complex problems into elegant, structured solutions. ' +
    'You thrive at the intersection of logic and creativity, designing frameworks others rely on.',
  superpower: 'Turning ambiguity into actionable structure',
  growthEdge: 'Letting go of perfection to ship faster',
};

const MOCK_RIASEC: RIASECScores = {
  realistic: 45, investigative: 85, artistic: 60,
  social: 35, enterprising: 50, conventional: 65,
};

const MOCK_BIGFIVE: BigFiveScores = {
  openness: 78, conscientiousness: 82, extraversion: 40,
  agreeableness: 55, emotionalStability: 70,
};

const MOCK_MATCHES: CareerMatch[] = [
  {
    title: 'Data Scientist', matchScore: 92, careerFamily: 'Analytics & AI',
    domain: 'Technology',
    requiredSkills: ['Python', 'Machine Learning', 'Statistics', 'SQL', 'Data Visualization', 'TensorFlow', 'R'],
    pathwayTime: '6-12 months',
    whyThisFits: [
      'Your investigative score is in the top tier',
      'High conscientiousness drives rigorous analysis',
      'Strong pattern-recognition aptitude',
    ],
    salaryRange: { min: 95000, max: 165000 }, growthOutlook: 'High',
    description: 'Uncover insights from complex datasets to drive strategic decisions.',
  },
  {
    title: 'Software Architect', matchScore: 87, careerFamily: 'Engineering',
    domain: 'Engineering',
    requiredSkills: ['System Design', 'Cloud Architecture', 'Java', 'Microservices', 'DevOps', 'API Design', 'Security', 'Leadership'],
    pathwayTime: '12-24 months',
    whyThisFits: [
      'Systems thinking aligns with your profile',
      'Conventional + Investigative is the architect combo',
      'You prefer designing over implementing',
    ],
    salaryRange: { min: 130000, max: 210000 }, growthOutlook: 'High',
    description: 'Design scalable software systems and guide engineering teams.',
  },
  {
    title: 'Research Scientist', matchScore: 83, careerFamily: 'Research',
    domain: 'Research',
    requiredSkills: ['Research Methods', 'Statistical Analysis', 'Python', 'Academic Writing', 'Data Analysis'],
    pathwayTime: '12-36 months',
    whyThisFits: [
      'Deep investigative drive fuels curiosity',
      'High openness supports novel exploration',
      'You enjoy working with complex unknowns',
    ],
    salaryRange: { min: 85000, max: 150000 }, growthOutlook: 'Moderate',
    description: 'Push the boundaries of knowledge in your chosen domain.',
  },
];

/* ─── Shared Styles ─────────────────────────────────────────────── */

const card: CSSProperties = {
  background: 'var(--surface-container-lowest, #f7fafa)',
  borderRadius: '1.5rem',
  padding: '2rem',
  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
};

/* ─── RIASEC Hexagon ────────────────────────────────────────────── */

const RIASEC_LABELS: { key: keyof RIASECScores; label: string; full: string }[] = [
  { key: 'realistic', label: 'R', full: 'Realistic' },
  { key: 'investigative', label: 'I', full: 'Investigative' },
  { key: 'artistic', label: 'A', full: 'Artistic' },
  { key: 'social', label: 'S', full: 'Social' },
  { key: 'enterprising', label: 'E', full: 'Enterprising' },
  { key: 'conventional', label: 'C', full: 'Conventional' },
];

function polarToXY(angleDeg: number, r: number, cx: number, cy: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function RIASECHexagon({ scores, size = 340, animate }: {
  scores: RIASECScores; size?: number; animate: boolean;
}) {
  const cx = size / 2, cy = size / 2, maxR = size * 0.32;
  const step = 360 / 6;

  const gridLevels = [0.25, 0.5, 0.75, 1];
  const profilePoints = RIASEC_LABELS.map((item, i) => {
    const r = (scores[item.key] / 100) * maxR;
    return polarToXY(i * step, r, cx, cy);
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="RIASEC profile hexagon">
      {/* Grid rings */}
      {gridLevels.map((lv) => {
        const pts = Array.from({ length: 6 }, (_, i) => {
          const p = polarToXY(i * step, maxR * lv, cx, cy);
          return `${p.x},${p.y}`;
        });
        return <polygon key={lv} points={pts.join(' ')} fill="none" stroke="var(--on-surface, #333)" strokeOpacity={0.08} />;
      })}
      {/* Scale labels on first axis */}
      {gridLevels.map((lv) => {
        const p = polarToXY(0, maxR * lv + 2, cx, cy);
        return (
          <text key={`s${lv}`} x={p.x + 8} y={p.y} textAnchor="start" dominantBaseline="central"
            style={{ fontSize: 9, fill: 'var(--on-surface, #999)', fontWeight: 500 }}>
            {Math.round(lv * 100)}
          </text>
        );
      })}
      {/* Axes */}
      {RIASEC_LABELS.map((_, i) => {
        const p = polarToXY(i * step, maxR, cx, cy);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="var(--on-surface, #333)" strokeOpacity={0.08} />;
      })}
      {/* Profile fill */}
      <polygon
        points={profilePoints.map(p => `${p.x},${p.y}`).join(' ')}
        fill={TEAL_20} stroke={TEAL} strokeWidth={2}
        style={{
          transition: animate ? 'opacity 0.6s ease, transform 0.6s ease' : 'none',
          opacity: animate ? 1 : 0,
          transformOrigin: `${cx}px ${cy}px`,
        }}
      />
      {/* Score dots */}
      {animate && profilePoints.map((p, i) => (
        <circle key={`dot${i}`} cx={p.x} cy={p.y} r={3.5} fill={TEAL}
          style={{ transition: 'opacity 0.6s ease', opacity: animate ? 1 : 0 }} />
      ))}
      {/* Labels — full name + score */}
      {RIASEC_LABELS.map((item, i) => {
        const p = polarToXY(i * step, maxR + 30, cx, cy);
        const score = scores[item.key];
        return (
          <g key={item.key}>
            <text x={p.x} y={p.y - 7} textAnchor="middle" dominantBaseline="central"
              style={{ fontSize: 12, fontWeight: 700, fill: 'var(--on-surface, #333)' }}>
              {item.full}
            </text>
            <text x={p.x} y={p.y + 8} textAnchor="middle" dominantBaseline="central"
              style={{ fontSize: 11, fontWeight: 600, fill: TEAL }}>
              {score}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ─── Big Five Bars ─────────────────────────────────────────────── */

const BIG5_LABELS: { key: keyof BigFiveScores; short: string; label: string }[] = [
  { key: 'openness', short: 'O', label: 'Openness' },
  { key: 'conscientiousness', short: 'C', label: 'Conscientiousness' },
  { key: 'extraversion', short: 'E', label: 'Extraversion' },
  { key: 'agreeableness', short: 'A', label: 'Agreeableness' },
  { key: 'emotionalStability', short: 'S', label: 'Stability' },
];

function lerpColor(t: number): string {
  // copper (#8b4f2c) → teal (#006a62)
  const r = Math.round(0x8b + t * (0x00 - 0x8b));
  const g = Math.round(0x4f + t * (0x6a - 0x4f));
  const b = Math.round(0x2c + t * (0x62 - 0x2c));
  return `rgb(${r},${g},${b})`;
}

function BigFiveBars({ scores, animate }: { scores: BigFiveScores; animate: boolean }) {
  const barH = 22, gap = 16, labelW = 100, maxW = 200;
  const totalH = BIG5_LABELS.length * (barH + gap);

  return (
    <svg width={labelW + maxW + 40} height={totalH} role="img" aria-label="Big Five personality bars">
      {BIG5_LABELS.map((item, i) => {
        const y = i * (barH + gap);
        const val = scores[item.key];
        const w = (val / 100) * maxW;
        return (
          <g key={item.key}>
            <text x={labelW - 8} y={y + barH / 2 + 1} textAnchor="end" dominantBaseline="central"
              style={{ fontSize: 13, fill: 'var(--on-surface, #333)' }}>
              {item.label}
            </text>
            {/* Track */}
            <rect x={labelW} y={y} width={maxW} height={barH} rx={barH / 2}
              fill="var(--surface-container-high, #e5e5e5)" opacity={0.5} />
            {/* Fill */}
            <rect x={labelW} y={y} width={animate ? w : 0} height={barH} rx={barH / 2}
              fill={lerpColor(val / 100)}
              style={{ transition: animate ? 'width 0.7s cubic-bezier(.4,0,.2,1)' : 'none' }} />
            {/* Value */}
            <text x={labelW + maxW + 8} y={y + barH / 2 + 1} dominantBaseline="central"
              style={{ fontSize: 12, fontWeight: 600, fill: 'var(--on-surface, #555)' }}>
              {val}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ─── Score Gauge (semicircle) ──────────────────────────────────── */

function ScoreGauge({ score, size = 80 }: { score: number; size?: number }) {
  const tier = getMatchTier(score);
  const color = TIER_CONFIG[tier].color;
  const cx = size / 2, cy = size / 2, r = size * 0.4, sw = 6;
  const circumHalf = Math.PI * r;
  const filled = (score / 100) * circumHalf;

  return (
    <svg width={size} height={size * 0.6} viewBox={`0 0 ${size} ${size * 0.6}`}>
      {/* Track */}
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none" stroke="var(--surface-container-high, #e5e5e5)" strokeWidth={sw} strokeLinecap="round" />
      {/* Fill */}
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round"
        strokeDasharray={`${circumHalf}`} strokeDashoffset={circumHalf - filled}
        style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(.4,0,.2,1)' }} />
      {/* Score */}
      <text x={cx} y={cy - 4} textAnchor="middle" dominantBaseline="central"
        style={{ fontSize: 18, fontWeight: 700, fill: color }}>
        {score}%
      </text>
    </svg>
  );
}

/* ─── Archetype Card ────────────────────────────────────────────── */

function ArchetypeCard({ archetype, riasec, bigFive, visible }: {
  archetype: Archetype; riasec: RIASECScores; bigFive: BigFiveScores; visible: boolean;
}) {
  return (
    <div style={{
      ...card,
      textAlign: 'center',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.96)',
      transition: 'opacity 0.5s ease, transform 0.5s ease',
    }}>
      <h1 style={{
        fontFamily: 'var(--font-display, Georgia, serif)', fontSize: '2rem',
        color: TEAL, margin: '0 0 0.5rem',
      }}>
        {archetype.name}
      </h1>
      <p style={{ fontSize: '1.125rem', color: COPPER, margin: '0 0 1.5rem', fontStyle: 'italic' }}>
        {archetype.tagline}
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <RIASECHexagon scores={riasec} size={180} animate={visible} />
        <BigFiveBars scores={bigFive} animate={visible} />
      </div>
      <p style={{ maxWidth: 560, margin: '0 auto 1.5rem', lineHeight: 1.6, color: 'var(--on-surface, #333)' }}>
        {archetype.description}
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
        <div>
          <span style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: 1, color: TEAL }}>
            Superpower
          </span>
          <p style={{ margin: '0.25rem 0 0', fontWeight: 500 }}>{archetype.superpower}</p>
        </div>
        <div>
          <span style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: 1, color: COPPER }}>
            Growth Edge
          </span>
          <p style={{ margin: '0.25rem 0 0', fontWeight: 500 }}>{archetype.growthEdge}</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Skill Bubbles ────────────────────────────────────────────── */

function SkillBubbles({ requiredSkills, currentSkills }: { requiredSkills: string[]; currentSkills: string[] }) {
  const MAX_VISIBLE = 6;
  const currentLower = new Set(currentSkills.map(s => s.toLowerCase()));
  const visible = requiredSkills.slice(0, MAX_VISIBLE);
  const remaining = requiredSkills.length - MAX_VISIBLE;

  return (
    <div style={{ marginTop: '0.75rem' }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: TEAL, textTransform: 'uppercase' as const, letterSpacing: 0.5, display: 'block', marginBottom: '0.35rem' }}>
        Key Skills
      </span>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
        {visible.map((skill) => {
          const isMatch = currentLower.has(skill.toLowerCase());
          return (
            <span
              key={skill}
              title={isMatch ? 'You have this skill' : undefined}
              style={{
                fontSize: '0.75rem',
                fontWeight: isMatch ? 600 : 500,
                padding: '4px 10px',
                borderRadius: '9999px',
                background: isMatch ? 'var(--copper, #8b4f2c)' : 'var(--surface-container, #e8e8e8)',
                color: isMatch ? '#fff' : 'var(--on-surface, #333)',
                lineHeight: 1.3,
                whiteSpace: 'nowrap',
              }}
            >
              {skill}
            </span>
          );
        })}
        {remaining > 0 && (
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 500,
            padding: '4px 10px',
            borderRadius: '9999px',
            background: 'var(--surface-container, #e8e8e8)',
            color: 'var(--on-surface-variant, #666)',
            lineHeight: 1.3,
            whiteSpace: 'nowrap',
          }}>
            +{remaining} more
          </span>
        )}
      </div>
    </div>
  );
}

/* ─── Career Match Card ─────────────────────────────────────────── */

function CareerMatchCard({ match, rank, visible, currentSkills }: { match: CareerMatch; rank: number; visible: boolean; currentSkills: string[] }) {
  const tier = getMatchTier(match.matchScore);
  const tierCfg = TIER_CONFIG[tier];
  const [showWhatIf, setShowWhatIf] = useState(false);

  return (
    <div style={{
      ...card,
      display: 'flex', flexDirection: 'column', gap: 0,
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(24px)',
      transition: 'opacity 0.4s ease, transform 0.4s ease',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <div style={{ textAlign: 'center' }}>
          <ScoreGauge score={match.matchScore} />
          <span style={{ fontSize: 11, fontWeight: 600, color: tierCfg.color, display: 'block', marginTop: 2 }}>
            {tierCfg.label}
          </span>
        </div>
        <div style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.25rem', justifyContent: 'center' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: TEAL }}>#{rank}</span>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontFamily: 'var(--font-display, Georgia, serif)', color: 'var(--on-surface, #222)', textAlign: 'center' }}>
              {match.title}
            </h3>
          </div>
          {/* Domain tag and pathway time */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
            {match.domain && (
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                padding: '3px 10px',
                borderRadius: '9999px',
                background: getDomainColor(match.domain),
                color: '#fff',
                letterSpacing: 0.3,
                lineHeight: 1.3,
              }}>
                {match.domain}
              </span>
            )}
            {match.pathwayTime && (
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                padding: '3px 10px',
                borderRadius: '9999px',
                background: 'var(--surface-container, #e8e8e8)',
                color: 'var(--on-surface-variant, #555)',
                lineHeight: 1.3,
              }}>
                {match.pathwayTime}
              </span>
            )}
          </div>
          {match.careerFamily && (
            <span style={{ fontSize: 12, color: 'var(--on-surface, #777)', marginBottom: '0.75rem', display: 'block' }}>
              {match.careerFamily}
            </span>
          )}
          {match.whyThisFits && (
            <div style={{ marginBottom: '0.75rem' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: TEAL, textTransform: 'uppercase' as const, letterSpacing: 0.5 }}>
                Why this fits you
              </span>
              <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem', fontSize: 14, lineHeight: 1.6, color: 'var(--on-surface, #444)' }}>
                {match.whyThisFits.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            </div>
          )}
          {/* Required skills bubbles */}
          {match.requiredSkills && match.requiredSkills.length > 0 && (
            <SkillBubbles requiredSkills={match.requiredSkills} currentSkills={currentSkills} />
          )}
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: 13, color: 'var(--on-surface, #555)', marginTop: '0.75rem' }}>
            {match.salaryRange && (
              <span>${(match.salaryRange.min / 1000).toFixed(0)}k - ${(match.salaryRange.max / 1000).toFixed(0)}k</span>
            )}
            {match.growthOutlook && <span>Growth: {match.growthOutlook}</span>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', marginTop: '1rem' }}>
            <Link to={`/app/onboarding?role=${encodeURIComponent(match.title)}`} style={{
              display: 'inline-block',
              padding: '0.6rem 1.5rem', borderRadius: '2rem',
              background: TEAL, color: '#fff', fontWeight: 600, fontSize: 14,
              textDecoration: 'none', transition: 'background 0.2s',
            }}
              onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = TEAL_LIGHT)}
              onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = TEAL)}
            >
              Build Roadmap for {match.title}
            </Link>
            <button
              onClick={() => setShowWhatIf(v => !v)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: TEAL,
                fontSize: 14,
                fontWeight: 600,
                padding: '0.4rem 0',
                textDecoration: 'underline',
                textUnderlineOffset: 2,
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = TEAL_LIGHT)}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = TEAL)}
            >
              {showWhatIf ? 'Hide boost tips' : 'How to boost your match'}
            </button>
          </div>
        </div>
      </div>

      {showWhatIf && (
        <WhatIfPanel
          careerTitle={match.title}
          currentScore={match.matchScore}
          skills={generateWhatIfSkills(match.title, match.matchScore, match.requiredSkills)}
          requiredSkills={match.requiredSkills}
        />
      )}
    </div>
  );
}

/* ─── Results Page ──────────────────────────────────────────────── */

export default function AssessmentResults() {
  const location = useLocation();
  const { user } = useAuth();
  const stateResult = (location.state as any)?.result;
  const [apiResult, setApiResult] = useState<any>(null);
  const [loading, setLoading] = useState(!stateResult);

  // Fetch from API if no router state (page refresh, direct navigation)
  useEffect(() => {
    if (stateResult || !user) return;
    assessmentApi.getResult(user.id).then((res: any) => {
      if (res?.result) setApiResult(res.result);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  const result = stateResult ?? apiResult;

  const [phase, setPhase] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (!result) return;
    // Stagger reveals: 0ms archetype, 300ms tagline (handled within archetype),
    // 600ms charts animate, 900ms big five, 1200ms+ career matches
    const delays = [0, 600, 1200, 1500, 1800];
    delays.forEach((d, i) => {
      timerRef.current.push(setTimeout(() => setPhase(i + 1), d));
    });
    return () => timerRef.current.forEach(clearTimeout);
  }, [result]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
      <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.9rem' }}>Loading your results...</p>
    </div>
  );

  if (!result) return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '50vh', padding: '2rem', textAlign: 'center',
      fontFamily: 'var(--font-body, system-ui, sans-serif)',
    }}>
      <div style={{
        background: 'var(--surface-container-lowest, #f7fafa)',
        borderRadius: '1.5rem', padding: '3rem 2.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        maxWidth: 440, width: '100%',
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>&#x1F4CB;</div>
        <h2 style={{
          fontFamily: 'var(--font-display, Georgia, serif)',
          fontSize: '1.4rem', color: 'var(--on-surface, #222)',
          margin: '0 0 0.75rem',
        }}>
          No results yet
        </h2>
        <p style={{
          fontSize: '0.95rem', color: 'var(--on-surface-variant, #666)',
          lineHeight: 1.6, margin: '0 0 1.5rem',
        }}>
          Take the career assessment to discover your archetype, personality profile, and top career matches.
        </p>
        <Link to="/app/assessment-v2" style={{
          display: 'inline-block',
          padding: '0.75rem 2rem', borderRadius: '2rem',
          background: TEAL, color: '#fff', fontWeight: 700, fontSize: '0.95rem',
          textDecoration: 'none', transition: 'background 0.2s',
        }}
          onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = TEAL_LIGHT)}
          onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = TEAL)}
        >
          Take the Assessment
        </Link>
      </div>
    </div>
  );

  const completedTier: number = (location.state as any)?.completedTier ?? 3;
  const archetype = result.archetype ?? MOCK_ARCHETYPE;
  const riasec = result.riasec ?? MOCK_RIASEC;
  const bigFive = result.bigFive ?? MOCK_BIGFIVE;
  const matches = result.careerMatches ?? MOCK_MATCHES;
  const narrative = result.narrative ?? null;
  const currentSkills: string[] = result.currentSkills ?? [];

  const showArchetype = phase >= 1;
  const showCharts = phase >= 2;
  const showMatchIndex = (i: number) => phase >= 3 + i;

  return (
    <div style={{
      maxWidth: 1280, margin: '0 auto', padding: '2rem 2rem 4rem',
      fontFamily: 'var(--font-body, system-ui, sans-serif)',
    }}>
      {/* Continue Assessment banner for tier 1/2 users */}
      {completedTier < 3 && (
        <section style={{
          background: 'linear-gradient(135deg, rgba(139,79,44,0.08) 0%, rgba(0,106,98,0.06) 100%)',
          borderRadius: '1.25rem',
          padding: '1.5rem 2rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
          flexWrap: 'wrap',
          border: '1px solid rgba(139,79,44,0.12)',
        }}>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: 'var(--on-surface, #222)' }}>
              {completedTier === 1
                ? 'Your results are based on interests only'
                : 'You can unlock maximum precision'}
            </p>
            <p style={{ margin: '0.3rem 0 0', fontSize: '0.85rem', color: 'var(--on-surface-variant, #666)' }}>
              {completedTier === 1
                ? 'Continue the assessment to add personality traits and get much more accurate career matches and a detailed profile.'
                : 'Answer 20 more questions about work style and aptitudes for the most precise results possible.'}
            </p>
          </div>
          <Link to={`/app/assessment-v2?tier=${completedTier + 1}`} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '0.75rem 1.75rem', borderRadius: '2rem',
            background: COPPER, color: '#fff', fontWeight: 700, fontSize: '0.9rem',
            textDecoration: 'none', whiteSpace: 'nowrap',
            boxShadow: '0 2px 8px rgba(139,79,44,0.2)',
            transition: 'transform 0.15s, opacity 0.15s',
          }}>
            Continue Assessment →
          </Link>
        </section>
      )}

      {/* Bias detection banner */}
      {result.biasFlags && result.biasFlags.length > 0 && result.confidenceNote && (
        <section style={{
          background: 'rgba(217, 119, 6, 0.08)',
          border: '1px solid rgba(217, 119, 6, 0.2)',
          borderRadius: '1rem',
          padding: '1rem 1.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem',
        }}>
          <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>&#x1F6C8;</span>
          <div>
            <p style={{
              margin: 0, fontSize: '0.88rem', color: 'var(--on-surface, #333)',
              lineHeight: 1.6,
            }}>
              {result.confidenceNote}
            </p>
            <ul style={{
              margin: '0.5rem 0 0', paddingLeft: '1.25rem',
              fontSize: '0.82rem', color: 'var(--on-surface-variant, #666)',
            }}>
              {result.biasFlags.map((flag: string, i: number) => (
                <li key={i}>{flag}</li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Section: Archetype */}
      <section style={{ marginBottom: '2.5rem' }}>
        <ArchetypeCard
          archetype={archetype}
          riasec={riasec}
          bigFive={bigFive}
          visible={showArchetype}
        />
        {narrative && (
          <div className="panel" style={{ borderRadius: '1.5rem', padding: '2rem', marginTop: '1.5rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--on-surface)', marginBottom: '1rem' }}>
              Your Career Profile
            </h2>
            <div style={{ fontSize: '0.92rem', color: 'var(--on-surface-variant)', lineHeight: 1.75, whiteSpace: 'pre-line' }}>
              {narrative.fullNarrative}
            </div>
          </div>
        )}
      </section>

      {/* Section: Top Career Matches — HERO */}
      <section style={{ marginBottom: '2.5rem' }}>
        {/* Guidance banner */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(0,106,98,0.08) 0%, rgba(0,106,98,0.03) 100%)',
          borderRadius: '1.25rem',
          padding: '1.25rem 1.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          border: '1px solid rgba(0,106,98,0.12)',
        }}>
          <span style={{ fontSize: '1.5rem' }}>&#x1F3AF;</span>
          <div>
            <p style={{ margin: 0, fontWeight: 700, color: 'var(--on-surface, #222)', fontSize: '0.95rem' }}>
              Next step: Choose a career path below to build your personalised roadmap
            </p>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.82rem', color: 'var(--on-surface-variant, #666)' }}>
              Click "Build Roadmap" on any match to get milestones, tasks, and skill guidance tailored to that role.
            </p>
          </div>
        </div>

        <h2 style={{
          fontFamily: 'var(--font-display, Georgia, serif)', fontSize: '1.4rem',
          color: 'var(--on-surface, #222)', margin: '0 0 0.4rem',
        }}>
          Your Top Career Matches
        </h2>
        <p style={{ fontSize: 14, color: 'var(--on-surface-variant, #666)', margin: '0 0 1.25rem' }}>
          Pick a role and build your personalised roadmap.
        </p>
        <div className="results-career-grid" style={{ display: 'grid', gap: '1.5rem' }}>
          <style>{`
            .results-career-grid {
              grid-template-columns: repeat(3, 1fr);
            }
            @media (max-width: 1024px) {
              .results-career-grid {
                grid-template-columns: repeat(2, 1fr) !important;
              }
            }
            @media (max-width: 640px) {
              .results-career-grid {
                grid-template-columns: 1fr !important;
              }
            }
          `}</style>
          {matches.slice(0, 3).map((m: any, i: number) => (
            <CareerMatchCard key={m.title} match={m} rank={i + 1} visible={showMatchIndex(i)} currentSkills={currentSkills} />
          ))}
        </div>
      </section>

      {/* Section: Charts side-by-side */}
      <section style={{
        display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2.5rem',
        opacity: showCharts ? 1 : 0, transition: 'opacity 0.5s ease',
      }}>
        <div style={card}>
          <h2 style={{ fontFamily: 'var(--font-display, Georgia, serif)', fontSize: '1.1rem', color: TEAL, margin: '0 0 1rem', textAlign: 'center' }}>
            Interest Profile
          </h2>
          <RIASECHexagon scores={riasec} animate={showCharts} />
        </div>
        <div style={card}>
          <h2 style={{ fontFamily: 'var(--font-display, Georgia, serif)', fontSize: '1.1rem', color: TEAL, margin: '0 0 0.5rem', textAlign: 'center' }}>
            Personality Traits
          </h2>
          {completedTier < 2 && (
            <p style={{ fontSize: 11, color: 'var(--on-surface-variant, #888)', textAlign: 'center', margin: '0 0 0.75rem', fontStyle: 'italic' }}>
              Estimated from your interests — continue assessment for precise scores
            </p>
          )}
          <BigFiveBars scores={bigFive} animate={showCharts} />
        </div>
      </section>

      {/* Tier upsell removed — replaced by top banner */}

      {/* Section: Explore All Career Paths */}
      <section style={{
        marginBottom: '2.5rem',
        opacity: phase >= 5 ? 1 : 0,
        transition: 'opacity 0.6s ease 0.2s',
      }}>
        <div style={{ marginBottom: '1rem' }}>
          <h2 style={{
            fontFamily: 'var(--font-display, Georgia, serif)', fontSize: '1.4rem',
            color: 'var(--on-surface, #222)', margin: '0 0 0.4rem',
          }}>
            Explore All Career Paths
          </h2>
          <p style={{ fontSize: 14, color: 'var(--on-surface-variant, #49454f)', margin: 0 }}>
            Browse all careers and filter by domain, match score, or pathway time.
          </p>
        </div>
        <CareerExplorer allMatches={matches} userRiasec={riasec} />
      </section>

      {/* Retake */}
      <section style={{
        textAlign: 'center',
        opacity: phase >= 5 ? 1 : 0,
        transition: 'opacity 0.5s ease',
      }}>
        <Link to="/app/assessment-v2" style={{ color: 'var(--on-surface-variant)', fontSize: '0.82rem' }}>
          Retake Assessment
        </Link>
      </section>

      {/* Section: Share Your Career DNA */}
      <section style={{
        marginTop: '2.5rem',
        opacity: phase >= 5 ? 1 : 0,
        transition: 'opacity 0.6s ease 0.3s',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{
            fontFamily: 'var(--font-display, Georgia, serif)',
            fontSize: '1.4rem',
            color: 'var(--on-surface, #222)',
            margin: '0 0 0.5rem',
          }}>
            Share Your Career DNA
          </h2>
          <p style={{ fontSize: 14, color: 'var(--on-surface-variant, #666)', margin: 0 }}>
            Show the world what makes you unique — download or share your archetype card.
          </p>
        </div>
        <ArchetypeShareCard
          archetypeName={archetype.name}
          archetypeTagline={archetype.tagline}
          riasec={riasec}
          topMatches={matches.slice(0, 3).map((m: CareerMatch) => ({ title: m.title, score: m.matchScore }))}
        />
      </section>
    </div>
  );
}
