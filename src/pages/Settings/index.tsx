import { useState, useEffect } from 'react';
import { Check, ChevronRight, Download, Trash2, RotateCcw, Target, Camera, Lock, Shield, Globe, Copy, ExternalLink } from 'lucide-react';
import { Panda } from '../../components/panda';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth-context';
import { tokenStore, auth as authApi, roadmap as roadmapApi } from '../../lib/api';

const AVATAR_OPTIONS = [
  { id: 'adventurer-1', url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Aiden' },
  { id: 'adventurer-2', url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Sophia' },
  { id: 'adventurer-3', url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Liam' },
  { id: 'adventurer-4', url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Emma' },
  { id: 'avataaars-1', url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Felix' },
  { id: 'avataaars-2', url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Luna' },
  { id: 'avataaars-3', url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Max' },
  { id: 'avataaars-4', url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Mia' },
  { id: 'bottts-1', url: 'https://api.dicebear.com/9.x/bottts/svg?seed=Robot1' },
  { id: 'bottts-2', url: 'https://api.dicebear.com/9.x/bottts/svg?seed=Robot2' },
  { id: 'lorelei-1', url: 'https://api.dicebear.com/9.x/lorelei/svg?seed=Aria' },
  { id: 'lorelei-2', url: 'https://api.dicebear.com/9.x/lorelei/svg?seed=Kai' },
];

export default function SettingsPage() {
  const { user, refresh } = useAuth();
  const navigate = useNavigate();

  const [targetRole, setTargetRole] = useState('—');
  useEffect(() => {
    if (!user) return;
    roadmapApi.get(user.id).then((res: any) => setTargetRole(res?.roadmap?.targetRole ?? '—')).catch(() => {});
  }, [user]);

  // Profile editing
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: user?.name ?? '' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Avatar picker
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [avatarSaving, setAvatarSaving] = useState<string | null>(null);

  // Password
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);

  // Public profile settings
  const [profileSettings, setProfileSettings] = useState({ profilePublic: false, profileSlug: '', headline: '', bio: '' });
  const [profileSettingsLoading, setProfileSettingsLoading] = useState(true);
  const [profileSettingsSaving, setProfileSettingsSaving] = useState(false);
  const [profileSettingsSuccess, setProfileSettingsSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    authApi.getProfileSettings().then((res: any) => {
      setProfileSettings({
        profilePublic: res.profilePublic ?? false,
        profileSlug: res.profileSlug ?? '',
        headline: res.headline ?? '',
        bio: res.bio ?? '',
      });
      setProfileSettingsLoading(false);
    }).catch(() => setProfileSettingsLoading(false));
  }, []);

  const saveProfileSettings = async () => {
    setProfileSettingsSaving(true);
    try {
      await authApi.updateProfileSettings({
        profilePublic: profileSettings.profilePublic,
        profileSlug: profileSettings.profileSlug || undefined,
        headline: profileSettings.headline || undefined,
        bio: profileSettings.bio || undefined,
      });
      setProfileSettingsSuccess(true);
      setTimeout(() => setProfileSettingsSuccess(false), 3000);
    } catch (err) { alert(err instanceof Error ? err.message : 'Failed to save'); }
    finally { setProfileSettingsSaving(false); }
  };

  const profileUrl = profileSettings.profileSlug
    ? `${window.location.origin}/u/${profileSettings.profileSlug}`
    : '';

  const copyProfileLink = () => {
    if (!profileUrl) return;
    navigator.clipboard.writeText(profileUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleLogout = () => { tokenStore.clear(); window.location.href = '/logout'; };
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? '?';

  const saveProfile = async () => {
    if (!profileForm.name.trim()) return;
    setProfileSaving(true); setProfileError('');
    try {
      await authApi.updateProfile({ name: profileForm.name.trim() });
      await refresh(); setEditingProfile(false); setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: unknown) { setProfileError(err instanceof Error ? err.message : 'Failed to save profile.'); }
    finally { setProfileSaving(false); }
  };

  const selectAvatar = async (url: string) => {
    setAvatarSaving(url);
    try {
      await authApi.updateProfile({ avatarUrl: url });
      await refresh();
      setShowAvatarPicker(false);
    } catch { /* silent */ }
    finally { setAvatarSaving(null); }
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

  const handleExport = async () => {
    try {
      const res = await authApi.exportData();
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pathwise-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { alert('Export failed.'); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
    if (!window.confirm('This will permanently delete all your data including assessments, roadmaps, and tasks. Continue?')) return;
    try {
      await authApi.deleteAccount();
      tokenStore.clear();
      window.location.href = '/';
    } catch (err) { alert(err instanceof Error ? err.message : 'Delete failed.'); }
  };

  const handleResetRoadmap = () => {
    if (!window.confirm('This will reset your current roadmap and take you through onboarding again. Continue?')) return;
    navigate('/app/onboarding');
  };

  const sectionLabel = (text: string) => (
    <p style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--on-surface-variant)', marginBottom: '1rem' }}>
      {text}
    </p>
  );

  const settingRow = (icon: React.ReactNode, label: string, right: React.ReactNode, sub?: string) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid color-mix(in srgb, var(--on-surface) 6%, transparent)' }}>
      <div style={{ width: 36, height: 36, borderRadius: 12, background: 'color-mix(in srgb, var(--primary) 8%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--on-surface)' }}>{label}</p>
        {sub && <p style={{ fontSize: '0.72rem', color: 'var(--on-surface-variant)', marginTop: 2 }}>{sub}</p>}
      </div>
      {right}
    </div>
  );

  return (
    <div className="page">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h1 className="page-title">Settings</h1>
          <Panda mood="cool" size={120} animate />
        </div>
        <button
          onClick={handleLogout}
          style={{ background: 'none', border: '1px solid color-mix(in srgb, var(--on-surface) 12%, transparent)', borderRadius: 'var(--radius-full)', padding: '6px 16px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--on-surface-variant)', cursor: 'pointer' }}
        >
          Sign Out
        </button>
      </div>

      {/* ── PROFILE CARD ── */}
      <div className="panel" style={{ borderRadius: '2rem', padding: '2rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {/* Avatar — clickable */}
          <div style={{ position: 'relative', flexShrink: 0, cursor: 'pointer' }} onClick={() => setShowAvatarPicker(v => !v)}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: '1.5rem', fontWeight: 800, overflow: 'hidden',
            }}>
              {user?.avatarUrl ? <img src={user.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
            </div>
            <div style={{
              position: 'absolute', bottom: -2, right: -2,
              width: 26, height: 26, borderRadius: '50%',
              background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid var(--surface)',
            }}>
              <Camera size={12} color="#fff" />
            </div>
            <div style={{
              position: 'absolute', bottom: -2, left: '50%', transform: 'translateX(-50%)',
              background: '#8b4f2c', color: '#fff', fontSize: '0.55rem', fontWeight: 700,
              padding: '2px 8px', borderRadius: 'var(--radius-full)', textTransform: 'uppercase', letterSpacing: '0.06em',
              whiteSpace: 'nowrap', pointerEvents: 'none',
            }}>
              {user?.plan === 'premium' ? 'Pro Member' : 'Free'}
            </div>
          </div>

          {/* Name + email */}
          <div style={{ flex: 1 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--on-surface)', letterSpacing: '-0.02em' }}>
              {user?.name}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)', marginTop: 2 }}>
              {user?.email}
            </p>
            {targetRole !== '—' && (
              <p style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: 4, fontWeight: 600 }}>
                {targetRole} Goal
              </p>
            )}
          </div>

          {/* Edit profile button */}
          <div>
            {!editingProfile ? (
              <button className="btn-page-action" style={{ background: '#8b4f2c' }} onClick={() => { setProfileForm({ name: user?.name ?? '' }); setEditingProfile(true); }}>
                Edit Profile
              </button>
            ) : (
              <button className="btn-page-secondary" onClick={() => setEditingProfile(false)}>Cancel</button>
            )}
          </div>
        </div>

        {/* Edit name form */}
        {editingProfile && (
          <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input className="settings-input" value={profileForm.name} onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))} placeholder="Display name" />
            {profileError && <p style={{ fontSize: '0.8rem', color: '#ef4444' }}>{profileError}</p>}
            <button className="btn-page-action" style={{ alignSelf: 'flex-start', background: '#8b4f2c' }} disabled={profileSaving || !profileForm.name.trim()} onClick={saveProfile}>
              {profileSaving ? 'Saving…' : <><Check size={14} /> Save Changes</>}
            </button>
          </div>
        )}
        {profileSuccess && <p style={{ fontSize: '0.8rem', color: 'var(--secondary)', marginTop: 8 }}>Profile updated.</p>}

        {/* Avatar Picker Grid */}
        {showAvatarPicker && (
          <div style={{ marginTop: '1.25rem' }}>
            <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--on-surface-variant)', marginBottom: 10 }}>Choose an avatar</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {AVATAR_OPTIONS.map(opt => {
                const isSelected = user?.avatarUrl === opt.url;
                const isSaving = avatarSaving === opt.url;
                return (
                  <button
                    key={opt.id}
                    onClick={() => selectAvatar(opt.url)}
                    disabled={!!avatarSaving}
                    style={{
                      width: '100%', aspectRatio: '1', borderRadius: '50%', border: 'none',
                      padding: 3, cursor: avatarSaving ? 'wait' : 'pointer',
                      background: isSelected ? 'var(--primary)' : 'transparent',
                      outline: isSelected ? '3px solid var(--primary)' : '2px solid color-mix(in srgb, var(--on-surface) 8%, transparent)',
                      outlineOffset: 2,
                      opacity: isSaving ? 0.5 : 1,
                      transition: 'outline 0.15s, background 0.15s',
                      overflow: 'hidden',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <img
                      src={opt.url}
                      alt={opt.id}
                      style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', background: 'color-mix(in srgb, var(--primary) 6%, var(--surface))' }}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── PUBLIC PROFILE ── */}
      <div className="panel" style={{ borderRadius: '2rem', padding: '1.5rem 2rem', marginBottom: '1.5rem' }}>
        {sectionLabel('Public Profile')}

        {profileSettingsLoading ? (
          <p style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>Loading...</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 12, background: 'color-mix(in srgb, var(--primary) 8%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Globe size={16} color="var(--primary)" />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--on-surface)' }}>Make profile public</p>
                <p style={{ fontSize: '0.72rem', color: 'var(--on-surface-variant)', marginTop: 2 }}>Anyone with your link can see your profile</p>
              </div>
              <button
                onClick={() => setProfileSettings(s => ({ ...s, profilePublic: !s.profilePublic }))}
                style={{
                  width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: profileSettings.profilePublic ? 'var(--primary)' : 'color-mix(in srgb, var(--on-surface) 15%, transparent)',
                  position: 'relative', transition: 'background 0.2s',
                }}
              >
                <div style={{
                  width: 18, height: 18, borderRadius: '50%', background: '#fff',
                  position: 'absolute', top: 3,
                  left: profileSettings.profilePublic ? 23 : 3,
                  transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                }} />
              </button>
            </div>

            {/* Profile URL */}
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--on-surface-variant)', display: 'block', marginBottom: 6 }}>Profile URL</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)', whiteSpace: 'nowrap' }}>{window.location.origin}/u/</span>
                <input
                  className="settings-input"
                  value={profileSettings.profileSlug}
                  onChange={e => setProfileSettings(s => ({ ...s, profileSlug: e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '') }))}
                  placeholder="your-slug"
                  style={{ flex: 1 }}
                />
                {profileSettings.profilePublic && profileSettings.profileSlug && (
                  <>
                    <button
                      onClick={copyProfileLink}
                      title="Copy link"
                      style={{ background: 'none', border: '1px solid color-mix(in srgb, var(--on-surface) 12%, transparent)', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: copiedLink ? 'var(--secondary)' : 'var(--on-surface-variant)' }}
                    >
                      <Copy size={14} /> {copiedLink ? 'Copied!' : 'Copy'}
                    </button>
                    <a
                      href={profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="View profile"
                      style={{ background: 'none', border: '1px solid color-mix(in srgb, var(--on-surface) 12%, transparent)', borderRadius: 8, padding: '6px 8px', display: 'flex', alignItems: 'center', color: 'var(--primary)' }}
                    >
                      <ExternalLink size={14} />
                    </a>
                  </>
                )}
              </div>
            </div>

            {/* Headline */}
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--on-surface-variant)', display: 'block', marginBottom: 6 }}>Headline</label>
              <input
                className="settings-input"
                value={profileSettings.headline}
                onChange={e => setProfileSettings(s => ({ ...s, headline: e.target.value }))}
                placeholder="e.g., Aspiring Full-Stack Developer"
                maxLength={120}
              />
            </div>

            {/* Bio */}
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--on-surface-variant)', display: 'block', marginBottom: 6 }}>Bio</label>
              <textarea
                className="settings-input"
                value={profileSettings.bio}
                onChange={e => setProfileSettings(s => ({ ...s, bio: e.target.value }))}
                placeholder="A short paragraph about yourself..."
                maxLength={500}
                rows={3}
                style={{ resize: 'vertical', minHeight: 72 }}
              />
            </div>

            {/* Save */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                className="btn-page-action"
                style={{ background: '#8b4f2c' }}
                disabled={profileSettingsSaving}
                onClick={saveProfileSettings}
              >
                {profileSettingsSaving ? 'Saving...' : <><Check size={14} /> Save Profile Settings</>}
              </button>
              {profileSettingsSuccess && <span style={{ fontSize: '0.8rem', color: 'var(--secondary)', fontWeight: 600 }}>Saved!</span>}
            </div>
          </div>
        )}
      </div>

      {/* ── 2-COLUMN GRID ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>

      {/* ── ACCOUNT & SECURITY ── */}
      <div className="panel" style={{ borderRadius: '2rem', padding: '1.5rem 2rem' }}>
        {sectionLabel('Account & Security')}

        {settingRow(
          <Lock size={16} color="var(--primary)" />,
          'Name',
          <span style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>{user?.name}</span>,
        )}

        {settingRow(
          <Shield size={16} color="var(--primary)" />,
          'Email',
          <span style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>{user?.email}</span>,
          'Cannot be changed',
        )}

        <div style={{ borderBottom: '1px solid color-mix(in srgb, var(--on-surface) 6%, transparent)' }}>
          {settingRow(
            <Lock size={16} color="var(--primary)" />,
            'Password',
            <button
              onClick={() => { setShowPasswordForm(v => !v); setPwError(''); setPwSuccess(false); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600 }}
            >
              Change <ChevronRight size={14} />
            </button>,
          )}
          {showPasswordForm && (
            <div style={{ paddingBottom: 16, paddingLeft: 48, display: 'flex', flexDirection: 'column', gap: 8 }}>
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
      </div>

      {/* ── CAREER SETTINGS ── */}
      <div className="panel" style={{ borderRadius: '2rem', padding: '1.5rem 2rem' }}>
        {sectionLabel('Career Settings')}

        {settingRow(
          <Target size={16} color="var(--primary)" />,
          'Target Role',
          <Link to="/app/onboarding" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}>
            Change <ChevronRight size={14} />
          </Link>,
          targetRole !== '—' ? targetRole : 'Not set',
        )}

        {settingRow(
          <RotateCcw size={16} color="var(--primary)" />,
          'Retake Assessment',
          <Link to="/app/assessment" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}>
            Start <ChevronRight size={14} />
          </Link>,
          'Retake your career assessment to update your matches',
        )}

        {settingRow(
          <RotateCcw size={16} color="var(--primary)" />,
          'Reset Roadmap',
          <button
            onClick={handleResetRoadmap}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600 }}
          >
            Reset <ChevronRight size={14} />
          </button>,
          'Regenerate your roadmap from scratch',
        )}
      </div>

      </div>
      {/* ── DATA & PRIVACY ── */}
      <div className="panel" style={{ borderRadius: '2rem', padding: '1.5rem 2rem', marginBottom: '1.5rem' }}>
        {sectionLabel('Data & Privacy')}

        {settingRow(
          <Download size={16} color="var(--primary)" />,
          'Export My Data',
          <button
            onClick={handleExport}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600 }}
          >
            Download <ChevronRight size={14} />
          </button>,
          'Download all your data as a JSON file',
        )}

        {settingRow(
          <Trash2 size={16} color="#ef4444" />,
          'Delete Account',
          <button
            onClick={handleDelete}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: '#ef4444', fontSize: '0.8rem', fontWeight: 600 }}
          >
            Delete <ChevronRight size={14} />
          </button>,
          'Permanently delete your account and all data',
        )}
      </div>
    </div>
  );
}
