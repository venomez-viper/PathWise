import { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../lib/auth-context';
import { assessment as assessmentApi, warmup } from '../../lib/api';
import { Panda } from '../../components/panda';
import { useToast } from '../../lib/toast-context';
import { getArchetypePreview } from './archetypePreview';
import { ASSESSMENT_PHASES, getLastPhaseIndexForTier } from '../Assessment/questionData';
import { SkillDomainPicker } from './SkillDomainPicker';

/* ══════════════════════════════════════════════════════════════════
   CONSTANTS & TYPES
   ══════════════════════════════════════════════════════════════════ */

const STORAGE_KEY = 'pw_assessment_v2';
const AUTO_ADVANCE_MS = 300;
const TRANSITION_AUTO_MS = 2000;
const API_SAVE_DEBOUNCE_MS = 3000;

interface AssessmentV2State {
  currentPhase: number;
  currentQuestion: number;
  answers: Record<string, string | string[] | number>;
  showTransition: boolean;
  showAnalyzing: boolean;
  showTierCheckpoint: false | 1 | 2;  // which tier checkpoint to show
  completedTier: 0 | 1 | 2 | 3;       // highest completed tier
  startedAt: string;
}

const ANALYZING_MESSAGES = [
  'Mapping your career DNA...',
  'Scoring 150+ career paths...',
  'Finding your unique strengths...',
  'Building your career fingerprint...',
];

const PHASE_PANDA_MOODS = ['curious', 'happy', 'thinking', 'cool', 'thinking', 'cool', 'working', 'celebrating'] as const;

const PHASE_TRANSITION_MESSAGES = [
  // Tier 1 phases (0-2)
  'Great start! Your interest profile is taking shape...',
  'Values locked in. Just a few context questions to personalize your results.',
  'Core profile complete! Your career matches are ready.',
  // Tier 2 phases (3-4)
  'Your personality profile is forming. Almost done with this tier...',
  'Deeper insights unlocked! Your matches are getting more precise.',
  // Tier 3 phases (5-7)
  "Excellent! Your work DNA is mapped. Aptitudes next...",
  'Strengths noted. Just a couple more context questions.',
  'All done! Building your career fingerprint...',
];

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
    maxWidth: 960,
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
    maxWidth: 960,
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
  likert5Wrap: { display: 'flex', gap: '0.5rem', justifyContent: 'center', width: '100%', flexWrap: 'wrap' as const },
  likert5Btn: (selected: boolean, accent: string) => ({
    flex: '1 1 80px',
    minWidth: 80,
    padding: '0.75rem 0.5rem',
    borderRadius: 'var(--radius-full, 9999px)',
    border: '2px solid',
    borderColor: selected ? accent : 'var(--surface-container-low, #e8f6f8)',
    background: selected ? `${accent}18` : 'var(--surface-container-low, #e8f6f8)',
    color: selected ? accent : 'var(--on-surface-variant, #49454f)',
    fontSize: '0.8rem',
    fontWeight: selected ? 700 : 500,
    cursor: 'pointer',
    transition: 'var(--transition-spring, 0.5s cubic-bezier(0.34,1.56,0.64,1))',
    transform: selected ? 'scale(1.05)' : 'scale(1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center' as const,
  }),
  /* forcedChoice */
  choiceCard: (selected: boolean, accent: string) => ({
    width: '100%',
    padding: '1.25rem',
    borderRadius: '1.25rem',
    border: '2px solid',
    borderColor: selected ? accent : 'var(--surface-container-low, #e8f6f8)',
    background: selected ? `${accent}0f` : 'var(--surface-container-lowest, #ffffff)',
    cursor: 'pointer',
    textAlign: 'left' as const,
    transition: 'var(--transition-base, 0.3s cubic-bezier(0.33,1,0.68,1))',
  }),
  /* scenario */
  scenarioCard: (selected: boolean, accent: string) => ({
    width: '100%',
    padding: '1rem 1.25rem',
    borderRadius: '1rem',
    border: '2px solid',
    borderColor: selected ? accent : 'var(--surface-container-low, #e8f6f8)',
    background: selected ? `${accent}0f` : 'var(--surface-container-lowest, #ffffff)',
    cursor: 'pointer',
    textAlign: 'left' as const,
    transition: 'var(--transition-base, 0.3s cubic-bezier(0.33,1,0.68,1))',
  }),
  /* chips */
  chipsWrap: { display: 'flex', flexWrap: 'wrap' as const, gap: '0.5rem', justifyContent: 'center', width: '100%' },
  chip: (selected: boolean, accent: string) => ({
    padding: '0.5rem 1rem',
    borderRadius: 'var(--radius-full, 9999px)',
    border: '2px solid',
    borderColor: selected ? accent : 'var(--surface-container-low, #e8f6f8)',
    background: selected ? `${accent}14` : 'var(--surface-container-low, #e8f6f8)',
    color: selected ? accent : 'var(--on-surface, #1a1c1f)',
    fontSize: '0.9rem',
    fontWeight: selected ? 600 : 400,
    cursor: 'pointer',
    transition: 'var(--transition-spring, 0.5s cubic-bezier(0.34,1.56,0.64,1))',
  }),
  /* select */
  selectBtn: (selected: boolean, accent: string) => ({
    width: '100%',
    padding: '1rem 1.25rem',
    borderRadius: '1rem',
    border: '2px solid',
    borderColor: selected ? accent : 'var(--surface-container-low, #e8f6f8)',
    background: selected ? `${accent}0f` : 'var(--surface-container-lowest, #ffffff)',
    color: 'var(--on-surface, #1a1c1f)',
    fontSize: '0.95rem',
    fontWeight: selected ? 600 : 400,
    cursor: 'pointer',
    textAlign: 'left' as const,
    transition: 'var(--transition-base, 0.3s cubic-bezier(0.33,1,0.68,1))',
    transform: selected ? 'scale(1.01)' : 'scale(1)',
  }),
  /* ranking */
  rankingItem: (selected: boolean, accent: string) => ({
    width: '100%',
    padding: '0.875rem 1.25rem',
    borderRadius: '1rem',
    border: '2px solid',
    borderColor: selected ? accent : 'var(--surface-container-low, #e8f6f8)',
    background: selected ? `${accent}0f` : 'var(--surface-container-lowest, #ffffff)',
    color: 'var(--on-surface, #1a1c1f)',
    fontSize: '0.95rem',
    fontWeight: selected ? 600 : 400,
    cursor: 'pointer',
    textAlign: 'left' as const,
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    transition: 'var(--transition-base, 0.3s cubic-bezier(0.33,1,0.68,1))',
  }),
  rankBadge: (accent: string) => ({
    minWidth: 28,
    height: 28,
    borderRadius: '50%',
    background: accent,
    color: '#fff',
    fontSize: '0.85rem',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
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
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Wake up backend
  useEffect(() => { warmup(); }, []);

  // Tier boundaries (index of last phase in each tier)
  const tier1LastIdx = getLastPhaseIndexForTier(1);
  const tier2LastIdx = getLastPhaseIndexForTier(2);

  const [state, setState] = useState<AssessmentV2State>({
    currentPhase: -1, // -1 = welcome
    currentQuestion: 0,
    answers: {},
    showTransition: false,
    showAnalyzing: false,
    showTierCheckpoint: false,
    completedTier: 0,
    startedAt: new Date().toISOString(),
  });
  const [slideDir, setSlideDir] = useState<'left' | 'right'>('left');
  const [slideKey, setSlideKey] = useState(0);
  const [hasSavedState, setHasSavedState] = useState(false);
  const [analyzingIdx, setAnalyzingIdx] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const apiSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastApiSavePhase = useRef<number>(-1);
  const lastApiSaveQuestion = useRef<number>(0);

  /* ── localStorage + server persistence ── */
  const saveState = useCallback((s: AssessmentV2State) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}

    // Debounced server save: fires on phase change or every 5 questions
    const phaseChanged = s.currentPhase !== lastApiSavePhase.current;
    const questionDelta = Math.abs(s.currentQuestion - lastApiSaveQuestion.current);
    const shouldSaveNow = phaseChanged || questionDelta >= 5;

    if (shouldSaveNow && user) {
      if (apiSaveTimer.current) clearTimeout(apiSaveTimer.current);
      apiSaveTimer.current = setTimeout(() => {
        lastApiSavePhase.current = s.currentPhase;
        lastApiSaveQuestion.current = s.currentQuestion;
        assessmentApi.saveProgress({
          currentPhase: s.currentPhase,
          currentQuestion: s.currentQuestion,
          answers: s.answers,
          completedTier: s.completedTier,
          startedAt: s.startedAt,
        }).catch(() => {}); // silent -- localStorage is the primary cache
      }, API_SAVE_DEBOUNCE_MS);
    }
  }, [user]);

  // Load saved state on mount: try API first, fall back to localStorage
  useEffect(() => {
    let cancelled = false;

    async function loadProgress() {
      // Try localStorage first (fast)
      let localSaved: AssessmentV2State | null = null;
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) localSaved = JSON.parse(raw);
      } catch {}

      // Try API (durable backup)
      let serverSaved: AssessmentV2State | null = null;
      if (user) {
        try {
          const res = await assessmentApi.getProgress();
          if (res.progress) {
            serverSaved = {
              currentPhase: res.progress.currentPhase,
              currentQuestion: res.progress.currentQuestion,
              answers: res.progress.answers,
              completedTier: res.progress.completedTier ?? 0,
              startedAt: res.progress.startedAt,
              showTransition: false,
              showAnalyzing: false,
              showTierCheckpoint: false,
            } as AssessmentV2State;
          }
        } catch {}
      }

      if (cancelled) return;

      // Pick whichever has more progress (more answered questions)
      const localCount = localSaved ? Object.keys(localSaved.answers || {}).length : 0;
      const serverCount = serverSaved ? Object.keys(serverSaved.answers || {}).length : 0;
      const best = serverCount > localCount ? serverSaved : localSaved;

      if (best && best.currentPhase >= 0 && !best.showAnalyzing) {
        // Sync the winner back to localStorage
        if (best === serverSaved) {
          try { localStorage.setItem(STORAGE_KEY, JSON.stringify(best)); } catch {}
        }
        setHasSavedState(true);
      }
    }

    loadProgress();
    return () => { cancelled = true; };
  }, [user]);

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
    // If resuming for tier 2/3, skip to that tier's first phase
    const tierParam = searchParams.get('tier');
    const resumeTier = tierParam === '2' || tierParam === '3' ? parseInt(tierParam) as 2 | 3 : null;

    if (resumeTier) {
      // Load existing answers from storage, start at the next tier's first phase
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const saved: AssessmentV2State = JSON.parse(raw);
          const startPhase = resumeTier === 2 ? tier1LastIdx + 1 : tier2LastIdx + 1;
          setState({
            ...saved,
            currentPhase: startPhase,
            currentQuestion: 0,
            showTransition: false,
            showAnalyzing: false,
            showTierCheckpoint: false,
          });
          setSlideKey(k => k + 1);
          return;
        }
      } catch {}
    }

    localStorage.removeItem(STORAGE_KEY);
    // Clear server-side progress too
    if (user) { assessmentApi.saveProgress({ currentPhase: 0, currentQuestion: 0, answers: {}, completedTier: 0, startedAt: new Date().toISOString() }).catch(() => {}); }
    setHasSavedState(false);
    setState(prev => ({ ...prev, currentPhase: 0, currentQuestion: 0, answers: {}, showTierCheckpoint: false, startedAt: new Date().toISOString() }));
    setSlideKey(k => k + 1);
  }, [searchParams, tier1LastIdx, tier2LastIdx, user]);

  /* ── Derived values ── */
  const { currentPhase, currentQuestion, answers, showTransition, showAnalyzing, showTierCheckpoint } = state;
  const phases = ASSESSMENT_PHASES;
  const phase = currentPhase >= 0 && currentPhase < phases.length ? phases[currentPhase] : null;
  const question = phase ? phase.questions[currentQuestion] : null;
  const totalQuestions = phases.reduce((a, p) => a + p.questions.length, 0);
  const questionsBeforePhase = phases.slice(0, Math.max(0, currentPhase)).reduce((a, p) => a + p.questions.length, 0);
  const globalProgress = currentPhase < 0 ? 0 : Math.round(((questionsBeforePhase + currentQuestion) / totalQuestions) * 100);
  const phaseAccent = phase?.color ?? 'var(--secondary, #006a62)';

  /* ── Answer handler ── */
  const setAnswer = useCallback((qId: string, value: string | string[]) => {
    setState(prev => {
      const next = { ...prev, answers: { ...prev.answers, [qId]: value } };
      saveState(next);
      return next;
    });
  }, [saveState]);

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

  /* Toggle for ranking — ordered list, click appends/removes */
  const toggleRank = useCallback((qId: string, value: string) => {
    setState(prev => {
      const current = (prev.answers[qId] as string[]) || [];
      const next = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
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

  const selectSingle = useCallback((qId: string, value: string) => {
    setAnswer(qId, value);
    // auto-advance after short delay
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = setTimeout(() => goNext(), AUTO_ADVANCE_MS);
  }, [setAnswer, goNext]);

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

      // Check if we just finished a tier boundary -> show checkpoint
      if (prev.currentPhase === tier1LastIdx && prev.completedTier < 1) {
        const next = { ...prev, showTransition: false, showTierCheckpoint: 1 as const, completedTier: 1 as const };
        saveState(next);
        return next;
      }
      if (prev.currentPhase === tier2LastIdx && prev.completedTier < 2) {
        const next = { ...prev, showTransition: false, showTierCheckpoint: 2 as const, completedTier: 2 as const };
        saveState(next);
        return next;
      }

      if (nextPhase >= phases.length) {
        // All phases done -> analyzing
        return { ...prev, showTransition: false, showTierCheckpoint: false, completedTier: 3 as const, showAnalyzing: true };
      }
      const next = { ...prev, currentPhase: nextPhase, currentQuestion: 0, showTransition: false, showTierCheckpoint: false as const };
      saveState(next);
      setSlideKey(k => k + 1);
      return next;
    });
  }, [phases, saveState, tier1LastIdx, tier2LastIdx]);

  /** Continue from a tier checkpoint into the next tier */
  const continueToNextTier = useCallback(() => {
    setState(prev => {
      const nextPhaseIdx = prev.showTierCheckpoint === 1 ? tier1LastIdx + 1 : tier2LastIdx + 1;
      const next = { ...prev, currentPhase: nextPhaseIdx, currentQuestion: 0, showTierCheckpoint: false as const };
      saveState(next);
      setSlideKey(k => k + 1);
      return next;
    });
  }, [tier1LastIdx, tier2LastIdx, saveState]);

  /** Submit at the current tier checkpoint (skip remaining tiers) */
  const submitAtCheckpoint = useCallback(() => {
    setState(prev => ({ ...prev, showTierCheckpoint: false as const, showAnalyzing: true }));
  }, []);

  // Auto-advance transition screen.
  // The Work DNA phase (id=4) has the archetype preview — manual-only dismiss.
  const workDnaPhaseIdx = phases.findIndex(p => p.id === 4);
  useEffect(() => {
    if (showTransition && currentPhase !== workDnaPhaseIdx) {
      transitionTimer.current = setTimeout(advancePhase, TRANSITION_AUTO_MS);
      return () => { if (transitionTimer.current) clearTimeout(transitionTimer.current); };
    }
  }, [showTransition, currentPhase, workDnaPhaseIdx, advancePhase]);

  /* ── Submit ── */
  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;
    if (!user) { navigate('/login'); return; }
    setIsSubmitting(true);
    try {
      // Extract fields the backend expects from raw answers
      const skills = Array.isArray(answers['lc_skills']) ? answers['lc_skills'] as string[] : [];
      const domains = Array.isArray(answers['lc_domains']) ? answers['lc_domains'] as string[] : [];
      const expLevel = typeof answers['lc_experience'] === 'string' ? answers['lc_experience'] : 'junior';

      // Extract strengths from aptitude answers (sa_* questions)
      const extractedStrengths: string[] = [];
      for (const [key, val] of Object.entries(answers)) {
        if (key.startsWith('sa_') && val) {
          const vals = Array.isArray(val) ? val : [String(val)];
          extractedStrengths.push(...vals.filter(v => typeof v === 'string' && v.length > 0));
        }
      }

      // Extract values from values answers (va_* questions)
      const extractedValues: string[] = [];
      for (const [key, val] of Object.entries(answers)) {
        if (key.startsWith('va_') && val && key !== 'va_rank') {
          const vals = Array.isArray(val) ? val : [String(val)];
          extractedValues.push(...vals.filter(v => typeof v === 'string' && v.length > 0));
        }
      }

      // Extract work style from wd_* answers
      const workStyleAnswers: string[] = [];
      for (const [key, val] of Object.entries(answers)) {
        if (key.startsWith('wd_') && val) {
          const vals = Array.isArray(val) ? val : [String(val)];
          workStyleAnswers.push(...vals.filter(v => typeof v === 'string' && v.length > 0));
        }
      }

      const payload = {
        userId: user.id,
        rawAnswers: answers,
        currentSkills: skills,
        interests: domains,
        experienceLevel: expLevel,
        trajectory: typeof answers['lc_stage'] === 'string' ? answers['lc_stage'] : 'exploring',
        workStyle: workStyleAnswers.length > 0 ? workStyleAnswers[0] : 'mixed',
        strengths: extractedStrengths,
        values: extractedValues,
        startedAt: state.startedAt,
      };

      const res: any = await assessmentApi.submitV2(payload);
      // Keep answers in localStorage so user can resume for deeper tiers
      const tierCompleted = (state as any).completedTier || 1;
      if (tierCompleted < 3) {
        saveState({ ...state, showAnalyzing: false, showTransition: false, showTierCheckpoint: false });
      } else {
        localStorage.removeItem(STORAGE_KEY);
        // Clear server-side progress on full completion
        assessmentApi.saveProgress({ currentPhase: 0, currentQuestion: 0, answers: {}, completedTier: 0, startedAt: '' }).catch(() => {});
      }
      toast('Progress saved', 'success');
      import('posthog-js').then(({ default: posthog }) => {
        posthog.capture('assessment_completed', {
          tier: tierCompleted,
          top_career: res.result?.careerMatches?.[0]?.title,
          match_score: res.result?.careerMatches?.[0]?.matchScore,
        });
      });
      navigate('/app/assessment-v2/results', { state: { result: res.result, completedTier: tierCompleted } });
    } catch (err) {
      toast('Something went wrong', 'error');
      setIsSubmitting(false);
      // On error go back to last answered phase so user can retry
      const lastPhaseIdx = Math.min(state.currentPhase, phases.length - 1);
      setState(prev => ({
        ...prev,
        showAnalyzing: false,
        showTransition: false,
        showTierCheckpoint: false as const,
        currentPhase: lastPhaseIdx,
        currentQuestion: phases[lastPhaseIdx].questions.length - 1,
      }));
    }
  }, [isSubmitting, user, navigate, answers, state, saveState, phases]);

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
  }, [showAnalyzing, handleSubmit]);

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
    const phases = [
      { icon: '🎯', label: 'Interests', desc: 'What excites you' },
      { icon: '🧠', label: 'Personality', desc: 'How you think' },
      { icon: '💎', label: 'Values', desc: 'What matters most' },
      { icon: '⚡', label: 'Work Style', desc: 'How you work best' },
      { icon: '🔧', label: 'Aptitudes', desc: 'Your natural strengths' },
      { icon: '🌍', label: 'Life Context', desc: 'Where you are now' },
    ];
    const outcomes = [
      'Your unique career archetype (30 possible types)',
      'Top 3 career matches with match scores',
      'Skill gaps ranked by ROI with free learning resources',
      'A personalized roadmap with milestones and daily tasks',
    ];
    return (
      <div style={s.page}>
        <div style={{ ...s.card, marginTop: '2rem', maxWidth: 520, animation: 'fadeIn 0.4s ease-out' }}>
          <div style={s.center}>
            <Panda mood="celebrating" size={100} />
            <h1 style={{ ...s.questionText, fontSize: '1.85rem', marginBottom: '0.25rem', letterSpacing: '-0.03em' }}>
              Discover Your Career DNA
            </h1>
            <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.95rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              83 questions across 6 dimensions. No wrong answers.
              <br />Takes about 8 minutes.
            </p>
          </div>

          {/* 6 Phase pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: '1.5rem' }}>
            {phases.map((p, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'var(--surface-container-low)', borderRadius: 'var(--radius-full)',
                padding: '6px 14px', fontSize: '0.78rem', fontWeight: 600, color: 'var(--on-surface)',
              }}>
                <span style={{ fontSize: '0.9rem' }}>{p.icon}</span> {p.label}
              </div>
            ))}
          </div>

          {/* What you'll get */}
          <div style={{
            background: 'var(--surface-container-low)', borderRadius: 'var(--radius-xl)',
            padding: '1.25rem 1.5rem', marginBottom: '1.5rem', textAlign: 'left',
          }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--copper)', marginBottom: '0.75rem' }}>
              What you'll get
            </p>
            {outcomes.map((text, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: i < outcomes.length - 1 ? '0.6rem' : 0 }}>
                <CheckCircle2 size={16} color="var(--copper)" style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: '0.88rem', color: 'var(--on-surface)', lineHeight: 1.45 }}>{text}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div style={s.center}>
            <button style={{ ...s.cta('var(--copper)'), width: '100%', maxWidth: 320 }} onClick={startFresh}>
              Start Assessment <ArrowRight size={18} />
            </button>
            {hasSavedState && (
              <button style={{ ...s.ctaSecondary, marginTop: '0.5rem' }} onClick={resumeSaved}>
                Resume where you left off
              </button>
            )}
            <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-muted)', marginTop: '1rem' }}>
              Your progress is saved automatically. You can pause and return anytime.
            </p>
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

  /* ── Tier 1 Checkpoint ── */
  if (showTierCheckpoint === 1) {
    return (
      <div style={s.page}>
        <div style={{ ...s.card, marginTop: '3rem', animation: 'fadeIn 0.4s ease-out' }}>
          <div style={s.center}>
            <Panda mood="celebrating" size={120} animate />
            <h2 style={{ ...s.questionText, fontSize: '1.5rem', marginBottom: '0.5rem' }}>Your Career Matches Are Ready!</h2>
            <p style={{ color: 'var(--on-surface-variant, #49454f)', fontSize: '1rem', marginBottom: '1.5rem', maxWidth: 400 }}>We have enough data to show your top career matches.</p>
            <button style={s.cta('var(--secondary, #006a62)')} onClick={submitAtCheckpoint}>See My Results Now <ArrowRight size={18} /></button>
            <p style={{ marginTop: '2rem', color: 'var(--on-surface-variant, #49454f)', fontSize: '0.9rem' }}>Want even more accurate results?</p>
            <button style={s.ctaSecondary} onClick={continueToNextTier}>Continue for Deeper Insights (+5 min)</button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Tier 2 Checkpoint ── */
  if (showTierCheckpoint === 2) {
    return (
      <div style={s.page}>
        <div style={{ ...s.card, marginTop: '3rem', animation: 'fadeIn 0.4s ease-out' }}>
          <div style={s.center}>
            <Panda mood="cool" size={100} animate />
            <h2 style={{ ...s.questionText, fontSize: '1.5rem', marginBottom: '0.5rem' }}>Great! Your profile is much stronger now.</h2>
            <p style={{ color: 'var(--on-surface-variant, #49454f)', fontSize: '1rem', marginBottom: '1.5rem', maxWidth: 400 }}>Personality insights are locked in. Your matches will be more precise.</p>
            <button style={s.cta('var(--secondary, #006a62)')} onClick={submitAtCheckpoint}>See Enhanced Results <ArrowRight size={18} /></button>
            <p style={{ marginTop: '2rem', color: 'var(--on-surface-variant, #49454f)', fontSize: '0.9rem' }}>Want maximum precision?</p>
            <button style={s.ctaSecondary} onClick={continueToNextTier}>Maximum Precision (+4 min)</button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Phase Transition Screen ── */
  if (showTransition && phase) {
    // Work DNA phase (id=4) — archetype preview: manual-only, no auto-advance.
    // This forced pause is the key retention moment (2.7x completion boost).
    if (currentPhase === workDnaPhaseIdx) {
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
    const transitionMsg = PHASE_TRANSITION_MESSAGES[currentPhase] ?? 'Great work! On to the next section...';
    return (
      <div style={s.page}>
        <div style={{ ...s.card, marginTop: '3rem', animation: 'fadeIn 0.4s ease-out', cursor: 'pointer' }} onClick={advancePhase}>
          <div style={s.center}>
            <Panda mood={PHASE_PANDA_MOODS[currentPhase] || 'happy'} size={100} />
            <p style={{ ...s.eyebrow, color: phaseAccent }}>
              Phase {currentPhase + 1} of {phases.length} complete
            </p>
            <h2 style={{ ...s.questionText, fontSize: '1.35rem', marginBottom: '0.25rem' }}>
              {phase.title}, done!
            </h2>
            <p style={{ color: 'var(--on-surface-variant, #49454f)', fontSize: '0.95rem' }}>
              {transitionMsg}
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
            {question.options.map(opt => (
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
            {question.options.map(opt => (
              <button
                key={opt.value}
                style={s.likert5Btn(currentAnswer === opt.value, phaseAccent)}
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
            {question.options.map(opt => (
              <button
                key={opt.value}
                style={s.choiceCard(currentAnswer === opt.value, phaseAccent)}
                onClick={() => selectSingle(question.id, opt.value)}
              >
                <div style={{ fontWeight: 600, color: 'var(--on-surface, #1a1c1f)' }}>{opt.label}</div>
              </button>
            ))}
          </div>
        );

      case 'scenario':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', width: '100%' }}>
            {question.options.map(opt => (
              <button
                key={opt.value}
                style={s.scenarioCard(currentAnswer === opt.value, phaseAccent)}
                onClick={() => selectSingle(question.id, opt.value)}
              >
                <div style={{ fontWeight: currentAnswer === opt.value ? 600 : 400, color: 'var(--on-surface, #1a1c1f)', fontSize: '0.9rem', lineHeight: 1.45 }}>{opt.label}</div>
              </button>
            ))}
          </div>
        );

      case 'chips': {
        const selected = (currentAnswer as string[]) || [];
        // lc_skills: no upper limit; lc_domains: up to 8; lc_learning: up to 3
        const max = question.id === 'lc_skills' ? Infinity : question.id === 'lc_domains' ? 8 : 3;
        const min = question.id === 'lc_skills' ? 0 : 1;

        // Skills question uses the interactive domain-to-skill picker
        if (question.id === 'lc_skills') {
          return (
            <div>
              <SkillDomainPicker
                selected={selected}
                onToggle={(value: string) => toggleChip(question.id, value, Infinity)}
              />
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                <button style={s.cta(phaseAccent)} onClick={goNext}>
                  Continue <ArrowRight size={16} />
                </button>
              </div>
            </div>
          );
        }

        return (
          <div>
            <div style={s.chipsWrap}>
              {question.options.map(opt => (
                <button
                  key={opt.value}
                  style={s.chip(selected.includes(opt.value), phaseAccent)}
                  onClick={() => toggleChip(question.id, opt.value, max)}
                >
                  {selected.includes(opt.value) && '\u2713 '}{opt.label}
                </button>
              ))}
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--on-surface-muted, #78747e)', textAlign: 'center', marginTop: '0.75rem' }}>
              {max === Infinity
                ? `${selected.length} selected`
                : `${selected.length}/${max} selected${min > 0 ? ` (min ${min})` : ''}`}
            </p>
            {(min === 0 || selected.length >= min) && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                <button style={s.cta(phaseAccent)} onClick={goNext}>
                  Continue <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        );
      }

      case 'select':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', width: '100%' }}>
            {question.options.map(opt => (
              <button
                key={opt.value}
                style={s.selectBtn(currentAnswer === opt.value, phaseAccent)}
                onClick={() => selectSingle(question.id, opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        );

      case 'ranking': {
        // Ordered tap-to-rank: user taps items in priority order, badge shows rank number.
        const ranked = (currentAnswer as string[]) || [];
        return (
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--on-surface-muted, #78747e)', textAlign: 'center', marginBottom: '0.75rem' }}>
              Tap in order from most to least important. Tap again to remove.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', width: '100%' }}>
              {question.options.map(opt => {
                const rankPos = ranked.indexOf(opt.value);
                const isSelected = rankPos !== -1;
                return (
                  <button
                    key={opt.value}
                    style={s.rankingItem(isSelected, phaseAccent)}
                    onClick={() => toggleRank(question.id, opt.value)}
                  >
                    {isSelected ? (
                      <span style={s.rankBadge(phaseAccent)}>{rankPos + 1}</span>
                    ) : (
                      <span style={{
                        minWidth: 28,
                        height: 28,
                        borderRadius: '50%',
                        border: '2px dashed var(--surface-container-low, #e8f6f8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }} />
                    )}
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
            {ranked.length === question.options.length && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                <button style={s.cta(phaseAccent)} onClick={goNext}>
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
            <div style={s.progressFill(globalProgress, phaseAccent)} />
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

      {/* Navigation buttons */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
        <button
          onClick={goBack}
          aria-label="Previous question"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 44, height: 44, borderRadius: '50%',
            border: `2px solid ${phaseAccent}44`,
            background: 'var(--surface)',
            color: phaseAccent,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = phaseAccent;
            (e.currentTarget as HTMLButtonElement).style.color = '#fff';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface)';
            (e.currentTarget as HTMLButtonElement).style.color = phaseAccent;
          }}
        >
          <ArrowLeft size={18} />
        </button>

        <span style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', fontWeight: 500, minWidth: 60, textAlign: 'center' }}>
          {currentQuestion + 1} / {phase.questions.length}
        </span>

        <button
          onClick={goNext}
          aria-label="Next question"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 44, height: 44, borderRadius: '50%',
            border: `2px solid ${phaseAccent}44`,
            background: 'var(--surface)',
            color: phaseAccent,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = phaseAccent;
            (e.currentTarget as HTMLButtonElement).style.color = '#fff';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface)';
            (e.currentTarget as HTMLButtonElement).style.color = phaseAccent;
          }}
        >
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
