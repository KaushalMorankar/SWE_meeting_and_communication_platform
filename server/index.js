const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

dotenv.config();

// ── Optional MongoDB connection ──────────────────────────────
let usingMongo = false;
let User = null;
let Meeting = null;
try {
    const mongoose = require('mongoose');
    mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mcms_db')
        .then(() => {
            console.log('✅ MongoDB Connected');
            usingMongo = true;
        })
        .catch(err => console.log('⚠️  MongoDB not available — using in-memory store:', err.message));
    User = require('./models/User');
    Meeting = require('./models/Meeting');
} catch (e) {
    console.log('⚠️  Mongoose not found — using in-memory store');
}

// ── In-memory fallback store ─────────────────────────────────
const inMemoryUsers = [];

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'mcms_super_secret_key';

app.use(cors());
app.use(express.json());

// ─── Auth Helpers ─────────────────────────────────────────────
const generateToken = (id) => jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
const { protect } = require('./middleware/auth');

// ─── REGISTER ─────────────────────────────────────────────────
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please provide name, email, and password' });
        }

        if (usingMongo && User) {
            let existing = await User.findOne({ email });
            if (existing) return res.status(400).json({ message: 'User already exists' });
            const user = await User.create({ name, email, password });
            return res.status(201).json({ _id: user._id, name: user.name, email: user.email, token: generateToken(user._id) });
        } else {
            const existing = inMemoryUsers.find(u => u.email === email.toLowerCase());
            if (existing) return res.status(400).json({ message: 'User already exists' });
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            const userId = `user_${Date.now()}`;
            const user = { _id: userId, name, email: email.toLowerCase(), password: hashedPassword };
            inMemoryUsers.push(user);
            return res.status(201).json({ _id: user._id, name: user.name, email: user.email, token: generateToken(user._id) });
        }
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ─── LOGIN ────────────────────────────────────────────────────
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        if (usingMongo && User) {
            const user = await User.findOne({ email });
            if (!user) return res.status(401).json({ message: 'Invalid email or password' });
            const isMatch = await user.matchPassword(password);
            if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });
            return res.json({ _id: user._id, name: user.name, email: user.email, token: generateToken(user._id) });
        } else {
            const user = inMemoryUsers.find(u => u.email === email.toLowerCase());
            if (!user) return res.status(401).json({ message: 'Invalid email or password' });
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });
            return res.json({ _id: user._id, name: user.name, email: user.email, token: generateToken(user._id) });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ─── ME ───────────────────────────────────────────────────────
