const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// GET /api/analytics/trends
router.get('/trends', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const { days } = req.query; // 7, 30, 90, 365
    const numDays = Number(days) || 30;
    const cutoffDate = new Date(Date.now() - numDays * 86400000);

    // 1. BMI Trends
    const bmiRecords = db.find('bmi_records', b => b.user_id === userId && new Date(b.recorded_at) >= cutoffDate)
      .sort((a, b) => new Date(a.recorded_at) - new Date(b.recorded_at));

    // 2. Weight Trends
    const weightRecords = db.find('weight_records', w => w.user_id === userId && new Date(w.recorded_at) >= cutoffDate)
      .sort((a, b) => new Date(a.recorded_at) - new Date(b.recorded_at));

    // 3. Blood Pressure Trends (Systolic vs Diastolic)
    const bpRecords = db.find('blood_pressure_records', bp => bp.user_id === userId && new Date(bp.recorded_at) >= cutoffDate)
      .sort((a, b) => new Date(a.recorded_at) - new Date(b.recorded_at));

    // 4. Heart Rate Trends
    const hrRecords = db.find('heart_rate_records', hr => hr.user_id === userId && new Date(hr.recorded_at) >= cutoffDate)
      .sort((a, b) => new Date(a.recorded_at) - new Date(b.recorded_at));

    // 5. Water Intake Trends
    const waterRecords = db.find('water_intake_records', w => w.user_id === userId && new Date(w.recorded_date) >= cutoffDate)
      .sort((a, b) => new Date(a.recorded_date) - new Date(b.recorded_date));

    // Group water by date
    const waterByDate = {};
    waterRecords.forEach(r => {
      waterByDate[r.recorded_date] = (waterByDate[r.recorded_date] || 0) + r.amount_ml;
    });

    // 6. Activity Trends (Steps & Minutes)
    const activityRecords = db.find('activity_records', a => a.user_id === userId && new Date(a.recorded_date) >= cutoffDate)
      .sort((a, b) => new Date(a.recorded_date) - new Date(b.recorded_date));

    const activityByDate = {};
    activityRecords.forEach(r => {
      if (!activityByDate[r.recorded_date]) {
        activityByDate[r.recorded_date] = { steps: 0, minutes: 0, calories: 0 };
      }
      activityByDate[r.recorded_date].steps += r.steps || 0;
      activityByDate[r.recorded_date].minutes += r.active_minutes || 0;
      activityByDate[r.recorded_date].calories += r.calories_burned || 0;
    });

    // 7. Sleep Trends
    const sleepRecords = db.find('sleep_records', s => s.user_id === userId && new Date(s.recorded_date) >= cutoffDate)
      .sort((a, b) => new Date(a.recorded_date) - new Date(b.recorded_date));

    res.json({
      success: true,
      data: {
        bmi: bmiRecords.map(r => ({
          date: r.recorded_at.split('T')[0],
          value: Number(r.bmi_value),
          category: r.category
        })),
        weight: weightRecords.map(r => ({
          date: r.recorded_at.split('T')[0],
          weight_kg: Number(r.weight_kg)
        })),
        bloodPressure: bpRecords.map(r => ({
          date: r.recorded_at.split('T')[0],
          systolic: r.systolic,
          diastolic: r.diastolic,
          pulse: r.pulse,
          category: r.category
        })),
        heartRate: hrRecords.map(r => ({
          date: r.recorded_at.split('T')[0],
          heart_rate: r.heart_rate,
          category: r.category
        })),
        water: Object.keys(waterByDate).map(date => ({
          date,
          amount_ml: waterByDate[date]
        })),
        activity: Object.keys(activityByDate).map(date => ({
          date,
          steps: activityByDate[date].steps,
          minutes: activityByDate[date].minutes,
          calories: activityByDate[date].calories
        })),
        sleep: sleepRecords.map(r => ({
          date: r.recorded_date,
          hours: Number(r.sleep_hours),
          quality: r.sleep_quality
        }))
      }
    });
  } catch (error) {
    console.error('Analytics trends error:', error);
    res.status(500).json({ success: false, message: 'Could not fetch trend analytics.' });
  }
});

module.exports = router;
