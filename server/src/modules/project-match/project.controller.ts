import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { projectService } from './project.service';
import {
  validateUuidParam,
  validateCreateProject,
  validateApplyProject,
  validateResolveApplication,
  validateListProjectsQuery,
  validateListMyApplicationsQuery,
} from './project.validation';
import { sendSuccess } from '../../utils/response';
import { UnauthorizedError } from '../../utils/errors';

export class ProjectController {
  /**
   * API-PM-01: List & Filter Project Vacancies
   * GET /api/v1/projects
   */
  async listProjects(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const queryDto = validateListProjectsQuery(req.query);
      const currentUserId = req.user ? req.user.userId : undefined;
      const result = await projectService.listProjects(queryDto, currentUserId);
      return sendSuccess(res, result.data, undefined, 200, result.meta);
    } catch (error) {
      next(error);
    }
  }

  /**
   * API-PM-02: Get Project Vacancy Details
   * GET /api/v1/projects/:id
   */
  async getProjectDetail(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const postId = validateUuidParam(req.params.id, 'id');
      const currentUserId = req.user ? req.user.userId : undefined;
      const data = await projectService.getProjectDetail(postId, currentUserId);
      return sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  /**
   * API-PM-03: Create Project Vacancy Post (BR-001 & BR-002)
   * POST /api/v1/projects
   */
  async createProject(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }
      const dto = validateCreateProject(req.body);
      const data = await projectService.createProject(req.user.userId, dto);
      return sendSuccess(res, data, 'Đăng tin tuyển thành viên dự án thành công', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * API-PM-04: Close Project Vacancy Post
   * PATCH /api/v1/projects/:id/close
   */
  async closeProject(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }
      const postId = validateUuidParam(req.params.id, 'id');
      const data = await projectService.closeProject(postId, req.user.userId);
      return sendSuccess(res, data, 'Đã đóng bài đăng tuyển dụng thành công');
    } catch (error) {
      next(error);
    }
  }

  /**
   * API-PM-05: Submit Project Application (BR-001, BR-003, BR-004, BR-005)
   * POST /api/v1/projects/:id/apply
   */
  async applyProject(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }
      const postId = validateUuidParam(req.params.id, 'id');
      const dto = validateApplyProject(req.body);
      const data = await projectService.applyProject(postId, req.user.userId, dto);
      return sendSuccess(res, data, 'Gửi đơn ứng tuyển thành công', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * API-PM-06: List Received Applications for Project Post
   * GET /api/v1/projects/:id/applications
   */
  async listApplicationsForPost(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }
      const postId = validateUuidParam(req.params.id, 'id');
      const data = await projectService.listApplicationsForPost(postId, req.user.userId);
      return sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  /**
   * API-PM-07: Resolve Project Application (ACCEPT / DECLINE - BR-006)
   * PATCH /api/v1/projects/applications/:applicationId
   */
  async resolveApplication(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }
      const applicationId = validateUuidParam(req.params.applicationId, 'applicationId');
      const dto = validateResolveApplication(req.body);
      const data = await projectService.resolveApplication(applicationId, req.user.userId, dto);
      const message =
        dto.action === 'ACCEPT'
          ? 'Đã chấp nhận đơn ứng tuyển và mở kênh trò chuyện trực tiếp.'
          : 'Đã từ chối đơn ứng tuyển.';
      return sendSuccess(res, data, message);
    } catch (error) {
      next(error);
    }
  }

  /**
   * API-PM-08: List Student's Own Submitted Project Applications
   * GET /api/v1/projects/applications/me
   */
  async listMyApplications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }
      const queryDto = validateListMyApplicationsQuery(req.query);
      const result = await projectService.listMyApplications(req.user.userId, queryDto);
      return sendSuccess(res, result.data, undefined, 200, result.meta);
    } catch (error) {
      next(error);
    }
  }
}

export const projectController = new ProjectController();
