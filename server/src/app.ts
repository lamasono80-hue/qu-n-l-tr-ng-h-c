import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { config } from './config/env';
import { errorHandler } from './middleware/error.middleware';
import { authRoutes } from './modules/auth/auth.routes';
import { profileRoutes, skillRoutes, courseRoutes } from './modules/profile/profile.routes';
import { projectRoutes } from './modules/project-match/project.routes';
import { studyRoutes } from './modules/study-buddy/study.routes';
import { skillExchangeRoutes } from './modules/skill-exchange/skill.routes';
import { chatRoutes } from './modules/chat/chat.routes';
import { notificationRoutes } from './modules/notifications/notification.routes';
import { adminRoutes } from './modules/admin/admin.routes';
import { sendSuccess } from './utils/response';

export function createApp(): Express {
  const app = express();

  // Global Middleware
  app.use(cors({
    origin: config.clientUrl,
    credentials: true,
  }));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // Root Healthcheck Endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    return sendSuccess(res, {
      status: 'healthy',
      service: 'uniconnect-api',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    }, 'UniConnect API service is operating normally');
  });

  // Mount API Module Routes (47 Approved Endpoints across 8 Modules)
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/profiles', profileRoutes);
  app.use('/api/v1/skills', skillRoutes);
  app.use('/api/v1/courses', courseRoutes);
  app.use('/api/v1/projects', projectRoutes);
  app.use('/api/v1/study-requests', studyRoutes);
  app.use('/api/v1/skill-listings', skillExchangeRoutes);
  app.use('/api/v1/conversations', chatRoutes);
  app.use('/api/v1/notifications', notificationRoutes);
  app.use('/api/v1/admin', adminRoutes);

  // Global Fallback 404 Handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: `Endpoint ${req.method} ${req.originalUrl} không tồn tại trên hệ thống`,
      },
    });
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
}
