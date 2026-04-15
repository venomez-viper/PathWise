import { useState, type CSSProperties } from 'react';

/* ─── Types ──────────────────────────────────────────────────────── */

export interface WhatIfSkill {
  skill: string;
  currentScore: number;
  projectedScore: number;
  delta: number;
  effort: 'low' | 'medium' | 'high';
  timeEstimate: string;
}

export interface WhatIfPanelProps {
  careerTitle: string;
  currentScore: number;
  skills: WhatIfSkill[];
  requiredSkills?: string[];
}

/* ─── Career → Skill Mapping ─────────────────────────────────────── */

const CAREER_SKILLS: Record<
  string,
  { skill: string; delta: number; effort: 'low' | 'medium' | 'high'; time: string }[]
> = {
  'Data Scientist': [
    { skill: 'Python',           delta: 8, effort: 'medium', time: '~3 months' },
    { skill: 'Machine Learning', delta: 6, effort: 'high',   time: '~6 months' },
    { skill: 'SQL',              delta: 5, effort: 'low',    time: '~2 months' },
    { skill: 'Statistics',       delta: 4, effort: 'medium', time: '~4 months' },
    { skill: 'Data Visualisation', delta: 3, effort: 'low',  time: '~1 month'  },
  ],
  'Software Engineer': [
    { skill: 'System Design',    delta: 9, effort: 'high',   time: '~5 months' },
    { skill: 'Algorithms & DS',  delta: 7, effort: 'medium', time: '~3 months' },
    { skill: 'Cloud (AWS/GCP)',  delta: 5, effort: 'medium', time: '~3 months' },
    { skill: 'Testing / TDD',    delta: 4, effort: 'low',    time: '~2 months' },
    { skill: 'CI/CD Pipelines',  delta: 3, effort: 'low',    time: '~1 month'  },
  ],
  'Frontend Developer': [
    { skill: 'React',            delta: 10, effort: 'medium', time: '~3 months' },
    { skill: 'TypeScript',       delta: 6,  effort: 'low',    time: '~2 months' },
    { skill: 'CSS / Design Systems', delta: 4, effort: 'low', time: '~1 month' },
    { skill: 'Testing',          delta: 3,  effort: 'medium', time: '~2 months' },
    { skill: 'Performance Optimisation', delta: 2, effort: 'medium', time: '~2 months' },
  ],
  'Backend Developer': [
    { skill: 'Distributed Systems', delta: 9, effort: 'high',   time: '~5 months' },
    { skill: 'Database Design',     delta: 7, effort: 'medium', time: '~3 months' },
    { skill: 'REST & GraphQL APIs', delta: 5, effort: 'low',    time: '~2 months' },
    { skill: 'Containerisation',    delta: 4, effort: 'medium', time: '~2 months' },
    { skill: 'Security Fundamentals', delta: 3, effort: 'medium', time: '~3 months' },
  ],
  'Product Manager': [
    { skill: 'Product Discovery',   delta: 8, effort: 'medium', time: '~3 months' },
    { skill: 'Data Analytics',      delta: 6, effort: 'medium', time: '~3 months' },
    { skill: 'Agile / Scrum',       delta: 5, effort: 'low',    time: '~1 month'  },
    { skill: 'User Research',        delta: 4, effort: 'medium', time: '~2 months' },
    { skill: 'Roadmapping Tools',    delta: 2, effort: 'low',    time: '~1 month'  },
  ],
  'UX Designer': [
    { skill: 'Figma Prototyping',   delta: 9, effort: 'medium', time: '~2 months' },
    { skill: 'User Research',       delta: 7, effort: 'medium', time: '~3 months' },
    { skill: 'Interaction Design',  delta: 5, effort: 'medium', time: '~3 months' },
    { skill: 'Accessibility (WCAG)', delta: 4, effort: 'low',   time: '~1 month'  },
    { skill: 'Design Systems',      delta: 3, effort: 'low',    time: '~1 month'  },
  ],
  'DevOps Engineer': [
    { skill: 'Kubernetes',          delta: 9, effort: 'high',   time: '~5 months' },
    { skill: 'Terraform / IaC',     delta: 7, effort: 'medium', time: '~3 months' },
    { skill: 'CI/CD Pipelines',     delta: 6, effort: 'medium', time: '~2 months' },
    { skill: 'Observability',       delta: 4, effort: 'low',    time: '~2 months' },
    { skill: 'Linux Administration',delta: 3, effort: 'low',    time: '~2 months' },
  ],
  'Machine Learning Engineer': [
    { skill: 'PyTorch / TensorFlow', delta: 10, effort: 'high', time: '~6 months' },
    { skill: 'MLOps',                delta: 7,  effort: 'high', time: '~4 months' },
    { skill: 'Feature Engineering',  delta: 5,  effort: 'medium', time: '~3 months' },
    { skill: 'Cloud ML Platforms',   delta: 4,  effort: 'medium', time: '~2 months' },
    { skill: 'Model Deployment',     delta: 3,  effort: 'medium', time: '~2 months' },
  ],
  'Cybersecurity Analyst': [
    { skill: 'Threat Modelling',    delta: 9, effort: 'high',   time: '~4 months' },
    { skill: 'Network Security',    delta: 7, effort: 'medium', time: '~3 months' },
    { skill: 'SIEM Tools',          delta: 5, effort: 'medium', time: '~2 months' },
    { skill: 'Penetration Testing', delta: 4, effort: 'high',   time: '~5 months' },
    { skill: 'CompTIA Security+',   delta: 3, effort: 'low',    time: '~2 months' },
  ],
  'Data Engineer': [
    { skill: 'Apache Spark',        delta: 9, effort: 'high',   time: '~4 months' },
    { skill: 'Data Pipelines / ETL',delta: 7, effort: 'medium', time: '~3 months' },
    { skill: 'Cloud Data Warehouses', delta: 5, effort: 'medium', time: '~2 months' },
    { skill: 'dbt',                 delta: 4, effort: 'low',    time: '~1 month'  },
    { skill: 'Streaming (Kafka)',    delta: 3, effort: 'high',   time: '~3 months' },
  ],
  'Research Scientist': [
    { skill: 'Statistical Modelling', delta: 8, effort: 'high',  time: '~5 months' },
    { skill: 'Scientific Writing',    delta: 6, effort: 'medium', time: '~3 months' },
    { skill: 'R / Python Analysis',   delta: 5, effort: 'medium', time: '~3 months' },
    { skill: 'Grant Writing',         delta: 4, effort: 'medium', time: '~4 months' },
    { skill: 'Literature Review',     delta: 3, effort: 'low',    time: '~2 months' },
  ],
  'Software Architect': [
    { skill: 'Microservices Patterns', delta: 9, effort: 'high',  time: '~5 months' },
    { skill: 'Event-Driven Architecture', delta: 7, effort: 'high', time: '~4 months' },
    { skill: 'Cloud Native Design',   delta: 6, effort: 'medium', time: '~3 months' },
    { skill: 'Technical Leadership',  delta: 4, effort: 'medium', time: '~4 months' },
    { skill: 'ADR Documentation',     delta: 2, effort: 'low',    time: '~1 month'  },
  ],
};

