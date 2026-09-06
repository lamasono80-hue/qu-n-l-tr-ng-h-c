export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: Array<{ field?: string; issue: string }>;

  constructor(
    statusCode: number,
    code: string,
    message: string,
    details?: Array<{ field?: string; issue: string }>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationFailedError extends AppError {
  constructor(message: string, details?: Array<{ field?: string; issue: string }>) {
    super(400, 'VALIDATION_FAILED', message, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Vui lòng đăng nhập để tiếp tục', code: string = 'UNAUTHORIZED') {
    super(401, code, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Bạn không có quyền thực hiện hành động này', code: string = 'FORBIDDEN') {
    super(403, code, message);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Không tìm thấy tài nguyên yêu cầu', code: string = 'NOT_FOUND') {
    super(404, code, message);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Tài nguyên đã tồn tại hoặc xảy ra xung đột', code: string = 'CONFLICT') {
    super(409, code, message);
  }
}
