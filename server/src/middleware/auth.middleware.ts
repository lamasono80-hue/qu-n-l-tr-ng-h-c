import { Request, Response, NextFunction } from 'express';
import { verifyJwtToken, JwtUserPayload } from '../utils/jwt';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { pool } from '../config/database';

export interface AuthenticatedUser extends JwtUserPayload {
  status: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

/**
 * Authentication Middleware:
 * 1. Validates presence and format of 'Authorization: Bearer <token>' header.
 * 2. Cryptographically verifies JWT signature and expiration.
 * 3. Enforces Session Revocation Guard (BR-007): queries PostgreSQL to ensure account status is 'ACTIVE'.
 *    If account is SUSPENDED or DEACTIVATED, immediately rejects request with 403 AUTH_ACCOUNT_SUSPENDED.
 */
export async function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Vui lòng cung cấp mã xác thực hợp lệ (Bearer token)');
    }

    const token = authHeader.substring(7).trim();
    if (!token) {
      throw new UnauthorizedError('Mã xác thực không được để trống.');
    }

    const decoded = verifyJwtToken(token);

    // Database verification for BR-007 (Session revocation on suspension/deactivation)
    const userRes = await pool.query<{ id: string; email: string; role: 'STUDENT' | 'ADMIN'; status: string }>(
      `SELECT id, email, role, status FROM users WHERE id = $1`,
      [decoded.userId]
    );

    if (userRes.rows.length === 0) {
      throw new UnauthorizedError('Tài khoản không tồn tại trong hệ thống.', 'UNAUTHORIZED');
    }

    const user = userRes.rows[0];

    if (user.status === 'SUSPENDED' || user.status === 'DEACTIVATED') {
      throw new ForbiddenError(
        'Tài khoản của bạn đã bị khóa hoặc vô hiệu hóa bởi Quản trị viên.',
        'AUTH_ACCOUNT_SUSPENDED'
      );
    }

    if (user.status !== 'ACTIVE') {
      throw new ForbiddenError(
        'Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email xác thực.',
        'ACCOUNT_NOT_VERIFIED'
      );
    }

    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    };

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Role-Based Access Control Middleware (RBAC)
 */
export function requireRole(allowedRoles: Array<'STUDENT' | 'ADMIN'>) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError('Bạn không có quyền truy cập vào chức năng này.', 'FORBIDDEN'));
    }

    next();
  };
}
