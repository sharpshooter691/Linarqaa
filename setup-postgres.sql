-- PostgreSQL Setup Script for Linarqa
-- Run this script as a PostgreSQL superuser (postgres)

-- Create database
CREATE DATABASE linarqa;

-- Create user (optional - you can use the default postgres user)
-- CREATE USER linarqa_user WITH PASSWORD 'linarqa_pass';

-- Grant privileges (if using custom user)
-- GRANT ALL PRIVILEGES ON DATABASE linarqa TO linarqa_user;

-- Connect to the database
\c linarqa;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Verify the database is ready
SELECT 'Database linarqa is ready for Linarqa application!' as status; 