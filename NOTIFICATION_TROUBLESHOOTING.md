# Notification System Troubleshooting Guide

## Problem: Notifications Not Being Saved

If you perform actions (register students, create payments) but no notifications appear, follow these steps:

### Step 1: Check Database Table

**Problem**: The notifications table might not exist.

**Solution**: Run this SQL query in your MySQL database:
```sql
SHOW TABLES LIKE 'notifications';
```

If the table doesn't exist, run the SQL script:
```bash
# Run this file in your MySQL database
mysql -u root -p linarqa < create-notifications-table.sql
```

### Step 2: Check Admin Users

**Problem**: No admin users exist to receive notifications.

**Solution**: Check if admin users exist:
```sql
SELECT id, email, full_name, role FROM users WHERE role = 'OWNER';
```

If no admin users exist, create one:
```sql
INSERT INTO users (id, email, password_hash, full_name, role, active) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'admin@linarqa.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa', 'Admin User', 'OWNER', true);
```

### Step 3: Check Backend Debug Output

**Problem**: Notification creation is failing silently.

**Solution**: 
1. Start the backend server
2. Perform an action (register student, create payment)
3. Check the backend console for debug messages:
   - 🔔 Creating student registration notification
   - 👥 Found X admin users
   - 📧 Sending notification to admin
   - ✅ Notification saved with ID
   - ❌ Failed to save notification (with error details)

### Step 4: Test Manual Notification Creation

**Problem**: The notification service might have issues.

**Solution**: Create a test notification manually:
```sql
-- Run this in MySQL
INSERT INTO notifications (
    id, title, title_arabic, message, message_arabic, type, status, 
    target_user_id, is_read, created_at, updated_at
) VALUES (
    UUID(), 'Test Notification', 'إشعار تجريبي', 
    'This is a test notification.', 'هذا إشعار تجريبي.', 
    'GENERAL', 'UNREAD', 
    (SELECT id FROM users WHERE role = 'OWNER' LIMIT 1), 
    FALSE, NOW(), NOW()
);
```

### Step 5: Check Authentication

**Problem**: User context is not being extracted properly.

**Solution**: Check the backend console for SecurityUtils debug messages:
- 🔍 SecurityUtils.getCurrentUser() - Authentication: [email]
- 👤 Looking up user with email: [email]
- ✅ Found user: [name] (Role: [role])
- ❌ User not found with email: [email]

### Step 6: Check Frontend API Calls

**Problem**: Frontend is not calling the notification API correctly.

**Solution**: 
1. Open browser developer tools (F12)
2. Go to Network tab
3. Perform an action that should create a notification
4. Check if the API call to `/api/notifications/unread` is made
5. Check if the response contains notifications

### Step 7: Verify Database Migration

**Problem**: The V10 migration might not have run.

**Solution**: Check if the migration was applied:
```sql
-- Check migration history (if using Flyway)
SELECT * FROM flyway_schema_history WHERE script = 'V10__Create_notifications_table.sql';
```

If the migration didn't run, manually create the table using `create-notifications-table.sql`.

## Common Error Messages and Solutions

### "Required request header 'X-User-Id' for method parameter type String is not present"
**Solution**: This should be fixed now. The system uses JWT authentication instead of headers.

### "No admin users found! Cannot send notification."
**Solution**: Create an admin user using the SQL above.

### "Failed to save notification: [error]"
**Solution**: Check the database table structure and constraints.

### "User not found with email: [email]"
**Solution**: Check if the user exists in the database and if the JWT token is valid.

## Testing Steps

1. **Run the debug script**: `debug-notifications.bat`
2. **Check database**: Run the SQL queries above
3. **Test manually**: Use the manual SQL test
4. **Check logs**: Look for debug messages in backend console
5. **Test frontend**: Check browser network tab for API calls

## Quick Fix Commands

```bash
# 1. Create notifications table
mysql -u root -p linarqa < create-notifications-table.sql

# 2. Test manual notification
mysql -u root -p linarqa < test-notification-manual.sql

# 3. Start backend with debug
cd Linarqaa/backend && mvn spring-boot:run

# 4. Check logs for debug messages
# Look for 🔔, 👥, 📧, ✅, ❌ emojis in console output
```

## Expected Behavior

When working correctly:
1. Staff member registers a student → Backend creates notification → Admin sees notification in top bar
2. Debug messages show: 🔔 → 👥 → 📧 → ✅
3. Frontend fetches notifications and displays them
4. Admin can mark notifications as read

If any step fails, check the corresponding section above.
