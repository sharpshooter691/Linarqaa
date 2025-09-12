import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useMode } from "@/contexts/ModeContext";
import { LogOut, Globe, Bell, UserPlus, CreditCard, Users, AlertCircle, CheckCircle } from "lucide-react";
import ModeToggle from "@/components/ui/ModeToggle";
import { notificationService, Notification } from "@/services/notificationService";

const TopBar: React.FC = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { currentLanguage, setLanguage } = useLanguage();
  const { mode } = useMode();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLanguageToggle = () => {
    setLanguage((currentLanguage as string) === 'fr' ? 'ar' : 'fr');
  };

  const handleLogout = () => {
    logout();
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Fetch notifications on component mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      
      // Debug authentication state
      console.log('🔍 TopBar fetchNotifications - User:', user);
      console.log('🔍 TopBar fetchNotifications - JWT Token:', localStorage.getItem('jwt-token') ? 'Present' : 'Missing');
      
      // Use the new simple API endpoint
      console.log('🔔 Fetching notifications using new API...');
      const unreadNotifications = await notificationService.getAllUnreadNotifications();
      console.log('✅ Notifications fetched successfully:', unreadNotifications.length);
      setNotifications(unreadNotifications);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };


  const markAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => 
        prev.map(n => ({ ...n, isRead: true }))
      );
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };


  const isRTL = (currentLanguage as string) === 'ar' as const;

  // Get icon for notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'STUDENT_REGISTERED':
        return <UserPlus className="h-4 w-4 text-blue-500" />;
      case 'EXTRA_STUDENT_REGISTERED':
        return <Users className="h-4 w-4 text-green-500" />;
      case 'PAYMENT_CREATED':
        return <CreditCard className="h-4 w-4 text-yellow-500" />;
      case 'EXTRA_PAYMENT_CREATED':
        return <CreditCard className="h-4 w-4 text-orange-500" />;
      case 'PAYMENT_MARKED_PAID':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'EXTRA_PAYMENT_MARKED_PAID':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'SYSTEM_ALERT':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  // Get notification type color
  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'STUDENT_REGISTERED':
        return 'border-l-blue-500 bg-blue-50';
      case 'EXTRA_STUDENT_REGISTERED':
        return 'border-l-green-500 bg-green-50';
      case 'PAYMENT_CREATED':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'EXTRA_PAYMENT_CREATED':
        return 'border-l-orange-500 bg-orange-50';
      case 'PAYMENT_MARKED_PAID':
        return 'border-l-green-600 bg-green-100';
      case 'EXTRA_PAYMENT_MARKED_PAID':
        return 'border-l-green-600 bg-green-100';
      case 'SYSTEM_ALERT':
        return 'border-l-red-500 bg-red-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  return (
    <header 
      className="shadow-sm border-b transition-all duration-300"
      style={{
        background: `linear-gradient(135deg, var(--mode-primary)15, var(--mode-secondary)15)`,
        backgroundColor: 'var(--mode-background)',
        borderBottomColor: 'var(--mode-border)',
        boxShadow: `0 2px 10px var(--mode-shadow)20`,
      }}
    >
      <div className={`flex items-center justify-between h-16 px-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
        {isRTL ? (
          // Arabic RTL layout: buttons on left, title on right
          <>
            <div className="flex items-center space-x-reverse space-x-4">
              {/* Mode Toggle */}
              <ModeToggle />
              
              {/* Notification Bell - Only show for admin users */}
              {user && user.role === 'OWNER' && (
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 rounded-lg border transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--mode-primary)20',
                      borderColor: 'var(--mode-primary)',
                      color: 'var(--mode-text)',
                    }}
                  >
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                      <span 
                        className="absolute -top-1 -right-1 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                        style={{ backgroundColor: 'var(--mode-primary)' }}
                      >
                        {unreadCount}
                      </span>
                    )}
                  </button>
            
                  {/* Notification Dropdown */}
                  {showNotifications && (
                    <div 
                      className={`absolute mt-2 w-96 rounded-xl shadow-2xl border z-50 ${isRTL ? 'left-0' : 'right-0'}`}
                      style={{
                        backgroundColor: 'var(--mode-surface)',
                        borderColor: 'var(--mode-border)',
                        boxShadow: `0 20px 40px var(--mode-shadow)40`,
                      }}
                    >
                      <div 
                        className="p-4 border-b flex items-center justify-between"
                        style={{ borderBottomColor: 'var(--mode-border)' }}
                      >
                        <div className="flex items-center space-x-2">
                          <Bell className="h-5 w-5 text-blue-500" />
                          <h3 
                            className="font-semibold text-lg"
                            style={{ color: 'var(--mode-text)' }}
                          >
                            {(currentLanguage as string) === 'ar' ? 'الإشعارات' : 'Notifications'}
                          </h3>
                        </div>
                        {unreadCount > 0 && (
                          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {loading ? (
                          <div 
                            className="p-4 text-center"
                            style={{ color: 'var(--mode-textSecondary)' }}
                          >
                            {t('common.loading')}
                          </div>
                        ) : notifications.length === 0 ? (
                          <div 
                            className="p-4 text-center"
                            style={{ color: 'var(--mode-textSecondary)' }}
                          >
                            {(currentLanguage as string) === 'ar' ? 'لا توجد إشعارات' : 'Aucune notification'}
                          </div>
                        ) : (
                          notifications.map(notification => {
                            const displayMessage = (currentLanguage as string) === 'ar' && notification.messageArabic 
                              ? notification.messageArabic 
                              : notification.message;
                            const displayTitle = (currentLanguage as string) === 'ar' && notification.titleArabic 
                              ? notification.titleArabic 
                              : notification.title;
                            
                            return (
                              <div 
                                key={notification.id}
                                className={`p-4 border-b cursor-pointer transition-all duration-200 hover:shadow-md ${
                                  !notification.isRead ? 'opacity-100' : 'opacity-70'
                                } border-l-4 ${getNotificationColor(notification.type)}`}
                                style={{
                                  borderBottomColor: 'var(--mode-border)',
                                  backgroundColor: !notification.isRead ? 'var(--mode-background)' : 'transparent',
                                }}
                                onClick={() => markAsRead(notification.id)}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = 'var(--mode-background)';
                                  e.currentTarget.style.transform = 'translateX(2px)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = !notification.isRead ? 'var(--mode-background)' : 'transparent';
                                  e.currentTarget.style.transform = 'translateX(0)';
                                }}
                              >
                                <div className="flex items-start space-x-3">
                                  <div className="flex-shrink-0 mt-1">
                                    {getNotificationIcon(notification.type)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                      <p 
                                        className="text-sm font-semibold truncate"
                                        style={{ color: 'var(--mode-text)' }}
                                      >
                                        {displayTitle}
                                      </p>
                                      {!notification.isRead && (
                                        <div 
                                          className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"
                                        ></div>
                                      )}
                                    </div>
                                    <p 
                                      className="text-xs mt-1 line-clamp-2"
                                      style={{ color: 'var(--mode-textSecondary)' }}
                                    >
                                      {displayMessage}
                                    </p>
                                    {notification.createdByName && (
                                      <p 
                                        className="text-xs mt-1 font-medium"
                                        style={{ color: 'var(--mode-primary)' }}
                                      >
                                        {(currentLanguage as string) === 'ar' && notification.createdByNameArabic 
                                          ? notification.createdByNameArabic 
                                          : notification.createdByName}
                                      </p>
                                    )}
                                    <div className="flex items-center justify-between mt-2">
                                      <p 
                                        className="text-xs"
                                        style={{ color: 'var(--mode-textSecondary)' }}
                                      >
                                        {new Date(notification.createdAt).toLocaleString()}
                                      </p>
                                      {!notification.isRead && (
                                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                                          {(currentLanguage as string) === 'ar' ? 'جديد' : 'Nouveau'}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                      <div 
                        className="p-4 border-t bg-gray-50"
                        style={{ borderTopColor: 'var(--mode-border)' }}
                      >
                        <button 
                          className="w-full flex items-center justify-center space-x-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200 py-2 px-4 rounded-lg hover:bg-blue-50"
                          onClick={markAllAsRead}
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span>{(currentLanguage as string) === 'ar' ? 'تحديد الكل كمقروء' : 'Tout marquer comme lu'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={handleLanguageToggle}
                className={`flex items-center p-2 rounded-lg border transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}
                style={{
                  backgroundColor: 'var(--mode-primary)20',
                  borderColor: 'var(--mode-primary)',
                  color: 'var(--mode-text)',
                }}
              >
                <Globe className="h-4 w-4" />
                <span>{(currentLanguage as string) === 'fr' ? t('sidebar.arabic') : t('sidebar.french')}</span>
              </button>
              
              <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
                <div className={`text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                  <p 
                    className="font-medium"
                    style={{ color: 'var(--mode-text)' }}
                  >
                    {user?.fullNameArabic || user?.fullName}
                  </p>
                  <p 
                    style={{ color: 'var(--mode-textSecondary)' }}
                  >
                    {user?.email}
                  </p>
                </div>
                
                <button
                  onClick={handleLogout}
                  className={`flex items-center p-2 rounded-lg border transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}
                  style={{
                    backgroundColor: 'var(--mode-primary)20',
                    borderColor: 'var(--mode-primary)',
                    color: 'var(--mode-text)',
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  <span>{t("auth.logout")}</span>
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <h2 
                className="text-lg font-semibold transition-colors duration-300"
                style={{ color: 'var(--mode-text)' }}
              >
                {mode === 'kindergarten' ? t('sidebar.students') + ' & ' + t('dashboard.attendance') : t('sidebar.extraCourses') + ' & ' + t('staff.title')}
              </h2>
            </div>
          </>
        ) : (
          // French LTR layout: title on left, buttons on right (normal layout)
          <>
            <div className="flex items-center space-x-4">
              <h2 
                className="text-lg font-semibold transition-colors duration-300"
                style={{ color: 'var(--mode-text)' }}
              >
                {mode === 'kindergarten' ? t('sidebar.students') + ' & ' + t('dashboard.attendance') : t('sidebar.extraCourses') + ' & ' + t('staff.title')}
              </h2>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Mode Toggle */}
              <ModeToggle />
              
              {/* Notification Bell - Only show for admin users */}
              {user && user.role === 'OWNER' && (
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 rounded-lg border transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--mode-primary)20',
                      borderColor: 'var(--mode-primary)',
                      color: 'var(--mode-text)',
                    }}
                  >
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                      <span 
                        className="absolute -top-1 -right-1 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                        style={{ backgroundColor: 'var(--mode-primary)' }}
                      >
                        {unreadCount}
                      </span>
                    )}
                  </button>
                
                {/* Notification Dropdown */}
                {showNotifications && (
                  <div 
                    className="absolute mt-2 w-96 rounded-xl shadow-2xl border z-50 right-0"
                    style={{
                      backgroundColor: 'var(--mode-surface)',
                      borderColor: 'var(--mode-border)',
                      boxShadow: `0 20px 40px var(--mode-shadow)40`,
                    }}
                  >
                    <div 
                      className="p-4 border-b flex items-center justify-between"
                      style={{ borderBottomColor: 'var(--mode-border)' }}
                    >
                      <div className="flex items-center space-x-2">
                        <Bell className="h-5 w-5 text-blue-500" />
                        <h3 
                          className="font-semibold text-lg"
                          style={{ color: 'var(--mode-text)' }}
                        >
                          {(currentLanguage as string) === 'ar' ? 'الإشعارات' : 'Notifications'}
                        </h3>
                      </div>
                      {unreadCount > 0 && (
                        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {loading ? (
                        <div 
                          className="p-4 text-center"
                          style={{ color: 'var(--mode-textSecondary)' }}
                        >
                          {t('common.loading')}
                        </div>
                      ) : notifications.length === 0 ? (
                        <div 
                          className="p-4 text-center"
                          style={{ color: 'var(--mode-textSecondary)' }}
                        >
                          {(currentLanguage as string) === 'ar' ? 'لا توجد إشعارات' : 'Aucune notification'}
                        </div>
                      ) : (
                        notifications.map(notification => {
                          const displayMessage = (currentLanguage as string) === 'ar' && notification.messageArabic 
                            ? notification.messageArabic 
                            : notification.message;
                          const displayTitle = (currentLanguage as string) === 'ar' && notification.titleArabic 
                            ? notification.titleArabic 
                            : notification.title;
                          
                          return (
                            <div 
                              key={notification.id}
                              className={`p-4 border-b cursor-pointer transition-all duration-200 hover:shadow-md ${
                                !notification.isRead ? 'opacity-100' : 'opacity-70'
                              } border-l-4 ${getNotificationColor(notification.type)}`}
                              style={{
                                borderBottomColor: 'var(--mode-border)',
                                backgroundColor: !notification.isRead ? 'var(--mode-background)' : 'transparent',
                              }}
                              onClick={() => markAsRead(notification.id)}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--mode-background)';
                                e.currentTarget.style.transform = 'translateX(2px)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = !notification.isRead ? 'var(--mode-background)' : 'transparent';
                                e.currentTarget.style.transform = 'translateX(0)';
                              }}
                            >
                              <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 mt-1">
                                  {getNotificationIcon(notification.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <p 
                                      className="text-sm font-semibold truncate"
                                      style={{ color: 'var(--mode-text)' }}
                                    >
                                      {displayTitle}
                                    </p>
                                    {!notification.isRead && (
                                      <div 
                                        className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"
                                      ></div>
                                    )}
                                  </div>
                                  <p 
                                    className="text-xs mt-1 line-clamp-2"
                                    style={{ color: 'var(--mode-textSecondary)' }}
                                  >
                                    {displayMessage}
                                  </p>
                                  {notification.createdByName && (
                                    <p 
                                      className="text-xs mt-1 font-medium"
                                      style={{ color: 'var(--mode-primary)' }}
                                    >
                                      {(currentLanguage as string) === 'ar' && notification.createdByNameArabic 
                                        ? notification.createdByNameArabic 
                                        : notification.createdByName}
                                    </p>
                                  )}
                                  <div className="flex items-center justify-between mt-2">
                                    <p 
                                      className="text-xs"
                                      style={{ color: 'var(--mode-textSecondary)' }}
                                    >
                                      {new Date(notification.createdAt).toLocaleString()}
                                    </p>
                                    {!notification.isRead && (
                                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                                        {(currentLanguage as string) === 'ar' ? 'جديد' : 'Nouveau'}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                    <div 
                      className="p-4 border-t bg-gray-50"
                      style={{ borderTopColor: 'var(--mode-border)' }}
                    >
                      <button 
                        className="w-full flex items-center justify-center space-x-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200 py-2 px-4 rounded-lg hover:bg-blue-50"
                        onClick={markAllAsRead}
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>{(currentLanguage as string) === 'ar' ? 'تحديد الكل كمقروء' : 'Tout marquer comme lu'}</span>
                      </button>
                    </div>
                  </div>
                )}
                </div>
              )}

              <button
                onClick={handleLanguageToggle}
                className="flex items-center p-2 rounded-lg border transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 space-x-2"
                style={{
                  backgroundColor: 'var(--mode-primary)20',
                  borderColor: 'var(--mode-primary)',
                  color: 'var(--mode-text)',
                }}
              >
                <Globe className="h-4 w-4" />
                <span>{(currentLanguage as string) === 'fr' ? t('sidebar.arabic') : t('sidebar.french')}</span>
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="text-sm text-left">
                  <p 
                    className="font-medium"
                    style={{ color: 'var(--mode-text)' }}
                  >
                    {user?.fullNameArabic || user?.fullName}
                  </p>
                  <p 
                    style={{ color: 'var(--mode-textSecondary)' }}
                  >
                    {user?.email}
                  </p>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center p-2 rounded-lg border transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 space-x-2"
                  style={{
                    backgroundColor: 'var(--mode-primary)20',
                    borderColor: 'var(--mode-primary)',
                    color: 'var(--mode-text)',
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  <span>{t("auth.logout")}</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default TopBar; 