import { useState, useEffect, useMemo } from 'react';
import { Shield, Users, Trash2, Search, BarChart3, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../lib/auth-context';
import { admin as adminApi } from '../../lib/api';

const ADMIN_EMAIL = 'akashagakash@gmail.com';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  plan: string;
  createdAt: string;
}

interface TaskStat {
  userId: string;
  total: number;
  completed: number;
}

type SortKey = 'name' | 'email' | 'plan' | 'createdAt' | 'assessment' | 'tasks';
type SortDir = 'asc' | 'desc';

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

  useEffect(() => {
    if (user?.email !== ADMIN_EMAIL) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [usersRes, tasksRes, assessRes] = await Promise.all([
        adminApi.getUsers(),
        adminApi.getTaskStats(),
        adminApi.getAssessmentStats(),
      ]);
      setUsers(usersRes.users);
      setTaskStats(tasksRes.stats);
      setAssessmentUserIds(assessRes.userIds);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load admin data.');
    } finally {
      setLoading(false);
    }
  };

  const taskStatsMap = useMemo(() => {
    const map: Record<string, TaskStat> = {};
    taskStats.forEach(s => { map[s.userId] = s; });
    return map;
  }, [taskStats]);

  const assessmentSet = useMemo(() => new Set(assessmentUserIds), [assessmentUserIds]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const filteredUsers = useMemo(() => {
    let list = users;
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
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed.');
    }
  };

  // Stats
  const totalUsers = users.length;
  const withAssessment = assessmentUserIds.length;
  const totalTasks = taskStats.reduce((s, t) => s + t.total, 0);
  const completedTasks = taskStats.reduce((s, t) => s + t.completed, 0);

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

  return (
    <div className="page">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Shield size={28} color="var(--primary)" />
          <h1 className="page-title">Admin Dashboard</h1>
        </div>
      </div>

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

      {/* Search */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ position: 'relative', maxWidth: 400 }}>
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
      </div>

      {/* Users table */}
      <div className="panel" style={{ borderRadius: '2rem', padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle} onClick={() => handleSort('name')}>Name{sortArrow('name')}</th>
              <th style={thStyle} onClick={() => handleSort('email')}>Email{sortArrow('email')}</th>
              <th style={thStyle} onClick={() => handleSort('plan')}>Plan{sortArrow('plan')}</th>
              <th style={thStyle} onClick={() => handleSort('createdAt')}>Joined{sortArrow('createdAt')}</th>
              <th style={thStyle} onClick={() => handleSort('assessment')}>Assessment{sortArrow('assessment')}</th>
              <th style={thStyle} onClick={() => handleSort('tasks')}>Tasks{sortArrow('tasks')}</th>
              <th style={{ ...thStyle, cursor: 'default' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u, idx) => {
              const isAdmin = u.email === ADMIN_EMAIL;
              const ts = taskStatsMap[u.id];
              const hasAssessment = assessmentSet.has(u.id);
              return (
                <tr
                  key={u.id}
                  style={{
                    background: isAdmin
                      ? 'rgba(98,69,164,0.06)'
                      : idx % 2 === 0
                        ? 'transparent'
                        : 'var(--surface-container)',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => { if (!isAdmin) (e.currentTarget.style.background = 'var(--surface-container-high)'); }}
                  onMouseLeave={e => { if (!isAdmin) (e.currentTarget.style.background = idx % 2 === 0 ? 'transparent' : 'var(--surface-container)'); }}
                >
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
                  <td style={tdStyle}>
                    {isAdmin ? (
                      <span style={{ fontSize: '0.72rem', color: 'var(--on-surface-variant)' }}>&mdash;</span>
                    ) : (
                      <button
                        onClick={() => handleDelete(u)}
                        style={{
                          background: 'none',
                          border: '1px solid #ef444444',
                          borderRadius: '999px',
                          padding: '4px 10px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          color: '#ef4444',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#ef444412')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                      >
                        <Trash2 size={13} />
                        Delete
                      </button>
                    )}
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
    </div>
  );
}
