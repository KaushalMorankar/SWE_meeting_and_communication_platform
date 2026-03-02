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
        </nav>
    );
}
