import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { skillService } from './skill.service';
import {
  validateUuidParam,
  validateCreateSkillListing,
  validateRespondSkillListing,
  validateResolveSkillResponse,
  validateListSkillListingsQuery,
  validateListMySkillResponsesQuery,
} from './skill.validation';
import { sendSuccess } from '../../utils/response';
import { UnauthorizedError } from '../../utils/errors';

export class SkillController {
  /**
   * API-SE-01: List & Filter Skill Exchange Listings
   * GET /api/v1/skill-listings
   */
  async listSkillListings(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const queryDto = validateListSkillListingsQuery(req.query);
      const currentUserId = req.user ? req.user.userId : undefined;
      const result = await skillService.listSkillListings(queryDto, currentUserId);
      return sendSuccess(res, result.data, undefined, 200, result.meta);
    } catch (error) {
      next(error);
    }
  }

  /**
   * API-SE-02: Get Skill Listing Details
   * GET /api/v1/skill-listings/:id
   */
  async getSkillListingDetail(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const listingId = validateUuidParam(req.params.id, 'id');
      const currentUserId = req.user ? req.user.userId : undefined;
      const data = await skillService.getSkillListingDetail(listingId, currentUserId);
      return sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  /**
   * API-SE-03: Create Skill Listing (BR-001 & BR-002)
   * POST /api/v1/skill-listings
   */
  async createSkillListing(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }
      const dto = validateCreateSkillListing(req.body);
      const data = await skillService.createSkillListing(req.user.userId, dto);
      return sendSuccess(res, data, 'Đăng bài trao đổi kỹ năng thành công', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * API-SE-04: Close Skill Listing
   * PATCH /api/v1/skill-listings/:id/close
   */
  async closeSkillListing(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }
      const listingId = validateUuidParam(req.params.id, 'id');
      const data = await skillService.closeSkillListing(listingId, req.user.userId);
      return sendSuccess(res, undefined, data.message);
    } catch (error) {
      next(error);
    }
  }

  /**
   * API-SE-05: Send Skill Exchange Proposal (BR-001, BR-003, BR-004)
   * POST /api/v1/skill-listings/:id/respond
   */
  async respondSkillListing(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }
      const listingId = validateUuidParam(req.params.id, 'id');
      const dto = validateRespondSkillListing(req.body);
      const data = await skillService.respondSkillListing(listingId, req.user.userId, dto);
      return sendSuccess(res, data, 'Gửi đề xuất trao đổi kỹ năng thành công', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * API-SE-06: Resolve Skill Proposal (ACCEPT / DECLINE - BR-006)
   * PATCH /api/v1/skill-listings/responses/:responseId
   */
  async resolveSkillResponse(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }
      const responseId = validateUuidParam(req.params.responseId, 'responseId');
      const dto = validateResolveSkillResponse(req.body);
      const data = await skillService.resolveSkillResponse(responseId, req.user.userId, dto);
      const message =
        dto.action === 'ACCEPT'
          ? 'Đã chấp nhận đề xuất trao đổi kỹ năng và mở kênh chat.'
          : 'Đã từ chối đề xuất trao đổi kỹ năng.';
      return sendSuccess(res, data, message);
    } catch (error) {
      next(error);
    }
  }

  /**
   * API-SE-07: List Student's Own Sent Skill Exchange Proposals
   * GET /api/v1/skill-listings/responses/me
   */
  async listMySkillResponses(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }
      const queryDto = validateListMySkillResponsesQuery(req.query);
      const result = await skillService.listMySkillResponses(req.user.userId, queryDto);
      return sendSuccess(res, result.data, undefined, 200, result.meta);
    } catch (error) {
      next(error);
    }
  }
}

export const skillController = new SkillController();
