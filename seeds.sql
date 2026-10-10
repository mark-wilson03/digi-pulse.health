-- ========================================================
-- DIGIPULSE - Seed Data for MySQL
-- Realistic Demonstration Data for Testing & Production
-- ========================================================

USE `digipulse_db`;

-- Demo Users
-- Password for all demo accounts is 'password123' (bcrypt hash: $2a$10$wTkyrQ7P03YfZzIicpY7b.F98rRrkRzY7xY23P6fFp77oIbmZ/k4m or similar)
-- Admin Password is 'admin123'
INSERT INTO `users` (`id`, `full_name`, `email`, `password_hash`, `role`, `status`) VALUES
(1, 'Mark Williams', 'mark@digipulse.health', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'user', 'active'),
(2, 'Dr. Sarah Mitchell', 'admin@digipulse.health', '$2a$10$wTkyrQ7P03YfZzIicpY7b.F98rRrkRzY7xY23P6fFp77oIbmZ/k4m', 'admin', 'active');

-- Profiles
INSERT INTO `profiles` (`user_id`, `avatar_url`, `age`, `sex`, `height_cm`, `weight_kg`, `blood_type`, `emergency_contact_name`, `emergency_contact_phone`, `emergency_contact_relation`, `health_goals`, `target_weight_kg`, `target_water_ml`, `target_steps`, `target_sleep_hours`) VALUES
(1, '', 32, 'male', 178.0, 74.5, 'O+', 'Jane Williams', '+1 (555) 234-5678', 'Spouse', 'Lower resting heart rate, maintain optimal blood pressure, drink 2.5L water daily, reach 10,000 steps.', 72.0, 2500, 10000, 8.0),
(2, '', 40, 'female', 165.0, 58.0, 'A+', 'Robert Mitchell', '+1 (555) 890-1234', 'Spouse', 'Daily cardio, stress management, balanced Mediterranean diet.', 58.0, 2200, 9000, 7.5);

-- BMI Records for User 1
INSERT INTO `bmi_records` (`user_id`, `height_cm`, `weight_kg`, `bmi_value`, `category`, `bmr_value`, `body_fat_pct`, `waist_to_height`, `nutritional_status`, `recorded_at`) VALUES
(1, 178.0, 77.0, 24.30, 'Normal', 1740.0, 18.2, 0.46, 'Normal Weight', NOW() - INTERVAL 21 DAY),
(1, 178.0, 76.2, 24.05, 'Normal', 1730.0, 17.8, 0.45, 'Normal Weight', NOW() - INTERVAL 14 DAY),
(1, 178.0, 75.3, 23.77, 'Normal', 1720.0, 17.4, 0.45, 'Normal Weight', NOW() - INTERVAL 7 DAY),
(1, 178.0, 74.5, 23.51, 'Normal', 1710.0, 17.1, 0.44, 'Normal Weight', NOW());

-- Blood Pressure Records for User 1
INSERT INTO `blood_pressure_records` (`user_id`, `systolic`, `diastolic`, `pulse`, `category`, `notes`, `recorded_at`) VALUES
(1, 126, 82, 74, 'Hypertension Stage 1', 'Morning check before coffee', NOW() - INTERVAL 14 DAY),
(1, 122, 80, 71, 'Elevated', 'Evening reading, relaxed', NOW() - INTERVAL 10 DAY),
(1, 119, 78, 68, 'Normal', 'Post 30-min walk', NOW() - INTERVAL 5 DAY),
(1, 118, 77, 72, 'Normal', 'Morning resting measurement', NOW() - INTERVAL 2 DAY),
(1, 116, 75, 70, 'Normal', 'Optimal hydration and calm', NOW());

-- Heart Rate Records for User 1
INSERT INTO `heart_rate_records` (`user_id`, `heart_rate`, `category`, `context`, `notes`, `recorded_at`) VALUES
(1, 74, 'Normal', 'Resting', 'Morning baseline', NOW() - INTERVAL 7 DAY),
(1, 68, 'Normal', 'Resting', 'Post-meditation calm', NOW() - INTERVAL 4 DAY),
(1, 71, 'Normal', 'Resting', 'Midday rest', NOW() - INTERVAL 2 DAY),
(1, 69, 'Normal', 'Resting', 'Woke up naturally', NOW());

-- Weight Records for User 1
INSERT INTO `weight_records` (`user_id`, `weight_kg`, `notes`, `recorded_at`) VALUES
(1, 77.0, 'Starting log for Q4', NOW() - INTERVAL 28 DAY),
(1, 76.2, 'Switched to whole grains', NOW() - INTERVAL 21 DAY),
(1, 75.8, 'Increased water intake', NOW() - INTERVAL 14 DAY),
(1, 75.1, 'Consistent 10k steps', NOW() - INTERVAL 7 DAY),
(1, 74.5, 'Current check-in', NOW());

