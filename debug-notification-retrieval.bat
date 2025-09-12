@echo off
echo ========================================
echo Debug Notification Retrieval Issues
echo ========================================
echo.

echo 1. Check database for notifications:
echo    mysql -u root -p linarqa ^< test-notification-debug.sql
echo.

echo 2. Start backend with debug logging:
echo    cd backend
echo    mvn spring-boot:run
echo.
echo    Look for these debug messages in the console:
echo    - "🔔 NotificationController.getUnreadAdminNotifications() called"
echo    - "📋 Found X unread admin notifications"
echo    - "🔍 SecurityUtils.getCurrentUser() - Authentication:"
echo    - "✅ Found user: [name] (Role: OWNER)"
echo.

echo 3. Test the API endpoints directly:
echo    curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:8080/api/notifications/admin/unread
echo.

echo 4. Check browser console for errors:
echo    - Open Developer Tools (F12)
echo    - Go to Console tab
echo    - Look for any error messages
echo.

echo 5. Check Network tab:
echo    - Go to Network tab in Developer Tools
echo    - Refresh the page
echo    - Look for requests to /api/notifications/admin/unread
echo    - Check the response status and data
echo.

echo ========================================
echo Common Issues and Solutions:
echo ========================================
echo.

echo Issue 1: "Failed to fetch notifications: AxiosError"
echo Solution: Backend server is not running
echo Fix: Start backend with "mvn spring-boot:run"
echo.

echo Issue 2: "403 Forbidden" error
echo Solution: Authentication issue
echo Fix: Check if JWT token is valid and user is logged in
echo.

echo Issue 3: Empty notifications array
echo Solution: No notifications in database for admin user
echo Fix: Create test notifications or perform actions that trigger notifications
echo.

echo Issue 4: Notifications exist but not showing
echo Solution: Frontend using wrong endpoint
echo Fix: Updated TopBar.tsx to use admin endpoints for admin users
echo.

echo ========================================
echo Testing Steps:
echo ========================================
echo.

echo 1. Login as admin user
echo 2. Check browser console for debug messages
echo 3. Check if notifications API is being called
echo 4. Verify database has notifications for admin user
echo 5. Test creating a new student/payment to trigger notifications
echo.

echo ========================================
echo Ready to debug!
echo ========================================
pause
