import { useState, useEffect } from 'react';
import { Pencil, Target, Shield, Bell, Clock, FileText, LogOut, Check, ChevronRight, Star, ClipboardList } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth-context';
import { tokenStore, auth as authApi, roadmap as roadmapApi } from '../../lib/api';

export default function SettingsPage() {
  const { user, refresh } = useAuth();
  const navigate = useNavigate();

  const [targetRole, setTargetRole] = useState('—');

  useEffect(() => {
    if (!user) return;
    roadmapApi.get(user.id).then((res: any) => {
      setTargetRole(res?.roadmap?.targetRole ?? '—');
    }).catch(() => {});
  }, [user]);

  const [prefs, setPrefs] = useState({ pushNotifications: true, dailyReminders: true, weeklyReports: false });
  const toggle = (key: keyof typeof prefs) => setPrefs(p => ({ ...p, [key]: !p[key] }));

  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: user?.name ?? '', avatarUrl: user?.avatarUrl ?? '' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState(false);

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);

  const handleLogout = () => { tokenStore.clear(); window.location.href = '/'; };

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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '640px' }}>

        {/* ── PROFILE CARD ── */}
        <div className="panel">
          <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--primary)' }}>
            {user?.plan === 'premium' ? 'Premium Member' : 'Free Member'}
          </span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--on-surface)', letterSpacing: '-0.02em', marginTop: 4 }}>
            {user?.name}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
            <Target size={14} color="var(--secondary)" /> {targetRole} goal
          </p>

          {!editingProfile ? (
            <>
              <button
                className="btn-page-action"
                style={{ width: '100%', marginTop: '1rem', justifyContent: 'center' }}
                onClick={() => { setProfileForm({ name: user?.name ?? '', avatarUrl: user?.avatarUrl ?? '' }); setEditingProfile(true); setProfileError(''); }}
              >
                <Pencil size={14} /> Edit Profile
              </button>
              {profileSuccess && <p style={{ fontSize: '0.8rem', color: 'var(--secondary)', marginTop: 8 }}>Profile updated.</p>}
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--on-surface-variant)', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Display Name</label>
                <input className="settings-input" value={profileForm.name} onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name" />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--on-surface-variant)', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avatar URL <span style={{ fontWeight: 400, opacity: 0.6 }}>(optional)</span></label>
                <input className="settings-input" value={profileForm.avatarUrl} onChange={e => setProfileForm(f => ({ ...f, avatarUrl: e.target.value }))} placeholder="https://..." />
              </div>
              {profileError && <p style={{ fontSize: '0.8rem', color: '#ef4444' }}>{profileError}</p>}
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-page-action" disabled={profileSaving || !profileForm.name.trim()} onClick={saveProfile}>
                  {profileSaving ? 'Saving…' : <><Check size={14} /> Save</>}
                </button>
                <button className="btn-page-secondary" onClick={() => setEditingProfile(false)}>Cancel</button>
              </div>
            </div>
          )}
        </div>

        {/* ── ASSESSMENT CARD ── */}
        <div className="panel">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', background: 'rgba(98, 69, 164, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--primary)' }}>
              <ClipboardList size={20} />
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: 'var(--on-surface)' }}>Assessment</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--on-surface-variant)', lineHeight: 1.5, marginTop: 2 }}>
                Your latest skills evaluation shows strong analytical potential with growth areas in digital strategy.
              </p>
              <Link to="/app/assessment" className="panel-link" style={{ marginTop: 8 }}>Retake Assessment <ChevronRight size={14} /></Link>
            </div>
          </div>
        </div>

        {/* ── PREMIUM PLAN CARD ── */}
        <div className="panel panel--gradient" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)' }}>
              {user?.plan === 'premium' ? 'Premium Plan' : 'Upgrade to Premium'}
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.65)', marginTop: '4px', lineHeight: 1.5 }}>
              Access all advanced roadmaps, AI career coaching, and priority support.
            </p>
            {user?.plan !== 'premium' && (
              <button
                className="btn-page-secondary"
                style={{ marginTop: '14px', background: 'rgba(255,255,255,0.12)', color: '#fff', boxShadow: 'none' }}
                onClick={() => navigate('/pricing')}
              >
                Upgrade Plan
              </button>
            )}
          </div>
          <Star size={64} color="rgba(255,255,255,0.08)" style={{ position: 'absolute', right: 16, bottom: 12 }} />
        </div>

        {/* ── PREFERENCES ── */}
        <div className="panel">
          <h2 className="panel__title" style={{ marginBottom: '0.75rem' }}>Preferences</h2>
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

        {/* ── ACCOUNT ACTIONS ── */}
        <div className="panel">
          <Link to="/app/onboarding" className="menu-row" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="pref-icon"><Target size={16} /></div>
            <div style={{ flex: 1 }}>
              <p className="pref-label">Change Target Role</p>
              <p className="pref-desc">Current: {targetRole}</p>
            </div>
            <ChevronRight size={15} color="var(--on-surface-variant)" />
          </Link>

          <button
            className="menu-row"
            style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
            onClick={() => { setShowPasswordForm(v => !v); setPwError(''); setPwSuccess(false); }}
          >
            <div className="pref-icon"><Shield size={16} /></div>
            <div style={{ flex: 1 }}>
              <p className="pref-label">Security & Privacy</p>
              <p className="pref-desc">Change password</p>
            </div>
            <ChevronRight size={15} color="var(--on-surface-variant)" />
          </button>

          {showPasswordForm && (
            <div style={{ padding: '12px 0 4px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {pwSuccess ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--secondary)', fontWeight: 600 }}>Password updated successfully.</p>
              ) : (
                <>
                  {['current', 'newPw', 'confirm'].map((field) => (
                    <div key={field}>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--on-surface-variant)', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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
            style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', paddingTop: '12px' }}
          >
            <div className="pref-icon" style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.06)' }}><LogOut size={16} /></div>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#ef4444' }}>Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}

