import { adminRepository, AdminUserRow } from './admin.repository';
import {
  ModerationEntityType,
  UpdateUserStatusDto,
  RemoveListingDto,
  AddStandardSkillDto,
  AddStandardCourseDto,
  ListUsersQueryDto,
} from './admin.validation';
import { NotFoundError, ConflictError } from '../../utils/errors';

export class AdminService {
  /**
   * API-ADM-01: Get System Analytics & Dashboard Stats
   */
  async getSystemStats() {
    const stats = await adminRepository.getSystemStats();
    return stats;
  }

  /**
   * API-ADM-02: List & Search User Accounts
   */
  async listUsers(query: ListUsersQueryDto) {
    const { rows, total } = await adminRepository.listUsers(query);

    const formatted = rows.map((u) => ({
      id: u.id,
      email: u.email,
      full_name: u.full_name || '',
      major: u.major || null,
      role: u.role,
      status: u.status,
      created_at: u.created_at.toISOString(),
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
   * API-ADM-03: Update User Account Status (Suspend / Unban) (BR-007)
   */
  async updateUserStatus(targetUserId: string, adminId: string, dto: UpdateUserStatusDto) {
    const user = await adminRepository.findUserById(targetUserId);
    if (!user) {
      throw new NotFoundError('Không tìm thấy tài khoản người dùng', 'USER_NOT_FOUND');
    }

    const result = await adminRepository.updateUserStatus(
      targetUserId,
      dto.status,
      adminId,
      dto.reason
    );

    return result;
  }

  /**
   * API-ADM-04: Soft Moderation Removal of Violating Listing (BR-009)
   */
  async softRemoveListing(
    entityType: ModerationEntityType,
    entityId: string,
    adminId: string,
    dto: RemoveListingDto
  ) {
    const result = await adminRepository.softRemoveListing(
      entityType,
      entityId,
      adminId,
      dto.reason
    );

    if (!result) {
      throw new NotFoundError('Không tìm thấy bài đăng để xử lý kiểm duyệt', 'LISTING_NOT_FOUND');
    }

    return {
      entity_type: result.entity_type,
      entity_id: result.entity_id,
      status: result.status,
      moderated_at: result.moderated_at.toISOString(),
    };
  }

  /**
   * API-ADM-05: Add System Standard Skill
   */
  async addStandardSkill(dto: AddStandardSkillDto) {
    try {
      const skill = await adminRepository.addStandardSkill(dto.name, dto.category);
      return skill;
    } catch (err: unknown) {
      if ((err as Error).message === 'SKILL_ALREADY_EXISTS') {
        throw new ConflictError(
          'Kỹ năng này đã tồn tại trong danh mục hệ thống.',
          'SKILL_ALREADY_EXISTS'
        );
      }
      throw err;
    }
  }

  /**
   * API-ADM-06: Add Standard Course to Catalog
   */
  async addStandardCourse(dto: AddStandardCourseDto) {
    try {
      const course = await adminRepository.addStandardCourse(dto.course_code, dto.course_name);
      return course;
    } catch (err: unknown) {
      if ((err as Error).message === 'COURSE_ALREADY_EXISTS') {
        throw new ConflictError(
          'Mã môn học này đã tồn tại trong danh mục hệ thống.',
          'COURSE_ALREADY_EXISTS'
        );
      }
      throw err;
    }
  }
}

export const adminService = new AdminService();
