const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// GET /api/notifications
router.get('/', authenticateToken, (req, res) => {
  try {
    const list = db.find('notifications', n => n.user_id === req.user.id)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    res.json({ success: true, data: list });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not fetch notifications.' });
  }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', authenticateToken, (req, res) => {
  try {
    const id = Number(req.params.id);
    const notif = db.findOne('notifications', n => n.id === id && n.user_id === req.user.id);
    if (!notif) return res.status(404).json({ success: false, message: 'Notification not found.' });

    db.update('notifications', id, { is_read: 1 });
    res.json({ success: true, message: 'Marked as read.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not update notification.' });
  }
});

// POST /api/notifications/read-all
router.post('/read-all', authenticateToken, (req, res) => {
  try {
    const list = db.find('notifications', n => n.user_id === req.user.id && !n.is_read);
    list.forEach(n => {
      db.update('notifications', n.id, { is_read: 1 });
    });
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not mark all as read.' });
  }
});

// POST /api/notifications/trigger (Manual / scheduled reminder generator)
router.post('/trigger', authenticateToken, (req, res) => {
  try {
    const { type, message } = req.body;
    // Types: Drinking Water, Exercise, Health Checkups, Sleep Schedule, Blood Pressure Recording
    const validTypes = {
      'Water': { title: 'Hydration Alert 💧', defaultMsg: 'Drink a glass of water now to stay on track for today.' },
      'Exercise': { title: 'Movement Break 🏃', defaultMsg: 'Time for a 10-minute walk or light stretching routine.' },
      'Checkup': { title: 'Health Assessment 🩺', defaultMsg: 'Take 2 minutes to review your monthly health risk score.' },
      'Sleep': { title: 'Wind-down Reminder 🌙', defaultMsg: 'Dim ambient lights and turn off screens for restorative rest.' },
      'Blood Pressure': { title: 'Blood Pressure Log 💓', defaultMsg: 'Record your resting blood pressure in a calm seated position.' }
    };

    const config = validTypes[type] || { title: 'DigiPulse Alert 🌿', defaultMsg: 'Healthy habits create lasting wellness.' };
    const notif = db.insert('notifications', {
      user_id: req.user.id,
      type: type || 'System',
      title: config.title,
      message: message || config.defaultMsg,
      is_read: 0,
      scheduled_time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    res.status(201).json({ success: true, message: 'Reminder generated.', data: notif });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not trigger notification.' });
  }
});

module.exports = router;
