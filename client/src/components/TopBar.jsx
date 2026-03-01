import { useState } from 'react';
import { Search, Bell, Flame, ChevronDown, User } from 'lucide-react';

export default function TopBar({ streak, userName, onNewMeeting }) {
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
                    + New Meeting
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
            </div>

            <style>{`
        .topbar {
          height: var(--topbar-height);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 20px;
          background: rgba(17, 24, 39, 0.8);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border-glass);
          z-index: 100;
          flex-shrink: 0;
        }
        .topbar-left { display: flex; align-items: center; gap: 16px; }
        .topbar-brand { display: flex; align-items: center; gap: 10px; }
        .brand-icon {
          width: 36px; height: 36px;
          display: flex; align-items: center; justify-content: center;
          background: var(--bg-glass); border-radius: 10px;
          border: 1px solid var(--border-glass);
        }
        .brand-name {
          font-size: 18px; font-weight: 800;
          background: var(--gradient-brand);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text; letter-spacing: 1px;
        }
        .topbar-center { flex: 1; max-width: 480px; margin: 0 24px; }
        .search-box {
          display: flex; align-items: center; gap: 10px;
          padding: 8px 16px; background: var(--bg-glass);
          border: 1px solid var(--border-glass); border-radius: 100px;
          transition: border-color 0.2s;
        }
        .search-box:focus-within { border-color: var(--accent-blue); }
        .search-box svg { color: var(--text-muted); flex-shrink: 0; }
        .search-box input {
          flex: 1; border: none; background: none; outline: none;
          color: var(--text-primary); font-family: 'Inter', sans-serif; font-size: 13px;
        }
        .search-box input::placeholder { color: var(--text-muted); }
        .topbar-right { display: flex; align-items: center; gap: 12px; }
        .streak-badge {
          display: flex; align-items: center; gap: 6px;
          padding: 6px 12px; background: rgba(251, 191, 36, 0.1);
          border: 1px solid rgba(251, 191, 36, 0.2);
          border-radius: 100px; color: var(--accent-amber);
          font-size: 13px; font-weight: 700;
        }
        .streak-icon { animation: pulse 2s ease infinite; }
        .btn-icon { position: relative; }
        .notif-dot {
          position: absolute; top: 6px; right: 6px;
          width: 7px; height: 7px; background: var(--accent-rose);
          border-radius: 50%; border: 2px solid var(--bg-secondary);
        }
        .user-menu {
          display: flex; align-items: center; gap: 8px;
          padding: 6px 12px; background: var(--bg-glass);
          border: 1px solid var(--border-glass); border-radius: 100px;
          cursor: pointer; transition: all 0.2s;
        }
        .user-menu:hover { background: var(--bg-glass-hover); }
        .user-avatar {
          width: 28px; height: 28px; border-radius: 50%;
          background: var(--gradient-brand); display: flex;
          align-items: center; justify-content: center; color: white;
        }
        .user-name { font-size: 13px; font-weight: 500; color: var(--text-secondary); }
      `}</style>
        </header>
    );
}
