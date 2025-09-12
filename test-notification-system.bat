@echo off
echo Testing Notification System...
echo.

echo IMPORTANT: If notifications are not working, run debug-notifications.bat first!
echo.

echo 1. Starting backend server...
cd Linarqaa\backend
start "Backend Server" cmd /k "mvn spring-boot:run"
timeout /t 10 /nobreak > nul

echo 2. Starting frontend server...
cd ..\frontend
start "Frontend Server" cmd /k "npm run dev"
timeout /t 5 /nobreak > nul

echo.
echo Notification System Test Setup Complete!
echo.
echo Backend server is running on: http://localhost:8080
echo Frontend server is running on: http://localhost:5173
echo.
echo To test the notification system:
echo 1. Open http://localhost:5173 in your browser
echo 2. Login as a staff member (staff@linarqa.com / password123)
echo 3. Register a new student or create a payment
echo 4. Check the notification bell icon in the top bar
echo 5. Admin users should receive notifications
echo.
echo DEBUGGING STEPS:
echo - Check backend console for debug messages (🔔, 👥, 📧, ✅, ❌)
echo - If you see "No admin users found", run create-notifications-table.sql
echo - If table doesn't exist, run the SQL scripts in the root directory
echo.
echo FIXED: Removed X-User-Id header requirement
echo - Backend now extracts user ID from JWT token automatically
echo - Frontend no longer needs to send X-User-Id header
echo - More secure and simpler implementation
echo.
echo Press any key to close this window...
pause > nul
