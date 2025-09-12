# Linarqa Frontend

React-based frontend for the Linarqa School Management System.

## Features

- **React 18** with TypeScript
- **Vite** for fast development and building
- **TailwindCSS** + **shadcn/ui** for styling
- **React Router v6** for navigation
- **TanStack Query** for data fetching
- **Zustand** for state management
- **React Hook Form** + **Zod** for forms
- **i18next** for internationalization (French/Arabic)
- **Recharts** for data visualization

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Start development server:
```bash
npm run dev
```

The application will be available at http://localhost:5173

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

## Project Structure

```
src/
├── components/     # Reusable UI components
├── hooks/         # Custom React hooks
├── lib/           # Utility functions and API client
├── pages/         # Page components
├── i18n/          # Internationalization files
└── types/         # TypeScript type definitions
```

## Internationalization

The application supports French (default) and Arabic with RTL layout support. Language can be switched using the toggle in the top navigation bar.

## API Integration

The frontend communicates with the Spring Boot backend API. Make sure the backend is running on http://localhost:8080 before starting the frontend. 