import mongoose, { Schema, Document } from 'mongoose';

export interface IAgendaItem {
  id: string;
  title: string;
  description?: string;
  duration: number;
  status: 'pending' | 'in-progress' | 'completed' | 'skipped';
  startTime?: Date;
  endTime?: Date;
  speaker?: string;
  notes?: string;
}

export interface IAgenda extends Document {
  meetingId: mongoose.Types.ObjectId;
  items: IAgendaItem[];
  totalDuration: number;
  createdAt: Date;
  updatedAt: Date;
}

const agendaItemSchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  duration: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'in-progress', 'completed', 'skipped'], default: 'pending' },
  startTime: { type: Date },
  endTime: { type: Date },
  speaker: { type: String },
  notes: { type: String, default: '' }
}, { _id: false });

const agendaSchema = new Schema({
  meetingId: { type: Schema.Types.ObjectId, ref: 'Meeting', required: true, unique: true },
  items: [agendaItemSchema],
  totalDuration: { type: Number, default: 0 },
}, {
  timestamps: true
});

export default mongoose.model<IAgenda>('Agenda', agendaSchema);
