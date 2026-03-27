import { NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, Compass, CheckSquare, BarChart2, Settings, LogOut, Sparkles, ClipboardList, GraduationCap } from 'lucide-react';
import Logo from './ui/Logo';
import { tokenStore } from '../lib/api';
import './Sidebar.css';

const NAV_ITEMS = [
  { to: '/app',             icon: LayoutDashboard, label: 'Dashboard',  end: true },
  { to: '/app/assessment',  icon: ClipboardList,   label: 'Assessment'           },
  { to: '/app/skill-gaps',  icon: GraduationCap,   label: 'Skill Gaps'           },
  { to: '/app/roadmap',     icon: Compass,         label: 'Roadmap'              },
  { to: '/app/tasks',       icon: CheckSquare,     label: 'Tasks'                },
  { to: '/app/progress',    icon: BarChart2,       label: 'Progress'             },
  { to: '/app/settings',    icon: Settings,        label: 'Settings'             },
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
        <Logo size={28} variant="white" />
      </div>

      <nav className="sidebar__nav">
        <p className="sidebar__section-label">Menu</p>
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
