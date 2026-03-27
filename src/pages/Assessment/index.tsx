import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Loader2, CheckCircle2, Sparkles } from 'lucide-react';
import { useAuth } from '../../lib/auth-context';
import { assessment as assessmentApi } from '../../lib/api';
import './Assessment.css';

const WORK_STYLES = [
  { value: 'collaborative', label: 'Collaborative — I thrive in teams' },
  { value: 'independent', label: 'Independent — I prefer solo work' },
  { value: 'mixed', label: 'Mixed — depends on the task' },
  { value: 'leading', label: 'Leadership — I like guiding others' },
];

const STRENGTHS_OPTIONS = [
  'Analytical thinking', 'Creative problem-solving', 'Communication',
  'Data analysis', 'Strategic planning', 'Attention to detail',
  'Technical skills', 'Relationship building', 'Project management',
  'Research', 'Visual design', 'Writing & storytelling',
];

const VALUES_OPTIONS = [
  'Impact & purpose', 'Work-life balance', 'High earning potential',
  'Creative freedom', 'Job security', 'Fast-paced growth',
  'Remote / flexibility', 'Collaboration', 'Innovation',
  'Helping others', 'Autonomy', 'Recognition',
];

const EXPERIENCE_LEVELS = [
  { value: 'student', label: 'Student / No experience' },
  { value: 'entry', label: '0–2 years (Entry level)' },
  { value: 'mid', label: '2–5 years (Mid level)' },
  { value: 'senior', label: '5+ years (Senior level)' },
];

const INTEREST_DOMAINS = [
  'Technology', 'Data & Analytics', 'Marketing', 'Finance',
  'Design & UX', 'Product Management', 'Healthcare', 'Education',
  'E-commerce', 'Sustainability', 'Media & Entertainment', 'Consulting',
];

const TOTAL_STEPS = 6;

