// StudyConnectionsPage.tsx (SCR-15)
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BookOpen, CheckCircle2, XCircle, ArrowLeft, MessageSquare } from 'lucide-react';
import { studyService } from '../../services/studyService';
import { StudyConnection } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';

export const StudyConnectionsPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isMySubmissionsView = !id;

  const [connections, setConnections] = useState<StudyConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchConnections = async () => {
    try {
      setIsLoading(true);
      const res = isMySubmissionsView
        ? await studyService.getMyConnections()
        : await studyService.getStudyRequestById(id!); // In detail view
      if (res.data) {
        if (isMySubmissionsView) {
          setConnections(res.data as StudyConnection[]);
        }
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, [id, isMySubmissionsView]);

  const handleResolve = async (connectionId: string, action: 'ACCEPT' | 'DECLINE') => {
    if (!id) return;
    try {
      await studyService.resolveConnection(connectionId, action);
      fetchConnections();
    } catch {
      // ignore
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link to={id ? `/study-buddy/${id}` : '/dashboard'} className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800">
        <ArrowLeft className="w-4 h-4" /> Quay lại
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {isMySubmissionsView ? 'Lời mời học chung đã gửi của tôi' : 'Quản lý kết nối học tập'}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {isMySubmissionsView ? 'Theo dõi trạng thái các lời mời học chung bạn đã gửi' : 'Xem xét và phản hồi các kết nối bạn học'}
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      ) : connections.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Chưa có lời mời học chung nào"
          description={isMySubmissionsView ? 'Bạn chưa gửi lời mời học chung nào.' : 'Chưa có ai gửi lời mời học chung.'}
        />
      ) : (
        <div className="space-y-4">
          {connections.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
            >
              <div className="flex items-start gap-4">
                {c.requester_avatar ? (
                  <img src={c.requester_avatar} alt={c.requester_name} className="w-12 h-12 rounded-xl object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-base">
                    {c.requester_name[0]}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{c.requester_name}</h3>
                    <Badge variant={c.status === 'ACCEPTED' ? 'green' : c.status === 'PENDING' ? 'amber' : 'red'} size="sm">
                      {c.status === 'ACCEPTED' ? 'Đã đồng ý' : c.status === 'PENDING' ? 'Chờ duyệt' : 'Đã từ chối'}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{c.requester_major || 'Sinh viên'}</p>
                  <p className="text-xs text-slate-700 mt-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 max-w-lg">
                    "{c.note}"
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap sm:flex-col items-end gap-2 shrink-0">
                {!isMySubmissionsView && c.status === 'PENDING' && (
                  <div className="flex gap-2">
                    <Button variant="success" size="sm" onClick={() => handleResolve(c.id, 'ACCEPT')}>
                      <CheckCircle2 className="w-4 h-4 mr-1" /> Đồng ý
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleResolve(c.id, 'DECLINE')}>
                      <XCircle className="w-4 h-4 mr-1" /> Từ chối
                    </Button>
                  </div>
                )}

                {c.status === 'ACCEPTED' && (
                  <Link to="/chat">
                    <Button variant="primary" size="sm">
                      <MessageSquare className="w-4 h-4 mr-1.5" /> Nhắn tin trực tiếp
                    </Button>
                  </Link>
                )}

                <Link to={`/profile/${c.requester_id}`}>
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
