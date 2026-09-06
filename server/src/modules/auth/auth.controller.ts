import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import {
  validateRegister,
  validateVerifyEmail,
  validateResendVerification,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
} from './auth.validation';
import { sendSuccess } from '../../utils/response';

export class AuthController {
  /**
   * API-AUTH-01: Register Student Account
   * POST /api/v1/auth/register
   */
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = validateRegister(req.body);
      const result = await authService.register(dto);
      return sendSuccess(
        res,
        result,
        'Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.',
        201
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * API-AUTH-02: Verify Email Address
   * POST /api/v1/auth/verify-email
   */
  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = validateVerifyEmail(req.body);
      const result = await authService.verifyEmail(dto);
      return sendSuccess(
        res,
        result,
        'Xác thực email thành công. Bạn có thể đăng nhập ngay bây giờ.'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * API-AUTH-03: Resend Email Verification Token
   * POST /api/v1/auth/resend-verification
   */
  async resendVerification(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = validateResendVerification(req.body);
      await authService.resendVerification(dto);
      return sendSuccess(
        res,
        undefined,
        'Mã xác thực mới đã được gửi tới email của bạn.'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * API-AUTH-04: User Login
   * POST /api/v1/auth/login
   */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = validateLogin(req.body);
      const result = await authService.login(dto);
      return sendSuccess(res, result, 'Đăng nhập thành công');
    } catch (error) {
      next(error);
    }
  }

  /**
   * API-AUTH-05: Request Password Reset Link
   * POST /api/v1/auth/forgot-password
   */
  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = validateForgotPassword(req.body);
      const result = await authService.forgotPassword(dto);
      return sendSuccess(res, undefined, result.message);
    } catch (error) {
      next(error);
    }
  }

  /**
   * API-AUTH-06: Reset Password with Token
   * POST /api/v1/auth/reset-password
   */
  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = validateResetPassword(req.body);
      await authService.resetPassword(dto);
      return sendSuccess(
        res,
        undefined,
        'Đặt lại mật khẩu thành công. Vui lòng đăng nhập với mật khẩu mới.'
      );
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
