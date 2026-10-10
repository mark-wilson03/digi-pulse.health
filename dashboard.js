const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// GET /api/dashboard/summary
router.get('/summary', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const user = db.findOne('users', u => u.id === userId);
    const profile = db.findOne('profiles', p => p.user_id === userId) || {};

    // 1. BMI Status
    const bmiRecords = db.find('bmi_records', b => b.user_id === userId)
      .sort((a, b) => new Date(b.recorded_at) - new Date(a.recorded_at));
    const latestBmi = bmiRecords[0] || {
      bmi_value: profile.height_cm && profile.weight_kg ? Number((profile.weight_kg / Math.pow(profile.height_cm / 100, 2)).toFixed(2)) : 22.5,
      category: 'Normal'
    };

    // 2. Weight Status
    const weightRecords = db.find('weight_records', w => w.user_id === userId)
      .sort((a, b) => new Date(b.recorded_at) - new Date(a.recorded_at));
    const currentWeight = weightRecords[0]?.weight_kg || profile.weight_kg || 70.0;
    const targetWeight = profile.target_weight_kg || 65.0;
    const weightDiff = Number((currentWeight - targetWeight).toFixed(1));

    // 3. Blood Pressure Status
    const bpRecords = db.find('blood_pressure_records', bp => bp.user_id === userId)
      .sort((a, b) => new Date(b.recorded_at) - new Date(a.recorded_at));
    const latestBp = bpRecords[0] || {
      systolic: 120,
      diastolic: 80,
      pulse: 72,
      category: 'Normal'
    };

    // 4. Heart Rate Status
    const hrRecords = db.find('heart_rate_records', hr => hr.user_id === userId)
      .sort((a, b) => new Date(b.recorded_at) - new Date(a.recorded_at));
    const latestHr = hrRecords[0] || {
      heart_rate: 72,
      category: 'Normal',
      context: 'Resting'
    };

    // 5. Water Intake Progress (Today)
    const todayStr = new Date().toISOString().split('T')[0];
    const waterRecords = db.find('water_intake_records', w => w.user_id === userId && w.recorded_date === todayStr);
    const todayWaterMl = waterRecords.reduce((sum, r) => sum + (r.amount_ml || 0), 0);
    const targetWaterMl = profile.target_water_ml || 2500;
    const waterPercent = Math.min(100, Math.round((todayWaterMl / targetWaterMl) * 100));

    // 6. Daily Activity Progress (Today)
    const activityRecords = db.find('activity_records', a => a.user_id === userId && a.recorded_date === todayStr);
    const todaySteps = activityRecords.reduce((sum, r) => sum + (r.steps || 0), 0);
    const todayMinutes = activityRecords.reduce((sum, r) => sum + (r.active_minutes || 0), 0);
    const todayCalories = activityRecords.reduce((sum, r) => sum + (r.calories_burned || 0), 0);
    const targetSteps = profile.target_steps || 10000;
    const activityPercent = Math.min(100, Math.round((todaySteps / targetSteps) * 100));

    // 7. Daily Health Tip (cycle based on day of year)
    const tips = db.getTable('daily_tips') || [];
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    const tipIndex = tips.length > 0 ? dayOfYear % tips.length : 0;
    const dailyTip = tips[tipIndex] || {
      tip_text: "Drink a tall glass of water upon waking and take short movement breaks every hour.",
      category: "Wellness",
      icon: "droplet"
    };

    // Unread notifications count
    const unreadNotifications = db.find('notifications', n => n.user_id === userId && !n.is_read).length;

    res.json({
      success: true,
      data: {
        greetingName: user.full_name,
        email: user.email,
        role: user.role,
        profile,
        metrics: {
          bmi: {
            value: Number(latestBmi.bmi_value),
            category: latestBmi.category
          },
          weight: {
            current: currentWeight,
            target: targetWeight,
            diff: weightDiff
          },
          bloodPressure: {
            systolic: latestBp.systolic,
            diastolic: latestBp.diastolic,
            pulse: latestBp.pulse || 72,
            category: latestBp.category
          },
          heartRate: {
            rate: latestHr.heart_rate,
            category: latestHr.category,
            context: latestHr.context
          },
          water: {
            currentMl: todayWaterMl,
            targetMl: targetWaterMl,
            percent: waterPercent,
            glasses: Math.round(todayWaterMl / 250)
          },
          activity: {
            steps: todaySteps,
            targetSteps,
            activeMinutes: todayMinutes,
            calories: todayCalories,
            percent: activityPercent
          }
        },
        dailyTip,
        unreadNotifications
      }
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({ success: false, message: 'Could not fetch dashboard summary.' });
  }
});

module.exports = router;
