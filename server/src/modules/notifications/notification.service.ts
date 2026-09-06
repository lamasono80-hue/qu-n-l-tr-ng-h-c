import { notificationRepository, NotificationRow } from './notification.repository';
import { ListNotificationsQueryDto } from './notification.validation';
import { NotFoundError, ForbiddenError } from '../../utils/errors';

export class NotificationService {
  /**
   * API-NOTIF-01: List In-App Notifications
   */
  async listNotifications(userId: string, query: ListNotificationsQueryDto) {
    const { rows, total, unreadCount } = await notificationRepository.listNotifications(
      userId,
      query
    );

    const formatted = rows.map((r) => ({
      id: r.id,
      type: r.type,
      title: r.title,
      content: r.content,
      target_url: r.target_url,
      is_read: r.is_read,
      created_at: r.created_at.toISOString(),
    }));

    return {
      data: formatted,
      meta: {
        unread_count: unreadCount,
        page: query.page,
        limit: query.limit,
        total,
      },
    };
  }

  /**
   * API-NOTIF-02: Mark Notification as Read
   */
  async markNotificationAsRead(notificationId: string, userId: string) {
    const notif = await notificationRepository.findById(notificationId);
    if (!notif) {
      throw new NotFoundError('Không tìm thấy thông báo', 'NOTIFICATION_NOT_FOUND');
    }

    if (notif.recipient_id !== userId) {
      throw new ForbiddenError(
        'Bạn không có quyền cập nhật thông báo này.',
        'NOT_NOTIFICATION_RECIPIENT'
      );
    }

    await notificationRepository.markAsRead(notificationId, userId);

    return {
      message: 'Đã đánh dấu thông báo đã đọc',
    };
  }

  /**
   * API-NOTIF-03: Mark All Notifications as Read
   */
  async markAllNotificationsAsRead(userId: string) {
    await notificationRepository.markAllAsRead(userId);

    return {
      message: 'Đã đánh dấu tất cả thông báo là đã đọc',
    };
  }
}

export const notificationService = new NotificationService();
