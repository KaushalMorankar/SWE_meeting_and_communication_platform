import { useCallback, useState, useEffect, useRef, useMemo } from "react";
import HostControls, { type HostControlsRef } from "./HostControls";
import useKeyboardShortcuts from "../hooks/useKeyboardShortcuts";
import Icon from "./Icon";
import {
  UserGroupIcon,
  FullScreenIcon,
  MinimizeScreenIcon,
  SidebarLeftIcon,
  SidebarRightIcon,
} from "@hugeicons/core-free-icons";
import ShortcutTooltip from "./ShortcutTooltip";
import Kbd from "./Kbd";
import useWebRTC from "../hooks/useWebRTC";
import { useSocket } from "../context/SocketContext";

const SERVER_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5001").replace(/\/api$/, "");

interface VideoTileProps {
  stream: MediaStream | null;
  name?: string;
  profileImage?: string | null;
  muted: boolean;
  isSelf: boolean;
  speaking?: boolean;
}

interface VideoAreaProps {
  meetingId?: string;
  meetingTitle?: string;
  participants?: Array<{ _id?: string; id?: string; name?: string; profileImage?: string | null }>;
  modality?: string;
  currentUser?: { _id?: string; name?: string; profileImage?: string | null } | null;
  fullscreenRef?: React.RefObject<HTMLDivElement | null>;
  agendaPanelOpen: boolean;
  rightPanelOpen: boolean;
  onToggleAgendaPanel: () => void;
  onToggleRightPanel: () => void;
  onMeetingEnded?: () => void;
  onTriggerAddActionItem?: () => void;
  onTriggerAddAgendaItem?: () => void;
}

function VideoTile({ stream, name, profileImage, muted, isSelf, speaking }: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hasVideo, setHasVideo] = useState<boolean>(false);

  useEffect(() => {
    if (!stream) { setHasVideo(false); return; }

    const videoTracks = stream.getVideoTracks();
    setHasVideo(videoTracks.some((t) => t.enabled && t.readyState === 'live'));

    const onTrackChange = () => {
      setHasVideo(stream.getVideoTracks().some((t) => t.enabled && t.readyState === 'live'));
    };

    for (const track of videoTracks) {
      track.addEventListener('unmute', onTrackChange);
      track.addEventListener('mute', onTrackChange);
      track.addEventListener('ended', onTrackChange);
    }
    stream.addEventListener('addtrack', onTrackChange);
    stream.addEventListener('removetrack', onTrackChange);

    return () => {
      for (const track of videoTracks) {
        track.removeEventListener('unmute', onTrackChange);
        track.removeEventListener('mute', onTrackChange);
        track.removeEventListener('ended', onTrackChange);
      }
      stream.removeEventListener('addtrack', onTrackChange);
      stream.removeEventListener('removetrack', onTrackChange);
    };
  }, [stream]);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const initial: string = name?.charAt(0)?.toUpperCase() || "?";

  return (
    <div className={`video-tile ${speaking ? "speaking" : ""}`}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        className="video-tile-video"
        style={isSelf
          ? { transform: "scaleX(-1)", display: hasVideo ? undefined : "none" }
          : { display: hasVideo ? undefined : "none" }
        }
      />
      {!hasVideo && (
        <div className="video-tile-avatar">
          {profileImage ? (
            <img
              src={`${SERVER_BASE}${profileImage}`}
              alt=""
              className="video-tile-avatar-img"
            />
          ) : (
            <span>{initial}</span>
          )}
        </div>
      )}
      <div className="video-tile-name">
        {name || "User"}
        {isSelf && " (You)"}
      </div>
      {isSelf && <div className="self-badge">YOU</div>}
    </div>
  );
}

