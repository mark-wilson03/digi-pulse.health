const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// GET /api/export/csv
router.get('/csv', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const user = db.findOne('users', u => u.id === userId);
    const profile = db.findOne('profiles', p => p.user_id === userId) || {};

    const bp = db.find('blood_pressure_records', r => r.user_id === userId);
    const weight = db.find('weight_records', r => r.user_id === userId);
    const hr = db.find('heart_rate_records', r => r.user_id === userId);
    const activity = db.find('activity_records', r => r.user_id === userId);

    let csv = `DIGIPULSE HEALTH HISTORY EXPORT\n`;
    csv += `Patient Name:,"${user.full_name}"\n`;
    csv += `Email:,"${user.email}"\n`;
    csv += `Export Date:,"${new Date().toLocaleString()}"\n`;
    csv += `Blood Type:,"${profile.blood_type || 'N/A'}"\n\n`;

    csv += `--- BLOOD PRESSURE LOGS ---\n`;
    csv += `Date,Systolic (mmHg),Diastolic (mmHg),Pulse (bpm),Classification,Notes\n`;
    bp.forEach(r => {
      const d = (r.recorded_at || r.created_at || new Date().toISOString()).split('T')[0];
      csv += `"${d}",${r.systolic},${r.diastolic},${r.pulse || ''},"${r.category}","${r.notes || ''}"\n`;
    });

    csv += `\n--- WEIGHT LOGS ---\n`;
    csv += `Date,Weight (kg),Notes\n`;
    weight.forEach(w => {
      const d = (w.recorded_at || w.created_at || new Date().toISOString()).split('T')[0];
      csv += `"${d}",${w.weight_kg},"${w.notes || ''}"\n`;
    });

    csv += `\n--- HEART RATE LOGS ---\n`;
    csv += `Date,BPM,Category,Context,Notes\n`;
    hr.forEach(h => {
      const d = (h.recorded_at || h.created_at || new Date().toISOString()).split('T')[0];
      csv += `"${d}",${h.heart_rate},"${h.category}","${h.context || ''}","${h.notes || ''}"\n`;
    });

    csv += `\n--- PHYSICAL ACTIVITY LOGS ---\n`;
    csv += `Date,Activity Type,Steps,Active Minutes,Calories Burned\n`;
    activity.forEach(a => {
      const d = (a.recorded_date || a.created_at || new Date().toISOString()).split('T')[0];
      csv += `"${d}","${a.activity_type}",${a.steps},${a.active_minutes},${a.calories_burned}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=digipulse_health_history_${userId}.csv`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not generate CSV export.' });
  }
});

// GET /api/export/report-data (Structured JSON for rendering high-res printable PDF report)
router.get('/report-data', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const user = db.findOne('users', u => u.id === userId);
    const profile = db.findOne('profiles', p => p.user_id === userId) || {};

    const bmiRecords = db.find('bmi_records', r => r.user_id === userId)
      .sort((a, b) => new Date(b.recorded_at) - new Date(a.recorded_at));
    const bpRecords = db.find('blood_pressure_records', r => r.user_id === userId)
      .sort((a, b) => new Date(b.recorded_at) - new Date(a.recorded_at));
    const hrRecords = db.find('heart_rate_records', r => r.user_id === userId)
      .sort((a, b) => new Date(b.recorded_at) - new Date(a.recorded_at));
    const riskAssessments = db.find('health_risk_assessments', r => r.user_id === userId)
      .sort((a, b) => new Date(b.assessed_at) - new Date(a.assessed_at));

    res.json({
      success: true,
      report: {
        generatedAt: new Date().toISOString(),
        user: {
          fullName: user.full_name,
          email: user.email,
          age: profile.age,
          sex: profile.sex,
          bloodType: profile.blood_type,
          height_cm: profile.height_cm,
          weight_kg: profile.weight_kg,
          emergencyContact: {
            name: profile.emergency_contact_name,
            phone: profile.emergency_contact_phone,
            relation: profile.emergency_contact_relation
          },
          goals: profile.health_goals
        },
        latestVitals: {
          bmi: bmiRecords[0] || null,
          bp: bpRecords[0] || null,
          heartRate: hrRecords[0] || null
        },
        recentBpHistory: bpRecords.slice(0, 10),
        recentRiskScreenings: riskAssessments.slice(0, 5)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not generate report data.' });
  }
});

module.exports = router;
