import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Mail, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { authService } from '../../services/authService';
import { Button } from '../../components/ui/Button';
import { ApiError } from '../../services/apiClient';

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const emailParam = searchParams.get('email') || '';

  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      const doVerify = async () => {
        setIsVerifying(true);
        try {
          await authService.verifyEmail(token);
          setIsSuccess(true);
        } catch (err) {
          if (err instanceof ApiError) {
            setErrorMessage(err.message);
          } else {
            setErrorMessage('Liên kết xác thực không hợp lệ hoặc đã hết hạn.');
          }
        } finally {
          setIsVerifying(false);
        }
      };
      doVerify();
    }
  }, [token]);

  const handleResend = async () => {
    if (!emailParam) return;
    try {
      setIsResending(true);
      setResendStatus(null);
      await authService.resendVerification(emailParam);
      setResendStatus('Đã gửi lại email xác thực thành công. Vui lòng kiểm tra hòm thư!');
    } catch (err) {
      if (err instanceof ApiError) {
        setResendStatus(`Lỗi: ${err.message}`);
      } else {
        setResendStatus('Không thể gửi lại email vào lúc này.');
      }
    } finally {
      setIsResending(false);
    }
  };

  if (token) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200/80 shadow-sm p-8 text-center">
          {isVerifying && (
            <div>
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-800">Đang kích hoạt tài khoản...</h3>
            </div>
          )}

          {!isVerifying && isSuccess && (
            <div>
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Kích hoạt tài khoản thành công!</h3>
              <p className="mt-2 text-sm text-slate-600">
                Email trường của bạn đã được xác minh. Bây giờ bạn có thể đăng nhập để hoàn thiện hồ sơ.
              </p>
              <Link to="/login" className="block mt-6">
                <Button className="w-full">Đăng nhập ngay</Button>
              </Link>
            </div>
          )}

          {!isVerifying && errorMessage && (
            <div>
              <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Xác thực thất bại</h3>
              <p className="mt-2 text-sm text-red-600">{errorMessage}</p>
              <Link to="/login" className="block mt-6">
                <Button variant="outline" className="w-full">Quay lại Đăng nhập</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200/80 shadow-sm p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8" />
        </div>

        <h3 className="text-xl font-bold text-slate-900">Kiểm tra hộp thư của bạn</h3>
        <p className="mt-2 text-sm text-slate-600">
          Chúng tôi đã gửi email chứa liên kết xác minh tài khoản tới:
        </p>
        <p className="mt-1 text-sm font-semibold text-slate-800 bg-slate-100 py-1.5 px-3 rounded-lg inline-block">
          {emailParam || 'Email của bạn'}
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Vui lòng nhấp vào liên kết trong email để kích hoạt tài khoản sinh viên.
        </p>

        {resendStatus && (
          <div className="mt-4 p-3 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-medium">
            {resendStatus}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3">
          {emailParam && (
            <Button
              variant="outline"
              onClick={handleResend}
              isLoading={isResending}
              className="w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" /> Gửi lại email xác thực
            </Button>
          )}

          <Link to="/login">
            <Button variant="ghost" className="w-full text-xs text-slate-500">
              Quay lại trang Đăng nhập
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
