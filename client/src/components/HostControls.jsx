import { useState } from 'react';
import { Mic, MicOff, Video as VideoIcon, VideoOff, ScreenShare, QrCode, Users, Shield, Radio, MonitorUp } from 'lucide-react';
import QROverlay from './QROverlay';

export default function HostControls({ meetingTitle }) {
    const [recording, setRecording] = useState(false);
    const [muted, setMuted] = useState(false);
    const [videoOn, setVideoOn] = useState(true);
    const [sharing, setSharing] = useState(false);
    const [showQR, setShowQR] = useState(false);

    return (
        <>
            <div className="host-controls">
                <div className="controls-group">
                    <button
                        className={`btn-icon tooltip ${muted ? '' : 'active'}`}
                        data-tooltip={muted ? 'Unmute' : 'Mute'}
                        onClick={() => setMuted(!muted)}
                        id="btn-mute"
                    >
                        {muted ? <MicOff size={18} /> : <Mic size={18} />}
                    </button>

                    <button
                        className={`btn-icon tooltip ${videoOn ? 'active' : ''}`}
                        data-tooltip={videoOn ? 'Turn off camera' : 'Turn on camera'}
                        onClick={() => setVideoOn(!videoOn)}
                        id="btn-video"
                    >
                        {videoOn ? <VideoIcon size={18} /> : <VideoOff size={18} />}
                    </button>

                    <button
                        className={`btn-icon tooltip ${sharing ? 'active' : ''}`}
                        data-tooltip={sharing ? 'Stop sharing' : 'Share screen'}
                        onClick={() => setSharing(!sharing)}
                        id="btn-screen-share"
                    >
                        <MonitorUp size={18} />
                    </button>

                    <div className="controls-divider"></div>

                    <button
                        className={`control-btn ${recording ? 'recording' : ''}`}
                        onClick={() => setRecording(!recording)}
                        id="btn-record"
                    >
                        <Radio size={16} />
                        <span>{recording ? 'Recording' : 'Record'}</span>
                        {recording && <div className="rec-dot"></div>}
                    </button>

                    <button
                        className="control-btn"
                        onClick={() => setShowQR(true)}
                        id="btn-qr-attendance"
                    >
                        <QrCode size={16} />
                        <span>Attendance</span>
                    </button>

                    <button className="control-btn" id="btn-participants">
                        <Users size={16} />
                        <span>Participants</span>
                    </button>

                    <button className="control-btn" id="btn-host-actions">
                        <Shield size={16} />
                        <span>Host Panel</span>
                    </button>
                </div>

                <button className="btn btn-danger" id="btn-end-meeting" style={{ fontSize: '12px', padding: '8px 16px' }}>
                    End Meeting
                </button>
            </div>

            {showQR && <QROverlay onClose={() => setShowQR(false)} meetingTitle={meetingTitle} />}

            <style>{`
        .host-controls {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 16px;
          background: rgba(17, 24, 39, 0.6);
          border-top: 1px solid var(--border-glass);
          border-bottom: 1px solid var(--border-glass);
        }
        .controls-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .controls-divider {
          width: 1px;
          height: 24px;
          background: var(--border-glass);
          margin: 0 4px;
        }
        .control-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          border: 1px solid var(--border-glass);
          border-radius: var(--radius-sm);
          background: var(--bg-glass);
          color: var(--text-secondary);
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }
        .control-btn:hover {
          background: var(--bg-glass-hover);
          color: var(--text-primary);
          border-color: var(--border-glass-active);
        }
        .control-btn.recording {
          background: rgba(248, 113, 113, 0.12);
          color: var(--accent-rose);
          border-color: rgba(248, 113, 113, 0.3);
        }
        .rec-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--accent-rose);
          animation: pulse 1s ease infinite;
        }
      `}</style>
        </>
    );
}
