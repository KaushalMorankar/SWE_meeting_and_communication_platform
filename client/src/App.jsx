import { useState, useEffect } from 'react';
import './index.css';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import AgendaPanel from './components/AgendaPanel';
import VideoArea from './components/VideoArea';
import TranscriptFeed from './components/TranscriptFeed';
import ActionItems from './components/ActionItems';
import LiveOutcome from './components/LiveOutcome';
import MeetingCreation from './components/MeetingCreation';
import ProductivityDashboard from './components/ProductivityDashboard';

const API_BASE = 'http://localhost:5000/api';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showCreateMeeting, setShowCreateMeeting] = useState(false);
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'dark';
    return window.localStorage.getItem('theme') === 'light' ? 'light' : 'dark';
  });

  // Data state
  const [meetings, setMeetings] = useState([]);
  const [agendaItems, setAgendaItems] = useState([]);
  const [transcripts, setTranscripts] = useState([]);
  const [actionItems, setActionItems] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [selectedMeeting, setSelectedMeeting] = useState(null);

  // Fetch data on mount
  useEffect(() => {
    fetchMeetings();
    fetchDashboardStats();
  }, []);

  // Apply theme to document root
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('theme', theme);
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
      const res = await fetch(`${API_BASE}/meetings`);
      const data = await res.json();
      setMeetings(data);
      if (data.length > 0) setSelectedMeeting(data[0]);
    } catch (err) {
      console.error('Failed to fetch meetings:', err);
    }
  };

  const fetchAgenda = async (meetingId) => {
    try {
      const res = await fetch(`${API_BASE}/agenda/${meetingId}`);
      const data = await res.json();
      setAgendaItems(data);
    } catch (err) {
      console.error('Failed to fetch agenda:', err);
    }
  };

  const fetchTranscript = async (meetingId) => {
    try {
      const res = await fetch(`${API_BASE}/transcript/${meetingId}`);
      const data = await res.json();
      setTranscripts(data);
    } catch (err) {
      console.error('Failed to fetch transcript:', err);
    }
  };

  const fetchActionItems = async (meetingId) => {
    try {
      const res = await fetch(`${API_BASE}/action-items/${meetingId}`);
      const data = await res.json();
      setActionItems(data);
    } catch (err) {
      console.error('Failed to fetch action items:', err);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/dashboard/stats`);
      const data = await res.json();
      setDashboardStats(data);
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
    }
  };

  const handleCreateMeeting = async (meetingData) => {
    try {
      const res = await fetch(`${API_BASE}/meetings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(meetingData),
      });
      const newMeeting = await res.json();
      setMeetings(prev => [...prev, newMeeting]);
      setSelectedMeeting(newMeeting);
      setCurrentView('meeting');
    } catch (err) {
      console.error('Failed to create meeting:', err);
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <ProductivityDashboard stats={dashboardStats} />
          </div>
        );

      case 'meeting':
        return (
          <div className="meeting-layout">
            {/* Left: Agenda Panel */}
            <AgendaPanel
              agendaItems={agendaItems}
              onItemChange={setAgendaItems}
            />

            {/* Center: Video Area */}
            <VideoArea
              meetingTitle={selectedMeeting?.title || 'Select a Meeting'}
              participants={selectedMeeting?.participants || []}
            />

            {/* Right: Transcript + Action Items */}
            <div className="panel" style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-card)' }}>
              <TranscriptFeed transcripts={transcripts} />
              <ActionItems items={actionItems} />
              <LiveOutcome />
            </div>
          </div>
        );

      case 'schedule':
        return (
          <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '16px' }}>Scheduled Meetings</h2>
            <div className="meeting-list">
              {meetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className={`meeting-card glass-card ${selectedMeeting?.id === meeting.id ? 'selected' : ''}`}
                  onClick={() => { setSelectedMeeting(meeting); setCurrentView('meeting'); }}
                  id={`meeting-card-${meeting.id}`}
                  style={selectedMeeting?.id === meeting.id ? { borderColor: 'rgba(79, 142, 247, 0.3)' } : {}}
                >
                  <div className="meeting-card-title">{meeting.title}</div>
                  <div className="meeting-card-meta">
                    <span className={`chip ${meeting.modality === 'Online' ? 'chip-blue' : meeting.modality === 'Hybrid' ? 'chip-violet' : 'chip-emerald'}`}>
                      {meeting.modality}
                    </span>
                    <span>📅 {meeting.date}</span>
                    <span>🕐 {meeting.time}</span>
                    <span>👤 {meeting.host}</span>
                    <span className={`chip ${meeting.status === 'completed' ? 'chip-emerald' : 'chip-amber'}`}>
                      {meeting.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'archive':
        return (
          <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>Meeting Archives</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Search and browse past meeting transcripts, summaries, and action items.
            </p>
            <div style={{ marginBottom: '16px' }}>
              <input type="text" className="input" placeholder="🔍 Search by agenda title, keyword, or action item..." id="archive-search" />
            </div>
            <div className="meeting-list">
              {meetings.filter(m => m.status === 'completed').map(meeting => (
                <div key={meeting.id} className="meeting-card glass-card" id={`archive-${meeting.id}`}>
                  <div className="meeting-card-title">{meeting.title}</div>
                  <div className="meeting-card-meta">
                    <span>📅 {meeting.date}</span>
                    <span>👤 {meeting.host}</span>
                    <span className="chip chip-emerald">Completed</span>
                  </div>
                  <div style={{ marginTop: '10px', padding: '10px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <strong>Quick Summary:</strong> Meeting covered evaluation of frontend role candidate. Key decisions documented with transcript segments linked.
                  </div>
                </div>
              ))}
              {meetings.filter(m => m.status === 'completed').length === 0 && (
                <div className="empty-state">
                  <p>No completed meetings in the archive yet.</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <ProductivityDashboard stats={dashboardStats} />
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
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="main-area">
        <TopBar
          streak={dashboardStats?.streak || 0}
          userName={dashboardStats?.user || 'User'}
          onNewMeeting={() => setShowCreateMeeting(true)}
          theme={theme}
          onToggleTheme={() => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))}
        />

        <div className="content-area">
          {renderContent()}
        </div>
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

export default App;
