import { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth-context';
import { assessment as assessmentApi, warmup } from '../../lib/api';
import { Panda } from '../../components/panda';
import { getArchetypePreview } from './archetypePreview';

/* ══════════════════════════════════════════════════════════════════
   PLACEHOLDER QUESTION DATA
   Will be replaced by import from ./questionData once that file lands.
   ══════════════════════════════════════════════════════════════════ */

type QuestionFormat = 'likert3' | 'likert5' | 'forcedChoice' | 'scenario' | 'chips';

interface Question {
  id: string;
  text: string;
  format: QuestionFormat;
  options?: { value: string; label: string; description?: string }[];
  chipOptions?: string[];
  chipMin?: number;
  chipMax?: number;
}

interface Phase {
  id: string;
  title: string;
  subtitle: string;
  accent: string;
  questions: Question[];
  transitionMessage: string;
}

const ASSESSMENT_PHASES: Phase[] = [
  {
    id: 'riasec',
    title: 'Interests',
    subtitle: 'What activities excite you?',
    accent: 'var(--secondary, #006a62)',
    transitionMessage: 'Great start! We can already see some patterns forming...',
    questions: [
      { id: 'r1', text: 'Building or fixing things with your hands', format: 'likert3', options: [
        { value: 'like', label: 'Like' }, { value: 'neutral', label: 'Neutral' }, { value: 'dislike', label: 'Dislike' },
      ]},
      { id: 'r2', text: 'Analyzing data to uncover hidden patterns', format: 'likert3', options: [
        { value: 'like', label: 'Like' }, { value: 'neutral', label: 'Neutral' }, { value: 'dislike', label: 'Dislike' },
      ]},
      { id: 'r3', text: 'Designing visual layouts or experiences', format: 'likert3', options: [
        { value: 'like', label: 'Like' }, { value: 'neutral', label: 'Neutral' }, { value: 'dislike', label: 'Dislike' },
      ]},
      { id: 'r4', text: 'Coaching someone through a challenge', format: 'likert3', options: [
        { value: 'like', label: 'Like' }, { value: 'neutral', label: 'Neutral' }, { value: 'dislike', label: 'Dislike' },
      ]},
      { id: 'r5', text: 'Persuading people to try a new idea', format: 'likert3', options: [
        { value: 'like', label: 'Like' }, { value: 'neutral', label: 'Neutral' }, { value: 'dislike', label: 'Dislike' },
      ]},
    ],
  },
  {
    id: 'bigfive',
    title: 'Personality',
    subtitle: 'How do you typically behave?',
    accent: 'var(--copper, #8b4f2c)',
    transitionMessage: "Your personality profile is taking shape. Let's explore your values next.",
    questions: [
      { id: 'b1', text: 'I enjoy trying new and unfamiliar experiences', format: 'likert5', options: [
        { value: '1', label: 'SD' }, { value: '2', label: 'D' }, { value: '3', label: 'N' }, { value: '4', label: 'A' }, { value: '5', label: 'SA' },
      ]},
      { id: 'b2', text: 'I keep my workspace organized and tidy', format: 'likert5', options: [
        { value: '1', label: 'SD' }, { value: '2', label: 'D' }, { value: '3', label: 'N' }, { value: '4', label: 'A' }, { value: '5', label: 'SA' },
      ]},
      { id: 'b3', text: 'I feel energized after spending time with a large group', format: 'likert5', options: [
        { value: '1', label: 'SD' }, { value: '2', label: 'D' }, { value: '3', label: 'N' }, { value: '4', label: 'A' }, { value: '5', label: 'SA' },
      ]},
      { id: 'b4', text: 'I find it easy to empathize with others\u2019 feelings', format: 'likert5', options: [
        { value: '1', label: 'SD' }, { value: '2', label: 'D' }, { value: '3', label: 'N' }, { value: '4', label: 'A' }, { value: '5', label: 'SA' },
      ]},
      { id: 'b5', text: 'I stay calm under pressure', format: 'likert5', options: [
        { value: '1', label: 'SD' }, { value: '2', label: 'D' }, { value: '3', label: 'N' }, { value: '4', label: 'A' }, { value: '5', label: 'SA' },
      ]},
    ],
  },
];

/* ══════════════════════════════════════════════════════════════════
   CONSTANTS & TYPES
   ══════════════════════════════════════════════════════════════════ */

const STORAGE_KEY = 'pw_assessment_v2';
const AUTO_ADVANCE_MS = 300;
const TRANSITION_AUTO_MS = 2000;

interface AssessmentV2State {
  currentPhase: number;
  currentQuestion: number;
  answers: Record<string, string | string[] | number>;
  showTransition: boolean;
  showAnalyzing: boolean;
  startedAt: string;
}

const ANALYZING_MESSAGES = [
  'Mapping your career DNA...',
  'Scoring 150+ career paths...',
  'Finding your unique strengths...',
  'Building your career fingerprint...',
];

const PHASE_PANDA_MOODS = ['curious', 'thinking', 'happy', 'cool', 'working', 'celebrating'] as const;

/* ══════════════════════════════════════════════════════════════════
   STYLES
   ══════════════════════════════════════════════════════════════════ */

const s = {
  page: {
    minHeight: '100dvh',
    background: 'var(--surface, #eefcfe)',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '1rem',
    fontFamily: 'var(--font-body, Inter, sans-serif)',
  },
  header: {
    width: '100%',
    maxWidth: 640,
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '0.5rem',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--on-surface-variant, #49454f)',
    padding: '0.5rem',
    borderRadius: 'var(--radius-full, 9999px)',
    display: 'flex',
    alignItems: 'center',
  },
  progressOuter: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem',
  },
  progressBar: {
    height: 6,
    borderRadius: 'var(--radius-full, 9999px)',
    background: 'var(--surface-container-low, #e8f6f8)',
    overflow: 'hidden' as const,
  },
  progressFill: (pct: number, accent: string) => ({
    height: '100%',
    width: `${pct}%`,
    background: accent,
    borderRadius: 'var(--radius-full, 9999px)',
    transition: 'width 0.4s ease-out',
  }),
  progressLabel: {
    fontSize: '0.75rem',
    color: 'var(--on-surface-muted, #78747e)',
    fontFamily: 'var(--font-display, Manrope, sans-serif)',
  },
  card: {
    width: '100%',
    maxWidth: 640,
    background: 'var(--surface-container-lowest, #ffffff)',
    borderRadius: 'var(--radius-2xl, 2rem)',
    boxShadow: 'var(--shadow-sm, 0 2px 12px rgba(0,106,98,0.08))',
    padding: '2rem 1.5rem',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    position: 'relative' as const,
    overflow: 'hidden' as const,
  },
  slideWrapper: {
    width: '100%',
    position: 'relative' as const,
  },
  questionText: {
    fontSize: '1.35rem',
    fontWeight: 600,
    fontFamily: 'var(--font-display, Manrope, sans-serif)',
    color: 'var(--on-surface, #1a1c1f)',
    textAlign: 'center' as const,
    marginBottom: '1.75rem',
    lineHeight: 1.35,
  },
  eyebrow: {
    fontSize: '0.8rem',
    fontWeight: 600,
    color: 'var(--on-surface-muted, #78747e)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginBottom: '0.5rem',
  },
  /* likert3 */
  likert3Wrap: { display: 'flex', flexDirection: 'column' as const, gap: '0.75rem', width: '100%' },
  likert3Btn: (selected: boolean, variant: 'like' | 'neutral' | 'dislike') => ({
    padding: '1rem 1.25rem',
    borderRadius: 'var(--radius-full, 9999px)',
    border: '2px solid',
    borderColor: selected
      ? (variant === 'like' ? 'var(--secondary, #006a62)' : variant === 'dislike' ? '#c44' : 'var(--on-surface-muted, #78747e)')
      : 'var(--surface-container-low, #e8f6f8)',
    background: selected
      ? (variant === 'like' ? 'rgba(0,106,98,0.08)' : variant === 'dislike' ? 'rgba(204,68,68,0.06)' : 'var(--surface-container-low, #e8f6f8)')
      : 'var(--surface-container-low, #e8f6f8)',
    color: 'var(--on-surface, #1a1c1f)',
    fontSize: '1rem',
    fontWeight: selected ? 600 : 400,
    cursor: 'pointer',
    transition: 'var(--transition-spring, 0.5s cubic-bezier(0.34,1.56,0.64,1))',
    transform: selected ? 'scale(1.02)' : 'scale(1)',
  }),
  /* likert5 */
  likert5Wrap: { display: 'flex', gap: '0.5rem', justifyContent: 'center', width: '100%' },
  likert5Btn: (selected: boolean) => ({
    width: 52,
    height: 52,
    borderRadius: 'var(--radius-full, 9999px)',
    border: '2px solid',
    borderColor: selected ? 'var(--copper, #8b4f2c)' : 'var(--surface-container-low, #e8f6f8)',
    background: selected ? 'rgba(139,79,44,0.1)' : 'var(--surface-container-low, #e8f6f8)',
    color: selected ? 'var(--copper, #8b4f2c)' : 'var(--on-surface-variant, #49454f)',
    fontSize: '0.85rem',
    fontWeight: selected ? 700 : 500,
    cursor: 'pointer',
    transition: 'var(--transition-spring, 0.5s cubic-bezier(0.34,1.56,0.64,1))',
    transform: selected ? 'scale(1.1)' : 'scale(1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),
  /* forcedChoice */
  choiceCard: (selected: boolean) => ({
    width: '100%',
    padding: '1.25rem',
    borderRadius: '1.25rem',
    border: '2px solid',
    borderColor: selected ? 'var(--copper, #8b4f2c)' : 'var(--surface-container-low, #e8f6f8)',
    background: selected ? 'rgba(139,79,44,0.06)' : 'var(--surface-container-lowest, #ffffff)',
    cursor: 'pointer',
    textAlign: 'left' as const,
    transition: 'var(--transition-base, 0.3s cubic-bezier(0.33,1,0.68,1))',
  }),
  /* scenario */
  scenarioCard: (selected: boolean) => ({
    width: '100%',
    padding: '1rem 1.25rem',
    borderRadius: '1rem',
    border: '2px solid',
    borderColor: selected ? 'var(--secondary, #006a62)' : 'var(--surface-container-low, #e8f6f8)',
    background: selected ? 'rgba(0,106,98,0.06)' : 'var(--surface-container-lowest, #ffffff)',
    cursor: 'pointer',
    textAlign: 'left' as const,
    transition: 'var(--transition-base, 0.3s cubic-bezier(0.33,1,0.68,1))',
  }),
  /* chips */
  chipsWrap: { display: 'flex', flexWrap: 'wrap' as const, gap: '0.5rem', justifyContent: 'center', width: '100%' },
  chip: (selected: boolean) => ({
    padding: '0.5rem 1rem',
    borderRadius: 'var(--radius-full, 9999px)',
    border: '2px solid',
    borderColor: selected ? 'var(--copper, #8b4f2c)' : 'var(--surface-container-low, #e8f6f8)',
    background: selected ? 'rgba(139,79,44,0.08)' : 'var(--surface-container-low, #e8f6f8)',
    color: selected ? 'var(--copper, #8b4f2c)' : 'var(--on-surface, #1a1c1f)',
    fontSize: '0.9rem',
    fontWeight: selected ? 600 : 400,
    cursor: 'pointer',
    transition: 'var(--transition-spring, 0.5s cubic-bezier(0.34,1.56,0.64,1))',
  }),
  /* CTA button */
  cta: (accent: string) => ({
    padding: '0.875rem 2rem',
    borderRadius: 'var(--radius-full, 9999px)',
    border: 'none',
    background: accent,
    color: '#fff',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'var(--transition-base, 0.3s cubic-bezier(0.33,1,0.68,1))',
  }),
  ctaSecondary: {
    padding: '0.75rem 1.5rem',
    borderRadius: 'var(--radius-full, 9999px)',
    border: '2px solid var(--surface-container-low, #e8f6f8)',
    background: 'transparent',
    color: 'var(--on-surface-variant, #49454f)',
    fontSize: '0.9rem',
    fontWeight: 500,
    cursor: 'pointer',
  },
  center: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: '1rem', textAlign: 'center' as const },
};

/* ══════════════════════════════════════════════════════════════════
   COMPONENT
   ══════════════════════════════════════════════════════════════════ */

export default function AssessmentV2() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Wake up backend
  useEffect(() => { warmup(); }, []);

  const [state, setState] = useState<AssessmentV2State>({
    currentPhase: -1, // -1 = welcome
    currentQuestion: 0,
    answers: {},
    showTransition: false,
    showAnalyzing: false,
    startedAt: new Date().toISOString(),
  });
  const [slideDir, setSlideDir] = useState<'left' | 'right'>('left');
  const [slideKey, setSlideKey] = useState(0);
  const [hasSavedState, setHasSavedState] = useState(false);
  const [analyzingIdx, setAnalyzingIdx] = useState(0);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── localStorage persistence ── */
  const saveState = useCallback((s: AssessmentV2State) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
  }, []);

  // Load saved state on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved: AssessmentV2State = JSON.parse(raw);
        if (saved.currentPhase >= 0 && !saved.showAnalyzing) {
          setHasSavedState(true);
        }
      }
    } catch {}
  }, []);

  const resumeSaved = useCallback(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved: AssessmentV2State = JSON.parse(raw);
        setState(saved);
        setSlideKey(k => k + 1);
      }
    } catch {}
  }, []);

  const startFresh = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setHasSavedState(false);
    setState(prev => ({ ...prev, currentPhase: 0, currentQuestion: 0, answers: {}, startedAt: new Date().toISOString() }));
    setSlideKey(k => k + 1);
  }, []);

  /* ── Derived values ── */
  const { currentPhase, currentQuestion, answers, showTransition, showAnalyzing } = state;
  const phases = ASSESSMENT_PHASES;
  const phase = currentPhase >= 0 && currentPhase < phases.length ? phases[currentPhase] : null;
  const question = phase ? phase.questions[currentQuestion] : null;
  const totalQuestions = phases.reduce((a, p) => a + p.questions.length, 0);
  const questionsBeforePhase = phases.slice(0, Math.max(0, currentPhase)).reduce((a, p) => a + p.questions.length, 0);
  const globalProgress = currentPhase < 0 ? 0 : Math.round(((questionsBeforePhase + currentQuestion) / totalQuestions) * 100);

  /* ── Answer handler ── */
  const setAnswer = useCallback((qId: string, value: string | string[]) => {
    setState(prev => {
      const next = { ...prev, answers: { ...prev.answers, [qId]: value } };
      saveState(next);
      return next;
    });
  }, [saveState]);

  const selectSingle = useCallback((qId: string, value: string) => {
    setAnswer(qId, value);
    // auto-advance after short delay
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = setTimeout(() => goNext(), AUTO_ADVANCE_MS);
  }, []);

  const toggleChip = useCallback((qId: string, value: string, max: number) => {
    setState(prev => {
      const current = (prev.answers[qId] as string[]) || [];
      let next: string[];
      if (current.includes(value)) {
        next = current.filter(v => v !== value);
      } else if (current.length < max) {
        next = [...current, value];
      } else {
        return prev;
      }
      const updated = { ...prev, answers: { ...prev.answers, [qId]: next } };
      saveState(updated);
      return updated;
    });
  }, [saveState]);

  /* ── Navigation ── */
  const goNext = useCallback(() => {
    setSlideDir('left');
    setState(prev => {
      const p = phases[prev.currentPhase];
      if (!p) return prev;
      if (prev.currentQuestion < p.questions.length - 1) {
        // Next question in same phase
        const next = { ...prev, currentQuestion: prev.currentQuestion + 1 };
        saveState(next);
        setSlideKey(k => k + 1);
        return next;
      }
      // End of phase -> show transition
      const next = { ...prev, showTransition: true };
      saveState(next);
      return next;
    });
  }, [phases, saveState]);

  const goBack = useCallback(() => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    setSlideDir('right');
    setState(prev => {
      if (prev.showTransition) {
        // Go back from transition to last question
        const next = { ...prev, showTransition: false };
        setSlideKey(k => k + 1);
        return next;
      }
      if (prev.currentQuestion > 0) {
        const next = { ...prev, currentQuestion: prev.currentQuestion - 1 };
        saveState(next);
        setSlideKey(k => k + 1);
        return next;
      }
      if (prev.currentPhase > 0) {
        // Go to last question of previous phase
        const prevPhase = prev.currentPhase - 1;
        const next = {
          ...prev,
          currentPhase: prevPhase,
          currentQuestion: phases[prevPhase].questions.length - 1,
          showTransition: false,
        };
        saveState(next);
        setSlideKey(k => k + 1);
        return next;
      }
      // Go back to welcome
      return { ...prev, currentPhase: -1, currentQuestion: 0 };
    });
  }, [phases, saveState]);

  const advancePhase = useCallback(() => {
    setState(prev => {
      const nextPhase = prev.currentPhase + 1;
      if (nextPhase >= phases.length) {
        // All phases done -> analyzing
        return { ...prev, showTransition: false, showAnalyzing: true };
      }
      const next = { ...prev, currentPhase: nextPhase, currentQuestion: 0, showTransition: false };
      saveState(next);
      setSlideKey(k => k + 1);
      return next;
    });
  }, [phases, saveState]);

  // Auto-advance transition screen.
  // Phase 4 (index 3) is the archetype preview — it MUST be manually dismissed
  // (the forced pause is what drives the 2.7x completion boost).
  useEffect(() => {
    if (showTransition && currentPhase !== 3) {
      transitionTimer.current = setTimeout(advancePhase, TRANSITION_AUTO_MS);
      return () => { if (transitionTimer.current) clearTimeout(transitionTimer.current); };
    }
  }, [showTransition, currentPhase, advancePhase]);

  /* ── Analyzing sequence ── */
  useEffect(() => {
    if (!showAnalyzing) return;
    setAnalyzingIdx(0);
    const interval = setInterval(() => {
      setAnalyzingIdx(prev => {
        if (prev >= ANALYZING_MESSAGES.length - 1) {
          clearInterval(interval);
          handleSubmit();
          return prev;
        }
        return prev + 1;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [showAnalyzing]);

  /* ── Submit ── */
  const handleSubmit = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      const payload = {
        userId: user.id,
        workStyle: (answers.b3 as string) === '5' ? 'collaborative' : (answers.b3 as string) === '1' ? 'solo' : 'mixed',
        strengths: Object.entries(answers)
          .filter(([k]) => k.startsWith('r') && answers[k] === 'like')
          .map(([k]) => k),
        values: Object.entries(answers)
          .filter(([k]) => k.startsWith('b'))
          .map(([, v]) => String(v)),
        currentSkills: [],
        experienceLevel: 'mid',
        interests: Object.entries(answers)
          .filter(([k]) => k.startsWith('r'))
          .map(([, v]) => String(v)),
        currentRole: '',
        personalityType: 'v2-assessment',
        rawAnswers: answers,
      };

      const res: any = await assessmentApi.submit(payload);
      localStorage.removeItem(STORAGE_KEY);
      if (res?.result?.careerMatches?.length) {
        navigate('/app/career-match', { state: { result: res.result } });
      } else {
        navigate('/app/career-match');
      }
    } catch {
      // On error go back to last phase so user can retry
      setState(prev => ({
        ...prev,
        showAnalyzing: false,
        showTransition: false,
        currentPhase: phases.length - 1,
        currentQuestion: phases[phases.length - 1].questions.length - 1,
      }));
    }
  };

  /* ── Keyboard shortcuts ── */
  useEffect(() => {
    if (currentPhase < 0 || showTransition || showAnalyzing || !question) return;
    const handler = (e: KeyboardEvent) => {
      if (!question.options) return;
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= question.options.length) {
        selectSingle(question.id, question.options[num - 1].value);
      }
      if (e.key === 'ArrowLeft') goBack();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentPhase, currentQuestion, showTransition, showAnalyzing, question]);

  /* ── Slide animation style ── */
  const slideStyle: React.CSSProperties = {
    animation: `slideIn${slideDir === 'left' ? 'Left' : 'Right'} 250ms ease-out`,
  };

  /* ══════════════════════════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════════════════════════ */

  // Inject keyframes once
  useEffect(() => {
    const id = 'assessment-v2-keyframes';
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.textContent = `
      @keyframes slideInLeft { from { transform: translateX(60px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      @keyframes slideInRight { from { transform: translateX(-60px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      @keyframes fadeIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
      @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
    `;
    document.head.appendChild(style);
  }, []);

  /* ── Welcome Screen ── */
  if (currentPhase === -1 && !showAnalyzing) {
    return (
      <div style={s.page}>
        <div style={{ ...s.card, marginTop: '3rem', animation: 'fadeIn 0.4s ease-out' }}>
          <div style={s.center}>
            <Panda mood="celebrating" size={120} />
            <h1 style={{ ...s.questionText, fontSize: '1.75rem', marginBottom: '0.25rem' }}>
              Discover Your Career DNA
            </h1>
            <p style={{ color: 'var(--on-surface-variant, #49454f)', fontSize: '1rem', marginBottom: '1.5rem' }}>
              ~15 minutes &middot; no wrong answers
            </p>
            <button style={s.cta('var(--secondary, #006a62)')} onClick={startFresh}>
              Start Assessment <ArrowRight size={18} />
            </button>
            {hasSavedState && (
              <button style={{ ...s.ctaSecondary, marginTop: '0.5rem' }} onClick={resumeSaved}>
                Resume where you left off
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ── Analyzing Screen ── */
  if (showAnalyzing) {
    return (
      <div style={s.page}>
        <div style={{ ...s.card, marginTop: '3rem', animation: 'fadeIn 0.4s ease-out' }}>
          <div style={s.center}>
            <Panda mood="working" size={120} animate />
            <h1 style={{ ...s.questionText, fontSize: '1.5rem', marginBottom: '0.25rem' }}>
              Analyzing your profile...
            </h1>
            <p style={{ color: 'var(--on-surface-variant, #49454f)', fontSize: '1rem', animation: 'pulse 1.5s infinite' }}>
              {ANALYZING_MESSAGES[analyzingIdx]}
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ── Phase Transition Screen ── */
  if (showTransition && phase) {
    // Phase 4 (index 3) — archetype preview: manual-only, no auto-advance.
    // This forced pause is the key retention moment (2.7x completion boost).
    if (currentPhase === 3) {
      const preview = getArchetypePreview(answers);
      return (
        <div style={s.page}>
          <div style={{ ...s.card, marginTop: '3rem', animation: 'fadeIn 0.4s ease-out' }}>
            <div style={s.center}>
              <Panda mood="celebrating" size={100} animate />
              <p style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--on-surface-variant, #49454f)',
                marginTop: '1rem',
              }}>
                Early Insight
              </p>
              <h2 style={{
                fontFamily: 'var(--font-display, Manrope, sans-serif)',
                fontSize: '1.75rem',
                fontWeight: 800,
                color: '#006a62',
                marginTop: '0.5rem',
                marginBottom: 0,
              }}>
                You are {preview.name}
              </h2>
              <p style={{
                color: 'var(--on-surface-variant, #49454f)',
                fontSize: '0.95rem',
                marginTop: '0.5rem',
              }}>
                {preview.tagline}
              </p>
              <p style={{
                color: 'var(--on-surface-variant, #49454f)',
                fontSize: '0.85rem',
                marginTop: '1.5rem',
                fontStyle: 'italic',
              }}>
                Two more sections to unlock your full career matches...
              </p>
              <button
                onClick={advancePhase}
                style={{
                  marginTop: '1.5rem',
                  padding: '0.75rem 2rem',
                  background: '#006a62',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 'var(--radius-full, 9999px)',
                  fontWeight: 700,
                  fontSize: '1rem',
                  cursor: 'pointer',
                }}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      );
    }

    // All other phases — generic transition with auto-advance.
    return (
      <div style={s.page}>
        <div style={{ ...s.card, marginTop: '3rem', animation: 'fadeIn 0.4s ease-out', cursor: 'pointer' }} onClick={advancePhase}>
          <div style={s.center}>
            <Panda mood={PHASE_PANDA_MOODS[currentPhase] || 'happy'} size={100} />
            <p style={{ ...s.eyebrow, color: phase.accent }}>
              Phase {currentPhase + 1} of {phases.length} complete
            </p>
            <h2 style={{ ...s.questionText, fontSize: '1.35rem', marginBottom: '0.25rem' }}>
              {phase.title}, done!
            </h2>
            <p style={{ color: 'var(--on-surface-variant, #49454f)', fontSize: '0.95rem' }}>
              {phase.transitionMessage}
            </p>
            <p style={{ color: 'var(--on-surface-muted, #78747e)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
              Tap to continue or wait...
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ── Question Screen ── */
  if (!phase || !question) return null;

  const currentAnswer = answers[question.id];

  const renderOptions = () => {
    switch (question.format) {
      case 'likert3':
        return (
          <div style={s.likert3Wrap}>
            {question.options!.map(opt => (
              <button
                key={opt.value}
                style={s.likert3Btn(currentAnswer === opt.value, opt.value as 'like' | 'neutral' | 'dislike')}
                onClick={() => selectSingle(question.id, opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        );

      case 'likert5':
        return (
          <div style={s.likert5Wrap}>
            {question.options!.map(opt => (
              <button
                key={opt.value}
                style={s.likert5Btn(currentAnswer === opt.value)}
                onClick={() => selectSingle(question.id, opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        );

      case 'forcedChoice':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
            {question.options!.map(opt => (
              <button
                key={opt.value}
                style={s.choiceCard(currentAnswer === opt.value)}
                onClick={() => selectSingle(question.id, opt.value)}
              >
                <div style={{ fontWeight: 600, color: 'var(--on-surface, #1a1c1f)', marginBottom: opt.description ? '0.25rem' : 0 }}>{opt.label}</div>
                {opt.description && <div style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant, #49454f)' }}>{opt.description}</div>}
              </button>
            ))}
          </div>
        );

      case 'scenario':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', width: '100%' }}>
            {question.options!.map(opt => (
              <button
                key={opt.value}
                style={s.scenarioCard(currentAnswer === opt.value)}
                onClick={() => selectSingle(question.id, opt.value)}
              >
                <div style={{ fontWeight: 600, color: 'var(--on-surface, #1a1c1f)', marginBottom: opt.description ? '0.25rem' : 0 }}>{opt.label}</div>
                {opt.description && <div style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant, #49454f)' }}>{opt.description}</div>}
              </button>
            ))}
          </div>
        );

      case 'chips': {
        const selected = (currentAnswer as string[]) || [];
        const max = question.chipMax || 6;
        const min = question.chipMin || 1;
        return (
          <div>
            <div style={s.chipsWrap}>
              {(question.chipOptions || []).map(chip => (
                <button
                  key={chip}
                  style={s.chip(selected.includes(chip))}
                  onClick={() => toggleChip(question.id, chip, max)}
                >
                  {selected.includes(chip) && '\u2713 '}{chip}
                </button>
              ))}
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--on-surface-muted, #78747e)', textAlign: 'center', marginTop: '0.75rem' }}>
              {selected.length}/{max} selected (min {min})
            </p>
            {selected.length >= min && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                <button style={s.cta(phase.accent)} onClick={goNext}>
                  Continue <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div style={s.page}>
      {/* Progress header */}
      <div style={s.header}>
        {(currentPhase > 0 || currentQuestion > 0) && (
          <button style={s.backBtn} onClick={goBack} aria-label="Go back">
            <ArrowLeft size={20} />
          </button>
        )}
        <div style={s.progressOuter}>
          <div style={s.progressBar}>
            <div style={s.progressFill(globalProgress, phase.accent)} />
          </div>
          <span style={s.progressLabel}>
            Phase {currentPhase + 1} of {phases.length} &mdash; {phase.title}
          </span>
        </div>
      </div>

      {/* Question card */}
      <div style={s.card}>
        <div key={slideKey} style={{ ...s.slideWrapper, ...slideStyle }}>
          <p style={s.eyebrow}>
            {currentQuestion + 1} / {phase.questions.length}
          </p>
          <h2 style={s.questionText}>{question.text}</h2>
          {renderOptions()}
        </div>
      </div>
    </div>
  );
}
