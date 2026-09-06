import { ValidationFailedError } from '../../utils/errors';
import { ApiErrorDetail } from '../../utils/response';

export interface SendMessageDto {
  content: string;
}

export interface ListMessagesQueryDto {
  page: number;
  limit: number;
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

export function validateSendMessage(input: unknown): SendMessageDto {
  const body = asRecord(input);
  const details: ApiErrorDetail[] = [];

  const rawContent = typeof body.content === 'string' ? body.content.trim() : '';

  if (!rawContent || rawContent.length < 1 || rawContent.length > 1000) {
    details.push({
      field: 'content',
      issue: 'Nội dung tin nhắn phải có độ dài từ 1 đến 1000 ký tự (FR-CHAT-007)',
    });
  }

  if (details.length > 0) {
    throw new ValidationFailedError('Dữ liệu tin nhắn không hợp lệ', details);
  }

  return {
    content: rawContent,
  };
}

export function validateListMessagesQuery(query: unknown): ListMessagesQueryDto {
  const q = asRecord(query);

  const page = Math.max(1, parseInt(String(q.page || '1'), 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(String(q.limit || '30'), 10) || 30));

  return {
    page,
    limit,
  };
}
