import { useState } from 'react';
import { Search, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { PandaSpot } from '../../components/panda';

const FAQ_SECTIONS = [
  {
    category: 'Getting Started',
    items: [
      { q: 'How do I create my first Career Roadmap?', a: 'Head to the Dashboard and click "Start Assessment." After completing the 5-step questionnaire, our AI will generate personalized career matches. Pick your target role and we\'ll build your roadmap automatically with milestones and tasks.' },
      { q: 'Synchronizing your LinkedIn profile', a: 'Go to Settings > Connect Profiles. PathWise can import your skills and experience from LinkedIn to personalize your roadmap. Your data stays private and is only used for AI matching.' },
    ],
  },
  {
    category: 'Roadmap & Tasks',
    items: [
      { q: 'Can I customize my skill milestones?', a: 'Yes! Every PathWise roadmap is fully editable. Simply click the "Edit" icon on any milestone to adjust the target date, add specific sub-tasks, or link personal portfolio projects.' },
      { q: 'How does AI task generation work?', a: 'Click "Generate AI Tasks" on any milestone card. Our AI analyzes your target role, current skills, and milestone goals to create 4 actionable tasks. You can also use the free-text prompt to generate custom tasks.' },
      { q: 'Tracking daily task streaks', a: 'Your streak counter updates automatically when you complete at least one task per day. Visit the Streaks page to see your weekly progress, consistency score, and power hour insights.' },
    ],
  },
  {
    category: 'Billing',
    items: [
      { q: 'Changing your subscription plan', a: 'Go to Settings and click "Upgrade Plan" to view available tiers. You can upgrade to Pro anytime for advanced roadmaps, AI coaching, and priority support.' },
      { q: 'Refund policy for PathWise Premium', a: 'We offer a 14-day money-back guarantee on all premium subscriptions. Contact support within 14 days of purchase for a full refund, no questions asked.' },
    ],
  },
];

export default function HelpFAQ() {
  const [search, setSearch] = useState('');
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggle = (key: string) => {
    setOpenItems(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const filtered = FAQ_SECTIONS.map(s => ({
    ...s,
    items: s.items.filter(i =>
      !search || i.q.toLowerCase().includes(search.toLowerCase()) || i.a.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(s => s.items.length > 0);

  return (
    <div className="page" style={{ maxWidth: 640 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <h1 className="page-title">Help & FAQ</h1>
        <PandaSpot context="welcome" position="inline" size={36} opacity={0.7} />
      </div>
      <p className="page-subtitle">Search for articles or browse categories below.</p>

      {/* Search */}
      <div style={{ position: 'relative', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
        <Search size={18} color="var(--on-surface-muted)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
        <input
          className="settings-input"
          style={{ paddingLeft: 44 }}
          placeholder="Search for 'Career Roadmaps'..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* FAQ sections */}
      {filtered.map(section => (
        <div key={section.category} style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--primary)', marginBottom: '0.75rem' }}>
            {section.category}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {section.items.map(item => {
              const key = `${section.category}-${item.q}`;
              const isOpen = openItems.has(key);
              return (
                <div key={key} className="panel" style={{
                  borderRadius: '2rem', padding: isOpen ? '1.25rem' : '1rem 1.25rem',
                  cursor: 'pointer',
                  borderLeft: isOpen ? '4px solid var(--primary)' : '4px solid transparent',
                }} onClick={() => toggle(key)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--on-surface)', flex: 1, paddingRight: 8 }}>{item.q}</p>
                    {isOpen ? <ChevronUp size={18} color="var(--on-surface-variant)" /> : <ChevronDown size={18} color="var(--on-surface-variant)" />}
                  </div>
                  {isOpen && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <p style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)', lineHeight: 1.6 }}>{item.a}</p>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 8, fontSize: '0.78rem', fontWeight: 600, color: '#8b4f2c' }}>
                        Read more →
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Support CTA */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary), var(--primary-container))',
        borderRadius: '2rem', padding: '2rem', marginTop: '1rem', color: '#fff', textAlign: 'center',
      }}>
        <HelpCircle size={32} style={{ margin: '0 auto 8px', opacity: 0.6 }} />
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 800 }}>Still have questions?</h3>
        <p style={{ fontSize: '0.85rem', opacity: 0.7, lineHeight: 1.5, marginTop: 4 }}>
          Our dedicated PathFinder support team is ready to help you navigate your journey.
        </p>
        <button style={{
          marginTop: '1rem', padding: '0.6rem 1.5rem', borderRadius: 'var(--radius-full)',
          background: '#fff', color: 'var(--primary)', border: 'none', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
        }}>
          Contact Support
        </button>
      </div>
    </div>
  );
}
