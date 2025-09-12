@echo off
echo 🚀 Setting up Linarqa School Management System
echo ==============================================

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not installed. Please install Docker first.
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose first.
    pause
    exit /b 1
)

echo 📦 Starting PostgreSQL database...
docker-compose up -d postgres

echo ⏳ Waiting for database to be ready...
timeout /t 10 /nobreak >nul

echo 🔧 Setting up backend...
cd backend

REM Check if Java is installed
java -version >nul 2>&1
if errorlevel 1 (
    echo ❌ Java is not installed. Please install Java 21 first.
    pause
    exit /b 1
)

echo 📦 Building backend...
call mvnw.cmd clean install -DskipTests

echo 🚀 Starting backend...
start "Backend" mvnw.cmd spring-boot:run

echo ⏳ Waiting for backend to start...
timeout /t 30 /nobreak >nul

echo 🔧 Setting up frontend...
cd ..\frontend

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

echo 📦 Installing frontend dependencies...
call npm install

echo 🚀 Starting frontend...
start "Frontend" npm run dev

echo.
echo ✅ Setup complete!
echo ==================
echo 🌐 Frontend: http://localhost:5173
echo 🔧 Backend: http://localhost:8080
echo 📊 API Docs: http://localhost:8080/swagger-ui.html
echo 🗄️  Database: localhost:5432
echo 📊 pgAdmin: http://localhost:5050 (admin@linarqa.com / admin123)
echo.
echo 🔐 Default credentials:
echo    Owner: admin@linarqa.com / admin123
echo    Staff: staff1@linarqa.com / staff123
echo.
echo Press any key to exit...
pause >nul 