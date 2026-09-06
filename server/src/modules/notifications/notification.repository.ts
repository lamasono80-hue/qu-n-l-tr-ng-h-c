import { pool } from '../../config/database';
import { ListNotificationsQueryDto } from './notification.validation';

export interface NotificationRow {
  id: string;
  recipient_id: string;
  type: string;
  title: string;
  content: string;
  target_url: string | null;
  is_read: boolean;
  created_at: Date;
}

export class NotificationRepository {
  /**
   * API-NOTIF-01: List in-app notifications with unread count
   */
  async listNotifications(
    userId: string,
    query: ListNotificationsQueryDto
  ): Promise<{ rows: NotificationRow[]; total: number; unreadCount: number }> {
    // 1. Total unread count for user
    const unreadRes = await pool.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM notifications WHERE recipient_id = $1 AND is_read = FALSE;`,
      [userId]
    );
    const unreadCount = parseInt(unreadRes.rows[0].count, 10);

    // 2. Query conditions
    const conditions: string[] = ['recipient_id = $1'];
    const params: unknown[] = [userId];
    let paramIndex = 2;

    if (query.unread_only) {
      conditions.push(`is_read = FALSE`);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    // 3. Filtered total count
    const countSql = `SELECT COUNT(*)::text AS count FROM notifications ${whereClause};`;
    const countRes = await pool.query<{ count: string }>(countSql, params);
    const total = parseInt(countRes.rows[0].count, 10);

    // 4. Data rows
    const offset = (query.page - 1) * query.limit;
    const dataSql = `
      SELECT id, recipient_id, type, title, content, target_url, is_read, created_at
      FROM notifications
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++};
    `;

    const dataParams = [...params, query.limit, offset];
    const dataRes = await pool.query<NotificationRow>(dataSql, dataParams);

    return { rows: dataRes.rows, total, unreadCount };
  }

  async findById(notificationId: string): Promise<NotificationRow | null> {
    const res = await pool.query<NotificationRow>(
      `SELECT id, recipient_id, type, title, content, target_url, is_read, created_at
       FROM notifications
       WHERE id = $1;`,
      [notificationId]
    );
    return res.rows[0] || null;
  }

  async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    const res = await pool.query(
      `UPDATE notifications
       SET is_read = TRUE
       WHERE id = $1 AND recipient_id = $2
       RETURNING id;`,
      [notificationId, userId]
    );
    return (res.rowCount ?? 0) > 0;
  }

  async markAllAsRead(userId: string): Promise<number> {
    const res = await pool.query(
      `UPDATE notifications
       SET is_read = TRUE
       WHERE recipient_id = $1 AND is_read = FALSE;`,
      [userId]
    );
    return res.rowCount ?? 0;
  }
}

export const notificationRepository = new NotificationRepository();
