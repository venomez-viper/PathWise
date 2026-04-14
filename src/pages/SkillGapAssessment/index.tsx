import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Loader2, Sparkles, AlertTriangle, Target } from 'lucide-react';
import { useAuth } from '../../lib/auth-context';
import { assessment as assessmentApi } from '../../lib/api';
import '../Assessment/Assessment.css';

/* ── Constants ── */

const TECHNICAL_SKILLS = [
  'Python', 'SQL', 'JavaScript', 'Machine Learning',
  'Cloud (AWS/GCP/Azure)', 'Data Visualization', 'APIs / Backend', 'Version Control (Git)',
];

const SOFT_SKILLS = [
  'Communication', 'Leadership', 'Problem Solving',
  'Teamwork', 'Time Management', 'Adaptability',
];

const TOOL_GROUPS: { label: string; tools: string[] }[] = [
  {
    label: 'IDEs & Dev Tools',
    tools: ['VS Code', 'IntelliJ', 'Jupyter Notebook', 'Docker', 'Git/GitHub'],
  },
  {
    label: 'Platforms & Cloud',
    tools: ['AWS', 'Google Cloud', 'Azure', 'Figma', 'Jira', 'Notion', 'Slack'],
  },
];

const EXPERIENCE_OPTIONS = [
  'Student', '0–1 yr', '1–3 yrs', '3–5 yrs', '5+ yrs',
];

const LEARNING_STYLES = [
  'Video courses', 'Books', 'Projects', 'Bootcamps', 'Mentorship',
];

const PROFICIENCY_LEVELS = ['none', 'beginner', 'intermediate', 'advanced'] as const;
type Proficiency = typeof PROFICIENCY_LEVELS[number];

