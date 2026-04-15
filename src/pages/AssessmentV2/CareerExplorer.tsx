import { useState, useMemo, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import Panda from '../../components/panda/Panda';

/* ─── Types ─────────────────────────────────────────────────────── */
export interface CareerExplorerProps {
  allMatches: {
    title: string;
    matchScore: number;
    description: string;
    domain?: string;
    pathwayTime?: string;
  }[];
  userRiasec?: any;
}

type SortKey = 'score' | 'alpha' | 'domain';

/* ─── Constants ─────────────────────────────────────────────────── */
const COPPER = '#8b4f2c';
const COPPER_LIGHT = '#a0694a';

const DOMAINS = [
  'Technology',
  'Healthcare',
  'Finance',
  'Design',
  'Marketing',
  'Education',
  'Research',
  'Engineering',
  'Legal',
  'Other',
] as const;

type Domain = (typeof DOMAINS)[number];

const DOMAIN_COLORS: Record<Domain, string> = {
  Technology:  '#006a62',
  Healthcare:  '#0e7490',
  Finance:     '#8b4f2c',
  Design:      '#d97706',
  Marketing:   '#9333ea',
  Education:   '#0369a1',
  Research:    '#0f766e',
  Engineering: '#1d4ed8',
  Legal:       '#7c3aed',
  Other:       '#64748b',
};

/** Derive a domain from careerFamily or the domain field */
function resolveDomain(match: CareerExplorerProps['allMatches'][number]): Domain {
  if (match.domain) {
    const found = DOMAINS.find(d => d.toLowerCase() === match.domain!.toLowerCase());
    if (found) return found;
  }
  return 'Other';
}

/* ─── Score Gauge (mini semicircle) ────────────────────────────── */
function MiniGauge({ score }: { score: number }) {
  const size = 64;
  const cx = size / 2, cy = size / 2, r = size * 0.38, sw = 5;
  const circumHalf = Math.PI * r;
  const filled = (score / 100) * circumHalf;

  const color =
    score >= 85 ? COPPER :
    score >= 70 ? COPPER_LIGHT :
    score >= 55 ? '#b8896a' :
    '#c4a08a';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <svg width={size} height={size * 0.6} viewBox={`0 0 ${size} ${size * 0.6}`}>
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="var(--surface-container-high, #d0e3e6)"
          strokeWidth={sw}
          strokeLinecap="round"
        />
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke={color}
          strokeWidth={sw}
          strokeLinecap="round"
          strokeDasharray={`${circumHalf}`}
          strokeDashoffset={circumHalf - filled}
          style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(.4,0,.2,1)' }}
        />
        <text
          x={cx}
          y={cy - 2}
          textAnchor="middle"
          dominantBaseline="central"
          style={{ fontSize: 13, fontWeight: 700, fill: color }}
        >
          {score}%
        </text>
      </svg>
    </div>
  );
}

/* ─── Domain Pill ───────────────────────────────────────────────── */
function DomainPill({ domain }: { domain: Domain }) {
  const bg = DOMAIN_COLORS[domain];
  return (
    <span style={{
      display: 'inline-block',
      padding: '0.2rem 0.65rem',
      borderRadius: '2rem',
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: 0.4,
      background: bg + '22',
      color: bg,
      border: `1px solid ${bg}44`,
    }}>
      {domain}
    </span>
  );
}

/* ─── Career Card ───────────────────────────────────────────────── */
const cardStyle: CSSProperties = {
  background: 'var(--surface-container-lowest, #ffffff)',
  borderRadius: '1.25rem',
  padding: '1.25rem',
  boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.6rem',
  transition: 'box-shadow 0.2s, transform 0.2s',
};

