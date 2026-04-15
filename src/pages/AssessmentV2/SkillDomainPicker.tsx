import { useState, useCallback, type CSSProperties } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

/* ══════════════════════════════════════════════════════════════════
   DOMAIN / SKILL DATA
   ══════════════════════════════════════════════════════════════════ */

const toValue = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '_');

interface DomainDef {
  label: string;
  color: string;
  skills: { value: string; label: string }[];
}

const DOMAINS: DomainDef[] = [
  {
    label: 'Technology',
    color: '#006a62',
    skills: ['Python', 'JavaScript', 'React', 'SQL', 'AWS', 'Docker', 'Git', 'TypeScript', 'Node.js', 'Kubernetes'],
  },
  {
    label: 'Healthcare',
    color: '#0e7490',
    skills: ['HIPAA Compliance', 'Epic/Cerner EHR', 'Patient Assessment', 'Medical Coding (ICD-10)', 'Clinical Research', 'Pharmacology', 'Telehealth Platforms'],
  },
  {
    label: 'Finance',
    color: '#8b4f2c',
    skills: ['Excel/Financial Modeling', 'QuickBooks', 'Bloomberg Terminal', 'GAAP/IFRS', 'Risk Analysis', 'Tax Preparation', 'SAP'],
  },
  {
    label: 'Design',
    color: '#d97706',
    skills: ['Figma', 'Adobe Creative Suite', 'UI/UX Research', 'Prototyping', 'Design Systems', 'Motion Design', 'Accessibility (WCAG)'],
  },
  {
    label: 'Marketing',
    color: '#9333ea',
    skills: ['Google Analytics', 'SEO/SEM', 'HubSpot/Marketo', 'Social Media Ads', 'Content Strategy', 'A/B Testing', 'Email Marketing'],
  },
  {
    label: 'Education',
    color: '#0369a1',
    skills: ['Curriculum Design', 'LMS (Canvas/Moodle)', 'Assessment Design', 'Classroom Management', 'Special Education (IEP)', 'EdTech Tools'],
  },
  {
    label: 'Engineering',
    color: '#1d4ed8',
    skills: ['CAD (AutoCAD/SolidWorks)', 'MATLAB', 'Project Management (PMP)', 'Quality Control (Six Sigma)', 'Structural Analysis', 'GIS'],
  },
  {
    label: 'Legal',
    color: '#7c3aed',
    skills: ['Legal Research (Westlaw/LexisNexis)', 'Contract Drafting', 'Regulatory Compliance', 'Case Management Software', 'Litigation Support'],
  },
  {
    label: 'Science',
    color: '#0f766e',
    skills: ['R/SPSS Statistics', 'Lab Techniques', 'Scientific Writing', 'Grant Writing', 'Peer Review', 'Data Analysis'],
  },
  {
    label: 'Business',
    color: '#b45309',
    skills: ['Salesforce CRM', 'Project Management (Jira/Asana)', 'Business Intelligence (Tableau/Power BI)', 'Agile/Scrum', 'Supply Chain Management'],
  },
  {
    label: 'Arts',
    color: '#c2410c',
    skills: ['Adobe Premiere/After Effects', 'Music Production (DAW)', 'Portfolio Development', 'Color Theory', 'Typography'],
  },
  {
    label: 'Trades',
    color: '#64748b',
    skills: ['Blueprint Reading', 'OSHA Safety', 'Electrical Wiring (NEC)', 'Welding Certification', 'HVAC Systems'],
  },
].map(d => ({
  ...d,
  skills: d.skills.map(s => ({ value: toValue(s), label: s })),
}));

/* ══════════════════════════════════════════════════════════════════
   STYLES
   ══════════════════════════════════════════════════════════════════ */

