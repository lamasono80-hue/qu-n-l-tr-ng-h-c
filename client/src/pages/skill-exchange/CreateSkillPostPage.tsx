// CreateSkillPostPage.tsx (SCR-18)
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { skillExchangeService } from '../../services/skillExchangeService';
import { SkillListingType } from '../../types';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ApiError } from '../../services/apiClient';

export const CreateSkillPostPage: React.FC = () => {
  const navigate = useNavigate();

  const [type, setType] = useState<SkillListingType>('OFFER');
  const [skillName, setSkillName] = useState('');
  const [proficiencyLevel, setProficiencyLevel] = useState<'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'>('INTERMEDIATE');
  const [format, setFormat] = useState<'ONE_ON_ONE_ONLINE' | 'ONE_ON_ONE_OFFLINE' | 'SMALL_GROUP'>('ONE_ON_ONE_ONLINE');
  const [description, setDescription] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (skillName.trim().length < 2) {
      setError('Tên kỹ năng phải từ 2 ký tự');
      return;
    }
    if (description.trim().length < 20) {
      setError('Mô tả chi tiết phải có ít nhất 20 ký tự');
      return;
    }

    try {
      setIsLoading(true);
      await skillExchangeService.createSkillListing({
        type,
        skill_name: skillName.trim(),
        proficiency_level: proficiencyLevel,
        format,
        description: description.trim(),
      });
      navigate('/skill-exchange');
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === 'PROFILE_INCOMPLETE') {
          setError('Hồ sơ của bạn chưa hoàn thiện (BR-001). Vui lòng cập nhật hồ sơ trước.');
        } else if (err.code === 'QUOTA_EXCEEDED') {
          setError('Bạn đã đạt giới hạn tối đa 5 bài đăng đang mở cùng lúc (BR-002).');
        } else {
          setError(err.message);
        }
      } else {
        setError('Không thể đăng tin kỹ năng vào lúc này.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link to="/skill-exchange" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800">
        <ArrowLeft className="w-4 h-4" /> Quay lại
      </Link>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Đăng tin trao đổi kỹ năng</h1>
          <p className="text-xs text-slate-500 mt-1">Chia sẻ kiến thức hoặc tìm người hướng dẫn 1-1</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Loại tin đăng</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('OFFER')}
                className={`py-2.5 px-3 text-xs font-semibold rounded-lg border text-center transition-all ${
                  type === 'OFFER'
                    ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                🎓 Tôi muốn chia sẻ kỹ năng (Offer)
              </button>
              <button
                type="button"
                onClick={() => setType('REQUEST')}
                className={`py-2.5 px-3 text-xs font-semibold rounded-lg border text-center transition-all ${
                  type === 'REQUEST'
                    ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                🙋 Tôi muốn học kỹ năng (Request)
              </button>
            </div>
          </div>

          <Input
            label="Tên kỹ năng"
            placeholder="VD: Figma UI/UX, Lập trình React, Luyện phát âm IELTS..."
            required
            value={skillName}
            onChange={(e) => setSkillName(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mức độ thành thạo</label>
              <select
                value={proficiencyLevel}
                onChange={(e) => setProficiencyLevel(e.target.value as any)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="BEGINNER">Mới bắt đầu (Beginner)</option>
                <option value="INTERMEDIATE">Khá (Intermediate)</option>
                <option value="ADVANCED">Thành thạo (Advanced)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Hình thức trao đổi</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as any)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="ONE_ON_ONE_ONLINE">1-kèm-1 Trực tuyến</option>
                <option value="ONE_ON_ONE_OFFLINE">1-kèm-1 Trực tiếp</option>
                <option value="SMALL_GROUP">Nhóm nhỏ</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả chi tiết</label>
            <textarea
              rows={4}
              required
              placeholder="Mô tả kinh nghiệm, nội dung bạn có thể chia sẻ hoặc mục tiêu bạn cần được hướng dẫn..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => navigate('/skill-exchange')}>Hủy</Button>
            <Button variant="secondary" type="submit" isLoading={isLoading}>Đăng tin ngay</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
