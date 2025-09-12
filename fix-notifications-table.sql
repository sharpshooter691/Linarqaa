-- Fix the notifications table column size issue
-- Run this if you're getting "Data truncated for column 'status'" error

-- First, check the current table structure
SELECT 'Current table structure:' as info;
DESCRIBE notifications;

-- Fix the status column size
ALTER TABLE notifications MODIFY COLUMN status VARCHAR(50) NOT NULL DEFAULT 'UNREAD';

-- Also fix the type column to be safe
ALTER TABLE notifications MODIFY COLUMN type VARCHAR(50) NOT NULL;

-- Verify the changes
SELECT 'Updated table structure:' as info;
DESCRIBE notifications;

-- Test creating a notification
INSERT INTO notifications (
    id, title, title_arabic, message, message_arabic, type, status, 
    target_user_id, is_read, created_at, updated_at
) VALUES (
    UUID(), 'Test Notification', 'إشعار تجريبي', 
    'This is a test notification after fixing the column size.', 
    'هذا إشعار تجريبي بعد إصلاح حجم العمود.', 
    'STUDENT_REGISTERED', 'UNREAD', 
    (SELECT id FROM users WHERE role = 'OWNER' LIMIT 1), 
    FALSE, NOW(), NOW()
);

-- Check if the notification was created successfully
SELECT 'Test notification created:' as info;
SELECT * FROM notifications ORDER BY created_at DESC LIMIT 1;

SELECT 'Fix completed successfully!' as message;