function CareerCard({ match }: { match: CareerExplorerProps['allMatches'][number] & { _domain: Domain } }) {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();

  return (
    <div
      style={{
        ...cardStyle,
        boxShadow: hovered ? '0 4px 16px rgba(139,79,44,0.14)' : cardStyle.boxShadow as string,
        transform: hovered ? 'translateY(-2px)' : 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Score + title row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <MiniGauge score={match.matchScore} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            margin: 0,
            fontFamily: 'var(--font-display, Manrope, sans-serif)',
            fontWeight: 700,
            fontSize: '1rem',
            color: 'var(--on-surface, #1a1c1f)',
            lineHeight: 1.3,
          }}>
            {match.title}
          </p>
          <div style={{ marginTop: '0.3rem' }}>
            <DomainPill domain={match._domain} />
          </div>
        </div>
      </div>

      {/* Description */}
      <p style={{
        margin: 0,
        fontSize: '0.82rem',
        color: 'var(--on-surface-variant, #49454f)',
        lineHeight: 1.5,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>
        {match.description}
      </p>

      {/* Pathway time */}
      {match.pathwayTime && (
        <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--on-surface-muted, #78747e)' }}>
          Pathway: {match.pathwayTime}
        </p>
      )}

      {/* Explore button */}
      <div style={{ marginTop: 'auto', paddingTop: '0.25rem' }}>
        <button
          style={{
            display: 'inline-block',
            padding: '0.45rem 1.1rem',
            borderRadius: '2rem',
            background: COPPER,
            color: '#fff',
            fontWeight: 600,
            fontSize: 13,
            border: 'none',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = COPPER_LIGHT)}
          onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = COPPER)}
          onClick={() => navigate('/app/career-match', { state: { selectedCareer: match.title } })}
        >
          Explore
        </button>
      </div>
    </div>
  );
}

/* ─── Filter Bar ────────────────────────────────────────────────── */
interface FilterBarProps {
  selectedDomains: Set<Domain>;
  onDomainToggle: (d: Domain) => void;
  minScore: number;
  onMinScoreChange: (v: number) => void;
  sortBy: SortKey;
  onSortChange: (s: SortKey) => void;
  totalVisible: number;
  totalAll: number;
}

function FilterBar({
  selectedDomains, onDomainToggle,
  minScore, onMinScoreChange,
  sortBy, onSortChange,
  totalVisible, totalAll,
}: FilterBarProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{
      position: 'sticky',
      top: 64,
      zIndex: 10,
      background: 'var(--surface-container-low, #e8f6f8)',
      borderRadius: '1.25rem',
      padding: '1rem 1.25rem',
      marginBottom: '1.5rem',
      boxShadow: '0 2px 8px rgba(0,106,98,0.08)',
      border: '1px solid var(--outline-variant, rgba(73,69,79,0.10))',
    }}>
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        {/* Score slider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1 1 200px', minWidth: 0 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: COPPER, whiteSpace: 'nowrap' }}>
            Min match:
          </label>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={minScore}
            onChange={e => onMinScoreChange(Number(e.target.value))}
            style={{ flex: 1, accentColor: COPPER }}
          />
          <span style={{ fontSize: 13, fontWeight: 700, color: COPPER, minWidth: 36 }}>
            {minScore}%
          </span>
        </div>

        {/* Sort */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: COPPER, whiteSpace: 'nowrap' }}>
            Sort:
          </label>
          <select
            value={sortBy}
            onChange={e => onSortChange(e.target.value as SortKey)}
            style={{
              fontSize: 13, fontWeight: 600,
              border: '1px solid var(--outline-variant, rgba(73,69,79,0.15))',
              borderRadius: '0.6rem',
              padding: '0.3rem 0.6rem',
              background: 'var(--surface-container-lowest)',
              color: 'var(--on-surface)',
              cursor: 'pointer',
            }}
          >
            <option value="score">Match Score</option>
            <option value="alpha">Alphabetical</option>
            <option value="domain">Domain</option>
          </select>
        </div>

        {/* Showing count */}
        <span style={{ fontSize: 13, color: 'var(--on-surface-muted, #78747e)', marginLeft: 'auto', whiteSpace: 'nowrap' }}>
          Showing {totalVisible} of {totalAll}
        </span>

        {/* Toggle domain filters */}
        <button
          onClick={() => setExpanded(v => !v)}
          style={{
            fontSize: 13, fontWeight: 600,
            border: `1px solid ${COPPER}44`,
            borderRadius: '0.6rem',
            padding: '0.3rem 0.75rem',
            background: expanded ? COPPER : 'transparent',
            color: expanded ? '#fff' : COPPER,
            cursor: 'pointer',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap',
          }}
        >
          Domains {expanded ? '▲' : '▼'}
        </button>
      </div>

      {/* Domain checkboxes */}
      {expanded && (
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: '0.5rem',
          marginTop: '0.75rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid var(--outline-variant, rgba(73,69,79,0.10))',
        }}>
          {DOMAINS.map(d => {
            // const active = selectedDomains.size === 0 || selectedDomains.has(d);
            const checked = selectedDomains.has(d);
            const color = DOMAIN_COLORS[d];
            return (
              <label
                key={d}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.35rem',
                  padding: '0.3rem 0.7rem',
                  borderRadius: '2rem',
                  fontSize: 12, fontWeight: 600,
                  cursor: 'pointer',
                  background: checked ? color + '22' : 'var(--surface-container-lowest)',
                  color: checked ? color : 'var(--on-surface-muted)',
                  border: `1px solid ${checked ? color + '55' : 'var(--outline-variant, rgba(73,69,79,0.10))'}`,
                  transition: 'all 0.15s',
                  opacity: selectedDomains.size > 0 && !checked ? 0.6 : 1,
                }}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onDomainToggle(d)}
                  style={{ accentColor: color, width: 13, height: 13 }}
                />
                {d}
              </label>
            );
          })}
          {selectedDomains.size > 0 && (
            <button
              onClick={() => DOMAINS.forEach(d => selectedDomains.has(d) && onDomainToggle(d))}
              style={{
                fontSize: 12, fontWeight: 600,
                border: 'none', background: 'transparent',
                color: '#8b4f2c', cursor: 'pointer', padding: '0.3rem 0.5rem',
                textDecoration: 'underline',
              }}
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Empty State ───────────────────────────────────────────────── */
function EmptyState() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: '1rem', padding: '3rem 1rem', textAlign: 'center',
    }}>
      <Panda mood="thinking" size={80} animate />
      <p style={{
        fontSize: '1rem', color: 'var(--on-surface-variant, #49454f)',
        margin: 0, maxWidth: 320,
      }}>
        No careers match your current filters. Try adjusting them.
      </p>
    </div>
  );
}

