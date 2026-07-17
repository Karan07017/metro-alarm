const mongoose = require('mongoose');

const stationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    // yahan se unique: true hataya
  },
  line: {
    type: String,
    required: true,
  },
  coords: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  order: {
    type: Number,
    required: true,
  },
}, { timestamps: true });

// compound unique index — same station name alag lines pe ho sakta hai,
// but ek line ke andar duplicate nahi hona chahiye
stationSchema.index({ name: 1, line: 1 }, { unique: true });

module.exports = mongoose.model('Station', stationSchema);