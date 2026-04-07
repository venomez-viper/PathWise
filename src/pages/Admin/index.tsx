import { useState, useEffect, useMemo } from 'react';
import {
  Shield, Users, Trash2, Search, BarChart3, CheckCircle2, AlertTriangle,
  X, Download, ExternalLink, Copy, Monitor, ChevronDown, MessageSquare,
} from 'lucide-react';
import { useAuth } from '../../lib/auth-context';
import { admin as adminApi } from '../../lib/api';

const ADMIN_EMAIL = 'akashagakash@gmail.com';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  plan: string;
  createdAt: string;
  avatarUrl?: string;
  oauthProviders?: string[];
}

interface TaskStat {
  userId: string;
  total: number;
  completed: number;
}

interface UserDetail {
  id: string;
  name: string;
  email: string;
  plan: string;
  createdAt: string;
  avatarUrl?: string;
  oauthProviders?: string[];
  assessment?: { topCareer?: string; score?: number } | null;
  taskStats?: { total: number; completed: number } | null;
}

type SortKey = 'name' | 'email' | 'plan' | 'createdAt' | 'assessment' | 'tasks';
type SortDir = 'asc' | 'desc';
type TabKey = 'users' | 'analytics' | 'system' | 'tickets';

/* ─────────── User Detail Panel ─────────── */

