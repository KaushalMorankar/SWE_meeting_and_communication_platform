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
        </>
    );
}
