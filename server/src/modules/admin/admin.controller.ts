import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { adminService } from './admin.service';
import {
  validateUuidParam,
  validateEntityTypeParam,
  validateUpdateUserStatus,
  validateRemoveListing,
  validateAddStandardSkill,
  validateAddStandardCourse,
  validateListUsersQuery,
} from './admin.validation';
import { sendSuccess } from '../../utils/response';
import { UnauthorizedError } from '../../utils/errors';

export class AdminController {
  /**
   * API-ADM-01: Get System Analytics & Dashboard Stats
   * GET /api/v1/admin/stats
   */
  async getStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }
      const stats = await adminService.getSystemStats();
      return sendSuccess(res, stats);
    } catch (error) {
      next(error);
    }
  }

  /**
   * API-ADM-02: List & Search User Accounts
   * GET /api/v1/admin/users
   */
  async listUsers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }
      const queryDto = validateListUsersQuery(req.query);
      const result = await adminService.listUsers(queryDto);
      return sendSuccess(res, result.data, undefined, 200, result.meta);
    } catch (error) {
      next(error);
    }
  }

  /**
   * API-ADM-03: Update User Account Status (Suspend / Unban)
   * PATCH /api/v1/admin/users/:id/status
   */
  async updateUserStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }
      const targetUserId = validateUuidParam(req.params.id, 'id');
      const dto = validateUpdateUserStatus(req.body);
      const data = await adminService.updateUserStatus(targetUserId, req.user.userId, dto);
      return sendSuccess(
        res,
        data,
        'Cập nhật trạng thái người dùng thành công và đã ghi nhật ký kiểm duyệt.'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * API-ADM-04: Soft Moderation Removal of Violating Listing
   * POST /api/v1/admin/listings/:entityType/:entityId/remove
   */
  async removeListing(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }
      const entityType = validateEntityTypeParam(req.params.entityType);
      const entityId = validateUuidParam(req.params.entityId, 'entityId');
      const dto = validateRemoveListing(req.body);
      const data = await adminService.softRemoveListing(entityType, entityId, req.user.userId, dto);
      return sendSuccess(
        res,
        data,
        'Đã gỡ bài đăng vi phạm thành công và ghi nhật ký kiểm duyệt.'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * API-ADM-05: Add System Standard Skill
   * POST /api/v1/admin/skills
   */
  async addSkill(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }
      const dto = validateAddStandardSkill(req.body);
      const data = await adminService.addStandardSkill(dto);
      return sendSuccess(res, data, 'Thêm kỹ năng chuẩn hệ thống thành công', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * API-ADM-06: Add Standard Course to Catalog
   * POST /api/v1/admin/courses
   */
  async addCourse(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }
      const dto = validateAddStandardCourse(req.body);
      const data = await adminService.addStandardCourse(dto);
      return sendSuccess(res, data, 'Thêm môn học vào danh mục chuẩn thành công', 201);
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
