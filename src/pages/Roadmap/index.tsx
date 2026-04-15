import { useState, useEffect, useRef } from 'react';
import { Loader2, AlertCircle, Lock, CheckCircle2, Sparkles, ArrowRight, BookOpen, Briefcase, Users, Plus, MoreHorizontal, X, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../lib/auth-context';
import { roadmap as roadmapApi, tasks as tasksApi } from '../../lib/api';
import { Panda, PandaSpot } from '../../components/panda';

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
  learning: 'var(--primary)',
  portfolio: 'var(--secondary)',
  networking: 'var(--copper)',
  interview_prep: 'var(--primary)',
  certification: 'var(--secondary)',
  research: '#334042',
};

const PRIORITY_COLORS: Record<string, { bg: string; color: string }> = {
  high: { bg: 'rgba(239,68,68,0.08)', color: '#ef4444' },
  medium: { bg: 'rgba(139,79,44,0.08)', color: 'var(--copper)' },
  low: { bg: 'rgba(0,106,98,0.08)', color: 'var(--secondary)' },
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
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium', category: 'learning' });
  const [savingTask, setSavingTask] = useState(false);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [showTimeline, setShowTimeline] = useState(false);
  const [selectedTimeline, setSelectedTimeline] = useState<string>('6mo');
  const [savingTimeline, setSavingTimeline] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);

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

  async function handleAddCustomTask(milestones: any[]) {
    const targetMilestoneId = selectedMilestoneId || milestones.find((m: any) => m.status === 'in_progress')?.id || milestones[0]?.id;
    if (!user || !newTask.title.trim() || !targetMilestoneId) return;
    setSavingTask(true);
    setModalError(null);
    try {
      await tasksApi.create({
        userId: user.id,
        milestoneId: targetMilestoneId,
        title: newTask.title.trim(),
        description: newTask.description.trim() || undefined,
        priority: newTask.priority,
        category: newTask.category,
      });
      await loadData(user.id, true);
      setNewTask({ title: '', description: '', priority: 'medium', category: 'learning' });
      setSelectedMilestoneId(null);
      setModalError(null);
      setShowAddTask(false);
    } catch (err) {
      setModalError(err instanceof Error ? err.message : 'Failed to add task.');
    } finally { setSavingTask(false); }
  }

  // Derive current timeline from estimatedWeeks or milestone due dates
  function getCurrentTimeline(roadmapData: any): string {
    // Try estimatedWeeks first (requires backend to return it)
    const weeks = roadmapData?.estimatedWeeks;
    if (weeks) {
      if (weeks <= 15) return '3mo';
      if (weeks <= 35) return '6mo';
      return '12mo';
    }
    // Fallback: estimate from last milestone dueDate
    const ms = roadmapData?.milestones ?? [];
    if (ms.length > 0) {
      const lastDue = ms[ms.length - 1]?.dueDate;
      if (lastDue) {
        const diffWeeks = Math.round((new Date(lastDue).getTime() - Date.now()) / (7 * 24 * 60 * 60 * 1000));
        if (diffWeeks <= 15) return '3mo';
        if (diffWeeks <= 35) return '6mo';
        return '12mo';
      }
    }
    return '6mo';
  }

  async function handleTimelineChange() {
    if (!user || !data || savingTimeline) return;
    setSavingTimeline(true);
    setActionError(null);
    try {
      await roadmapApi.updateTimeline({ userId: user.id, timeline: selectedTimeline });
      await loadData(user.id);
      setShowTimeline(false);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to update timeline.');
    } finally {
      setSavingTimeline(false);
    }
  }

  // Open timeline picker with current value pre-selected
  function openTimelinePicker() {
    if (data) setSelectedTimeline(getCurrentTimeline(data));
    setShowTimeline(true);
  }

  // Close on click outside
  useEffect(() => {
    if (!showTimeline) return;
    function handleClickOutside(e: MouseEvent) {
      if (timelineRef.current && !timelineRef.current.contains(e.target as Node)) {
        setShowTimeline(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showTimeline]);

  if (loading) return (
    <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300, gap: 12 }}>
      <PandaSpot context="loading" position="inline" size={90} animate />
      <Loader2 size={22} color="var(--copper)" style={{ animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  if (!data) return (
    <div className="page">
      <h1 className="page-title">Growth Roadmap</h1>
      <div className="panel" style={{ textAlign: 'center', padding: '3rem', borderRadius: '2rem' }}>
        <PandaSpot context="empty-state" position="inline" message="Complete onboarding to start your journey!" animate />
        <p style={{ fontWeight: 600, color: 'var(--on-surface)', marginBottom: 8, marginTop: 12 }}>No roadmap yet</p>
        <p style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)', marginBottom: 16 }}>Complete onboarding to generate your career roadmap.</p>
        <Link to="/app/onboarding" className="btn-page-action" style={{ background: 'var(--copper)' }}>Start Onboarding</Link>
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
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--copper)', letterSpacing: '-0.03em', marginTop: 4 }}>
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
            <div style={{ display: 'flex', gap: 8, marginTop: '0.75rem', position: 'relative' }}>
              <button onClick={openTimelinePicker} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', background: 'var(--copper)', color: '#fff', fontSize: '0.78rem', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                <Clock size={13} /> Adjust Timeline
              </button>
              {/* Timeline Picker Popover */}
              {showTimeline && (
                <div ref={timelineRef} style={{
                  position: 'absolute', top: 'calc(100% + 8px)', left: 0, zIndex: 50,
                  background: 'var(--surface-container-lowest)', borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--outline-variant)', padding: '1.25rem',
                  boxShadow: '0 8px 40px rgba(0,0,0,0.12)', minWidth: 280,
                }}>
                  <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--on-surface-variant)', marginBottom: '0.75rem' }}>
                    Choose Timeline
                  </p>
                  <div style={{ display: 'flex', gap: 6, marginBottom: '1rem' }}>
                    {([
                      { value: '3mo', label: '3 Months', sub: 'Fast track' },
                      { value: '6mo', label: '6 Months', sub: 'Recommended' },
                      { value: '12mo', label: '12 Months', sub: 'Steady pace' },
                    ] as const).map((opt) => {
                      const isSelected = selectedTimeline === opt.value;
                      return (
                        <button key={opt.value} onClick={() => setSelectedTimeline(opt.value)}
                          style={{
                            flex: 1, padding: '0.6rem 0.5rem', borderRadius: 'var(--radius-full)',
                            background: isSelected ? 'var(--copper)' : 'var(--surface-container-low)',
                            color: isSelected ? '#fff' : 'var(--on-surface)',
                            border: isSelected ? '2px solid var(--copper)' : '2px solid transparent',
                            cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s ease',
                          }}>
                          <p style={{ fontSize: '0.82rem', fontWeight: 700, lineHeight: 1.2 }}>{opt.label}</p>
                          <p style={{ fontSize: '0.62rem', fontWeight: 500, opacity: 0.7, marginTop: 2 }}>{opt.sub}</p>
                        </button>
                      );
                    })}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={handleTimelineChange} disabled={savingTimeline || selectedTimeline === getCurrentTimeline(data)}
                      style={{
                        flex: 1, padding: '0.55rem', borderRadius: 'var(--radius-full)',
                        background: 'var(--copper)', color: '#fff', border: 'none',
                        fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
                        opacity: savingTimeline || selectedTimeline === getCurrentTimeline(data) ? 0.5 : 1,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      }}>
                      {savingTimeline ? <Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} /> : null}
                      {savingTimeline ? 'Updating...' : 'Save'}
                    </button>
                    <button onClick={() => setShowTimeline(false)}
                      style={{
                        padding: '0.55rem 1rem', borderRadius: 'var(--radius-full)',
                        background: 'var(--surface-container)', color: 'var(--on-surface-variant)',
                        border: 'none', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                      }}>
                      Cancel
                    </button>
                  </div>
                  <p style={{ fontSize: '0.68rem', color: 'var(--on-surface-muted)', marginTop: '0.5rem', textAlign: 'center' }}>
                    Your progress and completed tasks are preserved.
                  </p>
                </div>
              )}
              <button onClick={() => { setSelectedMilestoneId(activeMilestone?.id || null); setModalError(null); setShowAddTask(true); }} disabled={milestones.length === 0}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', background: 'var(--surface-container-low)', color: 'var(--on-surface)', fontSize: '0.78rem', fontWeight: 600, border: 'none', cursor: milestones.length > 0 ? 'pointer' : 'default', opacity: milestones.length > 0 ? 1 : 0.5 }}>
                <Plus size={14} /> Add Custom Task
              </button>
            </div>
          </div>
          {/* Progress ring + panda */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <div style={{ position: 'relative', width: RS, height: RS }}>
              <svg width={RS} height={RS} viewBox={`0 0 ${RS} ${RS}`}>
                <circle cx={RS/2} cy={RS/2} r={RR} fill="none" stroke="var(--surface-container)" strokeWidth={5} />
                <circle cx={RS/2} cy={RS/2} r={RR} fill="none" stroke="var(--copper)" strokeWidth={5}
                  strokeLinecap="round" strokeDasharray={RC} strokeDashoffset={mounted ? RC*(1-completionPct/100) : RC}
                  style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 1s ease' }} />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 800, color: 'var(--on-surface)' }}>
                {completionPct}%
              </div>
            </div>
            <Panda mood={completionPct >= 100 ? 'celebrating' : completionPct > 50 ? 'happy' : completionPct > 0 ? 'working' : 'thinking'} size={80} />
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
                background: isActive ? 'var(--copper)' : 'var(--surface-container-low)',
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
                {(isActive || m.status === 'completed') && mTasks.length > 0 && (
                  <p style={{ fontSize: '0.72rem', opacity: 0.7, marginBottom: 8 }}>
                    {done}/{mTasks.length} tasks done
                  </p>
                )}
                {m.status === 'completed' && (
                  <Link to={`/app/tasks?milestone=${m.id}`} style={{
                    padding: '0.4rem', borderRadius: 'var(--radius-full)',
                    background: 'var(--surface-container)', color: 'var(--on-surface)',
                    fontSize: '0.7rem', fontWeight: 600, textDecoration: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                  }}>
                    View Tasks <ArrowRight size={11} />
                  </Link>
                )}
                {isActive && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <Link to={`/app/tasks?milestone=${m.id}`} style={{
                      padding: '0.45rem', borderRadius: 'var(--radius-full)',
                      background: '#fff', color: 'var(--copper)', border: 'none',
                      fontSize: '0.72rem', fontWeight: 700, textDecoration: 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                    }}>
                      <ArrowRight size={12} /> View Tasks
                    </Link>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => handleGenerateTasks(m)} disabled={!!generating || !!completing}
                        style={{ flex: 1, padding: '0.4rem', borderRadius: 'var(--radius-full)', background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                        {generating === m.id ? <Loader2 size={11} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Sparkles size={11} />}
                        {generating === m.id ? 'Generating...' : 'Generate Tasks'}
                      </button>
                      <button onClick={() => handleComplete(m.id)} disabled={!!completing}
                        style={{ flex: 1, padding: '0.4rem', borderRadius: 'var(--radius-full)', background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                        {completing === m.id ? <Loader2 size={11} style={{ animation: 'spin 0.8s linear infinite' }} /> : <CheckCircle2 size={11} />}
                        Complete
                      </button>
                    </div>
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
            No tasks yet. Generate tasks from the milestones above, or add custom tasks.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {Object.entries(tasksByCategory).map(([cat, catTasks]) => {
            const CatIcon = CATEGORY_ICON[cat] || BookOpen;
            const borderColor = CATEGORY_BORDER[cat] || 'var(--surface-container-highest)';
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

      {/* ── ADD CUSTOM TASK MODAL ── */}
      {showAddTask && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          {/* Backdrop */}
          <div onClick={() => setShowAddTask(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }} />
          {/* Modal */}
          <div style={{
            position: 'relative', width: '100%', maxWidth: 480,
            background: 'var(--surface-container-lowest)', borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--outline-variant)', padding: '2rem',
            boxShadow: '0 12px 60px rgba(0,0,0,0.15)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 800, color: 'var(--on-surface)' }}>Add Custom Task</h3>
              <button onClick={() => setShowAddTask(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-variant)', padding: 4 }}>
                <X size={20} />
              </button>
            </div>

            {modalError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.6rem 0.9rem', background: 'rgba(239,68,68,0.06)', borderRadius: 'var(--radius-sm)', marginBottom: '0.75rem', color: '#ef4444', fontSize: '0.8rem' }}>
                <AlertCircle size={14} />{modalError}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* Milestone selector */}
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--on-surface-muted)', marginBottom: 4 }}>Milestone</label>
                <select
                  value={selectedMilestoneId || milestones.find((m: any) => m.status === 'in_progress')?.id || milestones[0]?.id || ''}
                  onChange={e => setSelectedMilestoneId(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.9rem', border: '1.5px solid var(--outline-variant)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-lumina)', color: 'var(--on-surface)', fontFamily: 'var(--font-body)', fontSize: '0.85rem', outline: 'none', cursor: 'pointer' }}
                >
                  {milestones.map((m: any) => (
                    <option key={m.id} value={m.id}>{m.title}{m.status === 'in_progress' ? ' (Active)' : m.status === 'completed' ? ' (Done)' : ''}</option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--on-surface-muted)', marginBottom: 4 }}>Task Title</label>
                <input
                  value={newTask.title}
                  onChange={e => setNewTask(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Complete SQL basics course"
                  style={{ width: '100%', padding: '0.7rem 0.9rem', border: '1.5px solid var(--outline-variant)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-lumina)', color: 'var(--on-surface)', fontFamily: 'var(--font-body)', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--on-surface-muted)', marginBottom: 4 }}>Description (optional)</label>
                <textarea
                  value={newTask.description}
                  onChange={e => setNewTask(f => ({ ...f, description: e.target.value }))}
                  placeholder="Brief description of what to do..."
                  rows={3}
                  style={{ width: '100%', padding: '0.7rem 0.9rem', border: '1.5px solid var(--outline-variant)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-lumina)', color: 'var(--on-surface)', fontFamily: 'var(--font-body)', fontSize: '0.88rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>

              {/* Priority & Category row */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--on-surface-muted)', marginBottom: 4 }}>Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={e => setNewTask(f => ({ ...f, priority: e.target.value }))}
                    style={{ width: '100%', padding: '0.6rem 0.9rem', border: '1.5px solid var(--outline-variant)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-lumina)', color: 'var(--on-surface)', fontFamily: 'var(--font-body)', fontSize: '0.85rem', outline: 'none', cursor: 'pointer' }}
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--on-surface-muted)', marginBottom: 4 }}>Category</label>
                  <select
                    value={newTask.category}
                    onChange={e => setNewTask(f => ({ ...f, category: e.target.value }))}
                    style={{ width: '100%', padding: '0.6rem 0.9rem', border: '1.5px solid var(--outline-variant)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-lumina)', color: 'var(--on-surface)', fontFamily: 'var(--font-body)', fontSize: '0.85rem', outline: 'none', cursor: 'pointer' }}
                  >
                    <option value="learning">Learning</option>
                    <option value="portfolio">Portfolio</option>
                    <option value="networking">Networking</option>
                    <option value="interview_prep">Interview Prep</option>
                    <option value="certification">Certification</option>
                    <option value="research">Research</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                <button
                  onClick={() => handleAddCustomTask(milestones)}
                  disabled={savingTask || !newTask.title.trim()}
                  style={{
                    flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-sm)',
                    background: 'var(--copper)', color: '#fff', border: 'none',
                    fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.88rem',
                    cursor: 'pointer', opacity: savingTask || !newTask.title.trim() ? 0.4 : 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                >
                  {savingTask ? <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Plus size={14} />}
                  {savingTask ? 'Adding...' : 'Add Task'}
                </button>
                <button
                  onClick={() => setShowAddTask(false)}
                  style={{
                    padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-sm)',
                    background: 'var(--surface-container)', color: 'var(--on-surface-variant)',
                    border: 'none', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
