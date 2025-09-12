# Linarqa Setup Guide (MySQL with Laragon)

## Prerequisites

1. **Java 21** - Download from [Oracle](https://www.oracle.com/java/technologies/downloads/) or [OpenJDK](https://adoptium.net/)
2. **Node.js 18+** - Download from [nodejs.org](https://nodejs.org/)
3. **Laragon** - Download from [laragon.org](https://laragon.org/) (includes MySQL)

## Database Setup with Laragon

### 1. Install Laragon
- Download and install Laragon from [laragon.org](https://laragon.org/)
- Laragon includes MySQL, Apache, and other development tools
- Default MySQL port: 3306

### 2. Start Laragon Services
- Open Laragon
- Click "Start All" to start MySQL and other services
- Or click "MySQL" to start only MySQL

### 3. Create Database
You can create the database using:
- **phpMyAdmin**: http://localhost/phpmyadmin
- **HeidiSQL**: Included with Laragon
- **MySQL Command Line**: Through Laragon's terminal

Using phpMyAdmin:
1. Go to http://localhost/phpmyadmin
2. Click "New" to create a new database
3. Enter "linarqa" as database name
4. Select "utf8mb4_unicode_ci" as collation
5. Click "Create"

Or run the setup script:
```sql
-- In phpMyAdmin SQL tab or HeidiSQL
CREATE DATABASE IF NOT EXISTS linarqa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Update Configuration (if needed)
If your MySQL password is different from empty, update `backend/src/main/resources/application.yml`:
```yaml
spring:
  datasource:
    username: root
    password: your_actual_password
```

## Backend Setup

### 1. Navigate to backend directory
```bash
cd backend
```

### 2. Build the project
```bash
# Windows
mvnw.cmd clean install

# Unix/Mac
./mvnw clean install
```

### 3. Run the backend
```bash
# Windows
mvnw.cmd spring-boot:run

# Unix/Mac
./mvnw spring-boot:run
```

The backend will be available at: http://localhost:8080
API Documentation: http://localhost:8080/swagger-ui.html

## Frontend Setup

### 1. Navigate to frontend directory
```bash
cd frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run the frontend
```bash
npm run dev
```

The frontend will be available at: http://localhost:5173

## Quick Start Script

### Windows
```bash
# Start backend
cd backend
start mvnw.cmd spring-boot:run

# Start frontend (in new terminal)
cd frontend
npm install
npm run dev
```

### Unix/Mac
```bash
# Start backend
cd backend
./mvnw spring-boot:run &

# Start frontend
cd frontend
npm install
npm run dev
```

## Default Credentials

- **Owner**: admin@linarqa.com / admin123
- **Staff**: staff1@linarqa.com / staff123

## Troubleshooting

### Database Connection Issues
- Ensure Laragon is running and MySQL is started
- Check if port 3306 is available
- Verify username/password in application.yml
- Make sure database 'linarqa' exists
- Try accessing phpMyAdmin at http://localhost/phpmyadmin

### Java Issues
- Ensure Java 21 is installed and in PATH
- Check with: `java --version`

### Node.js Issues
- Ensure Node.js 18+ is installed
- Check with: `node --version`

### Port Conflicts
- Backend: Change port in `application.yml` if 8080 is busy
- Frontend: Change port in `vite.config.ts` if 5173 is busy
- Database: Change port in Laragon if 3306 is busy

## Development URLs

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:8080
- **API Docs**: http://localhost:8080/swagger-ui.html
- **phpMyAdmin**: http://localhost/phpmyadmin
- **Database**: localhost:3306 (via Laragon) 