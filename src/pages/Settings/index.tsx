import { useState } from 'react';
import { Pencil, Target, Shield, LogOut, ChevronRight, Bell, Clock, FileText } from 'lucide-react';

export default function SettingsPage() {
  const [prefs, setPrefs] = useState({ pushNotifications: true, dailyReminders: true, weeklyReports: false });
  const toggle = (key: keyof typeof prefs) => setPrefs(p => ({ ...p, [key]: !p[key] }));

  return (
    <main className="main-content">

      {/* ── Profile Card ── */}
      <section className="settings-profile-card">
        <span className="label-caps settings-premium-label">PREMIUM MEMBER</span>
        <h1 className="settings-name">Emily Carter</h1>
        <div className="settings-goal-row">
          <Target size={14} color="var(--secondary)" />
          <span className="settings-goal">Marketing Analyst goal</span>
        </div>
        <button className="btn-primary-sm settings-edit-btn">
          <Pencil size={13} /> Edit Profile
        </button>
      </section>

      {/* ── Goal Timeline ── */}
      <section className="settings-card">
        <div className="settings-timeline-top">
          <span className="settings-timeline-label">Goal Timeline</span>
          <span className="settings-timeline-remaining">6 Months remaining</span>
        </div>
        <div className="progress-track" style={{ margin: '10px 0' }}>
          <div className="progress-fill fill-secondary" style={{ width: '50%' }} />
        </div>
        <div className="settings-timeline-dates">
          <span>STARTED JAN 2024</span>
          <span>TARGET JULY 2024</span>
        </div>
      </section>

      {/* ── Assessment ── */}
      <section className="settings-card">
        <div className="settings-assessment-icon-wrap">
          <FileText size={20} color="var(--tertiary-container)" />
        </div>
        <h2 className="settings-section-heading">Assessment</h2>
        <p className="settings-body-text">
          Your latest skills evaluation shows strong analytical potential with growth areas in digital strategy.
        </p>
        <button className="btn-link">Retake Assessment →</button>
      </section>

      {/* ── Premium Plan ── */}
      <section className="settings-premium-card">
        <h2 className="settings-premium-title">Premium Plan</h2>
        <p className="settings-premium-desc">
          Access all advanced roadmaps, AI career coaching, and priority support.
        </p>
        <button className="btn-secondary-sm">Upgrade Plan</button>
      </section>

      {/* ── Preferences ── */}
      <section style={{ marginTop: '8px' }}>
        <h2 className="section-title" style={{ fontSize: '1.25rem', marginTop: '8px' }}>Preferences</h2>

        {([
          { key: 'pushNotifications' as const, Icon: Bell,     label: 'Push Notifications', desc: 'Real-time alerts for task updates'           },
          { key: 'dailyReminders'    as const, Icon: Clock,    label: 'Daily Reminders',     desc: 'Stay on track with 9:00 AM nudges'           },
          { key: 'weeklyReports'     as const, Icon: FileText, label: 'Weekly Reports',      desc: 'Detailed progress insights via email'        },
        ] as const).map(({ key, Icon, label, desc }) => (
          <div className="pref-row" key={key}>
            <div className="pref-icon"><Icon size={18} /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p className="pref-label">{label}</p>
              <p className="pref-desc">{desc}</p>
            </div>
            <button
              role="switch"
              aria-checked={prefs[key]}
              className={`toggle-switch${prefs[key] ? ' on' : ''}`}
              onClick={() => toggle(key)}
            />
          </div>
        ))}
      </section>

      {/* ── Menu Items ── */}
      <section style={{ marginTop: '8px', marginBottom: '8px' }}>
        {[
          { Icon: Target, label: 'Change Target Role', desc: 'Current: Marketing Analyst' },
          { Icon: Shield, label: 'Security & Privacy',  desc: '' },
        ].map(({ Icon, label, desc }) => (
          <div className="menu-row" key={label}>
            <Icon size={18} color="var(--on-surface-variant)" style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p className="menu-label">{label}</p>
              {desc && <p className="pref-desc">{desc}</p>}
            </div>
            <ChevronRight size={16} color="var(--on-surface-variant)" style={{ flexShrink: 0 }} />
          </div>
        ))}
        <div className="menu-row logout-row">
          <LogOut size={18} color="#e53935" style={{ flexShrink: 0 }} />
          <span className="logout-label">Log Out</span>
        </div>
      </section>

      <div style={{ height: '32px' }} />
    </main>
  );
}
