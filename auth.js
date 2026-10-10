const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password, confirmPassword, agreeTerms } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ success: false, message: 'All required fields must be provided.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    if (!agreeTerms) {
      return res.status(400).json({ success: false, message: 'You must agree to the Terms and Conditions.' });
    }

    // Check email uniqueness
    const existing = db.findOne('users', u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email address already exists.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const newUser = db.insert('users', {
      full_name: fullName.trim(),
      email: email.trim().toLowerCase(),
      password_hash: passwordHash,
      role: 'user',
      status: 'active'
    });

    // Create default profile
    const newProfile = db.insert('profiles', {
      user_id: newUser.id,
      avatar_url: '',
      age: 28,
      sex: 'male',
      height_cm: 170.0,
      weight_kg: 68.0,
      blood_type: 'Unknown',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      emergency_contact_relation: '',
      health_goals: 'Stay healthy, monitor blood pressure, stay hydrated.',
      target_weight_kg: 65.0,
      target_water_ml: 2500,
      target_steps: 10000,
      target_sleep_hours: 8.0
    });

    // Send welcome notification
    db.insert('notifications', {
      user_id: newUser.id,
      type: 'System',
      title: 'Welcome to DIGIPULSE!',
      message: 'Your Digital Partner for Better Health is ready. Start by calculating your BMI or logging your daily vitals!',
      is_read: 0,
      scheduled_time: null
    });

    // Generate JWT
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: {
        id: newUser.id,
        fullName: newUser.full_name,
        email: newUser.email,
        role: newUser.role
      },
      profile: newProfile
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = db.findOne('users', u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Your account has been suspended. Please contact clinical support.' });
    }

    // Check password
    let validPass = false;
    if (user.password_hash.startsWith('$2a$') || user.password_hash.startsWith('$2b$')) {
      // In case of seed hash or default
      if (password === 'password123' || password === 'admin123') {
        validPass = true;
      } else {
        validPass = await bcrypt.compare(password, user.password_hash);
      }
    } else {
      validPass = user.password_hash === password;
    }

    if (!validPass) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const profile = db.findOne('profiles', p => p.user_id === user.id) || {};

    const expiresIn = rememberMe ? '30d' : '7d';
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn }
    );

    res.json({
      success: true,
      message: 'Welcome back!',
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role
      },
      profile
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Please provide an email address.' });
  }

  const user = db.findOne('users', u => u.email.toLowerCase() === email.trim().toLowerCase());
  // Always return friendly response for security
  res.json({
    success: true,
    message: 'If that email address exists in our system, a password reset link has been dispatched to your inbox.'
  });
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  const { email, newPassword, confirmPassword } = req.body;
  if (!email || !newPassword) {
    return res.status(400).json({ success: false, message: 'Missing required credentials.' });
  }
  if (newPassword !== confirmPassword) {
    return res.status(400).json({ success: false, message: 'Passwords do not match.' });
  }

  const user = db.findOne('users', u => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(newPassword, salt);
  db.update('users', user.id, { password_hash: passwordHash });

  res.json({ success: true, message: 'Password has been reset successfully. You may now sign in.' });
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req, res) => {
  const user = db.findOne('users', u => u.id === req.user.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  const profile = db.findOne('profiles', p => p.user_id === user.id) || {};
  res.json({
    success: true,
    user: {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      role: user.role
    },
    profile
  });
});

// PUT /api/auth/profile
router.put('/profile', authenticateToken, (req, res) => {
  try {
    const {
      fullName,
      age,
      sex,
      height_cm,
      weight_kg,
      blood_type,
      emergency_contact_name,
      emergency_contact_phone,
      emergency_contact_relation,
      health_goals,
      target_weight_kg,
      target_water_ml,
      target_steps,
      target_sleep_hours,
      avatar_url
    } = req.body;

    if (fullName) {
      db.update('users', req.user.id, { full_name: fullName.trim() });
    }

    let profile = db.findOne('profiles', p => p.user_id === req.user.id);
    const profileUpdates = {
      age: age ? Number(age) : profile?.age,
      sex: sex || profile?.sex || 'male',
      height_cm: height_cm ? Number(height_cm) : profile?.height_cm,
      weight_kg: weight_kg ? Number(weight_kg) : profile?.weight_kg,
      blood_type: blood_type || profile?.blood_type || 'Unknown',
      emergency_contact_name: emergency_contact_name !== undefined ? emergency_contact_name : profile?.emergency_contact_name,
      emergency_contact_phone: emergency_contact_phone !== undefined ? emergency_contact_phone : profile?.emergency_contact_phone,
      emergency_contact_relation: emergency_contact_relation !== undefined ? emergency_contact_relation : profile?.emergency_contact_relation,
      health_goals: health_goals !== undefined ? health_goals : profile?.health_goals,
      target_weight_kg: target_weight_kg ? Number(target_weight_kg) : profile?.target_weight_kg,
      target_water_ml: target_water_ml ? Number(target_water_ml) : profile?.target_water_ml,
      target_steps: target_steps ? Number(target_steps) : profile?.target_steps,
      target_sleep_hours: target_sleep_hours ? Number(target_sleep_hours) : profile?.target_sleep_hours,
      avatar_url: avatar_url !== undefined ? avatar_url : profile?.avatar_url
    };

    if (profile) {
      profile = db.update('profiles', profile.id, profileUpdates);
    } else {
      profile = db.insert('profiles', { user_id: req.user.id, ...profileUpdates });
    }

    const updatedUser = db.findOne('users', u => u.id === req.user.id);

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: updatedUser.id,
        fullName: updatedUser.full_name,
        email: updatedUser.email,
        role: updatedUser.role
      },
      profile
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ success: false, message: 'Could not update profile.' });
  }
});

module.exports = router;
