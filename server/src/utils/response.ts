import { Response } from 'express';

export interface PaginationMeta {
  page?: number;
  limit?: number;
  total?: number;
  total_pages?: number;
  unread_count?: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: PaginationMeta;
}

export interface ApiErrorDetail {
  field?: string;
  issue: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: ApiErrorDetail[];
  };
}

export function sendSuccess<T = unknown>(
  res: Response,
  data?: T,
  message?: string,
  statusCode: number = 200,
  meta?: PaginationMeta
): Response {
  const responsePayload: ApiResponse<T> = {
    success: true,
  };

  if (message) {
    responsePayload.message = message;
  }

  if (data !== undefined) {
    responsePayload.data = data;
  }

  if (meta) {
    responsePayload.meta = meta;
  }

  return res.status(statusCode).json(responsePayload);
}

export function sendError(
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  details?: ApiErrorDetail[]
): Response {
  const errorPayload: ApiErrorResponse = {
    success: false,
    error: {
      code,
      message,
    },
  };

  if (details && details.length > 0) {
    errorPayload.error.details = details;
  }

  return res.status(statusCode).json(errorPayload);
}
