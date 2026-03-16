import { useState, useEffect, useRef, FC } from 'react';
import Icon from './Icon';
import {
  PlayIcon,
  PauseIcon,
  CheckmarkCircle01Icon,
  Clock01Icon,
  Add01Icon,
} from '@hugeicons/core-free-icons';

interface AgendaItem {
  id: string;
  title: string;
  duration: number;
  status: 'active' | 'completed' | 'pending';
}

interface AgendaPanelProps {
  agendaItems: AgendaItem[];
  onItemChange?: (items: AgendaItem[]) => void;
}

const AgendaPanel: FC<AgendaPanelProps> = ({ agendaItems, onItemChange }) => {
  const [items, setItems] = useState<AgendaItem[]>(agendaItems);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => { 
    setItems(agendaItems); 
  }, [agendaItems]);

  useEffect(() => {
    const active = items.find(i => i.status === 'active');
    if (active) {
      setActiveId(active.id);
      setCountdown(active.duration * 60);
    }
  }, []);

  useEffect(() => {
    if (activeId && countdown > 0) {
      intervalRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) { 
            if (intervalRef.current) clearInterval(intervalRef.current); 
            return 0; 
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [activeId]);

  const formatTime = (s: number): string => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const startItem = (id: string) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const updated = items.map(item => ({
      ...item,
      status: item.id === id ? 'active' as const : (item.status === 'active' ? 'completed' as const : item.status)
    }));
    setItems(updated);
    setActiveId(id);
    const item = items.find(i => i.id === id);
    if (item) {
      setCountdown(item.duration * 60);
    }
    onItemChange?.(updated);
  };

  const pauseItem = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const completeItem = (id: string) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const updated = items.map(item => ({
      ...item,
      status: item.id === id ? 'completed' as const : item.status
    }));
    setItems(updated);
    setActiveId(null);
    setCountdown(0);
    onItemChange?.(updated);
  };

  const activeItem = items.find(i => i.id === activeId);
  const progress = activeItem ? ((activeItem.duration * 60 - countdown) / (activeItem.duration * 60)) * 100 : 0;

  return (
    <div className="agenda-panel panel">
      <div className="section-header">
        <span className="section-title">📋 Agenda</span>
        <button className="btn-icon" id="btn-add-agenda">
          <Icon icon={Add01Icon} size={16} />
        </button>
      </div>

      {activeId && (
        <div className="agenda-timer-bar">
          <div className="timer-display">
            <Icon icon={Clock01Icon} size={14} />
            <span className="timer-value">{formatTime(countdown)}</span>
            <span className="timer-label">remaining</span>
          </div>
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      )}

      <div className="agenda-list">
        {items.map((item, index) => (
          <div key={item.id} className={`agenda-item ${item.status}`} id={`agenda-item-${item.id}`}>
            <div className="agenda-item-content">
              <span className="agenda-item-title">{item.title}</span>
              <span className="agenda-item-duration">{item.duration} min</span>
            </div>
            <div className="agenda-item-actions">
              {item.status === 'pending' && (
                <button onClick={() => startItem(item.id)} className="btn-icon">
                  <Icon icon={PlayIcon} size={14} />
                </button>
              )}
              {item.status === 'active' && (
                <>
                  <button onClick={pauseItem} className="btn-icon">
                    <Icon icon={PauseIcon} size={14} />
                  </button>
                  <button onClick={() => completeItem(item.id)} className="btn-icon">
                    <Icon icon={CheckmarkCircle01Icon} size={14} />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgendaPanel;
