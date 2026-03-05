import Icon from './Icon';
import { CheckmarkCircle01Icon, Clock01Icon, AlertCircleIcon, ArrowRight01Icon } from '@hugeicons/core-free-icons';

const categoryChips = {
    'Technical': 'chip-blue',
    'Administrative': 'chip-violet',
    'Decision': 'chip-amber',
    'Follow-up': 'chip-cyan',
};

const statusConfig = {
    'completed': { icon: CheckmarkCircle01Icon, color: 'var(--accent-emerald)', label: 'Completed' },
    'in-progress': { icon: Clock01Icon, color: 'var(--accent-amber)', label: 'In Progress' },
    'pending': { icon: AlertCircleIcon, color: 'var(--text-muted)', label: 'Pending' },
};

export default function ActionItems({ items }) {
    return (
        <div className="action-items-section">
            <div className="section-header" style={{ borderTop: '0.0625rem solid var(--border)' }}>
                <span className="section-title">⚡ Action Items</span>
                <span className="chip chip-blue">{items.length}</span>
            </div>

            <div className="action-items-list">
                {items.map((item, index) => {
                    const status = statusConfig[item.status] || statusConfig.pending;
                    const StatusIcon = status.icon;

                    return (
                        <div
                            key={item.id}
                            className="action-item-card glass-card animate-in"
                            style={{ animationDelay: `${index * 0.06}s` }}
                            id={`action-item-${item.id}`}
                        >
                            <div className="ai-card-top">
                                <Icon icon={status.icon} size={16} style={{ color: status.color, flexShrink: 0 }} />
                                <span className="ai-card-title">{item.title}</span>
                            </div>

                            <div className="ai-card-meta">
                                <span className={`chip ${categoryChips[item.category] || 'chip-blue'}`}>
                                    {item.category}
                                </span>
                                <span className="ai-card-assignee">
                                    <Icon icon={ArrowRight01Icon} size={10} />
                                    {item.assignee}
                                </span>
                                <span className="ai-card-deadline">
                                    <Icon icon={Clock01Icon} size={10} />
                                    {item.deadline}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <style>{`
        .action-items-section {
          border-top: 0.0625rem solid var(--border);
        }
        .action-items-list {
          padding: 0.5rem;
          max-height: 18.75rem;
          overflow-y: auto;
        }
        .action-item-card {
          padding: 0.75rem;
          margin-bottom: 0.375rem;
        }
        .ai-card-top {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }
        .ai-card-title {
          font-size: 0.8125rem;
          font-weight: 500;
          line-height: 1.4;
        }
        .ai-card-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
          padding-left: 1.5rem;
        }
        .ai-card-assignee, .ai-card-deadline {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.6875rem;
          color: var(--text-muted);
        }
      `}</style>
        </div>
    );
}
