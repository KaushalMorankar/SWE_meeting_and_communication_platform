import express, { Request, Response, Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { protect } from './middleware/auth';
import UserModel from './models/User';
import MeetingModel from './models/Meeting';

dotenv.config();

// ── Types ─────────────────────────────────────────────────────
interface InMemoryUser {
  _id: string;
  name: string;
  email: string;
  password: string;
}

interface Meeting {
  id: string;
  title: string;
  modality: 'Online' | 'Offline' | 'Hybrid';
  date: string;
  time: string;
  host: string;
  participants: string[];
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  jitsiUrl?: string;
  jitsiRoomName?: string;
}

interface Agenda {
  id: string;
  title: string;
  duration: number;
  status: 'active' | 'pending' | 'completed';
  notes: string;
}

interface Transcript {
  id: string;
  speaker: string;
  text: string;
  timestamp: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  agendaId: string;
}

interface ActionItem {
  id: string;
  title: string;
  assignee: string;
  category: string;
  status: 'pending' | 'in-progress' | 'completed';
  deadline: string;
  agendaId: string;
}

interface DashboardStats {
  user: string;
  role: string;
  streak: number;
  totalMeetings: number;
  totalHours: number;
  punctualityRate: number;
  tasksCompleted: number;
  tasksTotal: number;
  badges: Array<{ name: string; icon: string; description: string }>;
  weeklyHeatmap: Array<{ day: string; hours: number }>;
  monthlyAttendance: Array<{ week: string; attended: number; total: number }>;
  sentimentProfile: { positive: number; neutral: number; negative: number };
  speakingTime: number;
  avgMeetingDuration: number;
}

// ── Optional MongoDB connection ──────────────────────────────
let usingMongo = false;
let User: any = null;
let Meeting: any = null;

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mcms_db');
    console.log('✅ MongoDB Connected');
    usingMongo = true;
    User = UserModel;
    Meeting = MeetingModel;
  } catch (err) {
    console.log('⚠️  MongoDB not available — using in-memory store:', (err as Error).message);
  }
})();

// ── In-memory fallback store ─────────────────────────────────
const inMemoryUsers: InMemoryUser[] = [];

const app: Application = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'mcms_super_secret_key';

app.use(cors());
app.use(express.json());

// ─── Auth Helpers ─────────────────────────────────────────────
const generateToken = (id: string): string => jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });

// ─── REGISTER ─────────────────────────────────────────────────
app.post('/api/auth/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ message: 'Please provide name, email, and password' });
      return;
    }

    if (usingMongo && User) {
      let existing = await User.findOne({ email });
      if (existing) {
        res.status(400).json({ message: 'User already exists' });
        return;
      }
      const user = await User.create({ name, email, password });
      res.status(201).json({ _id: user._id, name: user.name, email: user.email, token: generateToken(user._id) });
      return;
    }

    const existing = inMemoryUsers.find(u => u.email === email.toLowerCase());
    if (existing) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const userId = `user_${Date.now()}`;
    const user: InMemoryUser = { _id: userId, name, email: email.toLowerCase(), password: hashedPassword };
    inMemoryUsers.push(user);
    res.status(201).json({ _id: user._id, name: user.name, email: user.email, token: generateToken(user._id) });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
});

// ─── LOGIN ────────────────────────────────────────────────────
app.post('/api/auth/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: 'Please provide email and password' });
      return;
    }

    if (usingMongo && User) {
      const user = await User.findOne({ email });
      if (!user) {
        res.status(401).json({ message: 'Invalid email or password' });
        return;
      }
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        res.status(401).json({ message: 'Invalid email or password' });
        return;
      }
      res.json({ _id: user._id, name: user.name, email: user.email, token: generateToken(user._id) });
      return;
    }

    const user = inMemoryUsers.find(u => u.email === email.toLowerCase());
    if (!user) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }
    res.json({ _id: user._id, name: user.name, email: user.email, token: generateToken(user._id) });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
});

