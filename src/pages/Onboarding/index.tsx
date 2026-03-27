import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../lib/auth-context';
import { roadmap } from '../../lib/api';
import './Onboarding.css';

const POPULAR_ROLES = [
  'Software Engineer', 'Data Analyst', 'Product Manager', 'UX Designer',
  'Marketing Analyst', 'Business Analyst', 'Data Scientist', 'DevOps Engineer',
];

const TIMELINES = [
  { label: '3 months', value: '3mo', desc: 'Fast track' },
  { label: '6 months', value: '6mo', desc: 'Recommended' },
  { label: '12 months', value: '12mo', desc: 'Steady pace' },
];

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [targetRole, setTargetRole] = useState('');
  const [timeline, setTimeline] = useState('6mo');
  const [_generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const firstName = user?.name?.split(' ')[0] ?? 'there';

  const handleGenerate = async () => {
    if (!targetRole.trim() || !user) return;
    setStep(2);
    setGenerating(true);
    setError('');
    try {
      await roadmap.generate({ userId: user.id, targetRole: targetRole.trim() });
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
          <div className="onboarding__icon"><Sparkles size={28} color="#a78bfa" /></div>
          <h1 className="onboarding__title">Hey {firstName}, let's build<br />your career roadmap.</h1>
          <p className="onboarding__sub">
            PathWise will generate a personalised roadmap with milestones, tasks, and skill guidance — all tailored to your target role.
          </p>
          <div className="onboarding__features">
            {['AI-generated career milestones', 'Skill gap analysis', 'Daily task planner'].map(f => (
              <div key={f} className="onboarding__feature"><CheckCircle2 size={16} color="#34d399" /><span>{f}</span></div>
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
          <h1 className="onboarding__title">What role are you<br />working towards?</h1>
          <p className="onboarding__sub">Choose from the list or type your own.</p>

          <div className="onboarding__chips">
            {POPULAR_ROLES.map(role => (
              <button
                key={role}
                className={`onboarding__chip${targetRole === role ? ' selected' : ''}`}
                onClick={() => setTargetRole(role)}
              >{role}</button>
            ))}
          </div>

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
            <Loader2 size={40} color="#a78bfa" style={{ animation: 'spin 0.8s linear infinite' }} />
          </div>
          <h1 className="onboarding__title">Building your roadmap…</h1>
          <p className="onboarding__sub">Creating personalised milestones and tasks for <strong>{targetRole}</strong>.</p>
        </div>
      )}
    </div>
  );
}
