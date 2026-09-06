import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ApiError } from '../../services/apiClient';
import { KeyRound, CheckCircle2 } from 'lucide-react';

export const PasswordRecoveryPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [email, setEmail] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError('Vui lòng nhập email');
      return;
    }
    try {
      setIsRequesting(true);
      await authService.forgotPassword(email.trim());
      setRequestSuccess(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Không thể xử lý yêu cầu lúc này.');
      }
    } finally {
      setIsRequesting(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPassword.length < 8) {
      setError('Mật khẩu mới phải có tối thiểu 8 ký tự');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    try {
      setIsResetting(true);
      await authService.resetPassword({
        token: token!,
        new_password: newPassword,
      });
      setResetSuccess(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.');
      }
    } finally {
      setIsResetting(false);
    }
  };

  if (token) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Đặt lại mật khẩu</h2>
            <p className="mt-1 text-sm text-slate-500">Nhập mật khẩu mới cho tài khoản của bạn</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
              {error}
            </div>
          )}

          {resetSuccess ? (
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Cập nhật mật khẩu thành công!</h3>
              <p className="mt-1 text-xs text-slate-500">Bây giờ bạn có thể đăng nhập bằng mật khẩu mới.</p>
              <Link to="/login" className="block mt-6">
                <Button className="w-full">Đăng nhập</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <Input
                type="password"
                label="Mật khẩu mới"
                placeholder="••••••••"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <Input
                type="password"
                label="Xác nhận mật khẩu mới"
                placeholder="••••••••"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <Button type="submit" isLoading={isResetting} className="w-full mt-2">
                Cập nhật mật khẩu
              </Button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Khôi phục mật khẩu</h2>
          <p className="mt-1 text-sm text-slate-500">
            Nhập email trường đã đăng ký để nhận liên kết đặt lại mật khẩu
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
            {error}
          </div>
        )}

        {requestSuccess ? (
          <div className="text-center">
            <div className="p-4 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-medium mb-6">
              Nếu email tồn tại trên hệ thống, một liên kết khôi phục đã được gửi đến hòm thư của bạn.
            </div>
            <Link to="/login">
              <Button variant="outline" className="w-full">Quay lại Đăng nhập</Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleRequestSubmit} className="space-y-4">
            <Input
              type="email"
              label="Email trường"
              placeholder="mssv@university.edu.vn"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit" isLoading={isRequesting} className="w-full mt-2">
              Gửi liên kết khôi phục
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-xs text-slate-500">
          Nhớ lại mật khẩu?{' '}
          <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
};
