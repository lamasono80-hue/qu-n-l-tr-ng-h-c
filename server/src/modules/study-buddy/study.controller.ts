import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { studyService } from './study.service';
import {
  validateUuidParam,
  validateCreateStudyRequest,
  validateConnectStudyRequest,
  validateResolveStudyConnection,
  validateListStudyRequestsQuery,
  validateListMyStudyConnectionsQuery,
} from './study.validation';
import { sendSuccess } from '../../utils/response';
import { UnauthorizedError } from '../../utils/errors';

export class StudyController {
  /**
   * API-SB-01: List & Filter Study Requests
   * GET /api/v1/study-requests
   */
  async listStudyRequests(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const queryDto = validateListStudyRequestsQuery(req.query);
      const currentUserId = req.user ? req.user.userId : undefined;
      const result = await studyService.listStudyRequests(queryDto, currentUserId);
      return sendSuccess(res, result.data, undefined, 200, result.meta);
    } catch (error) {
      next(error);
    }
  }

  /**
   * API-SB-02: Get Study Request Details
   * GET /api/v1/study-requests/:id
   */
  async getStudyRequestDetail(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const requestId = validateUuidParam(req.params.id, 'id');
      const currentUserId = req.user ? req.user.userId : undefined;
      const data = await studyService.getStudyRequestDetail(requestId, currentUserId);
      return sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  /**
   * API-SB-03: Create Study Buddy Request (BR-001 & BR-002)
   * POST /api/v1/study-requests
   */
  async createStudyRequest(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }
      const dto = validateCreateStudyRequest(req.body);
      const data = await studyService.createStudyRequest(req.user.userId, dto);
      return sendSuccess(res, data, 'Đăng yêu cầu tìm bạn học thành công', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * API-SB-04: Close Study Buddy Request
   * PATCH /api/v1/study-requests/:id/close
   */
  async closeStudyRequest(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }
      const requestId = validateUuidParam(req.params.id, 'id');
      const data = await studyService.closeStudyRequest(requestId, req.user.userId);
      return sendSuccess(res, undefined, data.message);
    } catch (error) {
      next(error);
    }
  }

  /**
   * API-SB-05: Send Study Connection Request (BR-001, BR-003, BR-004)
   * POST /api/v1/study-requests/:id/connect
   */
  async connectStudyRequest(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }
      const requestId = validateUuidParam(req.params.id, 'id');
      const dto = validateConnectStudyRequest(req.body);
      const data = await studyService.connectStudyRequest(requestId, req.user.userId, dto);
      return sendSuccess(res, data, 'Gửi yêu cầu kết nối học tập thành công', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * API-SB-06: Resolve Study Connection (ACCEPT / DECLINE - BR-006)
   * PATCH /api/v1/study-requests/connections/:connectionId
   */
  async resolveConnection(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }
      const connectionId = validateUuidParam(req.params.connectionId, 'connectionId');
      const dto = validateResolveStudyConnection(req.body);
      const data = await studyService.resolveConnection(connectionId, req.user.userId, dto);
      const message =
        dto.action === 'ACCEPT'
          ? 'Đã chấp nhận kết nối học tập và mở kênh chat.'
          : 'Đã từ chối kết nối học tập.';
      return sendSuccess(res, data, message);
    } catch (error) {
      next(error);
    }
  }

  /**
   * API-SB-07: List Student's Own Sent Study Connection Requests
   * GET /api/v1/study-requests/connections/me
   */
  async listMyConnections(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }
      const queryDto = validateListMyStudyConnectionsQuery(req.query);
      const result = await studyService.listMyConnections(req.user.userId, queryDto);
      return sendSuccess(res, result.data, undefined, 200, result.meta);
    } catch (error) {
      next(error);
    }
  }
}

export const studyController = new StudyController();
