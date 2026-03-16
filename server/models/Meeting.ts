import mongoose, { Schema, Document } from 'mongoose';

interface IMeeting extends Document {
  _id: any;
  title: string;
  modality: 'Online' | 'Offline' | 'Hybrid';
  date?: string;
  time?: string;
  host?: string;
  hostId?: mongoose.Types.ObjectId;
  participants: string[];
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  jitsiUrl?: string;
  jitsiRoomName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const meetingSchema = new Schema({
  title: { type: String, required: true },
  modality: { type: String, default: 'Online', enum: ['Online', 'Offline', 'Hybrid'] },
  date: { type: String },
  time: { type: String },
  host: { type: String },
  hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  participants: [String],
  status: { type: String, default: 'scheduled', enum: ['scheduled', 'in-progress', 'completed', 'cancelled'] },
  jitsiUrl: { type: String },
  jitsiRoomName: { type: String },
}, {
  timestamps: true
});

export default mongoose.model<IMeeting>('Meeting', meetingSchema);