-- Water Intake Records for User 1 (last 7 days)
INSERT INTO `water_intake_records` (`user_id`, `amount_ml`, `glasses`, `recorded_date`) VALUES
(1, 2000, 8, CURDATE() - INTERVAL 6 DAY),
(1, 2250, 9, CURDATE() - INTERVAL 5 DAY),
(1, 2500, 10, CURDATE() - INTERVAL 4 DAY),
(1, 1750, 7, CURDATE() - INTERVAL 3 DAY),
(1, 2500, 10, CURDATE() - INTERVAL 2 DAY),
(1, 2750, 11, CURDATE() - INTERVAL 1 DAY),
(1, 2000, 8, CURDATE());

-- Sleep Records for User 1
INSERT INTO `sleep_records` (`user_id`, `sleep_hours`, `sleep_quality`, `bedtime`, `wake_time`, `notes`, `recorded_date`) VALUES
(1, 7.2, 'Good', '23:00:00', '06:12:00', 'Slept through the night', CURDATE() - INTERVAL 4 DAY),
(1, 6.8, 'Fair', '23:30:00', '06:18:00', 'Woke up once to drink water', CURDATE() - INTERVAL 3 DAY),
(1, 8.1, 'Excellent', '22:45:00', '06:51:00', 'Very restorative sleep', CURDATE() - INTERVAL 2 DAY),
(1, 7.5, 'Good', '23:10:00', '06:40:00', 'No blue light 1h before bed', CURDATE() - INTERVAL 1 DAY),
(1, 7.8, 'Excellent', '22:50:00', '06:38:00', 'Optimal sleep score', CURDATE());

-- Physical Activity Records for User 1
INSERT INTO `activity_records` (`user_id`, `activity_type`, `steps`, `active_minutes`, `calories_burned`, `recorded_date`) VALUES
(1, 'Walking & Jogging', 8650, 42, 410, CURDATE() - INTERVAL 4 DAY),
(1, 'Gym & Cardio', 10420, 55, 520, CURDATE() - INTERVAL 3 DAY),
(1, 'Brisk Walking', 7890, 35, 360, CURDATE() - INTERVAL 2 DAY),
(1, 'HIIT & Stretch', 11200, 60, 580, CURDATE() - INTERVAL 1 DAY),
(1, 'Daily Walking', 8420, 45, 430, CURDATE());

-- Daily Health Tips
INSERT INTO `daily_tips` (`tip_text`, `category`, `icon`) VALUES
('Start your morning with a large glass of water to kickstart your metabolism and restore hydration after sleep.', 'Hydration', 'droplet'),
('The 20-20-20 rule helps alleviate eye strain: every 20 minutes, look at an object 20 feet away for 20 seconds.', 'Ergonomics', 'eye'),
('Limiting sodium intake to less than 2,000 mg daily significantly reduces arterial pressure and heart strain.', 'Cardiovascular', 'heart'),
('Aim for 150 minutes of moderate-intensity aerobic physical activity throughout each week for cellular longevity.', 'Fitness', 'activity'),
('Consistent sleep schedules regulate your circadian rhythm, dramatically improving restorative deep REM phases.', 'Sleep', 'moon'),
('Incorporate colorful vegetables into every meal; phytonutrients bolster cellular repair and immune defense.', 'Nutrition', 'salad'),
('Practicing 5 minutes of box breathing (4s in, 4s hold, 4s out, 4s hold) lowers sympathetic cortisol spikes.', 'Mental Wellness', 'wind');

-- Health Articles (All 8 Required Categories)
INSERT INTO `health_articles` (`title`, `slug`, `category`, `description`, `content`, `image_url`, `references_sources`, `read_time_mins`, `author`) VALUES
('Mastering Micronutrients: Fueling Your Body for Peak Vitality', 'mastering-micronutrients', 'Nutrition', 'Understand the essential vitamins and minerals your body requires for optimal cellular function, energy production, and longevity.', 
'### The Foundation of Vitality\n\nWhile carbohydrates, proteins, and fats supply the macronutrient fuel for energy and structural repair, **micronutrients**—vitamins and minerals—act as the biochemical spark plugs powering every metabolic cascade.\n\n#### Key Micronutrient Pillars\n- **Vitamin D3 & K2**: Crucial for bone mineralization and cardiovascular arterial elasticity.\n- **Magnesium (Glycinate/Citrate)**: Required in over 300 enzymatic reactions, regulating muscle relaxation, neurotransmitter balance, and circadian sleep.\n- **Iron & Zinc**: Essential for oxygen transport in hemoglobin and immune cellular proliferation.\n\n#### Practical Nutrition Strategies\n1. Aim for a "rainbow plate" with at least three vibrant plant colors per main meal.\n2. Incorporate fermented foods (kefir, kimchi, unsweetened yogurt) to cultivate a diverse microbiome.\n3. Minimize ultra-processed foods rich in refined sugars and oxidized seed oils.', 
'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80', 'Harvard T.H. Chan School of Public Health; WHO Nutritional Guidelines', 5, 'Dr. Sarah Mitchell, MD'),

