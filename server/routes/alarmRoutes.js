const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createAlarm,
  getAlarms,
  updateAlarmStatus,
  startAlarm,
  updateTriggerMode,
} = require('../controllers/alarmController');

router.use(protect);

router.post('/', createAlarm);
router.get('/', getAlarms);
router.patch('/:id/start', startAlarm);
router.patch('/:id/mode', updateTriggerMode);
router.patch('/:id', updateAlarmStatus);

module.exports = router;