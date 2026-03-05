import { useCallback, useState, useEffect } from "react";
import HostControls from "./HostControls";
import Icon from "./Icon";
import { UserGroupIcon, FullScreenIcon, MinimizeScreenIcon, SidebarLeftIcon, SidebarRightIcon } from "@hugeicons/core-free-icons";
import { JitsiMeeting } from "@jitsi/react-sdk";
import ShortcutTooltip from "./ShortcutTooltip";

export default function VideoArea({
  meetingId,
  meetingTitle,
  participants,
  jitsiRoomName,
  modality,
  currentUser,
  fullscreenRef,
  agendaPanelOpen,
  rightPanelOpen,
  onToggleAgendaPanel,
  onToggleRightPanel,
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const target = fullscreenRef?.current;
    if (!target) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      target.requestFullscreen().catch(() => {});
    }
  }, [fullscreenRef]);

  return (
    <div className="video-area">
      <div className="video-header">
        {!agendaPanelOpen && (
          <ShortcutTooltip keys={['mod', '[']} position="right">
            <button className="video-panel-toggle" onClick={onToggleAgendaPanel}>
              <Icon icon={SidebarLeftIcon} size={16} />
            </button>
          </ShortcutTooltip>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 className="video-meeting-title">
            {meetingTitle || "No Active Meeting"}
          </h2>
          <div className="video-meeting-meta">
            <Icon icon={UserGroupIcon} size={14} />
            <span>{participants?.length || 0} participants</span>
          </div>
        </div>
        <ShortcutTooltip keys={['F']}>
          <button
            className="btn-icon"
            id="btn-fullscreen"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            <Icon icon={isFullscreen ? MinimizeScreenIcon : FullScreenIcon} size={16} />
          </button>
        </ShortcutTooltip>
        {!rightPanelOpen && (
          <ShortcutTooltip keys={['mod', ']']} position="left">
            <button className="video-panel-toggle" onClick={onToggleRightPanel}>
              <Icon icon={SidebarRightIcon} size={16} />
            </button>
          </ShortcutTooltip>
        )}
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
                disableThirdPartyRequests: true,
                prejoinConfig: { enabled: false },
                disableLocalVideoFlip: true,
                toolbarButtons: [
                  "camera",
                  "chat",
                  "desktop",
                  "fullscreen",
                  "hangup",
                  "microphone",
                  "participants-pane",
                  "raisehand",
                  "select-background",
                  "settings",
                  "tileview",
                  "toggle-camera",
                  "videoquality",
                ],
                toolbarConfig: {
                  alwaysVisible: true,
                },
                customTheme: {
                  palette: {
                    uiBackground: "#100F0F",
                    ui01: "#1C1B1A",
                    ui02: "#282726",
                    ui03: "#343331",
                    ui04: "#403E3C",
                    ui05: "#575653",
                    action01: "#24847B",
                    action01Hover: "#2F968D",
                    action01Active: "#1C6C66",
                    disabled01: "#122F2C",
                    action02: "#282726",
                    action02Hover: "#343331",
                    action02Active: "#1C1B1A",
                    action03: "transparent",
                    action03Hover: "#343331",
                    action03Active: "#1C1B1A",
                    actionDanger: "#D14D41",
                    actionDangerHover: "#E8705F",
                    actionDangerActive: "#AF3029",
                    text01: "#CECDC3",
                    text02: "#9F9D96",
                    text03: "#878580",
                    text04: "#B7B5AC",
                    textError: "#E8705F",
                    icon01: "#CECDC3",
                    icon02: "#9F9D96",
                    icon03: "#878580",
                    iconError: "#E8705F",
                    field01: "#1C1B1A",
                    link01: "#3AA99F",
                    link01Hover: "#5ABDAC",
                    link01Active: "#24847B",
                    success01: "#879A39",
                    success02: "#A0AF54",
                    warning01: "#D0A215",
                    warning02: "#DFB431",
                    support01: "#DA702C",
                    support02: "#D14D41",
                    support03: "#CE5D97",
                    support04: "#8B7EC8",
                    support05: "#5E409D",
                    support06: "#4385BE",
                    support07: "#3AA99F",
                    support08: "#879A39",
                    support09: "#2F968D",
                    bottomSheet: "#1C1B1A",
                    surface02: "#282726",
                  },
                  typography: {
                    font: {
                      weightRegular: "400",
                      weightSemiBold: "600",
                    },
                  },
                  shape: {
                    borderRadius: 10,
                    boxShadow:
                      "inset 0px -1px 0px rgba(206, 205, 195, 0.1)",
                  },
                },
              }}
              interfaceConfigOverwrite={{
                DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
                SHOW_JITSI_WATERMARK: false,
                SHOW_WATERMARK_FOR_GUESTS: false,
                SHOW_BRAND_WATERMARK: false,
                SHOW_POWERED_BY: false,
                DEFAULT_BACKGROUND: "#100F0F",
                MOBILE_APP_PROMO: false,
                HIDE_INVITE_MORE_HEADER: true,
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
                iframeRef.style.borderRadius = "0.618rem";
                iframeRef.style.border = "1px solid #403E3C";
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

      <HostControls meetingId={meetingId} meetingTitle={meetingTitle} />

      <style>{`
        .video-area {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: var(--bg-primary);
		  border: 0.0625rem solid var(--border);
		  border-radius: var(--radius-md);
		  overflow: hidden;
        }
        .video-panel-toggle {
          flex-shrink: 0;
          width: 2rem;
          height: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-card);
          border: 0.0625rem solid var(--border);
          border-radius: var(--radius-sm);
          color: var(--text-muted);
          cursor: pointer;
          transition: background 0.2s, color 0.2s, border-color 0.2s;
          padding: 0;
        }
        .video-panel-toggle:hover {
          background: var(--bg-hover);
          color: var(--primary);
          border-color: var(--border-hover);
        }
        .video-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
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
