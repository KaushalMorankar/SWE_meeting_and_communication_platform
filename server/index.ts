import express, { Request, Response, Application } from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { protect } from './middleware/auth';
import UserModel from './models/User';
import MeetingModel from './models/Meeting';
import AgendaModel from './models/Agenda';

dotenv.config();

// Types
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


// Optional MongoDB connection
let usingMongo = false;
let User: any = null;
let Meeting: any = null;
let Agenda: any = null;

(async () => {
	try {
		await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mcms_db');
		console.log('✅ MongoDB Connected');
		usingMongo = true;
		User = UserModel;
		Meeting = MeetingModel;
		Agenda = AgendaModel;
	} catch (err) {
		console.log('⚠️  MongoDB not available — using in-memory store:', (err as Error).message);
	}
})();

// ── In-memory fallback store ─────────────────────────────────
const inMemoryUsers: InMemoryUser[] = [];

const app: Application = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'mcms_super_secret_key';

// ── Socket.io Setup ──────────────────────────────────────────
export const io = new Server(httpServer, {
	cors: { origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] }
});

// socket authentication middleware
io.use((socket: Socket, next) => {
	// grab the jwt token from the connection handshake
	const token = socket.handshake.auth?.token;
	// reject the connection if no token
	if (!token) return next(new Error('Authentication required'));
	try { // verify the token
		const decoded = jwt.verify(token, JWT_SECRET) as any;
		(socket as any).userId = decoded.id;
		next();
	} catch {
		next(new Error('Invalid token'));
	}
});

interface RoomPeerInfo {
	userId: string | null;
	name: string;
	profileImage: string | null;
}

// outer key = meetingID, inner key = socketID, value = user info
const meetingRooms = new Map<string, Map<string, RoomPeerInfo>>();
// track whether transcription is active for a meeting
const transcriptionSessions = new Map<string, { active: boolean; speakers: Map<string, any> }>();

// when a browser tab successfully connects to the server
io.on('connection', (socket: Socket) => {
	const userId = (socket as any).userId;

	// WebRTC Signaling

	// user enters a meeting
	// (client: VideoArea calls handleJoin --> joinRoom [useWebRTC hook] --> socket.emit('join_room', ...))
	socket.on('join_room', async ({ meetingId, name, profileImage }: { meetingId: string, name?: string, profileImage?: string }) => {
		if (!meetingId) return;
		console.log(`[ROOM] Socket ${socket.id} (user: ${userId}) joining room ${meetingId}`);

		// join the meeting room
		socket.join(`meeting:${meetingId}`); // any message sent to this room will reach this socket

		// if this is the first person joining this meeting
		if (!meetingRooms.has(meetingId)) meetingRooms.set(meetingId, new Map());
		const room = meetingRooms.get(meetingId)!;

		// build a list of everyone already in the room
		const existingPeers: Array<RoomPeerInfo & { socketId: string }> = [];
		for (const [sid, info] of room.entries()) {
			existingPeers.push({ socketId: sid, userId: info.userId, name: info.name, profileImage: info.profileImage });
		}

		// add the new user to the room
		room.set(socket.id, { userId: userId, name: name || 'User', profileImage: profileImage || null });

		console.log(`[ROOM] Existing peers for ${meetingId}:`, existingPeers.length);
		// send the list of existing peers to the client
		socket.emit('room_peers', { peers: existingPeers });
		console.log(`[ROOM] Broadcasting peer_joined to room ${meetingId} for socket ${socket.id}`);
		socket.to(`meeting:${meetingId}`).emit('peer_joined', {
			socketId: socket.id,
			userId: userId,
			name: name || 'User',
			profileImage: profileImage || null
		});
	});

	// passing webRTC messages between peers
	// to: socketID of the recipient, signal: the actual message (offer, answer, candidate)
	socket.on('signal', ({ to, signal }: { to: string, signal: any }) => {
		console.log(`[SIGNAL] ${socket.id} -> ${to}, type: ${signal.type}`);

		// forward the signal to the target socket
		io.to(to).emit('signal', { from: socket.id, signal });
	});

	// user leaves a meeting
	// (client: VideoArea calls handleLeave --> leaveRoom [useWebRTC hook] --> socket.emit('leave_room', ...))
	socket.on('leave_room', ({ meetingId }: { meetingId: string }) => {
		if (!meetingId) return;
		socket.leave(`meeting:${meetingId}`);
		const room = meetingRooms.get(meetingId);
		if (room) {
			room.delete(socket.id);
			if (room.size === 0) meetingRooms.delete(meetingId);
		}
		socket.to(`meeting:${meetingId}`).emit('peer_left', { socketId: socket.id });
	});

	// Transcription Control
	socket.on('start_transcription', ({ meetingId }) => {
		if (!meetingId) return;
		transcriptionSessions.set(meetingId, { active: true, speakers: new Map() });
		io.to(`meeting:${meetingId}`).emit('transcription_started', { meetingId });
	});

	socket.on('stop_transcription', ({ meetingId }) => {
		if (!meetingId) return;
		transcriptionSessions.delete(meetingId);
		io.to(`meeting:${meetingId}`).emit('transcription_stopped', { meetingId });
	});

	// used for other features (not webRTC)
	socket.on('join_meeting', (meetingId: string) => {
		socket.join(`meeting:${meetingId}`);
	});

	socket.on('leave_meeting', (meetingId: string) => {
		socket.leave(`meeting:${meetingId}`);
	});

	socket.on('transcript_update', (data) => socket.to(`meeting:${data.meetingId}`).emit('transcript_update', data));
	socket.on('action_item_created', (data) => socket.to(`meeting:${data.meetingId}`).emit('action_item_created', data));
	socket.on('action_item_updated', (data) => socket.to(`meeting:${data.meetingId}`).emit('action_item_updated', data));
	socket.on('poll_answer', (data) => socket.to(`meeting:${data.meetingId}`).emit('poll_answer', data));
	socket.on('outcome_updated', (data) => socket.to(`meeting:${data.meetingId}`).emit('outcome_updated', data));
	socket.on('note_created', (data) => socket.to(`meeting:${data.meetingId}`).emit('note_created', data));
	socket.on('notification_received', (data) => socket.to(`meeting:${data.meetingId}`).emit('notification_received', data));
	socket.on('meeting_status_changed', (data) => socket.to(`meeting:${data.meetingId}`).emit('meeting_status_changed', data));

	socket.on('disconnect', () => {
		for (const [meetingId, room] of meetingRooms.entries()) {
			if (room.has(socket.id)) {
				room.delete(socket.id);
				io.to(`meeting:${meetingId}`).emit('peer_left', { socketId: socket.id });
				if (room.size === 0) {
					meetingRooms.delete(meetingId);
					transcriptionSessions.delete(meetingId);
				}
			}
		}
	});
});

