import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Search as SearchIcon, X, ChevronRight, TrendingUp, Code, Target, Clock, Lightbulb, ListChecks } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../lib/auth-context';
import { assessment as assessmentApi, roadmap as roadmapApi, tasks as tasksApi } from '../../lib/api';

// ── Types ──

interface SearchableTask {
  id: string;
  title: string;
  description?: string;
  category?: string;
  status?: string;
  priority?: string;
}

interface SearchableMilestone {
  id: string;
  title: string;
  description: string;
  status: string;
}

interface SearchableCareer {
  title: string;
  description?: string;
  matchScore?: number;
}

interface SearchableSkill {
  name: string;
}

interface RankedResult<T> {
  item: T;
  score: number;
}

// ── Fuzzy matching ──

function fuzzyMatch(query: string, text: string): { matches: boolean; score: number } {
  if (!text || !query) return { matches: false, score: 0 };
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const lowerText = text.toLowerCase();
  let matchCount = 0;
  for (const word of words) {
    if (lowerText.includes(word)) matchCount++;
  }
  return { matches: matchCount > 0, score: matchCount / words.length };
}

function fuzzyMatchMultiField(query: string, fields: (string | undefined)[]): { matches: boolean; score: number } {
  const combined = fields.filter(Boolean).join(' ');
  return fuzzyMatch(query, combined);
}

function rankResults<T>(items: T[], query: string, getFields: (item: T) => (string | undefined)[]): RankedResult<T>[] {
  const results: RankedResult<T>[] = [];
  for (const item of items) {
    const { matches, score } = fuzzyMatchMultiField(query, getFields(item));
    if (matches) results.push({ item, score });
  }
  results.sort((a, b) => b.score - a.score);
  return results;
}

// ── Highlight matching text ──

