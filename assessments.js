const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// Helper: Determine BMI category
function getBmiCategory(bmi) {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25.0) return 'Normal';
  if (bmi < 30.0) return 'Overweight';
  return 'Obese';
}

// 1. POST /api/assessments/bmi
router.post('/bmi', authenticateToken, (req, res) => {
  try {
    const { height_cm, weight_kg, saveToHistory } = req.body;
    const h = Number(height_cm);
    const w = Number(weight_kg);

    if (!h || !w || h <= 0 || w <= 0) {
      return res.status(400).json({ success: false, message: 'Valid height and weight are required.' });
    }

    const heightMeters = h / 100;
    const bmi = Number((w / (heightMeters * heightMeters)).toFixed(2));
    const category = getBmiCategory(bmi);

    // Calculate healthy weight range for this height
    const minHealthyWeight = Number((18.5 * heightMeters * heightMeters).toFixed(1));
    const maxHealthyWeight = Number((24.9 * heightMeters * heightMeters).toFixed(1));

    let advice = '';
    if (category === 'Underweight') {
      advice = 'Your weight is below the recommended range. Consider speaking with a nutritionist to safely build lean muscle mass through nutrient-dense meals.';
    } else if (category === 'Normal') {
      advice = 'Congratulations! Your BMI is within the healthy reference range. Maintain balanced nutrition, hydration, and regular exercise.';
    } else if (category === 'Overweight') {
      advice = 'Your BMI indicates excess body weight. Introducing moderate aerobic exercise (150 min/wk) and whole foods can reduce cardiometabolic stress.';
    } else {
      advice = 'Your BMI is in the obese range. We recommend consulting a healthcare professional for a tailored lifestyle, metabolic, and cardiovascular plan.';
    }

    let record = null;
    if (saveToHistory !== false) {
      record = db.insert('bmi_records', {
        user_id: req.user.id,
        height_cm: h,
        weight_kg: w,
        bmi_value: bmi,
        category,
        bmr_value: null,
        body_fat_pct: null,
        waist_to_height: null,
        nutritional_status: category === 'Normal' ? 'Normal Weight' : category,
        recorded_at: new Date().toISOString()
      });

      // Update user's profile weight and height
      let profile = db.findOne('profiles', p => p.user_id === req.user.id);
      if (profile) {
        db.update('profiles', profile.id, { height_cm: h, weight_kg: w });
      }
      // Add weight record
      db.insert('weight_records', {
        user_id: req.user.id,
        weight_kg: w,
        notes: `BMI check: ${bmi} (${category})`,
        recorded_at: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      data: {
        bmi,
        category,
        minHealthyWeight,
        maxHealthyWeight,
        advice,
        record
      }
    });
  } catch (error) {
    console.error('BMI calculate error:', error);
    res.status(500).json({ success: false, message: 'Could not calculate BMI.' });
  }
});

// 2. POST /api/assessments/bmr (Basal Metabolic Rate & Calorie Needs)
router.post('/bmr', authenticateToken, (req, res) => {
  try {
    const { height_cm, weight_kg, age, sex, activity_level } = req.body;
    const h = Number(height_cm);
    const w = Number(weight_kg);
    const a = Number(age);
    const gender = sex || 'male';

    if (!h || !w || !a) {
      return res.status(400).json({ success: false, message: 'Height, weight, and age are required.' });
    }

    // Mifflin-St Jeor Equation
    let bmr = (10 * w) + (6.25 * h) - (5 * a);
    if (gender === 'male') {
      bmr += 5;
    } else {
      bmr -= 161;
    }
    bmr = Math.round(bmr);

    // Activity multiplier
    const multipliers = {
      sedentary: 1.2,       // little or no exercise
      light: 1.375,         // light exercise 1-3 days/week
      moderate: 1.55,       // moderate exercise 3-5 days/week
      active: 1.725,        // hard exercise 6-7 days/week
      very_active: 1.9      // very hard exercise & physical job
    };
    const mult = multipliers[activity_level] || 1.375;
    const tdee = Math.round(bmr * mult);

    res.json({
      success: true,
      data: {
        bmr,
        tdee,
        calories: {
          maintenance: tdee,
          mildWeightLoss: Math.round(tdee - 250),
          weightLoss: Math.round(tdee - 500),
          extremeWeightLoss: Math.round(tdee - 1000),
          mildWeightGain: Math.round(tdee + 250),
          weightGain: Math.round(tdee + 500)
        },
        advice: `Your Basal Metabolic Rate (BMR) is ${bmr} kcal/day. To maintain current body weight at your activity level, target approximately ${tdee} kcal daily.`
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not calculate BMR.' });
  }
});

// 3. POST /api/assessments/body-fat (U.S. Navy Method)
router.post('/body-fat', authenticateToken, (req, res) => {
  try {
    const { sex, waist_cm, neck_cm, height_cm, hip_cm } = req.body;
    const waist = Number(waist_cm);
    const neck = Number(neck_cm);
    const height = Number(height_cm);
    const hip = Number(hip_cm);
    const gender = sex || 'male';

    if (!waist || !neck || !height) {
      return res.status(400).json({ success: false, message: 'Waist, neck, and height are required.' });
    }

    let bodyFatPct = 0;
    if (gender === 'male') {
      // 495 / (1.0324 - 0.19077 * log10(waist - neck) + 0.15456 * log10(height)) - 450
      const logDiff = Math.log10(waist - neck);
      const logHeight = Math.log10(height);
      bodyFatPct = 495 / (1.0324 - (0.19077 * logDiff) + (0.15456 * logHeight)) - 450;
    } else {
      if (!hip) return res.status(400).json({ success: false, message: 'Hip measurement is required for females.' });
      // 495 / (1.29579 - 0.35004 * log10(waist + hip - neck) + 0.22100 * log10(height)) - 450
      const logDiff = Math.log10(waist + hip - neck);
      const logHeight = Math.log10(height);
      bodyFatPct = 495 / (1.29579 - (0.35004 * logDiff) + (0.22100 * logHeight)) - 450;
    }

    bodyFatPct = Math.max(3, Math.min(60, Number(bodyFatPct.toFixed(1))));

    let category = 'Fitness';
    if (gender === 'male') {
      if (bodyFatPct < 6) category = 'Essential Fat';
      else if (bodyFatPct < 14) category = 'Athletes';
      else if (bodyFatPct < 18) category = 'Fitness';
      else if (bodyFatPct < 25) category = 'Acceptable';
      else category = 'Obese';
    } else {
      if (bodyFatPct < 14) category = 'Essential Fat';
      else if (bodyFatPct < 21) category = 'Athletes';
      else if (bodyFatPct < 25) category = 'Fitness';
      else if (bodyFatPct < 32) category = 'Acceptable';
      else category = 'Obese';
    }

    res.json({
      success: true,
      data: {
        bodyFatPct,
        category,
        advice: `Your estimated body fat is ${bodyFatPct}% (${category} category according to American Council on Exercise standards).`
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not calculate body fat.' });
  }
});

// 4. POST /api/assessments/whtr (Waist-to-Height Ratio)
router.post('/whtr', authenticateToken, (req, res) => {
  try {
    const { waist_cm, height_cm } = req.body;
    const waist = Number(waist_cm);
    const height = Number(height_cm);

    if (!waist || !height) {
      return res.status(400).json({ success: false, message: 'Waist and height are required.' });
    }

    const ratio = Number((waist / height).toFixed(2));
    let category = 'Healthy';
    let risk = 'Low cardiometabolic risk';

    if (ratio < 0.40) {
      category = 'Take Care (Underweight risk)';
      risk = 'May indicate inadequate nutritional reserve';
    } else if (ratio <= 0.49) {
      category = 'Healthy';
      risk = 'Low cardiometabolic and vascular risk';
    } else if (ratio <= 0.59) {
      category = 'Increased Risk';
      risk = 'Elevated visceral adipose risk. Consider dietary adjustment';
    } else {
      category = 'High Risk';
      risk = 'Significant visceral obesity and cardiovascular risk';
    }

    res.json({
      success: true,
      data: {
        ratio,
        category,
        risk,
        advice: `A healthy waist-to-height ratio is below 0.50 ("Keep your waist circumference to less than half your height").`
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not calculate waist-to-height ratio.' });
  }
});

// 5. POST /api/assessments/healthy-weight (Ideal Body Weight Range)
router.post('/healthy-weight', authenticateToken, (req, res) => {
  try {
    const { height_cm, sex } = req.body;
    const h = Number(height_cm);
    const gender = sex || 'male';

    if (!h || h <= 0) {
      return res.status(400).json({ success: false, message: 'Height is required.' });
    }

    const heightMeters = h / 100;
    const minHealthy = Number((18.5 * heightMeters * heightMeters).toFixed(1));
    const maxHealthy = Number((24.9 * heightMeters * heightMeters).toFixed(1));

    // Devine Formula (Height in inches above 5 feet / 60 inches)
    const heightInches = h / 2.54;
    const inchesAbove60 = Math.max(0, heightInches - 60);
    let devineWeight = gender === 'male' ? 50 + (2.3 * inchesAbove60) : 45.5 + (2.3 * inchesAbove60);
    devineWeight = Number(devineWeight.toFixed(1));

    res.json({
      success: true,
      data: {
        height_cm: h,
        healthyRange: {
          min: minHealthy,
          max: maxHealthy
        },
        idealDevine: devineWeight,
        advice: `For a height of ${h} cm, the clinically optimal weight range is between ${minHealthy} kg and ${maxHealthy} kg.`
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not compute healthy weight range.' });
  }
});

// 6. POST /api/assessments/nutritional
router.post('/nutritional', authenticateToken, (req, res) => {
  try {
    const { height_cm, weight_kg, meals_per_day, fruit_veg_servings, water_liters, fatigue_symptoms, weight_loss_unintentional } = req.body;
    const h = Number(height_cm);
    const w = Number(weight_kg);

    if (!h || !w) {
      return res.status(400).json({ success: false, message: 'Height and weight are required.' });
    }

    const bmi = Number((w / Math.pow(h / 100, 2)).toFixed(2));
    let status = 'Normal Weight';

    if (bmi < 16.0 || (bmi < 18.5 && weight_loss_unintentional)) {
      status = 'Malnourished';
    } else if (bmi < 18.5) {
      status = 'Underweight';
    } else if (bmi < 25.0) {
      status = 'Normal Weight';
    } else if (bmi < 30.0) {
      status = 'Overweight';
    } else {
      status = 'Obese';
    }

    let recommendations = [];
    if (status === 'Malnourished' || status === 'Underweight') {
      recommendations = [
        'Increase calorie density with healthy fats like avocados, nuts, seeds, and extra virgin olive oil.',
        'Ensure protein intake is at least 1.2 to 1.5g per kg of body weight to prevent muscle wasting.',
        'Consume frequent, smaller meals (5-6 times daily) if appetite is limited.',
        'Consult a registered dietitian or clinical physician for comprehensive bloodwork (CBC, ferritin, albumin).'
      ];
    } else if (status === 'Normal Weight') {
      recommendations = [
        'Maintain balanced macro distribution: 45-55% complex carbs, 20-30% quality proteins, 25-30% healthy lipids.',
        'Aim for at least 5 varied servings of colorful fruits and vegetables daily.',
        'Sustain hydration with 2.5 to 3.0 liters of pure water throughout the day.',
        'Engage in weekly resistance training to preserve lean musculoskeletal mass.'
      ];
    } else if (status === 'Overweight') {
      recommendations = [
        'Emphasize high-volume, fiber-rich foods (legumes, leafy greens, cruciferous vegetables) to enhance satiety.',
        'Substitute refined carbohydrates and sugary beverages with whole fruits and herbal teas.',
        'Aim for a modest caloric deficit of 300-500 kcal per day for sustainable fat loss.',
        'Pair cardiovascular exercise with strength training to safeguard metabolic rate.'
      ];
    } else {
      recommendations = [
        'Adopt an anti-inflammatory, whole-foods dietary pattern such as the Mediterranean or DASH diet.',
        'Monitor glycemic load to stabilize insulin and prevent metabolic resistance.',
        'Schedule a routine metabolic screening (HbA1c, fasting lipids, hepatic panel).',
        'Collaborate with a certified healthcare provider to establish achievable weekly milestones.'
      ];
    }

    res.json({
      success: true,
      data: {
        bmi,
        nutritionalStatus: status,
        recommendations,
        dietaryScore: Math.min(10, (fruit_veg_servings || 2) * 2 + (meals_per_day >= 3 ? 2 : 1))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not perform nutritional assessment.' });
  }
});

// 7. POST /api/assessments/risk-screening (Diabetes, Heart Disease, Hypertension, Lifestyle)
router.post('/risk-screening', authenticateToken, (req, res) => {
  try {
    const { type, answers } = req.body;
    // type: 'Diabetes Risk', 'Heart Disease Risk', 'Hypertension Risk', 'Lifestyle Risk'
    if (!type || !answers) {
      return res.status(400).json({ success: false, message: 'Assessment type and responses are required.' });
    }

    let score = 0;
    let riskLevel = 'Low';
    let recommendations = '';

    if (type === 'Diabetes Risk') {
      // ADA screening algorithm
      // answers: { ageGroup, sex, gestational, familyHistory, highBp, physicallyActive, bmiCategory }
      if (answers.ageGroup === '40-49') score += 1;
      else if (answers.ageGroup === '50-59') score += 2;
      else if (answers.ageGroup === '60+') score += 3;

      if (answers.sex === 'male') score += 1;
      if (answers.familyHistory) score += 1;
      if (answers.highBp) score += 1;
      if (!answers.physicallyActive) score += 1;
      if (answers.bmiCategory === 'Overweight') score += 1;
      if (answers.bmiCategory === 'Obese') score += 2;

      if (score >= 5) {
        riskLevel = 'High';
        recommendations = 'You are at heightened risk for prediabetes or type 2 diabetes. We strongly suggest scheduling a fasting blood glucose or HbA1c test with your primary care provider. Increasing physical activity and adopting a low-glycemic, fiber-rich diet can dramatically lower this risk.';
      } else if (score >= 3) {
        riskLevel = 'Moderate';
        recommendations = 'You have moderate risk factors for diabetes. Focus on maintaining a healthy weight, exercising for at least 150 minutes per week, and minimizing processed sugars.';
      } else {
        riskLevel = 'Low';
        recommendations = 'Your current diabetes risk is low. Continue prioritizing whole dietary fiber, adequate hydration, and annual wellness examinations.';
      }
    } else if (type === 'Heart Disease Risk') {
      // answers: { ageOver50, smoker, highCholesterol, highBp, sedentary, familyCardiac }
      if (answers.ageOver50) score += 2;
      if (answers.smoker) score += 3;
      if (answers.highCholesterol) score += 2;
      if (answers.highBp) score += 2;
      if (answers.sedentary) score += 1;
      if (answers.familyCardiac) score += 2;

      if (score >= 6) {
        riskLevel = 'High';
        recommendations = 'Elevated cardiovascular risk factors detected. Schedule a comprehensive cardiac consultation to evaluate lipid panels, arterial stiffness, and consider ECG screening.';
      } else if (score >= 3) {
        riskLevel = 'Moderate';
        recommendations = 'Moderate cardiac risk profile. Adopt Zone 2 aerobic workouts, reduce saturated/trans fats, and check blood pressure regularly.';
      } else {
        riskLevel = 'Low';
        recommendations = 'Low cardiovascular risk. Maintain regular physical workouts, Mediterranean-style nutrition, and smoke-free habits.';
      }
    } else if (type === 'Hypertension Risk') {
      // answers: { highSodium, stressLevels, familyHypertension, excessAlcohol, overweight }
      if (answers.highSodium) score += 2;
      if (answers.stressLevels === 'high') score += 2;
      if (answers.familyHypertension) score += 2;
      if (answers.excessAlcohol) score += 1;
      if (answers.overweight) score += 2;

      if (score >= 5) {
        riskLevel = 'High';
        recommendations = 'Significant hypertension predisposition. Lower sodium intake below 1,500mg daily, increase dietary potassium (leafy greens, avocados), practice daily mindfulness/breathwork, and log resting blood pressure weekly.';
      } else if (score >= 3) {
        riskLevel = 'Moderate';
        recommendations = 'Moderate hypertension risk. Reduce processed sodium foods and ensure at least 7-8 hours of restful sleep every night.';
      } else {
        riskLevel = 'Low';
        recommendations = 'Low risk of hypertension. Keep logging your resting blood pressure in DigiPulse to track long-term cardiovascular stability.';
      }
    } else {
      // Lifestyle Risk Assessment
      // answers: { sleepHoursUnder6, exerciseUnder30m, highStress, poorDiet, smokingOrVaping }
      if (answers.sleepHoursUnder6) score += 2;
      if (answers.exerciseUnder30m) score += 2;
      if (answers.highStress) score += 2;
      if (answers.poorDiet) score += 2;
      if (answers.smokingOrVaping) score += 3;

      if (score >= 6) {
        riskLevel = 'High';
        recommendations = 'Your lifestyle habits present multiple chronic fatigue and metabolic stressors. Prioritize circadian sleep regularity and incorporate 20 minutes of daily brisk walking.';
      } else if (score >= 3) {
        riskLevel = 'Moderate';
        recommendations = 'Moderate lifestyle strain. Small incremental upgrades—such as an extra glass of water and 15 minutes of mindfulness—will yield substantial vitality dividends.';
      } else {
        riskLevel = 'Low';
        recommendations = 'Outstanding lifestyle balance! You demonstrate health-conscious habits that protect cellular vitality and longevity.';
      }
    }

    const saved = db.insert('health_risk_assessments', {
      user_id: req.user.id,
      assessment_type: type,
      risk_score: score,
      risk_level: riskLevel,
      responses_json: JSON.stringify(answers),
      recommendations,
      assessed_at: new Date().toISOString()
    });

    res.json({
      success: true,
      data: {
        type,
        score,
        riskLevel,
        recommendations,
        assessmentId: saved.id
      }
    });
  } catch (error) {
    console.error('Risk screening error:', error);
    res.status(500).json({ success: false, message: 'Could not complete risk screening.' });
  }
});

// GET /api/assessments/history
router.get('/history', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const bmiHistory = db.find('bmi_records', b => b.user_id === userId)
      .sort((a, b) => new Date(b.recorded_at) - new Date(a.recorded_at));
    const riskHistory = db.find('health_risk_assessments', r => r.user_id === userId)
      .sort((a, b) => new Date(b.assessed_at) - new Date(a.assessed_at));

    res.json({
      success: true,
      data: {
        bmiHistory,
        riskHistory
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not fetch assessment history.' });
  }
});

module.exports = router;
