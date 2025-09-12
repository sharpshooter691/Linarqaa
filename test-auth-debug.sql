-- Test authentication and user roles
-- Check if admin users exist and have correct roles

-- 1. Check all users and their roles
SELECT 'All users and their roles:' as info;
SELECT id, email, first_name, last_name, role, created_at 
FROM users 
ORDER BY created_at DESC;

-- 2. Check specifically for admin users
SELECT 'Admin users (OWNER role):' as info;
SELECT id, email, first_name, last_name, role 
FROM users 
WHERE role = 'OWNER';

-- 3. Check if there are any notifications
SELECT 'All notifications:' as info;
SELECT id, title, type, target_user_id, is_read, created_at 
FROM notifications 
ORDER BY created_at DESC 
LIMIT 10;

-- 4. Check notifications for admin users specifically
SELECT 'Notifications for admin users:' as info;
SELECT n.id, n.title, n.type, n.target_user_id, u.email as target_email, n.is_read, n.created_at
FROM notifications n
LEFT JOIN users u ON n.target_user_id = u.id
WHERE u.role = 'OWNER'
ORDER BY n.created_at DESC;

-- 5. Create a test admin user if none exists
SELECT 'Creating test admin user if needed...' as info;
INSERT IGNORE INTO users (
    id, email, password, first_name, last_name, role, created_at, updated_at
) VALUES (
    UUID(), 'admin@test.com', '$2a$10$test', 'Test', 'Admin', 'OWNER', NOW(), NOW()
);

-- 6. Create a test notification for the admin user
SELECT 'Creating test notification for admin...' as info;
INSERT INTO notifications (
    id, title, title_arabic, message, message_arabic, type, status, 
    target_user_id, is_read, created_at, updated_at
) VALUES (
    UUID(), 'Test Admin Notification', 'إشعار تجريبي للمدير', 
    'This is a test notification for admin users.', 
    'هذا إشعار تجريبي للمستخدمين المديرين.', 
    'GENERAL', 'UNREAD', 
    (SELECT id FROM users WHERE role = 'OWNER' LIMIT 1), 
    FALSE, NOW(), NOW()
);

-- 7. Verify the test notification was created
SELECT 'Test notification created:' as info;
SELECT n.id, n.title, n.type, n.target_user_id, u.email as target_email, n.is_read, n.created_at
FROM notifications n
LEFT JOIN users u ON n.target_user_id = u.id
WHERE n.title = 'Test Admin Notification'
ORDER BY n.created_at DESC
LIMIT 1;
