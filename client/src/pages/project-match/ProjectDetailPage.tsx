import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Send, CheckCircle2, Lock } from 'lucide-react';
import { projectService } from '../../services/projectService';
import { useAuth } from '../../context/AuthContext';
import { ProjectPost } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { ApiError } from '../../services/apiClient';

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [project, setProject] = useState<ProjectPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [introNote, setIntroNote] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applySuccess, setApplySuccess] = useState(false);

  const fetchProject = async () => {
    try {
      setIsLoading(true);
      const res = await projectService.getProjectById(id!);
      if (res.data) setProject(res.data);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplyError(null);
    if (!introNote.trim()) {
      setApplyError('Vui lòng nhập lời giới thiệu bản thân');
      return;
    }
    try {
      setIsApplying(true);
      await projectService.applyProject(id!, introNote.trim());
      setApplySuccess(true);
      setTimeout(() => {
        setIsApplyModalOpen(false);
        fetchProject();
      }, 1500);
    } catch (err) {
      if (err instanceof ApiError) {
        setApplyError(err.message);
      } else {
        setApplyError('Không thể gửi đơn ứng tuyển vào lúc này.');
      }
    } finally {
      setIsApplying(false);
    }
  };

  const handleCloseProject = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn đóng bài đăng tuyển này?')) return;
    try {
      await projectService.closeProject(id!);
      fetchProject();
    } catch {
      // ignore
    }
  };

  if (isLoading) {
    return <Skeleton className="h-72 w-full rounded-2xl" />;
  }

  if (!project) {
    return (
      <div className="text-center py-12 text-slate-500">
        Không tìm thấy thông tin bài đăng dự án.
      </div>
    );
  }

  const isOwner = user?.id === project.author_id;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link to="/projects" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800">
        <ArrowLeft className="w-4 h-4" /> Quay lại danh sách dự án
      </Link>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="blue">
                {project.category === 'COURSEWORK' ? 'Đồ án môn học' : project.category === 'HACKATHON' ? 'Hackathon' : 'Dự án'}
              </Badge>
              <Badge variant={project.status === 'OPEN' ? 'green' : 'slate'}>
                {project.status === 'OPEN' ? 'Đang tuyển thành viên' : project.status === 'FULL' ? 'Đã đủ số lượng' : 'Đã đóng'}
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{project.title}</h1>
          </div>

          <div className="text-right shrink-0">
            <span className="text-xs text-slate-400 block">Hạn ứng tuyển</span>
            <span className="text-sm font-bold text-slate-700">{new Date(project.deadline).toLocaleDateString('vi-VN')}</span>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/60">
          <div className="flex items-center gap-3">
            {project.author_avatar ? (
              <img src={project.author_avatar} alt={project.author_name} className="w-11 h-11 rounded-xl object-cover" />
            ) : (
              <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center">
                {project.author_name[0]}
              </div>
            )}
            <div>
              <p className="text-sm font-bold text-slate-800">{project.author_name}</p>
              <p className="text-xs text-slate-500">{project.author_major || 'Sinh viên đại học'}</p>
            </div>
          </div>
          <Link to={`/profile/${project.author_id}`}>
            <Button variant="outline" size="sm">Xem hồ sơ</Button>
          </Link>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Mô tả chi tiết dự án</h3>
          <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{project.description}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Kỹ năng yêu cầu</h3>
            <div className="flex flex-wrap gap-2">
              {project.skills.map((s) => (
                <Badge key={s.id} variant="slate">{s.name}</Badge>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Số lượng thành viên</h3>
            <p className="text-sm font-bold text-indigo-600">
              Đã tuyển: {project.accepted_slots} / {project.total_slots} người (Còn {project.total_slots - project.accepted_slots} chỗ)
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          {isOwner ? (
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Link to={`/projects/${project.id}/applications`}>
                <Button variant="primary">Quản lý ứng viên</Button>
              </Link>
              {project.status === 'OPEN' && (
                <Button variant="danger" onClick={handleCloseProject}>Đóng bài đăng</Button>
              )}
            </div>
          ) : (
            <div>
              {project.status !== 'OPEN' ? (
                <Button disabled variant="outline">
                  <Lock className="w-4 h-4 mr-1.5" /> Bài đăng đã đóng hoặc đã đủ người
                </Button>
              ) : (
                <Button variant="primary" onClick={() => setIsApplyModalOpen(true)}>
                  <Send className="w-4 h-4 mr-1.5" /> Ứng tuyển tham gia nhóm
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={isApplyModalOpen} onClose={() => setIsApplyModalOpen(false)} title={`Ứng tuyển: ${project.title}`}>
        {applySuccess ? (
          <div className="text-center py-6">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
            <h4 className="text-base font-bold text-slate-900">Gửi đơn ứng tuyển thành công!</h4>
            <p className="text-xs text-slate-500 mt-1">Trưởng nhóm sẽ nhận được thông báo để xem xét hồ sơ của bạn.</p>
          </div>
        ) : (
          <form onSubmit={handleApply} className="space-y-4">
            {applyError && (
              <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs font-medium">{applyError}</div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Lời giới thiệu ngắn & Lý do muốn tham gia (tối đa 500 ký tự)
              </label>
              <textarea
                rows={4}
                required
                maxLength={500}
                placeholder="Giới thiệu về kinh nghiệm, các kỹ năng phù hợp hoặc mong muốn học hỏi của bạn đối với đề tài này..."
                value={introNote}
                onChange={(e) => setIntroNote(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-[11px] text-slate-400 block text-right">{introNote.length}/500</span>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" type="button" onClick={() => setIsApplyModalOpen(false)}>Hủy</Button>
              <Button variant="primary" type="submit" isLoading={isApplying}>Gửi đơn ứng tuyển</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
