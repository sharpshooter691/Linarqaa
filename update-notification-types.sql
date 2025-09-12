-- Update notification types to include payment marked as paid notifications
-- Run this if you already have the notifications table

-- First, check if the constraint exists and drop it
SET @constraint_name = (SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
                       WHERE TABLE_NAME = 'notifications' 
                       AND CONSTRAINT_TYPE = 'CHECK' 
                       AND CONSTRAINT_NAME = 'chk_notification_type');

SET @sql = IF(@constraint_name IS NOT NULL, 
              CONCAT('ALTER TABLE notifications DROP CONSTRAINT ', @constraint_name), 
              'SELECT "Constraint does not exist" as message');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add the updated constraint with new notification types
ALTER TABLE notifications 
ADD CONSTRAINT chk_notification_type 
CHECK (type IN ('STUDENT_REGISTERED', 'EXTRA_STUDENT_REGISTERED', 'PAYMENT_CREATED', 'EXTRA_PAYMENT_CREATED', 'PAYMENT_MARKED_PAID', 'EXTRA_PAYMENT_MARKED_PAID', 'SYSTEM_ALERT', 'GENERAL'));

-- Test creating a payment marked as paid notification
INSERT INTO notifications (
    id, title, title_arabic, message, message_arabic, type, status, 
    target_user_id, is_read, created_at, updated_at
) VALUES (
    UUID(), 'Payment Marked as Paid', 'تم تحديد الدفعة كمقبوضة', 
    'Payment of 500.00 for student "Test Student" has been marked as paid by staff.', 
    'تم تحديد دفعة بقيمة 500.00 للطالب "طالب تجريبي" كمقبوضة من قبل الموظفين.', 
    'PAYMENT_MARKED_PAID', 'UNREAD', 
    (SELECT id FROM users WHERE role = 'OWNER' LIMIT 1), 
    FALSE, NOW(), NOW()
);

-- Check if the notification was created successfully
SELECT 'Payment marked as paid notification created:' as info;
SELECT * FROM notifications WHERE type = 'PAYMENT_MARKED_PAID' ORDER BY created_at DESC LIMIT 1;

SELECT 'Notification types updated successfully!' as message;
