const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// Helper: Classify Blood Pressure according to AHA Guidelines
function classifyBloodPressure(systolic, diastolic) {
  if (systolic > 180 || diastolic > 120) {
    return {
      category: 'Hypertensive Crisis',
      color: '#ef4444',
      advice: 'URGENT: Your blood pressure is critically elevated. If experiencing chest pain, shortness of breath, or numbness, seek emergency medical care immediately.'
    };
  }
  if (systolic >= 140 || diastolic >= 90) {
    return {
      category: 'Hypertension Stage 2',
      color: '#dc2626',
      advice: 'Your reading indicates Stage 2 Hypertension. Consult your prescribing physician or cardiologist for pharmacological evaluation and sodium reduction.'
    };
  }
  if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) {
    return {
      category: 'Hypertension Stage 1',
      color: '#f97316',
      advice: 'Your reading is in Stage 1 Hypertension. Lifestyle interventions—such as the DASH diet, 150 mins aerobic activity/wk, and limiting alcohol—are recommended.'
    };
  }
  if (systolic >= 120 && systolic <= 129 && diastolic < 80) {
    return {
      category: 'Elevated',
      color: '#eab308',
      advice: 'Your systolic reading is elevated. Proactively manage stress, reduce dietary sodium, and maintain hydration to prevent progression to hypertension.'
    };
  }
  if (systolic < 90 || diastolic < 60) {
    return {
      category: 'Low Blood Pressure',
      color: '#3b82f6',
      advice: 'Your blood pressure is on the lower side. Ensure adequate hydration and electrolytes. Consult a physician if experiencing dizziness, fainting, or blurred vision.'
    };
  }
  return {
    category: 'Normal',
    color: '#10b981',
    advice: 'Optimal blood pressure! Continue your balanced nutrition, regular physical exercise, and stress-reduction practices.'
  };
}

// Helper: Classify Heart Rate
function classifyHeartRate(bpm) {
  if (bpm < 60) {
    return {
      category: 'Low',
      statusText: 'Bradycardia (< 60 bpm)',
      advice: 'Low resting heart rate. This is common and normal in well-conditioned aerobic athletes, but consult a doctor if accompanied by lightheadedness or fatigue.'
    };
  }
  if (bpm <= 100) {
    return {
      category: 'Normal',
      statusText: 'Normal Resting Heart Rate (60 - 100 bpm)',
      advice: 'Optimal resting pulse. Maintains efficient systemic tissue perfusion and cardiac longevity.'
    };
  }
  return {
    category: 'High',
    statusText: 'Tachycardia (> 100 bpm)',
    advice: 'Elevated resting heart rate. Dehydration, stress, excess caffeine, or fever can elevate pulse. If persistently elevated at rest, seek clinical evaluation.'
  };
}

// ==========================================
// 1. BLOOD PRESSURE ROUTES
// ==========================================
router.get('/bp', authenticateToken, (req, res) => {
  try {
    const records = db.find('blood_pressure_records', r => r.user_id === req.user.id)
      .sort((a, b) => new Date(b.recorded_at) - new Date(a.recorded_at));
    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not fetch blood pressure history.' });
  }
});

