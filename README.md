# DIGIPULSE - Your Digital Partner for Better Health

> **Tagline:** *"Your Digital Partner for Better Health."*

**DIGIPULSE** is a modern, responsive, user-friendly digital health monitoring web application engineered to help individuals track, assess, understand, and optimize their daily biometric indicators and long-term health trajectory.

---

## 🌟 Key Application Features

### 1. 🔐 Secure Authentication & Personal Profile
- **Sign Up**: Full Name, Email, Password, Confirm Password, and Terms Agreement.
- **Sign In**: Remember Me functionality and interactive Forgot Password workflow.
- **Demo Mode**: 1-click access for **Patient (`mark@digipulse.health` / `password123`)** and **Clinical Administrator (`admin@digipulse.health` / `admin123`)**.
- **Comprehensive Profile**: Age, Biological Sex, Height, Weight, Blood Type (A+, A-, B+, B-, AB+, AB-, O+, O-), Emergency Contacts (Name, Phone, Relation), and Target Goals.

### 2. 📱 Responsive, Mobile-First Design & Fixed Bottom Navigation
- **Fixed Bottom Navigation Bar**: Always accessible on mobile devices for **Home**, **Tracker**, **Assessments**, **Library**, and **Profile**.
- **Desktop Navigation**: Fluid top navigation bar with quick search and user status indicator.
- **Healthcare UI Palette**: Medical Blue (`#0284c7`, `#0ea5e9`), Clean White, and Accent Green (`#10b981`).
- **Dark Mode & Light Mode**: Instant smooth switching with system preference detection.

### 3. 📊 Dashboard (Home Page)
- **Live Welcome Header**: User greeting, current date, and second-by-second live clock.
- **6 Health Summary Metric Cards**:
  1. **BMI Status**: Real-time value and classification badge (Normal, Overweight, Obese, Underweight).
  2. **Weight Status**: Current weight with delta against target goal.
  3. **Blood Pressure Status**: Latest systolic/diastolic reading and AHA clinical category.
  4. **Heart Rate Status**: Resting BPM with cardiac rhythm classification.
  5. **Water Intake Progress**: Daily hydration progress with animated fill percentage.
  6. **Daily Activity Progress**: Steps, active minutes, and estimated calories burned.
- **Daily Health Tip**: Dynamic evidence-based wellness recommendation updated daily.
- **Quick Action Bar**: One-click shortcuts for BMI, Blood Pressure, Weight, Hydration (+250mL), Activity, and PDF Export.

### 4. 🧮 Comprehensive Clinical Assessments Module
- **BMI Calculator**: Body mass index computation with healthy reference boundaries.
- **BMR & TDEE Calculator**: Mifflin-St Jeor & Harris-Benedict formulas with activity multipliers (sedentary, light, moderate, active, very active) and calorie targets (maintenance, weight loss, muscle gain).
- **Body Fat Estimator**: U.S. Navy Method using waist, neck, height, and hip measurements.
- **Waist-to-Height Ratio (WHtR)**: Central visceral adiposity and cardiometabolic risk category.
- **Healthy Weight Range**: Minimum/maximum healthy weights for patient height + Devine Ideal Body Weight formula.
- **Nutritional Assessment**: Meal frequency, hydration, and fruit/vegetable analysis with clinical dietary recommendations.
- **Health Risk Self-Screening**:
  - *Type 2 Diabetes Risk* (ADA 7-factor screening algorithm).
  - *Heart Disease / Coronary Risk* (Cardiovascular risk score).
  - *Hypertension Predisposition* (Sodium, lifestyle, and hereditary factors).
  - *Comprehensive Lifestyle Strain* (Circadian sleep, diet quality, exercise).

### 5. 💓 Vital Indicators & Health Tracking Hub
- **Blood Pressure Monitoring**: Log systolic, diastolic, pulse, and notes. Automatic AHA classification: Normal, Elevated, Stage 1, Stage 2, and Hypertensive Crisis.
- **Heart Rate Monitoring**: Resting pulse tracking with Bradycardia (<60) and Tachycardia (>100) warnings.
- **Weight Tracker**: Weight history and progress trendline towards target weight.
- **Water Tracker**: Daily target setting, glass counter, and interactive animated bottle graphic.
- **Sleep Tracker**: Sleep duration, bedtime, wake time, and perceived restorative quality rating.
- **Physical Activity Tracker**: Steps, workout duration, and caloric output.

### 6. 📚 Medical Knowledge Library
- Searchable and categorized medical articles:
  - *Nutrition*, *Exercise*, *Mental Wellness*, *First Aid*, *Healthy Lifestyle*, *Disease Prevention*, *Blood Pressure Information*, *BMI Information*.
- Detailed reading modal with high-resolution healthcare illustrations, scientific citations, and **Text-to-Speech (TTS)** audio narration for accessibility.

### 7. 📈 Progress Analytics & Charts
- High-resolution interactive **Chart.js** visualizations:
  - Blood Pressure Dual-Curve Trend (Systolic vs Diastolic).
  - Weight Progress & Goal Target Line.
  - Daily Hydration Bar Chart.
  - Physical Activity & Steps vs Target.
  - Sleep Duration Trends.

