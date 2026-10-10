/**
 * DIGIPULSE - Digital Health Partner
 * Frontend Application Core Script
 * Tagline: "Your Digital Partner for Better Health."
 */

class DigiPulseApp {
  constructor() {
    this.token = localStorage.getItem('digipulse_token') || null;
    this.user = JSON.parse(localStorage.getItem('digipulse_user') || 'null');
    this.profile = JSON.parse(localStorage.getItem('digipulse_profile') || '{}');
    this.currentView = 'home';
    this.currentLang = localStorage.getItem('digipulse_lang') || 'en';
    this.theme = localStorage.getItem('digipulse_theme') || 'light';
    this.waterCount = 0;
    this.articles = [];

    this.init();
  }

  async init() {
    this.setupTheme();
    this.setupAccessibility();
    this.applyTranslations();
    this.startLiveClock();
    this.setupEventListeners();

    if (this.token) {
      const valid = await this.fetchCurrentUser();
      if (valid) {
        this.enterApp(false);
      } else {
        this.showAuthPortal('signin');
      }
    } else {
      this.showAuthPortal('signin');
    }

    this.setupServiceWorker();
  }

  // ==========================================
  // AUTHENTICATION & PORTAL GATEWAY
  // ==========================================
  enterApp(showWelcome = true) {
    const portal = document.getElementById('authPortalScreen');
    const shell = document.getElementById('mainAppShell');
    if (portal) portal.style.display = 'none';
    if (shell) {
      shell.style.display = 'block';
    }
    this.updateUserUI();
    this.loadDashboard();
    this.loadArticles();
    if (showWelcome && this.user) {
      this.showToast(`Welcome to DIGIPULSE, ${this.user.fullName}!`, 'success');
    }
  }

  showAuthPortal(activeTab = 'signin') {
    const portal = document.getElementById('authPortalScreen');
    const shell = document.getElementById('mainAppShell');
    if (shell) shell.style.display = 'none';
    if (portal) {
      portal.style.display = 'flex';
    }
    this.switchAuthTab(activeTab);
  }

  switchAuthTab(tab) {
    const tabSignIn = document.getElementById('portalTabSignIn');
    const tabSignUp = document.getElementById('portalTabSignUp');
    const formSignIn = document.getElementById('portalSignInContainer');
    const formSignUp = document.getElementById('portalSignUpContainer');
    const formForgot = document.getElementById('portalForgotContainer');

    if (formForgot) formForgot.style.display = 'none';

    if (tab === 'signin') {
      if (tabSignIn) tabSignIn.classList.add('active');
      if (tabSignUp) tabSignUp.classList.remove('active');
      if (formSignIn) formSignIn.style.display = 'block';
      if (formSignUp) formSignUp.style.display = 'none';
    } else if (tab === 'signup') {
      if (tabSignIn) tabSignIn.classList.remove('active');
      if (tabSignUp) tabSignUp.classList.add('active');
      if (formSignIn) formSignIn.style.display = 'none';
      if (formSignUp) formSignUp.style.display = 'block';
    } else if (tab === 'forgot') {
      if (tabSignIn) tabSignIn.classList.remove('active');
      if (tabSignUp) tabSignUp.classList.remove('active');
      if (formSignIn) formSignIn.style.display = 'none';
      if (formSignUp) formSignUp.style.display = 'none';
      if (formForgot) formForgot.style.display = 'block';
    }
  }

