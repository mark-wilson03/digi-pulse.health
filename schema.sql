-- ========================================================
-- DIGIPULSE - Digital Health Partner
-- Database Schema (MySQL 5.7+ / 8.0+ Compatible)
-- Tagline: "Your Digital Partner for Better Health."
-- ========================================================

CREATE DATABASE IF NOT EXISTS `digipulse_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `digipulse_db`;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `full_name` VARCHAR(120) NOT NULL,
    `email` VARCHAR(150) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `role` ENUM('user', 'admin') DEFAULT 'user',
    `status` ENUM('active', 'suspended', 'pending') DEFAULT 'active',
    `remember_token` VARCHAR(100) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_users_email` (`email`),
    INDEX `idx_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. User Profiles Table
CREATE TABLE IF NOT EXISTS `profiles` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL UNIQUE,
    `avatar_url` VARCHAR(500) DEFAULT '',
    `age` INT NULL,
    `sex` ENUM('male', 'female', 'other') DEFAULT 'male',
    `height_cm` DECIMAL(5,2) NULL,
    `weight_kg` DECIMAL(5,2) NULL,
    `blood_type` ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown') DEFAULT 'Unknown',
    `emergency_contact_name` VARCHAR(150) DEFAULT '',
    `emergency_contact_phone` VARCHAR(50) DEFAULT '',
    `emergency_contact_relation` VARCHAR(80) DEFAULT '',
    `health_goals` TEXT NULL,
    `target_weight_kg` DECIMAL(5,2) DEFAULT 65.0,
    `target_water_ml` INT DEFAULT 2500,
    `target_steps` INT DEFAULT 10000,
    `target_sleep_hours` DECIMAL(3,1) DEFAULT 8.0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. BMI Records Table
CREATE TABLE IF NOT EXISTS `bmi_records` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `height_cm` DECIMAL(5,2) NOT NULL,
    `weight_kg` DECIMAL(5,2) NOT NULL,
    `bmi_value` DECIMAL(4,2) NOT NULL,
    `category` ENUM('Underweight', 'Normal', 'Overweight', 'Obese') NOT NULL,
    `bmr_value` DECIMAL(6,2) NULL,
    `body_fat_pct` DECIMAL(4,1) NULL,
    `waist_to_height` DECIMAL(4,2) NULL,
    `nutritional_status` VARCHAR(50) NULL,
    `recorded_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    INDEX `idx_bmi_user_date` (`user_id`, `recorded_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Blood Pressure Records Table
CREATE TABLE IF NOT EXISTS `blood_pressure_records` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `systolic` INT NOT NULL,
    `diastolic` INT NOT NULL,
    `pulse` INT NULL,
    `category` ENUM('Low Blood Pressure', 'Normal', 'Elevated', 'Hypertension Stage 1', 'Hypertension Stage 2', 'Hypertensive Crisis') NOT NULL,
    `notes` VARCHAR(255) NULL,
    `recorded_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    INDEX `idx_bp_user_date` (`user_id`, `recorded_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Heart Rate Records Table
CREATE TABLE IF NOT EXISTS `heart_rate_records` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `heart_rate` INT NOT NULL,
    `category` ENUM('Low', 'Normal', 'High') NOT NULL,
    `context` VARCHAR(80) DEFAULT 'Resting',
    `notes` VARCHAR(255) NULL,
    `recorded_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    INDEX `idx_hr_user_date` (`user_id`, `recorded_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Weight Records Table
CREATE TABLE IF NOT EXISTS `weight_records` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `weight_kg` DECIMAL(5,2) NOT NULL,
    `notes` VARCHAR(255) NULL,
    `recorded_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    INDEX `idx_weight_user_date` (`user_id`, `recorded_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Water Intake Records Table
CREATE TABLE IF NOT EXISTS `water_intake_records` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `amount_ml` INT NOT NULL,
    `glasses` INT DEFAULT 1,
    `recorded_date` DATE NOT NULL,
    `recorded_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    INDEX `idx_water_user_date` (`user_id`, `recorded_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Sleep Records Table
CREATE TABLE IF NOT EXISTS `sleep_records` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `sleep_hours` DECIMAL(3,1) NOT NULL,
    `sleep_quality` ENUM('Poor', 'Fair', 'Good', 'Excellent') DEFAULT 'Good',
    `bedtime` TIME NULL,
    `wake_time` TIME NULL,
    `notes` VARCHAR(255) NULL,
    `recorded_date` DATE NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    INDEX `idx_sleep_user_date` (`user_id`, `recorded_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. Physical Activity Records Table
CREATE TABLE IF NOT EXISTS `activity_records` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `activity_type` VARCHAR(80) DEFAULT 'Walking',
    `steps` INT DEFAULT 0,
    `active_minutes` INT DEFAULT 0,
    `calories_burned` INT DEFAULT 0,
    `recorded_date` DATE NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    INDEX `idx_activity_user_date` (`user_id`, `recorded_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. Health Risk Assessments Table
CREATE TABLE IF NOT EXISTS `health_risk_assessments` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `assessment_type` ENUM('Diabetes Risk', 'Heart Disease Risk', 'Hypertension Risk', 'Lifestyle Risk') NOT NULL,
    `risk_score` INT NOT NULL,
    `risk_level` ENUM('Low', 'Moderate', 'High') NOT NULL,
    `responses_json` TEXT NULL,
    `recommendations` TEXT NOT NULL,
    `assessed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    INDEX `idx_risk_user_type` (`user_id`, `assessment_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. Health Articles Table
CREATE TABLE IF NOT EXISTS `health_articles` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL UNIQUE,
    `category` ENUM('Nutrition', 'Exercise', 'Mental Wellness', 'First Aid', 'Healthy Lifestyle', 'Disease Prevention', 'Blood Pressure Information', 'BMI Information') NOT NULL,
    `description` TEXT NOT NULL,
    `content` LONGTEXT NOT NULL,
    `image_url` VARCHAR(500) DEFAULT '',
    `references_sources` TEXT NULL,
    `read_time_mins` INT DEFAULT 4,
    `author` VARCHAR(120) DEFAULT 'DigiPulse Medical Editorial Board',
    `is_published` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_articles_category` (`category`),
    INDEX `idx_articles_published` (`is_published`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 12. Daily Health Tips Table
CREATE TABLE IF NOT EXISTS `daily_tips` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `tip_text` TEXT NOT NULL,
    `category` VARCHAR(50) DEFAULT 'General',
    `icon` VARCHAR(50) DEFAULT 'heart-pulse',
    `day_of_year` INT NULL,
    `is_active` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 13. Notifications Table
CREATE TABLE IF NOT EXISTS `notifications` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `type` ENUM('Water', 'Exercise', 'Checkup', 'Sleep', 'Blood Pressure', 'System') NOT NULL,
    `title` VARCHAR(150) NOT NULL,
    `message` TEXT NOT NULL,
    `is_read` TINYINT(1) DEFAULT 0,
    `scheduled_time` TIME NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    INDEX `idx_notif_user_read` (`user_id`, `is_read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
