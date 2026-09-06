// SkillProposalsPage.tsx (SCR-19)
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Sparkles, CheckCircle2, XCircle, ArrowLeft, MessageSquare } from 'lucide-react';
import { skillExchangeService } from '../../services/skillExchangeService';
import { SkillResponse } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';

export const SkillProposalsPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isMySubmissionsView = !id;

  const [responses, setResponses] = useState<SkillResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchResponses = async () => {
    try {
      setIsLoading(true);
      const res = isMySubmissionsView
        ? await skillExchangeService.getMyResponses()
        : await skillExchangeService.getSkillListingById(id!); // In detail view
      if (res.data) {
        if (isMySubmissionsView) {
          setResponses(res.data as SkillResponse[]);
        }
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResponses();
  }, [id, isMySubmissionsView]);

  const handleResolve = async (responseId: string, action: 'ACCEPT' | 'DECLINE') => {
    if (!id) return;
    try {
      await skillExchangeService.resolveResponse(responseId, action);
      fetchResponses();
    } catch {
      // ignore
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link to={id ? `/skill-exchange/${id}` : '/dashboard'} className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800">
        <ArrowLeft className="w-4 h-4" /> Quay lại
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {isMySubmissionsView ? 'Đề xuất trao đổi kỹ năng đã gửi' : 'Quản lý đề xuất trao đổi kỹ năng'}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {isMySubmissionsView ? 'Theo dõi trạng thái các đề xuất kỹ năng bạn đã gửi' : 'Xem xét và phản hồi các đề xuất từ bạn học'}
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      ) : responses.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="Chưa có đề xuất trao đổi nào"
          description={isMySubmissionsView ? 'Bạn chưa gửi đề xuất kỹ năng nào.' : 'Chưa có ai gửi đề xuất trao đổi kỹ năng.'}
        />
      ) : (
        <div className="space-y-4">
          {responses.map((resp) => (
            <div
              key={resp.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
            >
              <div className="flex items-start gap-4">
                {resp.responder_avatar ? (
                  <img src={resp.responder_avatar} alt={resp.responder_name} className="w-12 h-12 rounded-xl object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-base">
                    {resp.responder_name[0]}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{resp.responder_name}</h3>
                    <Badge variant={resp.status === 'ACCEPTED' ? 'green' : resp.status === 'PENDING' ? 'amber' : 'red'} size="sm">
                      {resp.status === 'ACCEPTED' ? 'Đã đồng ý' : resp.status === 'PENDING' ? 'Chờ duyệt' : 'Đã từ chối'}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{resp.responder_major || 'Sinh viên'}</p>
                  <p className="text-xs text-slate-700 mt-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 max-w-lg">
                    "{resp.proposal_note}"
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap sm:flex-col items-end gap-2 shrink-0">
                {!isMySubmissionsView && resp.status === 'PENDING' && (
                  <div className="flex gap-2">
                    <Button variant="success" size="sm" onClick={() => handleResolve(resp.id, 'ACCEPT')}>
                      <CheckCircle2 className="w-4 h-4 mr-1" /> Đồng ý
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleResolve(resp.id, 'DECLINE')}>
                      <XCircle className="w-4 h-4 mr-1" /> Từ chối
                    </Button>
                  </div>
                )}

                {resp.status === 'ACCEPTED' && (
                  <Link to="/chat">
                    <Button variant="primary" size="sm">
                      <MessageSquare className="w-4 h-4 mr-1.5" /> Nhắn tin trực tiếp
                    </Button>
                  </Link>
                )}

                <Link to={`/profile/${resp.responder_id}`}>
                  <Button variant="outline" size="sm">Xem hồ sơ</Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
