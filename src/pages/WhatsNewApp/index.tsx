import { useState } from 'react';
import { CHANGELOG, type ChangelogEntry } from '../WhatsNew/changelogData';
import { Sparkles, Zap, Wrench, Shield, Check, ChevronDown, Rocket } from 'lucide-react';
import { Panda } from '../../components/panda';

/* ── Tag display helpers ── */
const TAG_META: Record<ChangelogEntry['tag'], { label: string; color: string; bg: string; Icon: typeof Sparkles }> = {
  feature:     { label: 'Feature',     color: '#6245a4', bg: 'rgba(98,69,164,0.10)',  Icon: Sparkles },
  improvement: { label: 'Improvement', color: '#0e7490', bg: 'rgba(14,116,144,0.10)', Icon: Zap },
  fix:         { label: 'Fix',         color: '#d97706', bg: 'rgba(217,119,6,0.10)',   Icon: Wrench },
  security:    { label: 'Security',    color: '#dc2626', bg: 'rgba(220,38,38,0.10)',   Icon: Shield },
};

const FILTERS = [
  { key: 'all',         label: 'All Updates',  color: 'var(--on-surface)' },
  { key: 'feature',     label: 'Features',     color: '#6245a4' },
  { key: 'improvement', label: 'Improvements', color: '#0e7490' },
  { key: 'fix',         label: 'Fixes',        color: '#d97706' },
  { key: 'security',    label: 'Security',     color: '#dc2626' },
];

export default function WhatsNewAppPage() {
  const [filter, setFilter] = useState<string>('all');
  const [expanded, setExpanded] = useState<Set<string>>(new Set([CHANGELOG[0]?.version]));

  const filtered = filter === 'all' ? CHANGELOG : CHANGELOG.filter(e => e.tag === filter);

  const toggle = (v: string) => setExpanded(prev => {
    const next = new Set(prev);
    if (next.has(v)) next.delete(v); else next.add(v);
    return next;
  });

  return (
    <div className="page-container">
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '0.5rem' }}>
        <h1 className="page-title">What's New</h1>
        <Panda mood="celebrating" size={80} animate />
      </div>
      <p className="page-subtitle">Every feature, improvement, and fix shipped to PathWise.</p>

      {/* ── Filter pills ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              border: filter === f.key ? 'none' : '1px solid var(--surface-container-high)',
              background: filter === f.key ? f.color : 'var(--surface-container-lowest)',
              color: filter === f.key ? '#fff' : 'var(--on-surface-variant)',
              fontWeight: 600,
              fontSize: '0.78rem',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ── Changelog entries ── */}
      {filtered.map(entry => {
        const meta = TAG_META[entry.tag];
        const isExpanded = expanded.has(entry.version);

        return (
          <div
            key={entry.version}
            className="panel"
            style={{ borderRadius: '1.25rem', padding: 0, overflow: 'hidden', marginBottom: '0.75rem' }}
          >
            {/* Color accent top bar */}
            <div style={{ height: 3, background: meta.color }} />

            {/* Clickable header */}
            <div
              onClick={() => toggle(entry.version)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1.25rem 1.5rem',
                cursor: 'pointer',
              }}
            >
              {/* Tag icon in colored circle */}
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: meta.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <meta.Icon size={18} color={meta.color} />
              </div>

              {/* Title + meta */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', fontWeight: 700, color: meta.color }}>
                    v{entry.version}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--on-surface-variant)' }}>
                    {entry.date}
                  </span>
                </div>
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: 'var(--on-surface)',
                  margin: 0,
                }}>
                  {entry.title}
                </h3>
              </div>

              {/* Tag pill */}
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: meta.color,
                background: meta.bg,
                padding: '3px 10px',
                borderRadius: 999,
              }}>
                {meta.label}
              </span>

              {/* Chevron */}
              <ChevronDown
                size={16}
                color="var(--on-surface-variant)"
                style={{
                  transition: 'transform 0.2s',
                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
                }}
              />
            </div>

            {/* Expandable content */}
            {isExpanded && (
              <div style={{
                padding: '0 1.5rem 1.5rem',
                borderTop: '1px solid color-mix(in srgb, var(--on-surface) 6%, transparent)',
              }}>
                <p style={{
                  color: 'var(--on-surface-variant)',
                  fontSize: '0.88rem',
                  lineHeight: 1.6,
                  margin: '1rem 0',
                }}>
                  {entry.description}
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {entry.highlights.map((h, i) => (
                    <li key={i} style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 8,
                      fontSize: '0.85rem',
                      color: 'var(--on-surface)',
                      lineHeight: 1.5,
                    }}>
                      <Check size={14} color={meta.color} style={{ flexShrink: 0, marginTop: 3 }} />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="panel" style={{ textAlign: 'center', padding: '3rem 1.5rem', borderRadius: '1.25rem' }}>
          <Panda mood="thinking" size={64} />
          <p style={{ color: 'var(--on-surface-variant)', marginTop: '1rem', fontSize: '0.9rem' }}>
            No updates matching this filter yet.
          </p>
        </div>
      )}
    </div>
  );
}
