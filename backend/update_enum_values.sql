-- MySQL script to add missing enum values to student_level column
-- Run this script manually in your MySQL database

-- First, let's see what the current enum values are
SELECT COLUMN_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'linarqa' 
AND TABLE_NAME = 'students' 
AND COLUMN_NAME = 'level';

-- To add new enum values in MySQL, we need to modify the column definition
-- This will add all the Moroccan education levels to the existing enum

ALTER TABLE students 
MODIFY COLUMN level ENUM(
    'PETITE', 'MOYENNE', 'GRANDE',
    'CP1', 'CP2', 'CP3', 'CP4', 'CP5', 'CP6',
    'AC1', 'AC2', 'AC3',
    'TRONC_COMMUN', 'BAC1', 'BAC2'
) NOT NULL;

-- Also add the student_type column if it doesn't exist
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS student_type ENUM('KINDERGARTEN', 'EXTRA_COURSE') 
NOT NULL DEFAULT 'KINDERGARTEN';

-- Verify the changes
SELECT COLUMN_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'linarqa' 
AND TABLE_NAME = 'students' 
AND COLUMN_NAME = 'level'; 