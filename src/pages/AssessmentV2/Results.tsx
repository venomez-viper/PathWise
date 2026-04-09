import { useState, useEffect, useRef, type CSSProperties } from 'react';
import { Link, useLocation } from 'react-router-dom';
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

function getMatchTier(score: number): MatchTier {
  if (score >= 85) return 'excellent';
  if (score >= 70) return 'strong';
  if (score >= 55) return 'good';
  return 'developing';
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

const RIASEC_LABELS: { key: keyof RIASECScores; label: string }[] = [
  { key: 'realistic', label: 'R' },
  { key: 'investigative', label: 'I' },
  { key: 'artistic', label: 'A' },
  { key: 'social', label: 'S' },
  { key: 'enterprising', label: 'E' },
  { key: 'conventional', label: 'C' },
];

function polarToXY(angleDeg: number, r: number, cx: number, cy: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function RIASECHexagon({ scores, size = 280, animate }: {
  scores: RIASECScores; size?: number; animate: boolean;
}) {
  const cx = size / 2, cy = size / 2, maxR = size * 0.38;
  const step = 360 / 6;

  const gridLevels = [0.25, 0.5, 0.75, 1];
  const profilePoints = RIASEC_LABELS.map((item, i) => {
    const r = (scores[item.key] / 100) * maxR;
    return polarToXY(i * step, r, cx, cy);
  });
  // profilePoints used directly in polygon rendering below

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="RIASEC profile hexagon">
      {/* Grid */}
      {gridLevels.map((lv) => {
        const pts = Array.from({ length: 6 }, (_, i) => {
          const p = polarToXY(i * step, maxR * lv, cx, cy);
          return `${p.x},${p.y}`;
        });
        return <polygon key={lv} points={pts.join(' ')} fill="none" stroke="var(--on-surface, #333)" strokeOpacity={0.08} />;
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
      {/* Labels */}
      {RIASEC_LABELS.map((item, i) => {
        const p = polarToXY(i * step, maxR + 18, cx, cy);
        return (
          <text key={item.key} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central"
            style={{ fontSize: 13, fontWeight: 600, fill: 'var(--on-surface, #333)' }}>
            {item.label}
          </text>
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

/* ─── Career Match Card ─────────────────────────────────────────── */

function CareerMatchCard({ match, rank, visible }: { match: CareerMatch; rank: number; visible: boolean }) {
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
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
        <div style={{ flexShrink: 0, textAlign: 'center' }}>
          <ScoreGauge score={match.matchScore} />
          <span style={{ fontSize: 11, fontWeight: 600, color: tierCfg.color, display: 'block', marginTop: 2 }}>
            {tierCfg.label}
          </span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: TEAL }}>#{rank}</span>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontFamily: 'var(--font-display, Georgia, serif)', color: 'var(--on-surface, #222)' }}>
              {match.title}
            </h3>
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
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: 13, color: 'var(--on-surface, #555)' }}>
            {match.salaryRange && (
              <span>${(match.salaryRange.min / 1000).toFixed(0)}k – ${(match.salaryRange.max / 1000).toFixed(0)}k</span>
            )}
            {match.growthOutlook && <span>Growth: {match.growthOutlook}</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            <Link to="/app/onboarding" style={{
              display: 'inline-block',
              padding: '0.6rem 1.5rem', borderRadius: '2rem',
              background: TEAL, color: '#fff', fontWeight: 600, fontSize: 14,
              textDecoration: 'none', transition: 'background 0.2s',
            }}
              onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = TEAL_LIGHT)}
              onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = TEAL)}
            >
              Build Roadmap
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
          skills={generateWhatIfSkills(match.title, match.matchScore)}
        />
      )}
    </div>
  );
}

/* ─── Results Page ──────────────────────────────────────────────── */

export default function AssessmentResults() {
  const location = useLocation();
  const result = (location.state as any)?.result;

  const archetype = result?.archetype ?? MOCK_ARCHETYPE;
  const riasec = result?.riasec ?? MOCK_RIASEC;
  const bigFive = result?.bigFive ?? MOCK_BIGFIVE;
  const matches = result?.careerMatches ?? MOCK_MATCHES;
  const narrative = result?.narrative ?? null;

  const [phase, setPhase] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    // Stagger reveals: 0ms archetype, 300ms tagline (handled within archetype),
    // 600ms charts animate, 900ms big five, 1200ms+ career matches
    const delays = [0, 600, 1200, 1500, 1800];
    delays.forEach((d, i) => {
      timerRef.current.push(setTimeout(() => setPhase(i + 1), d));
    });
    return () => timerRef.current.forEach(clearTimeout);
  }, []);

  const showArchetype = phase >= 1;
  const showCharts = phase >= 2;
  const showMatchIndex = (i: number) => phase >= 3 + i;

  return (
    <div style={{
      maxWidth: 820, margin: '0 auto', padding: '2rem 1rem 4rem',
      fontFamily: 'var(--font-body, system-ui, sans-serif)',
    }}>
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
          <h2 style={{ fontFamily: 'var(--font-display, Georgia, serif)', fontSize: '1.1rem', color: TEAL, margin: '0 0 1rem', textAlign: 'center' }}>
            Personality Traits
          </h2>
          <BigFiveBars scores={bigFive} animate={showCharts} />
        </div>
      </section>

      {/* Section: Top Career Matches */}
      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{
          fontFamily: 'var(--font-display, Georgia, serif)', fontSize: '1.4rem',
          color: 'var(--on-surface, #222)', margin: '0 0 1.25rem',
        }}>
          Your Top Career Matches
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {matches.map((m: any, i: number) => (
            <CareerMatchCard key={m.title} match={m} rank={i + 1} visible={showMatchIndex(i)} />
          ))}
        </div>
      </section>

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

      {/* CTA + Share */}
      <section style={{
        textAlign: 'center',
        opacity: phase >= 5 ? 1 : 0,
        transition: 'opacity 0.5s ease',
      }}>
        <Link to="/app/onboarding" style={{
          display: 'inline-block',
          padding: '0.85rem 2.5rem', borderRadius: '2rem',
          background: TEAL, color: '#fff', fontWeight: 700, fontSize: 16,
          textDecoration: 'none', transition: 'background 0.2s', marginBottom: '2rem',
        }}
          onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = TEAL_LIGHT)}
          onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = TEAL)}
        >
          Build Your Roadmap
        </Link>

        <div style={{ marginTop: '1.5rem' }}>
          <Link to="/app/assessment-v2" style={{ color: 'var(--on-surface-variant)', fontSize: '0.82rem' }}>
            Retake Assessment
          </Link>
        </div>
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
