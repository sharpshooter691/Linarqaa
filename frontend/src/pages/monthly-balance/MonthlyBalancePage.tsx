import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useMode } from '@/contexts/ModeContext';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar,
  Download,
  Printer,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion } from 'framer-motion';

interface MonthlyBalance {
  year: number;
  month: number;
  monthName: string;
  kindergartenIncome: number;
  extraCourseIncome: number;
  totalIncome: number;
  totalSalaries: number;
  netIncome: number;
  kindergartenBreakdown: {
    totalPayments: number;
    byType: Record<string, number>;
    totalAmount: number;
  };
  extraCourseBreakdown: {
    totalPayments: number;
    byCourse: Record<string, number>;
    totalAmount: number;
  };
  salaryBreakdown: {
    totalStaff: number;
    byType: Record<string, number>;
    staffCount: Record<string, number>;
    totalAmount: number;
  };
  // Add provisional income data
  provisionalIncome?: {
    kindergartenUnpaid: number;
    extraCourseUnpaid: number;
    totalUnpaid: number;
    kindergartenUnpaidCount: number;
    extraCourseUnpaidCount: number;
  };
}


interface MonthlyBalance {
  year: number;
  month: number;
  monthName: string;
  kindergartenIncome: number;
  extraCourseIncome: number;
  totalIncome: number;
  totalSalaries: number;
  netIncome: number;
  kindergartenBreakdown: {
    totalPayments: number;
    byType: Record<string, number>;
    totalAmount: number;
  };
  extraCourseBreakdown: {
    totalPayments: number;
    byCourse: Record<string, number>;
    totalAmount: number;
  };
  salaryBreakdown: {
    totalStaff: number;
    byType: Record<string, number>;
    staffCount: Record<string, number>;
    totalAmount: number;
  };
  // Add provisional income data
  provisionalIncome?: {
    kindergartenUnpaid: number;
    extraCourseUnpaid: number;
    totalUnpaid: number;
    kindergartenUnpaidCount: number;
    extraCourseUnpaidCount: number;
  };
}

