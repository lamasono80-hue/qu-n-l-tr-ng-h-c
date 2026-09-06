import { Router } from 'express';
import { studyController } from './study.controller';
import { authenticate, requireRole } from '../../middleware/auth.middleware';

const router = Router();

// 1. API-SB-07: List My Sent Study Connection Requests (Placed before /:id route)
router.get('/connections/me', authenticate, requireRole(['STUDENT']), (req, res, next) =>
  studyController.listMyConnections(req, res, next)
);

// 2. API-SB-06: Resolve Study Connection (Accept / Decline) (Placed before /:id route)
router.patch('/connections/:connectionId', authenticate, requireRole(['STUDENT']), (req, res, next) =>
  studyController.resolveConnection(req, res, next)
);

// 3. API-SB-01: List & Filter Study Requests
router.get('/', authenticate, requireRole(['STUDENT', 'ADMIN']), (req, res, next) =>
  studyController.listStudyRequests(req, res, next)
);

// 4. API-SB-03: Create Study Buddy Request
router.post('/', authenticate, requireRole(['STUDENT']), (req, res, next) =>
  studyController.createStudyRequest(req, res, next)
);

// 5. API-SB-02: Get Study Request Details
router.get('/:id', authenticate, requireRole(['STUDENT', 'ADMIN']), (req, res, next) =>
  studyController.getStudyRequestDetail(req, res, next)
);

// 6. API-SB-04: Close Study Buddy Request
router.patch('/:id/close', authenticate, requireRole(['STUDENT']), (req, res, next) =>
  studyController.closeStudyRequest(req, res, next)
);

// 7. API-SB-05: Send Study Connection Request
router.post('/:id/connect', authenticate, requireRole(['STUDENT']), (req, res, next) =>
  studyController.connectStudyRequest(req, res, next)
);

export const studyRoutes = router;
