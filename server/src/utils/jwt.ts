import * as jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { UnauthorizedError } from './errors';

export interface JwtUserPayload {
  userId: string;
  email: string;
  role: 'STUDENT' | 'ADMIN';
}

export function signJwtToken(payload: JwtUserPayload): string {
  return jwt.sign(
    {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    },
    config.jwt.secret,
    {
      expiresIn: config.jwt.expiresIn,
    }
  );
}

export function verifyJwtToken(token: string): JwtUserPayload {
  let decoded: unknown;

  try {
    decoded = jwt.verify(token, config.jwt.secret);
  } catch (err: unknown) {
    const jwtErr = err as { name?: string; message?: string };
    if (jwtErr.name === 'TokenExpiredError') {
      throw new UnauthorizedError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', 'TOKEN_EXPIRED');
    }
    throw new UnauthorizedError('Mã xác thực không hợp lệ.', 'UNAUTHORIZED');
  }

  // Runtime structure validation of decoded payload
  if (
    typeof decoded !== 'object' ||
    decoded === null ||
    !('userId' in decoded) ||
    !('email' in decoded) ||
    !('role' in decoded) ||
    typeof (decoded as Record<string, unknown>).userId !== 'string' ||
    typeof (decoded as Record<string, unknown>).email !== 'string' ||
    !['STUDENT', 'ADMIN'].includes((decoded as Record<string, unknown>).role as string)
  ) {
    throw new UnauthorizedError('Cấu trúc mã xác thực không hợp lệ.', 'UNAUTHORIZED');
  }

  const validPayload = decoded as { userId: string; email: string; role: 'STUDENT' | 'ADMIN' };

  return {
    userId: validPayload.userId,
    email: validPayload.email,
    role: validPayload.role,
  };
}
