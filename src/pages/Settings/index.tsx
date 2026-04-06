import { useState, useEffect } from 'react';
import { Bell, Check, ChevronRight } from 'lucide-react';
import { Panda } from '../../components/panda';
import { Link } from 'react-router-dom';
import { useAuth } from '../../lib/auth-context';
import { tokenStore, auth as authApi, roadmap as roadmapApi } from '../../lib/api';

export default function SettingsPage() {
  const { user, refresh } = useAuth();
  const [targetRole, setTargetRole] = useState('—');
  useEffect(() => {
    if (!user) return;
    roadmapApi.get(user.id).then((res: any) => setTargetRole(res?.roadmap?.targetRole ?? '—')).catch(() => {});
  }, [user]);

  const [prefs, setPrefs] = useState({ hapticFeedback: true, zenMode: false, blueLightReduction: true, networkUpdates: true, roadmapReminders: false });
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
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? '?';

  const saveProfile = async () => {
    if (!profileForm.name.trim()) return;
    setProfileSaving(true); setProfileError('');
    try {
      await authApi.updateProfile({ name: profileForm.name.trim(), avatarUrl: profileForm.avatarUrl.trim() || undefined });
      await refresh(); setEditingProfile(false); setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: unknown) { setProfileError(err instanceof Error ? err.message : 'Failed to save profile.'); }
    finally { setProfileSaving(false); }
  };

  const savePassword = async () => {
    if (pwForm.newPw !== pwForm.confirm) { setPwError('Passwords do not match.'); return; }
    if (pwForm.newPw.length < 8) { setPwError('Min 8 characters.'); return; }
    setPwSaving(true); setPwError('');
    try {
      await authApi.changePassword({ currentPassword: pwForm.current, newPassword: pwForm.newPw });
      setPwSuccess(true); setPwForm({ current: '', newPw: '', confirm: '' });
      setTimeout(() => { setPwSuccess(false); setShowPasswordForm(false); }, 2500);
    } catch (err: unknown) { setPwError(err instanceof Error ? err.message : 'Failed to change password.'); }
    finally { setPwSaving(false); }
  };

  return (
    <div className="page">
      {/* ── Header row with top-bar style ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h1 className="page-title">Settings</h1>
          <Panda mood="cool" size={120} animate />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Bell size={18} color="var(--on-surface-variant)" />
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--primary-container))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '0.7rem' }}>
            {initials}
          </div>
        </div>
      </div>

      {/* ── PROFILE CARD — Zen Stone layout ── */}
      <div className="panel" style={{ borderRadius: '2rem', padding: '2rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {/* Avatar */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: '1.5rem', fontWeight: 800,
              overflow: 'hidden',
            }}>
              {user?.avatarUrl ? <img src={user.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
            </div>
            <div style={{
              position: 'absolute', bottom: -2, left: '50%', transform: 'translateX(-50%)',
              background: '#8b4f2c', color: '#fff', fontSize: '0.55rem', fontWeight: 700,
              padding: '2px 8px', borderRadius: 'var(--radius-full)', textTransform: 'uppercase', letterSpacing: '0.06em',
              whiteSpace: 'nowrap',
            }}>
              {user?.plan === 'premium' ? 'Pro Member' : 'Free'}
            </div>
          </div>

          {/* Name + role */}
          <div style={{ flex: 1 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--on-surface)', letterSpacing: '-0.02em' }}>
              {user?.name}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)', marginTop: 2 }}>
              {targetRole !== '—' ? `${targetRole} Goal` : user?.email}
            </p>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 8 }}>
            {!editingProfile ? (
              <>
                <button className="btn-page-action" style={{ background: '#8b4f2c' }} onClick={() => { setProfileForm({ name: user?.name ?? '', avatarUrl: user?.avatarUrl ?? '' }); setEditingProfile(true); }}>
                  Edit Profile
                </button>
                <Link to="/app/roadmap" className="btn-page-secondary">View Roadmap</Link>
              </>
            ) : (
              <button className="btn-page-secondary" onClick={() => setEditingProfile(false)}>Cancel</button>
            )}
          </div>
        </div>

        {/* Edit form */}
        {editingProfile && (
          <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <input className="settings-input" value={profileForm.name} onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))} placeholder="Display name" />
              <input className="settings-input" value={profileForm.avatarUrl} onChange={e => setProfileForm(f => ({ ...f, avatarUrl: e.target.value }))} placeholder="Avatar URL (optional)" />
            </div>
            {profileError && <p style={{ fontSize: '0.8rem', color: '#ef4444' }}>{profileError}</p>}
            <button className="btn-page-action" style={{ alignSelf: 'flex-start', background: '#8b4f2c' }} disabled={profileSaving || !profileForm.name.trim()} onClick={saveProfile}>
              {profileSaving ? 'Saving…' : <><Check size={14} /> Save Changes</>}
            </button>
          </div>
        )}
        {profileSuccess && <p style={{ fontSize: '0.8rem', color: 'var(--secondary)', marginTop: 8 }}>Profile updated.</p>}
      </div>

      {/* ── ACCOUNT ESSENTIALS — 2-column grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="panel" style={{ borderRadius: '2rem' }}>
          <p style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--on-surface-variant)', marginBottom: '1rem' }}>
            Account Essentials
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginBottom: 4 }}>Personal Information</p>
              <div className="settings-input" style={{ cursor: 'default' }}>{user?.name}</div>
            </div>
            <div className="settings-input" style={{ cursor: 'default' }}>{user?.email}</div>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginBottom: 4 }}>Security</p>
            <button
              className="settings-input"
              style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', textAlign: 'left' }}
              onClick={() => { setShowPasswordForm(v => !v); setPwError(''); setPwSuccess(false); }}
            >
              <span>Update Password</span>
              <ChevronRight size={15} color="var(--on-surface-variant)" />
            </button>
          </div>
          {showPasswordForm && (
            <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {pwSuccess ? (
                <p style={{ fontSize: '0.82rem', color: 'var(--secondary)', fontWeight: 600 }}>Password updated.</p>
              ) : (
                <>
                  {['current', 'newPw', 'confirm'].map(f => (
                    <input key={f} type="password" className="settings-input" placeholder={f === 'current' ? 'Current password' : f === 'newPw' ? 'New password' : 'Confirm new password'}
                      value={pwForm[f as keyof typeof pwForm]} onChange={e => setPwForm(p => ({ ...p, [f]: e.target.value }))} />
                  ))}
                  {pwError && <p style={{ fontSize: '0.78rem', color: '#ef4444' }}>{pwError}</p>}
                  <button className="btn-page-action" style={{ alignSelf: 'flex-start', background: '#8b4f2c' }} disabled={pwSaving} onClick={savePassword}>
                    {pwSaving ? 'Saving…' : 'Update Password'}
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* EXPERIENCE toggles */}
        <div className="panel" style={{ borderRadius: '2rem' }}>
          <p style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--on-surface-variant)', marginBottom: '1rem' }}>
            Experience
          </p>
          {[
            { key: 'hapticFeedback' as const, label: 'Haptic Feedback', desc: 'Subtle tactile responses during navigation.' },
            { key: 'zenMode' as const, label: 'Zen Mode', desc: 'Minimize UI elements for focused strategic planning.' },
            { key: 'blueLightReduction' as const, label: 'Blue Light Reduction', desc: 'Automatic warmth shifting for evening roadmap review.' },
          ].map(({ key, label, desc }) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0' }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--on-surface)' }}>{label}</p>
                <p style={{ fontSize: '0.72rem', color: 'var(--on-surface-variant)' }}>{desc}</p>
              </div>
              <button role="switch" aria-checked={prefs[key]} className={`toggle-switch${prefs[key] ? ' on' : ''}`} onClick={() => toggle(key)} />
            </div>
          ))}
        </div>
      </div>

      {/* ── NOTIFICATIONS ── */}
      <div className="panel" style={{ borderRadius: '2rem', marginBottom: '1.5rem' }}>
        <p style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--on-surface-variant)', marginBottom: '1rem' }}>
          Notifications
        </p>
        {[
          { key: 'networkUpdates' as const, label: 'Network Updates', desc: 'Get notified when peers in your network complete milestones or request feedback on assessments.' },
          { key: 'roadmapReminders' as const, label: 'Roadmap Reminders', desc: 'Gentle nudges for scheduled growth tasks and assessment deadlines.' },
        ].map(({ key, label, desc }) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0' }}>
            <button role="switch" aria-checked={prefs[key]}
              className={`toggle-switch${prefs[key] ? ' on' : ''}`}
              style={prefs[key] ? { background: '#8b4f2c' } : {}}
              onClick={() => toggle(key)} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--on-surface)' }}>{label}</p>
              <p style={{ fontSize: '0.72rem', color: 'var(--on-surface-variant)', lineHeight: 1.4 }}>{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── FOOTER ── */}
      <div style={{ textAlign: 'center', padding: '1rem 0' }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', marginBottom: 8 }}>
          Looking to step away from your growth path?
        </p>
        <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
          Deactivate Account
        </button>
      </div>
    </div>
  );
}
