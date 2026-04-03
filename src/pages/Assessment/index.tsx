import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Loader2, CheckCircle2, Sparkles } from 'lucide-react';
import { useAuth } from '../../lib/auth-context';
import { assessment as assessmentApi, warmup } from '../../lib/api';
import './Assessment.css';

/* ══════════════════════════════════════════════════════════════════
   STEP DEFINITIONS — Industry-standard career assessment
   Based on RIASEC, Big Five/OCEAN, Schwartz Values, O*NET
   ══════════════════════════════════════════════════════════════════ */

// Step 0: Interests (RIASEC)
const INTEREST_QUESTIONS = [
  { id: 'int1', q: 'Which appeals to you more?', options: [
    { value: 'realistic', label: 'Building or repairing something with your hands' },
    { value: 'investigative', label: 'Analyzing data to find hidden patterns' },
    { value: 'artistic', label: 'Designing a visual layout or experience' },
    { value: 'social', label: 'Coaching someone through a challenge' },
  ]},
  { id: 'int2', q: 'Which type of problem excites you most?', options: [
    { value: 'technical', label: 'Technical — how do we build this?' },
    { value: 'human', label: 'Human — how do we help this person?' },
    { value: 'creative', label: 'Creative — how do we make this compelling?' },
    { value: 'strategic', label: 'Strategic — how do we grow this business?' },
    { value: 'scientific', label: 'Scientific — how does this actually work?' },
  ]},
  { id: 'int3', q: "You'd rather be known for:", options: [
    { value: 'builder', label: 'Building things millions of people use' },
    { value: 'thinker', label: 'Changing how people think about something' },
    { value: 'operator', label: 'Making an organization run better' },
    { value: 'helper', label: 'Directly helping people in need' },
  ]},
];

// Step 1: Work Style (OCEAN + Cognitive)
const WORKSTYLE_QUESTIONS = [
  { id: 'ws1', q: "Your team's project plan is suddenly scrapped. You:", options: [
    { value: 'open', label: 'Get excited — blank slate means new possibilities' },
    { value: 'cautious', label: 'Feel uneasy — want to understand why first' },
    { value: 'organized', label: 'Immediately start organizing a new plan' },
    { value: 'empathetic', label: 'Check in with teammates to see how they feel' },
  ]},
  { id: 'ws2', q: 'When making a big decision, you rely more on:', options: [
    { value: 'thinking', label: 'Logic, data, and pros/cons lists' },
    { value: 'feeling', label: 'Gut feeling and how it aligns with your values' },
  ]},
  { id: 'ws3', q: 'When working on something complex, you prefer to:', options: [
    { value: 'solo', label: 'Dive deep for hours without interruption' },
    { value: 'collaborative', label: 'Talk it through with others as you go' },
    { value: 'mixed', label: 'Alternate between solo thinking and group discussion' },
  ]},
  { id: 'ws4', q: 'You handle ambiguity by:', options: [
    { value: 'structure', label: 'Creating structure — lists, plans, frameworks' },
    { value: 'experiment', label: 'Experimenting — try things and see what works' },
    { value: 'consult', label: 'Asking others — gather perspectives first' },
  ]},
];

// Step 2: Values (Schwartz + O*NET tradeoffs)
const VALUES_QUESTIONS = [
  { id: 'val1', q: 'If two jobs paid the same, you\'d pick the one with:', options: [
    { value: 'autonomy', label: 'More freedom to set your own schedule' },
    { value: 'prestige', label: 'More prestige and career advancement' },
    { value: 'purpose', label: 'More meaningful social impact' },
    { value: 'mastery', label: 'More intellectual challenge' },
  ]},
  { id: 'val2', q: 'Which tradeoff would you accept?', options: [
    { value: 'purpose_over_wealth', label: 'Lower pay for deeply meaningful work' },
    { value: 'wealth_over_stability', label: 'Less stability for much higher earning potential' },
    { value: 'balance_over_creativity', label: 'Less creativity for strong work-life balance' },
  ]},
  { id: 'val3', q: 'What frustrates you most in a job?', options: [
    { value: 'monotony', label: 'Doing the same thing every day' },
    { value: 'no_impact', label: 'Not seeing the impact of your work' },
    { value: 'micromanaged', label: 'Being micromanaged' },
    { value: 'isolation', label: 'Working alone with no team' },
  ]},
  { id: 'val4', q: 'Which reward matters most?', options: [
    { value: 'wealth', label: 'A big bonus' },
    { value: 'recognition', label: 'Public recognition from leadership' },
    { value: 'learning', label: 'Learning a valuable new skill' },
    { value: 'impact', label: 'Knowing your work made a difference' },
  ]},
];