('Cardiovascular Fitness: Why Heart Rate Variability Matters', 'cardiovascular-fitness-hrv', 'Exercise', 'Discover how monitoring your resting heart rate and aerobic capacity transforms longevity and cardiovascular resilience.', 
'### The Aerobic Engine\n\nCardiorespiratory fitness is one of the most potent clinical predictors of all-cause mortality. Sustaining high cardiovascular output improves mitochondrial density and endothelial function.\n\n#### Zone 2 Training Explained\nZone 2 training represents an aerobic intensity where your body primarily metabolizes fatty acids for energy while clearing lactate as fast as it is produced. You should comfortably speak in complete sentences.\n\n- **Recommended Dose**: 3 to 4 sessions per week of 30-45 minutes.\n- **Resting Heart Rate Benchmarks**: Athletic individuals often observe resting values between 45-58 bpm; a healthy adult range spans 60-80 bpm.', 
'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80', 'American College of Cardiology (ACC); Journal of Sports Medicine', 6, 'DigiPulse Sports Science Board'),

('Stress Resilience and the Vagus Nerve: Science of Calm', 'stress-resilience-vagus-nerve', 'Mental Wellness', 'Learn evidence-based neurobiological techniques to downregulate sympathetic fight-or-flight triggers.', 
'### The Autonomic Balance\n\nChronic psychological distress triggers sustained cortisol and epinephrine secretion, elevating blood pressure and promoting low-grade systemic inflammation.\n\n#### Activating the Parasympathetic System\n- **Coherent Breathing**: Inhale slowly for 5.5 seconds, exhale smoothly for 5.5 seconds. This stabilizes the baroreflex and amplifies heart rate variability.\n- **Cold Water Splash**: Stimulates the diving reflex, slowing bradycardic response and steadying pulse.\n- **Cognitive Reframing**: Journaling daily gratitude prompts shifts neural activation from the amygdala to the prefrontal cortex.', 
'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80', 'Stanford Neurobiology; American Psychological Association', 4, 'Elena Vance, MSc Neuropsychology'),

('Essential First Aid: Rapid Response for Common Emergencies', 'essential-first-aid-guide', 'First Aid', 'A crucial guide to recognizing and responding to choking, severe bleeding, burns, and cardiovascular arrest.', 
'### Time is Life in Clinical Emergencies\n\nPrompt, correct intervention during the initial minutes of an acute medical crisis drastically increases survival rates.\n\n#### 1. Suspected Cardiac Arrest (Hands-Only CPR)\n- Immediately call emergency services (911 / 112 / 999).\n- Place hands on the center of the chest.\n- Push hard and fast at a cadence of 100-120 beats per minute (to the rhythm of "Stayin Alive").\n\n#### 2. Severe Bleeding\n- Apply direct, firm, continuous pressure with a sterile dressing or clean cloth.\n- Elevate above heart level if no fracture is present.\n\n#### 3. Burns\n- Cool under cold running water for at least 10 minutes. Avoid applying ice, butter, or oil.', 
'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80', 'American Heart Association (AHA); International Red Cross', 7, 'Dr. Robert Chen, Emergency Medicine'),

('Circadian Hygiene: Rebuilding Your Sleep Architecture', 'circadian-hygiene-sleep', 'Healthy Lifestyle', 'Master light exposure, temperature protocols, and timing to achieve restorative non-REM and REM sleep.', 
'### Sleep: The Ultimate Regenerative Cycle\n\nDuring deep slow-wave sleep, the brain activates the glymphatic system, clearing metabolic waste including beta-amyloid proteins.\n\n#### Daily Sleep Protocol\n1. **Morning Sunlight**: Expose eyes to outdoor natural light for 10-15 minutes within an hour of waking to anchor the cortisol spike.\n2. **Avoid Evening Caffeine**: Caffeine has a half-life of 5-7 hours; avoid stimulants after 2:00 PM.\n3. **Optimal Thermal Environment**: Keep the bedroom cool (around 18-20°C / 65-68°F).\n4. **Darkness**: Eliminate LEDs and light pollution to stimulate natural melatonin synthesis.', 
'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80', 'Sleep Research Society; National Sleep Foundation', 5, 'DigiPulse Sleep Lab'),