const MonthlyBalancePage = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { mode } = useMode();
  const { toast } = useToast();
  
  const [currentDate] = useState(new Date());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('monthly');
  const [balance, setBalance] = useState<MonthlyBalance | null>(null);
  const [yearlyBalance, setYearlyBalance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchData();
  }, [selectedYear, selectedMonth, viewMode]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      if (viewMode === 'monthly') {
        const response = await api.get(`/monthly-balance/${selectedYear}/${selectedMonth}`);
        setBalance(response.data);
      } else {
        const response = await api.get(`/monthly-balance/year/${selectedYear}`);
        setYearlyBalance(response.data);
      }
      
    } catch (error) {
      console.error('Error fetching balance data:', error);
      toast({
        title: t('common.error'),
        description: 'Error loading balance data',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const handlePreviousYear = () => {
    setSelectedYear(selectedYear - 1);
  };

  const handleNextYear = () => {
    setSelectedYear(selectedYear + 1);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getMonthName = (month: number) => {
    return t(`common.months.${month}`);
  };

  const getStatusColor = (amount: number) => {
    if (amount > 0) return 'text-green-600';
    if (amount < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getStatusIcon = (amount: number) => {
    if (amount > 0) return <TrendingUp className="h-4 w-4" />;
    if (amount < 0) return <TrendingDown className="h-4 w-4" />;
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: 'var(--mode-background)' }}
    >
      <div className="container mx-auto px-4 py-8">
               {/* Hero Header */}
               <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div 
            className="rounded-3xl p-8 shadow-lg border text-white"
            style={{
              background: `linear-gradient(to bottom right, var(--mode-primary), var(--mode-secondary))`,
              borderColor: 'var(--mode-border)',
              boxShadow: `0 10px 30px var(--mode-shadow)20`
            }}
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between">
              <div className="mb-6 lg:mb-0">
                <h1 
                  className="text-4xl font-bold mb-2 text-white"
                >
                  {t('sidebar.monthlyBalance')} ✨
                </h1>
                <p 
                  className="text-lg text-white/90"
                >
                  {i18n.language === 'ar' ? 'تتبع دخل ومصروفات الجمعية' : 'Suivi des revenus et dépenses de l\'association'}
                </p>
                <div className="flex items-center mt-2 text-sm text-white/90">
                  <BarChart3 size={16} className="mr-1" />
                  {t('common.managedBy')} {user?.fullName}
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowDetails(!showDetails)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl border transition-all duration-200 hover:shadow-lg bg-white/20 backdrop-blur-sm border-white/30 text-white"
                >
                  {showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span>{showDetails ? t('sidebar.hideDetails') : t('sidebar.showDetails')}</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {/* Add export functionality */}}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl border transition-all duration-200 hover:shadow-lg bg-white/20 backdrop-blur-sm border-white/30 text-white"
                >
                  <Download className="h-4 w-4" />
                  <span>{t('sidebar.export')}</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {/* Add print functionality */}}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl border transition-all duration-200 hover:shadow-lg bg-white/20 backdrop-blur-sm border-white/30 text-white"
                >
                  <Printer className="h-4 w-4" />
                  <span>{t('sidebar.print')}</span>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* View Mode Toggle */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-6 shadow-lg border mb-8"
          style={{
            backgroundColor: 'var(--mode-card)',
            borderColor: 'var(--mode-border)',
            boxShadow: `0 10px 30px var(--mode-shadow)20`
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setViewMode('monthly')}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                  viewMode === 'monthly' 
                    ? 'text-white' 
                    : 'hover:opacity-80'
                }`}
                style={{
                  backgroundColor: viewMode === 'monthly' ? 'var(--mode-primary)' : 'transparent',
                  color: viewMode === 'monthly' ? 'white' : 'var(--mode-textSecondary)'
                }}
              >
                {t('sidebar.monthlyView')}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setViewMode('yearly')}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                  viewMode === 'yearly' 
                    ? 'text-white' 
                    : 'hover:opacity-80'
                }`}
                style={{
                  backgroundColor: viewMode === 'yearly' ? 'var(--mode-primary)' : 'transparent',
                  color: viewMode === 'yearly' ? 'white' : 'var(--mode-textSecondary)'
                }}
              >
                {t('sidebar.yearlyView')}
              </motion.button>
            </div>
            
            {viewMode === 'monthly' ? (
              <div className="flex items-center space-x-4">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePreviousMonth} 
                  className="p-2 rounded-xl transition-all duration-200 hover:shadow-lg"
                  style={{
                    backgroundColor: 'var(--mode-surface)',
                    color: 'var(--mode-text)',
                    borderColor: 'var(--mode-border)'
                  }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </motion.button>
                <span 
                  className="text-lg font-semibold"
                  style={{ color: 'var(--mode-text)' }}
                >
                  {getMonthName(selectedMonth)} {selectedYear}
                </span>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNextMonth} 
                  className="p-2 rounded-xl transition-all duration-200 hover:shadow-lg"
                  style={{
                    backgroundColor: 'var(--mode-surface)',
                    color: 'var(--mode-text)',
                    borderColor: 'var(--mode-border)'
                  }}
                >
                  <ChevronRight className="h-4 w-4" />
                </motion.button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePreviousYear} 
                  className="p-2 rounded-xl transition-all duration-200 hover:shadow-lg"
                  style={{
                    backgroundColor: 'var(--mode-surface)',
                    color: 'var(--mode-text)',
                    borderColor: 'var(--mode-border)'
                  }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </motion.button>
                <span 
                  className="text-lg font-semibold"
                  style={{ color: 'var(--mode-text)' }}
                >
                  {selectedYear}
                </span>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNextYear} 
                  className="p-2 rounded-xl transition-all duration-200 hover:shadow-lg"
                  style={{
                    backgroundColor: 'var(--mode-surface)',
                    color: 'var(--mode-text)',
                    borderColor: 'var(--mode-border)'
                  }}
                >
                  <ChevronRight className="h-4 w-4" />
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Monthly Balance Summary */}
        {viewMode === 'monthly' && balance && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {/* Total Income */}
            <div 
              className="rounded-2xl p-6 text-white"
              style={{
                background: `linear-gradient(to right, var(--mode-primary), var(--mode-secondary))`
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">{t('sidebar.totalIncome')}</p>
                  <p className="text-3xl font-bold">{formatCurrency(balance.totalIncome)}</p>
                </div>
                <TrendingUp size={32} className="opacity-80" />
              </div>
            </div>
            
            {/* Kindergarten Income */}
            <div 
              className="rounded-2xl p-6 text-white"
              style={{
                background: `linear-gradient(to right, var(--mode-accent), var(--mode-primary))`
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">{i18n.language === 'ar' ? 'الروضة:' : 'Maternelle:'}</p>
                  <p className="text-3xl font-bold">{formatCurrency(balance.kindergartenIncome)}</p>
                </div>
                <Users size={32} className="opacity-80" />
              </div>
            </div>
            
            {/* Extra Course Income */}
            <div 
              className="rounded-2xl p-6 text-white"
              style={{
                background: `linear-gradient(to right, var(--mode-secondary), var(--mode-accent))`
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">{i18n.language === 'ar' ? 'الدروس الإضافية:' : 'Cours extras:'}</p>
                  <p className="text-3xl font-bold">{formatCurrency(balance.extraCourseIncome)}</p>
                </div>
                <Calendar size={32} className="opacity-80" />
              </div>
            </div>
            
            {/* Net Income */}
            <div 
              className="rounded-2xl p-6 text-white"
              style={{
                background: `linear-gradient(to right, var(--mode-primary), var(--mode-accent))`
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">{t('sidebar.netIncome')}</p>
                  <p className="text-3xl font-bold">{formatCurrency(balance.netIncome)}</p>
                </div>
                <BarChart3 size={32} className="opacity-80" />
              </div>
            </div>
          </motion.div>
        )}


      {/* Net Income Summary */}
      {viewMode === 'monthly' && balance && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('sidebar.netIncome')}</p>
                <p className={`text-3xl font-bold ${getStatusColor(balance.netIncome)}`}>
                  {formatCurrency(balance.netIncome)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2">
                {getStatusIcon(balance.netIncome)}
                <span className={`text-lg font-semibold ${getStatusColor(balance.netIncome)}`}>
                  {balance.netIncome > 0 ? t('sidebar.profit') : balance.netIncome < 0 ? t('sidebar.loss') : t('sidebar.breakEven')}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {balance.netIncome > 0 ? 
                  (i18n.language === 'ar' ? 'الجمعية تحقق ربحاً' : 'L\'association est rentable') : 
                 balance.netIncome < 0 ? 
                  (i18n.language === 'ar' ? 'الجمعية تعمل بخسارة' : 'L\'association fonctionne à perte') : 
                  (i18n.language === 'ar' ? 'الجمعية في حالة تعادل' : 'L\'association atteint l\'équilibre')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Income Breakdown */}
      {viewMode === 'monthly' && balance && showDetails && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Kindergarten Income */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {i18n.language === 'ar' ? 'دخل الروضة' : 'Revenus Maternelle'}
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  {i18n.language === 'ar' ? 'المبلغ الإجمالي:' : 'Montant Total:'}
                </span>
                <span className="font-semibold">{formatCurrency(balance.kindergartenIncome)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  {i18n.language === 'ar' ? 'عدد المدفوعات:' : 'Nombre de Paiements:'}
                </span>
                <span className="font-semibold">{balance.kindergartenBreakdown.totalPayments}</span>
              </div>
              {Object.entries(balance.kindergartenBreakdown.byType).map(([type, amount]) => (
                <div key={type} className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">{type}:</span>
                  <span>{formatCurrency(amount as number)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Extra Course Income */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {i18n.language === 'ar' ? 'دخل الدورات الإضافية' : 'Revenus Cours Supplémentaires'}
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  {i18n.language === 'ar' ? 'المبلغ الإجمالي:' : 'Montant Total:'}
                </span>
                <span className="font-semibold">{formatCurrency(balance.extraCourseIncome)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  {i18n.language === 'ar' ? 'عدد المدفوعات:' : 'Nombre de Paiements:'}
                </span>
                <span className="font-semibold">{balance.extraCourseBreakdown.totalPayments}</span>
              </div>
              {Object.entries(balance.extraCourseBreakdown.byCourse).map(([course, amount]) => (
                <div key={course} className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">{course}:</span>
                  <span>{formatCurrency(amount as number)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Salary Breakdown */}
      {viewMode === 'monthly' && balance && showDetails && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {i18n.language === 'ar' ? 'تفصيل الرواتب' : 'Détail des Salaires'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {balance.salaryBreakdown.totalStaff}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {i18n.language === 'ar' ? 'إجمالي الموظفين' : 'Total Personnel'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(balance.salaryBreakdown.totalAmount)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('sidebar.totalSalaries')}
              </p>
            </div>
          </div>
          
          <div className="mt-6 space-y-3">
            {Object.entries(balance.salaryBreakdown.byType).map(([type, amount]) => (
              <div key={type} className="flex justify-between items-center">
                <div>
                  <span className="font-medium">{type}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                    ({balance.salaryBreakdown.staffCount[type]} {i18n.language === 'ar' ? 'موظف' : 'personnel'})
                  </span>
                </div>
                <span className="font-semibold">{formatCurrency(amount as number)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Yearly View */}
      {viewMode === 'yearly' && yearlyBalance && (
        <div className="space-y-6">
          {/* Yearly Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('sidebar.totalIncome')}</p>
                  <p className="text-3xl font-bold text-green-600">
                    {formatCurrency(yearlyBalance.totalYearlyIncome)}
                  </p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    {t('sidebar.monthlyAvg')}:
                  </span>
                  <span className="font-medium">
                    {formatCurrency(yearlyBalance.totalYearlyIncome / 12)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    {t('sidebar.bestMonth')}:
                  </span>
                  <span className="font-medium text-green-600">
                    {(() => {
                      const months = Object.values(yearlyBalance.monthlyBalances) as any[];
                      const bestMonth = months.reduce((max, month) => 
                        month.totalIncome > max.totalIncome ? month : max, months[0]);
                      return formatCurrency(bestMonth?.totalIncome || 0);
                    })()}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <TrendingDown className="h-8 w-8 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('sidebar.totalSalaries')}</p>
                  <p className="text-3xl font-bold text-red-600">
                    {formatCurrency(yearlyBalance.totalYearlySalaries)}
                  </p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    {t('sidebar.monthlyAvg')}:
                  </span>
                  <span className="font-medium">
                    {formatCurrency(yearlyBalance.totalYearlySalaries / 12)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    {t('sidebar.fixedCost')}:
                  </span>
                  <span className="font-medium text-red-600">100%</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('sidebar.netIncome')}</p>
                  <p className={`text-3xl font-bold ${getStatusColor(yearlyBalance.totalYearlyNetIncome)}`}>
                    {formatCurrency(yearlyBalance.totalYearlyNetIncome)}
                  </p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    {t('sidebar.monthlyAvg')}:
                  </span>
                  <span className="font-medium">
                    {formatCurrency(yearlyBalance.totalYearlyNetIncome / 12)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    {t('sidebar.profitMargin')}:
                  </span>
                  <span className={`font-medium ${getStatusColor(yearlyBalance.totalYearlyNetIncome)}`}>
                    {yearlyBalance.totalYearlyIncome > 0 ? 
                      ((yearlyBalance.totalYearlyNetIncome / yearlyBalance.totalYearlyIncome) * 100).toFixed(1) + '%' : 
                      '0%'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              {i18n.language === 'ar' ? `التفصيل الشهري - ${selectedYear}` : `Détail Mensuel - ${selectedYear}`}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Object.entries(yearlyBalance.monthlyBalances).map(([month, data]: [string, any]) => (
                <div key={month} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                    {getMonthName(parseInt(month))}
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        {i18n.language === 'ar' ? 'الدخل:' : 'Revenus:'}
                      </span>
                      <span className="text-green-600 font-medium">{formatCurrency(data.totalIncome)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        {i18n.language === 'ar' ? 'الرواتب:' : 'Salaires:'}
                      </span>
                      <span className="text-red-600 font-medium">{formatCurrency(data.totalSalaries)}</span>
                    </div>
                    <div className="flex justify-between font-semibold pt-2 border-t border-gray-200 dark:border-gray-700">
                      <span>{i18n.language === 'ar' ? 'صافي:' : 'Net:'}</span>
                      <span className={getStatusColor(data.netIncome)}>
                        {formatCurrency(data.netIncome)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500 dark:text-gray-400">
                        {i18n.language === 'ar' ? 'الفواتير:' : 'Factures:'}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        {data.kindergartenBreakdown?.totalPayments + data.extraCourseBreakdown?.totalPayments || 0}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500 dark:text-gray-400">
                        {i18n.language === 'ar' ? 'الموظفين:' : 'Personnel:'}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        {data.salaryBreakdown?.totalStaff || 0}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
  );
};

export default MonthlyBalancePage;