// Step 3: Work Environment
const ENVIRONMENT_QUESTIONS = [
  { id: 'env1', q: 'Your ideal work setting:', options: [
    { value: 'remote', label: 'Fully remote — work from anywhere' },
    { value: 'hybrid', label: 'Hybrid — mix of office and remote' },
    { value: 'onsite', label: 'In-person — I want to be around people daily' },
  ]},
  { id: 'env2', q: 'You do your best work in a team that is:', options: [
    { value: 'small', label: 'Small (2-5), tight-knit, everyone wears many hats' },
    { value: 'medium', label: 'Medium (6-20), specialized but collaborative' },
    { value: 'large', label: 'Large (20+), clear hierarchy and processes' },
    { value: 'solo', label: 'Solo — I prefer working independently' },
  ]},
  { id: 'env3', q: 'Which pace feels right?', options: [
    { value: 'fast', label: 'Fast and intense — ship fast, iterate' },
    { value: 'steady', label: 'Steady and sustainable — no burnout' },
    { value: 'burst', label: 'Bursts of intensity then downtime' },
  ]},
  { id: 'env4', q: 'Which management style brings out your best?', options: [
    { value: 'handsoff', label: 'Hands-off — check in weekly, trust me' },
    { value: 'mentorship', label: 'Regular feedback and mentorship' },
    { value: 'targets', label: 'Clear daily/weekly targets and accountability' },
  ]},
];

// Step 4: Career Stage & Goals
const CAREER_QUESTIONS = [
  { id: 'car1', q: 'Where are you in your career?', options: [
    { value: 'exploring', label: "Exploring — I'm not sure what I want yet" },
    { value: 'building', label: 'Building — I know my field, growing skills' },
    { value: 'advancing', label: 'Advancing — aiming for senior/leadership' },
    { value: 'pivoting', label: 'Pivoting — changing fields entirely' },
  ]},
  { id: 'car2', q: 'Your comfort with risk:', options: [
    { value: 'high', label: "I'd take a pay cut for a startup I believe in" },
    { value: 'moderate', label: "I'd consider a startup if it had solid funding" },
    { value: 'low', label: 'I prefer established companies with stability' },
  ]},
  { id: 'car3', q: 'In five years, you\'d rather have:', options: [
    { value: 'specialist', label: 'Deep expertise — be the go-to person' },
    { value: 'generalist', label: 'Broad skills — do many things well' },
    { value: 'manager', label: 'Leadership — manage people and strategy' },
    { value: 'entrepreneur', label: 'Your own business or freelance practice' },
  ]},
  { id: 'car4', q: 'In group work, you naturally:', options: [
    { value: 'leader', label: 'Take charge and delegate' },
    { value: 'ideator', label: 'Generate ideas and possibilities' },
    { value: 'doer', label: 'Execute and make sure things get done' },
    { value: 'harmonizer', label: 'Mediate and keep the team aligned' },
  ]},
];

// Step 5: Skills & Experience
const EXPERIENCE_LEVELS = [
  { value: 'student', label: 'Student or self-taught beginner' },
  { value: 'junior', label: 'Junior — 0-2 years professional experience' },
  { value: 'mid', label: 'Mid-level — 2-6 years' },
  { value: 'senior', label: 'Senior — 6+ years' },
  { value: 'expert', label: 'Expert/leadership — 10+ years' },
];

