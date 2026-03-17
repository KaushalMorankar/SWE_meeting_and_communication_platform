import { useState, useEffect, useRef, useMemo, useCallback, FC } from "react";
import "./index.css";
import TopBar from "./components/TopBar";
import Sidebar from "./components/Sidebar";
import AgendaPanel from "./components/AgendaPanel";
import VideoArea from "./components/VideoArea";
import MeetingCreation from "./components/MeetingCreation";
import ProductivityDashboard from "./components/ProductivityDashboard";
import useKeyboardShortcuts from "./hooks/useKeyboardShortcuts";
import Icon from "./components/Icon";
import { Calendar02Icon, Clock01Icon, UserIcon } from "@hugeicons/core-free-icons";

// Auth Pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { useAuth } from "./context/AuthContext";
import { useSocket } from "./context/SocketContext";

const API_BASE = "http://localhost:5000/api";

const VIEW_KEYS = ['dashboard', 'meeting', 'schedule'];
interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  host: string;
  status: 'scheduled' | 'completed';
  modality: 'Online' | 'Offline' | 'Hybrid';
  jitsiRoomName?: string;
  participants?: string[];
}


interface MeetingFormData {
  title: string;
  modality: 'Online' | 'Offline' | 'Hybrid';
  timeSlots: Array<{ date: string; time: string }>;
}

