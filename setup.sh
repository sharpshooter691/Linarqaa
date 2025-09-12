#!/bin/bash

echo "🚀 Setting up Linarqa School Management System"
echo "=============================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "📦 Starting PostgreSQL database..."
docker-compose up -d postgres

echo "⏳ Waiting for database to be ready..."
sleep 10

echo "🔧 Setting up backend..."
cd backend

# Check if Java is installed
if ! command -v java &> /dev/null; then
    echo "❌ Java is not installed. Please install Java 21 first."
    exit 1
fi

echo "📦 Building backend..."
./mvnw clean install -DskipTests

echo "🚀 Starting backend..."
./mvnw spring-boot:run &
BACKEND_PID=$!

echo "⏳ Waiting for backend to start..."
sleep 30

echo "🔧 Setting up frontend..."
cd ../frontend

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "📦 Installing frontend dependencies..."
npm install

echo "🚀 Starting frontend..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Setup complete!"
echo "=================="
echo "🌐 Frontend: http://localhost:5173"
echo "🔧 Backend: http://localhost:8080"
echo "📊 API Docs: http://localhost:8080/swagger-ui.html"
echo "🗄️  Database: localhost:5432"
echo "📊 pgAdmin: http://localhost:5050 (admin@linarqa.com / admin123)"
echo ""
echo "🔐 Default credentials:"
echo "   Owner: admin@linarqa.com / admin123"
echo "   Staff: staff1@linarqa.com / staff123"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user to stop
trap "echo '🛑 Stopping services...'; kill $BACKEND_PID $FRONTEND_PID; docker-compose down; exit" INT
wait 