  async fetchCurrentUser() {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });
      const data = await res.json();
      if (data.success) {
        this.user = data.user;
        this.profile = data.profile;
        localStorage.setItem('digipulse_user', JSON.stringify(this.user));
        localStorage.setItem('digipulse_profile', JSON.stringify(this.profile));
        this.updateUserUI();
        return true;
      } else {
        localStorage.removeItem('digipulse_token');
        localStorage.removeItem('digipulse_user');
        localStorage.removeItem('digipulse_profile');
        this.token = null;
        this.user = null;
        this.profile = {};
        return false;
      }
    } catch (err) {
      console.warn('Network issue fetching user:', err);
      if (this.user) {
        this.updateUserUI();
        return true;
      }
      return false;
    }
  }

  async login(email, password, rememberMe = true) {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe })
      });
      const data = await res.json();
      if (!data.success) {
        this.showToast(data.message, 'danger');
        return false;
      }

      this.token = data.token;
      this.user = data.user;
      this.profile = data.profile;
      localStorage.setItem('digipulse_token', this.token);
      localStorage.setItem('digipulse_user', JSON.stringify(this.user));
      localStorage.setItem('digipulse_profile', JSON.stringify(this.profile));

      this.closeModal('authModal');
      this.enterApp(true);
      return true;
    } catch (err) {
      this.showToast('Login server error', 'danger');
      return false;
    }
  }

  async demoLogin(email, password) {
    return await this.login(email, password, true);
  }

  async register(fullName, email, password, confirmPassword, agreeTerms) {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password, confirmPassword, agreeTerms })
      });
      const data = await res.json();
      if (!data.success) {
        this.showToast(data.message, 'danger');
        return false;
      }

      this.token = data.token;
      this.user = data.user;
      this.profile = data.profile;
      localStorage.setItem('digipulse_token', this.token);
      localStorage.setItem('digipulse_user', JSON.stringify(this.user));
      localStorage.setItem('digipulse_profile', JSON.stringify(this.profile));

      this.closeModal('authModal');
      this.enterApp(true);
      return true;
    } catch (err) {
      this.showToast('Registration error', 'danger');
      return false;
    }
  }

  logout() {
    localStorage.removeItem('digipulse_token');
    localStorage.removeItem('digipulse_user');
    localStorage.removeItem('digipulse_profile');
    this.token = null;
    this.user = null;
    this.profile = {};
    this.updateUserUI();
    this.switchView('home');
    this.showAuthPortal('signin');
    this.showToast('Signed out successfully.', 'info');
  }

  updateUserUI() {
    const nameLabel = document.getElementById('headerUserName');
    const avatarInitials = document.getElementById('headerUserInitials');
    const greetingEl = document.getElementById('dashboardUserGreeting');
    const adminNavBtn = document.querySelectorAll('.admin-nav-item');

    if (this.user) {
      const initials = this.user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
      if (nameLabel) nameLabel.textContent = this.user.fullName;
      if (avatarInitials) avatarInitials.textContent = initials;
      if (greetingEl) greetingEl.textContent = this.user.fullName;

      // Show admin links if admin
      adminNavBtn.forEach(el => {
        el.style.display = this.user.role === 'admin' ? 'flex' : 'none';
      });

      this.populateProfileForm();
    } else {
      if (nameLabel) nameLabel.textContent = 'Sign In';
      if (avatarInitials) avatarInitials.textContent = '?';
      if (greetingEl) greetingEl.textContent = 'Health Seeker';
      adminNavBtn.forEach(el => el.style.display = 'none');
    }
  }

  // ==========================================
  // VIEW NAVIGATION (Fixed Bottom Nav + Top Nav)
  // ==========================================
  switchView(viewName) {
    this.currentView = viewName;
    document.querySelectorAll('.view-panel').forEach(panel => {
      panel.classList.toggle('active', panel.id === `view-${viewName}`);
    });

    document.querySelectorAll('[data-view-target]').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-view-target') === viewName);
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (viewName === 'home') this.loadDashboard();
    if (viewName === 'tracker') this.loadTrackerData();
    if (viewName === 'library') this.loadArticles();
    if (viewName === 'profile') this.populateProfileForm();
    if (viewName === 'admin') this.loadAdminData();
  }

  // ==========================================
  // DASHBOARD LOADING & LIVE STATS
  // ==========================================
  async loadDashboard() {
    if (!this.token) return;
    try {
      const res = await fetch('/api/dashboard/summary', {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });
      const json = await res.json();
      if (!json.success) return;

      const data = json.data;
      const m = data.metrics;

      // 1. BMI Card
      document.getElementById('cardBmiValue').textContent = m.bmi.value;
      const bmiBadge = document.getElementById('cardBmiBadge');
      bmiBadge.textContent = m.bmi.category;
      bmiBadge.className = `status-badge badge-${m.bmi.category === 'Normal' ? 'normal' : (m.bmi.category === 'Overweight' ? 'warning' : 'danger')}`;

      // 2. Weight Card
      document.getElementById('cardWeightValue').textContent = `${m.weight.current} kg`;
      const diffText = m.weight.diff > 0 ? `+${m.weight.diff} kg to target` : (m.weight.diff < 0 ? `${m.weight.diff} kg to target` : 'On Target');
      document.getElementById('cardWeightDiff').textContent = diffText;

      // 3. Blood Pressure Card
      document.getElementById('cardBpValue').textContent = `${m.bloodPressure.systolic}/${m.bloodPressure.diastolic}`;
      const bpBadge = document.getElementById('cardBpBadge');
      bpBadge.textContent = m.bloodPressure.category;
      bpBadge.className = `status-badge badge-${m.bloodPressure.category === 'Normal' ? 'normal' : (m.bloodPressure.category === 'Elevated' ? 'warning' : 'danger')}`;

      // 4. Heart Rate Card
      document.getElementById('cardHrValue').textContent = `${m.heartRate.rate} bpm`;
      const hrBadge = document.getElementById('cardHrBadge');
      hrBadge.textContent = m.heartRate.category;
      hrBadge.className = `status-badge badge-${m.heartRate.category === 'Normal' ? 'normal' : 'warning'}`;

      // 5. Water Progress Card
      document.getElementById('cardWaterValue').textContent = `${m.water.currentMl} / ${m.water.targetMl} mL`;
      document.getElementById('cardWaterBar').style.width = `${m.water.percent}%`;
      document.getElementById('cardWaterPercent').textContent = `${m.water.percent}% of goal`;
      this.waterCount = m.water.currentMl;

      // 6. Activity Progress Card
      document.getElementById('cardActivityValue').textContent = `${m.activity.steps.toLocaleString()} steps`;
      document.getElementById('cardActivityBar').style.width = `${m.activity.percent}%`;
      document.getElementById('cardActivityMeta').textContent = `${m.activity.activeMinutes} mins • ${m.activity.calories} kcal`;

      // Daily Health Tip
      if (data.dailyTip) {
        document.getElementById('dailyTipCategory').textContent = data.dailyTip.category || 'Vitality Tip';
        document.getElementById('dailyTipText').textContent = data.dailyTip.tip_text;
      }

      // Notifications badge
      const notifDot = document.getElementById('notifBadgeDot');
      if (notifDot) {
        notifDot.style.display = data.unreadNotifications > 0 ? 'block' : 'none';
      }

      // Render mini dashboard trend
      this.loadDashboardTrends();
    } catch (err) {
      console.warn('Dashboard summary error:', err);
    }
  }

  async loadDashboardTrends() {
    try {
      const res = await fetch('/api/analytics/trends?days=7', {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });
      const json = await res.json();
      if (json.success && window.digiCharts) {
        window.digiCharts.renderBpChart('dashBpChart', json.data.bloodPressure);
      }
    } catch (err) {}
  }

  // ==========================================
  // QUICK ACTIONS
  // ==========================================
  async addWaterGlass(ml = 250) {
    if (!this.token) return this.openModal('authModal');
    try {
      const res = await fetch('/api/tracking/water', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({ amount_ml: ml })
      });
      const json = await res.json();
      if (json.success) {
        this.showToast(`+${ml} mL added! Total: ${json.data.todayTotal} mL`, 'success');
        this.loadDashboard();
        this.updateWaterTrackerVisual(json.data.todayTotal, json.data.goal);
      }
    } catch (err) {
      this.showToast('Could not log water.', 'danger');
    }
  }

  updateWaterTrackerVisual(current, goal) {
    const pct = Math.min(100, Math.round((current / goal) * 100));
    const fillEl = document.getElementById('waterBottleFill');
    const labelEl = document.getElementById('waterBottleLabel');
    if (fillEl) fillEl.style.height = `${pct}%`;
    if (labelEl) labelEl.textContent = `${current} / ${goal} mL (${pct}%)`;
  }

  // ==========================================
  // ASSESSMENTS MODULE
  // ==========================================
  async calculateBmi(height, weight) {
    try {
      const res = await fetch('/api/assessments/bmi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({ height_cm: height, weight_kg: weight })
      });
      const json = await res.json();
      if (json.success) {
        const d = json.data;
        document.getElementById('bmiResultBox').style.display = 'block';
        document.getElementById('bmiScoreDisplay').textContent = d.bmi;
        const catBadge = document.getElementById('bmiCategoryBadge');
        catBadge.textContent = d.category;
        catBadge.className = `status-badge badge-${d.category === 'Normal' ? 'normal' : 'warning'}`;
        document.getElementById('bmiHealthyRangeText').textContent = `Clinically healthy range for your height: ${d.minHealthyWeight} kg – ${d.maxHealthyWeight} kg`;
        document.getElementById('bmiAdviceText').textContent = d.advice;
        this.loadDashboard();
        this.showToast('BMI recorded to your profile history!', 'success');
      }
    } catch (err) {
      this.showToast('BMI calculation failed.', 'danger');
    }
  }

  async calculateBmr(height, weight, age, sex, activity) {
    try {
      const res = await fetch('/api/assessments/bmr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({ height_cm: height, weight_kg: weight, age, sex, activity_level: activity })
      });
      const json = await res.json();
      if (json.success) {
        const d = json.data;
        document.getElementById('bmrResultBox').style.display = 'block';
        document.getElementById('bmrScore').textContent = `${d.bmr.toLocaleString()} kcal/day`;
        document.getElementById('tdeeScore').textContent = `${d.tdee.toLocaleString()} kcal/day`;
        document.getElementById('calMildLoss').textContent = `${d.calories.mildWeightLoss} kcal`;
        document.getElementById('calLoss').textContent = `${d.calories.weightLoss} kcal`;
        document.getElementById('calGain').textContent = `${d.calories.mildWeightGain} kcal`;
        document.getElementById('bmrAdvice').textContent = d.advice;
      }
    } catch (err) {
      this.showToast('BMR calculation failed.', 'danger');
    }
  }

  async calculateBodyFat(sex, waist, neck, height, hip) {
    try {
      const res = await fetch('/api/assessments/body-fat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({ sex, waist_cm: waist, neck_cm: neck, height_cm: height, hip_cm: hip })
      });
      const json = await res.json();
      if (json.success) {
        document.getElementById('bodyFatResultBox').style.display = 'block';
        document.getElementById('bodyFatScore').textContent = `${json.data.bodyFatPct}%`;
        document.getElementById('bodyFatCategory').textContent = json.data.category;
        document.getElementById('bodyFatAdvice').textContent = json.data.advice;
      }
    } catch (err) {
      this.showToast('Body fat calculation failed.', 'danger');
    }
  }

  async calculateWhtr(waist, height) {
    try {
      const res = await fetch('/api/assessments/whtr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({ waist_cm: waist, height_cm: height })
      });
      const json = await res.json();
      if (json.success) {
        document.getElementById('whtrResultBox').style.display = 'block';
        document.getElementById('whtrScore').textContent = json.data.ratio;
        document.getElementById('whtrCategory').textContent = json.data.category;
        document.getElementById('whtrAdvice').textContent = `${json.data.risk}. ${json.data.advice}`;
      }
    } catch (err) {
      this.showToast('WHtR calculation failed.', 'danger');
    }
  }

  async calculateHealthyWeight(height, sex) {
    try {
      const res = await fetch('/api/assessments/healthy-weight', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({ height_cm: height, sex })
      });
      const json = await res.json();
      if (json.success) {
        document.getElementById('healthyWeightResultBox').style.display = 'block';
        document.getElementById('healthyRangeScore').textContent = `${json.data.healthyRange.min} kg – ${json.data.healthyRange.max} kg`;
        document.getElementById('devineIdealWeight').textContent = `${json.data.idealDevine} kg`;
        document.getElementById('healthyWeightAdvice').textContent = json.data.advice;
      }
    } catch (err) {
      this.showToast('Weight calculation failed.', 'danger');
    }
  }

  async submitNutritionalAssessment(formData) {
    try {
      const res = await fetch('/api/assessments/nutritional', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify(formData)
      });
      const json = await res.json();
      if (json.success) {
        const d = json.data;
        document.getElementById('nutritionResultBox').style.display = 'block';
        document.getElementById('nutritionStatusBadge').textContent = d.nutritionalStatus;
        const list = document.getElementById('nutritionRecommendationsList');
        list.innerHTML = d.recommendations.map(r => `<li>${r}</li>`).join('');
      }
    } catch (err) {
      this.showToast('Nutritional assessment error.', 'danger');
    }
  }

  async submitRiskScreening(type, answers) {
    try {
      const res = await fetch('/api/assessments/risk-screening', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({ type, answers })
      });
      const json = await res.json();
      if (json.success) {
        const d = json.data;
        document.getElementById('riskResultBox').style.display = 'block';
        document.getElementById('riskResultTitle').textContent = `${d.type} Results`;
        document.getElementById('riskScoreNumber').textContent = `Score: ${d.score}`;
        const levelBadge = document.getElementById('riskLevelBadge');
        levelBadge.textContent = `${d.riskLevel} Risk`;
        levelBadge.className = `status-badge badge-${d.riskLevel === 'Low' ? 'normal' : (d.riskLevel === 'Moderate' ? 'warning' : 'danger')}`;
        document.getElementById('riskRecommendationsText').textContent = d.recommendations;
        this.showToast('Risk screening evaluated successfully!', 'success');
      }
    } catch (err) {
      this.showToast('Risk screening submission failed.', 'danger');
    }
  }

  // ==========================================
  // HEALTH TRACKER MODULE DATA
  // ==========================================
  async loadTrackerData() {
    if (!this.token) return;
    try {
      // 1. Load Blood Pressure records
      const bpRes = await fetch('/api/tracking/bp', { headers: { 'Authorization': `Bearer ${this.token}` } });
      const bpJson = await bpRes.json();
      if (bpJson.success) {
        this.renderBpTable(bpJson.data);
        if (window.digiCharts) {
          window.digiCharts.renderBpChart('trackerBpChart', bpJson.data);
        }
      }

      // 2. Load Heart Rate records
      const hrRes = await fetch('/api/tracking/heart-rate', { headers: { 'Authorization': `Bearer ${this.token}` } });
      const hrJson = await hrRes.json();
      if (hrJson.success) {
        this.renderHrTable(hrJson.data);
      }

      // 3. Load Weight records
      const wRes = await fetch('/api/tracking/weight', { headers: { 'Authorization': `Bearer ${this.token}` } });
      const wJson = await wRes.json();
      if (wJson.success) {
        this.renderWeightTable(wJson.data.records);
        if (window.digiCharts) {
          window.digiCharts.renderWeightChart('trackerWeightChart', wJson.data.records, wJson.data.target);
        }
      }

      // 4. Load Water Intake
      const waterRes = await fetch('/api/tracking/water', { headers: { 'Authorization': `Bearer ${this.token}` } });
      const waterJson = await waterRes.json();
      if (waterJson.success) {
        this.updateWaterTrackerVisual(waterJson.data.todayTotal, waterJson.data.goal);
      }

      // 5. Load Analytics for charts
      const anaRes = await fetch('/api/analytics/trends?days=30', { headers: { 'Authorization': `Bearer ${this.token}` } });
      const anaJson = await anaRes.json();
      if (anaJson.success && window.digiCharts) {
        window.digiCharts.renderWaterChart('trackerWaterChart', anaJson.data.water);
        window.digiCharts.renderActivityChart('trackerActivityChart', anaJson.data.activity);
        window.digiCharts.renderSleepChart('trackerSleepChart', anaJson.data.sleep);
      }
    } catch (err) {
      console.warn('Tracker data error:', err);
    }
  }

  renderBpTable(records) {
    const tbody = document.getElementById('bpHistoryTableBody');
    if (!tbody) return;
    if (records.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:20px;">No blood pressure readings recorded yet.</td></tr>`;
      return;
    }
    tbody.innerHTML = records.map(r => {
      const dateStr = new Date(r.recorded_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      const badgeClass = r.category === 'Normal' ? 'normal' : (r.category === 'Elevated' ? 'warning' : 'danger');
      return `
        <tr>
          <td><strong>${dateStr}</strong></td>
          <td><span style="font-weight:700; font-size:1.05rem;">${r.systolic}</span> / ${r.diastolic} mmHg</td>
          <td>${r.pulse ? `${r.pulse} bpm` : '—'}</td>
          <td><span class="status-badge badge-${badgeClass}">${r.category}</span></td>
          <td>${r.notes || '—'}</td>
          <td>
            <button class="btn-icon text-danger" onclick="app.deleteBpRecord(${r.id})" title="Delete record">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  async deleteBpRecord(id) {
    if (!confirm('Are you sure you want to remove this reading?')) return;
    try {
      const res = await fetch(`/api/tracking/bp/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${this.token}` }
      });
      const json = await res.json();
      if (json.success) {
        this.showToast('Reading removed.', 'info');
        this.loadTrackerData();
        this.loadDashboard();
      }
    } catch (err) {
      this.showToast('Could not delete reading.', 'danger');
    }
  }

  renderHrTable(records) {
    const tbody = document.getElementById('hrHistoryTableBody');
    if (!tbody) return;
    if (records.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted); padding:20px;">No heart rate logs yet.</td></tr>`;
      return;
    }
    tbody.innerHTML = records.map(r => {
      const dateStr = new Date(r.recorded_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      return `
        <tr>
          <td><strong>${dateStr}</strong></td>
          <td><span style="font-weight:700; color:var(--danger-500); font-size:1.05rem;">${r.heart_rate}</span> bpm</td>
          <td><span class="status-badge badge-${r.category === 'Normal' ? 'normal' : 'warning'}">${r.category}</span></td>
          <td>${r.context || 'Resting'}</td>
          <td>${r.notes || '—'}</td>
        </tr>
      `;
    }).join('');
  }

  renderWeightTable(records) {
    const tbody = document.getElementById('weightHistoryTableBody');
    if (!tbody) return;
    if (records.length === 0) {
      tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:var(--text-muted); padding:20px;">No weight entries yet.</td></tr>`;
      return;
    }
    tbody.innerHTML = records.map(r => {
      const dateStr = new Date(r.recorded_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
      return `
        <tr>
          <td><strong>${dateStr}</strong></td>
          <td><span style="font-weight:700;">${r.weight_kg}</span> kg</td>
          <td>${r.notes || '—'}</td>
        </tr>
      `;
    }).join('');
  }

  // ==========================================
  // HEALTH LIBRARY (Search & Categories)
  // ==========================================
  async loadArticles(category = 'All', search = '') {
    try {
      let url = `/api/articles?category=${encodeURIComponent(category)}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        this.articles = json.data;
        this.renderArticlesGrid(this.articles);
      }
    } catch (err) {
      console.warn('Articles error:', err);
    }
  }

  renderArticlesGrid(articles) {
    const grid = document.getElementById('articlesGrid');
    if (!grid) return;
    if (articles.length === 0) {
      grid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding:40px; color:var(--text-muted);">No health articles found matching your criteria.</div>`;
      return;
    }

    grid.innerHTML = articles.map(a => `
      <div class="article-card" onclick="app.openArticleModal('${a.slug}')">
        <div class="article-img-wrap">
          <img src="${a.image_url}" alt="${a.title}" loading="lazy">
        </div>
        <div class="article-content-body">
          <div class="article-category-badge">${a.category}</div>
          <h4>${a.title}</h4>
          <p>${a.description}</p>
          <div class="article-card-footer">
            <span style="display:inline-flex; align-items:center; gap:4px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>${a.read_time_mins} min read</span>
            <span>By ${a.author}</span>
          </div>
        </div>
      </div>
    `).join('');
  }

  async openArticleModal(slug) {
    try {
      const res = await fetch(`/api/articles/${slug}`);
      const json = await res.json();
      if (json.success) {
        const a = json.data;
        document.getElementById('articleModalTitle').textContent = a.title;
        document.getElementById('articleModalCategory').textContent = a.category;
        document.getElementById('articleModalImage').src = a.image_url;
        document.getElementById('articleModalMeta').textContent = `By ${a.author} • ${a.read_time_mins} min read • Reviewed by DigiPulse Medical Board`;
        
        // Convert simple markdown to HTML
        let bodyHtml = a.content
          .replace(/^### (.*$)/gim, '<h3>$1</h3>')
          .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
          .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
          .replace(/\n\n/gim, '<p></p>');

        document.getElementById('articleModalContent').innerHTML = bodyHtml;
        document.getElementById('articleModalReferences').textContent = a.references_sources || 'American College of Cardiology; WHO Guidelines';

        this.openModal('articleModal');
      }
    } catch (err) {
      this.showToast('Could not load article details.', 'danger');
    }
  }

  // Accessibility Text-to-Speech for Article
  speakArticleContent() {
    const title = document.getElementById('articleModalTitle').textContent;
    const body = document.getElementById('articleModalContent').innerText;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(`${title}. ${body}`);
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
      this.showToast('Playing audio narration', 'info');
    } else {
      this.showToast('Text-to-speech not supported on this browser.', 'warning');
    }
  }

  // ==========================================
  // PROFILE & SETTINGS
  // ==========================================
  populateProfileForm() {
    if (!this.profile) return;
    const p = this.profile;
    const u = this.user || {};

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val !== undefined && val !== null ? val : '';
    };

    setVal('profFullName', u.fullName);
    setVal('profEmail', u.email);
    setVal('profAge', p.age);
    setVal('profSex', p.sex || 'male');
    setVal('profHeight', p.height_cm);
    setVal('profWeight', p.weight_kg);
    setVal('profBloodType', p.blood_type || 'Unknown');
    setVal('profEmergencyName', p.emergency_contact_name);
    setVal('profEmergencyPhone', p.emergency_contact_phone);
    setVal('profEmergencyRelation', p.emergency_contact_relation);
    setVal('profGoals', p.health_goals);
    setVal('profTargetWeight', p.target_weight_kg);
    setVal('profTargetWater', p.target_water_ml);
    setVal('profTargetSteps', p.target_steps);
    setVal('profTargetSleep', p.target_sleep_hours);
  }

  async saveProfile(event) {
    event.preventDefault();
    try {
      const getVal = id => document.getElementById(id)?.value;
      const updates = {
        fullName: getVal('profFullName'),
        age: getVal('profAge'),
        sex: getVal('profSex'),
        height_cm: getVal('profHeight'),
        weight_kg: getVal('profWeight'),
        blood_type: getVal('profBloodType'),
        emergency_contact_name: getVal('profEmergencyName'),
        emergency_contact_phone: getVal('profEmergencyPhone'),
        emergency_contact_relation: getVal('profEmergencyRelation'),
        health_goals: getVal('profGoals'),
        target_weight_kg: getVal('profTargetWeight'),
        target_water_ml: getVal('profTargetWater'),
        target_steps: getVal('profTargetSteps'),
        target_sleep_hours: getVal('profTargetSleep')
      };

      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify(updates)
      });
      const json = await res.json();
      if (json.success) {
        this.user = json.user;
        this.profile = json.profile;
        localStorage.setItem('digipulse_user', JSON.stringify(this.user));
        localStorage.setItem('digipulse_profile', JSON.stringify(this.profile));
        this.updateUserUI();
        this.showToast('Health profile saved successfully.', 'success');
        this.loadDashboard();
      } else {
        this.showToast(json.message, 'danger');
      }
    } catch (err) {
      this.showToast('Could not save profile changes.', 'danger');
    }
  }

  // ==========================================
  // EXPORT HEALTH REPORTS & CSV HISTORY
  // ==========================================
  downloadHistoryCsv() {
    if (!this.token) return this.openModal('authModal');
    window.open(`/api/export/csv?token=${this.token}`, '_blank');
  }

  async generatePdfReport() {
    if (!this.token) return this.openModal('authModal');
    try {
      const res = await fetch('/api/export/report-data', {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });
      const json = await res.json();
      if (json.success) {
        this.renderPrintableReport(json.report);
        this.openModal('reportModal');
      }
    } catch (err) {
      this.showToast('Could not assemble PDF report.', 'danger');
    }
  }

  renderPrintableReport(report) {
    const container = document.getElementById('printableReportContent');
    if (!container) return;
    const u = report.user;
    const vitals = report.latestVitals;

    container.innerHTML = `
      <div style="border-bottom: 2px solid #0284c7; padding-bottom: 12px; margin-bottom: 16px; display:flex; justify-content:space-between; align-items:flex-end;">
        <div>
          <h2 style="color:#0284c7; margin:0; font-size:1.6rem;">DIGIPULSE CLINICAL HEALTH REPORT</h2>
          <div style="font-size:0.85rem; color:#64748b;">Tagline: "Your Digital Partner for Better Health"</div>
        </div>
        <div style="text-align:right; font-size:0.85rem; color:#64748b;">
          <div>Generated: ${new Date(report.generatedAt).toLocaleDateString()}</div>
          <div>Report ID: #DP-${Date.now().toString().slice(-6)}</div>
        </div>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:20px; background:#f8fafc; padding:12px; border-radius:8px;">
        <div>
          <div><strong>Patient Name:</strong> ${u.fullName}</div>
          <div><strong>Age / Sex:</strong> ${u.age || '—'} yrs / ${u.sex || '—'}</div>
          <div><strong>Blood Type:</strong> ${u.bloodType || '—'}</div>
        </div>
        <div>
          <div><strong>Height / Weight:</strong> ${u.height_cm || '—'} cm / ${u.weight_kg || '—'} kg</div>
          <div><strong>Emergency Contact:</strong> ${u.emergencyContact.name || '—'} (${u.emergencyContact.relation || '—'}, ${u.emergencyContact.phone || '—'})</div>
          <div><strong>Health Goals:</strong> ${u.goals || 'General Wellness'}</div>
        </div>
      </div>

      <h3 style="font-size:1.1rem; border-bottom:1px solid #e2e8f0; padding-bottom:4px; margin-bottom:10px;">LATEST RECORDED VITALS</h3>
      <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:12px; margin-bottom:20px;">
        <div style="border:1px solid #e2e8f0; padding:10px; border-radius:6px; text-align:center;">
          <div style="font-size:0.8rem; color:#64748b;">Body Mass Index (BMI)</div>
          <div style="font-size:1.4rem; font-weight:800; color:#0f172a;">${vitals.bmi ? vitals.bmi.bmi_value : '—'}</div>
          <div style="font-size:0.85rem; font-weight:600; color:#0284c7;">${vitals.bmi ? vitals.bmi.category : 'N/A'}</div>
        </div>
        <div style="border:1px solid #e2e8f0; padding:10px; border-radius:6px; text-align:center;">
          <div style="font-size:0.8rem; color:#64748b;">Blood Pressure</div>
          <div style="font-size:1.4rem; font-weight:800; color:#0f172a;">${vitals.bp ? `${vitals.bp.systolic}/${vitals.bp.diastolic}` : '—'} <span style="font-size:0.8rem;">mmHg</span></div>
          <div style="font-size:0.85rem; font-weight:600; color:#059669;">${vitals.bp ? vitals.bp.category : 'N/A'}</div>
        </div>
        <div style="border:1px solid #e2e8f0; padding:10px; border-radius:6px; text-align:center;">
          <div style="font-size:0.8rem; color:#64748b;">Resting Heart Rate</div>
          <div style="font-size:1.4rem; font-weight:800; color:#0f172a;">${vitals.heartRate ? vitals.heartRate.heart_rate : '—'} <span style="font-size:0.8rem;">bpm</span></div>
          <div style="font-size:0.85rem; font-weight:600; color:#0284c7;">${vitals.heartRate ? vitals.heartRate.category : 'N/A'}</div>
        </div>
      </div>

      <h3 style="font-size:1.1rem; border-bottom:1px solid #e2e8f0; padding-bottom:4px; margin-bottom:10px;">RECENT BLOOD PRESSURE LOGS</h3>
      <table style="width:100%; border-collapse:collapse; font-size:0.85rem; margin-bottom:20px;">
        <thead>
          <tr style="background:#f1f5f9; text-align:left;">
            <th style="padding:6px;">Date</th>
            <th style="padding:6px;">Systolic/Diastolic</th>
            <th style="padding:6px;">Pulse</th>
            <th style="padding:6px;">Classification</th>
          </tr>
        </thead>
        <tbody>
          ${report.recentBpHistory.map(b => `
            <tr style="border-bottom:1px solid #f1f5f9;">
              <td style="padding:6px;">${new Date(b.recorded_at).toLocaleDateString()}</td>
              <td style="padding:6px;">${b.systolic} / ${b.diastolic} mmHg</td>
              <td style="padding:6px;">${b.pulse ? `${b.pulse} bpm` : '—'}</td>
              <td style="padding:6px;">${b.category}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div style="margin-top:24px; padding-top:12px; border-top:1px dashed #cbd5e1; font-size:0.8rem; color:#64748b;">
        <div><strong>Physician / Clinical Disclaimer:</strong> This DIGIPULSE health report contains patient self-monitored metrics for informational and wellness tracking purposes. It does not replace clinical diagnosis.</div>
      </div>
    `;
  }

  printReport() {
    window.print();
  }

  // ==========================================
  // ADMIN PANEL MANAGEMENT
  // ==========================================
  async loadAdminData() {
    if (!this.token || this.user?.role !== 'admin') return;
    try {
      const [usersRes, statsRes] = await Promise.all([
        fetch('/api/admin/users', { headers: { 'Authorization': `Bearer ${this.token}` } }),
        fetch('/api/admin/stats', { headers: { 'Authorization': `Bearer ${this.token}` } })
      ]);

      const usersJson = await usersRes.json();
      const statsJson = await statsRes.json();

      if (statsJson.success) {
        const s = statsJson.data;
        document.getElementById('adminStatTotalUsers').textContent = s.totalUsers;
        document.getElementById('adminStatActiveUsers').textContent = s.activeUsers;
        document.getElementById('adminStatBmiLogs').textContent = s.totalBmiAssessments;
        document.getElementById('adminStatBpLogs').textContent = s.totalBpLogs;
      }

      if (usersJson.success) {
        this.renderAdminUsersTable(usersJson.data);
      }
    } catch (err) {
      console.warn('Admin load error:', err);
    }
  }

  renderAdminUsersTable(users) {
    const tbody = document.getElementById('adminUsersTableBody');
    if (!tbody) return;
    tbody.innerHTML = users.map(u => `
      <tr>
        <td><strong>#${u.id}</strong></td>
        <td>
          <div style="font-weight:700;">${u.fullName}</div>
          <div style="font-size:0.8rem; color:var(--text-muted);">${u.email}</div>
        </td>
        <td><span class="status-badge ${u.role === 'admin' ? 'badge-info' : 'badge-normal'}">${u.role}</span></td>
        <td><span class="status-badge ${u.status === 'active' ? 'badge-normal' : 'badge-danger'}">${u.status}</span></td>
        <td>
          <div style="font-size:0.82rem;">${u.counts.bpLogs} BP logs • ${u.counts.bmiLogs} BMI checks</div>
        </td>
        <td>
          ${u.id !== this.user.id ? `
            <button class="btn-secondary" style="padding:4px 10px; font-size:0.8rem;" onclick="app.toggleUserStatus(${u.id}, '${u.status === 'active' ? 'suspended' : 'active'}')">
              ${u.status === 'active' ? 'Suspend' : 'Activate'}
            </button>
          ` : '<span style="font-size:0.8rem; color:var(--text-muted);">Current</span>'}
        </td>
      </tr>
    `).join('');
  }

  async toggleUserStatus(userId, newStatus) {
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const json = await res.json();
      if (json.success) {
        this.showToast(json.message, 'success');
        this.loadAdminData();
      }
    } catch (err) {
      this.showToast('Could not update status.', 'danger');
    }
  }

  async publishArticle(event) {
    event.preventDefault();
    try {
      const title = document.getElementById('newArticleTitle').value;
      const category = document.getElementById('newArticleCategory').value;
      const description = document.getElementById('newArticleDesc').value;
      const content = document.getElementById('newArticleContent').value;
      const image_url = document.getElementById('newArticleImg').value;
      const references_sources = document.getElementById('newArticleRefs').value;

      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({ title, category, description, content, image_url, references_sources })
      });
      const json = await res.json();
      if (json.success) {
        this.showToast('Article published to Health Library!', 'success');
        document.getElementById('publishArticleForm').reset();
        this.loadArticles();
      } else {
        this.showToast(json.message, 'danger');
      }
    } catch (err) {
      this.showToast('Could not publish article.', 'danger');
    }
  }

  async publishTip(event) {
    event.preventDefault();
    try {
      const tip_text = document.getElementById('newTipText').value;
      const category = document.getElementById('newTipCategory').value;

      const res = await fetch('/api/tips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({ tip_text, category })
      });
      const json = await res.json();
      if (json.success) {
        this.showToast('Health tip published!', 'success');
        document.getElementById('publishTipForm').reset();
        this.loadDashboard();
      }
    } catch (err) {
      this.showToast('Could not publish tip.', 'danger');
    }
  }

  // ==========================================
  // NOTIFICATIONS SYSTEM
  // ==========================================
  async openNotifications() {
    if (!this.token) return this.openModal('authModal');
    try {
      const res = await fetch('/api/notifications', {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });
      const json = await res.json();
      if (json.success) {
        this.renderNotificationsList(json.data);
        this.openModal('notificationsModal');
      }
    } catch (err) {
      this.showToast('Could not load notifications.', 'danger');
    }
  }

  renderNotificationsList(list) {
    const container = document.getElementById('notificationsList');
    if (!container) return;
    if (list.length === 0) {
      container.innerHTML = `<div style="text-align:center; padding:30px; color:var(--text-muted);">No notifications yet. You're all caught up!</div>`;
      return;
    }
    container.innerHTML = list.map(n => `
      <div style="padding:12px; border-radius:10px; background:${n.is_read ? 'var(--bg-input)' : 'var(--primary-50)'}; border:1px solid var(--border-subtle); margin-bottom:8px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
          <strong style="font-size:0.92rem; color:var(--text-main);">${n.title}</strong>
          <span style="font-size:0.75rem; color:var(--text-muted);">${n.scheduled_time || 'Just now'}</span>
        </div>
        <p style="font-size:0.86rem; color:var(--text-muted); margin:0;">${n.message}</p>
      </div>
    `).join('');
  }

  async markAllNotificationsRead() {
    try {
      await fetch('/api/notifications/read-all', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${this.token}` }
      });
      const notifDot = document.getElementById('notifBadgeDot');
      if (notifDot) notifDot.style.display = 'none';
      this.showToast('All notifications marked as read.', 'info');
      this.openNotifications();
    } catch (err) {}
  }

  async triggerReminder(type) {
    try {
      const res = await fetch('/api/notifications/trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({ type })
      });
      const json = await res.json();
      if (json.success) {
        this.showToast(`${json.data.title}: ${json.data.message}`, 'info');
        // Browser notification if permitted
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(json.data.title, { body: json.data.message });
        }
      }
    } catch (err) {}
  }

  requestNotificationPermission() {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          this.showToast('Browser notifications enabled.', 'success');
        }
      });
    }
  }

  // ==========================================
  // UTILITIES, THEME & LOCALIZATION
  // ==========================================
  setupTheme() {
    document.documentElement.setAttribute('data-theme', this.theme);
    const themeIcon = document.getElementById('themeToggleIcon');
    if (themeIcon) {
      themeIcon.innerHTML = this.theme === 'dark' 
        ? '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>'
        : '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
    }
  }

  toggleTheme() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('digipulse_theme', this.theme);
    this.setupTheme();
    if (window.digiCharts) window.digiCharts.updateTheme();
  }

  setupAccessibility() {
    const contrast = localStorage.getItem('digipulse_contrast') === 'true';
    if (contrast) document.body.classList.add('high-contrast');

    const fontScale = localStorage.getItem('digipulse_font_scale');
    if (fontScale === 'large') document.body.classList.add('font-large');
    if (fontScale === 'small') document.body.classList.add('font-small');
  }

  toggleHighContrast() {
    const isHigh = document.body.classList.toggle('high-contrast');
    localStorage.setItem('digipulse_contrast', isHigh);
  }

  setFontScale(scale) {
    document.body.classList.remove('font-large', 'font-small');
    if (scale === 'large') document.body.classList.add('font-large');
    if (scale === 'small') document.body.classList.add('font-small');
    localStorage.setItem('digipulse_font_scale', scale);
  }

  setLanguage(lang) {
    this.currentLang = lang;
    localStorage.setItem('digipulse_lang', lang);
    this.applyTranslations();
  }

  applyTranslations() {
    const dict = window.digiTranslations?.[this.currentLang] || window.digiTranslations?.['en'];
    if (!dict) return;

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) {
        if (el.tagName === 'INPUT' && el.getAttribute('placeholder')) {
          el.placeholder = dict[key];
        } else {
          el.textContent = dict[key];
        }
      }
    });
  }

  startLiveClock() {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const dateStr = now.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
      
      const timeEl = document.getElementById('liveClockTime');
      const dateEl = document.getElementById('liveClockDate');
      if (timeEl) timeEl.textContent = timeStr;
      if (dateEl) dateEl.textContent = dateStr;
    };
    updateTime();
    setInterval(updateTime, 1000);
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type}`;
    toast.innerHTML = `
      <div style="font-weight:600; font-size:0.9rem; flex:1;">${message}</div>
      <button style="color:var(--text-muted);" onclick="this.parentElement.remove()">&times;</button>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      if (toast.parentElement) toast.remove();
    }, 4000);
  }

  openModal(modalId) {
    const m = document.getElementById(modalId);
    if (m) m.classList.add('active');
  }

  closeModal(modalId) {
    const m = document.getElementById(modalId);
    if (m) m.classList.remove('active');
  }

  setupEventListeners() {
    // Tab buttons inside sections
    document.querySelectorAll('.tab-btn[data-tab-target]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetId = btn.getAttribute('data-tab-target');
        const parentPane = btn.closest('.tabs-container');
        if (!parentPane) return;

        parentPane.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        parentPane.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        const pane = document.getElementById(targetId);
        if (pane) pane.classList.add('active');
      });
    });

    // Close modals on background click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('active');
        }
      });
    });
  }

  setupServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(reg => {
        console.log('[PWA] Service Worker registered:', reg.scope);
      }).catch(err => console.log('[PWA] SW register error:', err));
    }
  }
}

// Global App Instance
window.addEventListener('DOMContentLoaded', () => {
  window.app = new DigiPulseApp();
});
