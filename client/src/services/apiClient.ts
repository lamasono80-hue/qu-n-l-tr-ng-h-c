import { ApiResponse } from '../types';

export class ApiError extends Error {
  public code: string;
  public status: number;
  public details?: Array<{ field?: string; issue: string }>;

  constructor(status: number, message: string, code: string = 'UNKNOWN_ERROR', details?: Array<{ field?: string; issue: string }>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const API_BASE = '/api/v1';

export async function apiRequest<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('uniconnect_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  let data: ApiResponse<T>;
  try {
    data = await response.json();
  } catch {
    if (!response.ok) {
      throw new ApiError(response.status, 'Không thể đọc phản hồi từ máy chủ', 'NETWORK_ERROR');
    }
    data = { success: true } as ApiResponse<T>;
  }

  if (!response.ok || !data.success) {
    const errCode = data.error?.code || `HTTP_${response.status}`;
    const errMsg = data.error?.message || data.message || 'Yêu cầu không thành công';
    throw new ApiError(response.status, errMsg, errCode, data.error?.details);
  }

  return data;
}
