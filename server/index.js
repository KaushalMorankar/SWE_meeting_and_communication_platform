const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// ─── Mock Data ───────────────────────────────────────────────

const meetings = [
    {
        id: 'mtg-001',
        title: 'Sprint Planning — Q1 Review',
        modality: 'Online',
        date: '2026-03-05',
        time: '10:00 AM',
        host: 'Dr. Sharma',
        participants: ['Ravi K.', 'Ananya P.', 'Kiran M.', 'Priya S.'],
        status: 'scheduled',
        jitsiUrl: 'https://meet.jit.si/mcms-sprint-planning',
    },
    {
        id: 'mtg-002',
        title: 'CS301 — Data Structures Lecture',
        modality: 'Hybrid',
        date: '2026-03-06',
        time: '2:00 PM',
        host: 'Prof. Reddy',
        participants: ['60 students'],
        status: 'scheduled',
        jitsiUrl: 'https://meet.jit.si/mcms-cs301',
    },
    {
        id: 'mtg-003',
        title: 'Candidate Interview — Frontend Role',
        modality: 'Online',
        date: '2026-03-07',
        time: '11:30 AM',
        host: 'Vikram T.',
        participants: ['Candidate: Aditi R.'],
        status: 'completed',
        jitsiUrl: null,
    },
];

const agendas = {
    'mtg-001': [
        { id: 'ag-1', title: 'Review Previous Sprint Goals', duration: 10, status: 'completed', notes: 'All tasks closed.' },
        { id: 'ag-2', title: 'Demo: New Dashboard Module', duration: 15, status: 'active', notes: '' },
        { id: 'ag-3', title: 'Discuss Backend API Changes', duration: 20, status: 'pending', notes: '' },
        { id: 'ag-4', title: 'Assign Action Items for Next Sprint', duration: 10, status: 'pending', notes: '' },
        { id: 'ag-5', title: 'Open Floor / Parking Lot', duration: 5, status: 'pending', notes: '' },
    ],
    'mtg-002': [
        { id: 'ag-6', title: 'Recap: Trees & Binary Trees', duration: 10, status: 'pending', notes: '' },
        { id: 'ag-7', title: 'Lecture: AVL Trees — Rotations', duration: 25, status: 'pending', notes: '' },
        { id: 'ag-8', title: 'Live Coding Demo', duration: 15, status: 'pending', notes: '' },
        { id: 'ag-9', title: 'Q&A Session', duration: 10, status: 'pending', notes: '' },
    ],
};

const transcripts = {
    'mtg-001': [
        { id: 't-1', speaker: 'Dr. Sharma', text: 'Let\'s start with the sprint review. Ravi, can you walk us through last sprint?', timestamp: '10:01:12', sentiment: 'neutral', agendaId: 'ag-1' },
        { id: 't-2', speaker: 'Ravi K.', text: 'Sure. We closed 14 out of 16 tasks. The two remaining are the notification service and the QR module.', timestamp: '10:01:45', sentiment: 'positive', agendaId: 'ag-1' },
        { id: 't-3', speaker: 'Ananya P.', text: 'The QR module is at 80%. I should have it done by Wednesday.', timestamp: '10:02:30', sentiment: 'positive', agendaId: 'ag-1' },
        { id: 't-4', speaker: 'Dr. Sharma', text: 'Great progress. Now let\'s move to the dashboard demo. Kiran, you\'re up.', timestamp: '10:03:00', sentiment: 'positive', agendaId: 'ag-2' },
        { id: 't-5', speaker: 'Kiran M.', text: 'I\'ve implemented the three-column layout with the agenda panel, video area, and transcript feed. Let me share my screen.', timestamp: '10:03:30', sentiment: 'neutral', agendaId: 'ag-2' },
        { id: 't-6', speaker: 'Priya S.', text: 'This looks really polished. One concern — the sentiment badges might be noisy for long meetings.', timestamp: '10:05:00', sentiment: 'neutral', agendaId: 'ag-2' },
        { id: 't-7', speaker: 'Dr. Sharma', text: 'Good point. Let\'s add a filter toggle for sentiment visibility. Can we add that as an action item?', timestamp: '10:05:30', sentiment: 'positive', agendaId: 'ag-2' },
    ],
};

