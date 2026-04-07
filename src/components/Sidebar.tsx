import { NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, Compass, CheckSquare, BarChart2, Settings, LogOut, Sparkles, ClipboardList, Flame, Award, FileText, HelpCircle, Search, Shield } from 'lucide-react';
import Logo from './ui/Logo';
import { Panda } from './panda';
import { tokenStore } from '../lib/api';
import './Sidebar.css';

const NAV_ITEMS = [
  { to: '/app',             icon: LayoutDashboard, label: 'Dashboard',  end: true },
  { to: '/app/assessment',  icon: ClipboardList,   label: 'Assessment'           },
  { to: '/app/roadmap',     icon: Compass,         label: 'Roadmap'              },
  { to: '/app/tasks',       icon: CheckSquare,     label: 'Tasks'                },
  { to: '/app/progress',    icon: BarChart2,       label: 'Progress'             },
  { to: '/app/streaks',     icon: Flame,           label: 'Streaks'              },
  { to: '/app/achievements',icon: Award,           label: 'Achievements'         },
  { to: '/app/certificates',icon: FileText,        label: 'Certificates'         },
  { to: '/app/search',      icon: Search,          label: 'Search'               },
  { to: '/app/settings',    icon: Settings,        label: 'Settings'             },
  { to: '/app/help',        icon: HelpCircle,      label: 'Help & FAQ'           },
];

interface SidebarProps {
  user: { name: string; email: string; avatarUrl?: string; plan: string };
  open?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ user, open = false, onClose }: SidebarProps) {
  const handleLogout = () => {
    tokenStore.clear();
    window.location.href = '/';
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
        {NAV_ITEMS.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `sidebar__link${isActive ? ' active' : ''}`}
            onClick={onClose}
          >
            <Icon size={17} />
            <span>{label}</span>
          </NavLink>
        ))}
        {user.email === 'akashagakash@gmail.com' && (
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
        <Link to="/pricing" className="sidebar__upgrade" onClick={onClose}>
          <Sparkles size={14} />
          <div>
            <p className="sidebar__upgrade-title">Upgrade to Pro</p>
            <p className="sidebar__upgrade-sub">Unlock AI coaching & more</p>
          </div>
        </Link>
      )}

      <div style={{ display: 'flex', justifyContent: 'center', padding: '0.5rem 0' }}>
        <Panda mood="happy" size={60} animate />
      </div>

      <div className="sidebar__footer">
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt={user.name} className="sidebar__avatar" />
        ) : (
          <div className="sidebar__avatar sidebar__avatar--initials">{initials}</div>
        )}
        <div className="sidebar__user-info">
          <span className="sidebar__user-name">{user.name}</span>
          <span className="sidebar__user-plan">{user.plan === 'premium' ? 'Pro Plan' : 'Free Plan'}</span>
        </div>
        <button className="sidebar__logout" onClick={handleLogout} aria-label="Log out">
          <LogOut size={15} />
        </button>
      </div>
    </aside>
    </>
  );
}
