@echo off
echo ========================================
echo    Linarqa School Management System
echo ========================================
echo.

echo Checking prerequisites...
echo.

REM Check if Java is installed
java --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Java is not installed or not in PATH
    echo Please install Java 21 from: https://adoptium.net/
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

REM Check if MySQL is running
netstat -an | findstr ":3306" >nul
if %errorlevel% neq 0 (
    echo WARNING: MySQL is not running on port 3306
    echo Please start Laragon and ensure MySQL is running
    echo You can access phpMyAdmin at: http://localhost/phpmyadmin
    echo.
    echo To create the database:
    echo 1. Go to http://localhost/phpmyadmin
    echo 2. Click "New" 
    echo 3. Enter "linarqa" as database name
    echo 4. Select "utf8mb4_unicode_ci" as collation
    echo 5. Click "Create"
    echo.
    pause
)

echo Prerequisites check completed!
echo.

echo Starting Linarqa application...
echo.

REM Set JAVA_HOME
set JAVA_HOME=C:\Program Files\Java\jdk-23

REM Start backend
echo Starting Backend...
cd backend
start "Linarqa Backend" cmd /k "mvnw.cmd spring-boot:run"
cd ..

REM Wait a moment for backend to start
timeout /t 5 /nobreak >nul

REM Start frontend
echo Starting Frontend...
cd frontend
start "Linarqa Frontend" cmd /k "npm run dev"
cd ..

echo.
echo ========================================
echo    Linarqa is starting up...
echo ========================================
echo.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:8080
echo API Docs: http://localhost:8080/swagger-ui.html
echo phpMyAdmin: http://localhost/phpmyadmin
echo.
echo Default credentials:
echo - Owner: admin@linarqa.com / admin123
echo - Staff: staff1@linarqa.com / staff123
echo.
echo Press any key to exit...
pause >nul 