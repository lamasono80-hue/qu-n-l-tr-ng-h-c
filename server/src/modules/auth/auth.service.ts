import { authRepository, UserRow } from './auth.repository';
import {
  RegisterDto,
  VerifyEmailDto,
  ResendVerificationDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './auth.validation';
import { hashPassword, comparePassword } from '../../utils/password';
import { signJwtToken } from '../../utils/jwt';
import { generateSecureToken } from '../../utils/token';
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ValidationFailedError,
} from '../../utils/errors';
import { config } from '../../config/env';

export class AuthService {
  /**
   * API-AUTH-01: Register Student Account
   */
  async register(dto: RegisterDto) {
    const existingUser = await authRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictError('Email này đã được đăng ký trong hệ thống', 'EMAIL_ALREADY_EXISTS');
    }

    const passwordHash = await hashPassword(dto.password);
    const verificationToken = generateSecureToken(32);
    const verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours lifespan (BR-008)

    const newUser = await authRepository.createUserWithProfile(
      dto.email,
      passwordHash,
      dto.full_name,
      verificationToken,
      verificationExpiresAt
    );

    // In a production email service, dispatch the verification token via email here.
    return {
      user_id: newUser.id,
      email: newUser.email,
      status: newUser.status,
    };
  }

  /**
   * API-AUTH-02: Verify Email Address (BR-008)
   */
  async verifyEmail(dto: VerifyEmailDto) {
    const user = await authRepository.findByVerificationToken(dto.token);
    if (!user) {
      throw new ValidationFailedError('Mã xác thực không hợp lệ hoặc không tồn tại', [
        { field: 'token', issue: 'INVALID_TOKEN' },
      ]);
    }

    if (user.verification_expires_at && new Date() > new Date(user.verification_expires_at)) {
      throw new UnauthorizedError(
        'Mã xác thực đã hết hạn sau 24 giờ. Vui lòng yêu cầu mã mới.',
        'TOKEN_EXPIRED'
      );
    }

    const updatedUser = await authRepository.updateVerificationStatus(user.id);

    return {
      email: updatedUser.email,
      status: updatedUser.status,
    };
  }

  /**
   * API-AUTH-03: Resend Verification Token (BR-008)
   */
  async resendVerification(dto: ResendVerificationDto) {
    const user = await authRepository.findByEmail(dto.email);
    if (!user) {
      throw new NotFoundError('Không tìm thấy tài khoản với email đã cung cấp', 'USER_NOT_FOUND');
    }

    if (user.status === 'ACTIVE') {
      throw new ConflictError('Tài khoản này đã được xác thực trước đó', 'ACCOUNT_ALREADY_VERIFIED');
    }

    const verificationToken = generateSecureToken(32);
    const verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours lifespan (BR-008)

    await authRepository.updateVerificationToken(user.id, verificationToken, verificationExpiresAt);

    return {
      email: user.email,
    };
  }

  /**
   * API-AUTH-04: User Login (BR-007)
   */
  async login(dto: LoginDto) {
    const user = await authRepository.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedError('Email hoặc mật khẩu không chính xác', 'INVALID_CREDENTIALS');
    }

    const isMatch = await comparePassword(dto.password, user.password_hash);
    if (!isMatch) {
      throw new UnauthorizedError('Email hoặc mật khẩu không chính xác', 'INVALID_CREDENTIALS');
    }

    // Status checks
    if (user.status === 'PENDING_VERIFICATION') {
      throw new ForbiddenError(
        'Tài khoản chưa xác thực email. Vui lòng kiểm tra hộp thư.',
        'ACCOUNT_NOT_VERIFIED'
      );
    }

    if (user.status === 'SUSPENDED' || user.status === 'DEACTIVATED') {
      throw new ForbiddenError(
        'Tài khoản của bạn đã bị khóa bởi Quản trị viên.',
        'AUTH_ACCOUNT_SUSPENDED'
      );
    }

    const accessToken = signJwtToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: config.jwt.expiresIn,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    };
  }

  /**
   * API-AUTH-05: Request Password Reset Link
   */
  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await authRepository.findByEmail(dto.email);
    if (user && user.status === 'ACTIVE') {
      const resetToken = generateSecureToken(32);
      const resetExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour lifespan
      await authRepository.updateResetToken(user.id, resetToken, resetExpiresAt);
    }

    // Generic safe response to prevent user enumeration
    return {
      message: 'Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi đi.',
    };
  }

  /**
   * API-AUTH-06: Reset Password with Token
   */
  async resetPassword(dto: ResetPasswordDto) {
    const user = await authRepository.findByResetToken(dto.token);
    if (!user || (user.reset_expires_at && new Date() > new Date(user.reset_expires_at))) {
      throw new ValidationFailedError('Mã đặt lại mật khẩu không hợp lệ hoặc đã hết hạn (1 giờ).', [
        { field: 'token', issue: 'TOKEN_EXPIRED_OR_INVALID' },
      ]);
    }

    const newPasswordHash = await hashPassword(dto.new_password);
    await authRepository.updatePassword(user.id, newPasswordHash);

    return {
      email: user.email,
    };
  }
}

export const authService = new AuthService();

