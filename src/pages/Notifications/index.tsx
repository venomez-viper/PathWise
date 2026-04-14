import { useState, useEffect } from 'react';
import { Bell, CheckCircle2, Flame, Compass, BarChart2, Loader2 } from 'lucide-react';
import { useAuth } from '../../lib/auth-context';
import { notifications as notifApi } from '../../lib/api';

const TYPE_ICONS: Record<string, any> = {
  task: Bell, achievement: CheckCircle2, streak: Flame, roadmap: Compass, progress: BarChart2,
};
const TYPE_COLORS: Record<string, string> = {
  task: 'var(--primary)', achievement: '#f59e0b', streak: 'var(--copper)', roadmap: 'var(--secondary)', progress: '#334042',
};

export default function Notifications() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) return;
    notifApi.get(user.id).then((res: any) => { setData(res.notifications ?? []); setUnread(res.unreadCount ?? 0); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user]);

  const handleMarkRead = async () => {
    if (!user) return;
    await notifApi.markRead(user.id);
    setData(prev => prev.map(n => ({ ...n, read: true })));
    setUnread(0);
  };

  const formatTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    if (diff < 3600000) return `${Math.round(diff / 60000)}M AGO`;
    if (diff < 86400000) return `${Math.round(diff / 3600000)}H AGO`;
    if (diff < 172800000) return 'YESTERDAY';
    return `${Math.round(diff / 86400000)} DAYS AGO`;
  };

  const today = data.filter(n => {
    const d = Date.now() - new Date(n.createdAt).getTime();
    return d < 86400000;
  });
  const earlier = data.filter(n => {
    const d = Date.now() - new Date(n.createdAt).getTime();
    return d >= 86400000;
  });

  if (loading) return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <Loader2 size={28} color="var(--copper)" style={{ animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  return (
    <div className="page" style={{ maxWidth: 640 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 className="page-title">Notifications</h1>
        {unread > 0 && (
          <button onClick={handleMarkRead} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--on-surface)',
          }}>
            Mark All as Read
          </button>
        )}
      </div>

      {data.length === 0 ? (
        <div className="panel" style={{ borderRadius: '2rem', textAlign: 'center', padding: '3rem' }}>
          <Bell size={32} color="var(--on-surface-variant)" style={{ opacity: 0.4, margin: '0 auto 8px' }} />
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.85rem' }}>No notifications yet.</p>
        </div>
      ) : (
        <>
          {today.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.75rem' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.9rem', color: 'var(--on-surface)' }}>Today</span>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--radius-full)', background: 'rgba(98,69,164,0.08)', color: 'var(--primary)' }}>{today.length} NEW</span>
              </div>
              {today.map(n => <NotifCard key={n.id} n={n} formatTime={formatTime} />)}
            </div>
          )}
          {earlier.length > 0 && (
            <div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.9rem', color: 'var(--on-surface)', display: 'block', marginBottom: '0.75rem' }}>Earlier</span>
              {earlier.map(n => <NotifCard key={n.id} n={n} formatTime={formatTime} />)}
            </div>
          )}
          <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--on-surface-variant)', fontSize: '0.78rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <Bell size={20} style={{ opacity: 0.3 }} />
            End of Feed
          </div>
        </>
      )}
    </div>
  );
}

function NotifCard({ n, formatTime }: { n: any; formatTime: (s: string) => string }) {
  const Icon = TYPE_ICONS[n.type] || Bell;
  const color = TYPE_COLORS[n.type] || '#334042';
  return (
    <div className="panel" style={{ borderRadius: '2rem', padding: '1.25rem', marginBottom: '0.75rem', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', background: `color-mix(in srgb, ${color} 7%, transparent)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={18} color={color} />
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 700, color: 'var(--on-surface)' }}>{n.title}</p>
        <p style={{ fontSize: '0.82rem', color: 'var(--on-surface-variant)', lineHeight: 1.5, marginTop: 2 }}>{n.body}</p>
        <p style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--on-surface-muted)', marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {formatTime(n.createdAt)}
        </p>
      </div>
      {!n.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0, marginTop: 6 }} />}
    </div>
  );
}
