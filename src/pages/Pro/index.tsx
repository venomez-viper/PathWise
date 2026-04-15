import { Link } from 'react-router-dom';
import { Sparkles, Brain, MessageCircle, Zap, Bell, ArrowLeft } from 'lucide-react';
import { Panda } from '../../components/panda';

const UPCOMING_FEATURES = [
  {
    icon: Brain,
    title: 'AI Career Coach',
    desc: 'Chat with a personal AI coach that knows your profile, goals, and progress.',
  },
  {
    icon: MessageCircle,
    title: 'Interview Prep',
    desc: 'Role-specific mock interviews with real-time feedback and scoring.',
  },
  {
    icon: Zap,
    title: 'Advanced Skill Insights',
    desc: 'Deep-dive analytics on your skill gaps with curated learning paths.',
  },
  {
    icon: Sparkles,
    title: 'Priority Roadmap Updates',
    desc: 'Your roadmap adapts weekly based on progress and industry trends.',
  },
];

export default function ProPage() {
  return (
    <div className="page" style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '2rem', maxWidth: 560, margin: '0 auto',
    }}>
      <Panda mood="cool" size={100} animate />

      <div style={{
        background: 'var(--copper)',
        color: '#fff', padding: '0.35rem 1rem', borderRadius: 'var(--radius-full)',
        fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em',
        textTransform: 'uppercase', marginTop: '1rem',
      }}>
        Coming Soon
      </div>

      <h1 style={{
        fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800,
        color: 'var(--on-surface)', letterSpacing: '-0.03em',
        marginTop: '1rem', textAlign: 'center', lineHeight: 1.2,
      }}>
        PathWise Pro is on the way
      </h1>

      <p style={{
        fontSize: '0.95rem', color: 'var(--on-surface-variant)', lineHeight: 1.65,
        textAlign: 'center', marginTop: '0.75rem', marginBottom: '2rem',
      }}>
        We're building powerful new features to supercharge your career journey.
        Everything you love about PathWise, plus so much more.
      </p>

      <div style={{
        display: 'flex', flexDirection: 'column', gap: '0.75rem',
        width: '100%', marginBottom: '2rem',
      }}>
        {UPCOMING_FEATURES.map(({ icon: Icon, title, desc }) => (
          <div key={title} style={{
            background: 'var(--surface-container-lowest)',
            borderRadius: 'var(--radius-xl)', padding: '1.15rem 1.25rem',
            display: 'flex', gap: '1rem', alignItems: 'flex-start',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 'var(--radius-lg)',
              background: 'rgba(98,69,164,0.08)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Icon size={18} color="var(--primary)" />
            </div>
            <div>
              <p style={{
                margin: 0, fontWeight: 700, fontSize: '0.9rem',
                color: 'var(--on-surface)',
              }}>{title}</p>
              <p style={{
                margin: '0.2rem 0 0', fontSize: '0.82rem',
                color: 'var(--on-surface-variant)', lineHeight: 1.5,
              }}>{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        background: 'var(--surface-container-lowest)',
        borderRadius: 'var(--radius-xl)', padding: '1.5rem',
        textAlign: 'center', width: '100%', marginBottom: '2rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}>
        <Bell size={20} color="var(--primary)" style={{ marginBottom: '0.5rem' }} />
        <p style={{
          margin: 0, fontWeight: 700, fontSize: '0.9rem', color: 'var(--on-surface)',
        }}>
          You'll be first to know
        </p>
        <p style={{
          margin: '0.3rem 0 0', fontSize: '0.82rem',
          color: 'var(--on-surface-variant)', lineHeight: 1.5,
        }}>
          As an existing member, you'll get early access and a founding member discount when Pro launches.
        </p>
      </div>

      <Link to="/app" style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        fontSize: '0.85rem', color: 'var(--on-surface-variant)',
        textDecoration: 'none', fontWeight: 600,
      }}>
        <ArrowLeft size={14} /> Back to Dashboard
      </Link>
    </div>
  );
}
