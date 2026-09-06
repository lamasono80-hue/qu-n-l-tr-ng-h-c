import { ValidationFailedError } from '../../utils/errors';
import { ApiErrorDetail } from '../../utils/response';

export type StudyMode = 'ONLINE' | 'OFFLINE' | 'HYBRID';
export type StudyRequestStatus = 'OPEN' | 'CLOSED' | 'REMOVED_BY_ADMIN';
export type StudyConnectionStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED';

export interface CreateStudyRequestDto {
  course_id: string;
  topic: string;
  study_mode: StudyMode;
  availability: string;
  description?: string;
}

export interface ConnectStudyRequestDto {
  note?: string;
}

export interface ResolveStudyConnectionDto {
  action: 'ACCEPT' | 'DECLINE';
}

export interface ListStudyRequestsQueryDto {
  page: number;
  limit: number;
  course_id?: string;
  study_mode?: StudyMode;
  status: StudyRequestStatus;
  is_mine: boolean;
  search?: string;
}

export interface ListMyStudyConnectionsQueryDto {
  page: number;
  limit: number;
  status?: StudyConnectionStatus;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ALLOWED_MODES: StudyMode[] = ['ONLINE', 'OFFLINE', 'HYBRID'];
const ALLOWED_STATUSES: StudyRequestStatus[] = ['OPEN', 'CLOSED', 'REMOVED_BY_ADMIN'];
const ALLOWED_CONN_STATUSES: StudyConnectionStatus[] = ['PENDING', 'ACCEPTED', 'DECLINED', 'CANCELLED'];

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

export function validateCreateStudyRequest(input: unknown): CreateStudyRequestDto {
  const body = asRecord(input);
  const details: ApiErrorDetail[] = [];

  const rawCourseId = typeof body.course_id === 'string' ? body.course_id.trim() : '';
  const rawTopic = typeof body.topic === 'string' ? body.topic.trim() : '';
  const rawMode = typeof body.study_mode === 'string' ? (body.study_mode.trim().toUpperCase() as StudyMode) : ('' as StudyMode);
  const rawAvail = typeof body.availability === 'string' ? body.availability.trim() : '';
  const rawDesc = typeof body.description === 'string' ? body.description.trim() : undefined;

  if (!rawCourseId || !UUID_REGEX.test(rawCourseId)) {
    details.push({ field: 'course_id', issue: 'Mã môn học (course_id) phải là UUID hợp lệ' });
  }

  if (!rawTopic || rawTopic.length < 5 || rawTopic.length > 100) {
    details.push({ field: 'topic', issue: 'Chủ đề học tập phải từ 5 đến 100 ký tự' });
  }

  if (!ALLOWED_MODES.includes(rawMode)) {
    details.push({
      field: 'study_mode',
      issue: `Hình thức học tập không hợp lệ. Cho phép: ${ALLOWED_MODES.join(', ')}`,
    });
  }

  if (!rawAvail || rawAvail.length < 5 || rawAvail.length > 200) {
    details.push({ field: 'availability', issue: 'Thời gian rảnh/lịch học phải từ 5 đến 200 ký tự' });
  }

  if (rawDesc !== undefined && (rawDesc.length < 10 || rawDesc.length > 1000)) {
    details.push({ field: 'description', issue: 'Mô tả chi tiết phải từ 10 đến 1000 ký tự nếu cung cấp' });
  }

  if (details.length > 0) {
    throw new ValidationFailedError('Dữ liệu yêu cầu tìm bạn học không hợp lệ', details);
  }

  return {
    course_id: rawCourseId,
    topic: rawTopic,
    study_mode: rawMode,
    availability: rawAvail,
    description: rawDesc,
  };
}

export function validateConnectStudyRequest(input: unknown): ConnectStudyRequestDto {
  const body = asRecord(input);
  const details: ApiErrorDetail[] = [];

  let note: string | undefined = undefined;
  if ('note' in body && body.note !== null && body.note !== undefined) {
    if (typeof body.note !== 'string') {
      details.push({ field: 'note', issue: 'Ghi chú kết nối phải là chuỗi văn bản' });
    } else if (body.note.trim().length > 500) {
      details.push({ field: 'note', issue: 'Ghi chú kết nối không được vượt quá 500 ký tự' });
    } else {
      note = body.note.trim();
    }
  }

  if (details.length > 0) {
    throw new ValidationFailedError('Dữ liệu kết nối học tập không hợp lệ', details);
  }

  return { note };
}

export function validateResolveStudyConnection(input: unknown): ResolveStudyConnectionDto {
  const body = asRecord(input);
  const rawAction = typeof body.action === 'string' ? body.action.trim().toUpperCase() : '';

  if (rawAction !== 'ACCEPT' && rawAction !== 'DECLINE') {
    throw new ValidationFailedError('Hành động xử lý kết nối không hợp lệ', [
      { field: 'action', issue: 'Hành động phải là ACCEPT hoặc DECLINE' },
    ]);
  }

  return { action: rawAction as 'ACCEPT' | 'DECLINE' };
}

export function validateListStudyRequestsQuery(query: unknown): ListStudyRequestsQueryDto {
  const q = asRecord(query);

  const page = Math.max(1, parseInt(String(q.page || '1'), 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(String(q.limit || '10'), 10) || 10));

  let course_id: string | undefined = undefined;
  if (typeof q.course_id === 'string' && UUID_REGEX.test(q.course_id.trim())) {
    course_id = q.course_id.trim();
  }

  let study_mode: StudyMode | undefined = undefined;
  if (typeof q.study_mode === 'string') {
    const upperMode = q.study_mode.trim().toUpperCase() as StudyMode;
    if (ALLOWED_MODES.includes(upperMode)) {
      study_mode = upperMode;
    }
  }

  let status: StudyRequestStatus = 'OPEN';
  if (typeof q.status === 'string') {
    const upperStatus = q.status.trim().toUpperCase() as StudyRequestStatus;
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
    course_id,
    study_mode,
    status,
    is_mine,
    search,
  };
}

export function validateListMyStudyConnectionsQuery(query: unknown): ListMyStudyConnectionsQueryDto {
  const q = asRecord(query);

  const page = Math.max(1, parseInt(String(q.page || '1'), 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(String(q.limit || '10'), 10) || 10));

  let status: StudyConnectionStatus | undefined = undefined;
  if (typeof q.status === 'string') {
    const upperStatus = q.status.trim().toUpperCase() as StudyConnectionStatus;
    if (ALLOWED_CONN_STATUSES.includes(upperStatus)) {
      status = upperStatus;
    }
  }

  return {
    page,
    limit,
    status,
  };
}