function UserDetailPanel({
  user,
  taskStat,
  hasAssessment,
  onClose,
  onPlanChange,
  onDelete,
}: {
  user: AdminUser;
  taskStat?: TaskStat;
  hasAssessment: boolean;
  onClose: () => void;
  onPlanChange: (userId: string, plan: string) => void;
  onDelete: (user: AdminUser) => void;
}) {
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [impersonating, setImpersonating] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const isAdmin = user.email === ADMIN_EMAIL;

  useEffect(() => {
    setLoadingDetail(true);
    Promise.allSettled([
      adminApi.getUserDetail(user.id),
      adminApi.getAssessment(user.id),
    ]).then(([detailRes, assessRes]) => {
      const d = detailRes.status === 'fulfilled' ? detailRes.value : null;
      const a = assessRes.status === 'fulfilled' ? assessRes.value : null;
      setDetail({
        ...user,
        ...(d ?? {}),
        assessment: a ?? null,
        taskStats: taskStat ? { total: taskStat.total, completed: taskStat.completed } : null,
      });
    }).finally(() => setLoadingDetail(false));
  }, [user.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleImpersonate = async () => {
    setImpersonating(true);
    try {
      const res = await adminApi.impersonate(user.id);
      await navigator.clipboard.writeText(res.token);
      showToast(`Token copied! Open incognito, paste in console: localStorage.setItem('pathwise_token', '${res.token.slice(0, 8)}...'); then refresh.`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Impersonate failed');
    } finally {
      setImpersonating(false);
    }
  };

  const handleTogglePlan = () => {
    const newPlan = user.plan === 'premium' ? 'free' : 'premium';
    onPlanChange(user.id, newPlan);
  };

  const initials = user.name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const completionRate = taskStat && taskStat.total > 0
    ? Math.round((taskStat.completed / taskStat.total) * 100)
    : 0;

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }); }
    catch { return d; }
  };

  const authMethods: string[] = [];
  if (detail?.oauthProviders?.includes('google')) authMethods.push('Google');
  if (detail?.oauthProviders?.includes('apple')) authMethods.push('Apple');
  if (!detail?.oauthProviders?.length || detail.oauthProviders.length === 0) authMethods.push('Password');

  const sectionLabel: React.CSSProperties = {
    fontSize: '0.65rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: 'var(--on-surface-variant)',
    marginBottom: '0.5rem',
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 999,
          background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(2px)',
          animation: 'fadeIn 0.2s ease',
        }}
      />
      {/* Panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 480, maxWidth: '100vw',
        zIndex: 1000, background: 'var(--surface)', borderLeft: '1px solid var(--outline-variant)',
        boxShadow: '-8px 0 32px rgba(0,0,0,0.12)', overflowY: 'auto',
        animation: 'slideInRight 0.25s ease',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--outline-variant)' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', margin: 0 }}>User Detail</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-variant)', padding: 4, borderRadius: '50%' }}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem' }}>
          {/* Avatar + name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: '1.5rem' }}>
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="" style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{
                width: 56, height: 56, borderRadius: '50%', background: 'var(--primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 700, fontSize: '1.1rem', fontFamily: 'var(--font-display)',
              }}>
                {initials}
              </div>
            )}
            <div>
              <p style={{ fontWeight: 700, fontSize: '1.1rem', margin: 0, fontFamily: 'var(--font-display)' }}>{user.name}</p>
              <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.85rem', margin: 0 }}>{user.email}</p>
              {isAdmin && <span style={{ fontSize: '0.65rem', background: 'var(--primary)', color: '#fff', padding: '2px 8px', borderRadius: '999px', fontWeight: 700, marginTop: 4, display: 'inline-block' }}>Admin</span>}
            </div>
          </div>

          {/* Plan toggle */}
          <div style={{ marginBottom: '1.25rem' }}>
            <p style={sectionLabel}>Plan</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{
                display: 'inline-block', padding: '3px 12px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 700,
                background: user.plan === 'premium' ? '#fbbf2418' : 'var(--surface-container)',
                color: user.plan === 'premium' ? '#b8860b' : 'var(--on-surface-variant)',
                border: user.plan === 'premium' ? '1px solid #fbbf2444' : '1px solid var(--outline-variant)',
              }}>
                {user.plan === 'premium' ? 'Premium' : 'Free'}
              </span>
              {!isAdmin && (
                <button
                  onClick={handleTogglePlan}
                  style={{
                    background: 'none', border: '1px solid var(--outline-variant)', borderRadius: '999px',
                    padding: '4px 12px', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer',
                    color: 'var(--primary)',
                  }}
                >
                  Switch to {user.plan === 'premium' ? 'Free' : 'Premium'}
                </button>
              )}
            </div>
          </div>

          {/* Signup date */}
          <div style={{ marginBottom: '1.25rem' }}>
            <p style={sectionLabel}>Signed Up</p>
            <p style={{ fontSize: '0.85rem', margin: 0, color: 'var(--on-surface)' }}>{formatDate(user.createdAt)}</p>
          </div>

          {/* Auth method */}
          <div style={{ marginBottom: '1.25rem' }}>
            <p style={sectionLabel}>Auth Method</p>
            <div style={{ display: 'flex', gap: 6 }}>
              {authMethods.map(m => (
                <span key={m} style={{
                  padding: '3px 10px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 600,
                  background: 'var(--surface-container)', border: '1px solid var(--outline-variant)',
                  color: 'var(--on-surface-variant)',
                }}>{m}</span>
              ))}
            </div>
          </div>

          {/* Assessment */}
          <div style={{ marginBottom: '1.25rem' }}>
            <p style={sectionLabel}>Assessment</p>
            {loadingDetail ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)', margin: 0 }}>Loading...</p>
            ) : detail?.assessment?.topCareer ? (
              <div style={{ background: 'var(--surface-container)', borderRadius: '1rem', padding: '0.75rem 1rem' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, margin: '0 0 4px' }}>{detail.assessment.topCareer}</p>
                {detail.assessment.score != null && (
                  <p style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)', margin: 0 }}>Score: {detail.assessment.score}%</p>
                )}
              </div>
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)', margin: 0 }}>
                {hasAssessment ? 'Assessment taken (details unavailable)' : 'No assessment yet'}
              </p>
            )}
          </div>

          {/* Task stats */}
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={sectionLabel}>Tasks</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              <div style={{ background: 'var(--surface-container)', borderRadius: '1rem', padding: '0.75rem', textAlign: 'center' }}>
                <p style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, fontFamily: 'var(--font-display)' }}>{taskStat?.total ?? 0}</p>
                <p style={{ fontSize: '0.65rem', color: 'var(--on-surface-variant)', margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total</p>
              </div>
              <div style={{ background: 'var(--surface-container)', borderRadius: '1rem', padding: '0.75rem', textAlign: 'center' }}>
                <p style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, fontFamily: 'var(--font-display)', color: '#22c55e' }}>{taskStat?.completed ?? 0}</p>
                <p style={{ fontSize: '0.65rem', color: 'var(--on-surface-variant)', margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Done</p>
              </div>
              <div style={{ background: 'var(--surface-container)', borderRadius: '1rem', padding: '0.75rem', textAlign: 'center' }}>
                <p style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, fontFamily: 'var(--font-display)', color: 'var(--primary)' }}>{completionRate}%</p>
                <p style={{ fontSize: '0.65rem', color: 'var(--on-surface-variant)', margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rate</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          {!isAdmin && (
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={handleImpersonate}
                disabled={impersonating}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '0.6rem', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 600,
                  background: 'var(--primary)', color: '#fff', border: 'none', cursor: 'pointer',
                  opacity: impersonating ? 0.6 : 1,
                }}
              >
                <Copy size={14} />
                {impersonating ? 'Copying...' : 'Impersonate'}
              </button>
              <button
                onClick={() => onDelete(user)}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '0.6rem', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 600,
                  background: 'none', color: '#ef4444', border: '1px solid #ef444444', cursor: 'pointer',
                }}
              >
                <Trash2 size={14} />
                Delete User
              </button>
            </div>
          )}
        </div>

        {/* Toast */}
        {toastMsg && (
          <div style={{
            position: 'fixed', bottom: 24, right: 24, zIndex: 1001,
            background: 'var(--on-surface)', color: 'var(--surface)', padding: '0.75rem 1.25rem',
            borderRadius: '1rem', fontSize: '0.8rem', maxWidth: 400, boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            animation: 'fadeIn 0.2s ease',
          }}>
            {toastMsg}
          </div>
        )}
      </div>
    </>
  );
}