const LEVEL_LABELS: Record<Proficiency, string> = {
  none: 'None',
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

const TOTAL_STEPS = 5;

/* ── Segmented button styles ── */

const segBtnBase: React.CSSProperties = {
  padding: '0.35rem 0.7rem',
  fontSize: '0.72rem',
  fontWeight: 600,
  borderRadius: 999,
  border: '1px solid var(--outline-variant)',
  background: 'transparent',
  color: 'var(--on-surface-variant)',
  cursor: 'pointer',
  transition: 'all 0.15s',
  whiteSpace: 'nowrap',
};

const segBtnSelected: React.CSSProperties = {
  ...segBtnBase,
  background: 'var(--primary)',
  color: 'var(--on-primary, #fff)',
  borderColor: 'var(--primary)',
};

/* ── Skill gap result type ── */

interface SkillGapItem {
  skill: string;
  importance: 'high' | 'medium' | 'low';
  learningResource: string;
  currentLevel: string;
  targetLevel: string;
}

interface SkillGapResult {
  skillGaps: SkillGapItem[];
  summary: string;
  topPriority: string;
}

/* ── Component ── */

export default function SkillGapAssessment() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);

  // Step 0 — Target Role
  const [targetRole, setTargetRole] = useState('');
  const [currentRole, setCurrentRole] = useState('');

  // Step 1 — Technical Skills
  const [technicalSkills, setTechnicalSkills] = useState<Record<string, Proficiency>>({});

  // Step 2 — Soft Skills
  const [softSkills, setSoftSkills] = useState<Record<string, Proficiency>>({});

  // Step 3 — Tools
  const [tools, setTools] = useState<string[]>([]);

  // Step 4 — Experience & Goals
  const [yearsExperience, setYearsExperience] = useState('');
  const [biggestGap, setBiggestGap] = useState('');
  const [learningStyle, setLearningStyle] = useState<string[]>([]);

  // Results
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<SkillGapResult | null>(null);

  /* ── Helpers ── */

  const setSkillLevel = (
    skill: string,
    level: Proficiency,
    setter: React.Dispatch<React.SetStateAction<Record<string, Proficiency>>>,
  ) => {
    setter(prev => ({ ...prev, [skill]: level }));
  };

  const toggleTool = (tool: string) => {
    setTools(prev =>
      prev.includes(tool) ? prev.filter(t => t !== tool) : [...prev, tool],
    );
  };

  const toggleLearningStyle = (style: string) => {
    setLearningStyle(prev =>
      prev.includes(style) ? prev.filter(s => s !== style) : [...prev, style],
    );
  };

  const ratedCount = (skills: Record<string, Proficiency>) =>
    Object.values(skills).filter(v => v && v !== 'none').length;

  const canNext = (): boolean => {
    if (step === 0) return targetRole.trim().length >= 2;
    if (step === 1) return ratedCount(technicalSkills) >= 1;
    if (step === 2) return ratedCount(softSkills) >= 1;
    if (step === 3) return tools.length >= 1;
    if (step === 4) return !!yearsExperience;
    return true;
  };

  const handleSubmit = async () => {
    if (!user) {
      setError('You must be signed in.');
      return;
    }
    setStep(5);
    setLoading(true);
    setError('');
    try {
      const res: any = await assessmentApi.getSkillGapAnalysis({
        userId: user.id,
        targetRole: targetRole.trim(),
        currentRole: currentRole.trim() || undefined,
        technicalSkills,
        softSkills,
        tools,
        yearsExperience,
        biggestGap: biggestGap.trim(),
        learningStyle,
      });
      setResult(res.result);
      setLoading(false);
      setStep(6);
    } catch (err: unknown) {
      setLoading(false);
      setStep(4);
      setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.');
    }
  };

  const pct = Math.round((Math.min(step, TOTAL_STEPS) / TOTAL_STEPS) * 100);

  const importanceBadge = (importance: 'high' | 'medium' | 'low') => {
    const colors: Record<string, { bg: string; text: string }> = {
      high: { bg: 'rgba(248,113,113,0.15)', text: '#f87171' },
      medium: { bg: 'rgba(251,191,36,0.15)', text: '#fbbf24' },
      low: { bg: 'rgba(52,211,153,0.15)', text: '#34d399' },
    };
    const c = colors[importance];
    return (
      <span
        style={{
          fontSize: '0.65rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          padding: '0.2rem 0.55rem',
          borderRadius: 999,
          background: c.bg,
          color: c.text,
        }}
      >
        {importance}
      </span>
    );
  };

  /* ── Render helpers ── */

  const renderSkillRows = (
    skills: string[],
    state: Record<string, Proficiency>,
    setter: React.Dispatch<React.SetStateAction<Record<string, Proficiency>>>,
  ) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: '1.5rem' }}>
      {skills.map(skill => (
        <div
          key={skill}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              minWidth: 140,
              fontSize: '0.85rem',
              color: 'var(--on-surface)',
              fontWeight: 500,
            }}
          >
            {skill}
          </span>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {PROFICIENCY_LEVELS.map(level => (
              <button
                key={level}
                type="button"
                style={state[skill] === level ? segBtnSelected : segBtnBase}
                onClick={() => setSkillLevel(skill, level, setter)}
                aria-label={`${skill} — ${LEVEL_LABELS[level]}`}
                aria-pressed={state[skill] === level}
              >
                {LEVEL_LABELS[level]}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  /* ── Main render ── */

  return (
    <div className="assessment">
      <div style={{ width: '100%', maxWidth: 560, margin: '0 auto' }}>

        {/* Progress bar */}
        {step < 5 && (
          <div className="assessment__progress">
            <div className="assessment__progress-bar">
              <div className="assessment__progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="assessment__progress-label">
              {Math.min(step + 1, TOTAL_STEPS)} / {TOTAL_STEPS}
            </span>
          </div>
        )}

        {/* ── Step 0: Target Role ── */}
        {step === 0 && (
          <div className="assessment__card">
            <p className="assessment__eyebrow">Step 1 of {TOTAL_STEPS} — Target Role</p>
            <h1 className="assessment__title">What role are you targeting?</h1>
            <p className="assessment__sub">
              Tell us the role you want to grow into so we can identify your gaps.
            </p>
            <input
              type="text"
              className="assessment__input"
              placeholder='e.g. "Data Scientist", "Frontend Engineer"'
              value={targetRole}
              onChange={e => setTargetRole(e.target.value)}
              autoFocus
            />
            <p className="assessment__sub" style={{ marginTop: 0 }}>
              Current role / background (optional)
            </p>
            <input
              type="text"
              className="assessment__input"
              placeholder="e.g. Marketing Analyst, CS Student..."
              value={currentRole}
              onChange={e => setCurrentRole(e.target.value)}
            />
            <div className="assessment__nav">
              <button
                className="assessment__btn"
                disabled={!canNext()}
                onClick={() => setStep(1)}
              >
                Next <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 1: Technical Skills ── */}
        {step === 1 && (
          <div className="assessment__card">
            <p className="assessment__eyebrow">Step 2 of {TOTAL_STEPS} — Technical Skills</p>
            <h1 className="assessment__title">Rate your technical skills</h1>
            <p className="assessment__sub">
              Be honest — this helps us find your real gaps.
            </p>
            {renderSkillRows(TECHNICAL_SKILLS, technicalSkills, setTechnicalSkills)}
            <p className="assessment__hint">
              {ratedCount(technicalSkills)} / {TECHNICAL_SKILLS.length} skills rated
            </p>
            <div className="assessment__nav">
              <button
                className="assessment__btn assessment__btn--back"
                onClick={() => setStep(0)}
              >
                <ArrowLeft size={15} /> Back
              </button>
              <button
                className="assessment__btn"
                disabled={!canNext()}
                onClick={() => setStep(2)}
              >
                Next <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Soft Skills ── */}
        {step === 2 && (
          <div className="assessment__card">
            <p className="assessment__eyebrow">Step 3 of {TOTAL_STEPS} — Soft Skills</p>
            <h1 className="assessment__title">Rate your soft skills</h1>
            <p className="assessment__sub">
              These matter just as much for career growth.
            </p>
            {renderSkillRows(SOFT_SKILLS, softSkills, setSoftSkills)}
            <p className="assessment__hint">
              {ratedCount(softSkills)} / {SOFT_SKILLS.length} skills rated
            </p>
            <div className="assessment__nav">
              <button
                className="assessment__btn assessment__btn--back"
                onClick={() => setStep(1)}
              >
                <ArrowLeft size={15} /> Back
              </button>
              <button
                className="assessment__btn"
                disabled={!canNext()}
                onClick={() => setStep(3)}
              >
                Next <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Tools & Platforms ── */}
        {step === 3 && (
          <div className="assessment__card">
            <p className="assessment__eyebrow">Step 4 of {TOTAL_STEPS} — Tools & Platforms</p>
            <h1 className="assessment__title">Which tools have you used?</h1>
            <p className="assessment__sub">
              Select all tools and platforms you have experience with.
            </p>
            {TOOL_GROUPS.map(group => (
              <div key={group.label} style={{ marginBottom: '1.25rem' }}>
                <p
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--on-surface-variant)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: '0.5rem',
                  }}
                >
                  {group.label}
                </p>
                <div className="assessment__options">
                  {group.tools.map(tool => (
                    <button
                      key={tool}
                      className={`assessment__chip${tools.includes(tool) ? ' selected' : ''}`}
                      onClick={() => toggleTool(tool)}
                      aria-pressed={tools.includes(tool)}
                    >
                      {tools.includes(tool) && (
                        <span className="assessment__chip-check">&#10003;</span>
                      )}
                      {tool}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <p className="assessment__hint">{tools.length} tools selected</p>
            <div className="assessment__nav">
              <button
                className="assessment__btn assessment__btn--back"
                onClick={() => setStep(2)}
              >
                <ArrowLeft size={15} /> Back
              </button>
              <button
                className="assessment__btn"
                disabled={!canNext()}
                onClick={() => setStep(4)}
              >
                Next <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 4: Experience & Goals ── */}
        {step === 4 && (
          <div className="assessment__card">
            <p className="assessment__eyebrow">Step 5 of {TOTAL_STEPS} — Experience & Goals</p>
            <h1 className="assessment__title">Almost there — a few more details</h1>
            <p className="assessment__sub">This helps us tailor your analysis.</p>

            {/* Years of experience */}
            <p
              style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'var(--on-surface)',
                marginBottom: '0.5rem',
              }}
            >
              Years of experience
            </p>
            <div className="assessment__options" style={{ marginBottom: '1.25rem' }}>
              {EXPERIENCE_OPTIONS.map(opt => (
                <button
                  key={opt}
                  className={`assessment__option${yearsExperience === opt ? ' selected' : ''}`}
                  style={{ borderRadius: 999 }}
                  onClick={() => setYearsExperience(opt)}
                  aria-pressed={yearsExperience === opt}
                >
                  {opt}
                </button>
              ))}
            </div>

            {/* Biggest gap */}
            <p
              style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'var(--on-surface)',
                marginBottom: '0.5rem',
              }}
            >
              What's your biggest skill gap?
            </p>
            <textarea
              className="assessment__input"
              placeholder="e.g. I struggle with system design interviews..."
              value={biggestGap}
              onChange={e => setBiggestGap(e.target.value.slice(0, 200))}
              maxLength={200}
              rows={3}
              style={{ resize: 'none', fontFamily: 'var(--font-body)' }}
            />
            <p className="assessment__hint" style={{ marginTop: '-1rem' }}>
              {biggestGap.length}/200 characters
            </p>

            {/* Learning style */}
            <p
              style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'var(--on-surface)',
                marginBottom: '0.5rem',
              }}
            >
              How do you prefer to learn?
            </p>
            <div className="assessment__options">
              {LEARNING_STYLES.map(style => (
                <button
                  key={style}
                  className={`assessment__chip${learningStyle.includes(style) ? ' selected' : ''}`}
                  onClick={() => toggleLearningStyle(style)}
                  aria-pressed={learningStyle.includes(style)}
                >
                  {learningStyle.includes(style) && (
                    <span className="assessment__chip-check">&#10003;</span>
                  )}
                  {style}
                </button>
              ))}
            </div>

            {error && <p className="assessment__error">{error}</p>}

            <div className="assessment__nav">
              <button
                className="assessment__btn assessment__btn--back"
                onClick={() => setStep(3)}
              >
                <ArrowLeft size={15} /> Back
              </button>
              <button
                className="assessment__btn"
                disabled={!canNext()}
                onClick={handleSubmit}
              >
                <Sparkles size={15} /> Analyse My Gaps
              </button>
            </div>
          </div>
        )}

        {/* ── Step 5: Analysing (loading) ── */}
        {step === 5 && loading && (
          <div className="assessment__card" style={{ textAlign: 'center' }}>
            <div className="assessment__generating">
              <div className="assessment__generating-spinner">
                <Loader2
                  size={30}
                  color="var(--primary)"
                  style={{ animation: 'spin 0.8s linear infinite' }}
                />
              </div>
              <div>
                <h1 className="assessment__title">Analysing your skills…</h1>
                <p className="assessment__sub">
                  Our AI is comparing your profile against {targetRole} requirements.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 6: Results ── */}
        {step === 6 && result && (
          <div className="assessment__card">
            <p className="assessment__eyebrow">Your Results</p>
            <h1 className="assessment__title">Your Skill Gap Analysis</h1>
            <p className="assessment__sub" style={{ marginBottom: '0.75rem' }}>
              {result.summary}
            </p>

            {/* Top priority callout */}
            {result.topPriority && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  padding: '0.85rem 1rem',
                  borderRadius: 12,
                  background: 'var(--primary-container)',
                  border: '1px solid var(--outline-variant)',
                  marginBottom: '1.25rem',
                }}
              >
                <Target size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <p
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: 'var(--primary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: 2,
                    }}
                  >
                    Top Priority
                  </p>
                  <p style={{ fontSize: '0.88rem', color: 'var(--on-surface)', fontWeight: 600 }}>
                    {result.topPriority}
                  </p>
                </div>
              </div>
            )}

            {/* Gap list */}
            <div className="assessment__results">
              {result.skillGaps.map((gap, i) => (
                <div
                  key={gap.skill}
                  className={`assessment__match${i === 0 ? ' assessment__match--top' : ''}`}
                  style={{ flexDirection: 'column', gap: 6 }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      justifyContent: 'space-between',
                    }}
                  >
                    <p className="assessment__match-title">{gap.skill}</p>
                    {importanceBadge(gap.importance)}
                  </div>
                  <p
                    style={{
                      fontSize: '0.78rem',
                      color: 'var(--on-surface-variant)',
                      margin: 0,
                    }}
                  >
                    {gap.currentLevel} &rarr; {gap.targetLevel}
                  </p>
                  <p className="assessment__match-desc">{gap.learningResource}</p>
                </div>
              ))}
            </div>

            <div className="assessment__nav" style={{ flexDirection: 'column', gap: 8 }}>
              <button
                className="assessment__btn"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => navigate('/app/skill-gaps')}
              >
                View Full Analysis <ArrowRight size={15} />
              </button>
              <button
                className="assessment__btn"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => navigate('/app/onboarding')}
              >
                Build My Roadmap <ArrowRight size={15} />
              </button>
              <button
                className="assessment__btn assessment__btn--back"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => {
                  setStep(0);
                  setResult(null);
                }}
              >
                Start Over
              </button>
            </div>
          </div>
        )}

        {/* ── Error fallback for step 5 without loading ── */}
        {step === 5 && !loading && !result && (
          <div className="assessment__card" style={{ textAlign: 'center' }}>
            <AlertTriangle size={32} color="#f87171" style={{ margin: '0 auto 1rem' }} />
            <h1 className="assessment__title">Something went wrong</h1>
            <p className="assessment__sub">The analysis could not be completed.</p>
            <div className="assessment__nav" style={{ justifyContent: 'center' }}>
              <button className="assessment__btn" onClick={() => setStep(4)}>
                <ArrowLeft size={15} /> Go Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
