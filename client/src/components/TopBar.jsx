import { useState } from 'react';
import { Search, Bell, Flame, ChevronDown, User, Moon, Sun, Plus } from 'lucide-react';

export default function TopBar({ streak, userName, onNewMeeting, theme = 'dark', onToggleTheme }) {
    const [showNotif, setShowNotif] = useState(false);

    return (
        <header className="topbar">
            <div className="topbar-left">
                <div className="topbar-brand">
                    <div className="brand-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <rect x="2" y="3" width="20" height="18" rx="4" stroke="url(#g1)" strokeWidth="2" />
                            <path d="M8 10L12 13L16 10" stroke="url(#g1)" strokeWidth="2" strokeLinecap="round" />
                            <defs><linearGradient id="g1" x1="2" y1="3" x2="22" y2="21"><stop stopColor="#4F8EF7" /><stop offset="1" stopColor="#7C5CFC" /></linearGradient></defs>
                        </svg>
                    </div>
                    <span className="brand-name">MCMS</span>
                </div>
            </div>

            <div className="topbar-center">
                <div className="search-box">
                    <Search size={16} />
                    <input type="text" placeholder="Search meetings, agendas, transcripts..." />
                </div>
            </div>

            <div className="topbar-right">
                <button className="btn btn-primary" onClick={onNewMeeting} id="btn-new-meeting">
                    <Plus size={16} /> New Meeting
                </button>

                <div className="streak-badge tooltip" data-tooltip={`${streak} meeting streak!`}>
                    <Flame size={18} className="streak-icon" />
                    <span>{streak}</span>
                </div>

                <button
                    className={`btn-icon ${showNotif ? 'active' : ''}`}
                    onClick={() => setShowNotif(!showNotif)}
                    id="btn-notifications"
                >
                    <Bell size={18} />
                    <span className="notif-dot"></span>
                </button>

                <div className="user-menu">
                    <div className="user-avatar">
                        <User size={18} />
                    </div>
                    <span className="user-name">{userName}</span>
                    <ChevronDown size={14} />
                </div>

                <button
                    type="button"
                    className={`theme-toggle tooltip ${theme === 'light' ? 'light' : 'dark'}`}
                    data-tooltip={theme === 'light' ? 'Toggle dark mode' : 'Toggle light mode'}
                    aria-label="Toggle color theme"
                    onClick={onToggleTheme}
                >
                    <span className="theme-toggle-thumb">
                        {theme === 'light' ? <Sun size={14} /> : <Moon size={14} />}
                    </span>
                </button>
            </div>
        </header>
    );
}
