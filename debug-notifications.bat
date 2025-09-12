@echo off
echo Debugging Notification System...
echo.

echo 1. Checking if notifications table exists...
echo Please run this SQL query in your MySQL database:
echo.
echo SHOW TABLES LIKE 'notifications';
echo.
echo If the table doesn't exist, run:
echo.
echo DESCRIBE notifications;
echo.
echo.

echo 2. Checking if admin users exist...
echo Please run this SQL query:
echo.
echo SELECT id, email, full_name, role FROM users WHERE role = 'OWNER';
echo.
echo.

echo 3. Starting backend with debug logging...
cd Linarqaa\backend
echo Starting backend server with debug output...
start "Backend Debug" cmd /k "mvn spring-boot:run"
timeout /t 5 /nobreak > nul

echo.
echo 4. Backend started! Now:
echo - Try to register a new student or create a payment
echo - Check the backend console for debug messages
echo - Look for messages starting with 🔔, 👥, 📧, ✅, or ❌
echo.
echo 5. If you see "No admin users found", run this SQL:
echo.
echo INSERT INTO users (id, email, password_hash, full_name, role, active) VALUES
echo ('550e8400-e29b-41d4-a716-446655440001', 'admin@linarqa.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa', 'Admin User', 'OWNER', true);
echo.
echo Press any key to close this window...
pause > nul
