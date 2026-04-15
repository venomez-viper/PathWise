import { useState, useRef } from 'react';
import { Search, ChevronDown, Compass, Map, CreditCard, MessageSquare, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Panda } from '../../components/panda';

const CATEGORIES = [
  { icon: Compass, title: 'Getting Started', desc: 'Set up your account and take your first assessment', count: 2 },
  { icon: Map, title: 'Roadmap & Tasks', desc: 'Manage milestones, tasks, and track progress', count: 3 },
  { icon: CreditCard, title: 'Billing & Plans', desc: 'Subscription management and refund policy', count: 2 },
];

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
    category: 'Billing & Plans',
    items: [
      { q: 'Changing your subscription plan', a: 'Go to Settings and click "Upgrade Plan" to view available tiers. You can upgrade to Pro anytime for advanced roadmaps, AI coaching, and priority support.' },
      { q: 'Refund policy for PathWise Premium', a: 'We offer a 14-day money-back guarantee on all premium subscriptions. Contact support within 14 days of purchase for a full refund, no questions asked.' },
    ],
  },
];

export default function HelpFAQ() {
  const [search, setSearch] = useState('');
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const toggle = (key: string) => {
    setOpenItems(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const scrollToSection = (category: string) => {
    const el = sectionRefs.current[category];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const filtered = FAQ_SECTIONS.map(s => ({
    ...s,
    items: s.items.filter(i =>
      !search || i.q.toLowerCase().includes(search.toLowerCase()) || i.a.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(s => s.items.length > 0);

  return (
    <div className="page" style={{ maxWidth: 960, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', paddingTop: '1rem', paddingBottom: '0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Panda mood="curious" size={100} animate />
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '2rem',
          fontWeight: 800,
          color: 'var(--on-surface)',
          margin: '0.75rem 0 0',
        }}>
          Help Center
        </h1>
        <p style={{
          fontSize: '1.05rem',
          color: 'var(--on-surface-variant)',
          marginTop: '0.5rem',
          lineHeight: 1.5,
        }}>
          How can we help you today?
        </p>
      </div>

      {/* Search Bar */}
      <div style={{
        position: 'relative',
        marginTop: '1.5rem',
        marginBottom: '2rem',
        maxWidth: '100%',
        marginLeft: 'auto',
        marginRight: 'auto',
      }}>
        <Search
          size={20}
          color="var(--on-surface-muted)"
          style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)' }}
        />
        <input
          className="settings-input"
          style={{
            paddingLeft: 50,
            paddingRight: 20,
            height: 52,
            fontSize: '0.95rem',
            borderRadius: 'var(--radius-full)',
            width: '100%',
            boxSizing: 'border-box',
          }}
          placeholder="Search for help articles..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Category Cards */}
      {!search && (
        <div className="help-categories-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1rem',
          marginBottom: '2.5rem',
        }}>
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.title}
                onClick={() => scrollToSection(cat.title === 'Billing & Plans' ? 'Billing & Plans' : cat.title)}
                className="panel help-category-card"
                style={{
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  transition: 'box-shadow 0.2s ease, transform 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: 'var(--primary-container)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon size={22} color="var(--primary)" />
                </div>
                <div>
                  <p style={{
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    color: 'var(--on-surface)',
                    margin: 0,
                  }}>
                    {cat.title}
                  </p>
                  <p style={{
                    fontSize: '0.82rem',
                    color: 'var(--on-surface-variant)',
                    margin: '0.25rem 0 0',
                    lineHeight: 1.45,
                  }}>
                    {cat.desc}
                  </p>
                </div>
                <p style={{
                  fontSize: '0.75rem',
                  color: 'var(--on-surface-muted)',
                  margin: 0,
                  fontWeight: 600,
                }}>
                  {cat.count} article{cat.count !== 1 ? 's' : ''}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* FAQ Sections */}
      {filtered.map(section => (
        <div
          key={section.category}
          ref={el => { sectionRefs.current[section.category] = el; }}
          style={{ marginBottom: '2rem' }}
        >
          <h2 style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--primary)',
            marginBottom: '0.75rem',
            paddingLeft: 2,
          }}>
            {section.category}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {section.items.map(item => {
              const key = `${section.category}-${item.q}`;
              const isOpen = openItems.has(key);
              return (
                <div
                  key={key}
                  className="panel help-faq-item"
                  style={{
                    borderRadius: '0.75rem',
                    border: '1px solid var(--outline-variant)',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    transition: 'box-shadow 0.15s ease',
                  }}
                  onClick={() => toggle(key)}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem 1.25rem',
                  }}>
                    <p style={{
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      color: 'var(--on-surface)',
                      flex: 1,
                      paddingRight: 12,
                      margin: 0,
                    }}>
                      {item.q}
                    </p>
                    <ChevronDown
                      size={18}
                      color="var(--on-surface-variant)"
                      style={{
                        transition: 'transform 0.25s ease',
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        flexShrink: 0,
                      }}
                    />
                  </div>
                  <div style={{
                    maxHeight: isOpen ? 300 : 0,
                    opacity: isOpen ? 1 : 0,
                    transition: 'max-height 0.3s ease, opacity 0.25s ease, padding 0.3s ease',
                    padding: isOpen ? '0 1.25rem 1.25rem' : '0 1.25rem 0',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      borderTop: '1px solid var(--outline-variant)',
                      paddingTop: '1rem',
                    }}>
                      <p style={{
                        fontSize: '0.88rem',
                        color: 'var(--on-surface-variant)',
                        lineHeight: 1.7,
                        margin: 0,
                      }}>
                        {item.a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Contact Support Section */}
      <div
        className="panel"
        style={{
          borderRadius: '1rem',
          padding: '2rem',
          marginTop: '1rem',
          marginBottom: '2rem',
          textAlign: 'center',
          border: '1px solid var(--outline-variant)',
        }}
      >
        <h3 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.2rem',
          fontWeight: 800,
          color: 'var(--on-surface)',
          margin: 0,
        }}>
          Still need help?
        </h3>
        <p style={{
          fontSize: '0.88rem',
          color: 'var(--on-surface-variant)',
          marginTop: '0.5rem',
          lineHeight: 1.5,
        }}>
          Our support team is here to help you with anything you need.
        </p>

        <Panda mood="waving" size={80} animate style={{ margin: '0.5rem auto' }} />

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          marginTop: '1.25rem',
          flexWrap: 'wrap',
        }}>
          <Link
            to="/app/support"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '0.65rem 1.5rem',
              borderRadius: 'var(--radius-full)',
              background: 'var(--copper)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.85rem',
              textDecoration: 'none',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <MessageSquare size={16} />
            Contact Support
          </Link>
        </div>

        {/* Email contact info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          marginTop: '1.25rem',
          padding: '0.75rem 1.25rem',
          background: 'var(--surface-container-low)',
          borderRadius: 'var(--radius-full)',
          width: 'fit-content',
          margin: '1.25rem auto 0',
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'var(--primary-fixed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Mail size={14} color="var(--primary)" />
          </div>
          <a
            href="mailto:support@pathwise.fit"
            style={{
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--primary)',
              textDecoration: 'none',
            }}
          >
            support@pathwise.fit
          </a>
        </div>
      </div>

      {/* Responsive styles */}
      <style>{`
        .help-category-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.08);
        }
        .help-faq-item:hover {
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        @media (max-width: 640px) {
          .help-categories-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
