import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { ModeProvider } from '@/contexts/ModeContext';
import Layout from '@/components/layout/Layout';
import LoginPage from '@/pages/auth/LoginPage';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import StudentsPage from '@/pages/students/StudentsPage';
import AttendancePage from '@/pages/attendance/AttendancePage';
import PaymentsPage from '@/pages/payments/PaymentsPage';
import BelongingsPage from '@/pages/belongings/BelongingsPage';
import PrintPage from '@/pages/belongings/PrintPage';
import ExtraCoursesPage from '@/pages/extra-courses/ExtraCoursesPage';
import EnrollmentsPage from '@/pages/enrollments/EnrollmentsPage';
import SettingsPage from '@/pages/settings/SettingsPage';
import ExtraStudentsPage from '@/pages/extra-students/ExtraStudentsPage';
import ExtraStudentRegistrationPage from '@/pages/extra-students/ExtraStudentRegistrationPage';
import ExtraPaymentsPage from '@/pages/extra-payments/ExtraPaymentsPage';
import PersonnelPage from '@/pages/personnel/PersonnelPage';
import MonthlyBalancePage from '@/pages/monthly-balance/MonthlyBalancePage';
import LogsPage from '@/pages/logs/LogsPage';
import PlaceholderPage from '@/pages/PlaceholderPage';
import i18n from '@/i18n';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

interface RoleRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user } = useAuth();
  return user ? <>{children}</> : <LoginPage />;
};

const RoleRoute: React.FC<RoleRouteProps> = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  return user && allowedRoles.includes(user.role) ? <>{children}</> : <LoginPage />;
};

const App = () => {
  const { currentLanguage } = useLanguage();

  useEffect(() => {
    // Set document direction and language
    document.documentElement.dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLanguage;
    
    // Ensure i18n is synced with the current language
    if (i18n.language !== currentLanguage) {
      i18n.changeLanguage(currentLanguage);
    }
  }, [currentLanguage]);

  return (
    <ModeProvider>
    <div className='min-h-screen bg-gray-50'>
      <Routes>
        <Route path='/login' element={<LoginPage />} />
        <Route
          path='/'
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path='dashboard' element={<DashboardPage />} />
          <Route path='students' element={<StudentsPage />} />
          <Route path='extra-students' element={<ExtraStudentsPage />} />
          <Route path='extra-students-register' element={<ExtraStudentRegistrationPage />} />
          <Route path='attendance' element={<AttendancePage />} />
          <Route path='belongings' element={<BelongingsPage />} />
          <Route path='belongings/print' element={<PrintPage />} />
          <Route path='payments' element={<PaymentsPage />} />
          <Route path='extra-payments' element={<ExtraPaymentsPage />} />
          <Route path='extra-courses' element={<ExtraCoursesPage />} />
          <Route path='enrollments' element={<EnrollmentsPage />} />
          <Route path='personnel' element={<PersonnelPage />} />
          <Route path='monthly-balance' element={<MonthlyBalancePage />} />
          <Route path='logs' element={<LogsPage />} />
          <Route path='settings' element={<SettingsPage />} />
          <Route
            path='staff'
            element={
              <RoleRoute allowedRoles={['OWNER']}>
                <PlaceholderPage 
                  title='Gestion du personnel' 
                  subtitle='Gestion des membres du personnel' 
                />
              </RoleRoute>
            }
          />
          <Route
            path='audit'
            element={
              <RoleRoute allowedRoles={['OWNER']}>
                <PlaceholderPage 
                    title={'Journal d\'audit'}
                    subtitle='Historique des activités' 
                />
              </RoleRoute>
            }
          />
        </Route>
      </Routes>
      <Toaster />
    </div>
    </ModeProvider>
  );
};

export default App;
