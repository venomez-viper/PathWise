import { useState, useEffect } from 'react';
import { CheckCircle2, Compass, ClipboardList, Award, ArrowRight, TrendingUp, Zap, Clock, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../lib/auth-context';
import { assessment, roadmap, tasks, progress } from '../../lib/api';

export default function Dashboard() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    roadmapPct: number;
    targetRole: string;
    careerMatches: { title: string; matchScore: number; description: string }[];
    recentTasks: { id: string; title: string; status: string; priority: string }[];
    stats: { tasksFinished: number; tasksTotal: number; jobReadinessScore: number };
  }>({
    roadmapPct: 0,
    targetRole: '—',
    careerMatches: [],
    recentTasks: [],
    stats: { tasksFinished: 0, tasksTotal: 0, jobReadinessScore: 0 },
  });

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function load() {
      try {
        const [assessRes, roadmapRes, tasksRes, progressRes] = await Promise.allSettled([
          assessment.getResult(user!.id),
          roadmap.get(user!.id),
          tasks.list(user!.id),
          progress.getStats(user!.id),
        ]);

        if (cancelled) return;

        const careerMatches =
          assessRes.status === 'fulfilled'
            ? (assessRes.value as any).result?.careerMatches ?? []
            : [];

        const roadmapData = roadmapRes.status === 'fulfilled' ? (roadmapRes.value as any).roadmap : null;
        const taskList    = tasksRes.status === 'fulfilled'   ? (tasksRes.value as any).tasks ?? [] : [];
        const statsData   = progressRes.status === 'fulfilled' ? (progressRes.value as any).stats : null;

        setData({
          roadmapPct:    roadmapData?.completionPercent ?? 0,
          targetRole:    roadmapData?.targetRole ?? '—',
          careerMatches: careerMatches.slice(0, 3),
          recentTasks:   taskList.slice(0, 3),
          stats: {
            tasksFinished:     statsData?.tasksFinished ?? taskList.filter((t: any) => t.status === 'done').length,
            tasksTotal:        taskList.length,
            jobReadinessScore: statsData?.jobReadinessScore ?? 0,
          },
        });
      } finally {
        if (!cancelled) { setLoading(false); setTimeout(() => setMounted(true), 100); }
      }
    }

    load();
    return () => { cancelled = true; };
  }, [user]);

  const { roadmapPct, targetRole, careerMatches, recentTasks, stats } = data;
  const taskDonePct = stats.tasksTotal > 0 ? (stats.tasksFinished / stats.tasksTotal) * 100 : 0;

  const MATCH_COLORS = ['#a78bfa', '#5ef6e6', '#f59e0b'];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="page-subtitle">Here's an overview of your career progress today.</p>
        </div>
        <Link to="/app/roadmap" className="btn-page-action">
          View Roadmap <ArrowRight size={15} />
        </Link>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
          <Loader2 size={28} color="var(--primary)" style={{ animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-tile">
              <div className="stat-tile__icon" style={{ background: 'rgba(167,139,250,0.12)', color: '#a78bfa' }}><Compass size={18} /></div>
              <div className="stat-tile__body">
                <span className="stat-tile__label">Roadmap Progress</span>
                <span className="stat-tile__value">{roadmapPct}%</span>
              </div>
              <div className="stat-tile__bar"><div className="stat-tile__fill" style={{ width: mounted ? `${roadmapPct}%` : '0%', background: '#a78bfa' }} /></div>
            </div>

            <div className="stat-tile">
              <div className="stat-tile__icon" style={{ background: 'rgba(94,246,230,0.12)', color: '#5ef6e6' }}><ClipboardList size={18} /></div>
              <div className="stat-tile__body">
                <span className="stat-tile__label">Tasks Completed</span>
                <span className="stat-tile__value">{stats.tasksFinished} / {stats.tasksTotal}</span>
              </div>
              <div className="stat-tile__bar"><div className="stat-tile__fill" style={{ width: mounted ? `${taskDonePct}%` : '0%', background: '#5ef6e6' }} /></div>
            </div>

            <div className="stat-tile">
              <div className="stat-tile__icon" style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}><Award size={18} /></div>
              <div className="stat-tile__body">
                <span className="stat-tile__label">Job Readiness</span>
                <span className="stat-tile__value">{stats.jobReadinessScore}%</span>
              </div>
              <div className="stat-tile__bar"><div className="stat-tile__fill" style={{ width: mounted ? `${stats.jobReadinessScore}%` : '0%', background: '#f59e0b' }} /></div>
            </div>

            <div className="stat-tile">
              <div className="stat-tile__icon" style={{ background: 'rgba(52,211,153,0.12)', color: '#34d399' }}><TrendingUp size={18} /></div>
              <div className="stat-tile__body">
                <span className="stat-tile__label">Target Role</span>
                <span className="stat-tile__value" style={{ fontSize: '1rem', lineHeight: 1.3 }}>{targetRole}</span>
              </div>
            </div>
          </div>

          <div className="dashboard-grid">
            <div className="panel">
              <div className="panel__header">
                <div>
                  <h2 className="panel__title">Top Career Matches</h2>
                  <p className="panel__sub">Based on your assessment results</p>
                </div>
                {careerMatches.length > 0 && <CheckCircle2 size={16} color="#34d399" />}
              </div>
              {careerMatches.length === 0 ? (
                <div style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--on-surface-variant)', fontSize: '0.875rem' }}>
                  <p>No assessment yet.</p>
                  <Link to="/app/onboarding" className="panel-link" style={{ marginTop: '8px' }}>Complete your assessment <ArrowRight size={13} /></Link>
                </div>
              ) : (
                <div className="matches-list">
                  {careerMatches.map((m: any, i: number) => (
                    <div className="match-row" key={m.title}>
                      <div className="match-score" style={{ color: MATCH_COLORS[i], borderColor: `${MATCH_COLORS[i]}30`, background: `${MATCH_COLORS[i]}12` }}>
                        {m.matchScore}%
                      </div>
                      <div className="match-info">
                        <p className="match-name">{m.title}</p>
                        <p className="match-desc">{m.description}</p>
                      </div>
                      <ArrowRight size={15} color="var(--on-surface-variant)" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="dashboard-right">
              <div className="panel panel--accent">
                <div className="panel__header">
                  <Zap size={16} color="#f59e0b" />
                  <h2 className="panel__title">Target Role</h2>
                </div>
                <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--on-surface)', margin: '6px 0 10px' }}>{targetRole}</p>
                <Link to="/app/roadmap" className="panel-link">View your roadmap <ArrowRight size={13} /></Link>
              </div>

              <div className="panel">
                <div className="panel__header">
                  <div>
                    <h2 className="panel__title">Recent Tasks</h2>
                    <p className="panel__sub">{stats.tasksFinished} of {stats.tasksTotal} done</p>
                  </div>
                  <Clock size={15} color="var(--on-surface-variant)" />
                </div>
                {recentTasks.length === 0 ? (
                  <p style={{ fontSize: '0.82rem', color: 'var(--on-surface-variant)', padding: '12px 0' }}>No tasks yet — your roadmap will generate them.</p>
                ) : (
                  <div className="quick-tasks">
                    {recentTasks.map((t: any) => (
                      <div className={`quick-task${t.status === 'done' ? ' done' : ''}`} key={t.id}>
                        <div className={`quick-task__check${t.status === 'done' ? ' checked' : ''}`} />
                        <div className="quick-task__info">
                          <p className="quick-task__title">{t.title}</p>
                          <span className="quick-task__meta">{t.priority} priority</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <Link to="/app/tasks" className="panel-link">See all tasks <ArrowRight size={13} /></Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
