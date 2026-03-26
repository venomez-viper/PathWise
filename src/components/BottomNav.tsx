import { NavLink } from 'react-router-dom';
import { Home, Compass, CheckSquare, BarChart2, Settings } from 'lucide-react';

const navItems = [
  { to: '/',         icon: Home,       label: 'Home'     },
  { to: '/roadmap',  icon: Compass,    label: 'Roadmap'  },
  { to: '/tasks',    icon: CheckSquare,label: 'Tasks'    },
  { to: '/progress', icon: BarChart2,  label: 'Progress' },
  { to: '/settings', icon: Settings,   label: 'Settings' },
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
        >
          <Icon size={22} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
