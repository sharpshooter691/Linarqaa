-- Create the linarqa database
CREATE DATABASE IF NOT EXISTS linarqa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the database
USE linarqa;

-- Create a test user for login
-- Password is 'password123' encrypted with BCrypt
INSERT INTO users (id, email, password_hash, full_name, full_name_arabic, phone, role, language_preference, active, created_at, updated_at) 
VALUES (
    UUID(),
    'admin@linarqa.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.',
    'Admin User',
    'مدير النظام',
    '+1234567890',
    'OWNER',
    'FR',
    true,
    NOW(),
    NOW()
) ON DUPLICATE KEY UPDATE updated_at = NOW(); 