/* ─────────── Main Admin Page ─────────── */

export default function AdminPage() {
  const { user } = useAuth();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [taskStats, setTaskStats] = useState<TaskStat[]>([]);
  const [assessmentUserIds, setAssessmentUserIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [activeTab, setActiveTab] = useState<TabKey>('users');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkPlanOpen, setBulkPlanOpen] = useState(false);

  // Analytics
  const [analytics, setAnalytics] = useState<{ totalAssessments: number; topCareers: { title: string; count: number }[] } | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Tickets
  const [ticketsList, setTicketsList] = useState<any[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);

  useEffect(() => {
    if (user?.email !== ADMIN_EMAIL) return;
    loadData();
  }, [user]);

  useEffect(() => {
    if (activeTab === 'analytics' && !analytics) {
      loadAnalytics();
    }
    if (activeTab === 'tickets') {
      loadTickets();
    }
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [usersRes, tasksRes, assessRes] = await Promise.allSettled([
        adminApi.getUsers(),
        adminApi.getTaskStats(),
        adminApi.getAssessmentStats(),
      ]);
      if (usersRes.status === 'fulfilled') setUsers(usersRes.value?.users ?? []);
      else throw new Error(usersRes.reason?.message || 'Failed to load users');
      if (tasksRes.status === 'fulfilled') setTaskStats(tasksRes.value?.stats ?? []);
      if (assessRes.status === 'fulfilled') setAssessmentUserIds(assessRes.value?.userIds ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load admin data.');
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const res = await adminApi.getAnalytics();
      setAnalytics(res);
    } catch {
      setAnalytics({ totalAssessments: 0, topCareers: [] });
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const loadTickets = async () => {
    setTicketsLoading(true);
    try {
      const res = await adminApi.getTickets();
      setTicketsList(res?.tickets ?? []);
    } catch {}
    finally { setTicketsLoading(false); }
  };

  const handleTicketStatusChange = async (ticketId: string, status: string) => {
    try {
      await adminApi.updateTicket(ticketId, status);
      setTicketsList(prev => prev.map(t => t.id === ticketId ? { ...t, status } : t));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update ticket status.');
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    if (!window.confirm('Delete this ticket permanently?')) return;
    try {
      await adminApi.deleteTicket(ticketId);
      setTicketsList(prev => prev.filter(t => t.id !== ticketId));
      if (expandedTicket === ticketId) setExpandedTicket(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete ticket.');
    }
  };

  const statusColors: Record<string, { bg: string; color: string }> = {
    open: { bg: '#fee2e2', color: '#dc2626' },
    in_progress: { bg: '#fef3c7', color: '#d97706' },
    closed: { bg: '#dcfce7', color: '#16a34a' },
  };

  const taskStatsMap = useMemo(() => {
    const map: Record<string, TaskStat> = {};
    (taskStats ?? []).forEach(s => { if (s?.userId) map[s.userId] = s; });
    return map;
  }, [taskStats]);

  const assessmentSet = useMemo(() => new Set(assessmentUserIds ?? []), [assessmentUserIds]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const filteredUsers = useMemo(() => {
    let list = users ?? [];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }
    list = [...list].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'name': cmp = a.name.localeCompare(b.name); break;
        case 'email': cmp = a.email.localeCompare(b.email); break;
        case 'plan': cmp = a.plan.localeCompare(b.plan); break;
        case 'createdAt': cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(); break;
        case 'assessment': cmp = (assessmentSet.has(a.id) ? 1 : 0) - (assessmentSet.has(b.id) ? 1 : 0); break;
        case 'tasks': {
          const ta = taskStatsMap[a.id]?.completed ?? 0;
          const tb = taskStatsMap[b.id]?.completed ?? 0;
          cmp = ta - tb;
          break;
        }
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [users, search, sortKey, sortDir, assessmentSet, taskStatsMap]);

  const handleDelete = async (u: AdminUser) => {
    if (u.email === ADMIN_EMAIL) return;
    if (!window.confirm(`Delete user ${u.name} (${u.email})? This removes all their data permanently.`)) return;
    try {
      await adminApi.deleteUser(u.id);
      setUsers(prev => prev.filter(x => x.id !== u.id));
      setSelectedIds(prev => { const n = new Set(prev); n.delete(u.id); return n; });
      if (selectedUser?.id === u.id) setSelectedUser(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed.');
    }
  };

  const handleBulkDelete = async () => {
    const ids = [...selectedIds].filter(id => {
      const u = users.find(x => x.id === id);
      return u && u.email !== ADMIN_EMAIL;
    });
    if (ids.length === 0) return;
    if (!window.confirm(`Delete ${ids.length} user${ids.length > 1 ? 's' : ''}? This is permanent.`)) return;
    try {
      await Promise.all(ids.map(id => adminApi.deleteUser(id)));
      setUsers(prev => prev.filter(x => !ids.includes(x.id)));
      setSelectedIds(new Set());
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Bulk delete failed.');
      loadData();
    }
  };

  const handleBulkPlanChange = async (plan: string) => {
    const ids = [...selectedIds].filter(id => {
      const u = users.find(x => x.id === id);
      return u && u.email !== ADMIN_EMAIL;
    });
    if (ids.length === 0) return;
    try {
      await Promise.all(ids.map(id => adminApi.updatePlan(id, plan)));
      setUsers(prev => prev.map(u => ids.includes(u.id) ? { ...u, plan } : u));
      setSelectedIds(new Set());
      setBulkPlanOpen(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Bulk plan change failed.');
    }
  };

  const handlePlanChange = async (userId: string, plan: string) => {
    try {
      await adminApi.updatePlan(userId, plan);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, plan } : u));
      if (selectedUser?.id === userId) setSelectedUser(prev => prev ? { ...prev, plan } : null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Plan change failed.');
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredUsers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredUsers.map(u => u.id)));
    }
  };

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Plan', 'Joined', 'Has Assessment', 'Tasks Done', 'Tasks Total'];
    const rows = filteredUsers.map(u => [
      u.name, u.email, u.plan, u.createdAt,
      assessmentSet.has(u.id) ? 'Yes' : 'No',
      taskStatsMap[u.id]?.completed ?? 0,
      taskStatsMap[u.id]?.total ?? 0,
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `pathwise-users-${new Date().toISOString().split('T')[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  // Stats
  const totalUsers = users?.length ?? 0;
  const withAssessment = assessmentUserIds?.length ?? 0;
  const totalTasks = (taskStats ?? []).reduce((s, t) => s + (t?.total ?? 0), 0);
  const completedTasks = (taskStats ?? []).reduce((s, t) => s + (t?.completed ?? 0), 0);

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
    catch { return d; }
  };

  // Access guard
  if (user?.email !== ADMIN_EMAIL) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <Shield size={48} color="var(--on-surface-muted)" />
          <h2 style={{ marginTop: '1rem', fontFamily: 'var(--font-display)' }}>Access Denied</h2>
          <p style={{ color: 'var(--on-surface-variant)' }}>Admin access required.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ width: 32, height: 32, border: '3px solid rgba(98,69,164,0.2)', borderTopColor: '#6245a4', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <AlertTriangle size={48} color="#ef4444" />
          <h2 style={{ marginTop: '1rem', fontFamily: 'var(--font-display)' }}>Error</h2>
          <p style={{ color: 'var(--on-surface-variant)', marginBottom: '1rem' }}>{error}</p>
          <button className="btn-page-action" onClick={loadData}>Retry</button>
        </div>
      </div>
    );
  }

  const sortArrow = (key: SortKey) => sortKey === key ? (sortDir === 'asc' ? ' \u25B2' : ' \u25BC') : '';

  const thStyle: React.CSSProperties = {
    padding: '0.75rem 1rem',
    textAlign: 'left',
    fontSize: '0.7rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: 'var(--on-surface-variant)',
    cursor: 'pointer',
    userSelect: 'none',
    borderBottom: '1px solid var(--outline-variant)',
    whiteSpace: 'nowrap',
  };

  const tdStyle: React.CSSProperties = {
    padding: '0.75rem 1rem',
    fontSize: '0.85rem',
    color: 'var(--on-surface)',
    borderBottom: '1px solid var(--outline-variant)',
  };

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '0.5rem 1.25rem',
    borderRadius: '999px',
    fontSize: '0.8rem',
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
    background: active ? 'var(--primary)' : 'var(--surface-container)',
    color: active ? '#fff' : 'var(--on-surface-variant)',
    transition: 'all 0.15s',
  });

  return (
    <div className="page">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Shield size={28} color="var(--primary)" />
          <h1 className="page-title">Admin Dashboard</h1>
        </div>
        {activeTab === 'users' && (
          <button
            onClick={exportCSV}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '0.5rem 1rem',
              borderRadius: '999px', fontSize: '0.78rem', fontWeight: 600,
              background: 'var(--surface-container)', border: '1px solid var(--outline-variant)',
              color: 'var(--on-surface)', cursor: 'pointer',
            }}
          >
            <Download size={14} />
            Export CSV
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem' }}>
        <button style={tabStyle(activeTab === 'users')} onClick={() => setActiveTab('users')}>
          <Users size={14} style={{ verticalAlign: '-2px', marginRight: 6 }} />Users
        </button>
        <button style={tabStyle(activeTab === 'analytics')} onClick={() => setActiveTab('analytics')}>
          <BarChart3 size={14} style={{ verticalAlign: '-2px', marginRight: 6 }} />Analytics
        </button>
        <button style={tabStyle(activeTab === 'system')} onClick={() => setActiveTab('system')}>
          <Monitor size={14} style={{ verticalAlign: '-2px', marginRight: 6 }} />System
        </button>
        <button style={tabStyle(activeTab === 'tickets')} onClick={() => setActiveTab('tickets')}>
          <MessageSquare size={14} style={{ verticalAlign: '-2px', marginRight: 6 }} />Tickets{ticketsList.length > 0 ? ` (${ticketsList.length})` : ''}
        </button>
      </div>

      {/* ─── Users Tab ─── */}
      {activeTab === 'users' && (
        <>
          {/* Stats cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            {[
              { label: 'Total Users', value: totalUsers, icon: Users, color: 'var(--primary)' },
              { label: 'With Assessment', value: withAssessment, icon: CheckCircle2, color: '#22c55e' },
              { label: 'Total Tasks', value: totalTasks, icon: BarChart3, color: '#3b82f6' },
              { label: 'Completed Tasks', value: completedTasks, icon: CheckCircle2, color: '#8b5cf6' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="panel" style={{ borderRadius: '2rem', padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.75rem' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={18} color={color} />
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--on-surface-variant)' }}>{label}</span>
                </div>
                <p style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--on-surface)', letterSpacing: '-0.02em' }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Search + bulk toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', maxWidth: 400, flex: 1 }}>
              <Search size={16} color="var(--on-surface-variant)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                style={{
                  width: '100%',
                  padding: '0.65rem 0.75rem 0.65rem 2.5rem',
                  borderRadius: '999px',
                  border: '1px solid var(--outline-variant)',
                  background: 'var(--surface-container)',
                  color: 'var(--on-surface)',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              />
            </div>

            {/* Bulk actions toolbar */}
            {selectedIds.size > 0 && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '0.4rem 1rem',
                background: 'var(--surface-container)', borderRadius: '999px',
                border: '1px solid var(--outline-variant)',
              }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--on-surface)' }}>
                  {selectedIds.size} selected
                </span>
                <button
                  onClick={handleBulkDelete}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4, padding: '4px 12px',
                    borderRadius: '999px', fontSize: '0.72rem', fontWeight: 600,
                    background: 'none', border: '1px solid #ef444444', color: '#ef4444', cursor: 'pointer',
                  }}
                >
                  <Trash2 size={12} />
                  Delete
                </button>
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setBulkPlanOpen(!bulkPlanOpen)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4, padding: '4px 12px',
                      borderRadius: '999px', fontSize: '0.72rem', fontWeight: 600,
                      background: 'none', border: '1px solid var(--outline-variant)', color: 'var(--on-surface)', cursor: 'pointer',
                    }}
                  >
                    Change Plan
                    <ChevronDown size={12} />
                  </button>
                  {bulkPlanOpen && (
                    <div style={{
                      position: 'absolute', top: '100%', left: 0, marginTop: 4, zIndex: 50,
                      background: 'var(--surface)', borderRadius: '0.75rem', border: '1px solid var(--outline-variant)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflow: 'hidden', minWidth: 120,
                    }}>
                      <button onClick={() => handleBulkPlanChange('free')} style={{ display: 'block', width: '100%', padding: '0.5rem 1rem', border: 'none', background: 'none', textAlign: 'left', fontSize: '0.8rem', cursor: 'pointer', color: 'var(--on-surface)' }}>Free</button>
                      <button onClick={() => handleBulkPlanChange('premium')} style={{ display: 'block', width: '100%', padding: '0.5rem 1rem', border: 'none', background: 'none', textAlign: 'left', fontSize: '0.8rem', cursor: 'pointer', color: '#b8860b' }}>Premium</button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Users table */}
          <div className="panel" style={{ borderRadius: '2rem', padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ ...thStyle, cursor: 'default', width: 40 }}>
                    <input
                      type="checkbox"
                      checked={filteredUsers.length > 0 && selectedIds.size === filteredUsers.length}
                      onChange={toggleSelectAll}
                      style={{ cursor: 'pointer', accentColor: 'var(--primary)' }}
                    />
                  </th>
                  <th style={thStyle} onClick={() => handleSort('name')}>Name{sortArrow('name')}</th>
                  <th style={thStyle} onClick={() => handleSort('email')}>Email{sortArrow('email')}</th>
                  <th style={thStyle} onClick={() => handleSort('plan')}>Plan{sortArrow('plan')}</th>
                  <th style={thStyle} onClick={() => handleSort('createdAt')}>Joined{sortArrow('createdAt')}</th>
                  <th style={thStyle} onClick={() => handleSort('assessment')}>Assessment{sortArrow('assessment')}</th>
                  <th style={thStyle} onClick={() => handleSort('tasks')}>Tasks{sortArrow('tasks')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u, idx) => {
                  const isAdmin = u.email === ADMIN_EMAIL;
                  const ts = taskStatsMap[u.id];
                  const hasAssessment = assessmentSet.has(u.id);
                  const isSelected = selectedIds.has(u.id);
                  return (
                    <tr
                      key={u.id}
                      onClick={() => setSelectedUser(u)}
                      style={{
                        background: isSelected
                          ? 'rgba(98,69,164,0.08)'
                          : isAdmin
                            ? 'rgba(98,69,164,0.06)'
                            : idx % 2 === 0
                              ? 'transparent'
                              : 'var(--surface-container)',
                        transition: 'background 0.15s',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={e => { if (!isAdmin && !isSelected) (e.currentTarget.style.background = 'var(--surface-container-high)'); }}
                      onMouseLeave={e => {
                        if (!isAdmin && !isSelected) (e.currentTarget.style.background = idx % 2 === 0 ? 'transparent' : 'var(--surface-container)');
                        if (isSelected) (e.currentTarget.style.background = 'rgba(98,69,164,0.08)');
                      }}
                    >
                      <td style={{ ...tdStyle, width: 40 }} onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(u.id)}
                          style={{ cursor: 'pointer', accentColor: 'var(--primary)' }}
                        />
                      </td>
                      <td style={tdStyle}>
                        <span style={{ fontWeight: 600 }}>{u.name}</span>
                        {isAdmin && <span style={{ marginLeft: 8, fontSize: '0.65rem', background: 'var(--primary)', color: '#fff', padding: '2px 8px', borderRadius: '999px', fontWeight: 700 }}>Admin</span>}
                      </td>
                      <td style={{ ...tdStyle, color: 'var(--on-surface-variant)' }}>{u.email}</td>
                      <td style={tdStyle}>
                        <span style={{
                          display: 'inline-block',
                          padding: '2px 10px',
                          borderRadius: '999px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          background: u.plan === 'premium' ? '#fbbf2418' : 'var(--surface-container)',
                          color: u.plan === 'premium' ? '#b8860b' : 'var(--on-surface-variant)',
                          border: u.plan === 'premium' ? '1px solid #fbbf2444' : '1px solid var(--outline-variant)',
                        }}>
                          {u.plan === 'premium' ? 'Premium' : 'Free'}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, color: 'var(--on-surface-variant)', fontSize: '0.8rem' }}>{formatDate(u.createdAt)}</td>
                      <td style={tdStyle}>
                        {hasAssessment
                          ? <CheckCircle2 size={16} color="#22c55e" />
                          : <span style={{ color: 'var(--on-surface-variant)' }}>&mdash;</span>
                        }
                      </td>
                      <td style={{ ...tdStyle, fontSize: '0.8rem' }}>
                        {ts ? `${ts.completed}/${ts.total} done` : '0/0 done'}
                      </td>
                    </tr>
                  );
                })}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ ...tdStyle, textAlign: 'center', padding: '2rem', color: 'var(--on-surface-variant)' }}>
                      {search ? 'No users match your search.' : 'No users found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ─── Analytics Tab ─── */}
      {activeTab === 'analytics' && (
        <div>
          {analyticsLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
              <div style={{ width: 32, height: 32, border: '3px solid rgba(98,69,164,0.2)', borderTopColor: '#6245a4', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
          ) : (
            <>
              {/* Total assessments card */}
              <div className="panel" style={{ borderRadius: '2rem', padding: '1.5rem', marginBottom: '1.5rem', maxWidth: 300 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.75rem' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#22c55e18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle2 size={18} color="#22c55e" />
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--on-surface-variant)' }}>Total Assessments</span>
                </div>
                <p style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--on-surface)', letterSpacing: '-0.02em' }}>
                  {analytics?.totalAssessments ?? withAssessment}
                </p>
              </div>

              {/* Top careers bar chart */}
              <div className="panel" style={{ borderRadius: '2rem', padding: '1.5rem' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: '1.25rem', color: 'var(--on-surface)' }}>
                  Top 10 Career Matches
                </h3>
                {(!analytics?.topCareers || analytics.topCareers.length === 0) ? (
                  <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.85rem' }}>No career data available yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {analytics.topCareers.slice(0, 10).map((career, i) => {
                      const max = analytics.topCareers[0].count;
                      const pct = max > 0 ? (career.count / max) * 100 : 0;
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--on-surface)', minWidth: 200, flexShrink: 0 }}>
                            {career.title}
                          </span>
                          <div style={{ flex: 1, height: 24, background: 'var(--surface-container)', borderRadius: '999px', overflow: 'hidden' }}>
                            <div style={{
                              width: `${pct}%`, height: '100%', borderRadius: '999px',
                              background: 'linear-gradient(90deg, var(--primary), #8b5cf6)',
                              transition: 'width 0.5s ease',
                              minWidth: pct > 0 ? 24 : 0,
                            }} />
                          </div>
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--on-surface-variant)', minWidth: 32, textAlign: 'right' }}>
                            {career.count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* ─── System Tab ─── */}
      {activeTab === 'system' && (
        <div>
          {/* System stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            {[
              { label: 'Total Users', value: totalUsers },
              { label: 'Total Assessments', value: withAssessment },
              { label: 'Total Tasks', value: totalTasks },
              { label: 'Completed Tasks', value: completedTasks },
            ].map(({ label, value }) => (
              <div key={label} className="panel" style={{ borderRadius: '2rem', padding: '1.5rem', textAlign: 'center' }}>
                <p style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--on-surface)', letterSpacing: '-0.02em', margin: '0 0 0.25rem' }}>{value}</p>
                <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--on-surface-variant)', margin: 0 }}>{label}</p>
              </div>
            ))}
          </div>

          {/* Platform info */}
          <div className="panel" style={{ borderRadius: '2rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: '1rem', color: 'var(--on-surface)' }}>
              Platform
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              {[
                { label: 'Backend', value: 'Encore.dev', color: '#3b82f6' },
                { label: 'Frontend', value: 'Vercel', color: '#000' },
                { label: 'Database', value: 'PostgreSQL', color: '#336791' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{
                  background: 'var(--surface-container)', borderRadius: '1rem', padding: '1rem',
                  display: 'flex', flexDirection: 'column', gap: 4,
                }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--on-surface-variant)' }}>{label}</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div className="panel" style={{ borderRadius: '2rem', padding: '1.5rem' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: '1rem', color: 'var(--on-surface)' }}>
              Quick Links
            </h3>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {[
                { label: 'Encore Dashboard', url: 'https://app.encore.dev' },
                { label: 'Vercel Dashboard', url: 'https://vercel.com/dashboard' },
                { label: 'GitHub Repo', url: 'https://github.com' },
              ].map(({ label, url }) => (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '0.5rem 1rem',
                    borderRadius: '999px', fontSize: '0.78rem', fontWeight: 600,
                    background: 'var(--surface-container)', border: '1px solid var(--outline-variant)',
                    color: 'var(--primary)', textDecoration: 'none',
                  }}
                >
                  <ExternalLink size={14} />
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── Tickets Tab ─── */}
      {activeTab === 'tickets' && (
        <div>
          {ticketsLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
              <div style={{ width: 32, height: 32, border: '3px solid rgba(98,69,164,0.2)', borderTopColor: '#6245a4', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
          ) : ticketsList.length === 0 ? (
            <div className="panel" style={{ borderRadius: '2rem', padding: '3rem', textAlign: 'center' }}>
              <MessageSquare size={40} color="var(--on-surface-variant)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.9rem' }}>No tickets yet.</p>
            </div>
          ) : (
            <div className="panel" style={{ borderRadius: '2rem', padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Name</th>
                    <th style={thStyle}>Email</th>
                    <th style={thStyle}>Subject</th>
                    <th style={thStyle}>Date</th>
                    <th style={{ ...thStyle, cursor: 'default' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ticketsList.map((ticket: any, idx: number) => {
                    const sc = statusColors[ticket.status] ?? statusColors.open;
                    const isExpanded = expandedTicket === ticket.id;
                    return (
                      <>
                        <tr
                          key={ticket.id}
                          onClick={() => setExpandedTicket(isExpanded ? null : ticket.id)}
                          style={{
                            background: idx % 2 === 0 ? 'transparent' : 'var(--surface-container)',
                            cursor: 'pointer',
                            transition: 'background 0.15s',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-container-high)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = idx % 2 === 0 ? 'transparent' : 'var(--surface-container)'; }}
                        >
                          <td style={tdStyle}>
                            <span style={{
                              display: 'inline-block', padding: '2px 10px', borderRadius: '999px',
                              fontSize: '0.72rem', fontWeight: 700,
                              background: sc.bg, color: sc.color,
                            }}>
                              {(ticket.status ?? 'open').replace('_', ' ')}
                            </span>
                          </td>
                          <td style={{ ...tdStyle, fontWeight: 600 }}>{ticket.name || '--'}</td>
                          <td style={{ ...tdStyle, color: 'var(--on-surface-variant)' }}>{ticket.email}</td>
                          <td style={{ ...tdStyle, color: 'var(--on-surface-variant)' }}>{ticket.subject || '--'}</td>
                          <td style={{ ...tdStyle, color: 'var(--on-surface-variant)', fontSize: '0.8rem' }}>
                            {ticket.createdAt ? formatDate(ticket.createdAt) : '--'}
                          </td>
                          <td style={tdStyle} onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <select
                                value={ticket.status ?? 'open'}
                                onChange={e => handleTicketStatusChange(ticket.id, e.target.value)}
                                style={{
                                  padding: '4px 8px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 600,
                                  border: '1px solid var(--outline-variant)', background: 'var(--surface-container)',
                                  color: 'var(--on-surface)', cursor: 'pointer', outline: 'none',
                                }}
                              >
                                <option value="open">Open</option>
                                <option value="in_progress">In Progress</option>
                                <option value="closed">Closed</option>
                              </select>
                              <button
                                onClick={() => handleDeleteTicket(ticket.id)}
                                style={{
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  width: 28, height: 28, borderRadius: '50%',
                                  background: 'none', border: '1px solid #ef444444', color: '#ef4444',
                                  cursor: 'pointer', padding: 0,
                                }}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr key={`${ticket.id}-msg`}>
                            <td colSpan={6} style={{
                              padding: '1rem 1.5rem', background: 'var(--surface-container-low)',
                              borderBottom: '1px solid var(--outline-variant)',
                            }}>
                              <p style={{
                                fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
                                letterSpacing: '0.08em', color: 'var(--on-surface-variant)', marginBottom: '0.5rem',
                              }}>
                                Message
                              </p>
                              <p style={{
                                fontSize: '0.85rem', color: 'var(--on-surface)', lineHeight: 1.6,
                                whiteSpace: 'pre-wrap', margin: 0,
                              }}>
                                {ticket.message}
                              </p>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* User Detail Panel */}
      {selectedUser && (
        <UserDetailPanel
          user={selectedUser}
          taskStat={taskStatsMap[selectedUser.id]}
          hasAssessment={assessmentSet.has(selectedUser.id)}
          onClose={() => setSelectedUser(null)}
          onPlanChange={handlePlanChange}
          onDelete={handleDelete}
        />
      )}

      {/* Inline animation keyframes */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
      `}</style>
    </div>
  );
}
