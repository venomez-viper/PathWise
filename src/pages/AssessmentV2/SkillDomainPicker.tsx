import { useState, useCallback } from 'react';
import { Check } from 'lucide-react';

const toValue = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '_');

interface DomainDef {
  label: string;
  color: string;
  skills: { value: string; label: string }[];
}

const DOMAINS: DomainDef[] = [
  {
    label: 'Technology', color: '#006a62',
    skills: ['Python', 'JavaScript', 'React', 'SQL', 'AWS', 'Docker', 'Git', 'TypeScript', 'Node.js', 'Kubernetes', 'Java', 'C++', 'Go', 'Rust', 'Linux', 'MongoDB', 'PostgreSQL', 'GraphQL', 'REST APIs', 'CI/CD'],
  },
  {
    label: 'Data & AI', color: '#059669',
    skills: ['Machine Learning', 'TensorFlow/PyTorch', 'Pandas/NumPy', 'Data Pipelines', 'NLP', 'Computer Vision', 'Spark', 'Jupyter', 'Feature Engineering', 'MLOps', 'Deep Learning', 'LLMs/Prompt Engineering'],
  },
  {
    label: 'Healthcare', color: '#0e7490',
    skills: ['HIPAA Compliance', 'Epic/Cerner EHR', 'Patient Assessment', 'Medical Coding (ICD-10)', 'Clinical Research', 'Pharmacology', 'Telehealth', 'Medical Imaging', 'FHIR/HL7', 'Clinical Trials', 'CPR/BLS', 'Lab Diagnostics'],
  },
  {
    label: 'Finance', color: '#8b4f2c',
    skills: ['Excel Modeling', 'QuickBooks', 'Bloomberg Terminal', 'GAAP/IFRS', 'Risk Analysis', 'Tax Preparation', 'SAP', 'Power BI', 'DCF Valuation', 'Derivatives', 'Financial Planning', 'Auditing', 'Crypto/Blockchain'],
  },
  {
    label: 'Design', color: '#d97706',
    skills: ['Figma', 'Adobe Creative Suite', 'UI/UX Research', 'Prototyping', 'Design Systems', 'Motion Design', 'Accessibility (WCAG)', 'Sketch', 'Wireframing', 'User Testing', 'Responsive Design', 'Brand Identity', 'Illustration'],
  },
  {
    label: 'Marketing', color: '#9333ea',
    skills: ['Google Analytics', 'SEO/SEM', 'HubSpot', 'Social Media Ads', 'Content Strategy', 'A/B Testing', 'Email Marketing', 'Copywriting', 'TikTok/Reels', 'Influencer Marketing', 'Brand Strategy', 'PR/Communications', 'Market Research'],
  },
  {
    label: 'Education', color: '#0369a1',
    skills: ['Curriculum Design', 'LMS (Canvas/Moodle)', 'Assessment Design', 'Classroom Management', 'Special Education (IEP)', 'EdTech Tools', 'Tutoring', 'Instructional Design', 'E-Learning Development', 'Student Counseling', 'Grant Writing', 'Research Methods'],
  },
  {
    label: 'Engineering', color: '#1d4ed8',
    skills: ['AutoCAD/SolidWorks', 'MATLAB', 'PMP', 'Six Sigma', 'Structural Analysis', 'GIS', '3D Printing', 'FEA Simulation', 'Lean Manufacturing', 'Robotics', 'PCB Design', 'Thermodynamics', 'Systems Engineering'],
  },
  {
    label: 'Legal', color: '#7c3aed',
    skills: ['Westlaw/LexisNexis', 'Contract Drafting', 'Regulatory Compliance', 'Case Management', 'Litigation Support', 'Legal Writing', 'IP Law', 'Due Diligence', 'Mediation', 'Corporate Governance', 'Privacy Law (GDPR)', 'Paralegal Skills'],
  },
  {
    label: 'Science', color: '#0f766e',
    skills: ['R/SPSS', 'Lab Techniques', 'Scientific Writing', 'Grant Writing', 'Peer Review', 'Data Analysis', 'MATLAB', 'Bioinformatics', 'PCR/Sequencing', 'Microscopy', 'Statistical Modeling', 'Environmental Sampling', 'GMP/GLP'],
  },
  {
    label: 'Business', color: '#b45309',
    skills: ['Salesforce CRM', 'Jira/Asana', 'Tableau/Power BI', 'Agile/Scrum', 'Supply Chain', 'Negotiation', 'Public Speaking', 'Strategic Planning', 'Budgeting', 'Stakeholder Management', 'Change Management', 'OKRs/KPIs', 'Consulting'],
  },
  {
    label: 'Arts & Media', color: '#c2410c',
    skills: ['Premiere/After Effects', 'Music Production (DAW)', 'Photography', 'Color Theory', 'Typography', 'Storytelling', 'Podcasting', 'Video Editing', 'Animation', 'Sound Design', 'Screenwriting', 'Live Streaming', 'Graphic Novels'],
  },
  {
    label: 'Trades', color: '#64748b',
    skills: ['Blueprint Reading', 'OSHA Safety', 'Electrical Wiring', 'Welding', 'HVAC', 'Plumbing', 'Carpentry', 'CNC Machining', 'Auto Repair', 'Solar Installation', 'Masonry', 'Heavy Equipment', 'Fire Safety'],
  },
].map(d => ({
  ...d,
  skills: d.skills.map(s => ({ value: toValue(s), label: s })),
}));

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
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <style>{`
        @keyframes skillFadeIn {
          from { opacity: 0; transform: scale(0.85) translateY(6px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

      {/* Domain pills */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '0.5rem',
        justifyContent: 'center',
      }}>
        {DOMAINS.map(domain => {
          const isActive = activeDomain === domain.label;
          const count = domainCounts.get(domain.label) || 0;

          return (
            <button
              key={domain.label}
              onClick={() => toggleDomain(domain.label)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '0.5rem 0.9rem',
                borderRadius: 'var(--radius-full, 9999px)',
                border: `2px solid ${isActive ? domain.color : count > 0 ? domain.color + '55' : 'var(--surface-container-high, #d0e3e6)'}`,
                background: isActive ? domain.color : count > 0 ? domain.color + '0c' : 'var(--surface-container-lowest, #fff)',
                color: isActive ? '#fff' : count > 0 ? domain.color : 'var(--on-surface, #1a1c1f)',
                cursor: 'pointer',
                fontSize: '0.82rem', fontWeight: 600,
                transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
                transform: isActive ? 'scale(1.05)' : 'scale(1)',
                whiteSpace: 'nowrap',
              }}
              aria-expanded={isActive}
              aria-label={`${domain.label} - ${count} skills selected`}
            >
              {domain.label}
              {count > 0 && (
                <span style={{
                  width: 20, height: 20, borderRadius: '50%',
                  background: isActive ? 'rgba(255,255,255,0.3)' : domain.color,
                  color: '#fff',
                  fontSize: '0.65rem', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Expanded skill grid */}
      {activeDef && (
        <div style={{
          background: activeDef.color + '08',
          border: `1.5px solid ${activeDef.color}20`,
          borderRadius: 'var(--radius-xl, 1.5rem)',
          padding: '1.25rem',
          animation: 'skillFadeIn 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            marginBottom: '1rem', paddingBottom: '0.75rem',
            borderBottom: `1px solid ${activeDef.color}15`,
          }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: activeDef.color }}>
              {activeDef.label}
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--on-surface-muted)', marginLeft: 'auto' }}>
              Tap to select skills you know
            </span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
            {activeDef.skills.map((skill, i) => {
              const isSel = selected.includes(skill.value);
              return (
                <button
                  key={skill.value}
                  onClick={() => onToggle(skill.value)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '0.45rem 0.85rem',
                    borderRadius: 'var(--radius-full, 9999px)',
                    border: `1.5px solid ${isSel ? 'var(--copper, #8b4f2c)' : activeDef.color + '30'}`,
                    background: isSel ? 'var(--copper, #8b4f2c)' : 'var(--surface-container-lowest, #fff)',
                    color: isSel ? '#fff' : 'var(--on-surface, #1a1c1f)',
                    fontSize: '0.8rem',
                    fontWeight: isSel ? 600 : 400,
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.34,1.56,0.64,1)',
                    transform: isSel ? 'scale(1.03)' : 'scale(1)',
                    animation: `skillFadeIn 0.25s ${i * 0.02}s cubic-bezier(0.34,1.56,0.64,1) both`,
                    boxShadow: isSel ? '0 2px 8px rgba(139,79,44,0.25)' : 'none',
                  }}
                >
                  {isSel && <Check size={13} strokeWidth={3} />}
                  {skill.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {selected.length > 0 && (
        <div style={{
          textAlign: 'center', fontSize: '0.82rem', fontWeight: 600,
          color: 'var(--copper, #8b4f2c)',
        }}>
          {selected.length} skill{selected.length !== 1 ? 's' : ''} selected
        </div>
      )}
    </div>
  );
}

export default SkillDomainPicker;
