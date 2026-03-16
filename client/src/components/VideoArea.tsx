import { FC } from 'react';
import HostControls from './HostControls';
import Icon from './Icon';
import { UserGroupIcon, FullScreenIcon } from '@hugeicons/core-free-icons';
import { JitsiMeeting } from '@jitsi/react-sdk';

interface VideoAreaProps {
  meetingTitle: string;
  participants: string[];
  jitsiRoomName: string;
  modality: 'Online' | 'Offline' | 'Hybrid';
  currentUser: { name: string } | null;
}

const VideoArea: FC<VideoAreaProps> = ({
  meetingTitle,
  participants,
  jitsiRoomName,
  modality,
  currentUser,
}) => {
  return (
    <div className="video-area">
      <div className="video-header">
        <div>
          <h2 className="video-meeting-title">
            {meetingTitle || 'No Active Meeting'}
          </h2>
          <div className="video-meeting-meta">
            <Icon icon={UserGroupIcon} size={14} />
            <span>{participants?.length || 0} participants</span>
          </div>
        </div>
        <button
          className="btn-icon tooltip"
          data-tooltip="Fullscreen"
          id="btn-fullscreen"
        >
          <Icon icon={FullScreenIcon} size={16} />
        </button>
      </div>

      <div className="video-container">
        <div className="video-placeholder">
          {jitsiRoomName && (modality === 'Online' || modality === 'Hybrid') ? (
            <JitsiMeeting
              domain="meet.jit.si"
              roomName={jitsiRoomName}
              configOverwrite={{
                startWithAudioMuted: false,
                disableModeratorIndicator: true,
                startScreenSharing: false,
                enableEmailInStats: false,
              }}
              interfaceConfigOverwrite={{
                DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
              }}
              userInfo={{
                displayName: currentUser?.name || 'User',
              }}
              onApiReady={(externalApi) => {
                externalApi.addListener('participantJoined', (event: any) => {
                  console.log('User Joined:', event.displayName);
                });
              }}
              getIFrameRef={(iframeRef: HTMLIFrameElement) => {
                iframeRef.style.height = '100%';
                iframeRef.style.width = '100%';
              }}
            />
          ) : modality === 'Offline' ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: 'var(--text-muted)',
              }}
            >
              This is an Offline meeting. Location details are in the schedule.
            </div>
          ) : (
            <div className="video-grid">
              {(
                participants || [
                  'Host',
                  'Participant 1',
                  'Participant 2',
                  'Participant 3',
                ]
              )
                .slice(0, 4)
                .map((p, i) => (
                  <div
                    key={i}
                    className="video-tile"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <div className="video-tile-avatar">
                      <span>
                        {typeof p === 'string'
                          ? p.charAt(0).toUpperCase()
                          : '?'}
                      </span>
                    </div>
                    <div className="video-tile-name">{p}</div>
                    {i === 0 && <div className="host-badge">HOST</div>}
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      <HostControls meetingTitle={meetingTitle} />
    </div>
  );
};

export default VideoArea;
