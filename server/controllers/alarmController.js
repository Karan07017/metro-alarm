const Alarm = require('../models/Alarm');
const calculateTravelTime = require('../utils/calculateTravelTime');

exports.createAlarm = async (req, res) => {
  try {
    const { fromStationId, toStationId, triggerDistance } = req.body;

    const { alertMinutes, toStation, alertStation } = await calculateTravelTime(fromStationId, toStationId);

    const alarm = await Alarm.create({
      user: req.user._id,
      destinationStation: toStation.name,
      destinationCoords: toStation.coords,
      triggerStation: alertStation.name,
      triggerCoords: alertStation.coords,
      triggerDistance: triggerDistance || 500,
      durationMinutes: alertMinutes,
      status: 'pending',
      triggerMode: 'gps',
    });

    res.status(201).json(alarm);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.startAlarm = async (req, res) => {
  try {
    const alarm = await Alarm.findOne({ _id: req.params.id, user: req.user._id });
    if (!alarm) return res.status(404).json({ error: 'Alarm not found' });
    if (alarm.status !== 'pending') {
      return res.status(400).json({ error: 'Alarm already started or finished' });
    }

    const now = new Date();
    alarm.startTime = now;
    alarm.expectedArrivalTime = new Date(now.getTime() + alarm.durationMinutes * 60000);
    alarm.status = 'active';
    await alarm.save();

    res.json(alarm);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAlarms = async (req, res) => {
  try {
    const alarms = await Alarm.find({ user: req.user._id });
    res.json(alarms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateAlarmStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'active', 'triggered', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const alarm = await Alarm.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { status },
      { returnDocument: 'after' }
    );

    if (!alarm) return res.status(404).json({ error: 'Alarm not found' });
    res.json(alarm);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateTriggerMode = async (req, res) => {
  try {
    const { triggerMode } = req.body;
    if (!['gps', 'time-fallback'].includes(triggerMode)) {
      return res.status(400).json({ error: 'Invalid trigger mode' });
    }

    const alarm = await Alarm.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { triggerMode },
      { returnDocument: 'after' }
    );

    if (!alarm) return res.status(404).json({ error: 'Alarm not found' });
    res.json(alarm);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};