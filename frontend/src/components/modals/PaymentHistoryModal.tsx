import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Receipt, Calendar, DollarSign, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';

interface Payment {
  id: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'PAID' | 'UNPAID' | 'PARTIAL' | 'OVERDUE';
  paymentType: string;
  description?: string;
  month: number;
  year: number;
}

interface PaymentHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  studentName: string;
  studentType: 'KINDERGARTEN' | 'EXTRA_COURSE';
}

const PaymentHistoryModal: React.FC<PaymentHistoryModalProps> = ({
  isOpen,
  onClose,
  studentId,
  studentName,
  studentType
}) => {
  const { t, i18n } = useTranslation();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && studentId) {
      fetchPaymentHistory();
    }
  }, [isOpen, studentId]);

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const endpoint = studentType === 'KINDERGARTEN' 
        ? `/payments/student/${studentId}`
        : `/extra-payments/student/${studentId}`;
      
      const response = await api.get(endpoint);
      setPayments(response.data || []);
    } catch (error) {
      console.error('Error fetching payment history:', error);
      setError(t('students.paymentHistoryError'));
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'UNPAID':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'PARTIAL':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'OVERDUE':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PAID':
        return t('payments.status.paid');
      case 'UNPAID':
        return t('payments.status.unpaid');
      case 'PARTIAL':
        return t('payments.status.partial');
      case 'OVERDUE':
        return t('payments.status.overdue');
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'text-green-600 bg-green-100';
      case 'UNPAID':
        return 'text-red-600 bg-red-100';
      case 'PARTIAL':
        return 'text-yellow-600 bg-yellow-100';
      case 'OVERDUE':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getMonthName = (month: number) => {
    const months = [
      '', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return months[month] || '';
  };

  const getMonthNameArabic = (month: number) => {
    const months = [
      '', 'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    return months[month] || '';
  };

  const totalPaid = payments
    .filter(p => p.status === 'PAID')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalUnpaid = payments
    .filter(p => p.status !== 'PAID')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Receipt className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t('students.paymentHistory')}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {studentName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Summary Cards */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    {t('students.totalPaid')}
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(totalPaid)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
              <div className="flex items-center">
                <XCircle className="h-8 w-8 text-red-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">
                    {t('students.totalUnpaid')}
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(totalUnpaid)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    {t('students.totalAmount')}
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(totalAmount)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">
                {t('students.loadingPaymentHistory')}
              </span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                {t('students.noPaymentsFound')}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {payments
                .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
                .map((payment) => (
                  <div
                    key={payment.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(payment.status)}
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {i18n.language === 'ar' 
                                ? getMonthNameArabic(payment.month) 
                                : getMonthName(payment.month)
                              } {payment.year}
                            </h3>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              ({payment.paymentType})
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {t('students.dueDate')}: {formatDate(payment.dueDate)}
                              </span>
                            </div>
                            {payment.paidDate && (
                              <div className="flex items-center space-x-1">
                                <CheckCircle className="h-4 w-4" />
                                <span>
                                  {t('students.paidDate')}: {formatDate(payment.paidDate)}
                                </span>
                              </div>
                            )}
                          </div>
                          {payment.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {payment.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(payment.amount)}
                        </p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                          {getStatusText(payment.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentHistoryModal;