router.post('/bp', authenticateToken, (req, res) => {
  try {
    const { systolic, diastolic, pulse, notes, recorded_at } = req.body;
    const sys = Number(systolic);
    const dia = Number(diastolic);

    if (!sys || !dia) {
      return res.status(400).json({ success: false, message: 'Systolic and Diastolic values are required.' });
    }

    const { category, advice } = classifyBloodPressure(sys, dia);
    const record = db.insert('blood_pressure_records', {
      user_id: req.user.id,
      systolic: sys,
      diastolic: dia,
      pulse: pulse ? Number(pulse) : null,
      category,
      notes: notes || '',
      recorded_at: recorded_at || new Date().toISOString()
    });

    res.status(201).json({
      success: true,
      message: 'Blood pressure recorded successfully.',
      data: {
        record,
        category,
        advice
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not log blood pressure.' });
  }
});

router.delete('/bp/:id', authenticateToken, (req, res) => {
  try {
    const id = Number(req.params.id);
    const record = db.findOne('blood_pressure_records', r => r.id === id && r.user_id === req.user.id);
    if (!record) return res.status(404).json({ success: false, message: 'Record not found.' });

    db.delete('blood_pressure_records', id);
    res.json({ success: true, message: 'Blood pressure entry removed.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not delete entry.' });
  }
});

// ==========================================
// 2. HEART RATE ROUTES
// ==========================================
router.get('/heart-rate', authenticateToken, (req, res) => {
  try {
    const records = db.find('heart_rate_records', r => r.user_id === req.user.id)
      .sort((a, b) => new Date(b.recorded_at) - new Date(a.recorded_at));
    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not fetch heart rate history.' });
  }
});

router.post('/heart-rate', authenticateToken, (req, res) => {
  try {
    const { heart_rate, context, notes, recorded_at } = req.body;
    const bpm = Number(heart_rate);

    if (!bpm || bpm <= 0) {
      return res.status(400).json({ success: false, message: 'Valid heart rate is required.' });
    }

    const { category, advice } = classifyHeartRate(bpm);
    const record = db.insert('heart_rate_records', {
      user_id: req.user.id,
      heart_rate: bpm,
      category,
      context: context || 'Resting',
      notes: notes || '',
      recorded_at: recorded_at || new Date().toISOString()
    });

    res.status(201).json({
      success: true,
      message: 'Heart rate recorded successfully.',
      data: {
        record,
        category,
        advice
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not log heart rate.' });
  }
});

// ==========================================
// 3. WEIGHT TRACKER ROUTES
// ==========================================
router.get('/weight', authenticateToken, (req, res) => {
  try {
    const records = db.find('weight_records', r => r.user_id === req.user.id)
      .sort((a, b) => new Date(b.recorded_at) - new Date(a.recorded_at));
    const profile = db.findOne('profiles', p => p.user_id === req.user.id) || {};

    res.json({
      success: true,
      data: {
        records,
        current: records[0]?.weight_kg || profile.weight_kg || 70,
        target: profile.target_weight_kg || 65
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not fetch weight records.' });
  }
});

router.post('/weight', authenticateToken, (req, res) => {
  try {
    const { weight_kg, notes, recorded_at } = req.body;
    const w = Number(weight_kg);

    if (!w || w <= 0) {
      return res.status(400).json({ success: false, message: 'Valid weight is required.' });
    }

    const record = db.insert('weight_records', {
      user_id: req.user.id,
      weight_kg: w,
      notes: notes || '',
      recorded_at: recorded_at || new Date().toISOString()
    });

    // Update profile
    const profile = db.findOne('profiles', p => p.user_id === req.user.id);
    if (profile) {
      db.update('profiles', profile.id, { weight_kg: w });
    }

    res.status(201).json({
      success: true,
      message: 'Weight recorded successfully.',
      data: record
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not log weight.' });
  }
});

// ==========================================
// 4. WATER INTAKE TRACKER ROUTES
// ==========================================
router.get('/water', authenticateToken, (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const userRecords = db.find('water_intake_records', r => r.user_id === req.user.id);
    const todayRecords = userRecords.filter(r => r.recorded_date === todayStr);
    const todayTotal = todayRecords.reduce((sum, r) => sum + r.amount_ml, 0);

    const profile = db.findOne('profiles', p => p.user_id === req.user.id) || {};
    const goal = profile.target_water_ml || 2500;

    res.json({
      success: true,
      data: {
        todayTotal,
        goal,
        glasses: Math.round(todayTotal / 250),
        percent: Math.min(100, Math.round((todayTotal / goal) * 100)),
        todayRecords
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not fetch water intake.' });
  }
});

router.post('/water', authenticateToken, (req, res) => {
  try {
    const { amount_ml, glasses } = req.body;
    const ml = amount_ml ? Number(amount_ml) : (glasses ? Number(glasses) * 250 : 250);
    const todayStr = new Date().toISOString().split('T')[0];

    const record = db.insert('water_intake_records', {
      user_id: req.user.id,
      amount_ml: ml,
      glasses: Math.round(ml / 250),
      recorded_date: todayStr,
      recorded_at: new Date().toISOString()
    });

    const userRecords = db.find('water_intake_records', r => r.user_id === req.user.id && r.recorded_date === todayStr);
    const todayTotal = userRecords.reduce((sum, r) => sum + r.amount_ml, 0);
    const profile = db.findOne('profiles', p => p.user_id === req.user.id) || {};
    const goal = profile.target_water_ml || 2500;

    res.status(201).json({
      success: true,
      message: `Added ${ml} mL of water.`,
      data: {
        todayTotal,
        goal,
        percent: Math.min(100, Math.round((todayTotal / goal) * 100)),
        newRecord: record
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not log water.' });
  }
});

router.put('/water/goal', authenticateToken, (req, res) => {
  try {
    const { goal_ml } = req.body;
    const g = Number(goal_ml);
    if (!g || g < 500) {
      return res.status(400).json({ success: false, message: 'Valid water goal (min 500 mL) is required.' });
    }

    const profile = db.findOne('profiles', p => p.user_id === req.user.id);
    if (profile) {
      db.update('profiles', profile.id, { target_water_ml: g });
    }

    res.json({ success: true, message: 'Water target updated.', goal: g });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not update water goal.' });
  }
});

// ==========================================
// 5. SLEEP TRACKER ROUTES
// ==========================================
router.get('/sleep', authenticateToken, (req, res) => {
  try {
    const records = db.find('sleep_records', r => r.user_id === req.user.id)
      .sort((a, b) => new Date(b.recorded_date) - new Date(a.recorded_date));
    const profile = db.findOne('profiles', p => p.user_id === req.user.id) || {};

    res.json({
      success: true,
      data: {
        records,
        targetHours: profile.target_sleep_hours || 8.0,
        latest: records[0] || null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not fetch sleep records.' });
  }
});

router.post('/sleep', authenticateToken, (req, res) => {
  try {
    const { sleep_hours, sleep_quality, bedtime, wake_time, notes, recorded_date } = req.body;
    const hours = Number(sleep_hours);

    if (!hours || hours <= 0) {
      return res.status(400).json({ success: false, message: 'Valid sleep duration is required.' });
    }

    const todayStr = recorded_date || new Date().toISOString().split('T')[0];
    const record = db.insert('sleep_records', {
      user_id: req.user.id,
      sleep_hours: hours,
      sleep_quality: sleep_quality || 'Good',
      bedtime: bedtime || null,
      wake_time: wake_time || null,
      notes: notes || '',
      recorded_date: todayStr
    });

    res.status(201).json({
      success: true,
      message: 'Sleep session logged successfully.',
      data: record
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not log sleep.' });
  }
});

// ==========================================
// 6. PHYSICAL ACTIVITY TRACKER ROUTES
// ==========================================
router.get('/activity', authenticateToken, (req, res) => {
  try {
    const records = db.find('activity_records', r => r.user_id === req.user.id)
      .sort((a, b) => new Date(b.recorded_date) - new Date(a.recorded_date));
    const profile = db.findOne('profiles', p => p.user_id === req.user.id) || {};

    const todayStr = new Date().toISOString().split('T')[0];
    const todayLogs = records.filter(r => r.recorded_date === todayStr);
    const todaySteps = todayLogs.reduce((sum, r) => sum + (r.steps || 0), 0);
    const todayMins = todayLogs.reduce((sum, r) => sum + (r.active_minutes || 0), 0);
    const todayCalories = todayLogs.reduce((sum, r) => sum + (r.calories_burned || 0), 0);

    res.json({
      success: true,
      data: {
        records,
        today: {
          steps: todaySteps,
          targetSteps: profile.target_steps || 10000,
          minutes: todayMins,
          calories: todayCalories
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not fetch activity records.' });
  }
});

router.post('/activity', authenticateToken, (req, res) => {
  try {
    const { activity_type, steps, active_minutes, calories_burned, recorded_date } = req.body;
    const s = Number(steps) || 0;
    const m = Number(active_minutes) || 0;
    const c = Number(calories_burned) || (m * 8); // approximate estimate if missing

    const todayStr = recorded_date || new Date().toISOString().split('T')[0];
    const record = db.insert('activity_records', {
      user_id: req.user.id,
      activity_type: activity_type || 'Walking',
      steps: s,
      active_minutes: m,
      calories_burned: c,
      recorded_date: todayStr
    });

    res.status(201).json({
      success: true,
      message: 'Physical activity logged successfully.',
      data: record
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not log activity.' });
  }
});

module.exports = router;
