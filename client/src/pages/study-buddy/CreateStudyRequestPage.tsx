// CreateStudyRequestPage.tsx (SCR-14)
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { studyService } from '../../services/studyService';
import { profileService } from '../../services/profileService';
import { StudyMode, CourseItem } from '../../types';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ApiError } from '../../services/apiClient';

export const CreateStudyRequestPage: React.FC = () => {
  const navigate = useNavigate();

  const [courseId, setCourseId] = useState('');
  const [topic, setTopic] = useState('');
  const [studyMode, setStudyMode] = useState<StudyMode>('ONLINE');
  const [availability, setAvailability] = useState('');
  const [description, setDescription] = useState('');
  const [coursesCatalog, setCoursesCatalog] = useState<CourseItem[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const res = await profileService.getCoursesCatalog();
        if (res.data && res.data.length > 0) {
          setCoursesCatalog(res.data);
          setCourseId(res.data[0].id);
        }
      } catch {
        // ignore
      }
    };
    loadCourses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!courseId) {
      setError('Vui lòng chọn môn học');
      return;
    }
    if (topic.trim().length < 5) {
      setError('Chủ đề học tập phải có ít nhất 5 ký tự');
      return;
    }
    if (!availability.trim()) {
      setError('Vui lòng nhập thời gian rảnh');
      return;
    }
    if (description.trim().length < 10) {
      setError('Mô tả chi tiết phải có ít nhất 10 ký tự');
      return;
    }

    try {
      setIsLoading(true);
      await studyService.createStudyRequest({
        course_id: courseId,
        topic: topic.trim(),
        study_mode: studyMode,
        availability: availability.trim(),
        description: description.trim(),
      });
      navigate('/study-buddy');
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
        setError('Không thể tạo yêu cầu học vào lúc này.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link to="/study-buddy" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800">
        <ArrowLeft className="w-4 h-4" /> Quay lại
      </Link>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Đăng tin tìm bạn cùng học</h1>
          <p className="text-xs text-slate-500 mt-1">Tìm bạn học ôn tập, luyện giải đề theo từng mã môn</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Môn học</label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {coursesCatalog.map((c) => (
                <option key={c.id} value={c.id}>{c.course_code} - {c.course_name}</option>
              ))}
            </select>
          </div>

          <Input
            label="Chủ đề / Mục tiêu học tập"
            placeholder="VD: Ôn tập đề thi giữa kỳ Giải tích 2, Luyện giải bài tập..."
            required
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Hình thức học</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'ONLINE', label: 'Trực tuyến' },
                { id: 'OFFLINE', label: 'Trực tiếp' },
                { id: 'HYBRID', label: 'Kết hợp' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setStudyMode(m.id as StudyMode)}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-all ${
                    studyMode === m.id
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Thời gian rảnh dự kiến"
            placeholder="VD: Tối Thứ 2-4-6 từ 19h-21h, Chiều Chủ Nhật"
            required
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả chi tiết</label>
            <textarea
              rows={4}
              required
              placeholder="Mô tả phong cách học, mong muốn và các phần kiến thức cần tập trung..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => navigate('/study-buddy')}>Hủy</Button>
            <Button variant="success" type="submit" isLoading={isLoading}>Tạo yêu cầu ngay</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
