import {
  skillRepository,
  SkillListingRow,
  SkillResponseRow,
} from './skill.repository';
import {
  CreateSkillListingDto,
  RespondSkillListingDto,
  ResolveSkillResponseDto,
  ListSkillListingsQueryDto,
  ListMySkillResponsesQueryDto,
} from './skill.validation';
import { profileRepository } from '../profile/profile.repository';
import { calculateProfileCompleteness } from '../profile/profile.service';
import {
  NotFoundError,
  ForbiddenError,
  ConflictError,
  ValidationFailedError,
} from '../../utils/errors';

export class SkillService {
  /**
   * API-SE-01: List & Filter Skill Exchange Listings
   */
  async listSkillListings(query: ListSkillListingsQueryDto, currentUserId?: string) {
    const { rows, total } = await skillRepository.listSkillListings(query, currentUserId);

    const formatted = rows.map((r) => ({
      id: r.id,
      author: {
        user_id: r.author_id,
        full_name: r.author_full_name || '',
        avatar_url: r.author_avatar_url || null,
        campus: r.author_campus || null,
        major: r.author_major || null,
      },
      type: r.type,
      skill_name: r.skill_name,
      proficiency_level: r.proficiency_level,
      format: r.format,
      availability: r.availability,
      description: r.description,
      status: r.status,
      created_at: r.created_at.toISOString(),
    }));

    const totalPages = Math.ceil(total / query.limit) || 1;

    return {
      data: formatted,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        total_pages: totalPages,
      },
    };
  }

  /**
   * API-SE-02: Get Skill Listing Details
   */
  async getSkillListingDetail(listingId: string, currentUserId?: string) {
    const listing = await skillRepository.findById(listingId);
    if (!listing) {
      throw new NotFoundError('Không tìm thấy bài đăng trao đổi kỹ năng', 'LISTING_NOT_FOUND');
    }

    const isAuthor = Boolean(currentUserId && listing.author_id === currentUserId);
    const hasResponded = Boolean(currentUserId && (await skillRepository.hasUserResponded(listing.id, currentUserId)));

    return {
      id: listing.id,
      type: listing.type,
      skill_name: listing.skill_name,
      proficiency_level: listing.proficiency_level,
      format: listing.format,
      availability: listing.availability,
      description: listing.description,
      status: listing.status,
      author: {
        user_id: listing.author_id,
        full_name: listing.author_full_name || '',
        avatar_url: listing.author_avatar_url || null,
        campus: listing.author_campus || null,
        major: listing.author_major || null,
      },
      is_author: isAuthor,
      has_responded: hasResponded,
      created_at: listing.created_at.toISOString(),
    };
  }

  /**
   * API-SE-03: Create Skill Listing (BR-001 & BR-002)
   */
  async createSkillListing(authorId: string, dto: CreateSkillListingDto) {
    // 1. Enforce BR-001 Profile Completeness
    const profile = await profileRepository.findByUserId(authorId);
    if (!profile) {
      throw new ForbiddenError('Bạn cần tạo hồ sơ trước khi đăng bài trao đổi kỹ năng.', 'PROFILE_INCOMPLETE');
    }

    const skills = await profileRepository.getSkillsByProfileId(profile.id);
    const courses = await profileRepository.getCoursesByProfileId(profile.id);
    const isComplete = calculateProfileCompleteness(profile, skills, courses);

    if (!isComplete) {
      throw new ForbiddenError(
        'Bạn cần hoàn thiện hồ sơ (Họ tên, 1 kỹ năng, 1 môn học) trước khi đăng bài.',
        'PROFILE_INCOMPLETE'
      );
    }

    // 2. Create listing with BR-002 locking transaction
    try {
      const created = await skillRepository.createSkillListing(authorId, dto);
      return {
        id: created.id,
        status: created.status,
      };
    } catch (err: unknown) {
      if ((err as Error).message === 'QUOTA_EXCEEDED') {
        throw new ForbiddenError(
          'Bạn đã đạt giới hạn tối đa 5 bài đăng trao đổi kỹ năng đang hoạt động.',
          'QUOTA_EXCEEDED'
        );
      }
      throw err;
    }
  }

  /**
   * API-SE-04: Close Skill Listing
   */
  async closeSkillListing(listingId: string, authorId: string) {
    const listing = await skillRepository.findById(listingId);
    if (!listing) {
      throw new NotFoundError('Không tìm thấy bài đăng trao đổi kỹ năng', 'LISTING_NOT_FOUND');
    }

    if (listing.author_id !== authorId) {
      throw new ForbiddenError('Chỉ người tạo bài đăng mới có quyền đóng bài viết này.', 'NOT_LISTING_AUTHOR');
    }

    await skillRepository.closeSkillListing(listingId, authorId);

    return {
      message: 'Đã đóng bài đăng trao đổi kỹ năng thành công',
    };
  }

  /**
   * API-SE-05: Send Skill Exchange Proposal (BR-001, BR-003, BR-004)
   */
  async respondSkillListing(listingId: string, responderId: string, dto: RespondSkillListingDto) {
    // 1. Enforce BR-001 Responder Profile Completeness
    const profile = await profileRepository.findByUserId(responderId);
    if (!profile) {
      throw new ForbiddenError('Bạn cần tạo hồ sơ trước khi gửi đề xuất trao đổi.', 'PROFILE_INCOMPLETE');
    }

    const skills = await profileRepository.getSkillsByProfileId(profile.id);
    const courses = await profileRepository.getCoursesByProfileId(profile.id);
    const isComplete = calculateProfileCompleteness(profile, skills, courses);

    if (!isComplete) {
      throw new ForbiddenError(
        'Bạn cần hoàn thiện hồ sơ (Họ tên, 1 kỹ năng, 1 môn học) trước khi gửi đề xuất.',
        'PROFILE_INCOMPLETE'
      );
    }

    // 2. Fetch skill listing
    const listing = await skillRepository.findById(listingId);
    if (!listing) {
      throw new NotFoundError('Không tìm thấy bài đăng trao đổi kỹ năng', 'LISTING_NOT_FOUND');
    }

    if (listing.status !== 'OPEN') {
      throw new ValidationFailedError('Bài đăng trao đổi kỹ năng đã đóng hoặc không còn khả dụng.', [
        { field: 'status', issue: 'LISTING_NOT_OPEN' },
      ]);
    }

    // 3. BR-003 Self-proposal prevention
    if (listing.author_id === responderId) {
      throw new ForbiddenError('Không thể tự gửi đề xuất trao đổi cho bài đăng của chính mình.', 'SELF_PROPOSAL_BLOCKED');
    }

    // 4. BR-004 Single response record policy
    const alreadyResponded = await skillRepository.hasUserResponded(listingId, responderId);
    if (alreadyResponded) {
      throw new ConflictError('Bạn đã gửi đề xuất cho bài đăng này.', 'DUPLICATE_SUBMISSION');
    }

    // 5. Create response
    const resp = await skillRepository.createResponse(
      listingId,
      responderId,
      dto.proposal_note,
      listing.author_id,
      listing.skill_name
    );

    return {
      response_id: resp.id,
      status: resp.status,
    };
  }

  /**
   * API-SE-06: Resolve Skill Proposal (ACCEPT / DECLINE - BR-006)
   */
  async resolveSkillResponse(responseId: string, currentUserId: string, dto: ResolveSkillResponseDto) {
    const respDetails = await skillRepository.findResponseWithListingDetails(responseId);
    if (!respDetails) {
      throw new NotFoundError('Không tìm thấy đề xuất trao đổi kỹ năng', 'RESPONSE_NOT_FOUND');
    }

    if (respDetails.listing_author_id !== currentUserId) {
      throw new ForbiddenError(
        'Chỉ người tạo bài đăng mới có quyền duyệt đề xuất này.',
        'NOT_LISTING_AUTHOR'
      );
    }

    if (respDetails.status !== 'PENDING') {
      throw new ValidationFailedError('Đề xuất trao đổi này đã được xử lý trước đó.', [
        { field: 'status', issue: 'RESPONSE_ALREADY_RESOLVED' },
      ]);
    }

    const result = await skillRepository.resolveResponse(responseId, dto.action, {
      listing_id: respDetails.listing_id,
      responder_id: respDetails.responder_id,
      listing_author_id: respDetails.listing_author_id,
      listing_skill_name: respDetails.listing_skill_name,
    });

    return {
      response_id: responseId,
      status: result.status,
      conversation_id: result.conversation_id,
    };
  }

  /**
   * API-SE-07: List Student's Own Sent Skill Exchange Proposals
   */
  async listMySkillResponses(userId: string, query: ListMySkillResponsesQueryDto) {
    const { rows, total } = await skillRepository.listMyResponses(userId, query);

    const formatted = rows.map((r) => ({
      id: r.id,
      status: r.status,
      proposal_note: r.proposal_note,
      responded_at: r.responded_at.toISOString(),
      skill_listing: {
        id: r.listing_id,
        type: r.listing_type,
        skill_name: r.listing_skill_name,
        author_name: r.author_name,
      },
    }));

    const totalPages = Math.ceil(total / query.limit) || 1;

    return {
      data: formatted,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        total_pages: totalPages,
      },
    };
  }
}

export const skillService = new SkillService();
