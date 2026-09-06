import { config } from '../../config/env';
import { ValidationFailedError } from '../../utils/errors';
import { ApiErrorDetail } from '../../utils/response';

export interface RegisterDto {
  email: string;
  password: string;
  full_name: string;
}

export interface VerifyEmailDto {
  token: string;
}

export interface ResendVerificationDto {
  email: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  new_password: string;
}

function isValidPassword(password: string): boolean {
  if (!password || password.length < 8 || password.length > 100) return false;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  return hasUpper && hasLower && hasDigit && hasSpecial;
}

function asRecord(input: unknown): Record<string, unknown> {
  if (typeof input !== 'object' || input === null) {
    return {};
  }
  return input as Record<string, unknown>;
}

export function validateRegister(input: unknown): RegisterDto {
  const body = asRecord(input);
  const details: ApiErrorDetail[] = [];

  const rawEmail = typeof body.email === 'string' ? body.email.trim() : '';
  const rawPassword = typeof body.password === 'string' ? body.password : '';
  const rawFullName = typeof body.full_name === 'string' ? body.full_name.trim() : '';

  if (!rawEmail) {
    details.push({ field: 'email', issue: 'Email là bắt buộc và phải là chuỗi văn bản' });
  } else if (!config.institution.domainRegex.test(rawEmail)) {
    details.push({ field: 'email', issue: 'Email phải thuộc tên miền giáo dục hợp lệ (@*.edu.vn)' });
  }

  if (!rawPassword) {
    details.push({ field: 'password', issue: 'Mật khẩu là bắt buộc' });
  } else if (!isValidPassword(rawPassword)) {
    details.push({
      field: 'password',
      issue: 'Mật khẩu phải từ 8 đến 100 ký tự, bao gồm ít nhất 1 chữ hoa, 1 chữ thường, 1 chữ số và 1 ký tự đặc biệt (NFR-SEC-001)',
    });
  }

  if (!rawFullName) {
    details.push({ field: 'full_name', issue: 'Họ và tên là bắt buộc' });
  } else if (rawFullName.length < 2 || rawFullName.length > 100) {
    details.push({ field: 'full_name', issue: 'Họ và tên phải từ 2 đến 100 ký tự' });
  }

  if (details.length > 0) {
    throw new ValidationFailedError('Dữ liệu đăng ký không hợp lệ', details);
  }

  return {
    email: rawEmail.toLowerCase(),
    password: rawPassword,
    full_name: rawFullName,
  };
}

export function validateVerifyEmail(input: unknown): VerifyEmailDto {
  const body = asRecord(input);
  const rawToken = typeof body.token === 'string' ? body.token.trim() : '';

  if (!rawToken) {
    throw new ValidationFailedError('Dữ liệu xác thực không hợp lệ', [
      { field: 'token', issue: 'Mã xác thực là bắt buộc' },
    ]);
  }
  return { token: rawToken };
}

export function validateResendVerification(input: unknown): ResendVerificationDto {
  const body = asRecord(input);
  const rawEmail = typeof body.email === 'string' ? body.email.trim() : '';

  if (!rawEmail || !config.institution.domainRegex.test(rawEmail)) {
    throw new ValidationFailedError('Dữ liệu yêu cầu không hợp lệ', [
      { field: 'email', issue: 'Email giáo dục không hợp lệ' },
    ]);
  }
  return { email: rawEmail.toLowerCase() };
}

export function validateLogin(input: unknown): LoginDto {
  const body = asRecord(input);
  const details: ApiErrorDetail[] = [];
  const rawEmail = typeof body.email === 'string' ? body.email.trim() : '';
  const rawPassword = typeof body.password === 'string' ? body.password : '';

  if (!rawEmail) {
    details.push({ field: 'email', issue: 'Email là bắt buộc' });
  }
  if (!rawPassword) {
    details.push({ field: 'password', issue: 'Mật khẩu là bắt buộc' });
  }

  if (details.length > 0) {
    throw new ValidationFailedError('Dữ liệu đăng nhập không hợp lệ', details);
  }

  return {
    email: rawEmail.toLowerCase(),
    password: rawPassword,
  };
}

export function validateForgotPassword(input: unknown): ForgotPasswordDto {
  const body = asRecord(input);
  const rawEmail = typeof body.email === 'string' ? body.email.trim() : '';

  if (!rawEmail) {
    throw new ValidationFailedError('Email là bắt buộc', [
      { field: 'email', issue: 'Vui lòng cung cấp email hợp lệ' },
    ]);
  }
  return { email: rawEmail.toLowerCase() };
}

export function validateResetPassword(input: unknown): ResetPasswordDto {
  const body = asRecord(input);
  const details: ApiErrorDetail[] = [];
  const rawToken = typeof body.token === 'string' ? body.token.trim() : '';
  const rawNewPassword = typeof body.new_password === 'string' ? body.new_password : '';

  if (!rawToken) {
    details.push({ field: 'token', issue: 'Mã đặt lại mật khẩu là bắt buộc' });
  }

  if (!rawNewPassword) {
    details.push({ field: 'new_password', issue: 'Mật khẩu mới là bắt buộc' });
  } else if (!isValidPassword(rawNewPassword)) {
    details.push({
      field: 'new_password',
      issue: 'Mật khẩu mới phải từ 8 đến 100 ký tự, có ít nhất 1 chữ hoa, 1 chữ thường, 1 chữ số và 1 ký tự đặc biệt',
    });
  }

  if (details.length > 0) {
    throw new ValidationFailedError('Dữ liệu đặt lại mật khẩu không hợp lệ', details);
  }

  return {
    token: rawToken,
    new_password: rawNewPassword,
  };
}
