-- MySQL Setup Script for Linarqa
-- Run this script in Laragon's MySQL (phpMyAdmin or HeidiSQL)

-- Create database
CREATE DATABASE IF NOT EXISTS linarqa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the database
USE linarqa;

-- Verify the database is ready
SELECT 'Database linarqa is ready for Linarqa application!' as status; 