const DEFAULT_SKILLS: { skill: string; delta: number; effort: 'low' | 'medium' | 'high'; time: string }[] = [
  { skill: 'Core Technical Skills', delta: 7, effort: 'medium', time: '~3 months' },
  { skill: 'Industry Knowledge',    delta: 5, effort: 'medium', time: '~4 months' },
  { skill: 'Portfolio Project',     delta: 4, effort: 'low',    time: '~2 months' },
  { skill: 'Networking',            delta: 2, effort: 'low',    time: '~1 month'  },
];

export function generateWhatIfSkills(careerTitle: string, currentScore: number, requiredSkills?: string[]): WhatIfSkill[] {
  let template = CAREER_SKILLS[careerTitle];

  // If no hardcoded mapping, generate from the career's required skills
  if (!template && requiredSkills && requiredSkills.length > 0) {
    const efforts: ('high' | 'medium' | 'low')[] = ['high', 'medium', 'medium', 'low', 'low'];
    const times = ['~4 months', '~3 months', '~3 months', '~2 months', '~1 month'];
    template = requiredSkills.slice(0, 5).map((skill, i) => ({
      skill,
      delta: Math.max(3, 8 - i),
      effort: efforts[i] ?? 'low',
      time: times[i] ?? '~2 months',
    }));
  }

  if (!template) template = DEFAULT_SKILLS;

  // Sort by delta descending (highest impact first)
  const sorted = [...template].sort((a, b) => b.delta - a.delta);

  return sorted.map(s => ({
    skill: s.skill,
    delta: s.delta,
    effort: s.effort,
    timeEstimate: s.time,
    currentScore,
    projectedScore: Math.min(98, currentScore + s.delta),
  }));
}

