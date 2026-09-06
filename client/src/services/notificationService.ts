// notificationService.ts
import { apiRequest } from './apiClient';
import { NotificationItem } from '../types';

export const notificationService = {
  // API-NOTIF-01
  getNotifications: (params: { page?: number; limit?: number; unread_only?: boolean } = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));
    if (params.unread_only) query.append('unread_only', 'true');
    return apiRequest<NotificationItem[]>(`/notifications?${query.toString()}`);
  },

  // API-NOTIF-02
  markAsRead: (id: string) =>
    apiRequest(`/notifications/${id}/read`, {
      method: 'PATCH',
    }),

  // API-NOTIF-03
  markAllAsRead: () =>
    apiRequest('/notifications/read-all', {
      method: 'PATCH',
    }),
};