### 8. 🔔 Smart Notifications System
- Reminders for drinking water, physical exercise, medical checkups, bedtime wind-down, and blood pressure checks.
- Browser Web Push notification integration.

### 9. 🧑‍⚕️ Clinical Admin Command Center
- **User Management**: View all patients, inspect activity counts, edit user profiles, and suspend/activate accounts.
- **Content Management**: Publish new medical articles and broadcast daily tips.
- **Analytics Dashboard**: Total users, active patients, and assessment volume statistics.

### 10. 📄 Additional Modern Capabilities
- **Export Health Reports to PDF**: Formatted clinical report preview and one-click printable PDF.
- **Download Health History (CSV)**: Export complete BP, weight, heart rate, and activity logs.
- **Multi-Language Support**: Real-time translation for English, Spanish, French, German, and Filipino (Tagalog).
- **Accessibility Suite**: High-contrast mode, dynamic font sizing (A- / A / A+), and semantic ARIA labeling.
- **Data Privacy Compliance**: HIPAA and GDPR compliance policies with patient data transparency.
- **Progressive Web App (PWA)**: Offline caching via Service Worker (`sw.js`) and `manifest.json`.

---

## 🛠️ Technology Stack

- **Backend**: Node.js & Express.js
- **Database**: 
  - **MySQL** (Native support with `mysql2` connection pool & `database/schema.sql`)
  - **Embedded Resilient JSON Store** (`data/digipulse_store.json`) for seamless zero-configuration execution.
- **Frontend**: HTML5, Vanilla CSS3 (Custom Medical Design System), JavaScript (ES6+), Chart.js
- **Security**: JWT (JSON Web Tokens), bcryptjs password hashing

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18.0.0 or higher)
- (Optional) **MySQL 5.7+ / 8.0+** or XAMPP / MariaDB

### 2. Installation
```bash
# Clone or navigate to the project directory
cd "c:\Desktop\DIGIPULSE - Digital Health Partner"

# Install npm dependencies
npm install
```

### 3. Running the Application
```bash
# Start the web server
npm start
```
The application will launch at: **http://localhost:3000**

### 4. (Optional) Connecting to MySQL
To connect to an active MySQL database instance:
1. Open `.env` and set:
   ```env
   ENABLE_MYSQL=true
   DB_HOST=localhost
   DB_USER=root
   DB_PASS=your_mysql_password
   DB_NAME=digipulse_db
   ```
2. Import the schema and seed files into MySQL:
   ```bash
   mysql -u root -p < database/schema.sql
   mysql -u root -p < database/seeds.sql
   ```
3. Restart the server (`npm start`). If MySQL is offline, the app automatically runs using the persistent embedded storage.

---

## 🧪 Demo Credentials

| Role | Email | Password | Access |
|---|---|---|---|
| **Patient / User** | `mark@digipulse.health` | `password123` | Full Tracking, Vitals, Assessments, PDF Export |
| **Medical Doctor / Admin** | `admin@digipulse.health` | `admin123` | Patient Management, Article Publishing, Analytics |

---

## 📂 Project Structure

```
DIGIPULSE - Digital Health Partner/
├── config/
│   └── db.js                 # Database adapter (MySQL + Embedded fallback)
├── database/
│   ├── schema.sql            # Full MySQL database schema definition
│   └── seeds.sql             # Comprehensive clinical seed data & articles
├── middleware/
│   └── auth.js               # JWT verification & role-based access control
├── public/
│   ├── css/
│   │   └── style.css         # Modern medical design system stylesheet
│   ├── js/
│   │   ├── app.js            # Main frontend application controller
│   │   ├── charts.js         # Chart.js visualization engine
│   │   └── translations.js   # Multi-language dictionary
│   ├── icons/                # PWA application icons
│   ├── index.html            # Main single-page web application
│   ├── manifest.json         # PWA Web App Manifest
│   └── sw.js                 # Service Worker for offline caching
├── routes/
│   ├── admin.js              # User management & platform stats
│   ├── analytics.js          # Progress trends time-series API
│   ├── articles.js           # Health Library search & CRUD
│   ├── assessments.js        # BMI, BMR, Fat %, WHtR, Nutrition, Risk Screening
│   ├── auth.js               # Sign up, sign in, profile updates
│   ├── dashboard.js          # Vitals summary & daily tip
│   ├── export.js             # CSV history & PDF clinical report data
│   ├── notifications.js      # Health alerts & reminders
│   ├── tips.js               # Daily health tips
│   └── tracking.js           # Blood Pressure, Heart Rate, Weight, Water, Activity, Sleep
├── .env                      # Application environment variables
├── package.json              # Dependencies and scripts
└── server.js                 # Express server entry point
```

---

## 🛡️ License & Medical Disclaimer

*DIGIPULSE is developed for health monitoring and wellness education. It provides clinical metric tracking but does not replace qualified emergency medical advice or hospital diagnostics.*
