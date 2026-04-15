import { useState, useCallback, type CSSProperties } from 'react';

const toValue = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '_');

interface DomainDef {
  label: string;
  color: string;
  emoji: string;
  skills: { value: string; label: string }[];
}

const DOMAINS: DomainDef[] = [
  {
    label: 'Technology', color: '#006a62', emoji: '💻',
    skills: ['Python', 'JavaScript', 'React', 'SQL', 'AWS', 'Docker', 'Git', 'TypeScript', 'Node.js', 'Kubernetes', 'Java', 'C++', 'Go', 'Rust', 'Linux'],
  },
  {
    label: 'Healthcare', color: '#0e7490', emoji: '🏥',
    skills: ['HIPAA Compliance', 'Epic/Cerner EHR', 'Patient Assessment', 'Medical Coding (ICD-10)', 'Clinical Research', 'Pharmacology', 'Telehealth'],
  },
  {
    label: 'Finance', color: '#8b4f2c', emoji: '📊',
    skills: ['Excel Modeling', 'QuickBooks', 'Bloomberg Terminal', 'GAAP/IFRS', 'Risk Analysis', 'Tax Preparation', 'SAP', 'Power BI'],
  },
  {
    label: 'Design', color: '#d97706', emoji: '🎨',
    skills: ['Figma', 'Adobe Creative Suite', 'UI/UX Research', 'Prototyping', 'Design Systems', 'Motion Design', 'Accessibility (WCAG)', 'Sketch'],
  },
  {
    label: 'Marketing', color: '#9333ea', emoji: '📣',
    skills: ['Google Analytics', 'SEO/SEM', 'HubSpot', 'Social Media Ads', 'Content Strategy', 'A/B Testing', 'Email Marketing', 'Copywriting'],
  },
  {
    label: 'Education', color: '#0369a1', emoji: '📚',
    skills: ['Curriculum Design', 'LMS (Canvas/Moodle)', 'Assessment Design', 'Classroom Management', 'Special Education (IEP)', 'EdTech Tools'],
  },
  {
    label: 'Engineering', color: '#1d4ed8', emoji: '⚙️',
    skills: ['AutoCAD/SolidWorks', 'MATLAB', 'PMP', 'Six Sigma', 'Structural Analysis', 'GIS', '3D Printing', 'FEA Simulation'],
  },
  {
    label: 'Legal', color: '#7c3aed', emoji: '⚖️',
    skills: ['Westlaw/LexisNexis', 'Contract Drafting', 'Regulatory Compliance', 'Case Management', 'Litigation Support', 'Legal Writing'],
  },
  {
    label: 'Science', color: '#0f766e', emoji: '🔬',
    skills: ['R/SPSS', 'Lab Techniques', 'Scientific Writing', 'Grant Writing', 'Peer Review', 'Data Analysis', 'MATLAB', 'Bioinformatics'],
  },
  {
    label: 'Business', color: '#b45309', emoji: '💼',
    skills: ['Salesforce CRM', 'Jira/Asana', 'Tableau/Power BI', 'Agile/Scrum', 'Supply Chain', 'Negotiation', 'Public Speaking'],
  },
  {
    label: 'Arts & Media', color: '#c2410c', emoji: '🎬',
    skills: ['Premiere/After Effects', 'Music Production (DAW)', 'Photography', 'Color Theory', 'Typography', 'Storytelling', 'Podcasting'],
  },
  {
    label: 'Trades', color: '#64748b', emoji: '🔧',
    skills: ['Blueprint Reading', 'OSHA Safety', 'Electrical Wiring', 'Welding', 'HVAC', 'Plumbing', 'Carpentry'],
  },
].map(d => ({
  ...d,
  skills: d.skills.map(s => ({ value: toValue(s), label: s })),
}));

/* ── Bubble cluster layout ─────────────────────────────────── */

// Position skill bubbles in a circular burst around the domain center
function getBubblePositions(count: number, radius: number): { x: number; y: number }[] {
  const positions: { x: number; y: number }[] = [];
  const angleStep = (2 * Math.PI) / count;
  const startAngle = -Math.PI / 2; // start from top
  for (let i = 0; i < count; i++) {
    const angle = startAngle + i * angleStep;
    // Add slight randomness for organic feel
    const r = radius + (i % 2 === 0 ? 0 : radius * 0.15);
    positions.push({
      x: Math.cos(angle) * r,
      y: Math.sin(angle) * r,
    });
  }
  return positions;
}

/* ── Component ─────────────────────────────────────────────── */

interface SkillDomainPickerProps {
  selected: string[];
  onToggle: (value: string) => void;
}

