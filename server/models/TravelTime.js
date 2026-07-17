const mongoose = require('mongoose');

const travelTimeSchema = new mongoose.Schema({
  fromStation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Station',
    required: true,
  },
  toStation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Station',
    required: true,
  },
  avgMinutes: {
    type: Number, // in dono stations ke beech average time (minutes mein)
    required: true,
  },
}, { timestamps: true });

travelTimeSchema.index({ fromStation: 1, toStation: 1 }, { unique: true });

module.exports = mongoose.model('TravelTime', travelTimeSchema);