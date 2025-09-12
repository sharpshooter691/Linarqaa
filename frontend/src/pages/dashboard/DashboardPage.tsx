import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMode } from '@/contexts/ModeContext';
import { useTranslation } from 'react-i18next';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';
import { 
  Users, 
  UserCheck, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  BookOpen, 
  GraduationCap,
  Activity,
  Sun,
  Moon,
  ArrowRight,
  Plus,
  CheckCircle
} from 'lucide-react';

interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  todayAttendance: number;
  pendingPayments: number;
  recentEnrollments: number;
}

interface RecentActivity {
  type: 'enrollment' | 'payment' | 'attendance' | 'belonging' | 'course';
  message: string;
  time: string;
  icon: string;
}

const DashboardWidget = ({ title, value, subtitle, icon: IconComponent, color, mode, trend }: {
  title: string;
  value: number | string;
  subtitle: string;
  icon: React.ComponentType<any>;
  color: string;
  mode: 'kindergarten' | 'extra-courses';
  trend?: { value: number; isPositive: boolean };
}) => (
  <motion.div 
    className="relative overflow-hidden rounded-2xl shadow-lg border transition-all duration-300"
    style={{
      backgroundColor: 'var(--mode-card)',
      borderColor: 'var(--mode-border)',
      boxShadow: `0 10px 25px var(--mode-shadow)`,
    }}
    whileHover={{ scale: 1.02, y: -4 }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    {/* Background gradient overlay */}
    <div 
      className="absolute inset-0 opacity-5"
      style={{
        background: `linear-gradient(to bottom right, var(--mode-primary), var(--mode-secondary))`,
      }}
    ></div>
    
    <div className='relative p-6'>
      <div className='flex items-center justify-between mb-4'>
        <div 
          className="p-3 rounded-xl"
          style={{ backgroundColor: 'var(--mode-primary)20' }}
        >
          <IconComponent 
            className="h-6 w-6" 
            style={{ color: 'var(--mode-primary)' }}
          />
        </div>
        {trend && (
          <div 
            className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium"
            style={{
              backgroundColor: trend.isPositive ? 'var(--mode-primary)20' : '#ef444420',
              color: trend.isPositive ? 'var(--mode-primary)' : '#ef4444',
            }}
          >
            <TrendingUp className={`h-3 w-3 ${trend.isPositive ? '' : 'rotate-180'}`} />
            <span>{trend.value}%</span>
          </div>
        )}
      </div>
      
      <div>
        <p 
          className="text-sm font-medium transition-colors duration-300"
          style={{ color: 'var(--mode-textSecondary)' }}
        >{title}</p>
        <p 
          className="text-3xl font-bold transition-colors duration-300 mt-1"
          style={{ color: 'var(--mode-text)' }}
        >{value}</p>
        <p 
          className="text-sm transition-colors duration-300 mt-1"
          style={{ color: 'var(--mode-textSecondary)' }}
        >{subtitle}</p>
      </div>
    </div>
  </motion.div>
);

const DashboardPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { mode } = useMode();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch students
      const studentsResponse = await api.get('/students');
      const students = studentsResponse.data;
      
      // Fetch payments
      const paymentsResponse = await api.get('/payments');
      const payments = paymentsResponse.data;
      
      // Calculate stats
      const totalStudents = students.length;
      const activeStudents = students.filter((s: any) => s.status === 'ACTIVE').length;
      const pendingPayments = payments.filter((p: any) => p.status === 'UNPAID').length;
      
      // Mock today's attendance (in real app, this would come from attendance API)
      const todayAttendance = Math.floor(activeStudents * 0.85); // 85% attendance rate
      
      // Mock recent enrollments (last 7 days)
      const recentEnrollments = Math.floor(Math.random() * 5) + 1;
      
      setStats({
        totalStudents,
        activeStudents,
        todayAttendance,
        pendingPayments,
        recentEnrollments
      });

      // Mock recent activity with translations
      const mockActivity: RecentActivity[] = mode === 'kindergarten' ? [
        { type: 'enrollment' as const, message: t('dashboard.activityFeed.studentRegistered'), time: t('common.timeAgo', { hours: 2 }), icon: '👶' },
        { type: 'payment' as const, message: t('dashboard.activityFeed.paymentReceived'), time: t('common.timeAgo', { hours: 3 }), icon: '💰' },
        { type: 'attendance' as const, message: t('dashboard.activityFeed.attendanceMarked'), time: t('common.timeAgo', { hours: 4 }), icon: '📊' },
        { type: 'belonging' as const, message: t('dashboard.activityFeed.belongingRetrieved'), time: t('common.timeAgo', { hours: 5 }), icon: '🎒' }
      ] : [
        { type: 'enrollment' as const, message: t('dashboard.activityFeed.studentRegistered'), time: t('common.timeAgo', { hours: 2 }), icon: '📚' },
        { type: 'payment' as const, message: t('dashboard.activityFeed.paymentReceived'), time: t('common.timeAgo', { hours: 3 }), icon: '💳' },
        { type: 'attendance' as const, message: t('dashboard.activityFeed.attendanceMarked'), time: t('common.timeAgo', { hours: 4 }), icon: '⏰' },
        { type: 'course' as const, message: t('dashboard.activityFeed.courseAdded'), time: t('common.timeAgo', { hours: 5 }), icon: '🔬' }
      ];
      setRecentActivity(mockActivity);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) {
      return t('dashboard.greeting.morning');
    } else if (hour < 18) {
      return t('dashboard.greeting.afternoon');
    } else {
      return t('dashboard.greeting.evening');
    }
  };

  const getWelcomeMessage = () => {
    if (mode === 'kindergarten') {
      return t('dashboard.welcomeMessage.kindergarten');
    } else {
      return t('dashboard.welcomeMessage.school');
    }
  };

  const formatDate = (date: Date) => {
    const isArabic = i18n.language === 'ar';
    
    if (isArabic) {
      const months = [
        'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
      ];
      const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
      
      const dayName = days[date.getDay()];
      const day = date.getDate();
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      
      return `${dayName}، ${day} ${month} ${year}`;
    } else {
      return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  const formatTime = () => {
    const date = new Date();
    const locale = i18n.language === 'ar' ? 'ar-SA' : 'fr-FR';
    return date.toLocaleTimeString(locale, { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{
          background: `linear-gradient(to bottom right, var(--mode-background), var(--mode-surface))`,
        }}
      >
        <div 
          className="text-center p-8 rounded-2xl"
          style={{
            backgroundColor: 'var(--mode-card)',
            border: '1px solid var(--mode-border)',
            boxShadow: `0 10px 25px var(--mode-shadow)`,
          }}
        >
          <div 
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
            style={{ borderColor: 'var(--mode-primary)' }}
          ></div>
          <p style={{ color: 'var(--mode-text)' }}>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen p-6"
      style={{
        background: `linear-gradient(to bottom right, var(--mode-background), var(--mode-surface))`,
      }}
    >
      <div className='max-w-7xl mx-auto space-y-8'>
        {/* Welcome Section */}
        <motion.div 
          className="relative overflow-hidden rounded-3xl p-8 text-white transition-all duration-300"
          style={{
            background: `linear-gradient(to bottom right, var(--mode-primary), var(--mode-secondary))`,
            boxShadow: `0 20px 40px var(--mode-shadow)20`,
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
          
          <div className='relative flex items-center justify-between'>
            <div className='flex-1'>
              <div className='flex items-center space-x-4 mb-4'>
                <div className='p-3 bg-white/20 rounded-2xl backdrop-blur-sm'>
                  <GraduationCap className='h-8 w-8' />
                </div>
                <div>
                  <h1 className='text-3xl font-bold'>{getGreeting()}, {i18n.language === 'ar' ? (user?.fullNameArabic || user?.fullName || 'User') : (user?.fullName || 'User')}!</h1>
                  <p className='text-white/90 text-lg'>
                    {getWelcomeMessage()}
                  </p>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className='flex space-x-6 mt-6'>
                <div className='flex items-center space-x-2'>
                  <div className='w-2 h-2 bg-white/60 rounded-full'></div>
                  <span className='text-white/90 text-sm'>
                    {stats?.activeStudents || 0} {t('dashboard.activeStudents')}
                  </span>
                </div>
                <div className='flex items-center space-x-2'>
                  <div className='w-2 h-2 bg-white/60 rounded-full'></div>
                  <span className='text-white/90 text-sm'>
                    {stats?.todayAttendance || 0} {t('dashboard.presentToday')}
                  </span>
                </div>
              </div>
            </div>
            
            <div className='text-right'>
              <div className='text-white/80 text-sm mb-2'>{t('dashboard.today')}</div>
              <div className='text-2xl font-bold'>{formatDate(new Date())}</div>
              <div className='flex items-center justify-end space-x-2 mt-2'>
                <Clock className='h-4 w-4 text-white/80' />
                <span className='text-white/80 text-sm'>
                  {formatTime()}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          <DashboardWidget
            title={t('dashboard.totalStudents')}
            value={stats?.totalStudents || 0}
            subtitle={t('dashboard.allLevels')}
            icon={Users}
            color="border-blue-500"
            mode={mode}
            trend={{ value: 12, isPositive: true }}
          />
          <DashboardWidget
            title={t('dashboard.activeStudents')}
            value={stats?.activeStudents || 0}
            subtitle={t('dashboard.currentlyEnrolled')}
            icon={UserCheck}
            color="border-green-500"
            mode={mode}
            trend={{ value: 8, isPositive: true }}
          />
          <DashboardWidget
            title={t('dashboard.presentToday')}
            value={`${stats?.todayAttendance || 0}/${stats?.activeStudents || 0}`}
            subtitle={t('dashboard.attendanceRate')}
            icon={Calendar}
            color="border-yellow-500"
            mode={mode}
            trend={{ value: 5, isPositive: true }}
          />
          <DashboardWidget
            title={t('dashboard.pendingPayments')}
            value={stats?.pendingPayments || 0}
            subtitle={t('dashboard.toProcess')}
            icon={DollarSign}
            color="border-red-500"
            mode={mode}
            trend={{ value: 3, isPositive: false }}
          />
        </div>

        {/* Quick Actions */}
        <motion.div 
          className="rounded-2xl shadow-lg border p-8"
          style={{
            backgroundColor: 'var(--mode-card)',
            borderColor: 'var(--mode-border)',
            boxShadow: `0 10px 25px var(--mode-shadow)`,
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 
              className="text-2xl font-bold"
              style={{ color: 'var(--mode-text)' }}
            >
              {t('dashboard.quickActions.title')}
            </h2>
            <div className="flex items-center space-x-2 text-sm" style={{ color: 'var(--mode-textSecondary)' }}>
              <Activity className="h-4 w-4" />
              <span>{t('dashboard.directAccess')}</span>
            </div>
          </div>
          
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <motion.button 
              className="group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:shadow-lg"
              style={{
                background: `linear-gradient(to bottom right, var(--mode-primary)20, var(--mode-secondary)20)`,
                border: '1px solid var(--mode-primary)',
              }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center space-x-4">
                <div 
                  className="p-3 rounded-xl group-hover:scale-110 transition-transform duration-300"
                  style={{ backgroundColor: 'var(--mode-primary)' }}
                >
                  <Plus className="h-6 w-6 text-white" />
                </div>
                <div className='text-left flex-1'>
                  <div 
                    className="font-semibold text-lg"
                    style={{ color: 'var(--mode-text)' }}
                  >
                    {t('dashboard.quickActions.addNewStudent')}
                  </div>
                  <div 
                    className="text-sm mt-1"
                    style={{ color: 'var(--mode-textSecondary)' }}
                  >
                    {mode === 'kindergarten' ? t('dashboard.quickActions.enrollStudent') : t('dashboard.quickActions.enrollStudentExtra')}
                  </div>
                </div>
                <ArrowRight 
                  className="h-5 w-5 transition-colors duration-300" 
                  style={{ color: 'var(--mode-textSecondary)' }}
                />
              </div>
            </motion.button>
            
            <motion.button 
              className="group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:shadow-lg"
              style={{
                background: `linear-gradient(to bottom right, var(--mode-secondary)20, var(--mode-accent)20)`,
                border: '1px solid var(--mode-secondary)',
              }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center space-x-4">
                <div 
                  className="p-3 rounded-xl group-hover:scale-110 transition-transform duration-300"
                  style={{ backgroundColor: 'var(--mode-secondary)' }}
                >
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div className='text-left flex-1'>
                  <div 
                    className="font-semibold text-lg"
                    style={{ color: 'var(--mode-text)' }}
                  >
                    {t('dashboard.quickActions.markAttendance')}
                  </div>
                  <div 
                    className="text-sm mt-1"
                    style={{ color: 'var(--mode-textSecondary)' }}
                  >
                    {mode === 'kindergarten' ? t('dashboard.quickActions.dailyAttendance') : t('dashboard.quickActions.courseAttendance')}
                  </div>
                </div>
                <ArrowRight 
                  className="h-5 w-5 transition-colors duration-300" 
                  style={{ color: 'var(--mode-textSecondary)' }}
                />
              </div>
            </motion.button>
            
            <motion.button 
              className="group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:shadow-lg"
              style={{
                background: `linear-gradient(to bottom right, var(--mode-accent)20, var(--mode-primary)20)`,
                border: '1px solid var(--mode-accent)',
              }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center space-x-4">
                <div 
                  className="p-3 rounded-xl group-hover:scale-110 transition-transform duration-300"
                  style={{ backgroundColor: 'var(--mode-accent)' }}
                >
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <div className='text-left flex-1'>
                  <div 
                    className="font-semibold text-lg"
                    style={{ color: 'var(--mode-text)' }}
                  >
                    {t('dashboard.quickActions.managePayments')}
                  </div>
                  <div 
                    className="text-sm mt-1"
                    style={{ color: 'var(--mode-textSecondary)' }}
                  >
                    {t('dashboard.quickActions.paymentTracking')}
                  </div>
                </div>
                <ArrowRight 
                  className="h-5 w-5 transition-colors duration-300" 
                  style={{ color: 'var(--mode-textSecondary)' }}
                />
              </div>
            </motion.button>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div 
          className="rounded-2xl shadow-lg border p-8"
          style={{
            backgroundColor: 'var(--mode-card)',
            borderColor: 'var(--mode-border)',
            boxShadow: `0 10px 25px var(--mode-shadow)`,
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 
              className="text-2xl font-bold"
              style={{ color: 'var(--mode-text)' }}
            >
              {t('dashboard.recentActivity.title')}
            </h2>
            <div className="flex items-center space-x-2 text-sm" style={{ color: 'var(--mode-textSecondary)' }}>
              <Clock className="h-4 w-4" />
              <span>{t('dashboard.last24Hours')}</span>
            </div>
          </div>
          
          <div className='space-y-4'>
            {recentActivity.map((activity, index) => (
              <motion.div 
                key={index} 
                className="group flex items-center p-4 border rounded-xl transition-all duration-300 hover:shadow-md"
                style={{
                  backgroundColor: 'var(--mode-surface)',
                  borderColor: 'var(--mode-border)',
                }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div 
                  className="w-3 h-3 rounded-full mr-4"
                  style={{
                    backgroundColor: activity.type === 'enrollment' ? 'var(--mode-primary)' :
                                    activity.type === 'payment' ? 'var(--mode-secondary)' :
                                    activity.type === 'attendance' ? 'var(--mode-accent)' :
                                    'var(--mode-primary)',
                  }}
                ></div>
                <div className='flex-1'>
                  <div 
                    className="text-sm font-medium"
                    style={{ color: 'var(--mode-text)' }}
                  >
                    {activity.message}
                  </div>
                  <div 
                    className="text-xs mt-1"
                    style={{ color: 'var(--mode-textSecondary)' }}
                  >
                    {activity.time}
                  </div>
                </div>
                <div className="text-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                  {activity.icon}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Status & Info Widget */}
        <motion.div 
          className="rounded-2xl shadow-lg border p-8"
          style={{
            backgroundColor: 'var(--mode-card)',
            borderColor: 'var(--mode-border)',
            boxShadow: `0 10px 25px var(--mode-shadow)`,
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 
              className="text-2xl font-bold"
              style={{ color: 'var(--mode-text)' }}
            >
              {mode === 'kindergarten' ? t('dashboard.weatherActivities') : t('dashboard.conditionsCourses')}
            </h2>
            <div className="flex items-center space-x-2 text-sm" style={{ color: 'var(--mode-textSecondary)' }}>
              <Sun className="h-4 w-4" />
              <span>{t('dashboard.realTime')}</span>
            </div>
          </div>
          
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <motion.div 
              className="group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:shadow-lg"
              style={{
                background: `linear-gradient(to bottom right, var(--mode-primary)20, var(--mode-secondary)20)`,
                border: '1px solid var(--mode-primary)',
              }}
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <div className="flex items-center space-x-4">
                <div 
                  className="p-3 rounded-xl group-hover:scale-110 transition-transform duration-300"
                  style={{ backgroundColor: 'var(--mode-primary)' }}
                >
                  {mode === 'kindergarten' ? <Sun className="h-6 w-6 text-white" /> : <Moon className="h-6 w-6 text-white" />}
                </div>
                <div className="flex-1">
                  <div 
                    className="text-lg font-semibold"
                    style={{ color: 'var(--mode-text)' }}
                  >
                    {mode === 'kindergarten' ? t('dashboard.weatherSunny') : t('dashboard.weatherEvening')}
                  </div>
                  <div 
                    className="text-sm mt-1"
                    style={{ color: 'var(--mode-textSecondary)' }}
                  >
                    {mode === 'kindergarten' ? t('dashboard.perfectOutdoor') : t('dashboard.idealEvening')}
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:shadow-lg"
              style={{
                background: `linear-gradient(to bottom right, var(--mode-secondary)20, var(--mode-accent)20)`,
                border: '1px solid var(--mode-secondary)',
              }}
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <div className="flex items-center space-x-4">
                <div 
                  className="p-3 rounded-xl group-hover:scale-110 transition-transform duration-300"
                  style={{ backgroundColor: 'var(--mode-secondary)' }}
                >
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <div 
                    className="text-lg font-semibold"
                    style={{ color: 'var(--mode-text)' }}
                  >
                    {mode === 'kindergarten' ? t('dashboard.activityOfDay') : t('dashboard.eveningCourse')}
                  </div>
                  <div 
                    className="text-sm mt-1"
                    style={{ color: 'var(--mode-textSecondary)' }}
                  >
                    {mode === 'kindergarten' ? t('dashboard.paintingWorkshop') : t('dashboard.advancedMath')}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;