const SKILL_OPTIONS = [
  'Python', 'JavaScript/TypeScript', 'SQL', 'Cloud/AWS', 'AI/ML',
  'Data Analysis', 'UI/UX Design', 'Project Management', 'Strategic Planning',
  'Sales/Negotiation', 'Content Strategy', 'Financial Modeling', 'Communication',
  'Problem Solving', 'Leadership', 'Adaptability', 'Critical Thinking',
  'Emotional Intelligence', 'Systems Thinking', 'Research',
];

const INTEREST_DOMAINS = [
  'Technology', 'Data & Analytics', 'Marketing', 'Finance',
  'Design & UX', 'Product Management', 'Healthcare', 'Education',
  'E-commerce', 'Sustainability', 'Media & Entertainment', 'Consulting',
];

const TOTAL_STEPS = 8; // 0-5 questions + 6 analyzing + 7 results

export default function Assessment() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Wake up Encore backend on page load (cold starts take 5-15s)
  useEffect(() => { warmup(); }, []);

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentSkillsText, setCurrentSkillsText] = useState('');
  const [currentRole, setCurrentRole] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);
  const [isPartial, setIsPartial] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(0);

  const setAnswer = (id: string, value: string) => setAnswers(prev => ({ ...prev, [id]: value }));
  const toggleMulti = (val: string, list: string[], setList: (v: string[]) => void, max = 8) => {
    if (list.includes(val)) setList(list.filter(v => v !== val));
    else if (list.length < max) setList([...list, val]);
  };

  const currentSkills = currentSkillsText.split(',').map(s => s.trim()).filter(Boolean);

  // Step-specific question sets
  const stepQuestions: { id: string; q: string; options: { value: string; label: string }[] }[][] = [
    INTEREST_QUESTIONS, WORKSTYLE_QUESTIONS, VALUES_QUESTIONS, ENVIRONMENT_QUESTIONS, CAREER_QUESTIONS,
  ];

  const canNext = () => {
    if (step < 5) {
      const qs = stepQuestions[step];
      return qs.every(q => !!answers[q.id]);
    }
    if (step === 5) return !!experienceLevel && selectedSkills.length >= 2 && selectedDomains.length >= 1;
    return true;
  };

  const stepLabels = ['Interests', 'Work Style', 'Values', 'Environment', 'Career Goals', 'Skills & Experience'];

  const handleSubmit = async () => {
    if (!user) { setError('You must be signed in.'); return; }
    setStep(6); setError(''); setIsPartial(false);

    const workStyle = answers.ws3 || 'mixed';
    const strengths = [
      answers.int2 && `${answers.int2} problem-solving`,
      answers.ws1 && `${answers.ws1} mindset`,
      answers.car4 && `natural ${answers.car4}`,
      answers.ws4 && `handles ambiguity via ${answers.ws4}`,
    ].filter(Boolean) as string[];
    const values = [answers.val1, answers.val2, answers.val3, answers.val4].filter(Boolean) as string[];

    const payload = {
      userId: user.id,
      workStyle,
      strengths,
      values,
      currentSkills: [...selectedSkills, ...currentSkills],
      experienceLevel,
      interests: selectedDomains,
      currentRole: currentRole.trim() || '',
      personalityType: `${answers.int1 || 'mixed'}-${answers.ws2 || 'balanced'}-${answers.car1 || 'building'}`,
      rawAnswers: { ...answers },
    };

    try {
      const res: any = await assessmentApi.submit(payload);
      setResult(res.result);
      setIsPartial(!!res.partial);
      setStep(7);
    } catch (err: unknown) {
      setStep(5);
      if (err instanceof TypeError) {
        // TypeError: Failed to fetch — actual network failure / cold start
        setError('Could not reach the server. The backend may be starting up — please wait 10 seconds and try again.');
      } else {
        const msg = err instanceof Error ? err.message : '';
        if (msg.includes('401') || msg.includes('unauthenticated') || msg.includes('requires auth')) {
          setError('Your session expired. Please sign in again.');
          navigate('/signin');
        } else if (msg.includes('decode') || msg.includes('missing field')) {
          setError('There was a data format issue. Please try again — the system will auto-correct.');
        } else {
          setError(msg || 'Analysis failed. Please try again.');
        }
      }
    }
  };

  const pct = Math.round((step / (TOTAL_STEPS - 2)) * 100);

  return (
    <div className="assessment">
      <div style={{ width: '100%', maxWidth: 640, margin: '0 auto' }}>
        {step < 6 && (
          <>
            <div className="assessment__progress">
              <div className="assessment__progress-bar">
                <div className="assessment__progress-fill" style={{ width: `${pct}%` }} />
              </div>
              <span className="assessment__progress-label">{step + 1} / {stepLabels.length}</span>
            </div>
          </>
        )}

        {/* ── Steps 0-4: Scenario questions ── */}
        {step < 5 && (
          <div className="assessment__card">
            <p className="assessment__eyebrow">Step {step + 1} of {stepLabels.length} — {stepLabels[step]}</p>
            {stepQuestions[step].map((q, qi) => (
              <div key={q.id} style={{ marginBottom: qi < stepQuestions[step].length - 1 ? '1.75rem' : 0 }}>
                <h2 className="assessment__title" style={{ fontSize: qi === 0 ? '1.5rem' : '1.15rem', marginBottom: '0.75rem' }}>{q.q}</h2>
                <div className="assessment__options" style={{ flexDirection: 'column' }}>
                  {q.options.map(opt => (
                    <button
                      key={opt.value}
                      className={`assessment__option${answers[q.id] === opt.value ? ' selected' : ''}`}
                      onClick={() => setAnswer(q.id, opt.value)}
                    >
                      {opt.label}
                      {answers[q.id] === opt.value && <CheckCircle2 size={16} style={{ marginLeft: 'auto', flexShrink: 0 }} />}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <div className="assessment__nav" style={{ marginTop: '1.5rem' }}>
              {step > 0 && (
                <button className="assessment__btn assessment__btn--back" onClick={() => { setError(''); setStep(s => s - 1); }}>
                  <ArrowLeft size={15} /> Back
                </button>
              )}
              <button className="assessment__btn" disabled={!canNext()} onClick={() => { setError(''); setStep(s => s + 1); }}>
                Continue <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 5: Skills & Experience ── */}
        {step === 5 && (
          <div className="assessment__card">
            <p className="assessment__eyebrow">Step 6 of {stepLabels.length} — {stepLabels[5]}</p>
            <h2 className="assessment__title">Tell us about your experience</h2>

            <p className="assessment__sub">Experience level</p>
            <div className="assessment__options" style={{ flexDirection: 'column', marginBottom: '1.25rem' }}>
              {EXPERIENCE_LEVELS.map(el => (
                <button key={el.value} className={`assessment__option${experienceLevel === el.value ? ' selected' : ''}`}
                  onClick={() => setExperienceLevel(el.value)}>
                  {el.label}
                </button>
              ))}
            </div>

            <p className="assessment__sub">Current role (optional)</p>
            <input className="assessment__input" placeholder="e.g. Sales Associate, Student, Freelancer..."
              value={currentRole} onChange={e => setCurrentRole(e.target.value)} />

            <p className="assessment__sub">Your skills (pick 2-8)</p>
            <div className="assessment__options">
              {SKILL_OPTIONS.map(s => (
                <button key={s} className={`assessment__chip${selectedSkills.includes(s) ? ' selected' : ''}`}
                  onClick={() => toggleMulti(s, selectedSkills, setSelectedSkills, 8)}>
                  {selectedSkills.includes(s) && <span className="assessment__chip-check">✓</span>}
                  {s}
                </button>
              ))}
            </div>
            <p className="assessment__hint">{selectedSkills.length}/8 selected</p>

            <p className="assessment__sub">Other skills (comma-separated)</p>
            <input className="assessment__input" placeholder="e.g. Photoshop, Excel, R..."
              value={currentSkillsText} onChange={e => setCurrentSkillsText(e.target.value)} />

            <p className="assessment__sub">Domains of interest (pick 1-6)</p>
            <div className="assessment__options">
              {INTEREST_DOMAINS.map(d => (
                <button key={d} className={`assessment__chip${selectedDomains.includes(d) ? ' selected' : ''}`}
                  onClick={() => toggleMulti(d, selectedDomains, setSelectedDomains, 6)}>
                  {selectedDomains.includes(d) && <span className="assessment__chip-check">✓</span>}
                  {d}
                </button>
              ))}
            </div>
            <p className="assessment__hint">{selectedDomains.length}/6 selected</p>

            {error && <p className="assessment__error">{error}</p>}
            <div className="assessment__nav">
              <button className="assessment__btn assessment__btn--back" onClick={() => { setError(''); setStep(4); }}>
                <ArrowLeft size={15} /> Back
              </button>
              <button className="assessment__btn" disabled={!canNext()} onClick={handleSubmit}>
                <Sparkles size={15} /> Analyse My Profile
              </button>
            </div>
          </div>
        )}

        {/* ── Step 6: Analysing ── */}
        {step === 6 && (
          <div className="assessment__card" style={{ textAlign: 'center' }}>
            <div className="assessment__generating">
              <div className="assessment__generating-spinner">
                <Loader2 size={30} color="#8b4f2c" style={{ animation: 'spin 0.8s linear infinite' }} />
              </div>
              <div>
                <h1 className="assessment__title">Analysing your profile…</h1>
                <p className="assessment__sub">Our AI is matching your strengths, values, and cognitive style to career paths using RIASEC mapping and industry data.</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 7: Results ── */}
        {step === 7 && result && (
          <div className="assessment__card">
            <p className="assessment__eyebrow">Your Results</p>
            <h1 className="assessment__title">Your top career matches</h1>
            {isPartial && (
              <p className="assessment__error" style={{ marginBottom: '1rem' }}>
                AI analysis was temporarily unavailable. These are placeholder results — please retake the assessment later for personalized matches.
              </p>
            )}
            <p className="assessment__sub" style={{ marginBottom: '1.25rem' }}>
              Based on your RIASEC profile, cognitive style, values, and experience — here are the roles we recommend.
            </p>

            <p className="assessment__sub" style={{ fontSize: '0.85rem', opacity: 0.7, marginBottom: '0.5rem' }}>
              Tap a match to select it for your roadmap
            </p>
            <div className="assessment__results">
              {(result.careerMatches ?? []).map((match: any, i: number) => (
                <div key={match.title ?? i}
                  className={`assessment__match${i === selectedMatch ? ' assessment__match--top' : ''}`}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                  onClick={() => setSelectedMatch(i)}>
                  <div className="assessment__match-score">
                    {match.matchScore ?? '—'}<span>%</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p className="assessment__match-title">{match.title ?? 'Career Match'}</p>
                    <p className="assessment__match-desc">{match.description ?? 'No description available'}</p>
                    <p className="assessment__match-time">⏱ {match.pathwayTime ?? 'Timeline TBD'} pathway</p>
                  </div>
                  {i === selectedMatch && <CheckCircle2 size={18} color="#006a62" style={{ flexShrink: 0 }} />}
                </div>
              ))}
            </div>

            <div className="assessment__nav" style={{ flexDirection: 'column', gap: 8 }}>
              <button className="assessment__btn" style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => {
                  const chosen = result.careerMatches[selectedMatch];
                  navigate('/app/onboarding', { state: { targetRole: chosen?.title, pathwayTime: chosen?.pathwayTime } });
                }}>
                Build Roadmap for {result.careerMatches?.[selectedMatch]?.title ?? 'this role'} <ArrowRight size={15} />
              </button>
              <button className="assessment__btn assessment__btn--back"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => navigate('/app/career-match')}>
                View Match Details
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
