import HostControls from "./HostControls";
import Icon from "./Icon";
import { UserGroupIcon, FullScreenIcon } from "@hugeicons/core-free-icons";
import { JitsiMeeting } from "@jitsi/react-sdk";

export default function VideoArea({
  meetingTitle,
  participants,
  jitsiRoomName,
  modality,
  currentUser,
}) {
  return (
    <div className="video-area">
      <div className="video-header">
        <div>
          <h2 className="video-meeting-title">
            {meetingTitle || "No Active Meeting"}
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
          {jitsiRoomName && (modality === "Online" || modality === "Hybrid") ? (
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
                displayName: currentUser?.name || "User",
              }}
              onApiReady={(externalApi) => {
                externalApi.addListener("participantJoined", (event) => {
                  console.log("User Joined:", event.displayName);
                });
              }}
              getIFrameRef={(iframeRef) => {
                iframeRef.style.height = "100%";
                iframeRef.style.width = "100%";
              }}
            />
          ) : modality === "Offline" ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                color: "var(--text-muted)",
              }}
            >
              This is an Offline meeting. Location details are in the schedule.
            </div>
          ) : (
            <div className="video-grid">
              {(
                participants || [
                  "Host",
                  "Participant 1",
                  "Participant 2",
                  "Participant 3",
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
                        {typeof p === "string"
                          ? p.charAt(0).toUpperCase()
                          : "?"}
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
          padding: 0.75rem 1.25rem;
          border-bottom: 0.0625rem solid var(--border);
        }
        .video-meeting-title {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 0.125rem;
        }
        .video-meeting-meta {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .video-container {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.25rem;
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
          gap: 0.5rem;
          width: 100%;
          height: 100%;
        }
        .video-tile {
          position: relative;
          background: var(--bg-elevated);
          border: 0.0625rem solid var(--border);
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.625rem;
          animation: slideUp 0.4s ease both;
          transition: border-color 0.3s;
        }
        .video-tile:hover {
          border-color: var(--border-hover);
        }
        .video-tile-avatar {
          width: 3.5rem;
          height: 3.5rem;
          border-radius: 50%;
          background: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.375rem;
          font-weight: 700;
          color: white;
        }
        .video-tile-name {
          font-size: 0.8125rem;
          font-weight: 500;
          color: var(--text-secondary);
        }
        .host-badge {
          position: absolute;
          top: 0.625rem;
          right: 0.625rem;
          padding: 0.1875rem 0.5rem;
          background: var(--primary);
          border-radius: 6.25rem;
          font-size: 0.625rem;
          font-weight: 700;
          color: white;
          letter-spacing: 0.03125rem;
        }
      `}</style>
    </div>
  );
}
