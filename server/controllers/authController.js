const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '30d' });

// Guest tokens carry a synthetic id (never written to the User collection)
// plus a `guest: true` claim. authMiddleware reads that claim and builds
// req.user directly from the token instead of hitting the database, so the
// rest of the app (alarm routes, alarmController, etc.) works unmodified for
// both real and guest users.
const generateGuestToken = (guestId) =>
  jwt.sign({ id: guestId, guest: true }, process.env.JWT_SECRET, { expiresIn: '1d' });

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const user = await User.create({ name, email, password });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// No Mongo User is created and no credentials are involved — this just
// mints a short-lived JWT with a fresh synthetic id so the guest can be
// identified by the existing `protect` middleware and reuse every
// authenticated route/controller (alarms, stations) exactly as-is.
exports.guestLogin = async (req, res) => {
  try {
    const guestId = new mongoose.Types.ObjectId();
    res.status(200).json({
      _id: guestId,
      name: 'Guest',
      isGuest: true,
      token: generateGuestToken(guestId),
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};