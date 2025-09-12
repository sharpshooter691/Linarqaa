-- Debug notification system
-- Check if notifications table exists and has data

-- 1. Check if notifications table exists
SELECT 'Checking notifications table...' as info;
SHOW TABLES LIKE 'notifications';

-- 2. Check table structure
SELECT 'Table structure:' as info;
DESCRIBE notifications;

-- 3. Check if there are any notifications
SELECT 'Total notifications count:' as info;
SELECT COUNT(*) as total_notifications FROM notifications;

-- 4. Check notification types
SELECT 'Notification types in database:' as info;
SELECT DISTINCT type FROM notifications;

-- 5. Check admin users
SELECT 'Admin users:' as info;
SELECT id, email, role FROM users WHERE role = 'OWNER';

-- 6. Check notifications for admin users
SELECT 'Notifications for admin users:' as info;
SELECT n.id, n.title, n.type, n.target_user_id, u.email as target_email, n.is_read, n.created_at
FROM notifications n
LEFT JOIN users u ON n.target_user_id = u.id
WHERE u.role = 'OWNER'
ORDER BY n.created_at DESC
LIMIT 5;

-- 7. Create a test notification for admin
SELECT 'Creating test notification...' as info;
INSERT INTO notifications (
    id, title, title_arabic, message, message_arabic, type, status, 
    target_user_id, is_read, created_at, updated_at
) VALUES (
    UUID(), 'Test Notification', 'إشعار تجريبي', 
    'This is a test notification to verify the system is working.', 
    'هذا إشعار تجريبي للتحقق من عمل النظام.', 
    'GENERAL', 'UNREAD', 
    (SELECT id FROM users WHERE role = 'OWNER' LIMIT 1), 
    FALSE, NOW(), NOW()
);

-- 8. Verify the test notification was created
SELECT 'Test notification created:' as info;
SELECT n.id, n.title, n.type, n.target_user_id, u.email as target_email, n.is_read, n.created_at
FROM notifications n
LEFT JOIN users u ON n.target_user_id = u.id
WHERE n.title = 'Test Notification'
ORDER BY n.created_at DESC
LIMIT 1;