export function SkillDomainPicker({ selected, onToggle }: SkillDomainPickerProps) {
  const [activeDomain, setActiveDomain] = useState<string | null>(null);

  const toggleDomain = useCallback((label: string) => {
    setActiveDomain(prev => prev === label ? null : label);
  }, []);

  const domainCounts = new Map<string, number>();
  for (const domain of DOMAINS) {
    const count = domain.skills.filter(sk => selected.includes(sk.value)).length;
    if (count > 0) domainCounts.set(domain.label, count);
  }

  const activeDef = DOMAINS.find(d => d.label === activeDomain);

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <style>{`
        @keyframes bubblePop {
          0% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
          60% { transform: translate(var(--tx), var(--ty)) scale(1.1); opacity: 1; }
          100% { transform: translate(var(--tx), var(--ty)) scale(1); opacity: 1; }
        }
        @keyframes domainPulse {
          0%, 100% { box-shadow: 0 0 0 0 var(--pulse-color); }
          50% { box-shadow: 0 0 0 8px transparent; }
        }
      `}</style>

      {/* Domain bubbles - circular grid */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '0.6rem',
        justifyContent: 'center', maxWidth: 500,
      }}>
        {DOMAINS.map(domain => {
          const isActive = activeDomain === domain.label;
          const count = domainCounts.get(domain.label) || 0;

          return (
            <button
              key={domain.label}
              onClick={() => toggleDomain(domain.label)}
              style={{
                position: 'relative',
                width: 72, height: 72,
                borderRadius: '50%',
                border: `2.5px solid ${isActive ? domain.color : count > 0 ? domain.color + '66' : 'var(--surface-container-high, #d0e3e6)'}`,
                background: isActive ? domain.color + '15' : count > 0 ? domain.color + '08' : 'var(--surface-container-lowest, #fff)',
                cursor: 'pointer',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 2,
                transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                transform: isActive ? 'scale(1.12)' : 'scale(1)',
                '--pulse-color': domain.color + '40',
                animation: isActive ? 'domainPulse 2s ease infinite' : 'none',
              } as CSSProperties}
              aria-expanded={isActive}
              aria-label={`${domain.label} - ${count} skills selected`}
            >
              <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>{domain.emoji}</span>
              <span style={{
                fontSize: '0.58rem', fontWeight: 700, lineHeight: 1.1,
                color: isActive || count > 0 ? domain.color : 'var(--on-surface-variant)',
                textAlign: 'center', maxWidth: 60,
              }}>
                {domain.label}
              </span>
              {count > 0 && (
                <span style={{
                  position: 'absolute', top: -2, right: -2,
                  width: 18, height: 18, borderRadius: '50%',
                  background: domain.color, color: '#fff',
                  fontSize: '0.6rem', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Skill bubbles - burst from active domain */}
      {activeDef && (
        <div style={{
          position: 'relative',
          width: '100%', minHeight: 280,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {/* Center label */}
          <div style={{
            position: 'absolute',
            width: 80, height: 80, borderRadius: '50%',
            background: activeDef.color + '18',
            border: `2px solid ${activeDef.color}44`,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            zIndex: 2,
          }}>
            <span style={{ fontSize: '1.5rem' }}>{activeDef.emoji}</span>
            <span style={{ fontSize: '0.6rem', fontWeight: 700, color: activeDef.color }}>{activeDef.label}</span>
          </div>

          {/* Branching skill bubbles */}
          {(() => {
            const positions = getBubblePositions(activeDef.skills.length, 110);
            return activeDef.skills.map((skill, i) => {
              const pos = positions[i];
              const isSel = selected.includes(skill.value);
              const delay = i * 0.04;

              return (
                <button
                  key={skill.value}
                  onClick={() => onToggle(skill.value)}
                  style={{
                    position: 'absolute',
                    left: '50%', top: '50%',
                    '--tx': `${pos.x}px`,
                    '--ty': `${pos.y}px`,
                    transform: `translate(${pos.x}px, ${pos.y}px)`,
                    marginLeft: -40, marginTop: -18,
                    width: 80, minHeight: 36,
                    borderRadius: 'var(--radius-full, 9999px)',
                    border: `2px solid ${isSel ? 'var(--copper, #8b4f2c)' : activeDef.color + '44'}`,
                    background: isSel ? 'rgba(139,79,44,0.14)' : 'var(--surface-container-lowest, #fff)',
                    color: isSel ? 'var(--copper, #8b4f2c)' : 'var(--on-surface, #1a1c1f)',
                    fontSize: '0.72rem', fontWeight: isSel ? 700 : 500,
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    textAlign: 'center',
                    padding: '4px 8px',
                    lineHeight: 1.2,
                    animation: `bubblePop 0.4s ${delay}s cubic-bezier(0.34,1.56,0.64,1) both`,
                    transition: 'border-color 0.2s, background 0.2s, color 0.2s',
                    zIndex: 1,
                    boxShadow: isSel ? '0 2px 8px rgba(139,79,44,0.2)' : '0 1px 4px rgba(0,0,0,0.06)',
                  } as CSSProperties}
                >
                  {isSel && '✓ '}{skill.label}
                </button>
              );
            });
          })()}

          {/* Connecting lines from center to each bubble */}
          <svg style={{
            position: 'absolute', left: '50%', top: '50%',
            width: 0, height: 0, overflow: 'visible', zIndex: 0,
            pointerEvents: 'none',
          }}>
            {getBubblePositions(activeDef.skills.length, 110).map((pos, i) => (
              <line
                key={i}
                x1={0} y1={0} x2={pos.x} y2={pos.y}
                stroke={activeDef.color + '22'}
                strokeWidth={1.5}
                strokeDasharray="4 3"
              />
            ))}
          </svg>
        </div>
      )}

      {/* Selected count */}
      {selected.length > 0 && (
        <p style={{
          fontSize: '0.8rem', fontWeight: 600,
          color: 'var(--copper, #8b4f2c)',
          textAlign: 'center',
        }}>
          {selected.length} skill{selected.length !== 1 ? 's' : ''} selected
        </p>
      )}
    </div>
  );
}

export default SkillDomainPicker;