// ─── ME ───────────────────────────────────────────────────────
app.get('/api/auth/me', protect, async (req: Request, res: Response): Promise<void> => {
  try {
    if (usingMongo && User && req.user) {
      const user = await User.findById(req.user.id).select('-password');
      res.json(user);
      return;
    }
    const user = inMemoryUsers.find(u => u._id === req.user?.id);
    res.json(user ? { _id: user._id, name: user.name, email: user.email } : null);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── Mock Data ────────────────────────────────────────────────
const meetings: Meeting[] = [
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

const agendas: { [key: string]: Agenda[] } = {
  'mtg-001': [
    { id: 'ag-1', title: 'Review Previous Sprint Goals', duration: 10, status: 'active', notes: '' },
    { id: 'ag-2', title: 'Demo: New Dashboard Module', duration: 15, status: 'pending', notes: '' },
    { id: 'ag-3', title: 'Plan next sprint tasks', duration: 20, status: 'pending', notes: '' },
  ],
};

const transcripts: { [key: string]: Transcript[] } = {
  'mtg-001': [
    { id: 't-1', speaker: 'Dr. Sharma', text: "Let's start with the sprint review.", timestamp: '10:01:12', sentiment: 'neutral', agendaId: 'ag-1' },
    { id: 't-2', speaker: 'Ravi K.', text: 'I completed the QR module integration.', timestamp: '10:03:45', sentiment: 'positive', agendaId: 'ag-1' },
  ],
};

const actionItems: { [key: string]: ActionItem[] } = {
  'mtg-001': [
    { id: 'ai-1', title: 'Complete QR module', assignee: 'Ananya P.', category: 'Technical', status: 'in-progress', deadline: '2026-03-08', agendaId: 'ag-1' },
    { id: 'ai-2', title: 'Write unit tests for agenda panel', assignee: 'Kiran M.', category: 'Technical', status: 'pending', deadline: '2026-03-09', agendaId: 'ag-2' },
  ],
};

const dashboardStats: DashboardStats = {
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
app.get('/api/meetings', protect, async (_req: Request, res: Response): Promise<void> => {
  try {
    if (usingMongo && Meeting) {
      const dbMeetings = await Meeting.find({}).sort({ createdAt: -1 });
      const formatted = dbMeetings.map((m: any) => ({
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
      res.json([...formatted, ...meetings]);
      return;
    }
    res.json(meetings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
});

app.post('/api/meetings', protect, async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, modality, date, time } = req.body;
    const jitsiRoomName = modality !== 'Offline' ? `MCMS-${req.user?.id?.substring((req.user.id as string).length - 6)}-${Date.now()}` : undefined;
    const jitsiUrl = jitsiRoomName ? `https://meet.jit.si/${jitsiRoomName}` : undefined;
    let hostName = 'You';

    if (usingMongo && User && req.user) {
      const userDoc = await User.findById(req.user.id);
      if (userDoc) hostName = userDoc.name;
    }

    if (usingMongo && Meeting && req.user) {
      const newMeeting = await Meeting.create({
        title, modality, date, time,
        host: hostName,
        hostId: req.user.id,
        jitsiUrl,
        jitsiRoomName,
        participants: [],
        status: 'scheduled'
      });
      res.status(201).json({
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
      return;
    }

    const newMeeting: Meeting = {
      id: `mtg-${Date.now()}`, title, modality, date, time,
      host: hostName, participants: [], status: 'scheduled',
      jitsiUrl, jitsiRoomName
    };
    meetings.push(newMeeting);
    res.status(201).json(newMeeting);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
});

app.get('/api/agenda/:meetingId', protect, (req: Request, res: Response): void => {
  res.json(agendas[req.params.meetingId] || []);
});

app.get('/api/transcript/:meetingId', protect, (req: Request, res: Response): void => {
  res.json(transcripts[req.params.meetingId] || []);
});

app.get('/api/action-items/:meetingId', protect, (req: Request, res: Response): void => {
  res.json(actionItems[req.params.meetingId] || []);
});

app.get('/api/dashboard/stats', protect, (req: Request, res: Response): void => {
  const stats = { ...dashboardStats };
  if (req.user && req.user.id) {
    const user = usingMongo && User
      ? inMemoryUsers.find(u => u._id === req.user?.id)
      : inMemoryUsers.find(u => u._id === req.user?.id);
    if (user) stats.user = user.name;
  }
  res.json(stats);
});

// ─── Start Server ────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ MCMS Backend running at http://localhost:${PORT}`);
  console.log(`   MongoDB: ${usingMongo ? 'Connected' : 'Not running — users stored in-memory (lost on restart)'}`);
});

export default app;
