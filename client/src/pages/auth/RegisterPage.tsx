// RegisterPage.tsx (SCR-02)
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ApiError } from '../../services/apiClient';

export const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    // Client-side validations
    const errors: Record<string, string> = {};
    if (fullName.trim().length < 2) errors.fullName = 'Họ và tên phải từ 2 ký tự';
    if (!email.trim().toLowerCase().endsWith('.edu.vn')) {
      errors.email = 'Chỉ chấp nhận email trường đại học có đuôi .edu.vn (FR-AUTH-002)';
    }
    if (password.length < 8) errors.password = 'Mật khẩu phải có tối thiểu 8 ký tự';
    if (password !== confirmPassword) errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    if (!agreeTerms) errors.agreeTerms = 'Bạn phải đồng ý với Quy định cộng đồng';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      setIsLoading(true);
      await authService.register({
        email: email.trim(),
        password,
        full_name: fullName.trim(),
      });
      navigate(`/verify-email?email=${encodeURIComponent(email.trim())}`);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.details) {
          const detailMap: Record<string, string> = {};
          err.details.forEach((d) => {
            if (d.field) detailMap[d.field] = d.issue;
          });
          setFieldErrors(detailMap);
        }
      } else {
        setError('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Tạo tài khoản sinh viên</h2>
          <p className="mt-1 text-sm text-slate-500">
            Sử dụng email trường (.edu.vn) để đăng ký
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Họ và tên"
            placeholder="Nguyễn Văn A"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            error={fieldErrors.fullName || fieldErrors.full_name}
          />

          <Input
            type="email"
            label="Email trường"
            placeholder="mssv@university.edu.vn"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            helperText="VD: student@hcmut.edu.vn, nguyenvan@vnu.edu.vn"
            error={fieldErrors.email}
          />

          <Input
            type="password"
            label="Mật khẩu"
            placeholder="••••••••"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
          />

          <Input
            type="password"
            label="Xác nhận mật khẩu"
            placeholder="••••••••"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={fieldErrors.confirmPassword}
          />

          <div className="pt-1">
            <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>
                Tôi đồng ý với{' '}
                <span className="text-indigo-600 underline font-medium">Quy định cộng đồng</span> và{' '}
                <span className="text-indigo-600 underline font-medium">Bảo mật dữ liệu sinh viên</span>.
              </span>
            </label>
            {fieldErrors.agreeTerms && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.agreeTerms}</p>
            )}
          </div>

          <Button type="submit" isLoading={isLoading} className="w-full mt-2">
            Đăng ký tài khoản
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
};
