import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../../lib/auth-context';
import { roadmap, assessment } from '../../lib/api';
import { Panda } from '../../components/panda';
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
  const [step, setStep] = useState<'welcome' | 'role' | 'generating'>('welcome');
  const [targetRole, setTargetRole] = useState('');
  const [timeline, setTimeline] = useState('6mo');
  const [_generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [assessmentMatches, setAssessmentMatches] = useState<{ title: string; matchScore: number; pathwayTime?: string }[]>([]);

  const firstName = user?.name?.split(' ')[0] ?? 'there';

  // If coming back from Assessment V2 results with a role, skip to role confirmation
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roleParam = params.get('role');
    const state = location.state as { targetRole?: string; pathwayTime?: string } | null;
    const prefilledRole = roleParam || state?.targetRole;

    if (prefilledRole) {
      setTargetRole(prefilledRole);
      if (state?.pathwayTime) {
        const pt = state.pathwayTime.toLowerCase();
        if (pt.includes('3') || pt.includes('short')) setTimeline('3mo');
        else if (pt.includes('12') || pt.includes('year') || pt.includes('long')) setTimeline('12mo');
        else setTimeline('6mo');
      }
      setStep('role');
    }

    // Load assessment matches for role suggestions
    if (user) {
      assessment.getResult(user.id).then((res: any) => {
        if (res?.result?.careerMatches?.length) {
          setAssessmentMatches(res.result.careerMatches);
          if (!prefilledRole && res.result.careerMatches[0]?.title) {
            setTargetRole(res.result.careerMatches[0].title);
          }
        }
      }).catch(() => {});
    }
  }, []);

  const handleGenerate = async () => {
    if (!targetRole.trim() || !user) return;
    setStep('generating');
    setGenerating(true);
    setError('');
    try {
      await roadmap.generate({ userId: user.id, targetRole: targetRole.trim(), timeline });
      setTimeout(() => navigate('/app', { replace: true }), 1000);
    } catch (err: unknown) {
      setGenerating(false);
      setStep('role');
      setError(err instanceof Error ? err.message : 'Failed to generate roadmap. Please try again.');
    }
  };

  return (
    <div className="onboarding">
      {/* Welcome — single page, directs straight to Assessment V2 */}
      {step === 'welcome' && (
        <div className="onboarding__card" style={{ textAlign: 'center' }}>
          <Panda mood="celebrating" size={120} animate />

          <h1 className="onboarding__title" style={{ marginTop: '1.25rem' }}>
            Welcome to PathWise, {firstName}!
          </h1>
          <p className="onboarding__sub" style={{ maxWidth: 420, margin: '0.75rem auto 2rem' }}>
            Let's explore your Career DNA. Take a quick assessment and we'll map
            out your ideal career path with personalized matches, a roadmap,
            and daily action steps.
          </p>

          <button
            className="onboarding__btn"
            onClick={() => navigate('/app/assessment-v2')}
          >
            Explore My Career DNA <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* Role confirmation — shown when returning from assessment with a pre-filled role */}
      {step === 'role' && (
        <div className="onboarding__card">
          <p className="onboarding__eyebrow">ALMOST THERE</p>
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

      {/* Generating */}
      {step === 'generating' && (
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
