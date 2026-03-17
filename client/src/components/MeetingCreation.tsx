import { useState, useRef, useEffect, useCallback, FC } from 'react';
import { createPortal } from 'react-dom';
import Icon from './Icon';
import {
  Cancel01Icon,
  Calendar02Icon,
  Location01Icon,
  Link01Icon,
  Delete02Icon,
  Clock01Icon,
} from '@hugeicons/core-free-icons';
import * as chrono from 'chrono-node';

interface Suggestion {
  label: string;
  detail: string;
  date: Date;
}

interface TimeSlot {
  id: number;
  date: Date;
  display: string;
}

interface MeetingFormData {
  title: string;
  modality: 'Online' | 'Offline' | 'Hybrid';
  timeSlots: Array<{ date: string; time: string }>;
}

interface MeetingCreationProps {
  onClose: () => void;
  onSubmit: (data: MeetingFormData) => void;
}

function formatSlotDisplay(date: Date): string {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const isToday = date.toDateString() === now.toDateString();
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  const dayLabel = isToday ? 'Today' : isTomorrow ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });
  const hasTime = date.getHours() !== 0 || date.getMinutes() !== 0;
  const timeStr = hasTime ? ` at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}` : '';

  return `${dayLabel}${timeStr}`;
}

function buildSuggestions(query: string): Suggestion[] {
  const now = new Date();
  const trimmed = query.trim().toLowerCase();

  if (!trimmed) {
    const suggestions: Suggestion[] = [];
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);
    suggestions.push({
      label: 'Now',
      detail: `${now.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })} at ${now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`,
      date: new Date(now),
    });
    suggestions.push({
      label: 'Today',
      detail: now.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' }),
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0),
    });
    const tom = new Date(now);
    tom.setDate(tom.getDate() + 1);
    suggestions.push({
      label: 'Tomorrow',
      detail: tom.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' }),
      date: new Date(tom.getFullYear(), tom.getMonth(), tom.getDate(), 0, 0, 0),
    });
    return suggestions;
  }

  const parsed = chrono.parse(query, now, { forwardDate: true });
  const results: Suggestion[] = [];
  const seen = new Set<string>();

  for (const result of parsed) {
    const d = result.start.date();
    const key = d.toISOString();
    if (seen.has(key)) continue;
    seen.add(key);

    const hasTime = result.start.isCertain('hour');
    const timeStr = hasTime ? ` at ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}` : '';

    const datePart = d.toLocaleDateString('en-US', { day: 'numeric', month: 'long' });
    results.push({
      label: datePart,
      detail: `${d.toLocaleDateString('en-US', { weekday: 'short' })}${timeStr}`,
      date: d,
    });
  }

  if (results.length === 0) {
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayAbbrevs = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    let matchedDay = -1;
    for (let i = 0; i < 7; i++) {
      if (dayNames[i].startsWith(trimmed) || dayAbbrevs[i].startsWith(trimmed)) {
        matchedDay = i;
        break;
      }
    }
    if (matchedDay >= 0) {
      for (let weekOffset = 0; weekOffset < 3; weekOffset++) {
        const target = new Date(now);
        let diff = matchedDay - now.getDay();
        if (diff <= 0) diff += 7;
        target.setDate(target.getDate() + diff + weekOffset * 7);
        target.setHours(0, 0, 0, 0);

        const weekLabel = weekOffset === 0 ? target.toLocaleDateString('en-US', { weekday: 'long' }) : `${target.toLocaleDateString('en-US', { weekday: 'long' })} in ${weekOffset === 1 ? 'one' : 'two'} week${weekOffset > 1 ? 's' : ''}`;
        results.push({
          label: weekLabel,
          detail: target.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' }),
          date: target,
        });
      }
    }
  }

  if (results.length > 0) {
    const relExpressions = ['in 2 weeks', 'in 1 month', 'next week'];
    for (const expr of relExpressions) {
      if (expr.includes(trimmed) && expr !== trimmed) {
        const rel = chrono.parseDate(expr, now, { forwardDate: true });
        if (rel) {
          const key = rel.toISOString();
          if (!seen.has(key)) {
            seen.add(key);
            results.push({
              label: expr.charAt(0).toUpperCase() + expr.slice(1),
              detail: rel.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' }),
              date: rel,
            });
          }
        }
      }
    }
  }

  return results.slice(0, 6);
}