interface AgendaItem {
  id: string;
  title: string;
  duration: number;
  status: 'active' | 'completed' | 'pending';
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getDate()} ${d.toLocaleString("en-US", { month: "short" })} ${d.getFullYear()}`;
}

interface DashboardAppProps {}

const DashboardApp: FC<DashboardAppProps> = () => {
  const { user, logout } = useAuth();
  const { socket } = useSocket();

  const [currentView, setCurrentView] = useState<string>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showCreateMeeting, setShowCreateMeeting] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window === "undefined") return "dark";
    return window.localStorage.getItem("theme") === "light" ? "light" : "dark";
  });

  // Data state
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);

  const [agendaPanelOpen, setAgendaPanelOpen] = useState(true);
  const meetingLayoutRef = useRef<HTMLDivElement>(null);

  const toggleAgendaPanel = useCallback(() => setAgendaPanelOpen(prev => !prev), []);
  const toggleFullscreen = useCallback(() => {
    const target: HTMLElement | null = meetingLayoutRef.current;
    if (!target) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      if (target.requestFullscreen) {
        target.requestFullscreen().catch(() => {});
      }
    }
  }, []);

  const shortcuts = useMemo(() => [
    { key: 'k', mod: true, handler: () => { const el = searchInputRef.current; if (el) { if (document.activeElement === el) el.blur(); else el.focus(); } }, allowInInput: true },
    { key: 'b', mod: true, handler: () => setSidebarCollapsed(prev => !prev), allowInInput: true },
    { key: 'M', shift: true, handler: () => setShowCreateMeeting(true) },
    { key: 'd', handler: () => setTheme(prev => prev === 'dark' ? 'light' : 'dark') },
    { key: 'f', handler: toggleFullscreen },
    { key: '[', mod: true, handler: () => setAgendaPanelOpen(prev => !prev), allowInInput: true },
    { key: ']', mod: true, handler: () => {}, allowInInput: true },
    { key: 'Escape', handler: () => {
      // no-op block
    }, allowInInput: true },
    ...VIEW_KEYS.map((view, i) => ({
      key: String(i + 1),
      handler: () => setCurrentView(view),
    })),
  ], [toggleFullscreen]);

  useKeyboardShortcuts(shortcuts);

  // Helper for authenticated requests
  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const headers: Record<string, string> = { "Content-Type": "application/json", ...(options.headers as Record<string, string>) };
    if (user?.token) headers.Authorization = `Bearer ${user.token}`;
    return fetch(url, { ...options, headers });
  };

  // Fetch data on mount
  useEffect(() => {
    fetchMeetings();
  }, []);

  // Apply theme to document root
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", theme);
    }
    if (typeof window !== "undefined") {
      window.localStorage.setItem("theme", theme);
    }
  }, [theme]);

  // Handle Deep Links
  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/\/meeting\/([a-fA-F0-9-]+)/);
    if (match && match[1]) {
      const meetingId = match[1];
      // We might need to fetch the meeting if it's not in the list yet
      // For now, let's at least try to set the ID
      setSelectedMeeting({ id: meetingId } as any);
      setCurrentView("meeting");
    }
  }, []);

  useEffect(() => {
    if (selectedMeeting?.id) {
      if (selectedMeeting.status === "scheduled") {
        fetchAgenda(selectedMeeting.id);
      } else {
        fetchAgenda(selectedMeeting.id);
      }
    }
  }, [selectedMeeting?.id]);

  useEffect(() => {
    if (!socket || !selectedMeeting) return;

    const meetingId = selectedMeeting.id;
    socket.emit('join_meeting', meetingId);

    return () => {
      socket.emit('leave_meeting', meetingId);
    };
  }, [socket, selectedMeeting]);

  const fetchMeetings = async () => {
    try {
      const res = await fetchWithAuth(`${API_BASE}/meetings`);
      if (res.ok) {
        const data = await res.json();
        setMeetings(data);
        if (data.length > 0) {
          setSelectedMeeting(prev => prev && prev.id ? prev : data[0]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch meetings:", err);
    }
  };

  const fetchAgenda = async (meetingId: string) => {
    try {
      const res = await fetchWithAuth(`${API_BASE}/agenda/${meetingId}`);
      if (res.ok) {
        const data = await res.json();
        setAgendaItems(data?.items || []);
      }
    } catch (err) {
      console.error("Failed to fetch agenda:", err);
    }
  };


  const handleCreateMeeting = async (meetingData: MeetingFormData & { agenda?: string[] }) => {
    try {
      const { agenda, ...baseMeetingData } = meetingData;
      const res = await fetchWithAuth(`${API_BASE}/meetings`, {
        method: "POST",
        body: JSON.stringify(baseMeetingData),
      });
      if (res.ok) {
        const newMeeting = await res.json();
        
        // Save initial agenda items if provided
        if (agenda && agenda.length > 0) {
          const formattedItems = agenda.map((title, index) => ({
            id: `ag-${Date.now()}-${index}`,
            title,
            duration: 15,
            status: 'pending' as const
          }));
          
          await fetchWithAuth(`${API_BASE}/agenda/${newMeeting.id || newMeeting._id}`, {
            method: "POST",
            body: JSON.stringify({
              items: formattedItems,
              totalDuration: formattedItems.length * 15
            })
          });
        }
        
        setMeetings((prev) => [newMeeting, ...prev]);
        setSelectedMeeting(newMeeting);
        return newMeeting;
      }
    } catch (err) {
      console.error("Failed to create meeting:", err);
    }
    return null;
  };

  const renderContent = () => {
    switch (currentView) {
      case "dashboard":
        return (
          <ProductivityDashboard
            userName={user?.name}
            stats={{
              totalMeetings: meetings.length || 12,
              totalHours: 18,
              punctualityRate: 92,
              tasksCompleted: 7,
              tasksTotal: 8,
              streak: 7,
              weeklyHeatmap: [
                { day: 'Mon', hours: 2 }, { day: 'Tue', hours: 3 },
                { day: 'Wed', hours: 1 }, { day: 'Thu', hours: 4 },
                { day: 'Fri', hours: 2 }, { day: 'Sat', hours: 0 },
                { day: 'Sun', hours: 1 },
              ],
              badges: [
                { icon: '🏆', name: 'Punctual Pro', description: 'On time 10 meetings in a row' },
                { icon: '🎯', name: 'Task Master', description: 'Completed 50 action items' },
                { icon: '🔥', name: 'Hot Streak', description: '7-day meeting streak' },
                { icon: '🌟', name: 'Top Contributor', description: 'Most engagement this month' },
              ],
              sentimentProfile: { positive: 72, neutral: 20, negative: 8 },
              monthlyAttendance: [
                { week: 'W1', attended: 4, total: 5 },
                { week: 'W2', attended: 5, total: 5 },
                { week: 'W3', attended: 3, total: 4 },
                { week: 'W4', attended: 4, total: 5 },
              ],
              speakingTime: 22,
              avgMeetingDuration: 54,
            }}
          />
        );

      case "meeting":
        return (
          <div
            ref={meetingLayoutRef}
            className="meeting-layout-flex"
            style={{ 
              display: 'flex', 
              height: '100%', 
              width: '100%', 
              gap: '0.375rem', 
              padding: '0.375rem', 
              overflow: 'hidden',
              background: 'var(--bg-primary)'
            }}
          >
            {agendaPanelOpen && (
              <div className="meeting-side-panel meeting-side-panel-left open" style={{ width: '18.75rem', flexShrink: 0, height: '100%' }}>
                <AgendaPanel
                  agendaItems={agendaItems}
                  onItemChange={async (newItems) => {
                    setAgendaItems(newItems);
                    if (selectedMeeting?.id) {
                       await fetchWithAuth(`${API_BASE}/agenda/${selectedMeeting.id}`, {
                         method: "POST",
                         body: JSON.stringify({
                           items: newItems,
                           totalDuration: newItems.reduce((acc, curr) => acc + curr.duration, 0)
                         })
                       });
                    }
                  }}
                />
              </div>
            )}
            <div className="video-area-wrapper" style={{ flex: 1, minWidth: 0, height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <VideoArea
                meetingId={selectedMeeting?.id}
                meetingTitle={selectedMeeting?.title || "No Meeting Selected"}
                participants={selectedMeeting?.participants?.map((id: string) => ({ _id: id, name: "Participant" })) || []}
                modality={selectedMeeting?.modality}
                currentUser={user}
                fullscreenRef={meetingLayoutRef}
                agendaPanelOpen={agendaPanelOpen}
                rightPanelOpen={false}
                onToggleAgendaPanel={toggleAgendaPanel}
                onToggleRightPanel={() => {}}
              />
            </div>
          </div>
        );

      case "schedule":
        return (
          <div style={{ flex: 1, overflow: "auto", padding: "1.5rem" }}>
            <h2
              style={{
                fontSize: "1.375rem",
                fontWeight: 700,
                marginBottom: "1rem",
              }}
            >
              Scheduled Meetings
            </h2>
            <div className="meeting-list">
              {meetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className={`meeting-card glass-card ${selectedMeeting?.id === meeting.id ? "selected" : ""}`}
                  onClick={() => {
                    setSelectedMeeting(meeting);
                    setCurrentView("meeting");
                  }}
                  style={
                    selectedMeeting?.id === meeting.id
                      ? { borderColor: "var(--primary-border)" }
                      : {}
                  }
                >
                  <div className="meeting-card-title">{meeting.title}</div>
                  <div className="meeting-card-meta">
                    <span
                      className={`chip ${meeting.modality === "Online" ? "chip-blue" : meeting.modality === "Hybrid" ? "chip-violet" : "chip-emerald"}`}
                    >
                      {meeting.modality}
                    </span>
                    {meeting.date && <span><Icon icon={Calendar02Icon} size={14} /> {formatDate(meeting.date)}</span>}
                    {meeting.time && <span><Icon icon={Clock01Icon} size={14} /> {meeting.time}</span>}
                    <span><Icon icon={UserIcon} size={14} /> {meeting.host}</span>
                    <span
                      className={`chip ${meeting.status === "completed" ? "chip-emerald" : (meeting.status as string) === "pending_poll" ? "chip-blue" : "chip-amber"}`}
                    >
                      {meeting.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="empty-state" style={{ flex: 1 }}>
            <p>Select a view from the sidebar</p>
          </div>
        );
    }
  };

  return (
    <div className="app-container">
      <TopBar
        userName={user?.name || "User"}
        onNewMeeting={() => setShowCreateMeeting(true)}
        theme={theme}
        onToggleTheme={() =>
          setTheme((prev) => (prev === "dark" ? "light" : "dark"))
        }
        sidebarCollapsed={sidebarCollapsed}
        onSidebarToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onLogout={logout}
      />

      <div className="main-area">
        <Sidebar
          currentView={currentView}
          onViewChange={setCurrentView}
          collapsed={sidebarCollapsed}
        />

        <div className="content-area">{renderContent()}</div>
      </div>

      {showCreateMeeting && (
        <MeetingCreation
          onClose={() => setShowCreateMeeting(false)}
          onSubmit={handleCreateMeeting}
        />
      )}
    </div>
  );
};

// Main App component that maps auth states to the correct UI
interface AppProps {}

const App: FC<AppProps> = () => {
  const { user, loading } = useAuth();
  const [authView, setAuthView] = useState<"login" | "signup">("login");

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: "var(--bg-primary)",
        }}
      >
        <div style={{ color: "var(--primary)", fontSize: "1.5rem" }}>
          ⌘ MCMS Loading...
        </div>
      </div>
    );
  }

  // If not authenticated, show login or signup pages
  if (!user) {
    if (authView === "login") return <Login onNavigate={(view) => setAuthView(view as "login" | "signup")} />;
    if (authView === "signup") return <Signup onNavigate={(view) => setAuthView(view as "login" | "signup")} />;
  }

  // If authenticated, show the main dashboard
  return <DashboardApp />;
};

export default App;
