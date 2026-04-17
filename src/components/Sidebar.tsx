import { NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, Compass, CheckSquare, BarChart2, Settings, LogOut, Sparkles, ClipboardList, Flame, Award, FileText, HelpCircle, Search, Shield, Bell, Crosshair, BookOpen } from 'lucide-react';
import Logo from './ui/Logo';
import { Panda } from './panda';
import { tokenStore } from '../lib/api';
import './Sidebar.css';

const NAV_ITEMS = [
  { to: '/app',             icon: LayoutDashboard, label: 'Dashboard',  end: true },
  { to: '/app/assessment-v2', icon: ClipboardList,  label: 'Assessment'           },
  { to: '/app/roadmap',     icon: Compass,         label: 'Roadmap'              },
  { to: '/app/tasks',       icon: CheckSquare,     label: 'Tasks'                },
  { to: '/app/focus',       icon: Crosshair,       label: 'Focus Mode'           },
  { to: '/app/journal',     icon: BookOpen,        label: 'Journal'              },
  { to: '/app/progress',    icon: BarChart2,       label: 'Progress'             },
  { to: '/app/streaks',     icon: Flame,           label: 'Streaks'              },
  { to: '/app/achievements',icon: Award,           label: 'Achievements'         },
  { to: '/app/certificates',icon: FileText,        label: 'Certificates'         },
  { to: '/app/search',      icon: Search,          label: 'Search'               },
  { to: '/app/settings',    icon: Settings,        label: 'Settings'             },
  { to: '/app/help',        icon: HelpCircle,      label: 'Help & FAQ'           },
  { to: '/app/whats-new',   icon: Bell,            label: "What's New",  badge: 'NEW' },
];

interface SidebarProps {
  user: { name: string; email: string; avatarUrl?: string; plan: string };
  open?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ user, open = false, onClose }: SidebarProps) {
  const handleLogout = () => {
    tokenStore.clear();
    window.location.href = '/logout';
  };

  const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <>
    {open && <div className="sidebar-backdrop" onClick={onClose} />}
    <aside className={`sidebar${open ? ' sidebar--open' : ''}`}>
      <div className="sidebar__logo">
        <Logo size={28} variant="full" />
        <span className="sidebar__brand-sub">Strategic Growth</span>
      </div>

      <nav className="sidebar__nav">
        {NAV_ITEMS.map(({ to, icon: Icon, label, end, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `sidebar__link${isActive ? ' active' : ''}`}
            onClick={onClose}
          >
            <Icon size={17} />
            <span>{label}</span>
            {badge && (
              <span style={{
                fontSize: '0.55rem',
                fontWeight: 700,
                background: 'var(--primary)',
                color: 'var(--surface-container-lowest)',
                padding: '1px 6px',
                borderRadius: 999,
                marginLeft: 'auto',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>{badge}</span>
            )}
          </NavLink>
        ))}
        {['akashagakash@gmail.com', 'eaintkphyu98@gmail.com'].includes(user.email) && (
          <NavLink
            to="/app/admin"
            className={({ isActive }) => `sidebar__link${isActive ? ' active' : ''}`}
            onClick={onClose}
          >
            <Shield size={17} />
            <span>Admin</span>
          </NavLink>
        )}
      </nav>

      {user.plan === 'free' && (
        <Link to="/app/pro" className="sidebar__upgrade" onClick={onClose}>
          <Sparkles size={14} />
          <div>
            <p className="sidebar__upgrade-title">Upgrade to Pro</p>
            <p className="sidebar__upgrade-sub">Unlock advanced coaching & more</p>
          </div>
        </Link>
      )}

      <div style={{ display: 'flex', justifyContent: 'center', padding: '0.5rem 0' }}>
        <Panda mood="happy" size={60} animate />
      </div>

      <div className="sidebar__footer">
        <Link to="/app/settings" className="sidebar__user-link" onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1, minWidth: 0, textDecoration: 'none', color: 'inherit' }}>
          {user.avatarUrl?.trim() ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="sidebar__avatar"
              onError={(e) => {
                const img = e.currentTarget;
                const fallback = document.createElement('div');
                fallback.className = 'sidebar__avatar sidebar__avatar--initials';
                fallback.textContent = initials;
                img.replaceWith(fallback);
              }}
            />
          ) : (
            <div className="sidebar__avatar sidebar__avatar--initials">{initials}</div>
          )}
          <div className="sidebar__user-info">
            <span className="sidebar__user-name">{user.name}</span>
            <span className="sidebar__user-plan">{user.plan === 'premium' ? 'Pro Plan' : 'Free Plan'}</span>
          </div>
        </Link>
        <button className="sidebar__logout" onClick={handleLogout} aria-label="Log out">
          <LogOut size={15} />
        </button>
      </div>
    </aside>
    </>
  );
}
