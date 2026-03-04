const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
    title: { type: String, required: true },
    modality: { type: String, default: 'Online' },
    date: { type: String },
    time: { type: String },
    host: { type: String }, // Storing host name string for now based on mock, can convert to ObjectId later
    hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    participants: [String],
    status: { type: String, default: 'scheduled', enum: ['scheduled', 'in-progress', 'completed', 'cancelled'] },
    jitsiUrl: { type: String },
    jitsiRoomName: { type: String }, // Random unique string to act as the room name
}, {
    timestamps: true
});

module.exports = mongoose.model('Meeting', meetingSchema);
