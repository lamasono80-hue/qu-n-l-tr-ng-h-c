import {
  studyRepository,
  StudyRequestRow,
  StudyConnectionRow,
} from './study.repository';
import {
  CreateStudyRequestDto,
  ConnectStudyRequestDto,
  ResolveStudyConnectionDto,
  ListStudyRequestsQueryDto,
  ListMyStudyConnectionsQueryDto,
} from './study.validation';
import { profileRepository } from '../profile/profile.repository';
import { calculateProfileCompleteness } from '../profile/profile.service';
import {
  NotFoundError,
  ForbiddenError,
  ConflictError,
  ValidationFailedError,
} from '../../utils/errors';

export class StudyService {
  /**
   * API-SB-01: List & Filter Study Requests
   */
  async listStudyRequests(query: ListStudyRequestsQueryDto, currentUserId?: string) {
    const { rows, total } = await studyRepository.listStudyRequests(query, currentUserId);

    const formatted = rows.map((r) => ({
      id: r.id,
      topic: r.topic,
      course: {
        course_id: r.course_id,
        course_code: r.course_code || '',
        course_name: r.course_name || '',
      },
      study_mode: r.study_mode,
      availability: r.availability,
      description: r.description,
      status: r.status,
      author: {
        user_id: r.author_id,
        full_name: r.author_full_name || '',
        avatar_url: r.author_avatar_url || null,
        campus: r.author_campus || null,
        major: r.author_major || null,
      },
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
   * API-SB-02: Get Study Request Details
   */
  async getStudyRequestDetail(requestId: string, currentUserId?: string) {
    const request = await studyRepository.findById(requestId);
    if (!request) {
      throw new NotFoundError('Không tìm thấy bài đăng tìm bạn học', 'REQUEST_NOT_FOUND');
    }

    const isAuthor = Boolean(currentUserId && request.author_id === currentUserId);
    const hasConnected = Boolean(currentUserId && (await studyRepository.hasUserConnected(request.id, currentUserId)));

    return {
      id: request.id,
      topic: request.topic,
      course: {
        course_id: request.course_id,
        course_code: request.course_code || '',
        course_name: request.course_name || '',
      },
      study_mode: request.study_mode,
      availability: request.availability,
      description: request.description,
      status: request.status,
      author: {
        user_id: request.author_id,
        full_name: request.author_full_name || '',
        avatar_url: request.author_avatar_url || null,
        campus: request.author_campus || null,
        major: request.author_major || null,
      },
      is_author: isAuthor,
      has_connected: hasConnected,
    };
  }

  /**
   * API-SB-03: Create Study Buddy Request (BR-001 & BR-002)
   */
  async createStudyRequest(authorId: string, dto: CreateStudyRequestDto) {
    // 1. Enforce BR-001 Profile Completeness
    const profile = await profileRepository.findByUserId(authorId);
    if (!profile) {
      throw new ForbiddenError('Bạn cần tạo hồ sơ trước khi đăng yêu cầu tìm bạn học.', 'PROFILE_INCOMPLETE');
    }

    const skills = await profileRepository.getSkillsByProfileId(profile.id);
    const courses = await profileRepository.getCoursesByProfileId(profile.id);
    const isComplete = calculateProfileCompleteness(profile, skills, courses);

    if (!isComplete) {
      throw new ForbiddenError(
        'Bạn cần hoàn thiện hồ sơ (Họ tên, 1 kỹ năng, 1 môn học) trước khi đăng yêu cầu.',
        'PROFILE_INCOMPLETE'
      );
    }

    // 2. Validate course_id exists
    const courseExists = await profileRepository.validateCourseIdsExist([dto.course_id]);
    if (!courseExists) {
      throw new ValidationFailedError('Môn học không tồn tại trong danh mục hệ thống', [
        { field: 'course_id', issue: 'COURSE_NOT_FOUND' },
      ]);
    }

    // 3. Create request with BR-002 locking transaction
    try {
      const created = await studyRepository.createStudyRequest(authorId, dto);
      return {
        id: created.id,
        status: created.status,
      };
    } catch (err: unknown) {
      if ((err as Error).message === 'QUOTA_EXCEEDED') {
        throw new ForbiddenError(
          'Bạn đã đạt giới hạn tối đa 5 yêu cầu tìm bạn học đang hoạt động.',
          'QUOTA_EXCEEDED'
        );
      }
      throw err;
    }
  }

  /**
   * API-SB-04: Close Study Buddy Request
   */
  async closeStudyRequest(requestId: string, authorId: string) {
    const request = await studyRepository.findById(requestId);
    if (!request) {
      throw new NotFoundError('Không tìm thấy bài đăng tìm bạn học', 'REQUEST_NOT_FOUND');
    }

    if (request.author_id !== authorId) {
      throw new ForbiddenError('Chỉ người tạo yêu cầu mới có quyền đóng bài viết này.', 'NOT_REQUEST_AUTHOR');
    }

    await studyRepository.closeStudyRequest(requestId, authorId);

    return {
      message: 'Đã đóng bài tìm bạn học thành công',
    };
  }

  /**
   * API-SB-05: Send Study Connection Request (BR-001, BR-003, BR-004)
   */
  async connectStudyRequest(requestId: string, requesterId: string, dto: ConnectStudyRequestDto) {
    // 1. Enforce BR-001 Requester Profile Completeness
    const profile = await profileRepository.findByUserId(requesterId);
    if (!profile) {
      throw new ForbiddenError('Bạn cần tạo hồ sơ trước khi gửi yêu cầu kết nối.', 'PROFILE_INCOMPLETE');
    }

    const skills = await profileRepository.getSkillsByProfileId(profile.id);
    const courses = await profileRepository.getCoursesByProfileId(profile.id);
    const isComplete = calculateProfileCompleteness(profile, skills, courses);

    if (!isComplete) {
      throw new ForbiddenError(
        'Bạn cần hoàn thiện hồ sơ (Họ tên, 1 kỹ năng, 1 môn học) trước khi gửi yêu cầu kết nối.',
        'PROFILE_INCOMPLETE'
      );
    }

    // 2. Fetch study request
    const request = await studyRepository.findById(requestId);
    if (!request) {
      throw new NotFoundError('Không tìm thấy bài đăng tìm bạn học', 'REQUEST_NOT_FOUND');
    }

    if (request.status !== 'OPEN') {
      throw new ValidationFailedError('Yêu cầu tìm bạn học đã đóng hoặc không còn khả dụng.', [
        { field: 'status', issue: 'REQUEST_NOT_OPEN' },
      ]);
    }

    // 3. BR-003 Self-connection prevention
    if (request.author_id === requesterId) {
      throw new ForbiddenError('Không thể tự gửi yêu cầu kết nối với chính mình.', 'SELF_CONNECTION_BLOCKED');
    }

    // 4. BR-004 Single response record policy
    const alreadyConnected = await studyRepository.hasUserConnected(requestId, requesterId);
    if (alreadyConnected) {
      throw new ConflictError('Bạn đã gửi yêu cầu kết nối cho bài đăng này.', 'DUPLICATE_SUBMISSION');
    }

    // 5. Create connection
    const conn = await studyRepository.createConnection(
      requestId,
      requesterId,
      dto.note,
      request.author_id,
      request.topic
    );

    return {
      connection_id: conn.id,
      status: conn.status,
    };
  }

  /**
   * API-SB-06: Resolve Study Connection (ACCEPT / DECLINE - BR-006)
   */
  async resolveConnection(connectionId: string, currentUserId: string, dto: ResolveStudyConnectionDto) {
    const connDetails = await studyRepository.findConnectionWithRequestDetails(connectionId);
    if (!connDetails) {
      throw new NotFoundError('Không tìm thấy yêu cầu kết nối học tập', 'CONNECTION_NOT_FOUND');
    }

    if (connDetails.request_author_id !== currentUserId) {
      throw new ForbiddenError(
        'Chỉ người tạo yêu cầu mới có quyền duyệt kết nối này.',
        'NOT_REQUEST_AUTHOR'
      );
    }

    if (connDetails.status !== 'PENDING') {
      throw new ValidationFailedError('Yêu cầu kết nối này đã được xử lý trước đó.', [
        { field: 'status', issue: 'CONNECTION_ALREADY_RESOLVED' },
      ]);
    }

    const result = await studyRepository.resolveConnection(connectionId, dto.action, {
      request_id: connDetails.request_id,
      requester_id: connDetails.requester_id,
      request_author_id: connDetails.request_author_id,
      request_topic: connDetails.request_topic,
    });

    return {
      connection_id: connectionId,
      status: result.status,
      conversation_id: result.conversation_id,
    };
  }

  /**
   * API-SB-07: List Student's Own Sent Study Connection Requests
   */
  async listMyConnections(userId: string, query: ListMyStudyConnectionsQueryDto) {
    const { rows, total } = await studyRepository.listMyConnections(userId, query);

    const formatted = rows.map((r) => ({
      id: r.id,
      status: r.status,
      note: r.note,
      requested_at: r.requested_at.toISOString(),
      study_request: {
        id: r.request_id,
        topic: r.request_topic,
        course_code: r.course_code,
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

export const studyService = new StudyService();
