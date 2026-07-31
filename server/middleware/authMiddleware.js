const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Not authorized, no token' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.guest) {
      // Guest tokens are self-contained (no Mongo User backs them). Build
      // req.user straight from the token claims so every downstream
      // controller (alarms, stations, ...) keeps working unchanged for
      // both authenticated and guest requests.
      req.user = { _id: decoded.id, isGuest: true };
      return next();
    }

    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ error: 'User not found' });
    next();
  } catch (err) {
    res.status(401).json({ error: 'Not authorized, token invalid' });
  }
};

module.exports = { protect };