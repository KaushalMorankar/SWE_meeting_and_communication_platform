import { useState, useEffect } from "react";
import "./index.css";
import TopBar from "./components/TopBar";
import Sidebar from "./components/Sidebar";
import AgendaPanel from "./components/AgendaPanel";
import VideoArea from "./components/VideoArea";
import TranscriptFeed from "./components/TranscriptFeed";
import ActionItems from "./components/ActionItems";
import LiveOutcome from "./components/LiveOutcome";
import MeetingCreation from "./components/MeetingCreation";
import ProductivityDashboard from "./components/ProductivityDashboard";

// Auth Pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { useAuth } from "./context/AuthContext";

const API_BASE = "http://localhost:5000/api";

function DashboardApp() {
  const { user, logout } = useAuth();

  const [currentView, setCurrentView] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showCreateMeeting, setShowCreateMeeting] = useState(false);
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "dark";
    return window.localStorage.getItem("theme") === "light" ? "light" : "dark";
  });

  // Data state
  const [meetings, setMeetings] = useState([]);
  const [agendaItems, setAgendaItems] = useState([]);
  const [transcripts, setTranscripts] = useState([]);
  const [actionItems, setActionItems] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [selectedMeeting, setSelectedMeeting] = useState(null);

  // Helper for authenticated requests
  const fetchWithAuth = async (url, options = {}) => {
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };
    if (user?.token) {
      headers.Authorization = `Bearer ${user.token}`;
    }
    return fetch(url, { ...options, headers });
  };

  // Fetch data on mount
  useEffect(() => {
    fetchMeetings();
    fetchDashboardStats();
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

  useEffect(() => {
    if (selectedMeeting) {
      fetchAgenda(selectedMeeting.id);
      fetchTranscript(selectedMeeting.id);
      fetchActionItems(selectedMeeting.id);
    }
  }, [selectedMeeting]);

  const fetchMeetings = async () => {
    try {
      const res = await fetchWithAuth(`${API_BASE}/meetings`);
      if (res.ok) {
        const data = await res.json();
        setMeetings(data);
        if (data.length > 0) setSelectedMeeting(data[0]);
      }
    } catch (err) {
      console.error("Failed to fetch meetings:", err);
    }
  };

  const fetchAgenda = async (meetingId) => {
    try {
      const res = await fetchWithAuth(`${API_BASE}/agenda/${meetingId}`);
      if (res.ok) setAgendaItems(await res.json());
    } catch (err) {
      console.error("Failed to fetch agenda:", err);
    }
  };

  const fetchTranscript = async (meetingId) => {
    try {
      const res = await fetchWithAuth(`${API_BASE}/transcript/${meetingId}`);
      if (res.ok) setTranscripts(await res.json());
    } catch (err) {
      console.error("Failed to fetch transcript:", err);
    }
  };

  const fetchActionItems = async (meetingId) => {
    try {
      const res = await fetchWithAuth(`${API_BASE}/action-items/${meetingId}`);
      if (res.ok) setActionItems(await res.json());
    } catch (err) {
      console.error("Failed to fetch action items:", err);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const res = await fetchWithAuth(`${API_BASE}/dashboard/stats`);
      if (res.ok) setDashboardStats(await res.json());
    } catch (err) {
      console.error("Failed to fetch dashboard stats:", err);
    }
  };

  const handleCreateMeeting = async (meetingData) => {
    try {
      const res = await fetchWithAuth(`${API_BASE}/meetings`, {
        method: "POST",
        body: JSON.stringify(meetingData),
      });
      if (res.ok) {
        const newMeeting = await res.json();
        setMeetings((prev) => [...prev, newMeeting]);
        setSelectedMeeting(newMeeting);
        setCurrentView("meeting");
      }
    } catch (err) {
      console.error("Failed to create meeting:", err);
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case "dashboard":
        return (
          <div style={{ flex: 1, overflow: "hidden" }}>
            <ProductivityDashboard stats={dashboardStats} userName={user?.name} />
          </div>
        );

      case "meeting":
        return (
          <div className="meeting-layout">
            <AgendaPanel
              agendaItems={agendaItems}
              onItemChange={setAgendaItems}
            />
            <VideoArea
              meetingTitle={selectedMeeting?.title || "Select a Meeting"}
              participants={selectedMeeting?.participants || []}
              jitsiRoomName={selectedMeeting?.jitsiRoomName}
              modality={selectedMeeting?.modality}
              currentUser={user}
            />
            <div
              className="panel"
              style={{
                display: "flex",
                flexDirection: "column",
                background: "var(--bg-card)",
              }}
            >
              <TranscriptFeed transcripts={transcripts} />
              <ActionItems items={actionItems} />
              <LiveOutcome />
            </div>
          </div>
        );

      case "schedule":
        return (
          <div style={{ flex: 1, overflow: "auto", padding: "24px" }}>
            <h2
              style={{
                fontSize: "22px",
                fontWeight: 700,
                marginBottom: "16px",
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
                      ? { borderColor: "rgba(79, 142, 247, 0.3)" }
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
                    <span>📅 {meeting.date}</span>
                    <span>🕐 {meeting.time}</span>
                    <span>👤 {meeting.host}</span>
                    <span
                      className={`chip ${meeting.status === "completed" ? "chip-emerald" : "chip-amber"}`}
                    >
                      {meeting.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "archive":
        return (
          <div style={{ flex: 1, overflow: "auto", padding: "24px" }}>
            <h2
              style={{ fontSize: "22px", fontWeight: 700, marginBottom: "8px" }}
            >
              Meeting Archives
            </h2>
            <p
              style={{
                fontSize: "13px",
                color: "var(--text-muted)",
                marginBottom: "20px",
              }}
            >
              Search and browse past meeting transcripts, summaries, and action
              items.
            </p>
            <div className="meeting-list">
              {meetings
                .filter((m) => m.status === "completed")
                .map((meeting) => (
                  <div key={meeting.id} className="meeting-card glass-card">
                    <div className="meeting-card-title">{meeting.title}</div>
                    <div className="meeting-card-meta">
                      <span>📅 {meeting.date}</span>
                      <span>👤 {meeting.host}</span>
                      <span className="chip chip-emerald">Completed</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        );

      case "analytics":
        return (
          <div style={{ flex: 1, overflow: "hidden" }}>
            <ProductivityDashboard stats={dashboardStats} userName={user?.name} />
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
        streak={dashboardStats?.streak || 0}
        userName={user?.name || dashboardStats?.user || "User"}
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
          onLogout={logout}
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
}

// Main App component that maps auth states to the correct UI
export default function App() {
  const { user, loading } = useAuth();
  const [authView, setAuthView] = useState("login"); // 'login' or 'signup'

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
        <div style={{ color: "var(--accent-blue)", fontSize: "24px" }}>
          ⌘ MCMS Loading...
        </div>
      </div>
    );
  }

  // If not authenticated, show login or signup pages
  if (!user) {
    if (authView === "login") return <Login onNavigate={setAuthView} />;
    if (authView === "signup") return <Signup onNavigate={setAuthView} />;
  }

  // If authenticated, show the main dashboard
  return <DashboardApp />;
}
