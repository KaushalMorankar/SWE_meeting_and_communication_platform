import { useState } from 'react';
import { TrendingUp, Clock, Users, CheckSquare, Flame, Award, BarChart3, Calendar } from 'lucide-react';

export default function ProductivityDashboard({ stats }) {
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
                        Welcome back, {stats.user}. Here's your meeting intelligence overview.
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
                            <Calendar size={18} style={{ color: 'var(--accent-blue)' }} />
                            <span className="stat-label">Meetings Attended</span>
                        </div>
                        <div className="stat-value">{stats.totalMeetings}</div>
                    </div>

                    <div className="stat-card glass-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <Clock size={18} style={{ color: 'var(--accent-violet)' }} />
                            <span className="stat-label">Total Hours</span>
                        </div>
                        <div className="stat-value">{stats.totalHours}</div>
                    </div>

                    <div className="stat-card glass-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <TrendingUp size={18} style={{ color: 'var(--accent-emerald)' }} />
                            <span className="stat-label">Punctuality Rate</span>
                        </div>
                        <div className="stat-value">{stats.punctualityRate}%</div>
                    </div>

                    <div className="stat-card glass-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <CheckSquare size={18} style={{ color: 'var(--accent-amber)' }} />
                            <span className="stat-label">Tasks Completed</span>
                        </div>
                        <div className="stat-value">{stats.tasksCompleted}/{stats.tasksTotal}</div>
                    </div>

                    <div className="stat-card glass-card" style={{ gridColumn: 'span 2' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                            <BarChart3 size={18} style={{ color: 'var(--accent-cyan)' }} />
                            <span className="stat-label">Weekly Meeting Load Heatmap</span>
                        </div>
                        <div className="heatmap-bar">
                            {stats.weeklyHeatmap.map((day) => (
                                <div key={day.day} className="heatmap-col">
                                    <div
                                        className="heatmap-fill"
                                        style={{ height: `${(day.hours / maxHours) * 100}%` }}
                                    ></div>
                                    <span className="heatmap-label">{day.day}</span>
                                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                        {day.hours}h
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="stat-card glass-card" style={{ gridColumn: 'span 2' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                            <Award size={18} style={{ color: 'var(--accent-amber)' }} />
                            <span className="stat-label">Badges & Achievements</span>
                        </div>
                        <div className="badges-grid">
                            {stats.badges.map((badge, i) => (
                                <div key={i} className="badge-item animate-in" style={{ animationDelay: `${i * 0.1}s` }}>
                                    <span className="badge-icon">{badge.icon}</span>
                                    <div>
                                        <div className="badge-name">{badge.name}</div>
                                        <div className="badge-desc">{badge.description}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="stat-card glass-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                            <Flame size={18} style={{ color: 'var(--accent-amber)' }} />
                            <span className="stat-label">Meeting Streak</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div className="stat-value">{stats.streak}</div>
                            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>consecutive on-time</span>
                        </div>
                    </div>

                    <div className="stat-card glass-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                            <Users size={18} style={{ color: 'var(--accent-violet)' }} />
                            <span className="stat-label">Sentiment Profile</span>
                        </div>
                        <div className="sentiment-bars">
                            <div className="sentiment-bar-row">
                                <span style={{ color: 'var(--accent-emerald)', fontSize: '12px', width: '70px' }}>Positive</span>
                                <div className="sentiment-track">
                                    <div className="sentiment-fill" style={{ width: `${stats.sentimentProfile.positive}%`, background: 'var(--accent-emerald)' }}></div>
                                </div>
                                <span style={{ fontSize: '12px', fontWeight: 600 }}>{stats.sentimentProfile.positive}%</span>
                            </div>
                            <div className="sentiment-bar-row">
                                <span style={{ color: 'var(--text-secondary)', fontSize: '12px', width: '70px' }}>Neutral</span>
                                <div className="sentiment-track">
                                    <div className="sentiment-fill" style={{ width: `${stats.sentimentProfile.neutral}%`, background: 'var(--text-muted)' }}></div>
                                </div>
                                <span style={{ fontSize: '12px', fontWeight: 600 }}>{stats.sentimentProfile.neutral}%</span>
                            </div>
                            <div className="sentiment-bar-row">
                                <span style={{ color: 'var(--accent-rose)', fontSize: '12px', width: '70px' }}>Negative</span>
                                <div className="sentiment-track">
                                    <div className="sentiment-fill" style={{ width: `${stats.sentimentProfile.negative}%`, background: 'var(--accent-rose)' }}></div>
                                </div>
                                <span style={{ fontSize: '12px', fontWeight: 600 }}>{stats.sentimentProfile.negative}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'attendance' && (
                <div className="dashboard-grid">
                    <div className="stat-card glass-card" style={{ gridColumn: 'span 2' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                            <Calendar size={18} style={{ color: 'var(--accent-blue)' }} />
                            <span className="stat-label">Monthly Attendance</span>
                        </div>
                        <div className="attendance-chart">
                            {stats.monthlyAttendance.map((week, i) => (
                                <div key={i} className="attendance-week">
                                    <span className="attendance-label">{week.week}</span>
                                    <div className="attendance-bar-track">
                                        <div
                                            className="attendance-bar-fill"
                                            style={{ width: `${(week.attended / week.total) * 100}%` }}
                                        ></div>
                                    </div>
                                    <span className="attendance-value">{week.attended}/{week.total}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="stat-card glass-card" style={{ gridColumn: 'span 2' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                            <Clock size={18} style={{ color: 'var(--accent-violet)' }} />
                            <span className="stat-label">Speaking Time vs Average Meeting Duration</span>
                        </div>
                        <div style={{ display: 'flex', gap: '24px', alignItems: 'center', padding: '12px 0' }}>
                            <div>
                                <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--accent-blue)' }}>
                                    {stats.speakingTime} min
                                </div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Avg Speaking Time</div>
                            </div>
                            <div style={{ width: '1px', height: '40px', background: 'var(--border-glass)' }}></div>
                            <div>
                                <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--accent-violet)' }}>
                                    {stats.avgMeetingDuration} min
                                </div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Avg Meeting Duration</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'engagement' && (
                <div className="dashboard-grid">
                    <div className="stat-card glass-card" style={{ gridColumn: 'span 2' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                            <Award size={18} style={{ color: 'var(--accent-amber)' }} />
                            <span className="stat-label">Contribution & Engagement</span>
                        </div>
                        <div className="engagement-metrics">
                            <div className="engagement-metric">
                                <div className="engagement-circle" style={{ '--pct': `${(stats.tasksCompleted / stats.tasksTotal) * 100}%` }}>
                                    <span>{Math.round((stats.tasksCompleted / stats.tasksTotal) * 100)}%</span>
                                </div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>Task Completion</div>
                            </div>
                            <div className="engagement-metric">
                                <div className="engagement-circle" style={{ '--pct': `${stats.punctualityRate}%` }}>
                                    <span>{stats.punctualityRate}%</span>
                                </div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>Punctuality</div>
                            </div>
                            <div className="engagement-metric">
                                <div className="engagement-circle" style={{ '--pct': `${stats.sentimentProfile.positive}%` }}>
                                    <span>{stats.sentimentProfile.positive}%</span>
                                </div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>Positive Tone</div>
                            </div>
                        </div>
                    </div>

                    <div className="stat-card glass-card" style={{ gridColumn: 'span 2' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                            <TrendingUp size={18} style={{ color: 'var(--accent-emerald)' }} />
                            <span className="stat-label">AI-Generated Recommendations</span>
                        </div>
                        <div className="recommendations">
                            <div className="recommendation-item">
                                <span className="rec-emoji">💡</span>
                                <p>Your speaking time is 41% of the average meeting duration — consider allowing more floor time for other participants.</p>
                            </div>
                            <div className="recommendation-item">
                                <span className="rec-emoji">🎯</span>
                                <p>Excellent task completion rate! You've completed 87.5% of assigned action items on time.</p>
                            </div>
                            <div className="recommendation-item">
                                <span className="rec-emoji">⏰</span>
                                <p>Your punctuality streak is at 7 meetings — keep it up to earn the "Perfect Month" badge!</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
        .productivity-dashboard {
          height: 100%;
          overflow-y: auto;
          padding-bottom: 24px;
        }
        .dashboard-header {
          padding: 24px 20px 16px;
        }
        .badges-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }
        .badge-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          background: var(--bg-glass);
          border: 1px solid var(--border-glass);
          border-radius: var(--radius-sm);
          transition: all 0.2s;
        }
        .badge-item:hover {
          background: var(--bg-glass-hover);
          border-color: var(--border-glass-active);
        }
        .badge-icon { font-size: 24px; }
        .badge-name { font-size: 13px; font-weight: 600; }
        .badge-desc { font-size: 11px; color: var(--text-muted); }
        .sentiment-bars { display: flex; flex-direction: column; gap: 10px; }
        .sentiment-bar-row { display: flex; align-items: center; gap: 10px; }
        .sentiment-track {
          flex: 1; height: 8px; background: rgba(255,255,255,0.06);
          border-radius: 4px; overflow: hidden;
        }
        .sentiment-fill {
          height: 100%; border-radius: 4px;
          transition: width 0.8s ease;
        }
        .attendance-chart { display: flex; flex-direction: column; gap: 12px; }
        .attendance-week { display: flex; align-items: center; gap: 12px; }
        .attendance-label { font-size: 12px; color: var(--text-muted); width: 30px; }
        .attendance-bar-track {
          flex: 1; height: 16px; background: rgba(255,255,255,0.04);
          border-radius: 8px; overflow: hidden;
        }
        .attendance-bar-fill {
          height: 100%; background: var(--gradient-brand);
          border-radius: 8px; transition: width 0.6s ease;
        }
        .attendance-value { font-size: 12px; font-weight: 600; width: 40px; }
        .engagement-metrics {
          display: flex; gap: 40px; justify-content: center; padding: 20px 0;
        }
        .engagement-metric { text-align: center; }
        .engagement-circle {
          width: 80px; height: 80px; border-radius: 50%;
          background: conic-gradient(var(--accent-blue) var(--pct), rgba(255,255,255,0.06) var(--pct));
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; font-weight: 700; position: relative;
        }
        .engagement-circle::before {
          content: ''; position: absolute; inset: 6px;
          border-radius: 50%; background: var(--bg-secondary);
        }
        .engagement-circle span { position: relative; z-index: 1; }
        .recommendations { display: flex; flex-direction: column; gap: 12px; }
        .recommendation-item {
          display: flex; gap: 12px; padding: 12px;
          background: var(--bg-glass); border-radius: var(--radius-sm);
          border: 1px solid var(--border-glass);
        }
        .rec-emoji { font-size: 20px; flex-shrink: 0; }
        .recommendation-item p {
          font-size: 13px; color: var(--text-secondary); line-height: 1.5;
        }
      `}</style>
        </div>
    );
}
