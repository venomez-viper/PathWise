import { useState, useEffect } from 'react';
import { Search as SearchIcon, X, ChevronRight, TrendingUp, BookOpen, Code } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../lib/auth-context';
import { assessment as assessmentApi, roadmap as roadmapApi, tasks as tasksApi } from '../../lib/api';

export default function SearchPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ roles: any[]; courses: any[]; skills: string[] }>({ roles: [], courses: [], skills: [] });
  // Load all data once, then filter client-side
  const [allData, setAllData] = useState<{ roles: any[]; tasks: any[]; skills: string[] }>({ roles: [], tasks: [], skills: [] });

  useEffect(() => {
    if (!user) return;
    Promise.allSettled([
      assessmentApi.getResult(user.id),
      tasksApi.list(user.id),
      roadmapApi.get(user.id),
    ]).then(([assessRes, tasksRes, roadmapRes]) => {
      const matches = assessRes.status === 'fulfilled' ? ((assessRes.value as any)?.result?.careerMatches ?? []) : [];
      const taskList = tasksRes.status === 'fulfilled' ? ((tasksRes.value as any)?.tasks ?? []) : [];
      const roadmap = roadmapRes.status === 'fulfilled' ? (roadmapRes.value as any)?.roadmap : null;
      const skillGaps = roadmap?.skillGapGaps ? JSON.parse(roadmap.skillGapGaps) : [];

      setAllData({
        roles: matches,
        tasks: taskList,
        skills: Array.isArray(skillGaps) ? skillGaps : [],
      });
    });
  }, [user]);

  useEffect(() => {
    if (!query.trim()) { setResults({ roles: [], courses: [], skills: [] }); return; }
    const q = query.toLowerCase();
    setResults({
      roles: allData.roles.filter(r => r.title?.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q)),
      courses: allData.tasks.filter(t => (t.category === 'learning' || t.category === 'certification') && t.title?.toLowerCase().includes(q)),
      skills: allData.skills.filter(s => s.toLowerCase().includes(q)),
    });
  }, [query, allData]);

  return (
    <div className="page" style={{ maxWidth: '100%' }}>
      <h1 className="page-title">Search</h1>

      {/* Search input */}
      <div style={{ position: 'relative', marginTop: '1rem', marginBottom: '1.5rem' }}>
        <SearchIcon size={18} color="var(--on-surface-muted)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
        <input
          className="settings-input"
          style={{ paddingLeft: 44, paddingRight: 40, borderRadius: 'var(--radius-xl)', border: '1.5px solid var(--surface-container-high)' }}
          placeholder="Search roles, courses, skills..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          autoFocus
        />
        {query && (
          <button onClick={() => setQuery('')} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-variant)' }}>
            <X size={16} />
          </button>
        )}
      </div>

      {!query.trim() ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--on-surface-variant)' }}>
          <SearchIcon size={32} style={{ opacity: 0.3, margin: '0 auto 8px' }} />
          <p style={{ fontSize: '0.88rem' }}>Search for roles, courses, and skills</p>
        </div>
      ) : (
        <>
          {/* Roles */}
          {results.roles.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.75rem' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 800, color: 'var(--on-surface)' }}>Roles</h2>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--radius-full)', background: 'rgba(98,69,164,0.08)', color: 'var(--primary)', textTransform: 'uppercase' }}>Matches</span>
              </div>
              {results.roles.map((r, i) => (
                <Link to="/app/career-match" key={i} className="panel" style={{
                  borderRadius: '2rem', padding: '1.25rem', marginBottom: '0.5rem',
                  display: 'flex', alignItems: 'center', gap: 14,
                  border: i === 0 ? '1.5px solid rgba(98,69,164,0.15)' : 'none',
                  boxShadow: i === 0 ? 'none' : 'var(--shadow-sm)',
                }}>
                  <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--surface-container-low)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <TrendingUp size={20} color="var(--primary)" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 700, color: 'var(--on-surface)' }}>{r.title}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>{r.matchScore}% match</p>
                  </div>
                  <ChevronRight size={18} color="var(--on-surface-variant)" />
                </Link>
              ))}
            </div>
          )}

          {/* Courses */}
          {results.courses.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.75rem' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 800, color: 'var(--on-surface)' }}>Courses</h2>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--radius-full)', background: 'rgba(0,106,98,0.08)', color: 'var(--secondary)', textTransform: 'uppercase' }}>Growth</span>
              </div>
              {results.courses.map((t: any) => (
                <div key={t.id} className="panel" style={{ borderRadius: '2rem', padding: '1.25rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'rgba(0,106,98,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BookOpen size={20} color="var(--secondary)" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 700, color: 'var(--on-surface)' }}>{t.title}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>{t.category}</p>
                  </div>
                  <ChevronRight size={18} color="var(--on-surface-variant)" />
                </div>
              ))}
            </div>
          )}

          {/* Skills */}
          {results.skills.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.75rem' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 800, color: 'var(--on-surface)' }}>Skills</h2>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--radius-full)', background: 'var(--surface-container-low)', color: 'var(--on-surface-variant)', textTransform: 'uppercase' }}>Required</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {results.skills.map((s, i) => (
                  <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', background: 'var(--surface-container-lowest)', boxShadow: 'var(--shadow-sm)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--on-surface)' }}>
                    <Code size={14} color="var(--on-surface-variant)" /> {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {results.roles.length === 0 && results.courses.length === 0 && results.skills.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--on-surface-variant)' }}>
              <p style={{ fontSize: '0.88rem' }}>No results for "{query}"</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
