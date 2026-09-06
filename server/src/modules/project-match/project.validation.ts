import { ValidationFailedError } from '../../utils/errors';
import { ApiErrorDetail } from '../../utils/response';

export type ProjectCategory = 'COURSEWORK' | 'HACKATHON' | 'RESEARCH' | 'PERSONAL';
export type ProjectStatus = 'OPEN' | 'FULL' | 'EXPIRED' | 'CLOSED' | 'REMOVED_BY_ADMIN';
export type ApplicationStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED';

export interface CreateProjectDto {
  title: string;
  description: string;
  category: ProjectCategory;
  total_slots: number;
  deadline: string; // YYYY-MM-DD
  skill_ids: string[];
}

export interface ApplyProjectDto {
  intro_note?: string;
}

export interface ResolveApplicationDto {
  action: 'ACCEPT' | 'DECLINE';
}

export interface ListProjectsQueryDto {
  page: number;
  limit: number;
  category?: ProjectCategory;
  skill_id?: string;
  status: ProjectStatus;
  is_mine: boolean;
  search?: string;
}

export interface ListMyApplicationsQueryDto {
  page: number;
  limit: number;
  status?: ApplicationStatus;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ALLOWED_CATEGORIES: ProjectCategory[] = ['COURSEWORK', 'HACKATHON', 'RESEARCH', 'PERSONAL'];
const ALLOWED_STATUSES: ProjectStatus[] = ['OPEN', 'FULL', 'EXPIRED', 'CLOSED', 'REMOVED_BY_ADMIN'];
const ALLOWED_APP_STATUSES: ApplicationStatus[] = ['PENDING', 'ACCEPTED', 'DECLINED', 'CANCELLED'];

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

export function validateCreateProject(input: unknown): CreateProjectDto {
  const body = asRecord(input);
  const details: ApiErrorDetail[] = [];

  const rawTitle = typeof body.title === 'string' ? body.title.trim() : '';
  const rawDesc = typeof body.description === 'string' ? body.description.trim() : '';
  const rawCat = typeof body.category === 'string' ? (body.category.trim().toUpperCase() as ProjectCategory) : ('' as ProjectCategory);
  const rawSlots = Number(body.total_slots);
  const rawDeadline = typeof body.deadline === 'string' ? body.deadline.trim() : '';
  const rawSkillIds = Array.isArray(body.skill_ids) ? body.skill_ids : [];

  if (!rawTitle || rawTitle.length < 10 || rawTitle.length > 150) {
    details.push({ field: 'title', issue: 'Tiêu đề bài đăng phải từ 10 đến 150 ký tự' });
  }

  if (!rawDesc || rawDesc.length < 20 || rawDesc.length > 2000) {
    details.push({ field: 'description', issue: 'Mô tả bài đăng phải từ 20 đến 2000 ký tự' });
  }

  if (!ALLOWED_CATEGORIES.includes(rawCat)) {
    details.push({
      field: 'category',
      issue: `Danh mục dự án không hợp lệ. Cho phép: ${ALLOWED_CATEGORIES.join(', ')}`,
    });
  }

  if (!Number.isInteger(rawSlots) || rawSlots < 1 || rawSlots > 10) {
    details.push({ field: 'total_slots', issue: 'Số lượng thành viên cần tuyển phải là số nguyên từ 1 đến 10' });
  }

  if (!rawDeadline) {
    details.push({ field: 'deadline', issue: 'Hạn chót ứng tuyển là bắt buộc (định dạng YYYY-MM-DD)' });
  } else {
    const deadlineDate = new Date(rawDeadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(deadlineDate.getTime())) {
      details.push({ field: 'deadline', issue: 'Hạn chót ứng tuyển không đúng định dạng ngày tháng' });
    } else if (deadlineDate <= today) {
      details.push({ field: 'deadline', issue: 'Hạn chót ứng tuyển phải là một ngày trong tương lai' });
    }
  }

  if (rawSkillIds.length < 1 || rawSkillIds.length > 10) {
    details.push({ field: 'skill_ids', issue: 'Yêu cầu từ 1 đến 10 kỹ năng liên quan cho dự án' });
  } else {
    const seenSkills = new Set<string>();
    for (let i = 0; i < rawSkillIds.length; i++) {
      const sId = typeof rawSkillIds[i] === 'string' ? rawSkillIds[i].trim() : '';
      if (!UUID_REGEX.test(sId)) {
        details.push({ field: `skill_ids[${i}]`, issue: 'ID kỹ năng phải là UUID hợp lệ' });
      } else if (seenSkills.has(sId)) {
        details.push({ field: `skill_ids[${i}]`, issue: `Kỹ năng ${sId} bị trùng lặp` });
      } else {
        seenSkills.add(sId);
      }
    }
  }

  if (details.length > 0) {
    throw new ValidationFailedError('Dữ liệu đăng tin dự án không hợp lệ', details);
  }

  return {
    title: rawTitle,
    description: rawDesc,
    category: rawCat,
    total_slots: rawSlots,
    deadline: rawDeadline,
    skill_ids: rawSkillIds.map((s: string) => s.trim()),
  };
}

export function validateApplyProject(input: unknown): ApplyProjectDto {
  const body = asRecord(input);
  const details: ApiErrorDetail[] = [];

  let introNote: string | undefined = undefined;
  if ('intro_note' in body && body.intro_note !== null && body.intro_note !== undefined) {
    if (typeof body.intro_note !== 'string') {
      details.push({ field: 'intro_note', issue: 'Lời giới thiệu phải là chuỗi văn bản' });
    } else if (body.intro_note.trim().length > 500) {
      details.push({ field: 'intro_note', issue: 'Lời giới thiệu không được vượt quá 500 ký tự' });
    } else {
      introNote = body.intro_note.trim();
    }
  }

  if (details.length > 0) {
    throw new ValidationFailedError('Dữ liệu đơn ứng tuyển không hợp lệ', details);
  }

  return { intro_note: introNote };
}

export function validateResolveApplication(input: unknown): ResolveApplicationDto {
  const body = asRecord(input);
  const rawAction = typeof body.action === 'string' ? body.action.trim().toUpperCase() : '';

  if (rawAction !== 'ACCEPT' && rawAction !== 'DECLINE') {
    throw new ValidationFailedError('Hành động xử lý đơn không hợp lệ', [
      { field: 'action', issue: 'Hành động phải là ACCEPT hoặc DECLINE' },
    ]);
  }

  return { action: rawAction as 'ACCEPT' | 'DECLINE' };
}

export function validateListProjectsQuery(query: unknown): ListProjectsQueryDto {
  const q = asRecord(query);

  const page = Math.max(1, parseInt(String(q.page || '1'), 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(String(q.limit || '10'), 10) || 10));

  let category: ProjectCategory | undefined = undefined;
  if (typeof q.category === 'string') {
    const upperCat = q.category.trim().toUpperCase() as ProjectCategory;
    if (ALLOWED_CATEGORIES.includes(upperCat)) {
      category = upperCat;
    }
  }

  let skill_id: string | undefined = undefined;
  if (typeof q.skill_id === 'string' && UUID_REGEX.test(q.skill_id.trim())) {
    skill_id = q.skill_id.trim();
  }

  let status: ProjectStatus = 'OPEN';
  if (typeof q.status === 'string') {
    const upperStatus = q.status.trim().toUpperCase() as ProjectStatus;
    if (ALLOWED_STATUSES.includes(upperStatus)) {
      status = upperStatus;
    }
  }

  const is_mine = String(q.is_mine).toLowerCase() === 'true';

  let search: string | undefined = undefined;
  if (typeof q.search === 'string' && q.search.trim()) {
    search = q.search.trim();
  }

  return {
    page,
    limit,
    category,
    skill_id,
    status,
    is_mine,
    search,
  };
}

export function validateListMyApplicationsQuery(query: unknown): ListMyApplicationsQueryDto {
  const q = asRecord(query);

  const page = Math.max(1, parseInt(String(q.page || '1'), 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(String(q.limit || '10'), 10) || 10));

  let status: ApplicationStatus | undefined = undefined;
  if (typeof q.status === 'string') {
    const upperStatus = q.status.trim().toUpperCase() as ApplicationStatus;
    if (ALLOWED_APP_STATUSES.includes(upperStatus)) {
      status = upperStatus;
    }
  }

  return {
    page,
    limit,
    status,
  };
}
