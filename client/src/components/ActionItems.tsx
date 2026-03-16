import { FC } from 'react';
import Icon from './Icon';
import { CheckmarkCircle01Icon, Clock01Icon, AlertCircleIcon, ArrowRight01Icon } from '@hugeicons/core-free-icons';

interface ActionItem {
  id: string;
  title: string;
  status: 'completed' | 'in-progress' | 'pending';
  category: string;
  assignee: string;
  deadline: string;
}

interface ActionItemsProps {
  items: ActionItem[];
}

const categoryChips: { [key: string]: string } = {
  'Technical': 'chip-blue',
  'Administrative': 'chip-violet',
  'Decision': 'chip-amber',
  'Follow-up': 'chip-cyan',
};

const statusConfig: { [key: string]: any } = {
  'completed': { icon: CheckmarkCircle01Icon, color: 'var(--accent-emerald)', label: 'Completed' },
  'in-progress': { icon: Clock01Icon, color: 'var(--accent-amber)', label: 'In Progress' },
  'pending': { icon: AlertCircleIcon, color: 'var(--text-muted)', label: 'Pending' },
};

const ActionItems: FC<ActionItemsProps> = ({ items }) => {
  return (
    <div className="action-items-section">
      <div className="section-header" style={{ borderTop: '1px solid var(--border-glass)' }}>
        <span className="section-title">⚡ Action Items</span>
        <span className="chip chip-blue">{items.length}</span>
      </div>

      <div className="action-items-list">
        {items.map((item, index) => {
          const status = statusConfig[item.status] || statusConfig.pending;

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
          border-top: 1px solid var(--border-glass);
        }
        .action-items-list {
          padding: 8px;
          max-height: 300px;
          overflow-y: auto;
        }
        .action-item-card {
          padding: 12px;
          margin-bottom: 6px;
        }
        .ai-card-top {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          margin-bottom: 8px;
        }
        .ai-card-title {
          font-size: 13px;
          font-weight: 500;
          line-height: 1.4;
        }
        .ai-card-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          padding-left: 24px;
        }
        .ai-card-assignee, .ai-card-deadline {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
};

export default ActionItems;