function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query.trim() || !text) return <>{text}</>;
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  // Build regex from all query words
  const escaped = words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const pattern = new RegExp(`(${escaped.join('|')})`, 'gi');
  const parts = text.split(pattern);
  return (
    <>
      {parts.map((part, i) =>
        pattern.test(part) ? (
          <mark key={i} style={{
            background: 'rgba(139,79,44,0.12)',
            color: 'var(--copper)',
            fontWeight: 700,
            borderRadius: 2,
            padding: '0 1px',
          }}>{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

// ── Recent searches ──

const RECENT_SEARCHES_KEY = 'pathwise_recent_searches';
const MAX_RECENT = 5;

function getRecentSearches(): string[] {
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveRecentSearch(query: string) {
  const trimmed = query.trim();
  if (!trimmed) return;
  const recent = getRecentSearches().filter(s => s !== trimmed);
  recent.unshift(trimmed);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
}

// ── Main component ──

export default function SearchPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>(getRecentSearches());
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // All searchable data
  const [allData, setAllData] = useState<{
    tasks: SearchableTask[];
    milestones: SearchableMilestone[];
    careers: SearchableCareer[];
    skills: SearchableSkill[];
  }>({ tasks: [], milestones: [], careers: [], skills: [] });

  // Load data once
  useEffect(() => {
    if (!user) return;
    Promise.allSettled([
      assessmentApi.getResult(user.id),
      tasksApi.list(user.id),
      roadmapApi.get(user.id),
    ]).then(([assessRes, tasksRes, roadmapRes]) => {
      const matches = assessRes.status === 'fulfilled'
        ? ((assessRes.value as any)?.result?.careerMatches ?? [])
        : [];
      const taskList = tasksRes.status === 'fulfilled'
        ? ((tasksRes.value as any)?.tasks ?? [])
        : [];
      const roadmapData = roadmapRes.status === 'fulfilled'
        ? (roadmapRes.value as any)?.roadmap
        : null;
      const skillGaps = roadmapData?.skillGapGaps
        ? JSON.parse(roadmapData.skillGapGaps)
        : [];
      const milestones = roadmapData?.milestones ?? [];

      setAllData({
        tasks: taskList,
        milestones: milestones,
        careers: matches,
        skills: (Array.isArray(skillGaps) ? skillGaps : []).map((s: string) => ({ name: s })),
      });
    });
  }, [user]);

  // Debounce input
  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(value);
      if (value.trim()) {
        saveRecentSearch(value);
        setRecentSearches(getRecentSearches());
      }
    }, 300);
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, []);

  // Compute results with fuzzy ranking
  const results = useMemo(() => {
    const q = debouncedQuery.trim();
    if (!q) return { tasks: [], milestones: [], careers: [], skills: [] };

    return {
      tasks: rankResults(allData.tasks, q, t => [t.title, t.description, t.category]),
      milestones: rankResults(allData.milestones, q, m => [m.title, m.description]),
      careers: rankResults(allData.careers, q, c => [c.title, c.description]),
      skills: rankResults(allData.skills, q, s => [s.name]),
    };
  }, [debouncedQuery, allData]);

  const totalResults = results.tasks.length + results.milestones.length + results.careers.length + results.skills.length;
  const hasQuery = debouncedQuery.trim().length > 0;

  const handleRecentClick = (search: string) => {
    setQuery(search);
    setDebouncedQuery(search);
    saveRecentSearch(search);
    setRecentSearches(getRecentSearches());
  };

  const clearRecent = () => {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
    setRecentSearches([]);
  };

  // ── Section header ──

  const SectionHeader = ({ title, count, color, badge }: { title: string; count: number; color: string; badge: string }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.75rem' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 800, color: 'var(--on-surface)' }}>
        {title}
      </h2>
      <span style={{
        fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px',
        borderRadius: 'var(--radius-full)',
        background: color, color: 'var(--on-surface-variant)',
        textTransform: 'uppercase',
      }}>
        {count}
      </span>
      <span style={{
        fontSize: '0.6rem', fontWeight: 600, padding: '2px 6px',
        borderRadius: 'var(--radius-full)',
        background: color, color: 'var(--on-surface-variant)',
        textTransform: 'uppercase', letterSpacing: '0.3px',
      }}>
        {badge}
      </span>
    </div>
  );

  // ── Category pill ──

  const CategoryPill = ({ label }: { label?: string }) => {
    if (!label) return null;
    return (
      <span style={{
        fontSize: '0.65rem', fontWeight: 600, padding: '2px 8px',
        borderRadius: 'var(--radius-full)',
        background: 'rgba(139,79,44,0.08)', color: 'var(--copper)',
        textTransform: 'capitalize',
      }}>
        {label}
      </span>
    );
  };

  return (
    <div className="page" style={{ maxWidth: '100%' }}>
      <h1 className="page-title">Search</h1>

      {/* Search input */}
      <div style={{ position: 'relative', marginTop: '1rem', marginBottom: '1.5rem' }}>
        <SearchIcon size={18} color="var(--on-surface-muted)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
        <input
          className="settings-input"
          style={{ paddingLeft: 44, paddingRight: 40, borderRadius: 'var(--radius-xl)', border: '1.5px solid var(--surface-container-high)' }}
          placeholder="Search tasks, milestones, careers, skills..."
          value={query}
          onChange={e => handleQueryChange(e.target.value)}
          autoFocus
        />
        {query && (
          <button onClick={() => { setQuery(''); setDebouncedQuery(''); }} style={{
            position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-variant)',
          }}>
            <X size={16} />
          </button>
        )}
      </div>

      {/* Empty state: recent searches + suggestions */}
      {!hasQuery && (
        <div style={{ padding: '1rem 0' }}>
          {/* Recent searches */}
          {recentSearches.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock size={14} color="var(--on-surface-muted)" />
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--on-surface-variant)' }}>Recent Searches</span>
                </div>
                <button onClick={clearRecent} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: '0.72rem', color: 'var(--on-surface-muted)', fontWeight: 500,
                }}>
                  Clear
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {recentSearches.map((search, i) => (
                  <button key={i} onClick={() => handleRecentClick(search)} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '0.4rem 0.85rem', borderRadius: 'var(--radius-full)',
                    background: 'var(--surface-container-lowest)', border: '1px solid var(--surface-container-high)',
                    cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500, color: 'var(--on-surface)',
                    transition: 'all 0.15s ease',
                  }}>
                    <SearchIcon size={12} color="var(--on-surface-muted)" />
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Default empty state */}
          <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--on-surface-variant)' }}>
            <SearchIcon size={32} style={{ opacity: 0.3, margin: '0 auto 8px' }} />
            <p style={{ fontSize: '0.88rem', marginBottom: '0.25rem' }}>Search across your tasks, milestones, careers, and skills</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-muted)' }}>
              Try searching for a skill, role, or topic
            </p>
          </div>
        </div>
      )}

      {/* Results */}
      {hasQuery && (
        <>
          {/* Result count */}
          {totalResults > 0 && (
            <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-muted)', marginBottom: '1rem', fontWeight: 500 }}>
              {totalResults} result{totalResults !== 1 ? 's' : ''} for "{debouncedQuery}"
            </p>
          )}

          {/* Tasks section */}
          {results.tasks.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <SectionHeader title="Tasks" count={results.tasks.length} color="rgba(139,79,44,0.08)" badge="Action items" />
              {results.tasks.map(({ item: t }) => (
                <div key={t.id} className="panel" style={{
                  borderRadius: '2rem', padding: '1.25rem', marginBottom: '0.5rem',
                  display: 'flex', alignItems: 'center', gap: 14,
                  boxShadow: 'var(--shadow-sm)',
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 'var(--radius-md)',
                    background: 'rgba(139,79,44,0.06)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <ListChecks size={20} color="var(--copper)" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 700, color: 'var(--on-surface)' }}>
                      <HighlightText text={t.title} query={debouncedQuery} />
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                      <CategoryPill label={t.category} />
                      {t.status && (
                        <span style={{
                          fontSize: '0.65rem', fontWeight: 600, padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                          background: t.status === 'done' ? 'rgba(5,150,105,0.08)' : 'var(--surface-container-low)',
                          color: t.status === 'done' ? '#059669' : 'var(--on-surface-variant)',
                          textTransform: 'capitalize',
                        }}>
                          {t.status.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                    {t.description && (
                      <p style={{
                        fontSize: '0.75rem', color: 'var(--on-surface-variant)',
                        marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        <HighlightText text={t.description} query={debouncedQuery} />
                      </p>
                    )}
                  </div>
                  <ChevronRight size={18} color="var(--on-surface-variant)" />
                </div>
              ))}
            </div>
          )}

          {/* Milestones section */}
          {results.milestones.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <SectionHeader title="Milestones" count={results.milestones.length} color="rgba(0,106,98,0.08)" badge="Roadmap" />
              {results.milestones.map(({ item: m }) => (
                <Link to="/app/roadmap" key={m.id} className="panel" style={{
                  borderRadius: '2rem', padding: '1.25rem', marginBottom: '0.5rem',
                  display: 'flex', alignItems: 'center', gap: 14,
                  boxShadow: 'var(--shadow-sm)',
                  textDecoration: 'none',
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 'var(--radius-md)',
                    background: 'rgba(0,106,98,0.06)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Target size={20} color="var(--secondary)" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 700, color: 'var(--on-surface)' }}>
                      <HighlightText text={m.title} query={debouncedQuery} />
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                      <span style={{
                        fontSize: '0.65rem', fontWeight: 600, padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        background: m.status === 'completed' ? 'rgba(5,150,105,0.08)' : m.status === 'in_progress' ? 'rgba(98,69,164,0.08)' : 'var(--surface-container-low)',
                        color: m.status === 'completed' ? '#059669' : m.status === 'in_progress' ? 'var(--primary)' : 'var(--on-surface-variant)',
                        textTransform: 'capitalize',
                      }}>
                        {m.status.replace('_', ' ')}
                      </span>
                    </div>
                    {m.description && (
                      <p style={{
                        fontSize: '0.75rem', color: 'var(--on-surface-variant)',
                        marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        <HighlightText text={m.description} query={debouncedQuery} />
                      </p>
                    )}
                  </div>
                  <ChevronRight size={18} color="var(--on-surface-variant)" />
                </Link>
              ))}
            </div>
          )}

          {/* Careers section */}
          {results.careers.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <SectionHeader title="Careers" count={results.careers.length} color="rgba(98,69,164,0.08)" badge="Matches" />
              {results.careers.map(({ item: c }, i) => (
                <Link to="/app/career-match" key={i} className="panel" style={{
                  borderRadius: '2rem', padding: '1.25rem', marginBottom: '0.5rem',
                  display: 'flex', alignItems: 'center', gap: 14,
                  border: i === 0 ? '1.5px solid rgba(98,69,164,0.15)' : 'none',
                  boxShadow: i === 0 ? 'none' : 'var(--shadow-sm)',
                  textDecoration: 'none',
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 'var(--radius-md)',
                    background: 'var(--surface-container-low)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <TrendingUp size={20} color="var(--primary)" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 700, color: 'var(--on-surface)' }}>
                      <HighlightText text={c.title} query={debouncedQuery} />
                    </p>
                    {c.matchScore && (
                      <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>{c.matchScore}% match</p>
                    )}
                  </div>
                  <ChevronRight size={18} color="var(--on-surface-variant)" />
                </Link>
              ))}
            </div>
          )}

          {/* Skills section */}
          {results.skills.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <SectionHeader title="Skills" count={results.skills.length} color="var(--surface-container-low)" badge="Gaps" />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {results.skills.map(({ item: s }, i) => (
                  <span key={i} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)',
                    background: 'var(--surface-container-lowest)',
                    boxShadow: 'var(--shadow-sm)',
                    fontSize: '0.85rem', fontWeight: 600, color: 'var(--on-surface)',
                  }}>
                    <Code size={14} color="var(--on-surface-variant)" />
                    <HighlightText text={s.name} query={debouncedQuery} />
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* No results */}
          {totalResults === 0 && (
            <div style={{ textAlign: 'center', padding: '2.5rem 0' }}>
              <SearchIcon size={32} color="var(--on-surface-muted)" style={{ opacity: 0.3, margin: '0 auto 12px' }} />
              <p style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--on-surface)', marginBottom: '0.5rem' }}>
                No results for "{debouncedQuery}"
              </p>
              <p style={{ fontSize: '0.78rem', color: 'var(--on-surface-muted)', maxWidth: 320, margin: '0 auto', lineHeight: 1.5 }}>
                Try different keywords, check your spelling, or search for broader terms like a skill name or career title.
              </p>
              <div style={{ marginTop: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: '0.75rem' }}>
                  <Lightbulb size={14} color="var(--copper)" />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--on-surface-variant)' }}>Suggestions</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
                  {['Python', 'Leadership', 'Data', 'Design', 'Cloud'].map(s => (
                    <button key={s} onClick={() => handleQueryChange(s)} style={{
                      padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-full)',
                      background: 'var(--surface-container-lowest)', border: '1px solid var(--surface-container-high)',
                      cursor: 'pointer', fontSize: '0.78rem', fontWeight: 500, color: 'var(--on-surface)',
                    }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