const sty = {
  wrapper: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
  },
  domainGrid: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.5rem',
    justifyContent: 'center',
    width: '100%',
  },
  domainBubble: (color: string, isOpen: boolean, hasSelected: boolean): CSSProperties => ({
    padding: '0.55rem 1rem',
    borderRadius: 'var(--radius-sm, 0.75rem)',
    border: '2px solid',
    borderColor: isOpen ? color : hasSelected ? color + '88' : 'var(--surface-container-low, #e8f6f8)',
    background: isOpen ? color + '18' : hasSelected ? color + '0c' : 'var(--surface-container, #f0fafb)',
    color: isOpen || hasSelected ? color : 'var(--on-surface, #1a1c1f)',
    fontSize: '0.85rem',
    fontWeight: isOpen || hasSelected ? 700 : 500,
    cursor: 'pointer',
    transition: 'all 0.25s cubic-bezier(0.33,1,0.68,1)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    userSelect: 'none' as const,
    transform: isOpen ? 'scale(1.05)' : 'scale(1)',
    whiteSpace: 'nowrap' as const,
  }),
  domainCount: (color: string): CSSProperties => ({
    fontSize: '0.65rem',
    fontWeight: 700,
    background: color,
    color: '#fff',
    borderRadius: '2rem',
    padding: '0.05rem 0.4rem',
    minWidth: 16,
    textAlign: 'center' as const,
    lineHeight: '1.4',
  }),
  expandedSection: (color: string): CSSProperties => ({
    width: '100%',
    background: color + '08',
    borderRadius: 'var(--radius-sm, 0.75rem)',
    border: `1.5px solid ${color}30`,
    padding: '0.75rem',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
    animation: 'sdpSlideIn 0.3s cubic-bezier(0.33,1,0.68,1)',
  }),
  expandedHeader: (color: string): CSSProperties => ({
    fontSize: '0.78rem',
    fontWeight: 700,
    color,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.04em',
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
  }),
  skillsWrap: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.4rem',
  },
  skillChip: (selected: boolean, domainColor: string): CSSProperties => ({
    padding: '0.4rem 0.8rem',
    borderRadius: 'var(--radius-full, 9999px)',
    border: '2px solid',
    borderColor: selected ? 'var(--copper, #8b4f2c)' : domainColor + '44',
    background: selected ? 'rgba(139, 79, 44, 0.12)' : 'var(--surface-container-lowest, #ffffff)',
    color: selected ? 'var(--copper, #8b4f2c)' : 'var(--on-surface, #1a1c1f)',
    fontSize: '0.82rem',
    fontWeight: selected ? 600 : 400,
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.34,1.56,0.64,1)',
    transform: selected ? 'scale(1.04)' : 'scale(1)',
    userSelect: 'none' as const,
  }),
  counter: {
    fontSize: '0.8rem',
    color: 'var(--on-surface-muted, #78747e)',
    textAlign: 'center' as const,
    fontWeight: 600 as const,
  },
};

/* keyframe for slide-in animation */
const keyframeStyle = `
@keyframes sdpSlideIn {
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
}`;

/* ══════════════════════════════════════════════════════════════════
   COMPONENT
   ══════════════════════════════════════════════════════════════════ */

interface SkillDomainPickerProps {
  selected: string[];
  onToggle: (value: string) => void;
}

export function SkillDomainPicker({ selected, onToggle }: SkillDomainPickerProps) {
  const [openDomains, setOpenDomains] = useState<Set<string>>(new Set());

  const toggleDomain = useCallback((domain: string) => {
    setOpenDomains(prev => {
      const next = new Set(prev);
      if (next.has(domain)) {
        next.delete(domain);
      } else {
        next.add(domain);
      }
      return next;
    });
  }, []);

  // Count selected skills per domain
  const domainCounts = new Map<string, number>();
  for (const domain of DOMAINS) {
    const count = domain.skills.filter(sk => selected.includes(sk.value)).length;
    if (count > 0) domainCounts.set(domain.label, count);
  }

  // Collect open domains in order for expansion panels below the grid
  const openList = DOMAINS.filter(d => openDomains.has(d.label));

  return (
    <div style={sty.wrapper}>
      {/* Inject keyframe */}
      <style>{keyframeStyle}</style>

      {/* Domain bubble grid */}
      <div style={sty.domainGrid}>
        {DOMAINS.map(domain => {
          const isOpen = openDomains.has(domain.label);
          const count = domainCounts.get(domain.label) || 0;
          const hasSelected = count > 0;
          const ChevronIcon = isOpen ? ChevronUp : ChevronDown;

          return (
            <button
              key={domain.label}
              style={sty.domainBubble(domain.color, isOpen, hasSelected)}
              onClick={() => toggleDomain(domain.label)}
              aria-expanded={isOpen}
            >
              {domain.label}
              {hasSelected && (
                <span style={sty.domainCount(domain.color)}>{count}</span>
              )}
              <ChevronIcon size={13} style={{ opacity: 0.5, flexShrink: 0 }} />
            </button>
          );
        })}
      </div>

      {/* Expanded skill panels */}
      {openList.map(domain => (
        <div key={domain.label} style={sty.expandedSection(domain.color)}>
          <div style={sty.expandedHeader(domain.color)}>
            {domain.label}
          </div>
          <div style={sty.skillsWrap}>
            {domain.skills.map(skill => {
              const isSel = selected.includes(skill.value);
              return (
                <button
                  key={skill.value}
                  style={sty.skillChip(isSel, domain.color)}
                  onClick={() => onToggle(skill.value)}
                >
                  {isSel && '\u2713 '}{skill.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Counter */}
      <p style={sty.counter}>
        Selected ({selected.length})
      </p>
    </div>
  );
}

export default SkillDomainPicker;
