import HostControls from './HostControls';
import { Users, Maximize2 } from 'lucide-react';

export default function VideoArea({ meetingTitle, participants }) {
    return (
        <div className="video-area">
            <div className="video-header">
                <div>
                    <h2 className="video-meeting-title">{meetingTitle || 'No Active Meeting'}</h2>
                    <div className="video-meeting-meta">
                        <Users size={14} />
                        <span>{participants?.length || 0} participants</span>
                    </div>
                </div>
                <button className="btn-icon tooltip" data-tooltip="Fullscreen" id="btn-fullscreen">
                    <Maximize2 size={16} />
                </button>
            </div>

            <div className="video-container">
                <div className="video-placeholder">
                    <div className="video-grid">
                        {(participants || ['Host', 'Participant 1', 'Participant 2', 'Participant 3']).slice(0, 4).map((p, i) => (
                            <div key={i} className="video-tile" style={{ animationDelay: `${i * 0.1}s` }}>
                                <div className="video-tile-avatar">
                                    <span>{typeof p === 'string' ? p.charAt(0).toUpperCase() : '?'}</span>
                                </div>
                                <div className="video-tile-name">{p}</div>
                                {i === 0 && <div className="host-badge">HOST</div>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <HostControls meetingTitle={meetingTitle} />

            <style>{`
        .video-area {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: var(--bg-primary);
        }
        .video-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 20px;
          border-bottom: 1px solid var(--border-glass);
        }
        .video-meeting-title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 2px;
        }
        .video-meeting-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--text-muted);
        }
        .video-container {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          overflow: hidden;
        }
        .video-placeholder {
          width: 100%;
          height: 100%;
          border-radius: var(--radius-lg);
          overflow: hidden;
        }
        .video-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
          width: 100%;
          height: 100%;
        }
        .video-tile {
          position: relative;
          background: linear-gradient(135deg, rgba(79, 142, 247, 0.05), rgba(124, 92, 252, 0.05));
          border: 1px solid var(--border-glass);
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          animation: slideUp 0.4s ease both;
          transition: border-color 0.3s;
        }
        .video-tile:hover {
          border-color: var(--border-glass-active);
        }
        .video-tile-avatar {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: var(--gradient-brand);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          font-weight: 700;
          color: white;
        }
        .video-tile-name {
          font-size: 13px;
          font-weight: 500;
          color: var(--text-secondary);
        }
        .host-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          padding: 3px 8px;
          background: var(--gradient-brand);
          border-radius: 100px;
          font-size: 10px;
          font-weight: 700;
          color: white;
          letter-spacing: 0.5px;
        }
      `}</style>
        </div>
    );
}
