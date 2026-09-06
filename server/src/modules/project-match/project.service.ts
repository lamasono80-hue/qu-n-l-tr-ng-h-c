import {
  projectRepository,
  ProjectPostRow,
  ProjectRequiredSkill,
} from './project.repository';
import {
  CreateProjectDto,
  ApplyProjectDto,
  ResolveApplicationDto,
  ListProjectsQueryDto,
  ListMyApplicationsQueryDto,
} from './project.validation';
import { profileRepository } from '../profile/profile.repository';
import { calculateProfileCompleteness } from '../profile/profile.service';
import {
  NotFoundError,
  ForbiddenError,
  ConflictError,
  ValidationFailedError,
} from '../../utils/errors';

export class ProjectService {
  /**
   * API-PM-01: List & Filter Project Vacancies
   */
  async listProjects(query: ListProjectsQueryDto, currentUserId?: string) {
    const { rows, total } = await projectRepository.listProjects(query, currentUserId);

    const formattedData = await Promise.all(
      rows.map(async (p) => {
        const requiredSkills = await projectRepository.getRequiredSkills(p.id);
        return {
          id: p.id,
          title: p.title,
          description: p.description,
          category: p.category,
          total_slots: p.total_slots,
          accepted_slots: p.accepted_slots,
          deadline: p.deadline,
          status: p.status,
          author: {
            user_id: p.author_id,
            full_name: p.author_full_name || '',
            major: p.author_major || '',
            avatar_url: p.author_avatar_url || null,
          },
          required_skills: requiredSkills.map((s) => ({
            skill_id: s.skill_id,
            name: s.name,
          })),
          created_at: p.created_at.toISOString(),
        };
      })
    );

    const totalPages = Math.ceil(total / query.limit) || 1;

    return {
      data: formattedData,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        total_pages: totalPages,
      },
    };
  }

  /**
   * API-PM-02: Get Project Vacancy Details
   */
  async getProjectDetail(postId: string, currentUserId?: string) {
    const post = await projectRepository.findById(postId);
    if (!post) {
      throw new NotFoundError('Không tìm thấy bài đăng tuyển thành viên dự án', 'POST_NOT_FOUND');
    }

    const requiredSkills = await projectRepository.getRequiredSkills(post.id);
    const isAuthor = Boolean(currentUserId && post.author_id === currentUserId);
    const hasApplied = Boolean(currentUserId && (await projectRepository.hasUserApplied(post.id, currentUserId)));

    return {
      id: post.id,
      title: post.title,
      description: post.description,
      category: post.category,
      total_slots: post.total_slots,
      accepted_slots: post.accepted_slots,
      deadline: post.deadline,
      status: post.status,
      author: {
        user_id: post.author_id,
        full_name: post.author_full_name || '',
        major: post.author_major || '',
        avatar_url: post.author_avatar_url || null,
      },
      required_skills: requiredSkills.map((s) => ({
        skill_id: s.skill_id,
        name: s.name,
      })),
      is_author: isAuthor,
      has_applied: hasApplied,
      created_at: post.created_at.toISOString(),
    };
  }

  /**
   * API-PM-03: Create Project Vacancy Post (BR-001 & BR-002)
   */
  async createProject(authorId: string, dto: CreateProjectDto) {
    // 1. Enforce BR-001 Profile Completeness
    const profile = await profileRepository.findByUserId(authorId);
    if (!profile) {
      throw new ForbiddenError('Bạn cần tạo hồ sơ trước khi đăng tin.', 'PROFILE_INCOMPLETE');
    }

    const skills = await profileRepository.getSkillsByProfileId(profile.id);
    const courses = await profileRepository.getCoursesByProfileId(profile.id);
    const isComplete = calculateProfileCompleteness(profile, skills, courses);

    if (!isComplete) {
      throw new ForbiddenError(
        'Bạn cần hoàn thiện hồ sơ (Họ tên, 1 kỹ năng, 1 môn học) trước khi đăng tin.',
        'PROFILE_INCOMPLETE'
      );
    }

    // 2. Validate all skill_ids exist in master catalog
    const allSkillsExist = await profileRepository.validateSkillIdsExist(dto.skill_ids);
    if (!allSkillsExist) {
      throw new ValidationFailedError('Một hoặc nhiều kỹ năng yêu cầu không tồn tại trong hệ thống', [
        { field: 'skill_ids', issue: 'SKILL_NOT_FOUND' },
      ]);
    }

    // 3. Create project with BR-002 locking transaction
    try {
      const createdPost = await projectRepository.createProject(authorId, dto);
      return {
        id: createdPost.id,
        status: createdPost.status,
        created_at: createdPost.created_at.toISOString(),
      };
    } catch (err: unknown) {
      if ((err as Error).message === 'QUOTA_EXCEEDED') {
        throw new ForbiddenError(
          'Bạn đã đạt giới hạn tối đa 5 bài đăng hoạt động trong mục Dự án.',
          'QUOTA_EXCEEDED'
        );
      }
      throw err;
    }
  }

  /**
   * API-PM-04: Close Project Vacancy Post
   */
  async closeProject(postId: string, authorId: string) {
    const post = await projectRepository.findById(postId);
    if (!post) {
      throw new NotFoundError('Không tìm thấy bài đăng tuyển dụng', 'POST_NOT_FOUND');
    }

    if (post.author_id !== authorId) {
      throw new ForbiddenError('Chỉ người tạo bài đăng mới có quyền đóng bài viết này.', 'NOT_POST_AUTHOR');
    }

    await projectRepository.closeProject(postId, authorId);

    return {
      id: postId,
      status: 'CLOSED',
    };
  }

  /**
   * API-PM-05: Submit Project Application (BR-001, BR-003, BR-004, BR-005)
   */
  async applyProject(postId: string, applicantId: string, dto: ApplyProjectDto) {
    // 1. Enforce BR-001 Applicant Profile Completeness
    const profile = await profileRepository.findByUserId(applicantId);
    if (!profile) {
      throw new ForbiddenError('Bạn cần tạo hồ sơ trước khi nộp đơn ứng tuyển.', 'PROFILE_INCOMPLETE');
    }

    const skills = await profileRepository.getSkillsByProfileId(profile.id);
    const courses = await profileRepository.getCoursesByProfileId(profile.id);
    const isComplete = calculateProfileCompleteness(profile, skills, courses);

    if (!isComplete) {
      throw new ForbiddenError(
        'Bạn cần hoàn thiện hồ sơ (Họ tên, 1 kỹ năng, 1 môn học) trước khi nộp đơn ứng tuyển.',
        'PROFILE_INCOMPLETE'
      );
    }

    // 2. Fetch project post
    const post = await projectRepository.findById(postId);
    if (!post) {
      throw new NotFoundError('Không tìm thấy bài đăng tuyển dụng', 'POST_NOT_FOUND');
    }

    // 3. BR-005 Deadline & Status check
    const todayStr = new Date().toISOString().split('T')[0];
    if (post.status !== 'OPEN' || post.deadline < todayStr) {
      throw new ValidationFailedError('Bài đăng đã đóng, đủ người hoặc đã quá hạn chót ứng tuyển.', [
        { field: 'status', issue: 'POST_NOT_OPEN' },
      ]);
    }

    // 4. BR-003 Self-Application Prevention
    if (post.author_id === applicantId) {
      throw new ForbiddenError('Không thể tự ứng tuyển vào bài đăng của chính mình.', 'SELF_APPLICATION_BLOCKED');
    }

    // 5. BR-004 Single Response Record Policy (Check prior application)
    const alreadyApplied = await projectRepository.hasUserApplied(postId, applicantId);
    if (alreadyApplied) {
      throw new ConflictError('Bạn đã gửi đơn ứng tuyển cho bài đăng này.', 'DUPLICATE_SUBMISSION');
    }

    // 6. Create application
    const app = await projectRepository.createApplication(
      postId,
      applicantId,
      dto.intro_note,
      post.author_id,
      post.title
    );

    return {
      application_id: app.id,
      status: app.status,
      applied_at: app.created_at.toISOString(),
    };
  }

  /**
   * API-PM-06: List Received Applications for Project Post
   */
  async listApplicationsForPost(postId: string, currentUserId: string) {
    const post = await projectRepository.findById(postId);
    if (!post) {
      throw new NotFoundError('Không tìm thấy bài đăng tuyển dụng', 'POST_NOT_FOUND');
    }

    if (post.author_id !== currentUserId) {
      throw new ForbiddenError(
        'Chỉ người tạo bài đăng mới có quyền xem danh sách đơn ứng tuyển.',
        'NOT_POST_AUTHOR'
      );
    }

    const apps = await projectRepository.listApplicationsForPost(postId);

    const formatted = await Promise.all(
      apps.map(async (a) => {
        const applicantProfile = await profileRepository.findByUserId(a.user_id);
        const applicantSkills = applicantProfile
          ? await profileRepository.getSkillsByProfileId(applicantProfile.id)
          : [];

        return {
          id: a.id,
          status: a.status,
          intro_note: a.intro_note,
          applied_at: a.applied_at.toISOString(),
          applicant: {
            user_id: a.user_id,
            full_name: a.full_name,
            major: a.major || '',
            avatar_url: a.avatar_url,
            skills: applicantSkills.map((s) => ({
              name: s.name,
              proficiency_level: s.proficiency_level,
            })),
          },
        };
      })
    );

    return formatted;
  }

  /**
   * API-PM-07: Resolve Project Application (ACCEPT / DECLINE - BR-006)
   */
  async resolveApplication(applicationId: string, currentUserId: string, dto: ResolveApplicationDto) {
    const appDetails = await projectRepository.findApplicationWithPostDetails(applicationId);
    if (!appDetails) {
      throw new NotFoundError('Không tìm thấy đơn ứng tuyển', 'APPLICATION_NOT_FOUND');
    }

    if (appDetails.post_author_id !== currentUserId) {
      throw new ForbiddenError(
        'Chỉ người tạo bài đăng mới có quyền duyệt đơn ứng tuyển này.',
        'NOT_POST_AUTHOR'
      );
    }

    if (appDetails.status !== 'PENDING') {
      throw new ValidationFailedError('Đơn ứng tuyển này đã được xử lý trước đó.', [
        { field: 'status', issue: 'APPLICATION_ALREADY_RESOLVED' },
      ]);
    }

    try {
      const result = await projectRepository.resolveApplication(applicationId, dto.action, {
        post_id: appDetails.post_id,
        applicant_id: appDetails.applicant_id,
        post_author_id: appDetails.post_author_id,
        post_title: appDetails.post_title,
      });

      return {
        application_id: applicationId,
        status: result.status,
        conversation_id: result.conversation_id,
      };
    } catch (err: unknown) {
      if ((err as Error).message === 'POST_ALREADY_FULL') {
        throw new ValidationFailedError('Dự án đã đủ thành viên, không thể chấp nhận thêm.', [
          { field: 'total_slots', issue: 'POST_ALREADY_FULL' },
        ]);
      }
      throw err;
    }
  }

  /**
   * API-PM-08: List Student's Own Submitted Project Applications
   */
  async listMyApplications(userId: string, query: ListMyApplicationsQueryDto) {
    const { rows, total } = await projectRepository.listMyApplications(userId, query);

    const formatted = rows.map((r) => ({
      id: r.id,
      status: r.status,
      intro_note: r.intro_note,
      applied_at: r.applied_at.toISOString(),
      resolved_at: r.resolved_at ? r.resolved_at.toISOString() : null,
      project: {
        id: r.project_id,
        title: r.project_title,
        category: r.project_category,
        author_name: r.project_author_name,
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

export const projectService = new ProjectService();