app.get('/api/auth/me', protect, async (req, res) => {
    try {
        if (usingMongo && User) {
            const user = await User.findById(req.user.id).select('-password');
            return res.json(user);
        }
        const user = inMemoryUsers.find(u => u._id === req.user.id);
        res.json(user ? { _id: user._id, name: user.name, email: user.email } : null);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// ─── Mock Data ────────────────────────────────────────────────
const meetings = [
    {
        id: 'mtg-001', title: 'Sprint Planning — Q1 Review', modality: 'Online',
        date: '2026-03-05', time: '10:00 AM', host: 'Dr. Sharma',
        participants: ['Ravi K.', 'Ananya P.', 'Kiran M.', 'Priya S.'], status: 'scheduled',
        jitsiUrl: 'https://meet.jit.si/mcms-sprint-planning',
    },
    {
        id: 'mtg-002', title: 'CS301 — Data Structures Lecture', modality: 'Hybrid',
        date: '2026-03-06', time: '2:00 PM', host: 'Prof. Reddy',
        participants: ['60 students'], status: 'scheduled',
        jitsiUrl: 'https://meet.jit.si/mcms-cs301',
    },
    {
        id: 'mtg-003', title: 'Frontend Candidate Evaluation', modality: 'Online',
        date: '2026-02-28', time: '3:00 PM', host: 'HR Team',
        participants: ['Priya S.', 'Ravi K.'], status: 'completed',
    },
];

const agendas = {
    'mtg-001': [
        { id: 'ag-1', title: 'Review Previous Sprint Goals', duration: 10, status: 'active', notes: '' },
        { id: 'ag-2', title: 'Demo: New Dashboard Module', duration: 15, status: 'pending', notes: '' },
        { id: 'ag-3', title: 'Plan next sprint tasks', duration: 20, status: 'pending', notes: '' },
    ],
};

const transcripts = {
    'mtg-001': [
        { id: 't-1', speaker: 'Dr. Sharma', text: "Let's start with the sprint review.", timestamp: '10:01:12', sentiment: 'neutral', agendaId: 'ag-1' },
        { id: 't-2', speaker: 'Ravi K.', text: 'I completed the QR module integration.', timestamp: '10:03:45', sentiment: 'positive', agendaId: 'ag-1' },
    ],
};

const actionItems = {
    'mtg-001': [
        { id: 'ai-1', title: 'Complete QR module', assignee: 'Ananya P.', category: 'Technical', status: 'in-progress', deadline: '2026-03-08', agendaId: 'ag-1' },
        { id: 'ai-2', title: 'Write unit tests for agenda panel', assignee: 'Kiran M.', category: 'Technical', status: 'pending', deadline: '2026-03-09', agendaId: 'ag-2' },
    ],
};

const dashboardStats = {
    user: 'Kiran M.', role: 'Host', streak: 7, totalMeetings: 42,
    totalHours: 63.5, punctualityRate: 94, tasksCompleted: 28, tasksTotal: 32,
    badges: [
        { name: 'Action Hero', icon: '🏆', description: '90%+ tasks on time' },
        { name: '7-Day Streak', icon: '🔥', description: '7 consecutive on-time meetings' },
    ],
    weeklyHeatmap: [
        { day: 'Mon', hours: 3.5 }, { day: 'Tue', hours: 5.0 }, { day: 'Wed', hours: 2.0 },
        { day: 'Thu', hours: 4.5 }, { day: 'Fri', hours: 3.0 },
    ],
    monthlyAttendance: [{ week: 'W1', attended: 5, total: 6 }, { week: 'W2', attended: 6, total: 6 }],
    sentimentProfile: { positive: 62, neutral: 30, negative: 8 },
    speakingTime: 18.5, avgMeetingDuration: 45,
};

// ─── Protected API Routes ────────────────────────────────────
app.get('/api/meetings', protect, async (req, res) => {
    try {
        if (usingMongo && Meeting) {
            const dbMeetings = await Meeting.find({}).sort({ createdAt: -1 });
            const formatted = dbMeetings.map(m => ({
                id: m._id,
                title: m.title,
                modality: m.modality,
                date: m.date,
                time: m.time,
                host: m.host || 'Unknown',
                participants: m.participants,
                status: m.status,
                jitsiUrl: m.jitsiUrl,
                jitsiRoomName: m.jitsiRoomName
            }));
            // Return DB meetings mixed with mock data so frontend UI isn't empty
            return res.json([...formatted, ...meetings]);
        }
        res.json(meetings);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

app.post('/api/meetings', protect, async (req, res) => {
    try {
        const { title, modality, date, time } = req.body;
        // Generate unique Jitsi room name
        const jitsiRoomName = modality !== 'Offline' ? `MCMS-${req.user.id.substring(req.user.id.length - 6)}-${Date.now()}` : null;
        const jitsiUrl = jitsiRoomName ? `https://meet.jit.si/${jitsiRoomName}` : null;
        let hostName = 'You';

        if (usingMongo && User) {
            const userDoc = await User.findById(req.user.id);
            if (userDoc) hostName = userDoc.name;
        }

        if (usingMongo && Meeting) {
            const newMeeting = await Meeting.create({
                title, modality, date, time, 
                host: hostName, 
                hostId: req.user.id,
                jitsiUrl, 
                jitsiRoomName, 
                participants: [], 
                status: 'scheduled'
            });
            return res.status(201).json({
                id: newMeeting._id,
                title: newMeeting.title,
                modality: newMeeting.modality,
                date: newMeeting.date,
                time: newMeeting.time,
                host: newMeeting.host,
                participants: newMeeting.participants,
                status: newMeeting.status,
                jitsiUrl: newMeeting.jitsiUrl,
                jitsiRoomName: newMeeting.jitsiRoomName
            });
        }

        const newMeeting = {
            id: `mtg-${Date.now()}`, title, modality, date, time,
            host: hostName, participants: [], status: 'scheduled',
            jitsiUrl, jitsiRoomName
        };
        meetings.push(newMeeting);
        res.status(201).json(newMeeting);
    } catch(error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

app.get('/api/agenda/:meetingId', protect, (req, res) => res.json(agendas[req.params.meetingId] || []));
app.get('/api/transcript/:meetingId', protect, (req, res) => res.json(transcripts[req.params.meetingId] || []));
app.get('/api/action-items/:meetingId', protect, (req, res) => res.json(actionItems[req.params.meetingId] || []));

app.get('/api/dashboard/stats', protect, (req, res) => {
    const stats = { ...dashboardStats };
    if (req.user && req.user.name) stats.user = req.user.name;
    res.json(stats);
});

// ─── Start Server ────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`✅ MCMS Backend running at http://localhost:${PORT}`);
    console.log(`   MongoDB: ${usingMongo ? 'Connected' : 'Not running — users stored in-memory (lost on restart)'}`);
});
