import { Router } from 'express';
import { projectController } from './project.controller';
import { authenticate, requireRole } from '../../middleware/auth.middleware';

const router = Router();

// 1. API-PM-08: List My Submitted Applications (Placed before /:id route)
router.get('/applications/me', authenticate, requireRole(['STUDENT']), (req, res, next) =>
  projectController.listMyApplications(req, res, next)
);

// 2. API-PM-07: Resolve Application (Accept / Decline) (Placed before /:id route)
router.patch('/applications/:applicationId', authenticate, requireRole(['STUDENT']), (req, res, next) =>
  projectController.resolveApplication(req, res, next)
);

// 3. API-PM-01: List & Filter Project Vacancies
router.get('/', authenticate, requireRole(['STUDENT', 'ADMIN']), (req, res, next) =>
  projectController.listProjects(req, res, next)
);

// 4. API-PM-03: Create Project Vacancy Post
router.post('/', authenticate, requireRole(['STUDENT']), (req, res, next) =>
  projectController.createProject(req, res, next)
);

// 5. API-PM-02: Get Project Vacancy Details
router.get('/:id', authenticate, requireRole(['STUDENT', 'ADMIN']), (req, res, next) =>
  projectController.getProjectDetail(req, res, next)
);

// 6. API-PM-04: Close Project Vacancy Post
router.patch('/:id/close', authenticate, requireRole(['STUDENT']), (req, res, next) =>
  projectController.closeProject(req, res, next)
);

// 7. API-PM-05: Submit Project Application
router.post('/:id/apply', authenticate, requireRole(['STUDENT']), (req, res, next) =>
  projectController.applyProject(req, res, next)
);

// 8. API-PM-06: List Received Applications for Project Post
router.get('/:id/applications', authenticate, requireRole(['STUDENT']), (req, res, next) =>
  projectController.listApplicationsForPost(req, res, next)
);

export const projectRoutes = router;
