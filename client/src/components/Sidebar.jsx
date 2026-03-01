import { LayoutDashboard, Video, Calendar, Archive, BarChart3, Settings, ChevronLeft, ChevronRight } from 'lucide-react';

const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'meeting', label: 'Live Meeting', icon: Video },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'archive', label: 'Archives', icon: Archive },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ currentView, onViewChange, collapsed, onToggle }) {
    return (
        <nav className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-nav">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.id}
                            className={`sidebar-item ${currentView === item.id ? 'active' : ''}`}
                            onClick={() => onViewChange(item.id)}
                            id={`nav-${item.id}`}
                        >
                            <Icon size={20} />
                            {!collapsed && <span>{item.label}</span>}
                        </button>
                    );
                })}
            </div>

            <button className="sidebar-toggle" onClick={onToggle}>
                {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>

            <style>{`
        .sidebar {
          width: 220px;
          display: flex;
          flex-direction: column;
          background: rgba(17, 24, 39, 0.5);
          border-right: 1px solid var(--border-glass);
          padding: 12px 8px;
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          flex-shrink: 0;
          justify-content: space-between;
        }
        .sidebar.collapsed { width: 60px; }
        .sidebar-nav { display: flex; flex-direction: column; gap: 4px; }
        .sidebar-item {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 14px; border: none; border-radius: var(--radius-sm);
          background: transparent; color: var(--text-secondary);
          font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500;
          cursor: pointer; transition: all 0.2s ease;
          white-space: nowrap; overflow: hidden;
        }
        .sidebar-item:hover {
          background: var(--bg-glass-hover); color: var(--text-primary);
        }
        .sidebar-item.active {
          background: rgba(79, 142, 247, 0.12); color: var(--accent-blue);
        }
        .sidebar-item.active::before {
          content: ''; position: absolute; left: 0; top: 50%;
          transform: translateY(-50%); width: 3px; height: 20px;
          background: var(--accent-blue); border-radius: 0 3px 3px 0;
        }
        .sidebar-item { position: relative; }
        .sidebar-toggle {
          display: flex; align-items: center; justify-content: center;
          padding: 8px; border: 1px solid var(--border-glass); border-radius: var(--radius-sm);
          background: var(--bg-glass); color: var(--text-muted);
          cursor: pointer; transition: all 0.2s;
        }
        .sidebar-toggle:hover {
          color: var(--text-primary); background: var(--bg-glass-hover);
        }
      `}</style>
        </nav>
    );
}
