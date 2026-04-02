import { useState, useEffect } from 'react';
import { Loader2, AlertCircle, Lock, CheckCircle2, Sparkles, ArrowRight, BookOpen, Briefcase, Users, Plus, MoreHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../lib/auth-context';
import { roadmap as roadmapApi, tasks as tasksApi } from '../../lib/api';

type Task = { id: string; title: string; status: string; milestoneId?: string; category?: string; priority?: string; description?: string };

const CATEGORY_ICON: Record<string, any> = {
  learning: BookOpen,
  portfolio: Briefcase,
  networking: Users,
  interview_prep: BookOpen,
  certification: BookOpen,
  reflection: BookOpen,
  research: BookOpen,
};

const CATEGORY_LABEL: Record<string, string> = {
  learning: 'COURSES',
  portfolio: 'PROJECTS',
  networking: 'NETWORKING',
  interview_prep: 'INTERVIEW PREP',
  certification: 'CERTIFICATION',
  reflection: 'REFLECTION',
  research: 'RESEARCH',
};

const CATEGORY_BORDER: Record<string, string> = {
  learning: '#6245a4',
  portfolio: '#006a62',
  networking: '#8b4f2c',
  interview_prep: '#6245a4',
  certification: '#006a62',
  research: '#334042',
};

const PRIORITY_COLORS: Record<string, { bg: string; color: string }> = {
  high: { bg: 'rgba(239,68,68,0.08)', color: '#ef4444' },
  medium: { bg: 'rgba(139,79,44,0.08)', color: '#8b4f2c' },
  low: { bg: 'rgba(0,106,98,0.08)', color: '#006a62' },
};

export default function Roadmap() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [milestoneTaskMap, setMilestoneTaskMap] = useState<Record<string, Task[]>>({});
  const [completing, setCompleting] = useState<string | null>(null);
  const [generating, setGenerating] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function loadData(userId: string, silent = false) {
    if (!silent) setLoading(true);
    const [roadmapRes, tasksRes] = await Promise.allSettled([
      roadmapApi.get(userId), tasksApi.list(userId),
    ]);
    const rm = roadmapRes.status === 'fulfilled' ? (roadmapRes.value as any).roadmap : null;
    const taskList: Task[] = tasksRes.status === 'fulfilled' ? ((tasksRes.value as any).tasks ?? []) : [];
    const taskMap: Record<string, Task[]> = {};
    for (const t of taskList) {
      if (t.milestoneId) {
        if (!taskMap[t.milestoneId]) taskMap[t.milestoneId] = [];
        taskMap[t.milestoneId].push(t);
      }
    }
    setData(rm);
    setMilestoneTaskMap(taskMap);
    if (!silent) { setLoading(false); setTimeout(() => setMounted(true), 100); }
  }

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    loadData(user.id).then(() => { if (!cancelled) setMounted(true); });
    return () => { cancelled = true; };
  }, [user]);

  async function handleGenerateTasks(m: any) {
    if (!user || generating || completing) return;
    setActionError(null); setGenerating(m.id);
    try {
      await tasksApi.aiGenerate({ userId: user.id, milestoneId: m.id, milestoneTitle: m.title, milestoneDescription: m.description, targetRole: data?.targetRole ?? '' });
      await loadData(user.id, true);
    } catch (err) { setActionError(err instanceof Error ? err.message : 'Failed to generate tasks.'); }
    finally { setGenerating(null); }
  }

  async function handleComplete(milestoneId: string) {
    if (!user || completing) return;
    setActionError(null); setCompleting(milestoneId);
    try { await roadmapApi.completeMilestone(milestoneId); await loadData(user.id, true); }
    catch (err) { setActionError(err instanceof Error ? err.message : 'Failed to complete milestone.'); }
    finally { setCompleting(null); }
  }

  if (loading) return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <Loader2 size={28} color="#8b4f2c" style={{ animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  if (!data) return (
    <div className="page">
      <h1 className="page-title">Growth Roadmap</h1>
      <div className="panel" style={{ textAlign: 'center', padding: '3rem', borderRadius: '2rem' }}>
        <AlertCircle size={32} color="var(--on-surface-variant)" style={{ margin: '0 auto 12px' }} />
        <p style={{ fontWeight: 600, color: 'var(--on-surface)', marginBottom: 8 }}>No roadmap yet</p>
        <p style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)', marginBottom: 16 }}>Complete onboarding to generate your career roadmap.</p>
        <Link to="/app/onboarding" className="btn-page-action" style={{ background: '#8b4f2c' }}>Start Onboarding</Link>
      </div>
    </div>
  );

  const completionPct = data.completionPercent ?? 0;
  const milestones: any[] = data.milestones ?? [];
  const completedCount = milestones.filter((m) => m.status === 'completed').length;
  const totalCount = milestones.length;
  const activeMilestone = milestones.find((m) => m.status === 'in_progress');

  // Collect all tasks across milestones, grouped by category
  const allTasks: Task[] = Object.values(milestoneTaskMap).flat();
  const tasksByCategory: Record<string, Task[]> = {};
  for (const t of allTasks) {
    const cat = t.category || 'learning';
    if (!tasksByCategory[cat]) tasksByCategory[cat] = [];
    tasksByCategory[cat].push(t);
  }

  // Ring constants
  const RS = 72; const RR = 30; const RC = 2 * Math.PI * RR;

  return (
    <div className="page">
      {/* ── HEADER ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h1 className="page-title">Growth Roadmap</h1>
          <span style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)' }}>Step {completedCount + 1} of {totalCount}</span>
        </div>
      </div>

      {actionError && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.06)', borderRadius: '2rem', marginBottom: '1rem', color: '#ef4444', fontSize: '0.85rem' }}>
          <AlertCircle size={16} />{actionError}
          <button onClick={() => setActionError(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>✕</button>
        </div>
      )}

      {/* ── CURRENT TARGET CARD ── */}
      <div className="panel" style={{ borderRadius: '2rem', padding: '2rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--on-surface-variant)' }}>Current Target</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, color: '#8b4f2c', letterSpacing: '-0.03em', marginTop: 4 }}>
              {data.targetRole}
            </h2>
            <div style={{ display: 'flex', gap: 8, marginTop: '0.75rem', flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 12px', borderRadius: 'var(--radius-full)', background: 'var(--surface-container-low)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--on-surface-variant)' }}>
                📅 {data.estimatedWeeks ? `${Math.round(data.estimatedWeeks / 4)} Months` : '6 Months'} Timeline
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 12px', borderRadius: 'var(--radius-full)', background: 'var(--surface-container-low)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--on-surface-variant)' }}>
                🎯 {totalCount >= 8 ? 'Advanced' : totalCount >= 5 ? 'Standard' : 'Starter'} Track
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: '0.75rem' }}>
              <Link to="/app/onboarding" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', background: '#8b4f2c', color: '#fff', fontSize: '0.78rem', fontWeight: 700 }}>
                ✏️ Adjust Timeline
              </Link>
              <button onClick={() => activeMilestone && handleGenerateTasks(activeMilestone)} disabled={!activeMilestone || !!generating}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', background: 'var(--surface-container-low)', color: 'var(--on-surface)', fontSize: '0.78rem', fontWeight: 600, border: 'none', cursor: activeMilestone ? 'pointer' : 'default', opacity: activeMilestone ? 1 : 0.5 }}>
                <Plus size={14} /> Add Custom Task
              </button>
            </div>
          </div>
          {/* Progress ring */}
          <div style={{ position: 'relative', width: RS, height: RS, flexShrink: 0 }}>
            <svg width={RS} height={RS} viewBox={`0 0 ${RS} ${RS}`}>
              <circle cx={RS/2} cy={RS/2} r={RR} fill="none" stroke="var(--surface-container)" strokeWidth={5} />
              <circle cx={RS/2} cy={RS/2} r={RR} fill="none" stroke="#8b4f2c" strokeWidth={5}
                strokeLinecap="round" strokeDasharray={RC} strokeDashoffset={mounted ? RC*(1-completionPct/100) : RC}
                style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 1s ease' }} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 800, color: 'var(--on-surface)' }}>
              {completionPct}%
            </div>
          </div>
        </div>
      </div>

      {/* ── VISUAL PHASE PATH (Desktop Zen Stone) ── */}
      <div className="panel" style={{ borderRadius: '2rem', padding: '2rem', marginBottom: '1.5rem', position: 'relative', minHeight: 280, overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem' }}>
          {milestones.map((m: any, i: number) => {
            const isActive = m.status === 'in_progress';
            const isLocked = m.status === 'locked';
            const mTasks = milestoneTaskMap[m.id] ?? [];
            const done = mTasks.filter(t => t.status === 'done').length;
            return (
              <div key={m.id} style={{
                minWidth: 200, maxWidth: 240, flexShrink: 0,
                background: isActive ? '#8b4f2c' : 'var(--surface-container-low)',
                borderRadius: '1.5rem', padding: '1.25rem',
                opacity: isLocked ? 0.45 : 1,
                color: isActive ? '#fff' : 'var(--on-surface)',
                boxShadow: isActive ? '0 4px 20px rgba(139,79,44,0.2)' : 'var(--shadow-sm)',
                position: 'relative',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: isActive ? 0.8 : 0.5 }}>
                    Phase {String(i+1).padStart(2, '0')}
                  </span>
                  {isLocked && <Lock size={14} />}
                  {m.status === 'completed' && <CheckCircle2 size={16} color="#34d399" />}
                </div>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 800, lineHeight: 1.2, marginBottom: 6 }}>
                  {m.title}
                </p>
                {isActive && mTasks.length > 0 && (
                  <p style={{ fontSize: '0.72rem', opacity: 0.7, marginBottom: 8 }}>
                    {done}/{mTasks.length} tasks done
                  </p>
                )}
                {isActive && (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => handleGenerateTasks(m)} disabled={!!generating || !!completing}
                      style={{ flex: 1, padding: '0.4rem', borderRadius: 'var(--radius-full)', background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                      {generating === m.id ? <Loader2 size={11} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Sparkles size={11} />}
                      {generating === m.id ? 'Gen...' : 'AI Tasks'}
                    </button>
                    <button onClick={() => handleComplete(m.id)} disabled={!!completing}
                      style={{ flex: 1, padding: '0.4rem', borderRadius: 'var(--radius-full)', background: '#fff', color: '#8b4f2c', border: 'none', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                      {completing === m.id ? <Loader2 size={11} style={{ animation: 'spin 0.8s linear infinite' }} /> : <CheckCircle2 size={11} />}
                      Complete
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {/* Active milestone badge */}
        {activeMilestone && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.5rem' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 16px', borderRadius: 'var(--radius-full)', background: 'var(--surface-container-lowest)', fontSize: '0.78rem', fontWeight: 600, color: 'var(--on-surface)', boxShadow: 'var(--shadow-sm)' }}>
              Active Milestone: {(() => { const mt = milestoneTaskMap[activeMilestone.id] ?? []; const d = mt.filter(t => t.status === 'done').length; return mt.length > 0 ? `${Math.round((d/mt.length)*100)}%` : '0%'; })()} Complete
            </span>
          </div>
        )}
      </div>

      {/* ── INSIGHT OF THE DAY (Zen Stone) ── */}
      <div className="panel" style={{ borderRadius: '2rem', padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(139,79,44,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1rem' }}>
          💡
        </div>
        <div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 800, color: 'var(--on-surface)', marginBottom: 4 }}>Insight of the Day</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--on-surface-variant)', lineHeight: 1.5, fontStyle: 'italic' }}>
            "Reflection is the catalyst for growth. Take a moment to breathe into the spaces where you've found clarity today."
          </p>
        </div>
      </div>

      {/* ── MY LEARNING PATH — grouped by category (Mobile Lumina) ── */}
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 800, color: 'var(--on-surface)', letterSpacing: '-0.02em', marginBottom: '1rem' }}>
        My Learning Path
      </h2>

      {Object.keys(tasksByCategory).length === 0 ? (
        <div className="panel" style={{ borderRadius: '2rem', textAlign: 'center', padding: '2rem' }}>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.85rem' }}>
            No tasks yet. Generate AI tasks from the milestones above, or add custom tasks.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {Object.entries(tasksByCategory).map(([cat, catTasks]) => {
            const CatIcon = CATEGORY_ICON[cat] || BookOpen;
            const borderColor = CATEGORY_BORDER[cat] || '#334042';
            return (
              <div key={cat}>
                {/* Category header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.75rem' }}>
                  <CatIcon size={16} color="var(--on-surface-variant)" />
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--on-surface-variant)' }}>
                    {CATEGORY_LABEL[cat] || cat.toUpperCase()}
                  </span>
                </div>
                {/* Task items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {catTasks.map((t) => {
                    const pri = PRIORITY_COLORS[t.priority || 'medium'] || PRIORITY_COLORS.medium;
                    return (
                      <div key={t.id} style={{
                        background: 'var(--surface-container-lowest)',
                        borderRadius: 'var(--radius-xl)',
                        borderLeft: `4px solid ${borderColor}`,
                        padding: '1rem 1.25rem',
                        boxShadow: 'var(--shadow-sm)',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ flex: 1 }}>
                            {/* Priority badge */}
                            <span style={{
                              display: 'inline-block', fontSize: '0.6rem', fontWeight: 700,
                              textTransform: 'uppercase', letterSpacing: '0.06em',
                              padding: '2px 8px', borderRadius: 'var(--radius-full)',
                              background: pri.bg, color: pri.color, marginBottom: 6,
                            }}>
                              {(t.priority || 'medium').toUpperCase()} PRIORITY
                            </span>
                            <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 700, color: 'var(--on-surface)', lineHeight: 1.3 }}>
                              {t.title}
                            </p>
                            {t.description && (
                              <p style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)', marginTop: 3, lineHeight: 1.4 }}>
                                {t.description}
                              </p>
                            )}
                          </div>
                          <MoreHorizontal size={16} color="var(--on-surface-variant)" style={{ flexShrink: 0, marginTop: 4 }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── CONTINUE JOURNEY CTA (Zen Stone) ── */}
      {activeMilestone && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
          <Link to="/app/tasks" style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '1rem 2rem', borderRadius: 'var(--radius-full)',
            background: 'linear-gradient(135deg, #334042, #4a5759)',
            color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: '1rem', letterSpacing: '-0.01em',
            boxShadow: '0 4px 20px rgba(51,64,66,0.3)',
          }}>
            <div>
              <p style={{ fontSize: '0.6rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6, marginBottom: 2 }}>Resume Path</p>
              <p>Continue Journey</p>
            </div>
            <ArrowRight size={20} />
          </Link>
        </div>
      )}
    </div>
  );
}
