const mongoose = require('mongoose');

const alarmSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  destinationStation: {
    type: String,
    required: true,
  },
  destinationCoords: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  // Station ek stop pehle destination se — alarm yahi actually ring hota hai,
  // taaki utarne ki tayyari ke liye ek poora stop mil jaaye.
  triggerStation: {
    type: String,
  },
  triggerCoords: {
    lat: { type: Number },
    lng: { type: Number },
  },
  triggerDistance: {
    type: Number,
    default: 500,
  },
  durationMinutes: {
    type: Number,
    required: true,
  },
  startTime: {
    type: Date,
    default: null,
  },
  expectedArrivalTime: {
    type: Date,
    default: null,
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'triggered', 'cancelled'],
    default: 'pending',
  },
  triggerMode: {
    type: String,
    enum: ['gps', 'time-fallback'],
    default: 'gps',
  },
}, { timestamps: true });

module.exports = mongoose.model('Alarm', alarmSchema);