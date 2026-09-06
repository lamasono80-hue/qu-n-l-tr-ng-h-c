import { ValidationFailedError } from '../../utils/errors';

export interface ListNotificationsQueryDto {
  page: number;
  limit: number;
  unread_only: boolean;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

export function validateListNotificationsQuery(query: unknown): ListNotificationsQueryDto {
  const q = asRecord(query);

  const page = Math.max(1, parseInt(String(q.page || '1'), 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(String(q.limit || '20'), 10) || 20));
  const unread_only = String(q.unread_only).toLowerCase() === 'true';

  return {
    page,
    limit,
    unread_only,
  };
}
