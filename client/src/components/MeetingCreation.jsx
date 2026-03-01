import { useState } from 'react';
import { X, Calendar, MapPin, Link, Clock, Plus, Trash2 } from 'lucide-react';

export default function MeetingCreation({ onClose, onSubmit }) {
    const [title, setTitle] = useState('');
    const [modality, setModality] = useState('Online');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [timeSlots, setTimeSlots] = useState([{ date: '', time: '' }]);

    const addSlot = () => {
        if (timeSlots.length < 5) {
            setTimeSlots([...timeSlots, { date: '', time: '' }]);
        }
    };

    const removeSlot = (index) => {
        setTimeSlots(timeSlots.filter((_, i) => i !== index));
    };

    const updateSlot = (index, field, value) => {
        const updated = [...timeSlots];
        updated[index] = { ...updated[index], [field]: value };
        setTimeSlots(updated);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ title, modality, date, time, timeSlots });
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Create New Meeting</h2>
                    <button className="btn-icon" onClick={onClose}>
                        <X size={18} />
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

                    <div className="form-group">
                        <label className="form-label">Meeting Modality</label>
                        <div className="modality-options">
                            {['Online', 'Offline', 'Hybrid'].map(m => (
                                <button
                                    key={m}
                                    type="button"
                                    className={`modality-btn ${modality === m ? 'active' : ''}`}
                                    onClick={() => setModality(m)}
                                    id={`modality-${m.toLowerCase()}`}
                                >
                                    {m === 'Online' && <Link size={14} />}
                                    {m === 'Offline' && <MapPin size={14} />}
                                    {m === 'Hybrid' && <><Link size={14} /><MapPin size={14} /></>}
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>

                    {modality === 'Online' && (
                        <div className="form-group" style={{
                            padding: '12px', background: 'rgba(79, 142, 247, 0.06)',
                            borderRadius: 'var(--radius-sm)', border: '1px solid rgba(79, 142, 247, 0.1)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--accent-blue)' }}>
                                <Link size={14} />
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

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div className="form-group">
                            <label className="form-label">Date</label>
                            <input
                                type="date"
                                className="input"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                                id="input-date"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Time</label>
                            <input
                                type="time"
                                className="input"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                required
                                id="input-time"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <label className="form-label">Scheduling Poll Slots (REQ-1: min 5 recommended)</label>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={addSlot}
                                style={{ fontSize: '11px', padding: '4px 10px' }}
                                disabled={timeSlots.length >= 5}
                            >
                                <Plus size={12} /> Add Slot
                            </button>
                        </div>
                        {timeSlots.map((slot, i) => (
                            <div key={i} style={{ display: 'flex', gap: '8px', marginTop: '8px', alignItems: 'center' }}>
                                <input
                                    type="date"
                                    className="input"
                                    value={slot.date}
                                    onChange={(e) => updateSlot(i, 'date', e.target.value)}
                                    style={{ flex: 1 }}
                                />
                                <input
                                    type="time"
                                    className="input"
                                    value={slot.time}
                                    onChange={(e) => updateSlot(i, 'time', e.target.value)}
                                    style={{ flex: 1 }}
                                />
                                {timeSlots.length > 1 && (
                                    <button type="button" className="btn-icon" onClick={() => removeSlot(i)} style={{ flexShrink: 0 }}>
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" id="btn-create-meeting">
                            <Calendar size={16} />
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
            background: rgba(79, 142, 247, 0.12); border-color: rgba(79, 142, 247, 0.3);
            color: var(--accent-blue);
          }
        `}</style>
            </div>
        </div>
    );
}