('Preventing Type 2 Diabetes: Blood Glucose Optimization', 'preventing-diabetes-glucose', 'Disease Prevention', 'Proven strategies for preserving insulin sensitivity and mitigating metabolic syndrome risks.', 
'### Understanding Insulin Sensitivity\n\nType 2 diabetes develops over years through progressive peripheral insulin resistance. Early detection and proactive lifestyle intervention can reverse prediabetes.\n\n#### Key Preventative Interventions\n- **Postprandial Movement**: A light 10-minute walk after meals stimulates GLUT4 glucose transporters in muscle tissue without requiring excess insulin.\n- **Fiber First**: Eating vegetables and proteins before carbohydrates blunts glucose spikes.\n- **Waist Circumference Monitoring**: Visceral abdominal fat directly secretes inflammatory adipokines that impair insulin receptors.', 
'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&w=800&q=80', 'American Diabetes Association (ADA); Lancet Diabetes & Endocrinology', 6, 'Dr. Sarah Mitchell, MD'),

('Understanding Blood Pressure: The Silent Indicator', 'understanding-blood-pressure', 'Blood Pressure Information', 'Decode systolic vs diastolic readings, hypertensive thresholds, and actionable steps to maintain arterial health.', 
'### What Do the Numbers Really Mean?\n\nBlood pressure is expressed as two numbers in millimeters of mercury (mmHg):\n- **Systolic (Top Number)**: The pressure exerted against arterial walls during ventricular contraction.\n- **Diastolic (Bottom Number)**: The pressure inside arteries when the cardiac muscle rests between beats.\n\n#### AHA Classification Standard\n| Category | Systolic (mmHg) | Diastolic (mmHg) |\n|---|---|---|\n| Normal | Less than 120 | and Less than 80 |\n| Elevated | 120 – 129 | and Less than 80 |\n| Stage 1 Hypertension | 130 – 139 | or 80 – 89 |\n| Stage 2 Hypertension | 140 or higher | or 90 or higher |\n| Hypertensive Crisis | Higher than 180 | and/or Higher than 120 |\n\n#### How to Measure Accurately\n- Sit quietly for 5 minutes before reading.\n- Keep feet flat on the floor; support arm at heart level.\n- Avoid nicotine, caffeine, or exercise for 30 minutes prior.', 
'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80', 'American Heart Association (AHA); European Society of Cardiology', 5, 'Dr. Sarah Mitchell, MD'),

('Demystifying BMI: Strengths, Limitations, and Better Metrics', 'demystifying-bmi-metrics', 'BMI Information', 'Explore how Body Mass Index works, where it succeeds as a population metric, and how WHtR complements it.', 
'### What is BMI?\n\nBody Mass Index (BMI) is calculated as weight in kilograms divided by the square of height in meters ($kg/m^2$). Developed by Adolphe Quetelet in the 19th century, it categorizes weight status into Underweight (<18.5), Normal (18.5–24.9), Overweight (25.0–29.9), and Obese (≥30.0).\n\n#### Strengths and Limitations\n- **Strengths**: Inexpensive, non-invasive, universally standardized, and correlates well with chronic cardiovascular risk in large populations.\n- **Limitations**: Cannot differentiate between skeletal muscle and visceral adipose tissue. Highly athletic individuals may register as "overweight" despite low body fat.\n\n#### The Solution: Multi-Metric Assessment\nCombine BMI with **Waist-to-Height Ratio (WHtR)** and **Basal Metabolic Rate (BMR)** for a complete metabolic blueprint. A waist-to-height ratio under 0.50 signifies low cardiometabolic risk.', 
'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80', 'World Health Organization (WHO); CDC Division of Nutrition', 5, 'DigiPulse Medical Editorial Board');

-- Sample Risk Assessment
INSERT INTO `health_risk_assessments` (`user_id`, `assessment_type`, `risk_score`, `risk_level`, `recommendations`) VALUES
(1, 'Diabetes Risk', 3, 'Low', 'Your diabetes risk score is low. Maintain current physical activity levels, prioritize whole dietary fiber, and conduct annual routine checkups.'),
(1, 'Heart Disease Risk', 4, 'Low', 'Low risk. Continue routine aerobic exercise, maintain optimal blood pressure beneath 120/80 mmHg, and sustain non-smoking habits.'),
(1, 'Hypertension Risk', 2, 'Low', 'Maintain current sodium moderation, adequate potassium intake (leafy greens, bananas), and regular cardiovascular workouts.');

-- Sample Notifications
INSERT INTO `notifications` (`user_id`, `type`, `title`, `message`, `is_read`, `scheduled_time`) VALUES
(1, 'Water', 'Hydration Reminder', 'Time for a fresh glass of water! You are 750ml away from reaching your daily 2,500ml target.', 0, '14:00:00'),
(1, 'Exercise', 'Step Count Motivation', 'You have achieved 8,420 steps today! Just 1,580 more steps to complete your 10,000 daily goal.', 0, '17:30:00'),
(1, 'Blood Pressure', 'Evening BP Check', 'Remember to log your resting blood pressure in a calm seated position.', 1, '20:00:00');
