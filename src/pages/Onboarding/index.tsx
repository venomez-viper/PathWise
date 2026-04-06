import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../lib/auth-context';
import { roadmap, assessment } from '../../lib/api';
import './Onboarding.css';

const TIMELINES = [
  { label: '3 months', value: '3mo', desc: 'Fast track' },
  { label: '6 months', value: '6mo', desc: 'Recommended' },
  { label: '12 months', value: '12mo', desc: 'Steady pace' },
];

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(0);
  const [targetRole, setTargetRole] = useState('');
  const [timeline, setTimeline] = useState('6mo');
  const [_generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [assessmentMatches, setAssessmentMatches] = useState<{ title: string; matchScore: number; pathwayTime?: string }[]>([]);

  const firstName = user?.name?.split(' ')[0] ?? 'there';

  // Pre-fill from assessment if navigated from results page
  useEffect(() => {
    const state = location.state as { targetRole?: string; pathwayTime?: string } | null;
    if (state?.targetRole) {
      setTargetRole(state.targetRole);
      // Map pathwayTime to timeline
      const pt = state.pathwayTime?.toLowerCase() ?? '';
      if (pt.includes('3') || pt.includes('short')) setTimeline('3mo');
      else if (pt.includes('12') || pt.includes('year') || pt.includes('long')) setTimeline('12mo');
      else setTimeline('6mo');
      // Skip welcome, go straight to role confirmation
      setStep(1);
    }

    // Also load assessment matches for role suggestions
    if (user) {
      assessment.getResult(user.id).then((res: any) => {
        if (res?.result?.careerMatches?.length) {
          setAssessmentMatches(res.result.careerMatches);
          // If no role pre-filled, default to top match
          if (!state?.targetRole && res.result.careerMatches[0]?.title) {
            setTargetRole(res.result.careerMatches[0].title);
          }
        }
      }).catch(() => {});
    }
  }, []);

  const handleGenerate = async () => {
    if (!targetRole.trim() || !user) return;
    setStep(2);
    setGenerating(true);
    setError('');
    try {
      await roadmap.generate({ userId: user.id, targetRole: targetRole.trim(), timeline });
      setTimeout(() => navigate('/app', { replace: true }), 1000);
    } catch (err: unknown) {
      setGenerating(false);
      setStep(1);
      setError(err instanceof Error ? err.message : 'Failed to generate roadmap. Please try again.');
    }
  };

  return (
    <div className="onboarding">
      {/* Progress dots */}
      {step < 2 && (
        <div className="onboarding__dots">
          {[0, 1].map(i => (
            <div key={i} className={`onboarding__dot${i === step ? ' active' : i < step ? ' done' : ''}`} />
          ))}
        </div>
      )}

      {/* Step 0: Welcome */}
      {step === 0 && (
        <div className="onboarding__card">
          <div className="onboarding__icon"><Sparkles size={28} color="#6245a4" /></div>
          <h1 className="onboarding__title">Hey {firstName}, let's build<br />your career roadmap.</h1>
          <p className="onboarding__sub">
            PathWise will generate a personalised roadmap with milestones, tasks, and skill guidance — all tailored to your target role.
          </p>
          <div className="onboarding__features">
            {['AI-generated career milestones', 'Skill gap analysis', 'Daily task planner'].map(f => (
              <div key={f} className="onboarding__feature"><CheckCircle2 size={16} color="#006a62" /><span>{f}</span></div>
            ))}
          </div>
          <button className="onboarding__btn" onClick={() => setStep(1)}>
            Get Started <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* Step 1: Target role */}
      {step === 1 && (
        <div className="onboarding__card">
          <p className="onboarding__eyebrow">STEP 1 OF 2</p>
          <h1 className="onboarding__title">
            {assessmentMatches.length > 0 ? 'Confirm your career path' : 'What role are you\nworking towards?'}
          </h1>
          <p className="onboarding__sub">
            {assessmentMatches.length > 0
              ? 'Based on your assessment — pick the role to build your roadmap around.'
              : 'Choose from the list or type your own.'}
          </p>

          {assessmentMatches.length > 0 && (
            <div className="onboarding__chips" style={{ flexDirection: 'column', gap: '0.5rem' }}>
              {assessmentMatches.map((m: any) => (
                <button
                  key={m.title}
                  className={`onboarding__chip${targetRole === m.title ? ' selected' : ''}`}
                  style={{ width: '100%', textAlign: 'left', display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem' }}
                  onClick={() => setTargetRole(m.title)}
                >
                  <span>{m.title}</span>
                  <span style={{ opacity: 0.6, fontSize: '0.85rem' }}>{m.matchScore}% match</span>
                </button>
              ))}
            </div>
          )}

          {assessmentMatches.length === 0 && (
            <div className="onboarding__chips">
              {['Frontend Developer', 'Backend Developer', 'Data Scientist', 'UX Designer',
                'Product Manager', 'Digital Marketer', 'Business Analyst', 'DevOps/SRE Engineer'
              ].map(role => (
                <button
                  key={role}
                  className={`onboarding__chip${targetRole === role ? ' selected' : ''}`}
                  onClick={() => setTargetRole(role)}
                >{role}</button>
              ))}
            </div>
          )}

          <input
            type="text"
            className="onboarding__input"
            placeholder="Or type a custom role..."
            value={targetRole}
            onChange={e => setTargetRole(e.target.value)}
          />

          <p className="onboarding__sub" style={{ marginTop: '1.5rem' }}>How long do you have?</p>
          <div className="onboarding__timelines">
            {TIMELINES.map(t => (
              <button
                key={t.value}
                className={`onboarding__timeline${timeline === t.value ? ' selected' : ''}`}
                onClick={() => setTimeline(t.value)}
              >
                <span className="onboarding__timeline-label">{t.label}</span>
                <span className="onboarding__timeline-desc">{t.desc}</span>
              </button>
            ))}
          </div>

          {error && <p className="onboarding__error">{error}</p>}

          <button className="onboarding__btn" disabled={!targetRole.trim()} onClick={handleGenerate}>
            Generate My Roadmap <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* Step 2: Generating */}
      {step === 2 && (
        <div className="onboarding__card onboarding__card--center">
          <div className="onboarding__generating">
            <Loader2 size={40} color="#006a62" style={{ animation: 'spin 0.8s linear infinite' }} />
          </div>
          <h1 className="onboarding__title">Building your roadmap…</h1>
          <p className="onboarding__sub">Creating personalised milestones and tasks for <strong>{targetRole}</strong>.</p>
        </div>
      )}
    </div>
  );
}
