import { Router } from 'express';
import { notificationController } from './notification.controller';
import { authenticate, requireRole } from '../../middleware/auth.middleware';

const router = Router();

// 1. API-NOTIF-03: Mark All Notifications as Read (Placed before /:id route)
router.patch('/read-all', authenticate, requireRole(['STUDENT', 'ADMIN']), (req, res, next) =>
  notificationController.markAllAsRead(req, res, next)
);

// 2. API-NOTIF-02: Mark Notification as Read
router.patch('/:id/read', authenticate, requireRole(['STUDENT', 'ADMIN']), (req, res, next) =>
  notificationController.markAsRead(req, res, next)
);

// 3. API-NOTIF-01: List In-App Notifications
router.get('/', authenticate, requireRole(['STUDENT', 'ADMIN']), (req, res, next) =>
  notificationController.listNotifications(req, res, next)
);

export const notificationRoutes = router;
