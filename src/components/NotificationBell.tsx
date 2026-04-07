import { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck, Info, Award, Map, AlertCircle } from 'lucide-react';
import { useAuth } from '../lib/auth-context';
import { notifications as notifApi } from '../lib/api';

// ── Types ──────────────────────────────────────────────────────────────────────

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

// ── Time helper ───────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

// ── Icon by notification type ─────────────────────────────────────────────────

function NotifIcon({ type }: { type: string }) {
  const style = { flexShrink: 0, marginTop: 2 };
  if (type === 'achievement') return <Award size={16} color="#f59e0b" style={style} />;
  if (type === 'roadmap')     return <Map size={16} color="#6245a4" style={style} />;
  if (type === 'warning')     return <AlertCircle size={16} color="#ef4444" style={style} />;
  return <Info size={16} color="#0ea5e9" style={style} />;
}

// ── Main component ────────────────────────────────────────────────────────────

export default function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [marking, setMarking] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
  const fetchNotifs = async () => {
    if (!user?.id) return;
    try {
      const res = await notifApi.get(user.id) as { notifications: Notification[]; unreadCount: number };
      setNotifs((res.notifications ?? []).slice(0, 10));
      setUnreadCount(res.unreadCount ?? 0);
    } catch {
      // silently fail — bell is non-critical
    }
  };

  // Initial fetch + 60-second poll
  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    fetchNotifs().finally(() => setLoading(false));

    const interval = setInterval(fetchNotifs, 60_000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!open) return;
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open]);

  // Mark all read
  const handleMarkRead = async () => {
    if (!user?.id || marking) return;
    setMarking(true);
    try {
      await notifApi.markRead(user.id);
      setNotifs(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {}
    setMarking(false);
  };

  // Toggle open — also fetch fresh data on open
  const handleToggle = () => {
    setOpen(prev => {
      if (!prev) fetchNotifs();
      return !prev;
    });
  };

  // ── Styles ──────────────────────────────────────────────────────────────────

  const bellBtnStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: '50%',
    border: '1.5px solid rgba(98,69,164,0.18)',
    background: open ? 'rgba(98,69,164,0.08)' : 'var(--surface, #eefcfe)',
    cursor: 'pointer',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    transition: 'background 0.15s',
    color: 'var(--on-surface, #1a2a2b)',
  };

  const badgeStyle: React.CSSProperties = {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: '999px',
    background: '#ef4444',
    color: '#fff',
    fontSize: '0.65rem',
    fontWeight: 800,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingInline: 4,
    lineHeight: 1,
    border: '2px solid var(--surface, #eefcfe)',
    pointerEvents: 'none',
  };

  const dropdownStyle: React.CSSProperties = {
    position: 'absolute',
    top: 'calc(100% + 10px)',
    right: 0,
    width: 340,
    maxHeight: 400,
    overflowY: 'auto',
    background: '#fff',
    borderRadius: 16,
    boxShadow: '0 8px 32px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08)',
    border: '1px solid rgba(98,69,164,0.12)',
    zIndex: 200,
  };

  const headerRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px 10px',
    borderBottom: '1px solid rgba(0,0,0,0.06)',
  };

  const markAllBtnStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: '0.75rem',
    color: '#6245a4',
    background: 'none',
    border: 'none',
    cursor: marking ? 'default' : 'pointer',
    opacity: marking ? 0.5 : 1,
    fontWeight: 600,
    padding: '2px 6px',
    borderRadius: 6,
    transition: 'background 0.1s',
  };

  const emptyStyle: React.CSSProperties = {
    padding: '32px 16px',
    textAlign: 'center',
    color: 'var(--on-surface-variant, #667)',
    fontSize: '0.85rem',
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-flex' }}>
      {/* Bell button */}
      <button
        style={bellBtnStyle}
        onClick={handleToggle}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span style={badgeStyle}>{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={dropdownStyle} role="dialog" aria-label="Notifications">
          {/* Header */}
          <div style={headerRowStyle}>
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--on-surface, #1a2a2b)' }}>
              Notifications
            </span>
            {notifs.some(n => !n.read) && (
              <button style={markAllBtnStyle} onClick={handleMarkRead} disabled={marking}>
                <CheckCheck size={13} />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          {loading && notifs.length === 0 ? (
            <div style={emptyStyle}>Loading…</div>
          ) : notifs.length === 0 ? (
            <div style={emptyStyle}>
              <Bell size={28} style={{ opacity: 0.25, marginBottom: 8 }} />
              <p style={{ margin: 0 }}>No notifications yet</p>
            </div>
          ) : (
            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              {notifs.map((n, idx) => (
                <li
                  key={n.id}
                  style={{
                    display: 'flex',
                    gap: 10,
                    padding: '11px 16px',
                    background: n.read ? 'transparent' : 'rgba(98,69,164,0.05)',
                    borderBottom: idx < notifs.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none',
                    alignItems: 'flex-start',
                    transition: 'background 0.15s',
                  }}
                >
                  <NotifIcon type={n.type} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      margin: 0,
                      fontWeight: n.read ? 500 : 700,
                      fontSize: '0.82rem',
                      color: 'var(--on-surface, #1a2a2b)',
                      lineHeight: 1.35,
                    }}>
                      {n.title}
                    </p>
                    <p style={{
                      margin: '2px 0 0',
                      fontSize: '0.77rem',
                      color: 'var(--on-surface-variant, #667)',
                      lineHeight: 1.4,
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}>
                      {n.body}
                    </p>
                  </div>
                  <span style={{
                    fontSize: '0.68rem',
                    color: 'var(--on-surface-variant, #999)',
                    whiteSpace: 'nowrap',
                    paddingTop: 1,
                    flexShrink: 0,
                  }}>
                    {timeAgo(n.createdAt)}
                  </span>
                  {!n.read && (
                    <span style={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      background: '#6245a4',
                      flexShrink: 0,
                      marginTop: 5,
                    }} />
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
