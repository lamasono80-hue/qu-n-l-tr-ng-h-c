import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { sendError } from '../utils/response';

interface DatabaseError extends Error {
  code?: string;
  detail?: string;
}

export function errorHandler(
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response {
  if (err instanceof AppError) {
    return sendError(
      res,
      err.statusCode,
      err.code,
      err.message,
      err.details
    );
  }

  // Handle generic PostgreSQL syntax / constraint errors
  const dbErr = err as DatabaseError;
  if (dbErr.code === '23505') {
    // Unique violation
    return sendError(
      res,
      409,
      'CONFLICT',
      'Dữ liệu bị trùng lặp hoặc đã tồn tại trong hệ thống.'
    );
  }

  if (dbErr.code === '23503') {
    // Foreign key violation
    return sendError(
      res,
      400,
      'INVALID_REFERENCE',
      'Tham chiếu dữ liệu không hợp lệ hoặc không tồn tại.'
    );
  }

  console.error('[Unhandled Server Error]:', err);

  return sendError(
    res,
    500,
    'INTERNAL_SERVER_ERROR',
    'Đã xảy ra lỗi hệ thống nội bộ. Vui lòng thử lại sau.'
  );
}
