# Linarqa - School Management System

A comprehensive school management system designed for French/Arabic speaking communities, featuring role-based access control for owners and staff.

## 🌟 Features

- **Bilingual Support**: French (default) and Arabic with RTL layout support
- **Role-Based Access**: Owner (full access) and Staff (limited access) interfaces
- **Student Management**: Complete student lifecycle with attendance tracking
- **Financial Management**: Tuition and extra course payments
- **Belongings Tracking**: Check-in/out system for student items
- **Analytics Dashboard**: Revenue tracking, attendance rates, and capacity utilization
- **Modern UI**: Built with React 18, TypeScript, and shadcn/ui components

## 🏗️ Architecture

```
linarqa/
├── frontend/          # React 18 + Vite + TypeScript
├── backend/           # Spring Boot 3.3.x + Java 21
└── database/          # PostgreSQL + Flyway migrations
```

## 🚀 Quick Start

### Prerequisites

- **Java 21** (for backend)
- **Node.js 18+** (for frontend)
- **Docker** (for PostgreSQL)
- **Git**

### 1. Clone and Setup

```bash
git clone <repository-url>
cd linarqa
```

### 2. Start Database

```bash
# Start PostgreSQL with Docker
docker run --name linarqa-postgres \
  -e POSTGRES_DB=linarqa \
  -e POSTGRES_USER=linarqa_user \
  -e POSTGRES_PASSWORD=linarqa_pass \
  -p 5432:5432 \
  -d postgres:15
```

### 3. Backend Setup

```bash
cd backend

# Build and run (requires Java 21)
./mvnw clean install
./mvnw spring-boot:run
```

Backend will be available at: http://localhost:8080
API Documentation: http://localhost:8080/swagger-ui.html

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be available at: http://localhost:5173

## 🔐 Default Credentials

### Owner Account
- **Email**: admin@linarqa.com
- **Password**: admin123

### Staff Accounts
- **Email**: staff1@linarqa.com
- **Password**: staff123
- **Email**: staff2@linarqa.com
- **Password**: staff123

## 🌍 Localization

The application supports two languages:
- **French (fr)**: Default language
- **Arabic (ar)**: RTL layout with proper text direction

Language can be switched using the toggle in the top navigation bar.

## 📊 Sample Data

The system comes pre-loaded with:
- 6 students (2 per level: Petite, Moyenne, Grande)
- 2 extra courses (Art Club, Coding Kids)
- Sample attendance records
- Payment history
- Belongings tracking examples

## 🛠️ Development

### Backend Development

```bash
cd backend

# Run tests
./mvnw test

# Run with hot reload
./mvnw spring-boot:run -Dspring-boot.run.jvmArguments="-Dspring.profiles.active=dev"
```

### Frontend Development

```bash
cd frontend

# Run tests
npm test

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

### Frontend (`/frontend`)
- **React 18** with TypeScript
- **Vite** for build tooling
- **TailwindCSS** + **shadcn/ui** for styling
- **React Router v6** for navigation
- **TanStack Query** for data fetching
- **Zustand** for state management
- **React Hook Form** + **Zod** for forms
- **i18next** for internationalization

### Backend (`/backend`)
- **Spring Boot 3.3.x** with Java 21
- **Spring Security** with JWT authentication
- **Spring Data JPA** for database operations
- **PostgreSQL** with Flyway migrations
- **MapStruct** for object mapping
- **OpenAPI** documentation

### Database (`/database`)
- **PostgreSQL** schema
- **Flyway** migration scripts
- Sample data seeding

## 🔒 Security

- JWT-based authentication with httpOnly cookies
- Role-based access control (OWNER/STAFF)
- BCrypt password hashing
- CORS configuration for development
- Input validation and sanitization

## 📈 Analytics & Reporting

### Owner Dashboard
- Monthly revenue tracking
- Payment status breakdown
- Attendance rates by level
- Overdue invoices monitoring
- Extra course capacity utilization

### Export Features
- Attendance CSV export
- Payment receipts
- Student reports

## 🐳 Docker Support

### Database Only
```bash
docker run --name linarqa-postgres \
  -e POSTGRES_DB=linarqa \
  -e POSTGRES_USER=linarqa_user \
  -e POSTGRES_PASSWORD=linarqa_pass \
  -p 5432:5432 \
  -d postgres:15
```

### Full Stack (Coming Soon)
```bash
docker-compose up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team

---

**Linarqa** - Empowering educational institutions with modern management tools. 