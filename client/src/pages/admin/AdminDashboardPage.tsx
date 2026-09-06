import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, ShieldAlert, Plus } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { SystemStats } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [skillName, setSkillName] = useState('');
  const [skillCategory, setSkillCategory] = useState('TECH');
  const [skillSuccess, setSkillSuccess] = useState<string | null>(null);

  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [courseSuccess, setCourseSuccess] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const res = await adminService.getStats();
      if (res.data) setStats(res.data);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillName.trim()) return;
    try {
      await adminService.addSkill(skillName.trim(), skillCategory);
      setSkillSuccess(`Đã thêm kỹ năng "${skillName.trim()}" thành công!`);
      setSkillName('');
      setTimeout(() => setSkillSuccess(null), 3000);
    } catch {
      alert('Không thể thêm kỹ năng (có thể đã trùng tên).');
    }
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseCode.trim() || !courseName.trim()) return;
    try {
      await adminService.addCourse(courseCode.trim(), courseName.trim());
      setCourseSuccess(`Đã thêm môn học "${courseCode.trim()}" thành công!`);
      setCourseCode('');
      setCourseName('');
      setTimeout(() => setCourseSuccess(null), 3000);
    } catch {
      alert('Không thể thêm môn học (có thể đã trùng mã).');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Tổng quan Quản trị Hệ thống</h1>
        <p className="text-xs text-slate-400 mt-1">Báo cáo số liệu thời gian thực và công cụ quản trị danh mục</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Skeleton className="h-28 bg-slate-800 rounded-2xl" />
          <Skeleton className="h-28 bg-slate-800 rounded-2xl" />
          <Skeleton className="h-28 bg-slate-800 rounded-2xl" />
          <Skeleton className="h-28 bg-slate-800 rounded-2xl" />
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700">
            <span className="text-xs text-slate-400 font-medium">Tổng người dùng</span>
            <p className="text-2xl font-extrabold text-white mt-1">{stats.total_users}</p>
            <span className="text-[10px] text-emerald-400 mt-1 block">Active: {stats.active_users}</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700">
            <span className="text-xs text-slate-400 font-medium">Tin tuyển nhóm mở</span>
            <p className="text-2xl font-extrabold text-blue-400 mt-1">{stats.active_project_posts}</p>
            <span className="text-[10px] text-slate-400 mt-1 block">Project Match</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700">
            <span className="text-xs text-slate-400 font-medium">Yêu cầu bạn học mở</span>
            <p className="text-2xl font-extrabold text-emerald-400 mt-1">{stats.active_study_requests}</p>
            <span className="text-[10px] text-slate-400 mt-1 block">Study Buddy</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700">
            <span className="text-xs text-slate-400 font-medium">Lượt kết nối thành công</span>
            <p className="text-2xl font-extrabold text-purple-400 mt-1">{stats.total_matches_formed}</p>
            <span className="text-[10px] text-purple-300 mt-1 block">Tất cả phân hệ</span>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/admin/users"
          className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700 hover:border-indigo-500 hover:bg-slate-800 transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-xl bg-indigo-600/20 text-indigo-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Quản lý Người Dùng</h3>
              <p className="text-xs text-slate-400 mt-0.5">Tìm kiếm tài khoản, kiểm tra trạng thái và khóa vi phạm (BR-007)</p>
            </div>
          </div>
        </Link>

        <Link
          to="/admin/moderation"
          className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700 hover:border-red-500 hover:bg-slate-800 transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-xl bg-red-600/20 text-red-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Kiểm Duyệt Bài Đăng</h3>
              <p className="text-xs text-slate-400 mt-0.5">Rà soát và gỡ mềm các bài đăng vi phạm chuẩn mực học đường (BR-009)</p>
            </div>
          </div>
        </Link>
      </div>

      <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-800">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
          Quản Lý Danh Mục Chuẩn Hệ Thống (Master Catalogs)
        </h3>
        <div className="flex flex-wrap gap-4">
          <Button variant="outline" size="sm" onClick={() => setIsSkillModalOpen(true)} className="border-slate-700 text-slate-200 bg-slate-800 hover:bg-slate-700">
            <Plus className="w-4 h-4 mr-1.5" /> Thêm kỹ năng chuẩn
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsCourseModalOpen(true)} className="border-slate-700 text-slate-200 bg-slate-800 hover:bg-slate-700">
            <Plus className="w-4 h-4 mr-1.5" /> Thêm môn học chuẩn
          </Button>
        </div>
      </div>

      <Modal isOpen={isSkillModalOpen} onClose={() => setIsSkillModalOpen(false)} title="Thêm kỹ năng chuẩn hệ thống">
        <form onSubmit={handleAddSkill} className="space-y-4">
          {skillSuccess && <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-lg">{skillSuccess}</div>}
          <Input label="Tên kỹ năng" placeholder="VD: Docker, Kubernetes, Figma" required value={skillName} onChange={(e) => setSkillName(e.target.value)} />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nhóm kỹ năng</label>
            <select
              value={skillCategory}
              onChange={(e) => setSkillCategory(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="TECH">Công nghệ (TECH)</option>
              <option value="LANGUAGE">Ngoại ngữ (LANGUAGE)</option>
              <option value="SOFT_SKILLS">Kỹ năng mềm (SOFT_SKILLS)</option>
              <option value="ACADEMIC">Học thuật (ACADEMIC)</option>
              <option value="OTHER">Khác (OTHER)</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setIsSkillModalOpen(false)}>Đóng</Button>
            <Button variant="primary" type="submit">Lưu kỹ năng</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isCourseModalOpen} onClose={() => setIsCourseModalOpen(false)} title="Thêm môn học vào danh mục">
        <form onSubmit={handleAddCourse} className="space-y-4">
          {courseSuccess && <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-lg">{courseSuccess}</div>}
          <Input label="Mã môn học" placeholder="VD: INT3306" required value={courseCode} onChange={(e) => setCourseCode(e.target.value)} />
          <Input label="Tên môn học" placeholder="VD: Phát triển ứng dụng Web" required value={courseName} onChange={(e) => setCourseName(e.target.value)} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setIsCourseModalOpen(false)}>Đóng</Button>
            <Button variant="primary" type="submit">Lưu môn học</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