const actionItems = {
    'mtg-001': [
        { id: 'ai-1', title: 'Complete QR attendance module', assignee: 'Ananya P.', category: 'Technical', status: 'in-progress', deadline: '2026-03-08', agendaId: 'ag-1' },
        { id: 'ai-2', title: 'Add sentiment filter toggle to dashboard', assignee: 'Kiran M.', category: 'Technical', status: 'pending', deadline: '2026-03-10', agendaId: 'ag-2' },
        { id: 'ai-3', title: 'Finalize API documentation for v2 endpoints', assignee: 'Ravi K.', category: 'Administrative', status: 'pending', deadline: '2026-03-09', agendaId: 'ag-3' },
        { id: 'ai-4', title: 'Schedule follow-up with design team', assignee: 'Dr. Sharma', category: 'Follow-up', status: 'pending', deadline: '2026-03-07', agendaId: 'ag-4' },
        { id: 'ai-5', title: 'Review notification service architecture', assignee: 'Priya S.', category: 'Decision', status: 'completed', deadline: '2026-03-05', agendaId: 'ag-3' },
    ],
};

const polls = {
    'mtg-001': {
        question: 'Best time for next sprint review?',
        options: [
            { label: 'Monday 10:00 AM', votes: 3 },
            { label: 'Tuesday 2:00 PM', votes: 5 },
            { label: 'Wednesday 11:00 AM', votes: 2 },
            { label: 'Thursday 4:00 PM', votes: 1 },
            { label: 'Friday 9:00 AM', votes: 4 },
        ],
    },
};

const dashboardStats = {
    user: 'Kiran M.',
    role: 'Host',
    streak: 7,
    totalMeetings: 42,
    totalHours: 63.5,
    punctualityRate: 94,
    tasksCompleted: 28,
    tasksTotal: 32,
    badges: [
        { name: 'Action Hero', icon: '🏆', description: 'Completed 90%+ tasks on time' },
        { name: 'Streak Master', icon: '🔥', description: '7 consecutive on-time meetings' },
        { name: 'Key Contributor', icon: '⭐', description: 'Awarded by Prof. Reddy' },
        { name: 'Early Bird', icon: '🐦', description: 'Joined 5+ meetings before start time' },
    ],
    weeklyHeatmap: [
        { day: 'Mon', hours: 3.5 },
        { day: 'Tue', hours: 5.0 },
        { day: 'Wed', hours: 2.0 },
        { day: 'Thu', hours: 4.5 },
        { day: 'Fri', hours: 1.5 },
    ],
    monthlyAttendance: [
        { week: 'W1', attended: 5, total: 6 },
        { week: 'W2', attended: 4, total: 4 },
        { week: 'W3', attended: 6, total: 7 },
        { week: 'W4', attended: 5, total: 5 },
    ],
    sentimentProfile: { positive: 62, neutral: 30, negative: 8 },
    speakingTime: 18.5,
    avgMeetingDuration: 45,
};

// ─── API Routes ──────────────────────────────────────────────

app.get('/api/meetings', (req, res) => res.json(meetings));

app.post('/api/meetings', (req, res) => {
    const { title, modality, date, time } = req.body;
    const newMeeting = {
        id: `mtg-${Date.now()}`,
        title,
        modality,
        date,
        time,
        host: dashboardStats.user,
        participants: [],
        status: 'scheduled',
        jitsiUrl: modality !== 'Offline' ? `https://meet.jit.si/mcms-${Date.now()}` : null,
    };
    meetings.push(newMeeting);
    res.status(201).json(newMeeting);
});

app.get('/api/agenda/:meetingId', (req, res) => {
    const agenda = agendas[req.params.meetingId] || [];
    res.json(agenda);
});

app.get('/api/transcript/:meetingId', (req, res) => {
    const transcript = transcripts[req.params.meetingId] || [];
    res.json(transcript);
});

app.get('/api/action-items/:meetingId', (req, res) => {
    const items = actionItems[req.params.meetingId] || [];
    res.json(items);
});

app.get('/api/dashboard/stats', (req, res) => res.json(dashboardStats));

app.get('/api/polls/:meetingId', (req, res) => {
    const poll = polls[req.params.meetingId] || null;
    res.json(poll);
});

// ─── Start Server ────────────────────────────────────────────

app.listen(PORT, () => {
    console.log(`✅ MCMS Backend running at http://localhost:${PORT}`);
});
