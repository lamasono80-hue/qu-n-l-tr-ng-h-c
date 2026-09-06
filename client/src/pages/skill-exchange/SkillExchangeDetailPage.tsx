// SkillExchangeDetailPage.tsx (SCR-17)
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Send, CheckCircle2, Lock } from 'lucide-react';
import { skillExchangeService } from '../../services/skillExchangeService';
import { useAuth } from '../../context/AuthContext';
import { SkillListing } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { ApiError } from '../../services/apiClient';

export const SkillExchangeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [listing, setListing] = useState<SkillListing | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Proposal Modal State
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [proposalNote, setProposalNote] = useState('');
  const [isProposing, setIsProposing] = useState(false);
  const [proposalError, setProposalError] = useState<string | null>(null);
  const [proposalSuccess, setProposalSuccess] = useState(false);

  const fetchListing = async () => {
    try {
      setIsLoading(true);
      const res = await skillExchangeService.getSkillListingById(id!);
      if (res.data) setListing(res.data);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchListing();
  }, [id]);

  const handlePropose = async (e: React.FormEvent) => {
    e.preventDefault();
    setProposalError(null);
    if (!proposalNote.trim()) {
      setProposalError('Vui lòng nhập nội dung đề xuất trao đổi');
      return;
    }
    try {
      setIsProposing(true);
      await skillExchangeService.respondSkillListing(id!, proposalNote.trim());
      setProposalSuccess(true);
      setTimeout(() => {
        setIsProposalModalOpen(false);
        fetchListing();
      }, 1500);
    } catch (err) {
      if (err instanceof ApiError) {
        setProposalError(err.message);
      } else {
        setProposalError('Không thể gửi đề xuất trao đổi lúc này.');
      }
    } finally {
      setIsProposing(false);
    }
  };

  const handleClose = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn đóng bài đăng trao đổi kỹ năng này?')) return;
    try {
      await skillExchangeService.closeSkillListing(id!);
      fetchListing();
    } catch {
      // ignore
    }
  };

  if (isLoading) return <Skeleton className="h-72 w-full rounded-2xl" />;

  if (!listing) {
    return <div className="text-center py-12 text-slate-500">Không tìm thấy bài đăng trao đổi kỹ năng.</div>;
  }

  const isOwner = user?.id === listing.author_id;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link to="/skill-exchange" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800">
        <ArrowLeft className="w-4 h-4" /> Quay lại sàn kỹ năng
      </Link>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={listing.type === 'OFFER' ? 'green' : 'purple'}>
                {listing.type === 'OFFER' ? '🎓 CHIA SẺ KỸ NĂNG' : '🙋 CẦN HỌC KỸ NĂNG'}
              </Badge>
              <Badge variant="blue">
                {listing.proficiency_level === 'ADVANCED' ? 'Thành thạo' : listing.proficiency_level === 'INTERMEDIATE' ? 'Khá' : 'Mới bắt đầu'}
              </Badge>
              <Badge variant={listing.status === 'OPEN' ? 'green' : 'slate'}>
                {listing.status === 'OPEN' ? 'Đang mở đề xuất' : 'Đã đóng'}
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{listing.skill_name}</h1>
          </div>
        </div>

        {/* Author details */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/60">
          <div className="flex items-center gap-3">
            {listing.author_avatar ? (
              <img src={listing.author_avatar} alt={listing.author_name} className="w-11 h-11 rounded-xl object-cover" />
            ) : (
              <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-700 font-bold flex items-center justify-center">
                {listing.author_name[0]}
              </div>
            )}
            <div>
              <p className="text-sm font-bold text-slate-800">{listing.author_name}</p>
              <p className="text-xs text-slate-500">{listing.author_major || 'Sinh viên đại học'}</p>
            </div>
          </div>
          <Link to={`/profile/${listing.author_id}`}>
            <Button variant="outline" size="sm">Xem hồ sơ</Button>
          </Link>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Mô tả chi tiết kỹ năng</h3>
          <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{listing.description}</p>
        </div>

        <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100">
          <h3 className="text-xs font-semibold text-purple-800 uppercase tracking-wider mb-1">Hình thức trao đổi</h3>
          <p className="text-sm font-medium text-purple-900">
            {listing.format === 'ONE_ON_ONE_ONLINE' ? '1-kèm-1 Trực tuyến (Google Meet / Zoom)' : listing.format === 'ONE_ON_ONE_OFFLINE' ? '1-kèm-1 Trực tiếp (Thư viện trường)' : 'Nhóm nhỏ'}
          </p>
        </div>

        {/* Actions */}
        <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          {isOwner ? (
            <div className="flex items-center gap-3">
              <Link to={`/skill-exchange/${listing.id}/proposals`}>
                <Button variant="primary">Quản lý đề xuất</Button>
              </Link>
              {listing.status === 'OPEN' && (
                <Button variant="danger" onClick={handleClose}>Đóng bài đăng</Button>
              )}
            </div>
          ) : (
            <div>
              {listing.status !== 'OPEN' ? (
                <Button disabled variant="outline">
                  <Lock className="w-4 h-4 mr-1.5" /> Bài đăng đã đóng
                </Button>
              ) : (
                <Button variant="secondary" onClick={() => setIsProposalModalOpen(true)}>
                  <Send className="w-4 h-4 mr-1.5" /> Gửi đề xuất trao đổi
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Proposal Modal */}
      <Modal isOpen={isProposalModalOpen} onClose={() => setIsProposalModalOpen(false)} title={`Đề xuất trao đổi: ${listing.skill_name}`}>
        {proposalSuccess ? (
          <div className="text-center py-6">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
            <h4 className="text-base font-bold text-slate-900">Đã gửi đề xuất trao đổi thành công!</h4>
            <p className="text-xs text-slate-500 mt-1">Người đăng bài sẽ nhận được thông báo để xem xét đề xuất.</p>
          </div>
        ) : (
          <form onSubmit={handlePropose} className="space-y-4">
            {proposalError && (
              <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs font-medium">{proposalError}</div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nội dung đề xuất trao đổi kỹ năng (tối đa 500 ký tự)
              </label>
              <textarea
                rows={4}
                required
                maxLength={500}
                placeholder="VD: Mình có thể chia sẻ lại kỹ năng React/NodeJS nếu bạn hướng dẫn mình về Figma..."
                value={proposalNote}
                onChange={(e) => setProposalNote(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <span className="text-[11px] text-slate-400 block text-right">{proposalNote.length}/500</span>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" type="button" onClick={() => setIsProposalModalOpen(false)}>Hủy</Button>
              <Button variant="secondary" type="submit" isLoading={isProposing}>Gửi đề xuất</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
