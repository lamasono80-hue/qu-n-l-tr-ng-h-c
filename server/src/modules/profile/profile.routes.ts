import { Router } from 'express';
import { profileController } from './profile.controller';
import { authenticate, requireRole } from '../../middleware/auth.middleware';

// Profiles Router (/api/v1/profiles)
const profilesRouter = Router();

profilesRouter.get('/me', authenticate, requireRole(['STUDENT']), (req, res, next) =>
  profileController.getMyProfile(req, res, next)
);

profilesRouter.put('/me', authenticate, requireRole(['STUDENT']), (req, res, next) =>
  profileController.updateMyProfile(req, res, next)
);

profilesRouter.put('/me/skills', authenticate, requireRole(['STUDENT']), (req, res, next) =>
  profileController.updateMySkills(req, res, next)
);

profilesRouter.put('/me/courses', authenticate, requireRole(['STUDENT']), (req, res, next) =>
  profileController.updateMyCourses(req, res, next)
);

profilesRouter.get('/:userId', authenticate, requireRole(['STUDENT', 'ADMIN']), (req, res, next) =>
  profileController.getPublicProfile(req, res, next)
);

export const profileRoutes = profilesRouter;

// Skills Router (/api/v1/skills)
const skillsRouter = Router();

skillsRouter.get('/', authenticate, requireRole(['STUDENT', 'ADMIN']), (req, res, next) =>
  profileController.getSkills(req, res, next)
);

export const skillRoutes = skillsRouter;

// Courses Router (/api/v1/courses)
const coursesRouter = Router();

coursesRouter.get('/', authenticate, requireRole(['STUDENT', 'ADMIN']), (req, res, next) =>
  profileController.getCourses(req, res, next)
);

export const courseRoutes = coursesRouter;