/* ─── Sub-components ─────────────────────────────────────────────── */

const TEAL        = '#006a62';
const TEAL_LIGHT  = '#00a396';
const TEAL_20     = 'rgba(0,106,98,0.20)';

const EFFORT_DOT: Record<'low' | 'medium' | 'high', { color: string; label: string }> = {
  low:    { color: '#22c55e', label: 'Low effort'    },
  medium: { color: '#f59e0b', label: 'Medium effort' },
  high:   { color: '#ef4444', label: 'High effort'   },
};

/** Animated semicircle gauge */
function WhatIfGauge({ current, projected, size = 160 }: {
  current: number; projected: number; size?: number;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const r  = size * 0.38;
  const sw = 10;
  const circumHalf = Math.PI * r;

  const filledCurrent   = (current   / 100) * circumHalf;
  const filledProjected = (projected / 100) * circumHalf;

  function tierColor(score: number) {
    if (score >= 85) return TEAL;
    if (score >= 70) return TEAL_LIGHT;
    if (score >= 55) return '#7ec8c0';
    return '#8b4f2c';
  }

  const projColor = tierColor(projected);

  return (
    <svg
      width={size}
      height={size * 0.6 + 10}
      viewBox={`0 0 ${size} ${size * 0.6 + 10}`}
      aria-label={`Match score gauge: ${current}% current, ${projected}% projected`}
      role="img"
    >
      {/* Track */}
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none"
        stroke="var(--surface-container-high, #e5e5e5)"
        strokeWidth={sw}
        strokeLinecap="round"
      />
      {/* Projected fill (animated) */}
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none"
        stroke={`${projColor}40`}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeDasharray={`${circumHalf}`}
        strokeDashoffset={circumHalf - filledProjected}
        style={{ transition: 'stroke-dashoffset 0.7s cubic-bezier(.4,0,.2,1), stroke 0.3s ease' }}
      />
      {/* Current fill */}
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none"
        stroke={TEAL}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeDasharray={`${circumHalf}`}
        strokeDashoffset={circumHalf - filledCurrent}
      />
      {/* Score labels */}
      {projected !== current && (
        <text
          x={cx}
          y={cy - 22}
          textAnchor="middle"
          dominantBaseline="central"
          style={{ fontSize: 13, fill: projColor, fontWeight: 600, transition: 'opacity 0.3s' }}
        >
          {projected}%
        </text>
      )}
      <text
        x={cx}
        y={cy - 6}
        textAnchor="middle"
        dominantBaseline="central"
        style={{ fontSize: projected !== current ? 12 : 18, fontWeight: 700, fill: TEAL }}
      >
        {projected !== current ? `was ${current}%` : `${current}%`}
      </text>
    </svg>
  );
}

/* ─── Main Component ─────────────────────────────────────────────── */

export default function WhatIfPanel({ careerTitle, currentScore, skills }: WhatIfPanelProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (skill: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(skill)) {
        next.delete(skill);
      } else {
        next.add(skill);
      }
      return next;
    });
  };

  const projectedScore = Math.min(
    98,
    currentScore +
      skills
        .filter(s => selected.has(s.skill))
        .reduce((sum, s) => sum + s.delta, 0),
  );

  const totalBoost  = projectedScore - currentScore;
  const topSkill    = skills[0]; // already sorted by delta desc
  const hasSelected = selected.size > 0;

  const panelStyle: CSSProperties = {
    marginTop: '1.25rem',
    padding: '1.5rem',
    borderRadius: '1.25rem',
    background: 'linear-gradient(135deg, #f7fafa 0%, #eefcfe 100%)',
    border: `1px solid ${TEAL_20}`,
  };

  const headerStyle: CSSProperties = {
    marginBottom: '1rem',
  };

  const titleStyle: CSSProperties = {
    fontFamily: 'var(--font-display, Georgia, serif)',
    fontSize: '1.05rem',
    fontWeight: 700,
    color: TEAL,
    margin: '0 0 0.25rem',
  };

  const scoreRowStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: 14,
    color: 'var(--on-surface, #444)',
    flexWrap: 'wrap',
  };

  const bodyStyle: CSSProperties = {
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  };

  const skillsListStyle: CSSProperties = {
    flex: '1 1 220px',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
  };

  const skillRowStyle = (isSelected: boolean): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.625rem 0.875rem',
    borderRadius: '0.75rem',
    border: `2px solid ${isSelected ? TEAL : 'var(--surface-container-low, #e8f6f8)'}`,
    background: isSelected ? `${TEAL}0d` : 'var(--surface-container-lowest, #fff)',
    cursor: 'pointer',
    transition: 'border-color 0.2s ease, background 0.2s ease, transform 0.15s ease',
    transform: isSelected ? 'scale(1.01)' : 'scale(1)',
    userSelect: 'none',
  });

  const checkboxStyle = (isSelected: boolean): CSSProperties => ({
    width: 18,
    height: 18,
    borderRadius: 4,
    border: `2px solid ${isSelected ? TEAL : '#bbb'}`,
    background: isSelected ? TEAL : 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'background 0.15s ease, border-color 0.15s ease',
  });

  const gaugeColStyle: CSSProperties = {
    flex: '0 0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.25rem',
  };

  const footerStyle: CSSProperties = {
    marginTop: '1rem',
    padding: '0.625rem 0.875rem',
    borderRadius: '0.75rem',
    background: hasSelected ? `${TEAL}0d` : 'var(--surface-container-low, #e8f6f8)',
    fontSize: 13,
    color: hasSelected ? TEAL : 'var(--on-surface, #666)',
    fontWeight: 600,
    transition: 'background 0.3s ease, color 0.3s ease',
  };

  return (
    <div style={panelStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h4 style={titleStyle}>Boost Your Match for {careerTitle}</h4>
        <div style={scoreRowStyle}>
          <span style={{ fontWeight: 700, color: TEAL }}>{currentScore}% current</span>
          {hasSelected && (
            <>
              <span style={{ color: '#aaa' }}>→</span>
              <span style={{ fontWeight: 700, color: TEAL_LIGHT }}>
                {projectedScore}% projected
              </span>
              <span style={{
                background: `${TEAL_LIGHT}20`,
                color: TEAL_LIGHT,
                borderRadius: '2rem',
                padding: '0.1rem 0.5rem',
                fontSize: 12,
                fontWeight: 700,
              }}>
                +{totalBoost}%
              </span>
            </>
          )}
          {!hasSelected && (
            <span style={{ color: 'var(--on-surface, #888)', fontSize: 13 }}>
              — check skills below to see your potential
            </span>
          )}
        </div>
      </div>

      {/* Body: skills list + gauge */}
      <div style={bodyStyle}>
        {/* Skills list */}
        <div style={skillsListStyle}>
          {skills.map(s => {
            const isSelected = selected.has(s.skill);
            const dot = EFFORT_DOT[s.effort];
            return (
              <div
                key={s.skill}
                style={skillRowStyle(isSelected)}
                onClick={() => toggle(s.skill)}
                role="checkbox"
                aria-checked={isSelected}
                tabIndex={0}
                onKeyDown={e => (e.key === ' ' || e.key === 'Enter') && toggle(s.skill)}
              >
                {/* Checkbox */}
                <div style={checkboxStyle(isSelected)} aria-hidden="true">
                  {isSelected && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>

                {/* Effort dot */}
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: dot.color,
                    flexShrink: 0,
                  }}
                  title={dot.label}
                  aria-label={dot.label}
                />

                {/* Skill name */}
                <span style={{
                  flex: 1,
                  fontSize: 14,
                  fontWeight: isSelected ? 600 : 400,
                  color: 'var(--on-surface, #222)',
                }}>
                  {s.skill}
                </span>

                {/* Delta + time */}
                <span style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: TEAL_LIGHT,
                  minWidth: 36,
                  textAlign: 'right',
                }}>
                  +{s.delta}%
                </span>
                <span style={{
                  fontSize: 12,
                  color: 'var(--on-surface, #888)',
                  minWidth: 60,
                  textAlign: 'right',
                }}>
                  {s.timeEstimate}
                </span>
              </div>
            );
          })}
        </div>

        {/* Gauge */}
        <div style={gaugeColStyle}>
          <WhatIfGauge current={currentScore} projected={projectedScore} size={140} />
          <span style={{ fontSize: 11, color: 'var(--on-surface, #888)', textAlign: 'center', maxWidth: 120 }}>
            {hasSelected ? 'Projected match' : 'Current match'}
          </span>
        </div>
      </div>

      {/* Footer hint */}
      <div style={footerStyle}>
        {hasSelected
          ? `Highest impact: ${topSkill.skill} (+${topSkill.delta}%) — select it to see the boost`
          : `Highest impact: ${topSkill.skill} (+${topSkill.delta}%)`}
      </div>
    </div>
  );
}
