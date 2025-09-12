import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useMode } from '@/contexts/ModeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard,
  DollarSign,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  RefreshCw,
  Download,
  Printer,
  Grid,
  List,
  Receipt,
  Search,
  X
} from 'lucide-react';

interface ExtraPayment {
  id: string;
  extraStudentId: string;
  studentName: string;
  studentNameArabic?: string;
  studentPhotoUrl?: string;
  courseName: string;
  courseId: string;
  amount: number;
  status: 'UNPAID' | 'PAID' | 'PARTIAL' | 'OVERDUE';
  dueDate: string;
  paidDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface ExtraPaymentStatistics {
  totalPayments: number;
  paidPayments: number;
  unpaidPayments: number;
  overduePayments: number;
  totalAmount: number;
  paidAmount: number;
  expectedAmount: number;
}

const ExtraPaymentsPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const { mode } = useMode();
  const [payments, setPayments] = useState<ExtraPayment[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<ExtraPayment[]>([]);
  const [paymentHistoryByMonth, setPaymentHistoryByMonth] = useState<{[key: string]: ExtraPayment[]}>({});
  const [statistics, setStatistics] = useState<ExtraPaymentStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingBills, setGeneratingBills] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<ExtraPayment | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    studentId: '',
    courseId: '',
    monthYear: new Date().toISOString().slice(0, 7)
  });

  useEffect(() => {
    fetchPayments();
    fetchPaymentHistory();
    fetchPaymentHistoryByMonth();
    fetchStatistics();
  }, [filters]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.studentId) params.append('studentId', filters.studentId);
      if (filters.courseId) params.append('courseId', filters.courseId);
      
      // Use backend month/year filtering
      if (filters.monthYear) {
        const [year, month] = filters.monthYear.split('-');
        params.append('month', month);
        params.append('year', year);
      }
      
      const response = await api.get(`/extra-payments?${params.toString()}`);
      setPayments(response.data);
    } catch (error) {
      console.error('Error fetching extra payments:', error);
      toast({
        title: t('extraPayments.error'),
        description: t('extraPayments.loadError'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentHistory = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.studentId) params.append('studentId', filters.studentId);
      if (filters.courseId) params.append('courseId', filters.courseId);
      if (filters.monthYear) {
        const [year, month] = filters.monthYear.split('-');
        params.append('month', month);
        params.append('year', year);
      }
      
      const response = await api.get(`/extra-payments?${params.toString()}&status=PAID`);
      setPaymentHistory(response.data);
    } catch (error) {
      console.error('Error fetching payment history:', error);
    }
  };

  const fetchPaymentHistoryByMonth = async () => {
    try {
      const response = await api.get('/extra-payments?status=PAID');
      const payments = response.data;
      
      const groupedByMonth: {[key: string]: ExtraPayment[]} = {};
      payments.forEach((payment: ExtraPayment) => {
        const dueDate = new Date(payment.dueDate);
        const monthKey = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}`;
        
        if (!groupedByMonth[monthKey]) {
          groupedByMonth[monthKey] = [];
        }
        groupedByMonth[monthKey].push(payment);
      });
      
      setPaymentHistoryByMonth(groupedByMonth);
    } catch (error) {
      console.error('Error fetching payment history by month:', error);
    }
  };

  const fetchStatistics = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.monthYear) {
        const [year, month] = filters.monthYear.split('-');
        params.append('month', month);
        params.append('year', year);
      }
      
      const response = await api.get(`/extra-payments/statistics?${params.toString()}`);
      setStatistics(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const generateMonthlyBills = async () => {
    try {
      setGeneratingBills(true);
      await api.post('/extra-payments/generate-monthly');
      toast({
        title: t('extraPayments.success'),
        description: t('extraPayments.billsGenerated'),
      });
      fetchPayments();
      fetchStatistics();
    } catch (error) {
      console.error('Error generating bills:', error);
      toast({
        title: t('extraPayments.error'),
        description: t('extraPayments.billsGenerationError'),
        variant: "destructive"
      });
    } finally {
      setGeneratingBills(false);
    }
  };

  const markPaymentAsPaid = async (paymentId: string) => {
    try {
      await api.patch(`/extra-payments/${paymentId}/mark-paid`);
      toast({
        title: t('extraPayments.success'),
        description: t('extraPayments.paymentMarkedPaid'),
      });
      fetchPayments();
      fetchStatistics();
    } catch (error) {
      console.error('Error updating payment:', error);
      toast({
        title: t('extraPayments.error'),
        description: t('extraPayments.paymentUpdateError'),
        variant: "destructive"
      });
    }
  };

  const handlePrintReceipt = (payment: ExtraPayment) => {
    setSelectedPayment(payment);
    setShowReceiptModal(true);
  };

  const printReceipt = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow || !selectedPayment) return;

    const receiptContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${t('extraPayments.receipt.title')} - ${selectedPayment.studentName}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px 20px; background: white; line-height: 1.6; }
            .header { text-align: center; border-bottom: 3px solid #2563eb; padding-bottom: 25px; margin-bottom: 35px; }
            .logo-container { display: flex; align-items: center; justify-content: center; margin-bottom: 15px; }
            .logo-img { width: 60px; height: 60px; object-fit: contain; margin-right: 15px; border-radius: 8px; }
            .logo-text { font-size: 28px; font-weight: bold; color: #2563eb; text-align: center; }
            .receipt-title { font-size: 22px; font-weight: bold; color: #1f2937; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; }
            .receipt-subtitle { color: #6b7280; font-size: 16px; font-weight: 500; }
            .receipt-info { margin-bottom: 30px; }
            .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
            .info-label { font-weight: 600; color: #374151; font-size: 14px; }
            .info-value { color: #1f2937; font-size: 14px; }
            .amount-section { background: linear-gradient(135deg, #f3f4f6, #e5e7eb); border-radius: 12px; padding: 25px; text-align: center; margin-bottom: 30px; border: 2px solid #d1d5db; }
            .amount-label { color: #6b7280; font-size: 16px; font-weight: 600; margin-bottom: 8px; }
            .amount-value { color: #059669; font-size: 36px; font-weight: bold; text-shadow: 0 1px 2px rgba(0,0,0,0.1); }
            .status-badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
            .status-paid { background: #dcfce7; color: #166534; }
            .status-unpaid { background: #fef2f2; color: #dc2626; }
            .status-overdue { background: #fff7ed; color: #ea580c; }
            .footer { text-align: center; padding-top: 20px; border-top: 2px solid #e5e7eb; }
            .footer-main { font-size: 18px; font-weight: bold; color: #1f2937; margin-bottom: 8px; }
            .footer-sub { color: #6b7280; font-size: 14px; margin-bottom: 8px; }
            .print-date { color: #9ca3af; font-size: 12px; }
            @media print { body { margin: 0; padding: 20px; max-width: none; width: 100%; } .no-print { display: none; } .header { page-break-inside: avoid; } .amount-section { page-break-inside: avoid; } }
            @page { margin: 1cm; size: A4; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo-container">
              <img src="/logo.jpg" alt="Linarqa Logo" class="logo-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
              <div class="logo-text" style="display: none;">Linarqa</div>
            </div>
            <div class="receipt-title">${t('extraPayments.receipt.title')}</div>
            <div class="receipt-subtitle">${t('extraPayments.receipt.subtitle')}</div>
          </div>
          <div class="receipt-info">
            <div class="info-row">
              <span class="info-label">${t('extraPayments.receipt.student')}:</span>
              <span class="info-value">${selectedPayment.studentName}</span>
            </div>
            ${selectedPayment.studentNameArabic ? `
            <div class="info-row">
              <span class="info-label">${t('extraPayments.receipt.studentArabic')}:</span>
              <span class="info-value">${selectedPayment.studentNameArabic}</span>
            </div>
            ` : ''}
            <div class="info-row">
              <span class="info-label">${t('extraPayments.receipt.course')}:</span>
              <span class="info-value">${selectedPayment.courseName}</span>
            </div>
            <div class="info-row">
              <span class="info-label">${t('extraPayments.receipt.dueDate')}:</span>
              <span class="info-value">${formatDate(selectedPayment.dueDate)}</span>
            </div>
            ${selectedPayment.paidDate ? `
            <div class="info-row">
              <span class="info-label">${t('extraPayments.receipt.paidDate')}:</span>
              <span class="info-value">${formatDate(selectedPayment.paidDate)}</span>
            </div>
            ` : ''}
            <div class="info-row">
              <span class="info-label">${t('extraPayments.receipt.status')}:</span>
              <span class="info-value">
                <span class="status-badge status-${selectedPayment.status.toLowerCase()}">
                  ${getStatusText(selectedPayment.status)}
                </span>
              </span>
            </div>
          </div>
          <div class="amount-section">
            <div class="amount-label">${t('extraPayments.receipt.amount')}</div>
            <div class="amount-value">${formatCurrency(selectedPayment.amount)}</div>
          </div>
          <div class="footer">
            <div class="footer-main">${t('extraPayments.receipt.thankYou')}</div>
            <div class="footer-sub">${t('extraPayments.receipt.footer')}</div>
            <div class="print-date">${t('extraPayments.receipt.generatedOn')} ${formatDate(new Date().toISOString())} ${t('extraPayments.receipt.at')} ${new Date().toLocaleTimeString()}</div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(receiptContent);
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'PARTIAL': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'UNPAID': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'OVERDUE': return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PAID': return t('extraPayments.status.paid');
      case 'PARTIAL': return t('extraPayments.status.partial');
      case 'UNPAID': return t('extraPayments.status.unpaid');
      case 'OVERDUE': return t('extraPayments.status.overdue');
      default: return t('extraPayments.status.unknown');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return '#10b981';
      case 'PARTIAL': return '#f59e0b';
      case 'UNPAID': return '#ef4444';
      case 'OVERDUE': return '#f97316';
      default: return '#6b7280';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MAD'
    }).format(amount);
  };

  const getMonthName = (month: string) => {
    const months = {
      '1': t('extraPayments.months.january'),
      '2': t('extraPayments.months.february'),
      '3': t('extraPayments.months.march'),
      '4': t('extraPayments.months.april'),
      '5': t('extraPayments.months.may'),
      '6': t('extraPayments.months.june'),
      '7': t('extraPayments.months.july'),
      '8': t('extraPayments.months.august'),
      '9': t('extraPayments.months.september'),
      '10': t('extraPayments.months.october'),
      '11': t('extraPayments.months.november'),
      '12': t('extraPayments.months.december')
    };
    return months[month as keyof typeof months] || month;
  };

  const getMonthYearName = (monthYear: string) => {
    if (!monthYear) return '';
    const [year, month] = monthYear.split('-');
    return `${getMonthName(month)} ${year}`;
  };

  const getMonthYearFromKey = (key: string) => {
    const [year, month] = key.split('-');
    return `${getMonthName(month)} ${year}`;
  };

  const getTotalAmountForMonth = (payments: ExtraPayment[]) => {
    return payments.reduce((total, payment) => total + payment.amount, 0);
  };

  const getPaidAmountForMonth = (payments: ExtraPayment[]) => {
    return payments
      .filter(payment => payment.status === 'PAID')
      .reduce((total, payment) => total + payment.amount, 0);
  };

  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--mode-background)' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div 
            className="animate-spin rounded-full h-16 w-16 border-4 border-t-transparent mx-auto mb-4"
            style={{ borderColor: 'var(--mode-primary)' }}
          ></div>
          <p 
            className="text-lg font-medium"
            style={{ color: 'var(--mode-text)' }}
          >
            {t('extraPayments.loading')}
          </p>
        </motion.div>
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
            className="relative overflow-hidden rounded-3xl p-8 text-white transition-all duration-300"
            style={{
              background: `linear-gradient(to bottom right, var(--mode-primary), var(--mode-secondary))`,
              boxShadow: `0 20px 40px var(--mode-shadow)20`,
            }}
          >
            <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
            
            <div className="relative flex flex-col lg:flex-row lg:items-center justify-between">
              <div className="mb-6 lg:mb-0">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                    <CreditCard className="h-8 w-8" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold mb-2">
                      {t('extraPayments.title')} ✨
                    </h1>
                    <p className="text-white/90 text-lg">
                      {t('extraPayments.subtitle')}
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                    <span className="text-white/90 text-sm">
                      {t('common.managedBy')} {user?.fullName}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                    <span className="text-white/90 text-sm">
                      {statistics?.totalPayments || 0} {t('extraPayments.totalPayments')}
                    </span>
                  </div>
                </div>
              </div>
              
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={generateMonthlyBills}
                disabled={generatingBills}
                className="px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2 text-white bg-white/20 backdrop-blur-sm border border-white/30"
              >
                {generatingBills ? (
                  <Clock className="h-5 w-5 animate-spin" />
                ) : (
                  <Receipt className="h-5 w-5" />
                )}
                <span>{generatingBills ? t('extraPayments.generating') : t('extraPayments.generateBills')}</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Statistics Dashboard */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div 
            className="rounded-2xl p-6 text-white"
            style={{
              background: `linear-gradient(to right, var(--mode-primary), var(--mode-secondary))`
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">{t('extraPayments.statistics.totalPayments')}</p>
                <p className="text-3xl font-bold">{statistics?.totalPayments || 0}</p>
              </div>
              <CreditCard size={32} className="opacity-80" />
            </div>
          </div>
          
          <div 
            className="rounded-2xl p-6 text-white"
            style={{
              background: `linear-gradient(to right, var(--mode-accent), var(--mode-primary))`
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">{t('extraPayments.statistics.paidPayments')}</p>
                <p className="text-3xl font-bold">{statistics?.paidPayments || 0}</p>
              </div>
              <CheckCircle size={32} className="opacity-80" />
            </div>
          </div>
          
          <div 
            className="rounded-2xl p-6 text-white"
            style={{
              background: `linear-gradient(to right, var(--mode-secondary), var(--mode-accent))`
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">{t('extraPayments.statistics.unpaidPayments')}</p>
                <p className="text-3xl font-bold">{statistics?.unpaidPayments || 0}</p>
              </div>
              <XCircle size={32} className="opacity-80" />
            </div>
          </div>
          
          <div 
            className="rounded-2xl p-6 text-white"
            style={{
              background: `linear-gradient(to right, var(--mode-primary), var(--mode-accent))`
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">{t('extraPayments.statistics.totalAmount')}</p>
                <p className="text-3xl font-bold">{formatCurrency(statistics?.paidAmount || 0)}</p>
                <p className="text-sm opacity-70">/ {formatCurrency(statistics?.expectedAmount || 0)}</p>
              </div>
              <DollarSign size={32} className="opacity-80" />
            </div>
          </div>
        </motion.div>

        {/* Search and Filter Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl p-6 shadow-lg border mb-8"
          style={{
            backgroundColor: 'var(--mode-card)',
            borderColor: 'var(--mode-border)',
            boxShadow: `0 10px 30px var(--mode-shadow)20`
          }}
        >
          {/* Tabs */}
          <div className="flex space-x-1 mb-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('current')}
              className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all duration-200 ${
                activeTab === 'current' 
                  ? 'text-white' 
                  : 'hover:opacity-80'
              }`}
              style={{
                backgroundColor: activeTab === 'current' ? 'var(--mode-primary)' : 'transparent',
                color: activeTab === 'current' ? 'white' : 'var(--mode-textSecondary)'
              }}
            >
              <div className="flex items-center justify-center space-x-2">
                <Receipt className="h-5 w-5" />
                <span>{t('extraPayments.tabs.current')}</span>
              </div>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all duration-200 ${
                activeTab === 'history' 
                  ? 'text-white' 
                  : 'hover:opacity-80'
              }`}
              style={{
                backgroundColor: activeTab === 'history' ? 'var(--mode-primary)' : 'transparent',
                color: activeTab === 'history' ? 'white' : 'var(--mode-textSecondary)'
              }}
            >
              <div className="flex items-center justify-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>{t('extraPayments.tabs.history')}</span>
              </div>
            </motion.button>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex-1 relative">
              <Search 
                size={20} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2"
                style={{ color: 'var(--mode-textSecondary)' }}
              />
              <input
                type="text"
                placeholder={t('extraPayments.searchPlaceholder')}
                value={filters.studentId}
                onChange={(e) => setFilters({...filters, studentId: e.target.value})}
                className="w-full pl-10 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-opacity-50 transition-colors"
                style={{
                  backgroundColor: 'var(--mode-surface)',
                  color: 'var(--mode-text)',
                  borderColor: 'var(--mode-border)',
                }}
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="px-4 py-3 rounded-xl border focus:ring-2 focus:ring-opacity-50 transition-colors"
                style={{
                  backgroundColor: 'var(--mode-surface)',
                  color: 'var(--mode-text)',
                  borderColor: 'var(--mode-border)',
                }}
              >
                <option value="">{t('extraPayments.allStatuses')}</option>
                <option value="UNPAID">{t('extraPayments.status.unpaid')}</option>
                <option value="PAID">{t('extraPayments.status.paid')}</option>
                <option value="PARTIAL">{t('extraPayments.status.partial')}</option>
                <option value="OVERDUE">{t('extraPayments.status.overdue')}</option>
              </select>
              
              <input
                type="month"
                value={filters.monthYear}
                onChange={(e) => setFilters({...filters, monthYear: e.target.value})}
                className="px-4 py-3 rounded-xl border focus:ring-2 focus:ring-opacity-50 transition-colors"
                style={{
                  backgroundColor: 'var(--mode-surface)',
                  color: 'var(--mode-text)',
                  borderColor: 'var(--mode-border)',
                }}
              />
              
              <div 
                className="flex rounded-xl p-1"
                style={{ backgroundColor: 'var(--mode-surface)' }}
              >
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'shadow-sm' : ''}`}
                  style={{
                    backgroundColor: viewMode === 'grid' ? 'var(--mode-card)' : 'transparent',
                    color: 'var(--mode-text)'
                  }}
                >
                  <Grid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'shadow-sm' : ''}`}
                  style={{
                    backgroundColor: viewMode === 'list' ? 'var(--mode-card)' : 'transparent',
                    color: 'var(--mode-text)'
                  }}
                >
                  <List size={16} />
                </button>
              </div>
              
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilters({status: '', studentId: '', courseId: '', monthYear: ''})}
                className="px-4 py-3 rounded-xl border transition-all duration-200 hover:shadow-lg"
                style={{
                  backgroundColor: 'var(--mode-surface)',
                  color: 'var(--mode-text)',
                  borderColor: 'var(--mode-border)'
                }}
              >
                <RefreshCw className="h-4 w-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Payments Display */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {activeTab === 'current' ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {payments.map((payment, index) => (
                  <motion.div
                    key={payment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.03, y: -8 }}
                    className="rounded-3xl p-6 shadow-xl border-2 transition-all duration-300"
                    style={{
                      backgroundColor: 'var(--mode-card)',
                      borderColor: payment.status === 'PAID' ? 'var(--mode-success)' : 
                                   payment.status === 'OVERDUE' ? 'var(--mode-error)' : 'var(--mode-border)',
                      boxShadow: `0 15px 40px ${payment.status === 'PAID' ? 'var(--mode-success)20' : 
                                         payment.status === 'OVERDUE' ? 'var(--mode-error)20' : 'var(--mode-shadow)20'}`
                    }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div 
                            className="w-12 h-12 rounded-xl overflow-hidden border-2 flex items-center justify-center shadow-lg"
                            style={{
                              borderColor: 'var(--mode-border)',
                              backgroundColor: 'var(--mode-surface)',
                            }}
                          >
                            {payment.studentPhotoUrl ? (
                              <img
                                src={payment.studentPhotoUrl}
                                alt={`${payment.studentName}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.currentTarget as HTMLImageElement;
                                  target.style.display = 'none';
                                  const sibling = target.nextElementSibling as HTMLElement;
                                  if (sibling) {
                                    sibling.style.display = 'flex';
                                  }
                                }}
                              />
                            ) : null}
                            <div className={`w-full h-full flex items-center justify-center ${
                              !payment.studentPhotoUrl ? 'flex' : 'hidden'
                            }`}>
                              <User className="h-6 w-6" style={{ color: 'var(--mode-textSecondary)' }} />
                            </div>
                          </div>
                        </div>
                        <div>
                          <h3 
                            className="text-sm font-bold"
                            style={{ color: 'var(--mode-text)' }}
                          >
                            {payment.studentName}
                          </h3>
                          {payment.studentNameArabic && (
                            <p 
                              className="text-xs"
                              style={{ color: 'var(--mode-textSecondary)' }}
                            >
                              {payment.studentNameArabic}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(payment.status)}
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div 
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                        style={{ 
                          backgroundColor: `${getStatusColor(payment.status)}20`,
                          color: getStatusColor(payment.status)
                        }}
                      >
                        {getStatusText(payment.status)}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span 
                          className="text-sm"
                          style={{ color: 'var(--mode-textSecondary)' }}
                        >
                          {t('extraPayments.course')}:
                        </span>
                        <span 
                          className="text-sm font-medium"
                          style={{ color: 'var(--mode-text)' }}
                        >
                          {payment.courseName}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span 
                          className="text-sm"
                          style={{ color: 'var(--mode-textSecondary)' }}
                        >
                          {t('extraPayments.amount')}:
                        </span>
                        <span 
                          className="text-sm font-bold"
                          style={{ color: 'var(--mode-primary)' }}
                        >
                          {formatCurrency(payment.amount)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span 
                          className="text-sm"
                          style={{ color: 'var(--mode-textSecondary)' }}
                        >
                          {t('extraPayments.dueDate')}:
                        </span>
                        <span 
                          className="text-sm font-medium"
                          style={{ color: 'var(--mode-text)' }}
                        >
                          {formatDate(payment.dueDate)}
                        </span>
                      </div>
                      
                      {payment.paidDate && (
                        <div className="flex items-center justify-between">
                          <span 
                            className="text-sm"
                            style={{ color: 'var(--mode-textSecondary)' }}
                          >
                            {t('extraPayments.paidDate')}:
                          </span>
                          <span 
                            className="text-sm font-medium"
                            style={{ color: 'var(--mode-text)' }}
                          >
                            {formatDate(payment.paidDate)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      {payment.status !== 'PAID' && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => markPaymentAsPaid(payment.id)}
                          className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200"
                          style={{
                            backgroundColor: '#10b98120',
                            color: '#10b981'
                          }}
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm font-medium">{t('extraPayments.markPaid')}</span>
                        </motion.button>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handlePrintReceipt(payment)}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200"
                        style={{
                          backgroundColor: 'var(--mode-primary)20',
                          color: 'var(--mode-primary)'
                        }}
                      >
                        <Printer className="h-4 w-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div 
                className="rounded-2xl shadow-lg border overflow-hidden"
                style={{
                  backgroundColor: 'var(--mode-card)',
                  borderColor: 'var(--mode-border)',
                  boxShadow: `0 10px 30px var(--mode-shadow)20`
                }}
              >
                <div className="overflow-x-auto">
                  <table className="w-full table-fixed divide-y" style={{ borderColor: 'var(--mode-border)' }}>
                    <thead style={{ 
                      background: `linear-gradient(to bottom right, var(--mode-primary), var(--mode-secondary))`
                    }}>
                      <tr>
                        <th className="w-1/4 px-3 py-4 text-center text-xs font-medium uppercase tracking-wider text-white">{t('extraPayments.table.student')}</th>
                        <th className="w-1/6 px-3 py-4 text-center text-xs font-medium uppercase tracking-wider text-white">{t('extraPayments.table.course')}</th>
                        <th className="w-1/6 px-3 py-4 text-center text-xs font-medium uppercase tracking-wider text-white">{t('extraPayments.table.amount')}</th>
                        <th className="w-1/6 px-3 py-4 text-center text-xs font-medium uppercase tracking-wider text-white">{t('extraPayments.table.status')}</th>
                        <th className="w-1/6 px-3 py-4 text-center text-xs font-medium uppercase tracking-wider text-white">{t('extraPayments.table.dueDate')}</th>
                        <th className="w-1/6 px-3 py-4 text-center text-xs font-medium uppercase tracking-wider text-white">{t('extraPayments.table.paidDate')}</th>
                        <th className="w-1/6 px-3 py-4 text-center text-xs font-medium uppercase tracking-wider text-white">{t('extraPayments.table.actions')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: 'var(--mode-border)' }}>
                      {payments.map((payment, index) => (
                        <motion.tr
                          key={payment.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:opacity-80 transition-opacity duration-200"
                          style={{ backgroundColor: 'var(--mode-card)' }}
                        >
                          <td className="px-3 py-4">
                            <div className="flex items-center justify-center">
                              <div className="relative mr-3">
                                <div 
                                  className="w-8 h-8 rounded-full overflow-hidden border-2"
                                  style={{ borderColor: 'var(--mode-border)' }}
                                >
                                  {payment.studentPhotoUrl ? (
                                    <img 
                                      src={payment.studentPhotoUrl}
                                      alt={`${payment.studentName}`}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        const target = e.currentTarget as HTMLImageElement;
                                        target.style.display = 'none';
                                        const sibling = target.nextElementSibling as HTMLElement;
                                        if (sibling) {
                                          sibling.style.display = 'flex';
                                        }
                                      }}
                                    />
                                  ) : null}
                                  <div className={`w-full h-full flex items-center justify-center ${
                                    !payment.studentPhotoUrl ? 'flex' : 'hidden'
                                  }`} style={{ backgroundColor: 'var(--mode-surface)' }}>
                                    <User className="h-4 w-4" style={{ color: 'var(--mode-textSecondary)' }} />
                                  </div>
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-sm font-medium truncate" style={{ color: 'var(--mode-text)' }}>
                                  {payment.studentName}
                                </div>
                                {payment.studentNameArabic && (
                                  <div className="text-xs truncate" style={{ color: 'var(--mode-textSecondary)' }}>
                                    {payment.studentNameArabic}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-4 text-center">
                            <div 
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                              style={{ 
                                backgroundColor: 'var(--mode-primary)20',
                                color: 'var(--mode-primary)'
                              }}
                            >
                              {payment.courseName}
                            </div>
                          </td>
                          <td className="px-3 py-4 text-center text-sm font-bold" style={{ color: 'var(--mode-primary)' }}>
                            {formatCurrency(payment.amount)}
                          </td>
                          <td className="px-3 py-4 text-center">
                            <div className="flex items-center justify-center space-x-1">
                              {getStatusIcon(payment.status)}
                              <span className="text-sm" style={{ color: 'var(--mode-text)' }}>
                                {getStatusText(payment.status)}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-4 text-center text-sm" style={{ color: 'var(--mode-text)' }}>
                            {formatDate(payment.dueDate)}
                          </td>
                          <td className="px-3 py-4 text-center text-sm" style={{ color: 'var(--mode-text)' }}>
                            {payment.paidDate ? formatDate(payment.paidDate) : (
                              <span style={{ color: 'var(--mode-textSecondary)' }}>-</span>
                            )}
                          </td>
                          <td className="px-3 py-4 text-center">
                            <div className="flex justify-center space-x-1">
                              {payment.status !== 'PAID' && (
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => markPaymentAsPaid(payment.id)}
                                  className="p-2 rounded-md transition-all duration-200"
                                  style={{
                                    backgroundColor: '#10b98120',
                                    color: '#10b981'
                                  }}
                                  title={t('extraPayments.markPaid')}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </motion.button>
                              )}
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handlePrintReceipt(payment)}
                                className="p-2 rounded-md transition-all duration-200"
                                style={{
                                  backgroundColor: 'var(--mode-primary)20',
                                  color: 'var(--mode-primary)'
                                }}
                                title={t('extraPayments.printReceipt')}
                              >
                                <Printer className="h-4 w-4" />
                              </motion.button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          ) : (
            // Payment History Tab - Monthly View
            <div className="space-y-6">
              {Object.keys(paymentHistoryByMonth).length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-16"
                >
                  <div 
                    className="mx-auto h-24 w-24 rounded-full flex items-center justify-center mb-6"
                    style={{ backgroundColor: 'var(--mode-surface)' }}
                  >
                    <Clock className="h-12 w-12" style={{ color: 'var(--mode-textSecondary)' }} />
                  </div>
                  <h3 
                    className="text-xl font-bold mb-2"
                    style={{ color: 'var(--mode-text)' }}
                  >
                    {t('extraPayments.noHistoryFound')}
                  </h3>
                  <p 
                    className="text-lg"
                    style={{ color: 'var(--mode-textSecondary)' }}
                  >
                    {t('extraPayments.noHistoryDescription')}
                  </p>
                </motion.div>
              ) : (
                Object.entries(paymentHistoryByMonth)
                  .sort(([a], [b]) => b.localeCompare(a)) // Sort by date descending
                  .map(([monthKey, payments], monthIndex) => (
                    <motion.div
                      key={monthKey}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: monthIndex * 0.1 }}
                      className="rounded-2xl shadow-lg border overflow-hidden"
                      style={{
                        backgroundColor: 'var(--mode-card)',
                        borderColor: 'var(--mode-border)',
                        boxShadow: `0 10px 30px var(--mode-shadow)20`
                      }}
                    >
                      {/* Month Header */}
                      <div 
                        className="px-6 py-4 border-b"
                        style={{ 
                          backgroundColor: 'var(--mode-surface)',
                          borderColor: 'var(--mode-border)'
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div 
                              className="p-3 rounded-xl"
                              style={{ backgroundColor: 'var(--mode-primary)20' }}
                            >
                              <Calendar className="h-6 w-6" style={{ color: 'var(--mode-primary)' }} />
                            </div>
                            <div>
                              <h3 
                                className="text-xl font-bold"
                                style={{ color: 'var(--mode-text)' }}
                              >
                                {getMonthYearFromKey(monthKey)}
                              </h3>
                              <p 
                                className="text-sm"
                                style={{ color: 'var(--mode-textSecondary)' }}
                              >
                                {payments.length} {t('extraPayments.payments')}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div 
                              className="text-lg font-bold"
                              style={{ color: 'var(--mode-primary)' }}
                            >
                              {formatCurrency(getPaidAmountForMonth(payments))}
                            </div>
                            <div 
                              className="text-sm"
                              style={{ color: 'var(--mode-textSecondary)' }}
                            >
                              / {formatCurrency(getTotalAmountForMonth(payments))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Payments List */}
                      <div className="divide-y" style={{ borderColor: 'var(--mode-border)' }}>
                        {payments.map((payment, paymentIndex) => (
                          <motion.div
                            key={payment.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: paymentIndex * 0.05 }}
                            className="p-6 hover:opacity-80 transition-opacity duration-200"
                            style={{ backgroundColor: 'var(--mode-surface)' }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="relative">
                                  <div 
                                    className="w-12 h-12 rounded-xl overflow-hidden border-2 flex items-center justify-center shadow-lg"
                                    style={{
                                      borderColor: 'var(--mode-border)',
                                      backgroundColor: 'var(--mode-card)',
                                    }}
                                  >
                                    {payment.studentPhotoUrl ? (
                                      <img
                                        src={payment.studentPhotoUrl}
                                        alt={`${payment.studentName}`}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          const target = e.currentTarget as HTMLImageElement;
                                          target.style.display = 'none';
                                          const sibling = target.nextElementSibling as HTMLElement;
                                          if (sibling) {
                                            sibling.style.display = 'flex';
                                          }
                                        }}
                                      />
                                    ) : null}
                                    <div className={`w-full h-full flex items-center justify-center ${
                                      !payment.studentPhotoUrl ? 'flex' : 'hidden'
                                    }`}>
                                      <User className="h-6 w-6" style={{ color: 'var(--mode-textSecondary)' }} />
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <h4 
                                    className="text-sm font-bold"
                                    style={{ color: 'var(--mode-text)' }}
                                  >
                                    {payment.studentName}
                                  </h4>
                                  {payment.studentNameArabic && (
                                    <p 
                                      className="text-xs"
                                      style={{ color: 'var(--mode-textSecondary)' }}
                                    >
                                      {payment.studentNameArabic}
                                    </p>
                                  )}
                                  <div 
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1"
                                    style={{ 
                                      backgroundColor: 'var(--mode-primary)20',
                                      color: 'var(--mode-primary)'
                                    }}
                                  >
                                    {payment.courseName}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-4">
                                <div className="text-right">
                                  <div 
                                    className="text-sm font-bold"
                                    style={{ color: 'var(--mode-primary)' }}
                                  >
                                    {formatCurrency(payment.amount)}
                                  </div>
                                  <div 
                                    className="text-xs"
                                    style={{ color: 'var(--mode-textSecondary)' }}
                                  >
                                    {payment.paidDate ? formatDate(payment.paidDate) : formatDate(payment.dueDate)}
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  {getStatusIcon(payment.status)}
                                  <div 
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                                    style={{ 
                                      backgroundColor: `${getStatusColor(payment.status)}20`,
                                      color: getStatusColor(payment.status)
                                    }}
                                  >
                                    {getStatusText(payment.status)}
                                  </div>
                                </div>
                                
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handlePrintReceipt(payment)}
                                  className="p-2 rounded-lg transition-all duration-200"
                                  style={{
                                    backgroundColor: 'var(--mode-primary)20',
                                    color: 'var(--mode-primary)'
                                  }}
                                  title={t('extraPayments.printReceipt')}
                                >
                                  <Printer className="h-4 w-4" />
                                </motion.button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  ))
              )}
            </div>
          )}
        </motion.div>

        {payments.length === 0 && activeTab === 'current' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div 
              className="mx-auto h-24 w-24 rounded-full flex items-center justify-center mb-6"
              style={{ backgroundColor: 'var(--mode-surface)' }}
            >
              <CreditCard className="h-12 w-12" style={{ color: 'var(--mode-textSecondary)' }} />
            </div>
            <h3 
              className="text-xl font-bold mb-2"
              style={{ color: 'var(--mode-text)' }}
            >
              {t('extraPayments.noPaymentsFound')}
            </h3>
            <p 
              className="text-lg mb-6"
              style={{ color: 'var(--mode-textSecondary)' }}
            >
              {t('extraPayments.noPaymentsDescription')}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={generateMonthlyBills}
              className="flex items-center space-x-2 px-6 py-3 rounded-xl text-white mx-auto"
              style={{
                background: `linear-gradient(to right, var(--mode-primary), var(--mode-secondary))`
              }}
            >
              <Receipt className="h-5 w-5" />
              <span className="font-medium">{t('extraPayments.generateBills')}</span>
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Receipt Modal */}
      {showReceiptModal && selectedPayment && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            style={{
              backgroundColor: 'var(--mode-card)',
              borderColor: 'var(--mode-border)'
            }}
          >
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--mode-primary)20' }}>
                    <Printer className="h-6 w-6" style={{ color: 'var(--mode-primary)' }} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold" style={{ color: 'var(--mode-text)' }}>
                      {t('extraPayments.receipt.title')}
                    </h3>
                    <p className="text-sm" style={{ color: 'var(--mode-textSecondary)' }}>
                      {t('extraPayments.receipt.preview')}
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowReceiptModal(false)}
                  className="p-2 rounded-lg transition-colors"
                  style={{ 
                    backgroundColor: 'var(--mode-surface)',
                    color: 'var(--mode-textSecondary)'
                  }}
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>

              {/* Receipt Preview */}
              <div 
                className="rounded-xl p-6 mb-6 border-2 border-dashed"
                style={{ 
                  backgroundColor: 'var(--mode-surface)',
                  borderColor: 'var(--mode-border)'
                }}
              >
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center mb-4">
                    <img 
                      src="/logo.jpg" 
                      alt="Linarqa Logo" 
                      className="w-12 h-12 object-contain rounded-lg mr-3"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const sibling = target.nextElementSibling as HTMLElement;
                        if (sibling) sibling.style.display = 'block';
                      }}
                    />
                    <div className="text-2xl font-bold" style={{ color: 'var(--mode-primary)', display: 'none' }}>
                      Linarqa
                    </div>
                  </div>
                  <div className="text-lg font-semibold" style={{ color: 'var(--mode-text)' }}>
                    {t('extraPayments.receipt.title').toUpperCase()}
                  </div>
                  <div className="text-sm" style={{ color: 'var(--mode-textSecondary)' }}>
                    {t('extraPayments.receipt.subtitle')}
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between py-2 border-b" style={{ borderColor: 'var(--mode-border)' }}>
                    <span className="font-medium" style={{ color: 'var(--mode-textSecondary)' }}>
                      {t('extraPayments.receipt.student')}:
                    </span>
                    <span style={{ color: 'var(--mode-text)' }}>{selectedPayment.studentName}</span>
                  </div>
                  {selectedPayment.studentNameArabic && (
                    <div className="flex justify-between py-2 border-b" style={{ borderColor: 'var(--mode-border)' }}>
                      <span className="font-medium" style={{ color: 'var(--mode-textSecondary)' }}>
                        {t('extraPayments.receipt.studentArabic')}:
                      </span>
                      <span style={{ color: 'var(--mode-text)' }}>{selectedPayment.studentNameArabic}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 border-b" style={{ borderColor: 'var(--mode-border)' }}>
                    <span className="font-medium" style={{ color: 'var(--mode-textSecondary)' }}>
                      {t('extraPayments.receipt.course')}:
                    </span>
                    <span style={{ color: 'var(--mode-text)' }}>{selectedPayment.courseName}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b" style={{ borderColor: 'var(--mode-border)' }}>
                    <span className="font-medium" style={{ color: 'var(--mode-textSecondary)' }}>
                      {t('extraPayments.receipt.dueDate')}:
                    </span>
                    <span style={{ color: 'var(--mode-text)' }}>{formatDate(selectedPayment.dueDate)}</span>
                  </div>
                  {selectedPayment.paidDate && (
                    <div className="flex justify-between py-2 border-b" style={{ borderColor: 'var(--mode-border)' }}>
                      <span className="font-medium" style={{ color: 'var(--mode-textSecondary)' }}>
                        {t('extraPayments.receipt.paidDate')}:
                      </span>
                      <span style={{ color: 'var(--mode-text)' }}>{formatDate(selectedPayment.paidDate)}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 border-b" style={{ borderColor: 'var(--mode-border)' }}>
                    <span className="font-medium" style={{ color: 'var(--mode-textSecondary)' }}>
                      {t('extraPayments.receipt.status')}:
                    </span>
                    <span 
                      className="px-2 py-1 rounded-full text-xs font-medium"
                      style={{ 
                        backgroundColor: `${getStatusColor(selectedPayment.status)}20`,
                        color: getStatusColor(selectedPayment.status)
                      }}
                    >
                      {getStatusText(selectedPayment.status)}
                    </span>
                  </div>
                </div>

                <div 
                  className="rounded-lg p-4 text-center mb-4"
                  style={{ backgroundColor: 'var(--mode-card)' }}
                >
                  <div className="text-sm mb-1" style={{ color: 'var(--mode-textSecondary)' }}>
                    {t('extraPayments.receipt.amount')}
                  </div>
                  <div className="text-3xl font-bold" style={{ color: 'var(--mode-primary)' }}>
                    {formatCurrency(selectedPayment.amount)}
                  </div>
                </div>

                <div className="text-center mt-6 pt-4 border-t" style={{ borderColor: 'var(--mode-border)' }}>
                  <div className="text-sm" style={{ color: 'var(--mode-textSecondary)' }}>
                    {t('extraPayments.receipt.thankYou')}
                  </div>
                  <div className="text-xs mt-1" style={{ color: 'var(--mode-textSecondary)' }}>
                    {t('extraPayments.receipt.footer')}
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex space-x-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowReceiptModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg transition-colors font-medium"
                  style={{
                    backgroundColor: 'var(--mode-surface)',
                    color: 'var(--mode-text)'
                  }}
                >
                  {t('extraPayments.actions.cancel')}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={printReceipt}
                  className="flex-1 px-4 py-2 rounded-lg transition-colors font-medium flex items-center justify-center space-x-2"
                  style={{
                    background: `linear-gradient(to right, var(--mode-primary), var(--mode-secondary))`,
                    color: 'white'
                  }}
                >
                  <Printer className="h-4 w-4" />
                  <span>{t('extraPayments.actions.print')}</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default ExtraPaymentsPage;