import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Compass, CheckSquare, BarChart2, Settings, LogOut, Sparkles } from 'lucide-react';
import Logo from './ui/Logo';
import { tokenStore } from '../lib/api';
import './Sidebar.css';

const NAV_ITEMS = [
  { to: '/app',          icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/app/roadmap',  icon: Compass,         label: 'Roadmap'              },
  { to: '/app/tasks',    icon: CheckSquare,     label: 'Tasks'                },
  { to: '/app/progress', icon: BarChart2,       label: 'Progress'             },
  { to: '/app/settings', icon: Settings,        label: 'Settings'             },
];

export default function Sidebar() {
  const handleLogout = () => {
    tokenStore.clear();
    window.location.href = '/';
  };

  return (
    <aside className="sidebar">
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
          >
            <Icon size={17} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__upgrade">
        <Sparkles size={14} />
        <div>
          <p className="sidebar__upgrade-title">Upgrade to Pro</p>
          <p className="sidebar__upgrade-sub">Unlock AI coaching & more</p>
        </div>
      </div>

      <div className="sidebar__footer">
        <img src="https://i.pravatar.cc/150?u=pathwise" alt="User" className="sidebar__avatar" />
        <div className="sidebar__user-info">
          <span className="sidebar__user-name">Emily Carter</span>
          <span className="sidebar__user-plan">Free Plan</span>
        </div>
        <button className="sidebar__logout" onClick={handleLogout} aria-label="Log out">
          <LogOut size={15} />
        </button>
      </div>
    </aside>
  );
}