const MeetingCreation: FC<MeetingCreationProps> = ({ onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [modality, setModality] = useState<'Online' | 'Offline' | 'Hybrid'>('Online');
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(0);
  const [slotError, setSlotError] = useState(false);
  const [labelText, setLabelText] = useState('Scheduling Poll Slots');
  const [labelFading, setLabelFading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const inputRowRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const labelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });

  const updateDropdownPos = useCallback(() => {
    if (inputRowRef.current) {
      const rect = inputRowRef.current.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }
  }, []);

  const openDropdown = useCallback(() => {
    const s = buildSuggestions(inputValue);
    setSuggestions(s);
    updateDropdownPos();
    setShowDropdown(true);
    setHighlightIdx(0);
  }, [inputValue, updateDropdownPos]);

  const closeDropdown = useCallback(() => {
    setShowDropdown(false);
  }, []);

  useEffect(() => {
    const s = buildSuggestions(inputValue);
    setSuggestions(s);
    setHighlightIdx(0);
  }, [inputValue]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const inDropdown = dropdownRef.current && dropdownRef.current.contains(e.target as Node);
      const inInputRow = inputRowRef.current && inputRowRef.current.contains(e.target as Node);
      if (!inDropdown && !inInputRow) {
        closeDropdown();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closeDropdown]);

  const selectSuggestion = (suggestion: Suggestion) => {
    setSlots(prev => [...prev, { id: Date.now(), date: suggestion.date, display: formatSlotDisplay(suggestion.date) }]);
    setInputValue('');
    setShowDropdown(false);
    setSlotError(false);

    if (labelTimerRef.current) clearTimeout(labelTimerRef.current);
    setLabelFading(false);
    setLabelText('Scheduling Poll Slots');

    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const removeSlot = (id: number) => {
    setSlots(prev => prev.filter(s => s.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIdx(prev => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIdx(prev => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      selectSuggestion(suggestions[highlightIdx]);
    } else if (e.key === 'Escape') {
      closeDropdown();
    }
  };

  const triggerSlotError = () => {
    setSlotError(true);
    setLabelFading(true);
    setLabelText('There must be at least one slot for a meeting');

    if (labelTimerRef.current) clearTimeout(labelTimerRef.current);
    labelTimerRef.current = setTimeout(() => {
      setLabelFading(true);
      setTimeout(() => {
        setLabelText('Scheduling Poll Slots');
        setTimeout(() => setLabelFading(false), 50);
      }, 400);
    }, 3000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setSlotError(false);
    if (labelText !== 'Scheduling Poll Slots') {
      if (labelTimerRef.current) clearTimeout(labelTimerRef.current);
      setLabelFading(true);
      setTimeout(() => {
        setLabelText('Scheduling Poll Slots');
        setTimeout(() => setLabelFading(false), 50);
      }, 300);
    }
    if (!showDropdown) openDropdown();
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const filledSlots = slots.filter(s => s.date);
    if (filledSlots.length === 0) {
      triggerSlotError();
      inputRef.current?.focus();
      return;
    }
    onSubmit({
      title,
      modality,
      timeSlots: filledSlots.map(s => ({
        date: s.date.toISOString().split('T')[0],
        time: s.date.toTimeString().slice(0, 5),
      })),
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Create New Meeting</h2>
          <button className="btn-icon" onClick={onClose}>
            <Icon icon={Cancel01Icon} size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Meeting Title</label>
            <input
              type="text"
              className="input"
              placeholder="e.g., Sprint Planning — Q2 Review"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              id="input-meeting-title"
            />
          </div>

          <div className="form-group" style={{ marginBottom: '8px' }}>
            <label className="form-label">Meeting Modality</label>
            <div className="modality-options">
              {(['Online', 'Offline', 'Hybrid'] as const).map(m => (
                <button
                  key={m}
                  type="button"
                  className={`modality-btn ${modality === m ? 'active' : ''}`}
                  onClick={() => setModality(m)}
                  id={`modality-${m.toLowerCase()}`}
                >
                  {m === 'Online' && <Icon icon={Link01Icon} size={14} />}
                  {m === 'Offline' && <Icon icon={Location01Icon} size={14} />}
                  {m === 'Hybrid' && <><Icon icon={Link01Icon} size={14} /><Icon icon={Location01Icon} size={14} /></>}
                  {m}
                </button>
              ))}
            </div>
          </div>

          {modality === 'Online' && (
            <div className="form-group" style={{
              padding: '0', background: 'none',
              borderRadius: 'var(--radius-sm)', border: 'none'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--accent-blue)' }}>
                A Jitsi Meet URL will be auto-generated
              </div>
            </div>
          )}

          {(modality === 'Offline' || modality === 'Hybrid') && (
            <div className="form-group">
              <label className="form-label">Physical Location</label>
              <input
                type="text"
                className="input"
                placeholder="e.g., Room 301, Academic Block A"
                id="input-location"
              />
            </div>
          )}

          <div className="form-group">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label className={`form-label slot-label${labelFading ? ' fading' : ''}${slotError ? ' slot-label-error' : ''}`}>
                {labelText}
              </label>
            </div>

            <div className="nldate-wrapper">
              <div ref={inputRowRef} className={`nldate-input-row${slotError ? ' nldate-error' : ''}`}>
                <Icon icon={Clock01Icon} size={14} className="nldate-icon" />
                <input
                  ref={inputRef}
                  type="text"
                  className="nldate-input"
                  placeholder="e.g., tomorrow at 2pm, next monday, 9 mar..."
                  value={inputValue}
                  onChange={handleInputChange}
                  onFocus={openDropdown}
                  onKeyDown={handleKeyDown}
                  autoComplete="off"
                />
                {inputValue && (
                  <button type="button" className="nldate-clear" onClick={() => { setInputValue(''); inputRef.current?.focus(); }}>
                    <Icon icon={Cancel01Icon} size={12} />
                  </button>
                )}
              </div>
            </div>

            {showDropdown && suggestions.length > 0 && createPortal(
              <div
                ref={dropdownRef}
                className="nldate-dropdown"
                style={{ top: dropdownPos.top, left: dropdownPos.left, width: dropdownPos.width }}
              >
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`nldate-option${i === highlightIdx ? ' highlighted' : ''}`}
                    onMouseEnter={() => setHighlightIdx(i)}
                    onClick={() => selectSuggestion(s)}
                  >
                    <span className="nldate-option-label">{s.label}</span>
                    <span className="nldate-option-detail">{s.detail}</span>
                  </button>
                ))}
              </div>,
              document.body
            )}

            {slots.map(slot => (
              <div key={slot.id} className="slot-row">
                <div className="slot-row-content">
                  <Icon icon={Calendar02Icon} size={14} className="slot-row-icon" />
                  <span>{slot.display}</span>
                </div>
                <button type="button" className="btn-icon" onClick={() => removeSlot(slot.id)} style={{ width: '20px', height: '20px' }}>
                  <Icon icon={Delete02Icon} size={14} />
                </button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" id="btn-create-meeting">
              <Icon icon={Calendar02Icon} size={16} />
              Create Meeting
            </button>
          </div>
        </form>

        <style>{`
          .modality-options {
            display: flex; gap: 8px;
          }
          .modality-btn {
            flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
            padding: 10px; border: 1px solid var(--border-glass);
            border-radius: var(--radius-sm); background: var(--bg-glass);
            color: var(--text-secondary); font-family: 'Inter', sans-serif;
            font-size: 13px; font-weight: 500; cursor: pointer;
            transition: all 0.2s ease;
          }
          .modality-btn:hover {
            background: var(--bg-glass-hover); border-color: var(--border-glass-active);
          }
          .modality-btn.active {
            background: var(--accent-blue); color: white; border-color: var(--accent-blue);
          }
        `}</style>
      </div>
    </div>
  );
};

export default MeetingCreation;
