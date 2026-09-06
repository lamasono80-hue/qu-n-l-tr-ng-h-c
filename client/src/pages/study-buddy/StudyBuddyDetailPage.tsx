// StudyBuddyDetailPage.tsx (SCR-13)
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Send, CheckCircle2, Lock } from 'lucide-react';
import { studyService } from '../../services/studyService';
import { useAuth } from '../../context/AuthContext';
import { StudyRequest } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { ApiError } from '../../services/apiClient';

export const StudyBuddyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [request, setRequest] = useState<StudyRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Connect Modal State
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [connectNote, setConnectNote] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [connectSuccess, setConnectSuccess] = useState(false);

  const fetchRequest = async () => {
    try {
      setIsLoading(true);
      const res = await studyService.getStudyRequestById(id!);
      if (res.data) setRequest(res.data);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequest();
  }, [id]);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setConnectError(null);
    if (!connectNote.trim()) {
      setConnectError('Vui lòng nhập lời nhắn học chung');
      return;
    }
    try {
      setIsConnecting(true);
      await studyService.connectStudyRequest(id!, connectNote.trim());
      setConnectSuccess(true);
      setTimeout(() => {
        setIsConnectModalOpen(false);
        fetchRequest();
      }, 1500);
    } catch (err) {
      if (err instanceof ApiError) {
        setConnectError(err.message);
      } else {
        setConnectError('Không thể gửi yêu cầu kết nối lúc này.');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleClose = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn đóng yêu cầu tìm bạn học này?')) return;
    try {
      await studyService.closeStudyRequest(id!);
      fetchRequest();
    } catch {
      // ignore
    }
  };

  if (isLoading) return <Skeleton className="h-72 w-full rounded-2xl" />;

  if (!request) {
    return <div className="text-center py-12 text-slate-500">Không tìm thấy yêu cầu học tập.</div>;
  }

  const isOwner = user?.id === request.author_id;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link to="/study-buddy" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800">
        <ArrowLeft className="w-4 h-4" /> Quay lại danh sách bạn học
      </Link>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="green">{request.course_code}</Badge>
              <Badge variant={request.study_mode === 'ONLINE' ? 'blue' : 'slate'}>
                {request.study_mode === 'ONLINE' ? 'Trực tuyến' : request.study_mode === 'OFFLINE' ? 'Trực tiếp' : 'Kết hợp'}
              </Badge>
              <Badge variant={request.status === 'OPEN' ? 'green' : 'slate'}>
                {request.status === 'OPEN' ? 'Đang tìm bạn' : 'Đã đóng'}
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{request.topic}</h1>
            <p className="text-sm text-slate-500 mt-1 font-medium">{request.course_name}</p>
          </div>
        </div>

        {/* Creator Info */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/60">
          <div className="flex items-center gap-3">
            {request.author_avatar ? (
              <img src={request.author_avatar} alt={request.author_name} className="w-11 h-11 rounded-xl object-cover" />
            ) : (
              <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center">
                {request.author_name[0]}
              </div>
            )}
            <div>
              <p className="text-sm font-bold text-slate-800">{request.author_name}</p>
              <p className="text-xs text-slate-500">{request.author_major || 'Sinh viên đại học'}</p>
            </div>
          </div>
          <Link to={`/profile/${request.author_id}`}>
            <Button variant="outline" size="sm">Xem hồ sơ</Button>
          </Link>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Mô tả mục tiêu học tập</h3>
          <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{request.description}</p>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
          <h3 className="text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1">Lịch rảnh dự kiến</h3>
          <p className="text-sm font-medium text-emerald-900">{request.availability}</p>
        </div>

        {/* Actions */}
        <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          {isOwner ? (
            <div className="flex items-center gap-3">
              <Link to={`/study-buddy/${request.id}/connections`}>
                <Button variant="primary">Xem danh sách kết nối</Button>
              </Link>
              {request.status === 'OPEN' && (
                <Button variant="danger" onClick={handleClose}>Đóng yêu cầu</Button>
              )}
            </div>
          ) : (
            <div>
              {request.status !== 'OPEN' ? (
                <Button disabled variant="outline">
                  <Lock className="w-4 h-4 mr-1.5" /> Yêu cầu đã đóng
                </Button>
              ) : (
                <Button variant="success" onClick={() => setIsConnectModalOpen(true)}>
                  <Send className="w-4 h-4 mr-1.5" /> Gửi lời mời học chung
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Connect Modal */}
      <Modal isOpen={isConnectModalOpen} onClose={() => setIsConnectModalOpen(false)} title={`Kết nối học tập: ${request.course_code}`}>
        {connectSuccess ? (
          <div className="text-center py-6">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
            <h4 className="text-base font-bold text-slate-900">Đã gửi lời mời học chung thành công!</h4>
            <p className="text-xs text-slate-500 mt-1">Bạn cùng học sẽ nhận được thông báo để phản hồi.</p>
          </div>
        ) : (
          <form onSubmit={handleConnect} className="space-y-4">
            {connectError && (
              <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs font-medium">{connectError}</div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Lời nhắn kết nối (tối đa 500 ký tự)
              </label>
              <textarea
                rows={4}
                required
                maxLength={500}
                placeholder="Chào bạn, mình cũng đang học môn này và có lịch rảnh vào..."
                value={connectNote}
                onChange={(e) => setConnectNote(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-[11px] text-slate-400 block text-right">{connectNote.length}/500</span>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" type="button" onClick={() => setIsConnectModalOpen(false)}>Hủy</Button>
              <Button variant="success" type="submit" isLoading={isConnecting}>Gửi kết nối</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