/* ─── Career Explorer ───────────────────────────────────────────── */
export default function CareerExplorer({ allMatches }: CareerExplorerProps) {
  const [selectedDomains, setSelectedDomains] = useState<Set<Domain>>(new Set());
  const [minScore, setMinScore] = useState(40);
  const [sortBy, setSortBy] = useState<SortKey>('score');

  // Enrich matches with resolved domain
  const enriched = useMemo(() =>
    allMatches.map(m => ({ ...m, _domain: resolveDomain(m) })),
    [allMatches]
  );

  const filtered = useMemo(() => {
    let result = enriched.filter(m => m.matchScore >= minScore);

    if (selectedDomains.size > 0) {
      result = result.filter(m => selectedDomains.has(m._domain));
    }

    if (sortBy === 'score') {
      result = [...result].sort((a, b) => b.matchScore - a.matchScore);
    } else if (sortBy === 'alpha') {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'domain') {
      result = [...result].sort((a, b) =>
        a._domain.localeCompare(b._domain) || b.matchScore - a.matchScore
      );
    }

    return result;
  }, [enriched, selectedDomains, minScore, sortBy]);

  function handleDomainToggle(d: Domain) {
    setSelectedDomains(prev => {
      const next = new Set(prev);
      if (next.has(d)) next.delete(d);
      else next.add(d);
      return next;
    });
  }

  void function handleClearDomains() { setSelectedDomains(new Set()); };

  return (
    <div style={{ fontFamily: 'var(--font-body, Inter, system-ui, sans-serif)' }}>
      <FilterBar
        selectedDomains={selectedDomains}
        onDomainToggle={handleDomainToggle}
        minScore={minScore}
        onMinScoreChange={setMinScore}
        sortBy={sortBy}
        onSortChange={setSortBy}
        totalVisible={filtered.length}
        totalAll={enriched.length}
      />

      {filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '1rem',
        }}>
          {filtered.map(match => (
            <CareerCard key={match.title} match={match} />
          ))}
        </div>
      )}
    </div>
  );
}
