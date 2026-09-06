import { ValidationFailedError } from '../../utils/errors';
import { ApiErrorDetail } from '../../utils/response';

export type ModerationEntityType = 'PROJECT_POST' | 'STUDY_REQUEST' | 'SKILL_LISTING';
export type AdminUserStatus = 'PENDING_VERIFICATION' | 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';
export type TargetUserStatus = 'ACTIVE' | 'SUSPENDED';

export interface UpdateUserStatusDto {
  status: TargetUserStatus;
  reason: string;
}

export interface RemoveListingDto {
  reason: string;
}

export interface AddStandardSkillDto {
  name: string;
  category: string;
}

export interface AddStandardCourseDto {
  course_code: string;
  course_name: string;
}

export interface ListUsersQueryDto {
  page: number;
  limit: number;
  status?: AdminUserStatus;
  search?: string;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ALLOWED_ENTITY_TYPES: ModerationEntityType[] = ['PROJECT_POST', 'STUDY_REQUEST', 'SKILL_LISTING'];
const ALLOWED_USER_STATUSES: AdminUserStatus[] = ['PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED', 'DEACTIVATED'];
const ALLOWED_TARGET_STATUSES: TargetUserStatus[] = ['ACTIVE', 'SUSPENDED'];

function asRecord(input: unknown): Record<string, unknown> {
  if (typeof input !== 'object' || input === null) {
    return {};
  }
  return input as Record<string, unknown>;
}

export function validateUuidParam(param: unknown, fieldName: string = 'id'): string {
  if (typeof param !== 'string' || !UUID_REGEX.test(param.trim())) {
    throw new ValidationFailedError(`Tham số ${fieldName} không hợp lệ (yêu cầu UUID)`, [
      { field: fieldName, issue: 'Định dạng UUID không hợp lệ' },
    ]);
  }
  return param.trim();
}

export function validateEntityTypeParam(param: unknown): ModerationEntityType {
  if (typeof param !== 'string') {
    throw new ValidationFailedError('Loại đối tượng kiểm duyệt không hợp lệ', [
      { field: 'entityType', issue: `entityType phải là một trong: ${ALLOWED_ENTITY_TYPES.join(', ')}` },
    ]);
  }
  const upper = param.trim().toUpperCase() as ModerationEntityType;
  if (!ALLOWED_ENTITY_TYPES.includes(upper)) {
    throw new ValidationFailedError('Loại đối tượng kiểm duyệt không hợp lệ', [
      { field: 'entityType', issue: `entityType phải là một trong: ${ALLOWED_ENTITY_TYPES.join(', ')}` },
    ]);
  }
  return upper;
}

export function validateUpdateUserStatus(input: unknown): UpdateUserStatusDto {
  const body = asRecord(input);
  const details: ApiErrorDetail[] = [];

  const rawStatus = typeof body.status === 'string' ? (body.status.trim().toUpperCase() as TargetUserStatus) : ('' as TargetUserStatus);
  const rawReason = typeof body.reason === 'string' ? body.reason.trim() : '';

  if (!ALLOWED_TARGET_STATUSES.includes(rawStatus)) {
    details.push({
      field: 'status',
      issue: `Trạng thái người dùng không hợp lệ. Cho phép: ${ALLOWED_TARGET_STATUSES.join(', ')}`,
    });
  }

  if (!rawReason || rawReason.length < 5 || rawReason.length > 500) {
    details.push({
      field: 'reason',
      issue: 'Lý do kiểm duyệt phải từ 5 đến 500 ký tự',
    });
  }

  if (details.length > 0) {
    throw new ValidationFailedError('Dữ liệu cập nhật trạng thái người dùng không hợp lệ', details);
  }

  return {
    status: rawStatus,
    reason: rawReason,
  };
}

export function validateRemoveListing(input: unknown): RemoveListingDto {
  const body = asRecord(input);
  const details: ApiErrorDetail[] = [];

  const rawReason = typeof body.reason === 'string' ? body.reason.trim() : '';

  if (!rawReason || rawReason.length < 5 || rawReason.length > 500) {
    details.push({
      field: 'reason',
      issue: 'Lý do gỡ bài đăng vi phạm phải từ 5 đến 500 ký tự',
    });
  }

  if (details.length > 0) {
    throw new ValidationFailedError('Dữ liệu gỡ bài đăng vi phạm không hợp lệ', details);
  }

  return {
    reason: rawReason,
  };
}

export function validateAddStandardSkill(input: unknown): AddStandardSkillDto {
  const body = asRecord(input);
  const details: ApiErrorDetail[] = [];

  const rawName = typeof body.name === 'string' ? body.name.trim() : '';
  const rawCategory = typeof body.category === 'string' ? body.category.trim().toUpperCase() : '';

  if (!rawName || rawName.length < 2 || rawName.length > 100) {
    details.push({ field: 'name', issue: 'Tên kỹ năng phải từ 2 đến 100 ký tự' });
  }

  if (!rawCategory || rawCategory.length < 2 || rawCategory.length > 50) {
    details.push({ field: 'category', issue: 'Danh mục kỹ năng phải từ 2 đến 50 ký tự' });
  }

  if (details.length > 0) {
    throw new ValidationFailedError('Dữ liệu kỹ năng chuẩn không hợp lệ', details);
  }

  return {
    name: rawName,
    category: rawCategory,
  };
}

export function validateAddStandardCourse(input: unknown): AddStandardCourseDto {
  const body = asRecord(input);
  const details: ApiErrorDetail[] = [];

  const rawCode = typeof body.course_code === 'string' ? body.course_code.trim().toUpperCase() : '';
  const rawName = typeof body.course_name === 'string' ? body.course_name.trim() : '';

  if (!rawCode || rawCode.length < 2 || rawCode.length > 20) {
    details.push({ field: 'course_code', issue: 'Mã môn học phải từ 2 đến 20 ký tự' });
  }

  if (!rawName || rawName.length < 2 || rawName.length > 150) {
    details.push({ field: 'course_name', issue: 'Tên môn học phải từ 2 đến 150 ký tự' });
  }

  if (details.length > 0) {
    throw new ValidationFailedError('Dữ liệu môn học chuẩn không hợp lệ', details);
  }

  return {
    course_code: rawCode,
    course_name: rawName,
  };
}

export function validateListUsersQuery(query: unknown): ListUsersQueryDto {
  const q = asRecord(query);

  const page = Math.max(1, parseInt(String(q.page || '1'), 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(String(q.limit || '20'), 10) || 20));

  let status: AdminUserStatus | undefined = undefined;
  if (typeof q.status === 'string') {
    const upperStatus = q.status.trim().toUpperCase() as AdminUserStatus;
    if (ALLOWED_USER_STATUSES.includes(upperStatus)) {
      status = upperStatus;
    }
  }

  let search: string | undefined = undefined;
  if (typeof q.search === 'string' && q.search.trim()) {
    search = q.search.trim();
  }

  return {
    page,
    limit,
    status,
    search,
  };
}
