import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { notificationService } from './notification.service';
import {
  validateUuidParam,
  validateListNotificationsQuery,
} from './notification.validation';
import { sendSuccess } from '../../utils/response';
import { UnauthorizedError } from '../../utils/errors';

export class NotificationController {
  /**
   * API-NOTIF-01: List In-App Notifications
   * GET /api/v1/notifications
   */
  async listNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }
      const queryDto = validateListNotificationsQuery(req.query);
      const result = await notificationService.listNotifications(req.user.userId, queryDto);
      return sendSuccess(res, result.data, undefined, 200, result.meta);
    } catch (error) {
      next(error);
    }
  }

  /**
   * API-NOTIF-02: Mark Notification as Read
   * PATCH /api/v1/notifications/:id/read
   */
  async markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }
      const notificationId = validateUuidParam(req.params.id, 'id');
      const result = await notificationService.markNotificationAsRead(
        notificationId,
        req.user.userId
      );
      return sendSuccess(res, undefined, result.message);
    } catch (error) {
      next(error);
    }
  }

  /**
   * API-NOTIF-03: Mark All Notifications as Read
   * PATCH /api/v1/notifications/read-all
   */
  async markAllAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }
      const result = await notificationService.markAllNotificationsAsRead(req.user.userId);
      return sendSuccess(res, undefined, result.message);
    } catch (error) {
      next(error);
    }
  }
}

export const notificationController = new NotificationController();
