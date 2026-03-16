import { FC } from 'react';
import Icon from './Icon';
import {
  DashboardSquare01Icon,
  Video01Icon,
  Calendar02Icon,
  Archive03Icon,
  BarChartIcon,
  Settings01Icon,
} from '@hugeicons/core-free-icons';

interface NavItem {
  id: string;
  label: string;
  icon: any;
}

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  collapsed: boolean;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: DashboardSquare01Icon },
  { id: 'meeting', label: 'Live Meeting', icon: Video01Icon },
  { id: 'schedule', label: 'Schedule', icon: Calendar02Icon },
  { id: 'archive', label: 'Archives', icon: Archive03Icon },
  { id: 'analytics', label: 'Analytics', icon: BarChartIcon },
  { id: 'settings', label: 'Settings', icon: Settings01Icon },
];

const Sidebar: FC<SidebarProps> = ({ currentView, onViewChange, collapsed }) => {
  return (
    <nav className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar-item ${currentView === item.id ? 'active' : ''}`}
            onClick={() => onViewChange(item.id)}
            id={`nav-${item.id}`}
          >
            <Icon icon={item.icon} size={20} className="sidebar-item-icon" />
            <span className={`sidebar-item-label ${collapsed ? 'collapsed' : ''}`}>{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Sidebar;