export default function Assessment() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [workStyle, setWorkStyle] = useState('');
  const [strengths, setStrengths] = useState<string[]>([]);
  const [values, setValues] = useState<string[]>([]);
  const [currentRole, setCurrentRole] = useState('');
  const [currentSkillsText, setCurrentSkillsText] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [_loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);

  const toggleMulti = (
    val: string,
    list: string[],
    setList: (v: string[]) => void,
    max = 5
  ) => {
    if (list.includes(val)) setList(list.filter(v => v !== val));
    else if (list.length < max) setList([...list, val]);
  };

  const currentSkills = currentSkillsText
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  const canNext = () => {
    if (step === 0) return !!workStyle;
    if (step === 1) return strengths.length >= 2;
    if (step === 2) return values.length >= 2;
    if (step === 3) return !!experienceLevel;
    if (step === 4) return interests.length >= 1;
    return true;
  };

  const handleSubmit = async () => {
    if (!user) return;
    setStep(5);
    setLoading(true);
    setError('');
    try {
      const res: any = await assessmentApi.submit({
        userId: user.id,
        answers: {
          workStyle,
          strengths,
          values,
          currentSkills,
          experienceLevel,
          interests,
          currentRole: currentRole.trim() || undefined,
        },
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

  const pct = Math.round(((step) / TOTAL_STEPS) * 100);

  return (
    <div className="assessment">
      <div style={{ width: '100%', maxWidth: 560, margin: '0 auto' }}>
        {step < 5 && (
          <div className="assessment__progress">
            <div className="assessment__progress-bar">
              <div className="assessment__progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="assessment__progress-label">{step} / {TOTAL_STEPS - 1}</span>
          </div>
        )}

        {/* Step 0: Work style */}
        {step === 0 && (
          <div className="assessment__card">
            <p className="assessment__eyebrow">Step 1 of 5 — Work Style</p>
            <h1 className="assessment__title">How do you work best?</h1>
            <p className="assessment__sub">Choose the style that fits you most naturally.</p>
            <div className="assessment__options" style={{ flexDirection: 'column' }}>
              {WORK_STYLES.map(ws => (
                <button
                  key={ws.value}
                  className={`assessment__option${workStyle === ws.value ? ' selected' : ''}`}
                  style={{ borderRadius: 10, textAlign: 'left', padding: '0.75rem 1rem' }}
                  onClick={() => setWorkStyle(ws.value)}
                >{ws.label}</button>
              ))}
            </div>
            <div className="assessment__nav">
              <button className="assessment__btn" disabled={!canNext()} onClick={() => setStep(1)}>
                Next <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* Step 1: Strengths */}
        {step === 1 && (
          <div className="assessment__card">
            <p className="assessment__eyebrow">Step 2 of 5 — Strengths</p>
            <h1 className="assessment__title">What are your top strengths?</h1>
            <p className="assessment__sub">Pick 2–5 that describe you best.</p>
            <div className="assessment__options">
              {STRENGTHS_OPTIONS.map(s => (
                <button
                  key={s}
                  className={`assessment__chip${strengths.includes(s) ? ' selected' : ''}`}
                  onClick={() => toggleMulti(s, strengths, setStrengths, 5)}
                >
                  {strengths.includes(s) && <span className="assessment__chip-check">✓</span>}
                  {s}
                </button>
              ))}
            </div>
            <p className="assessment__hint">{strengths.length}/5 selected</p>
            <div className="assessment__nav">
              <button className="assessment__btn assessment__btn--back" onClick={() => setStep(0)}>
                <ArrowLeft size={15} /> Back
              </button>
              <button className="assessment__btn" disabled={!canNext()} onClick={() => setStep(2)}>
                Next <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Values */}
        {step === 2 && (
          <div className="assessment__card">
            <p className="assessment__eyebrow">Step 3 of 5 — Values</p>
            <h1 className="assessment__title">What matters most to you at work?</h1>
            <p className="assessment__sub">Pick 2–5 work values.</p>
            <div className="assessment__options">
              {VALUES_OPTIONS.map(v => (
                <button
                  key={v}
                  className={`assessment__chip${values.includes(v) ? ' selected' : ''}`}
                  onClick={() => toggleMulti(v, values, setValues, 5)}
                >
                  {values.includes(v) && <span className="assessment__chip-check">✓</span>}
                  {v}
                </button>
              ))}
            </div>
            <p className="assessment__hint">{values.length}/5 selected</p>
            <div className="assessment__nav">
              <button className="assessment__btn assessment__btn--back" onClick={() => setStep(1)}>
                <ArrowLeft size={15} /> Back
              </button>
              <button className="assessment__btn" disabled={!canNext()} onClick={() => setStep(3)}>
                Next <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Experience + current role */}
        {step === 3 && (
          <div className="assessment__card">
            <p className="assessment__eyebrow">Step 4 of 5 — Experience</p>
            <h1 className="assessment__title">What's your experience level?</h1>
            <p className="assessment__sub">This helps us tailor your roadmap difficulty.</p>
            <div className="assessment__options" style={{ flexDirection: 'column' }}>
              {EXPERIENCE_LEVELS.map(el => (
                <button
                  key={el.value}
                  className={`assessment__option${experienceLevel === el.value ? ' selected' : ''}`}
                  style={{ borderRadius: 10, textAlign: 'left', padding: '0.75rem 1rem' }}
                  onClick={() => setExperienceLevel(el.value)}
                >{el.label}</button>
              ))}
            </div>
            <p className="assessment__sub" style={{ marginTop: '1.25rem' }}>Current role (optional)</p>
            <input
              type="text"
              className="assessment__input"
              placeholder="e.g. Sales Associate, Student, Freelancer..."
              value={currentRole}
              onChange={e => setCurrentRole(e.target.value)}
            />
            <p className="assessment__sub">Your current skills (comma-separated)</p>
            <input
              type="text"
              className="assessment__input"
              placeholder="e.g. Excel, Python, Photoshop, SQL..."
              value={currentSkillsText}
              onChange={e => setCurrentSkillsText(e.target.value)}
            />
            <div className="assessment__nav">
              <button className="assessment__btn assessment__btn--back" onClick={() => setStep(2)}>
                <ArrowLeft size={15} /> Back
              </button>
              <button className="assessment__btn" disabled={!canNext()} onClick={() => setStep(4)}>
                Next <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Interests */}
        {step === 4 && (
          <div className="assessment__card">
            <p className="assessment__eyebrow">Step 5 of 5 — Interests</p>
            <h1 className="assessment__title">Which domains interest you?</h1>
            <p className="assessment__sub">Select all that apply — this guides your career matches.</p>
            <div className="assessment__options">
              {INTEREST_DOMAINS.map(d => (
                <button
                  key={d}
                  className={`assessment__chip${interests.includes(d) ? ' selected' : ''}`}
                  onClick={() => toggleMulti(d, interests, setInterests, 6)}
                >
                  {interests.includes(d) && <span className="assessment__chip-check">✓</span>}
                  {d}
                </button>
              ))}
            </div>
            <p className="assessment__hint">{interests.length}/6 selected</p>
            {error && <p className="assessment__error">{error}</p>}
            <div className="assessment__nav">
              <button className="assessment__btn assessment__btn--back" onClick={() => setStep(3)}>
                <ArrowLeft size={15} /> Back
              </button>
              <button className="assessment__btn" disabled={!canNext()} onClick={handleSubmit}>
                <Sparkles size={15} /> Analyse My Profile
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Analysing */}
        {step === 5 && (
          <div className="assessment__card" style={{ textAlign: 'center' }}>
            <div className="assessment__generating">
              <div className="assessment__generating-spinner">
                <Loader2 size={30} color="#a78bfa" style={{ animation: 'spin 0.8s linear infinite' }} />
              </div>
              <div>
                <h1 className="assessment__title">Analysing your profile…</h1>
                <p className="assessment__sub">Our AI is matching your strengths, values, and skills to real career paths.</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Results */}
        {step === 6 && result && (
          <div className="assessment__card">
            <p className="assessment__eyebrow">Your Results</p>
            <h1 className="assessment__title">Your top career matches</h1>
            <p className="assessment__sub" style={{ marginBottom: '1.25rem' }}>
              Based on your profile, here are the roles we recommend.
            </p>

            <div className="assessment__results">
              {(result.careerMatches ?? []).map((match: any, i: number) => (
                <div key={match.title} className={`assessment__match${i === 0 ? ' assessment__match--top' : ''}`}>
                  <div className="assessment__match-score">
                    {match.matchScore}<span>%</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p className="assessment__match-title">{match.title}</p>
                    <p className="assessment__match-desc">{match.description}</p>
                    <p className="assessment__match-time">⏱ {match.pathwayTime} pathway</p>
                  </div>
                  {i === 0 && <CheckCircle2 size={18} color="#34d399" style={{ flexShrink: 0 }} />}
                </div>
              ))}
            </div>

            <div className="assessment__nav" style={{ flexDirection: 'column', gap: 8 }}>
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
                onClick={() => navigate('/app')}
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
