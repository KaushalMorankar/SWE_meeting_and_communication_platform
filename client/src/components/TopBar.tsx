import { useState, FC } from 'react';
import Icon from './Icon';
import {
  Search01Icon,
  Notification01Icon,
  FireIcon,
  ArrowDown01Icon,
  UserIcon,
  Moon01Icon,
  Sun01Icon,
  Add01Icon,
  Logout01Icon,
} from '@hugeicons/core-free-icons';

interface TopBarProps {
  streak: number;
  userName: string;
  onNewMeeting: () => void;
  theme?: 'dark' | 'light';
  onToggleTheme: () => void;
  sidebarCollapsed: boolean;
  onSidebarToggle: () => void;
  onLogout: () => void;
}

function SidebarToggleIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="svg-icon sidebar-toggle-button-icon">
      <rect x="1" y="2" width="22" height="20" rx="4" />
      <rect x="4" y="5" width="2" height="14" rx="2" fill="currentColor" className={collapsed ? 'sidebar-toggle-icon-close' : 'sidebar-toggle-icon-open'} />
    </svg>
  );
}

const TopBar: FC<TopBarProps> = ({ streak, userName, onNewMeeting, theme = 'dark', onToggleTheme, sidebarCollapsed, onSidebarToggle, onLogout }) => {
  const [showNotif, setShowNotif] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="sidebar-toggle" onClick={onSidebarToggle} aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          <SidebarToggleIcon collapsed={sidebarCollapsed} />
        </div>
        <div className="topbar-brand">
          <span className="brand-name">MCMS</span>
        </div>
      </div>

      <div className="topbar-center">
        <div className="search-box">
          <Icon icon={Search01Icon} size={16} />
          <input type="text" placeholder="Search meetings, agendas, transcripts..." />
        </div>
      </div>

      <div className="topbar-right">
        <button className="btn btn-primary" onClick={onNewMeeting} id="btn-new-meeting">
          <Icon icon={Add01Icon} size={16} /> New Meeting
        </button>

        <button
          className="topbar-icon-btn tooltip"
          data-tooltip="Notifications"
          onClick={() => setShowNotif(!showNotif)}
          id="btn-notifications"
        >
          <Icon icon={Notification01Icon} size={18} />
        </button>

        <button
          className="topbar-icon-btn tooltip"
          data-tooltip={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          onClick={onToggleTheme}
          id="btn-theme-toggle"
        >
          <Icon icon={theme === 'dark' ? Sun01Icon : Moon01Icon} size={18} />
        </button>

        <div className="topbar-user-menu">
          <button
            className="topbar-user-btn"
            onClick={() => setShowUserMenu(!showUserMenu)}
            id="btn-user-menu"
          >
            <div className="user-avatar">{userName.charAt(0).toUpperCase()}</div>
            <div className="user-info">
              <div className="user-name">{userName}</div>
              <div className="user-streak">
                <Icon icon={FireIcon} size={12} /> {streak} day streak
              </div>
            </div>
            <Icon icon={ArrowDown01Icon} size={14} />
          </button>

          {showUserMenu && (
            <div className="topbar-dropdown">
              <button className="dropdown-item" id="menu-profile">
                <Icon icon={UserIcon} size={16} />
                Profile
              </button>
              <button className="dropdown-item logout-item" onClick={onLogout} id="menu-logout">
                <Icon icon={Logout01Icon} size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
