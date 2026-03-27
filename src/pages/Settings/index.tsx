import { useState } from 'react';
import { Pencil, Target, Shield, Bell, Clock, FileText, LogOut, User, Mail, Sparkles, Check, X, KeyRound, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth-context';
import { tokenStore, auth as authApi } from '../../lib/api';

export default function SettingsPage() {
  const { user, refresh } = useAuth();
  const navigate = useNavigate();

  // Notification prefs (local only — no backend yet)
  const [prefs, setPrefs] = useState({ pushNotifications: true, dailyReminders: true, weeklyReports: false });
  const toggle = (key: keyof typeof prefs) => setPrefs(p => ({ ...p, [key]: !p[key] }));

  // Profile edit state
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: user?.name ?? '', avatarUrl: user?.avatarUrl ?? '' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);

  const handleLogout = () => { tokenStore.clear(); window.location.href = '/'; };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? '?';

  const saveProfile = async () => {
    if (!profileForm.name.trim()) return;
    setProfileSaving(true);
    setProfileError('');
    try {
      await authApi.updateProfile({
        name: profileForm.name.trim(),
        avatarUrl: profileForm.avatarUrl.trim() || undefined,
      });
      await refresh();
      setEditingProfile(false);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: unknown) {
      setProfileError(err instanceof Error ? err.message : 'Failed to save profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  const savePassword = async () => {
    if (pwForm.newPw !== pwForm.confirm) { setPwError('New passwords do not match.'); return; }
    if (pwForm.newPw.length < 8) { setPwError('Password must be at least 8 characters.'); return; }
    setPwSaving(true);
    setPwError('');
    try {
      await authApi.changePassword({ currentPassword: pwForm.current, newPassword: pwForm.newPw });
      setPwSuccess(true);
      setPwForm({ current: '', newPw: '', confirm: '' });
      setTimeout(() => { setPwSuccess(false); setShowPasswordForm(false); }, 2500);
    } catch (err: unknown) {
      setPwError(err instanceof Error ? err.message : 'Failed to change password.');
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your account and preferences.</p>
        </div>
      </div>

      <div className="settings-grid">
        {/* ── Left column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Profile panel */}
          <div className="panel">
            <div className="panel__header">
              <h2 className="panel__title">Profile</h2>
              {!editingProfile ? (
                <button className="btn-icon" onClick={() => { setProfileForm({ name: user?.name ?? '', avatarUrl: user?.avatarUrl ?? '' }); setEditingProfile(true); setProfileError(''); }}>
                  <Pencil size={14} />
                </button>
              ) : (
                <button className="btn-icon" onClick={() => setEditingProfile(false)}>
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Avatar + name/email display */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', margin: '14px 0' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1.1rem', flexShrink: 0, overflow: 'hidden' }}>
                {user?.avatarUrl
                  ? <img src={user.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : initials}
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--on-surface)' }}>{user?.name}</p>
                <p style={{ fontSize: '0.82rem', color: 'var(--on-surface-variant)', marginTop: '2px' }}>{user?.email}</p>
                <span className="badge-pill badge-pill--purple" style={{ marginTop: '6px', display: 'inline-flex' }}>
                  {user?.plan === 'premium' ? 'Pro Plan' : 'Free Plan'}
                </span>
              </div>
            </div>

            {/* Inline edit form */}
            {editingProfile ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--on-surface-variant)', display: 'block', marginBottom: 4 }}>Display Name</label>
                  <input
                    className="settings-input"
                    value={profileForm.name}
                    onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--on-surface-variant)', display: 'block', marginBottom: 4 }}>Avatar URL <span style={{ fontWeight: 400, opacity: 0.6 }}>(optional)</span></label>
                  <input
                    className="settings-input"
                    value={profileForm.avatarUrl}
                    onChange={e => setProfileForm(f => ({ ...f, avatarUrl: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
                {profileError && <p style={{ fontSize: '0.8rem', color: '#ef4444' }}>{profileError}</p>}
                <button
                  className="btn-page-action"
                  style={{ alignSelf: 'flex-start' }}
                  disabled={profileSaving || !profileForm.name.trim()}
                  onClick={saveProfile}
                >
                  {profileSaving ? 'Saving…' : <><Check size={14} /> Save Changes</>}
                </button>
              </div>
            ) : (
              <>
                {profileSuccess && <p style={{ fontSize: '0.8rem', color: '#34d399', marginBottom: 8 }}>✓ Profile updated.</p>}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  <div className="info-row"><User size={14} /><span>{user?.name}</span></div>
                  <div className="info-row"><Mail size={14} /><span>{user?.email}</span></div>
                  <div className="info-row"><Target size={14} /><span>{user?.plan === 'premium' ? 'Pro Member' : 'Free Explorer'}</span></div>
                </div>
              </>
            )}
          </div>

          {/* Plan panel */}
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
              <button
                className="btn-page-action"
                style={{ marginTop: '14px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }}
                onClick={() => navigate('/pricing')}
              >
                Upgrade to Pro
              </button>
            )}
          </div>
        </div>

        {/* ── Right column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Notifications */}
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

          {/* Account */}
          <div className="panel">
            <h2 className="panel__title" style={{ marginBottom: '14px' }}>Account</h2>

            <Link to="/app/onboarding" className="menu-row" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: 'inherit' }}>
              <div className="pref-icon"><Target size={16} /></div>
              <div style={{ flex: 1 }}>
                <p className="pref-label">Change Target Role</p>
                <p className="pref-desc">Update your career goal</p>
              </div>
              <ChevronRight size={15} color="var(--on-surface-variant)" />
            </Link>

            <button
              className="menu-row"
              style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left' }}
              onClick={() => { setShowPasswordForm(v => !v); setPwError(''); setPwSuccess(false); }}
            >
              <div className="pref-icon"><Shield size={16} /></div>
              <div style={{ flex: 1 }}>
                <p className="pref-label">Security &amp; Privacy</p>
                <p className="pref-desc">Change password</p>
              </div>
              <KeyRound size={15} color="var(--on-surface-variant)" />
            </button>

            {/* Password change form */}
            {showPasswordForm && (
              <div style={{ padding: '12px 0 4px', display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid var(--outline-variant)', marginTop: 4 }}>
                {pwSuccess ? (
                  <p style={{ fontSize: '0.85rem', color: '#34d399', fontWeight: 600 }}>✓ Password updated successfully.</p>
                ) : (
                  <>
                    {['current', 'newPw', 'confirm'].map((field) => (
                      <div key={field}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--on-surface-variant)', display: 'block', marginBottom: 4 }}>
                          {field === 'current' ? 'Current Password' : field === 'newPw' ? 'New Password' : 'Confirm New Password'}
                        </label>
                        <input
                          type="password"
                          className="settings-input"
                          value={pwForm[field as keyof typeof pwForm]}
                          onChange={e => setPwForm(f => ({ ...f, [field]: e.target.value }))}
                          placeholder="••••••••"
                        />
                      </div>
                    ))}
                    {pwError && <p style={{ fontSize: '0.8rem', color: '#ef4444' }}>{pwError}</p>}
                    <button
                      className="btn-page-action"
                      style={{ alignSelf: 'flex-start' }}
                      disabled={pwSaving || !pwForm.current || !pwForm.newPw || !pwForm.confirm}
                      onClick={savePassword}
                    >
                      {pwSaving ? 'Saving…' : <><Check size={14} /> Update Password</>}
                    </button>
                  </>
                )}
              </div>
            )}

            <button
              className="menu-row"
              onClick={handleLogout}
              style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', borderTop: '1px solid var(--outline-variant)', marginTop: '4px', paddingTop: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}
            >
              <div className="pref-icon" style={{ color: '#ef4444' }}><LogOut size={16} /></div>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#ef4444' }}>Log Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
