import { api } from '@/lib/api';

export interface Notification {
  id: string;
  title: string;
  titleArabic?: string;
  message: string;
  messageArabic?: string;
  type: 'STUDENT_REGISTERED' | 'EXTRA_STUDENT_REGISTERED' | 'PAYMENT_CREATED' | 'EXTRA_PAYMENT_CREATED' | 'PAYMENT_MARKED_PAID' | 'EXTRA_PAYMENT_MARKED_PAID' | 'SYSTEM_ALERT' | 'GENERAL';
  status: 'UNREAD' | 'READ' | 'ARCHIVED';
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  readAt?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  createdByEmail?: string;
  createdByName?: string;
  createdByNameArabic?: string;
  targetUserEmail?: string;
}

export interface NotificationResponse {
  content: Notification[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

class NotificationService {
  async getNotifications(page: number = 0, size: number = 10): Promise<NotificationResponse> {
    const response = await api.get(`/notifications?page=${page}&size=${size}`);
    return response.data;
  }

  async getUnreadNotifications(): Promise<Notification[]> {
    const response = await api.get('/notifications/unread');
    return response.data;
  }

  async getUnreadNotificationCount(): Promise<number> {
    const response = await api.get('/notifications/unread/count');
    return response.data.count;
  }

  async markAsRead(notificationId: string): Promise<void> {
    await api.put(`/notifications/${notificationId}/read`, {});
  }

  async markAllAsRead(): Promise<void> {
    await api.put('/notifications/read-all', {});
  }

  async getAdminNotifications(page: number = 0, size: number = 10): Promise<NotificationResponse> {
    const response = await api.get(`/notifications/admin?page=${page}&size=${size}`);
    return response.data;
  }

  async getUnreadAdminNotifications(): Promise<Notification[]> {
    const response = await api.get('/notifications/admin/unread');
    return response.data;
  }

  async getUnreadAdminNotificationCount(): Promise<number> {
    const response = await api.get('/notifications/admin/unread/count');
    return response.data.count;
  }

  // New simple API methods
  async getAllNotifications(): Promise<Notification[]> {
    const response = await api.get('/notifications-simple/all');
    return response.data;
  }

  async getAllUnreadNotifications(): Promise<Notification[]> {
    const response = await api.get('/notifications-simple/unread');
    return response.data;
  }

  async getNotificationCounts(): Promise<{total: number, unread: number}> {
    const response = await api.get('/notifications-simple/count');
    return response.data;
  }

  // Test endpoint - completely open
  async testNotifications(): Promise<any> {
    const response = await api.get('/test-notifications');
    return response.data;
  }
}

export const notificationService = new NotificationService();
