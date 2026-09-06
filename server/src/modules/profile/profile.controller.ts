import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { profileService } from './profile.service';
import {
  validateUserId,
  validateUpdateProfile,
  validateUpdateProfileSkills,
  validateUpdateProfileCourses,
  validateSkillsQuery,
  validateCoursesQuery,
} from './profile.validation';
import { sendSuccess } from '../../utils/response';
import { UnauthorizedError } from '../../utils/errors';

export class ProfileController {
  /**
   * API-PROF-01: Get Current User Profile & Completeness Status
   * GET /api/v1/profiles/me
   */
  async getMyProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }
      const data = await profileService.getMyProfile(req.user.userId);
      return sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  /**
   * API-PROF-02: Update Personal Profile Metadata
   * PUT /api/v1/profiles/me
   */
  async updateMyProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }
      const dto = validateUpdateProfile(req.body);
      const data = await profileService.updateMyProfile(req.user.userId, dto);
      return sendSuccess(res, data, 'Cập nhật hồ sơ thành công');
    } catch (error) {
      next(error);
    }
  }

  /**
   * API-PROF-03: View Public Student Profile
   * GET /api/v1/profiles/:userId
   */
  async getPublicProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const targetUserId = validateUserId(req.params.userId);
      const data = await profileService.getPublicProfile(targetUserId);
      return sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  /**
   * API-PROF-04: Update Student Skills Portfolio
   * PUT /api/v1/profiles/me/skills
   */
  async updateMySkills(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }
      const dto = validateUpdateProfileSkills(req.body);
      const data = await profileService.updateMySkills(req.user.userId, dto);
      return sendSuccess(res, data, 'Cập nhật danh sách kỹ năng thành công');
    } catch (error) {
      next(error);
    }
  }

  /**
   * API-PROF-05: Update Student Enrolled Courses
   * PUT /api/v1/profiles/me/courses
   */
  async updateMyCourses(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }
      const dto = validateUpdateProfileCourses(req.body);
      const data = await profileService.updateMyCourses(req.user.userId, dto);
      return sendSuccess(res, data, 'Cập nhật danh sách môn học thành công');
    } catch (error) {
      next(error);
    }
  }

  /**
   * API-PROF-06: Search Master Skills Dictionary
   * GET /api/v1/skills
   */
  async getSkills(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const queryDto = validateSkillsQuery(req.query);
      const data = await profileService.getSkills(queryDto);
      return sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  /**
   * API-PROF-07: Search Master Courses Catalog
   * GET /api/v1/courses
   */
  async getCourses(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const queryDto = validateCoursesQuery(req.query);
      const data = await profileService.getCourses(queryDto);
      return sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }
}

export const profileController = new ProfileController();
