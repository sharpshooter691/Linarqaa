
-- Manual test to create a notification
-- Run this after creating the notifications table

-- First, check if we have admin users
SELECT 'Admin users:' as info;
SELECT id, email, full_name, role FROM users WHERE role = 'OWNER';

-- Create a test notification manually
INSERT INTO notifications (
    id, 
    title, 
    title_arabic, 
    message, 
    message_arabic, 
    type, 
    status, 
    target_user_id, 
    is_read, 
    created_at, 
    updated_at
) VALUES (
    UUID(), 
    'Test Notification', 
    'إشعار تجريبي', 
    'This is a test notification to verify the system works.', 
    'هذا إشعار تجريبي للتحقق من عمل النظام.', 
    'GENERAL', 
    'UNREAD', 
    (SELECT id FROM users WHERE role = 'OWNER' LIMIT 1), 
    FALSE, 
    NOW(), 
    NOW()
);

-- Check if the notification was created
SELECT 'Test notification created:' as info;
SELECT * FROM notifications ORDER BY created_at DESC LIMIT 1;

-- Count total notifications
SELECT 'Total notifications:' as info, COUNT(*) as count FROM notifications;
