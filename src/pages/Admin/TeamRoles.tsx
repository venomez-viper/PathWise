import { useEffect, useState } from 'react';
import { admin as adminApi } from '../../lib/api';
import { Shield, Headphones, Trash2, UserPlus } from 'lucide-react';

type Role = 'admin' | 'support_agent';

type RoleEntry = {
  email: string;
  role: Role;
  addedByEmail: string | null;
  addedAt: string;
  isBootstrap: boolean;
  hasAccount: boolean;
  userName: string | null;
};

export function TeamRoles() {
  const [entries, setEntries] = useState<RoleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<Role>('support_agent');
  const [adding, setAdding] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminApi.listRoles();
      setEntries(res.entries ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    const email = newEmail.trim().toLowerCase();
    if (!email) return;
    setAdding(true);
    try {
      await adminApi.addRole(email, newRole);
      setNewEmail('');
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add role');
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (email: string, role: Role) => {
    const label = role === 'admin' ? 'admin' : 'support agent';
    if (!window.confirm(`Remove ${label} access for ${email}?`)) return;
    try {
      await adminApi.removeRole(email, role);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to remove role');
    }
  };

  const admins = entries.filter(e => e.role === 'admin');
  const agents = entries.filter(e => e.role === 'support_agent');

  return (
    <div>
      <div className="panel" style={{ borderRadius: '1.5rem', padding: '1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 6, color: 'var(--on-surface)' }}>
          <UserPlus size={16} style={{ verticalAlign: '-3px', marginRight: 6 }} />
          Grant access
        </div>
        <p style={{ fontSize: '0.82rem', color: 'var(--on-surface-variant)', marginBottom: 12, marginTop: 0 }}>
          Support agents can view and reply to tickets at <code>/support</code>.
          They cannot see other admin tabs. Admin access grants the full admin console.
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            type="email"
            value={newEmail}
            onChange={e => setNewEmail(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
            placeholder="teammate@example.com"
            style={{
              flex: '1 1 260px', padding: '0.55rem 0.9rem', borderRadius: 999,
              border: '1px solid var(--outline-variant)', background: 'var(--surface-container)',
              color: 'var(--on-surface)', fontSize: '0.88rem', outline: 'none',
            }}
          />
          <select
            value={newRole}
            onChange={e => setNewRole(e.target.value as Role)}
            style={{
              padding: '0.55rem 0.9rem', borderRadius: 999, fontSize: '0.82rem', fontWeight: 600,
              border: '1px solid var(--outline-variant)', background: 'var(--surface-container)',
              color: 'var(--on-surface)', cursor: 'pointer', outline: 'none',
            }}
          >
            <option value="support_agent">Support Agent</option>
            <option value="admin">Admin</option>
          </select>
          <button
            onClick={handleAdd}
            disabled={adding || !newEmail.trim()}
            style={{
              padding: '0.55rem 1.1rem', borderRadius: 999, border: 'none',
              background: '#6245a4', color: '#fff', fontSize: '0.82rem', fontWeight: 700,
              cursor: 'pointer', opacity: (adding || !newEmail.trim()) ? 0.5 : 1,
            }}
          >
            {adding ? 'Adding…' : 'Grant access'}
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--on-surface-variant)' }}>Loading…</div>
      ) : (
        <>
          <Section title="Admins" icon={<Shield size={14} />} entries={admins} onRemove={handleRemove} />
          <Section title="Support Agents" icon={<Headphones size={14} />} entries={agents} onRemove={handleRemove} />
        </>
      )}
    </div>
  );
}

function Section({
  title, icon, entries, onRemove,
}: {
  title: string;
  icon: React.ReactNode;
  entries: RoleEntry[];
  onRemove: (email: string, role: Role) => void;
}) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <div style={{
        fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.08em', color: 'var(--on-surface-variant)', marginBottom: 8,
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        {icon}<span>{title} ({entries.length})</span>
      </div>
      {entries.length === 0 ? (
        <div className="panel" style={{ borderRadius: '1.25rem', padding: '1rem', color: 'var(--on-surface-variant)', fontSize: '0.85rem' }}>
          None yet.
        </div>
      ) : (
        <div className="panel" style={{ borderRadius: '1.25rem', padding: 0, overflow: 'hidden' }}>
          {entries.map((e, idx) => (
            <div key={`${e.email}-${e.role}`} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0.85rem 1rem',
              borderBottom: idx < entries.length - 1 ? '1px solid var(--outline-variant)' : 'none',
            }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--on-surface)' }}>
                  {e.userName ? `${e.userName} · ` : ''}{e.email}
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--on-surface-variant)', marginTop: 2 }}>
                  {e.isBootstrap
                    ? 'Built-in admin (config file)'
                    : `${e.hasAccount ? 'Active account' : 'Pending — will activate when they sign up'}${e.addedByEmail ? ` · added by ${e.addedByEmail}` : ''}`}
                </div>
              </div>
              {!e.isBootstrap && (
                <button
                  onClick={() => onRemove(e.email, e.role)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'none', border: '1px solid #ef444444', color: '#ef4444',
                    cursor: 'pointer', padding: 0, flexShrink: 0,
                  }}
                  title="Remove access"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
