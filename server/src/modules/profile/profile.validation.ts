import { ValidationFailedError } from '../../utils/errors';
import { ApiErrorDetail } from '../../utils/response';

export interface UpdateProfileDto {
  full_name?: string;
  avatar_url?: string | null;
  campus?: string | null;
  major?: string | null;
  year_of_study?: number | null;
  bio?: string | null;
  github_url?: string | null;
  linkedin_url?: string | null;
}

export type SkillProficiency = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type SkillCategory = 'TECH' | 'DESIGN' | 'LANGUAGE' | 'ACADEMIC' | 'OTHER';

export interface UpdateProfileSkillsDto {
  skills: Array<{
    skill_id: string;
    proficiency_level: SkillProficiency;
  }>;
}

export interface UpdateProfileCoursesDto {
  course_ids: string[];
}

export interface SkillsQueryDto {
  q?: string;
  category?: SkillCategory;
}

export interface CoursesQueryDto {
  q?: string;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ALLOWED_PROFICIENCIES: SkillProficiency[] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
const ALLOWED_CATEGORIES: SkillCategory[] = ['TECH', 'DESIGN', 'LANGUAGE', 'ACADEMIC', 'OTHER'];

function asRecord(input: unknown): Record<string, unknown> {
  if (typeof input !== 'object' || input === null) {
    return {};
  }
  return input as Record<string, unknown>;
}

export function validateUserId(param: unknown): string {
  if (typeof param !== 'string' || !UUID_REGEX.test(param.trim())) {
    throw new ValidationFailedError('ID người dùng không hợp lệ (yêu cầu định dạng UUID)', [
      { field: 'userId', issue: 'Định dạng UUID không hợp lệ' },
    ]);
  }
  return param.trim();
}

export function validateUpdateProfile(input: unknown): UpdateProfileDto {
  const body = asRecord(input);
  const details: ApiErrorDetail[] = [];
  const dto: UpdateProfileDto = {};

  if ('full_name' in body) {
    if (typeof body.full_name !== 'string' || body.full_name.trim().length < 2 || body.full_name.trim().length > 100) {
      details.push({ field: 'full_name', issue: 'Họ và tên phải từ 2 đến 100 ký tự' });
    } else {
      dto.full_name = body.full_name.trim();
    }
  }

  if ('year_of_study' in body) {
    if (body.year_of_study !== null && body.year_of_study !== undefined) {
      const year = Number(body.year_of_study);
      if (!Number.isInteger(year) || year < 1 || year > 6) {
        details.push({ field: 'year_of_study', issue: 'Năm học phải là số nguyên từ 1 đến 6' });
      } else {
        dto.year_of_study = year;
      }
    } else {
      dto.year_of_study = null;
    }
  }

  if ('campus' in body) {
    dto.campus = typeof body.campus === 'string' ? body.campus.trim() : null;
  }

  if ('major' in body) {
    dto.major = typeof body.major === 'string' ? body.major.trim() : null;
  }

  if ('bio' in body) {
    dto.bio = typeof body.bio === 'string' ? body.bio.trim() : null;
  }

  if ('avatar_url' in body) {
    dto.avatar_url = typeof body.avatar_url === 'string' ? body.avatar_url.trim() : null;
  }

  if ('github_url' in body) {
    dto.github_url = typeof body.github_url === 'string' ? body.github_url.trim() : null;
  }

  if ('linkedin_url' in body) {
    dto.linkedin_url = typeof body.linkedin_url === 'string' ? body.linkedin_url.trim() : null;
  }

  if (details.length > 0) {
    throw new ValidationFailedError('Dữ liệu cập nhật hồ sơ không hợp lệ', details);
  }

  return dto;
}

export function validateUpdateProfileSkills(input: unknown): UpdateProfileSkillsDto {
  const body = asRecord(input);
  const details: ApiErrorDetail[] = [];

  if (!Array.isArray(body.skills)) {
    throw new ValidationFailedError('Danh sách kỹ năng phải là một mảng (array)', [
      { field: 'skills', issue: 'Yêu cầu định dạng mảng các kỹ năng' },
    ]);
  }

  const seenSkillIds = new Set<string>();
  const validatedSkills: Array<{ skill_id: string; proficiency_level: SkillProficiency }> = [];

  for (let i = 0; i < body.skills.length; i++) {
    const item = asRecord(body.skills[i]);
    const skillId = typeof item.skill_id === 'string' ? item.skill_id.trim() : '';
    const level = typeof item.proficiency_level === 'string' ? (item.proficiency_level.trim().toUpperCase() as SkillProficiency) : ('' as SkillProficiency);

    if (!UUID_REGEX.test(skillId)) {
      details.push({ field: `skills[${i}].skill_id`, issue: 'skill_id phải là định dạng UUID hợp lệ' });
    }

    if (!ALLOWED_PROFICIENCIES.includes(level)) {
      details.push({
        field: `skills[${i}].proficiency_level`,
        issue: `Trình độ kỹ năng phải thuộc một trong các giá trị: ${ALLOWED_PROFICIENCIES.join(', ')}`,
      });
    }

    if (seenSkillIds.has(skillId)) {
      details.push({ field: `skills[${i}].skill_id`, issue: `Kỹ năng ${skillId} bị trùng lặp trong danh sách gửi lên` });
    } else {
      seenSkillIds.add(skillId);
    }

    validatedSkills.push({
      skill_id: skillId,
      proficiency_level: level,
    });
  }

  if (details.length > 0) {
    throw new ValidationFailedError('Dữ liệu kỹ năng không hợp lệ', details);
  }

  return { skills: validatedSkills };
}

export function validateUpdateProfileCourses(input: unknown): UpdateProfileCoursesDto {
  const body = asRecord(input);
  const details: ApiErrorDetail[] = [];

  if (!Array.isArray(body.course_ids)) {
    throw new ValidationFailedError('Danh sách môn học phải là một mảng UUIDs', [
      { field: 'course_ids', issue: 'Yêu cầu định dạng mảng course_ids' },
    ]);
  }

  const seenCourseIds = new Set<string>();
  const validatedCourseIds: string[] = [];

  for (let i = 0; i < body.course_ids.length; i++) {
    const rawId = body.course_ids[i];
    const courseId = typeof rawId === 'string' ? rawId.trim() : '';

    if (!UUID_REGEX.test(courseId)) {
      details.push({ field: `course_ids[${i}]`, issue: 'course_id phải là định dạng UUID hợp lệ' });
    }

    if (seenCourseIds.has(courseId)) {
      details.push({ field: `course_ids[${i}]`, issue: `Môn học ${courseId} bị trùng lặp trong danh sách gửi lên` });
    } else {
      seenCourseIds.add(courseId);
    }

    validatedCourseIds.push(courseId);
  }

  if (details.length > 0) {
    throw new ValidationFailedError('Dữ liệu môn học không hợp lệ', details);
  }

  return { course_ids: validatedCourseIds };
}

export function validateSkillsQuery(query: unknown): SkillsQueryDto {
  const qObj = asRecord(query);
  const dto: SkillsQueryDto = {};

  if (typeof qObj.q === 'string' && qObj.q.trim()) {
    dto.q = qObj.q.trim();
  }

  if (typeof qObj.category === 'string') {
    const cat = qObj.category.trim().toUpperCase() as SkillCategory;
    if (ALLOWED_CATEGORIES.includes(cat)) {
      dto.category = cat;
    }
  }

  return dto;
}

export function validateCoursesQuery(query: unknown): CoursesQueryDto {
  const qObj = asRecord(query);
  const dto: CoursesQueryDto = {};

  if (typeof qObj.q === 'string' && qObj.q.trim()) {
    dto.q = qObj.q.trim();
  }

  return dto;
}