app.use(cors());
app.use(express.json());

// ─── Auth Helpers ─────────────────────────────────────────────
const generateToken = (id: string): string => jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });

// ─── SIGNUP ───────────────────────────────────────────────────
app.post('/api/auth/signup', async (req: Request, res: Response): Promise<void> => {
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

// ─── VERIFY ───────────────────────────────────────────────────
app.get('/api/auth/verify', protect, async (req: Request, res: Response): Promise<void> => {
	try {
		if (usingMongo && User && req.userId) {
			const user = await User.findById(req.userId).select('-password');
			if (!user) {
				res.status(401).json({ message: 'User not found' });
				return;
			}
			res.json(user);
			return;
		}
		const user = inMemoryUsers.find(u => u._id === req.userId);
		res.json(user ? { _id: user._id, name: user.name, email: user.email } : null);
	} catch (error) {
		res.status(500).json({ message: 'Server error' });
	}
});

// ─── LOGOUT ───────────────────────────────────────────────────
app.post('/api/auth/logout', (_req: Request, res: Response): void => {
	res.json({ message: 'Logged out successfully' });
});

// ─── ME ───────────────────────────────────────────────────────
app.get('/api/auth/me', protect, async (req: Request, res: Response): Promise<void> => {
	try {
		if (usingMongo && User && req.userId) {
			const user = await User.findById(req.userId).select('-password');
			res.json(user);
			return;
		}
		const user = inMemoryUsers.find(u => u._id === req.userId);
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



// ─── Protected API Routes ────────────────────────────────────
app.get('/api/meetings', protect, async (_req: Request, res: Response): Promise<void> => {
	try {
		if (usingMongo && Meeting) {
			const dbMeetings = await Meeting.find({}).sort({ createdAt: -1 }).populate('participants', 'name email');
			const formatted = dbMeetings.map((m: any) => ({
				id: m._id,
				title: m.title,
				modality: m.modality,
				date: m.date,
				time: m.time,
				confirmedDate: m.confirmedDate,
				confirmedTime: m.confirmedTime,
				location: m.location,
				host: m.host || 'Unknown',
				hostId: m.hostId,
				participants: m.participants,
				status: m.status,
				jitsiUrl: m.jitsiUrl,
				jitsiRoomName: m.jitsiRoomName,
				pollId: m.pollId,
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
		const { title, modality, date, time, location, participants } = req.body;
		let jitsiRoomName, jitsiUrl;
		if (modality !== 'Offline' && req.userId) {
			jitsiRoomName = `MCMS-${req.userId.substring(req.userId.length - 6)}-${Date.now()}`;
			jitsiUrl = `https://meet.jit.si/${jitsiRoomName}`;
		}
		let hostName = 'You';

		if (usingMongo && User && req.userId) {
			const userDoc = await User.findById(req.userId);
			if (userDoc) hostName = userDoc.name;
		}

		if (usingMongo && Meeting) {
			const newMeeting = await Meeting.create({
				title, modality, location,
				date, time,
				confirmedDate: date, confirmedTime: time,
				host: hostName,
				hostId: req.userId,
				jitsiUrl, jitsiRoomName,
				participants: participants || [],
				status: 'scheduled'
			});
			res.status(201).json({
				id: newMeeting._id, title: newMeeting.title, modality: newMeeting.modality,
				date: newMeeting.date, time: newMeeting.time, location: newMeeting.location,
				host: newMeeting.host, hostId: newMeeting.hostId, participants: newMeeting.participants,
				status: newMeeting.status, jitsiUrl: newMeeting.jitsiUrl, jitsiRoomName: newMeeting.jitsiRoomName
			});
			return;
		}

		const newMeeting: Meeting = {
			id: `mtg-${Date.now()}`, title, modality, date, time,
			host: hostName, participants: participants || [], status: 'scheduled',
			jitsiUrl, jitsiRoomName
		};
		meetings.push(newMeeting);
		res.status(201).json(newMeeting);
	} catch (error) {
		res.status(500).json({ message: 'Server error', error: (error as Error).message });
	}
});

app.get('/api/meetings/:id', protect, async (req: Request, res: Response): Promise<void> => {
	try {
		if (usingMongo && Meeting) {
			const m = await Meeting.findById(req.params.id).populate('participants', 'name email');
			if (!m) {
				res.status(404).json({ message: 'Meeting not found' });
				return;
			}
			res.json({
				id: m._id, title: m.title, modality: m.modality, date: m.date, time: m.time,
				confirmedDate: m.confirmedDate, confirmedTime: m.confirmedTime, location: m.location,
				host: m.host, hostId: m.hostId, participants: m.participants, status: m.status,
				jitsiUrl: m.jitsiUrl, jitsiRoomName: m.jitsiRoomName, pollId: m.pollId
			});
			return;
		}
		const meeting = meetings.find(mtg => mtg.id === req.params.id);
		if (!meeting) res.status(404).json({ message: 'Meeting not found' });
		else res.json(meeting);
	} catch (error) {
		res.status(500).json({ message: 'Server error', error: (error as Error).message });
	}
});

app.put('/api/meetings/:id', protect, async (req: Request, res: Response): Promise<void> => {
	try {
		if (usingMongo && Meeting) {
			const updated = await Meeting.findByIdAndUpdate(req.params.id, req.body, { new: true });
			if (!updated) {
				res.status(404).json({ message: 'Meeting not found' });
				return;
			}
			res.json(updated);
			return;
		}
		const idx = meetings.findIndex(mtg => mtg.id === req.params.id);
		if (idx === -1) {
			res.status(404).json({ message: 'Meeting not found' });
			return;
		}
		meetings[idx] = { ...meetings[idx], ...req.body };
		res.json(meetings[idx]);
	} catch (error) {
		res.status(500).json({ message: 'Server error', error: (error as Error).message });
	}
});

app.delete('/api/meetings/:id', protect, async (req: Request, res: Response): Promise<void> => {
	try {
		if (usingMongo && Meeting) {
			const deleted = await Meeting.findByIdAndDelete(req.params.id);
			if (!deleted) {
				res.status(404).json({ message: 'Meeting not found' });
				return;
			}
			res.json({ message: 'Meeting deleted successfully' });
			return;
		}
		const idx = meetings.findIndex(mtg => mtg.id === req.params.id);
		if (idx === -1) {
			res.status(404).json({ message: 'Meeting not found' });
			return;
		}
		meetings.splice(idx, 1);
		res.json({ message: 'Meeting deleted successfully' });
	} catch (error) {
		res.status(500).json({ message: 'Server error', error: (error as Error).message });
	}
});

app.post('/api/meetings/:id/start', protect, async (req: Request, res: Response): Promise<void> => {
	try {
		if (usingMongo && Meeting) {
			const meeting = await Meeting.findById(req.params.id);
			if (!meeting) {
				res.status(404).json({ message: 'Meeting not found' });
				return;
			}
			meeting.status = 'in-progress';
			await meeting.save();
			res.json(meeting);
			return;
		}
		const idx = meetings.findIndex(mtg => mtg.id === req.params.id);
		if (idx === -1) {
			res.status(404).json({ message: 'Meeting not found' });
			return;
		}
		meetings[idx].status = 'in-progress';
		res.json(meetings[idx]);
	} catch (error) {
		res.status(500).json({ message: 'Server error', error: (error as Error).message });
	}
});

app.post('/api/agenda/:meetingId', protect, async (req: Request, res: Response): Promise<void> => {
	try {
		const { items, totalDuration } = req.body;
		if (usingMongo && Agenda) {
			let agenda = await Agenda.findOne({ meetingId: req.params.meetingId });
			if (agenda) {
				agenda.items = items;
				agenda.totalDuration = totalDuration || 0;
				await agenda.save();
			} else {
				agenda = await Agenda.create({
					meetingId: req.params.meetingId,
					items: items || [],
					totalDuration: totalDuration || 0
				});
			}
			res.status(201).json(agenda);
			return;
		}
		agendas[req.params.meetingId] = items;
		res.status(201).json({ meetingId: req.params.meetingId, items, totalDuration: totalDuration || 0 });
	} catch (error) {
		res.status(500).json({ message: 'Server error', error: (error as Error).message });
	}
});

app.get('/api/agenda/:meetingId', protect, async (req: Request, res: Response): Promise<void> => {
	try {
		if (usingMongo && Agenda) {
			const agenda = await Agenda.findOne({ meetingId: req.params.meetingId });
			res.json(agenda || { items: [] });
			return;
		}
		res.json({ items: agendas[req.params.meetingId] || [] });
	} catch (error) {
		res.status(500).json({ message: 'Server error', error: (error as Error).message });
	}
});

app.put('/api/agenda/:meetingId/item/:itemId', protect, async (req: Request, res: Response): Promise<void> => {
	try {
		const { status } = req.body;
		if (usingMongo && Agenda) {
			const agenda = await Agenda.findOne({ meetingId: req.params.meetingId });
			if (!agenda) {
				res.status(404).json({ message: 'Agenda not found' });
				return;
			}
			const item = agenda.items.find((i: any) => i.id === req.params.itemId);
			if (!item) {
				res.status(404).json({ message: 'Item not found' });
				return;
			}
			const oldStatus = item.status;
			Object.assign(item, req.body);
			await agenda.save();

			if (status && status !== oldStatus) {
				io.to(req.params.meetingId).emit('meeting_status_changed', {
					meetingId: req.params.meetingId,
					agendaItemId: item.id,
					status,
					agendaId: agenda._id
				});
			}
			res.json(agenda);
			return;
		}

		const items = agendas[req.params.meetingId];
		if (!items) {
			res.status(404).json({ message: 'Agenda not found' });
			return;
		}
		const idx = items.findIndex((i: any) => i.id === req.params.itemId);
		if (idx === -1) {
			res.status(404).json({ message: 'Item not found' });
			return;
		}
		const oldStatus = items[idx].status;
		items[idx] = { ...items[idx], ...req.body };
		if (status && status !== oldStatus) {
			io.to(req.params.meetingId).emit('meeting_status_changed', {
				meetingId: req.params.meetingId,
				agendaItemId: req.params.itemId,
				status
			});
		}
		res.json({ items });
	} catch (error) {
		res.status(500).json({ message: 'Server error', error: (error as Error).message });
	}
});



// ─── Start Server ────────────────────────────────────────────
httpServer.listen(PORT, () => {
	console.log(`✅ MCMS Backend running at http://localhost:${PORT}`);
	console.log(`   MongoDB: ${usingMongo ? 'Connected' : 'Not running — users stored in-memory (lost on restart)'}`);
});

export default app;
