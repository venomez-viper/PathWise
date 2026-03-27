import { useState } from 'react';
import { Pencil, Target, Shield, Bell, Clock, FileText, LogOut, User, Mail, Sparkles } from 'lucide-react';
import { useAuth } from '../../lib/auth-context';
import { tokenStore } from '../../lib/api';

export default function SettingsPage() {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState({ pushNotifications: true, dailyReminders: true, weeklyReports: false });
  const toggle = (key: keyof typeof prefs) => setPrefs(p => ({ ...p, [key]: !p[key] }));
  const handleLogout = () => { tokenStore.clear(); window.location.href = '/'; };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? '?';

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your account and preferences.</p>
        </div>
      </div>

      <div className="settings-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="panel">
            <div className="panel__header">
              <h2 className="panel__title">Profile</h2>
              <button className="btn-icon"><Pencil size={14} /></button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', margin: '14px 0' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1.1rem', flexShrink: 0 }}>
                {user?.avatarUrl ? <img src={user.avatarUrl} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : initials}
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--on-surface)' }}>{user?.name}</p>
                <p style={{ fontSize: '0.82rem', color: 'var(--on-surface-variant)', marginTop: '2px' }}>{user?.email}</p>
                <span className="badge-pill badge-pill--purple" style={{ marginTop: '6px', display: 'inline-flex' }}>
                  {user?.plan === 'premium' ? 'Pro Plan' : 'Free Plan'}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              <div className="info-row"><User size={14} /><span>{user?.name}</span></div>
              <div className="info-row"><Mail size={14} /><span>{user?.email}</span></div>
              <div className="info-row"><Target size={14} /><span>{user?.plan === 'premium' ? 'Pro Member' : 'Free Explorer'}</span></div>
            </div>
          </div>

          <div className="panel panel--gradient">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <p className="panel__eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>CURRENT PLAN</p>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)', marginTop: '4px' }}>
                  {user?.plan === 'premium' ? 'Pro Navigator' : 'Free Explorer'}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)', marginTop: '4px', lineHeight: 1.5 }}>
                  {user?.plan === 'premium'
                    ? 'You have full access to all features and AI coaching.'
                    : 'Upgrade to unlock AI coaching, unlimited roadmaps, and priority support.'}
                </p>
              </div>
              <Sparkles size={20} color="#f59e0b" />
            </div>
            {user?.plan !== 'premium' && (
              <button className="btn-page-action" style={{ marginTop: '14px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }}>
                Upgrade to Pro
              </button>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="panel">
            <h2 className="panel__title" style={{ marginBottom: '14px' }}>Notifications</h2>
            {([
              { key: 'pushNotifications' as const, Icon: Bell,     label: 'Push Notifications', desc: 'Real-time alerts for task updates'    },
              { key: 'dailyReminders'    as const, Icon: Clock,    label: 'Daily Reminders',     desc: 'Stay on track with 9:00 AM nudges'   },
              { key: 'weeklyReports'     as const, Icon: FileText, label: 'Weekly Reports',      desc: 'Detailed progress insights via email' },
            ] as const).map(({ key, Icon, label, desc }) => (
              <div className="pref-row" key={key}>
                <div className="pref-icon"><Icon size={16} /></div>
                <div style={{ flex: 1 }}>
                  <p className="pref-label">{label}</p>
                  <p className="pref-desc">{desc}</p>
                </div>
                <button role="switch" aria-checked={prefs[key]} className={`toggle-switch${prefs[key] ? ' on' : ''}`} onClick={() => toggle(key)} />
              </div>
            ))}
          </div>

          <div className="panel">
            <h2 className="panel__title" style={{ marginBottom: '14px' }}>Account</h2>
            {[
              { Icon: Target, label: 'Change Target Role', desc: 'Update your career goal' },
              { Icon: Shield, label: 'Security & Privacy',  desc: 'Password, 2FA, data controls' },
            ].map(({ Icon, label, desc }) => (
              <div className="menu-row" key={label}>
                <div className="pref-icon"><Icon size={16} /></div>
                <div style={{ flex: 1 }}>
                  <p className="pref-label">{label}</p>
                  <p className="pref-desc">{desc}</p>
                </div>
              </div>
            ))}
            <button className="menu-row logout-row" onClick={handleLogout}
              style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', borderTop: '1px solid var(--outline-variant)', marginTop: '4px', paddingTop: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="pref-icon" style={{ color: '#ef4444' }}><LogOut size={16} /></div>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#ef4444' }}>Log Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
