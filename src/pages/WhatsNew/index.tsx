import { CHANGELOG, type ChangelogEntry } from './changelogData';
import { Sparkles, Zap, Wrench, Shield, Check } from 'lucide-react';
import Footer from '../../components/Footer';

const TAG_CONFIG: Record<ChangelogEntry['tag'], { color: string; bg: string; label: string; icon: typeof Sparkles }> = {
  feature:     { color: '#6245a4', bg: '#6245a410', label: 'New Feature',  icon: Sparkles },
  improvement: { color: '#0e7490', bg: '#0e749010', label: 'Improvement',  icon: Zap },
  fix:         { color: '#d97706', bg: '#d9770610', label: 'Bug Fix',      icon: Wrench },
  security:    { color: '#dc2626', bg: '#dc262610', label: 'Security',     icon: Shield },
};

export default function WhatsNewPage() {
  return (
    <div style={{ background: 'var(--surface)', minHeight: '100vh' }}>
      {/* Header */}
      <section style={{
        padding: '7rem 1.5rem 3rem',
        textAlign: 'center',
        background: 'linear-gradient(180deg, var(--surface-container-lowest) 0%, var(--surface) 100%)',
      }}>
        <p className="section-label" style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color: 'var(--primary)',
          marginBottom: '0.75rem',
        }}>Changelog</p>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1.6rem, 4vw, 2.25rem)',
          fontWeight: 900,
          color: 'var(--on-surface)',
          margin: '0 0 0.75rem',
          lineHeight: 1.1,
        }}>What's New</h1>
        <p style={{
          color: 'var(--on-surface-variant)',
          fontSize: '0.95rem',
          maxWidth: 520,
          margin: '0 auto',
          lineHeight: 1.6,
        }}>
          Every feature, improvement, and fix shipped to PathWise — all in one place.
        </p>
      </section>

      {/* Timeline */}
      <section style={{
        maxWidth: 720,
        margin: '0 auto',
        padding: '0 1.5rem 4rem',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {CHANGELOG.map((entry) => {
            const tag = TAG_CONFIG[entry.tag];
            const TagIcon = tag.icon;
            return (
              <article
                key={entry.version}
                style={{
                  background: 'var(--surface-container-lowest)',
                  borderRadius: 16,
                  borderLeft: `4px solid ${tag.color}`,
                  padding: '2rem 2rem 1.75rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
              >
                {/* Top row: version + date + tag */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  flexWrap: 'wrap',
                  marginBottom: '0.75rem',
                }}>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono, monospace)',
                    color: tag.color,
                    background: tag.bg,
                    padding: '2px 10px',
                    borderRadius: 999,
                  }}>v{entry.version}</span>
                  <span style={{
                    fontSize: '0.8rem',
                    color: 'var(--on-surface-variant)',
                  }}>{entry.date}</span>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    color: tag.color,
                    background: tag.bg,
                    padding: '2px 10px',
                    borderRadius: 999,
                    marginLeft: 'auto',
                  }}>
                    <TagIcon size={12} />
                    {tag.label}
                  </span>
                </div>

                {/* Title */}
                <h2 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  color: 'var(--on-surface)',
                  margin: '0 0 0.4rem',
                  lineHeight: 1.25,
                }}>{entry.title}</h2>

                {/* Description */}
                <p style={{
                  color: 'var(--on-surface-variant)',
                  fontSize: '0.88rem',
                  lineHeight: 1.6,
                  margin: '0 0 0.75rem',
                }}>{entry.description}</p>

                {/* Highlights */}
                <ul style={{
                  listStyle: 'none',
                  margin: 0,
                  padding: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                }}>
                  {entry.highlights.map((h, i) => (
                    <li key={i} style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.5rem',
                      fontSize: '0.82rem',
                      color: 'var(--on-surface)',
                      lineHeight: 1.5,
                    }}>
                      <Check size={15} style={{
                        color: tag.color,
                        flexShrink: 0,
                        marginTop: 2,
                      }} />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </section>

      <Footer />
    </div>
  );
}
