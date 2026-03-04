import { useState } from 'react';
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

function SidebarToggleIcon({ collapsed }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="svg-icon sidebar-toggle-button-icon">
            <rect x="1" y="2" width="22" height="20" rx="4" />
            <rect x="4" y="5" width="2" height="14" rx="2" fill="currentColor" className={collapsed ? 'sidebar-toggle-icon-close' : 'sidebar-toggle-icon-open'} />
        </svg>
    );
}

export default function TopBar({ streak, userName, onNewMeeting, theme = 'dark', onToggleTheme, sidebarCollapsed, onSidebarToggle, onLogout }) {
    const [showNotif, setShowNotif] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    return (
        <header className="topbar">
            <div className="topbar-left">
                <div type="button" className="sidebar-toggle" onClick={onSidebarToggle} aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
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

                <div className="streak-badge tooltip" data-tooltip={`${streak} meeting streak!`}>
                    <Icon icon={FireIcon} size={18} className="streak-icon" />
                    <span>{streak}</span>
                </div>

                <button
                    className={`btn-icon ${showNotif ? 'active' : ''}`}
                    onClick={() => setShowNotif(!showNotif)}
                    id="btn-notifications"
                >
                    <Icon icon={Notification01Icon} size={18} />
                    <span className="notif-dot"></span>
                </button>

                <div className="user-profile" style={{ position: 'relative' }}>
                    <div
                        className="user-menu"
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="user-avatar">
                            <Icon icon={UserIcon} size={18} />
                        </div>
                        <span className="user-name">{userName}</span>
                        <Icon icon={ArrowDown01Icon} size={14} />
                    </div>

                    {showUserMenu && (
                        <div className="glass-card" style={{
                            position: 'absolute', right: 0, top: '48px', width: '200px',
                            padding: '8px', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '4px'
                        }}>
                            <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-glass)', marginBottom: '4px' }}>
                                <div style={{ fontSize: '13px', fontWeight: 600 }}>{userName}</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Host Account</div>
                            </div>
                            <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', border: 'none' }}>Profile Settings</button>
                            {onLogout && (
                                <button
                                    className="btn btn-secondary"
                                    style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--accent-rose)', border: 'none' }}
                                    onClick={onLogout}
                                >
                                    <Icon icon={Logout01Icon} size={16} />
                                    <span style={{ marginLeft: '8px' }}>Logout</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <button
                    type="button"
                    className={`theme-toggle tooltip ${theme === 'light' ? 'light' : 'dark'}`}
                    data-tooltip={theme === 'light' ? 'Toggle dark mode' : 'Toggle light mode'}
                    aria-label="Toggle color theme"
                    onClick={onToggleTheme}
                >
                    <span className="theme-toggle-thumb">
                        {theme === 'light' ? <Icon icon={Sun01Icon} size={14} /> : <Icon icon={Moon01Icon} size={14} />}
                    </span>
                </button>
            </div>
        </header>
    );
}
