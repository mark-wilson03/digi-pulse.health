const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// All admin routes require admin role
router.use(authenticateToken);
router.use(requireAdmin);

// GET /api/admin/users
router.get('/users', (req, res) => {
  try {
    const users = db.getTable('users') || [];
    const profiles = db.getTable('profiles') || [];
    const bmiRecords = db.getTable('bmi_records') || [];
    const bpRecords = db.getTable('blood_pressure_records') || [];

    const userList = users.map(u => {
      const p = profiles.find(prof => prof.user_id === u.id) || {};
      const userBmis = bmiRecords.filter(b => b.user_id === u.id);
      const userBps = bpRecords.filter(bp => bp.user_id === u.id);

      return {
        id: u.id,
        fullName: u.full_name,
        email: u.email,
        role: u.role,
        status: u.status,
        created_at: u.created_at,
        profile: {
          age: p.age,
          sex: p.sex,
          bloodType: p.blood_type,
          height_cm: p.height_cm,
          weight_kg: p.weight_kg
        },
        counts: {
          bmiLogs: userBmis.length,
          bpLogs: userBps.length
        }
      };
    });

    res.json({ success: true, data: userList });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not fetch user directory.' });
  }
});

// PUT /api/admin/users/:id/status
router.put('/users/:id/status', (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body; // 'active', 'suspended'

    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    const user = db.findOne('users', u => u.id === id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    // Prevent suspending own admin account
    if (user.id === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot suspend your own administrative account.' });
    }

    db.update('users', id, { status });
    res.json({ success: true, message: `User account has been ${status}.` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not update user status.' });
  }
});

// PUT /api/admin/users/:id
router.put('/users/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    const { fullName, email, role, status } = req.body;

    const user = db.findOne('users', u => u.id === id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    const updates = {};
    if (fullName) updates.full_name = fullName.trim();
    if (email) updates.email = email.trim().toLowerCase();
    if (role && ['user', 'admin'].includes(role)) updates.role = role;
    if (status && ['active', 'suspended'].includes(status)) updates.status = status;

    const updated = db.update('users', id, updates);
    res.json({ success: true, message: 'User record updated.', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not update user.' });
  }
});

// GET /api/admin/stats
router.get('/stats', (req, res) => {
  try {
    const users = db.getTable('users') || [];
    const bmiList = db.getTable('bmi_records') || [];
    const bpList = db.getTable('blood_pressure_records') || [];
    const riskList = db.getTable('health_risk_assessments') || [];
    const articles = db.getTable('health_articles') || [];

    const activeUsers = users.filter(u => u.status === 'active').length;
    const suspendedUsers = users.filter(u => u.status === 'suspended').length;

    // Condition breakdown
    const bpCategories = {};
    bpList.forEach(bp => {
      bpCategories[bp.category] = (bpCategories[bp.category] || 0) + 1;
    });

    const bmiCategories = {};
    bmiList.forEach(b => {
      bmiCategories[b.category] = (bmiCategories[b.category] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        totalUsers: users.length,
        activeUsers,
        suspendedUsers,
        totalBmiAssessments: bmiList.length,
        totalBpLogs: bpList.length,
        totalRiskScreenings: riskList.length,
        totalArticles: articles.length,
        bpCategories,
        bmiCategories
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not fetch admin statistics.' });
  }
});

module.exports = router;