export default function VideoArea({
  meetingId,
  meetingTitle,
  participants,
  modality,
  currentUser,
  fullscreenRef,
  agendaPanelOpen,
  rightPanelOpen,
  onToggleAgendaPanel,
  onToggleRightPanel,
  onMeetingEnded,
  onTriggerAddActionItem,
  onTriggerAddAgendaItem,
}: VideoAreaProps) {
  const { socket } = useSocket();
  const connected = socket ? socket.connected : false;
  const {
    localStream,
    peers,
    audioEnabled,
    videoEnabled,
    screenStream,
    mediaError,
    joinRoom,
    leaveRoom,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
  } = useWebRTC(socket, meetingId ?? null, currentUser || null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const hostControlsRef = useRef<HostControlsRef | null>(null);

  const handleJoin = useCallback(async () => {
    const success = await joinRoom();
    if (success) setHasJoined(true);
  }, [joinRoom]);

  const handleLeave = useCallback(() => {
    leaveRoom();
    setHasJoined(false);
  }, [leaveRoom]);

  const meetingShortcuts = useMemo(() => [
    { key: 'm', handler: () => hasJoined && toggleAudio(), allowInInput: false },
    { key: 'r', handler: () => hasJoined && hostControlsRef.current?.toggleRecording(), allowInInput: false },
    { key: 'c', handler: () => hasJoined && toggleVideo(), allowInInput: false },
    { key: 'a', handler: () => onTriggerAddAgendaItem?.(), allowInInput: false },
    { key: 'a', shift: true, handler: () => onTriggerAddActionItem?.(), allowInInput: false },
    { key: 'Enter', handler: () => !hasJoined && handleJoin(), allowInInput: false },
    { key: 'l', mod: true, shift: true, handler: () => hasJoined && handleLeave(), allowInInput: false },
    { key: 'e', mod: true, shift: true, handler: () => hasJoined && hostControlsRef.current?.endMeeting(), allowInInput: false },
  ], [hasJoined, toggleAudio, toggleVideo, handleJoin, handleLeave, onTriggerAddActionItem, onTriggerAddAgendaItem]);

  useKeyboardShortcuts(meetingShortcuts);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  useEffect(() => {
    setHasJoined(false);
  }, [meetingId]);

  const toggleFullscreen = useCallback(() => {
    const target = fullscreenRef?.current;
    if (!target) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      target.requestFullscreen().catch(() => {});
    }
  }, [fullscreenRef]);

  const totalParticipants = 1 + peers.length;

  const gridClass =
    totalParticipants <= 1
      ? "grid-1"
      : totalParticipants <= 2
        ? "grid-2"
        : totalParticipants <= 4
          ? "grid-4"
          : totalParticipants <= 6
            ? "grid-6"
            : "grid-many";

  return (
    <div className="video-area">
      <div className="video-header">
        {!agendaPanelOpen && (
          <ShortcutTooltip keys={["mod", "["]} position="right">
            <button className="video-panel-toggle" onClick={onToggleAgendaPanel}>
              <Icon icon={SidebarLeftIcon} size={16} />
            </button>
          </ShortcutTooltip>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 className="video-meeting-title">{meetingTitle || "No Active Meeting"}</h2>
          <div className="video-meeting-meta">
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: connected ? '#22c55e' : '#ef4444', flexShrink: 0 }} title={connected ? 'Connected' : 'Disconnected'} />
            <Icon icon={UserGroupIcon} size={14} />
            <span>
              {hasJoined ? `${totalParticipants} in call` : `${participants?.length || 0} participants`}
            </span>
          </div>
        </div>
        <ShortcutTooltip keys={["F"]}>
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
          <ShortcutTooltip keys={["mod", "]"]} position="left">
            <button className="video-panel-toggle" onClick={onToggleRightPanel}>
              <Icon icon={SidebarRightIcon} size={16} />
            </button>
          </ShortcutTooltip>
        )}
      </div>

      <div className="video-container">
        <div className="video-placeholder">
          {modality === "Offline" ? (
            <div className="video-offline-message">
              This is an Offline meeting. Location details are in the schedule.
            </div>
          ) : !hasJoined ? (
            <div className="video-prejoin">
              <div className="prejoin-card">
                {mediaError && (
                  <p style={{ color: 'var(--danger, #ef4444)', fontSize: '0.875rem', textAlign: 'center', marginBottom: '0.5rem' }}>{mediaError}</p>
                )}
                <div className="prejoin-avatar">
                  {currentUser?.profileImage ? (
                    <img
                      src={`${SERVER_BASE}${currentUser.profileImage}`}
                      alt=""
                      className="prejoin-avatar-img"
                    />
                  ) : (
                    <span>{currentUser?.name?.charAt(0)?.toUpperCase() || "U"}</span>
                  )}
                </div>
                <h3 className="prejoin-title">{meetingTitle}</h3>
                <p className="prejoin-subtitle">{mediaError ? 'Allow camera/mic access and try again.' : 'Ready to join?'}</p>
                <button className="btn btn-primary prejoin-btn" onClick={handleJoin}>
                  {mediaError ? 'Try Again' : <>Join Meeting <Kbd keys={['↵']} className="prejoin-enter" /></>}
                </button>
              </div>
            </div>
          ) : (
            <>
            {mediaError && (
              <div style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', color: '#f59e0b', background: 'rgba(245,158,11,0.1)', borderRadius: '0.375rem', marginBottom: '0.375rem', textAlign: 'center' }}>
                {mediaError}
              </div>
            )}
            <div className={`video-grid ${gridClass}`}>
              <VideoTile
                stream={screenStream || localStream}
                name={currentUser?.name}
                profileImage={currentUser?.profileImage}
                muted={true}
                isSelf={true}
              />
              {peers.map((peer) => (
                <VideoTile
                  key={peer.socketId}
                  stream={peer.stream}
                  name={peer.name}
                  profileImage={peer.profileImage}
                  muted={false}
                  isSelf={false}
                />
              ))}
            </div>
            </>
          )}
        </div>
      </div>

      <HostControls
        ref={hostControlsRef}
        meetingId={meetingId}
        meetingTitle={meetingTitle}
        audioEnabled={audioEnabled}
        videoEnabled={videoEnabled}
        screenSharing={!!screenStream}
        onToggleAudio={toggleAudio}
        onToggleVideo={toggleVideo}
        onToggleScreenShare={toggleScreenShare}
        onLeave={handleLeave}
        hasJoined={hasJoined}
        onMeetingEnded={onMeetingEnded}
      />

    </div>
  );
}
