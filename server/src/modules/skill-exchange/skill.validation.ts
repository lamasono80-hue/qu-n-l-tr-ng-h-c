import { ValidationFailedError } from '../../utils/errors';
import { ApiErrorDetail } from '../../utils/response';

export type SkillListingType = 'OFFER' | 'REQUEST';
export type SkillProficiencyLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type SkillListingStatus = 'OPEN' | 'CLOSED' | 'REMOVED_BY_ADMIN';
export type SkillResponseStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED';

export interface CreateSkillListingDto {
  type: SkillListingType;
  skill_name: string;
  proficiency_level: SkillProficiencyLevel;
  format?: string;
  availability?: string;
  description: string;
}

export interface RespondSkillListingDto {
  proposal_note?: string;
}

export interface ResolveSkillResponseDto {
  action: 'ACCEPT' | 'DECLINE';
}

export interface ListSkillListingsQueryDto {
  page: number;
  limit: number;
  type?: SkillListingType;
  proficiency_level?: SkillProficiencyLevel;
  status: SkillListingStatus;
  is_mine: boolean;
  search?: string;
}

export interface ListMySkillResponsesQueryDto {
  page: number;
  limit: number;
  status?: SkillResponseStatus;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ALLOWED_TYPES: SkillListingType[] = ['OFFER', 'REQUEST'];
const ALLOWED_LEVELS: SkillProficiencyLevel[] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
const ALLOWED_STATUSES: SkillListingStatus[] = ['OPEN', 'CLOSED', 'REMOVED_BY_ADMIN'];
const ALLOWED_RESP_STATUSES: SkillResponseStatus[] = ['PENDING', 'ACCEPTED', 'DECLINED', 'CANCELLED'];

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

export function validateCreateSkillListing(input: unknown): CreateSkillListingDto {
  const body = asRecord(input);
  const details: ApiErrorDetail[] = [];

  const rawType = typeof body.type === 'string' ? (body.type.trim().toUpperCase() as SkillListingType) : ('' as SkillListingType);
  const rawSkillName = typeof body.skill_name === 'string' ? body.skill_name.trim() : '';
  const rawLevel = typeof body.proficiency_level === 'string' ? (body.proficiency_level.trim().toUpperCase() as SkillProficiencyLevel) : ('' as SkillProficiencyLevel);
  const rawFormat = typeof body.format === 'string' ? body.format.trim() : undefined;
  const rawAvail = typeof body.availability === 'string' ? body.availability.trim() : undefined;
  const rawDesc = typeof body.description === 'string' ? body.description.trim() : '';

  if (!ALLOWED_TYPES.includes(rawType)) {
    details.push({
      field: 'type',
      issue: `Loại bài đăng không hợp lệ. Cho phép: ${ALLOWED_TYPES.join(', ')}`,
    });
  }

  if (!rawSkillName || rawSkillName.length < 2 || rawSkillName.length > 100) {
    details.push({ field: 'skill_name', issue: 'Tên kỹ năng phải từ 2 đến 100 ký tự' });
  }

  if (!ALLOWED_LEVELS.includes(rawLevel)) {
    details.push({
      field: 'proficiency_level',
      issue: `Trình độ kỹ năng không hợp lệ. Cho phép: ${ALLOWED_LEVELS.join(', ')}`,
    });
  }

  if (rawFormat !== undefined && rawFormat.length > 100) {
    details.push({ field: 'format', issue: 'Hình thức trao đổi không được vượt quá 100 ký tự' });
  }

  if (rawAvail !== undefined && rawAvail.length > 200) {
    details.push({ field: 'availability', issue: 'Thời gian rảnh không được vượt quá 200 ký tự' });
  }

  if (!rawDesc || rawDesc.length < 20 || rawDesc.length > 2000) {
    details.push({ field: 'description', issue: 'Mô tả chi tiết phải từ 20 đến 2000 ký tự' });
  }

  if (details.length > 0) {
    throw new ValidationFailedError('Dữ liệu bài đăng trao đổi kỹ năng không hợp lệ', details);
  }

  return {
    type: rawType,
    skill_name: rawSkillName,
    proficiency_level: rawLevel,
    format: rawFormat,
    availability: rawAvail,
    description: rawDesc,
  };
}

export function validateRespondSkillListing(input: unknown): RespondSkillListingDto {
  const body = asRecord(input);
  const details: ApiErrorDetail[] = [];

  let proposal_note: string | undefined = undefined;
  if ('proposal_note' in body && body.proposal_note !== null && body.proposal_note !== undefined) {
    if (typeof body.proposal_note !== 'string') {
      details.push({ field: 'proposal_note', issue: 'Ghi chú đề xuất phải là chuỗi văn bản' });
    } else if (body.proposal_note.trim().length > 500) {
      details.push({ field: 'proposal_note', issue: 'Ghi chú đề xuất không được vượt quá 500 ký tự' });
    } else {
      proposal_note = body.proposal_note.trim();
    }
  }

  if (details.length > 0) {
    throw new ValidationFailedError('Dữ liệu đề xuất trao đổi kỹ năng không hợp lệ', details);
  }

  return { proposal_note };
}

export function validateResolveSkillResponse(input: unknown): ResolveSkillResponseDto {
  const body = asRecord(input);
  const rawAction = typeof body.action === 'string' ? body.action.trim().toUpperCase() : '';

  if (rawAction !== 'ACCEPT' && rawAction !== 'DECLINE') {
    throw new ValidationFailedError('Hành động xử lý đề xuất không hợp lệ', [
      { field: 'action', issue: 'Hành động phải là ACCEPT hoặc DECLINE' },
    ]);
  }

  return { action: rawAction as 'ACCEPT' | 'DECLINE' };
}

export function validateListSkillListingsQuery(query: unknown): ListSkillListingsQueryDto {
  const q = asRecord(query);

  const page = Math.max(1, parseInt(String(q.page || '1'), 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(String(q.limit || '10'), 10) || 10));

  let type: SkillListingType | undefined = undefined;
  if (typeof q.type === 'string') {
    const upperType = q.type.trim().toUpperCase() as SkillListingType;
    if (ALLOWED_TYPES.includes(upperType)) {
      type = upperType;
    }
  }

  let proficiency_level: SkillProficiencyLevel | undefined = undefined;
  if (typeof q.proficiency_level === 'string') {
    const upperLevel = q.proficiency_level.trim().toUpperCase() as SkillProficiencyLevel;
    if (ALLOWED_LEVELS.includes(upperLevel)) {
      proficiency_level = upperLevel;
    }
  }

  let status: SkillListingStatus = 'OPEN';
  if (typeof q.status === 'string') {
    const upperStatus = q.status.trim().toUpperCase() as SkillListingStatus;
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
    type,
    proficiency_level,
    status,
    is_mine,
    search,
  };
}

export function validateListMySkillResponsesQuery(query: unknown): ListMySkillResponsesQueryDto {
  const q = asRecord(query);

  const page = Math.max(1, parseInt(String(q.page || '1'), 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(String(q.limit || '10'), 10) || 10));

  let status: SkillResponseStatus | undefined = undefined;
  if (typeof q.status === 'string') {
    const upperStatus = q.status.trim().toUpperCase() as SkillResponseStatus;
    if (ALLOWED_RESP_STATUSES.includes(upperStatus)) {
      status = upperStatus;
    }
  }

  return {
    page,
    limit,
    status,
  };
}
