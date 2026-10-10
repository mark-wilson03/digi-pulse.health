const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// GET /api/tips/today
router.get('/today', (req, res) => {
  try {
    const tips = db.getTable('daily_tips') || [];
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    const tipIndex = tips.length > 0 ? dayOfYear % tips.length : 0;
    const tip = tips[tipIndex] || {
      tip_text: "Hydration before caffeine enhances cognitive alertness and cellular fluid balance.",
      category: "Hydration",
      icon: "droplet"
    };

    res.json({ success: true, data: tip });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not fetch tip.' });
  }
});

// GET /api/tips (All tips)
router.get('/', (req, res) => {
  try {
    const tips = db.getTable('daily_tips') || [];
    res.json({ success: true, data: tips });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not fetch tips.' });
  }
});

// POST /api/tips (Admin)
router.post('/', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { tip_text, category, icon } = req.body;
    if (!tip_text) return res.status(400).json({ success: false, message: 'Tip text is required.' });

    const newTip = db.insert('daily_tips', {
      tip_text: tip_text.trim(),
      category: category || 'General',
      icon: icon || 'heart-pulse',
      is_active: 1
    });

    res.status(201).json({ success: true, message: 'Tip published.', data: newTip });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not publish tip.' });
  }
});

module.exports = router;
