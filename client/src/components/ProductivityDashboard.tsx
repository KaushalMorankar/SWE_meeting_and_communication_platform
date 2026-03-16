import { FC, useState } from 'react';
import Icon from './Icon';
import {
  ChartIncreaseIcon,
  Clock01Icon,
  UserGroupIcon,
  CheckmarkSquare01Icon,
  FireIcon,
  Award01Icon,
  BarChartIcon,
  Calendar02Icon,
} from '@hugeicons/core-free-icons';

interface ProductivityStats {
  totalMeetings: number;
  totalHours: number;
  punctualityRate: number;
  tasksCompleted: number;
  tasksTotal: number;
  weeklyHeatmap: Array<{ date: string; hours: number }>;
  user: string;
}

interface ProductivityDashboardProps {
  stats: ProductivityStats | null;
  userName?: string;
}

const ProductivityDashboard: FC<ProductivityDashboardProps> = ({ stats, userName }) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!stats) return null;

  const maxHours = Math.max(...stats.weeklyHeatmap.map(d => d.hours));

  return (
    <div className="productivity-dashboard">
      <div className="dashboard-header">
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>
            Productivity Dashboard
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Welcome back, <strong>{userName || stats.user}</strong>. Here's your meeting intelligence overview.
          </p>
        </div>
      </div>

      <div className="tabs" style={{ margin: '0 20px' }}>
        {['overview', 'attendance', 'engagement'].map(tab => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
            id={`tab-${tab}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="dashboard-grid">
          <div className="stat-card glass-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Icon icon={Calendar02Icon} size={18} style={{ color: 'var(--accent-blue)' }} />
              <span className="stat-label">Meetings Attended</span>
            </div>
            <div className="stat-value">{stats.totalMeetings}</div>
          </div>

          <div className="stat-card glass-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Icon icon={Clock01Icon} size={18} style={{ color: 'var(--accent-violet)' }} />
              <span className="stat-label">Total Hours</span>
            </div>
            <div className="stat-value">{stats.totalHours}</div>
          </div>

          <div className="stat-card glass-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Icon icon={ChartIncreaseIcon} size={18} style={{ color: 'var(--accent-emerald)' }} />
              <span className="stat-label">Punctuality Rate</span>
            </div>
            <div className="stat-value">{stats.punctualityRate}%</div>
          </div>

          <div className="stat-card glass-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Icon icon={CheckmarkSquare01Icon} size={18} style={{ color: 'var(--accent-amber)' }} />
              <span className="stat-label">Tasks Completed</span>
            </div>
            <div className="stat-value">{stats.tasksCompleted}/{stats.tasksTotal}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductivityDashboard;
