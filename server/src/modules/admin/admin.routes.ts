import { Router } from 'express';
import { adminController } from './admin.controller';
import { authenticate, requireRole } from '../../middleware/auth.middleware';

const router = Router();

// Apply Global Admin Authentication & RBAC Filter
router.use(authenticate, requireRole(['ADMIN']));

// 1. API-ADM-01: Get System Analytics & Dashboard Stats
router.get('/stats', (req, res, next) => adminController.getStats(req, res, next));

// 2. API-ADM-02: List & Search User Accounts
router.get('/users', (req, res, next) => adminController.listUsers(req, res, next));

// 3. API-ADM-03: Update User Account Status (Suspend / Unban)
router.patch('/users/:id/status', (req, res, next) => adminController.updateUserStatus(req, res, next));

// 4. API-ADM-04: Soft Moderation Removal of Violating Listing
router.post('/listings/:entityType/:entityId/remove', (req, res, next) =>
  adminController.removeListing(req, res, next)
);

// 5. API-ADM-05: Add System Standard Skill
router.post('/skills', (req, res, next) => adminController.addSkill(req, res, next));

// 6. API-ADM-06: Add Standard Course to Catalog
router.post('/courses', (req, res, next) => adminController.addCourse(req, res, next));

export const adminRoutes = router;
