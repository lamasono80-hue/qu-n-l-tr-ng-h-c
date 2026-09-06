import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { projectService } from '../../services/projectService';
import { profileService } from '../../services/profileService';
import { ProjectCategory, SkillItem } from '../../types';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ApiError } from '../../services/apiClient';

export const CreateProjectPage: React.FC = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ProjectCategory>('COURSEWORK');
  const [description, setDescription] = useState('');
  const [totalSlots, setTotalSlots] = useState(2);
  const [deadline, setDeadline] = useState('');
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  const [availableSkills, setAvailableSkills] = useState<SkillItem[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSkills = async () => {
      try {
        const res = await profileService.getSkillsCatalog();
        if (res.data) setAvailableSkills(res.data);
      } catch {
        // ignore
      }
    };
    loadSkills();
  }, []);

  const toggleSkill = (id: string) => {
    if (selectedSkillIds.includes(id)) {
      setSelectedSkillIds(selectedSkillIds.filter((s) => s !== id));
    } else {
      setSelectedSkillIds([...selectedSkillIds, id]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (title.trim().length < 10) {
      setError('Tiêu đề dự án phải có ít nhất 10 ký tự');
      return;
    }
    if (description.trim().length < 20) {
      setError('Mô tả dự án phải có ít nhất 20 ký tự');
      return;
    }
    if (!deadline) {
      setError('Vui lòng chọn hạn chót ứng tuyển');
      return;
    }
    if (selectedSkillIds.length === 0) {
      setError('Vui lòng chọn ít nhất 1 kỹ năng yêu cầu');
      return;
    }

    try {
      setIsLoading(true);
      await projectService.createProject({
        title: title.trim(),
        category,
        description: description.trim(),
        total_slots: Number(totalSlots),
        deadline: new Date(deadline).toISOString(),
        skill_ids: selectedSkillIds,
      });
      navigate('/projects');
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
        setError('Không thể tạo bài đăng vào lúc này.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link to="/projects" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800">
        <ArrowLeft className="w-4 h-4" /> Quay lại
      </Link>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Đăng tin tuyển thành viên dự án</h1>
          <p className="text-xs text-slate-500 mt-1">
            Đăng tin tuyển đồng đội cho đồ án môn học, cuộc thi hackathon hoặc nghiên cứu
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Tiêu đề bài đăng"
            placeholder="VD: Tuyển 2 bạn làm đồ án Web Quản lý thư viện..."
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Thể loại dự án</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ProjectCategory)}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="COURSEWORK">Đồ án môn học (Coursework)</option>
              <option value="HACKATHON">Cuộc thi / Hackathon</option>
              <option value="RESEARCH">Nghiên cứu khoa học (Research)</option>
              <option value="PERSONAL">Dự án cá nhân (Personal)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả chi tiết dự án</label>
            <textarea
              rows={4}
              required
              placeholder="Mô tả mục tiêu của đề tài, các công việc cụ thể và yêu cầu đối với các bạn ứng tuyển..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Số thành viên cần tuyển</label>
              <input
                type="number"
                min={1}
                max={10}
                required
                value={totalSlots}
                onChange={(e) => setTotalSlots(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Hạn chót ứng tuyển</label>
              <input
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Kỹ năng cần tìm ({selectedSkillIds.length} đã chọn)
            </label>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-3 rounded-lg border border-slate-200 bg-slate-50">
              {availableSkills.map((sk) => {
                const isSelected = selectedSkillIds.includes(sk.id);
                return (
                  <button
                    key={sk.id}
                    type="button"
                    onClick={() => toggleSkill(sk.id)}
                    className={`px-3 py-1 text-xs rounded-full border transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 font-semibold'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {sk.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => navigate('/projects')}>Hủy</Button>
            <Button variant="primary" type="submit" isLoading={isLoading}>Đăng tin ngay</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
