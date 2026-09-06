// ProjectApplicationsPage.tsx (SCR-11)
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Users, CheckCircle2, XCircle, ArrowLeft, MessageSquare } from 'lucide-react';
import { projectService } from '../../services/projectService';
import { ProjectApplication } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';

export const ProjectApplicationsPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isMySubmissionsView = !id; // If no id param, shows "My submitted applications"

  const [applications, setApplications] = useState<ProjectApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      const res = isMySubmissionsView
        ? await projectService.getMyApplications()
        : await projectService.getProjectApplications(id!);
      if (res.data) setApplications(res.data);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [id, isMySubmissionsView]);

  const handleResolve = async (appId: string, action: 'ACCEPT' | 'DECLINE') => {
    if (!id) return;
    try {
      await projectService.resolveApplication(appId, action);
      fetchApplications();
    } catch {
      // ignore
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link to={id ? `/projects/${id}` : '/dashboard'} className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800">
        <ArrowLeft className="w-4 h-4" /> Quay lại
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {isMySubmissionsView ? 'Đơn ứng tuyển dự án của tôi' : 'Quản lý đơn ứng tuyển dự án'}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {isMySubmissionsView
            ? 'Theo dõi trạng thái các đơn ứng tuyển bạn đã gửi đến các nhóm dự án'
            : 'Xem xét và chấp nhận hoặc từ chối các ứng viên gửi đơn'}
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      ) : applications.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Chưa có đơn ứng tuyển nào"
          description={isMySubmissionsView ? 'Bạn chưa gửi đơn ứng tuyển vào dự án nào.' : 'Chưa có ứng viên nào nộp đơn vào bài đăng này.'}
        />
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
            >
              <div className="flex items-start gap-4">
                {app.applicant_avatar ? (
                  <img src={app.applicant_avatar} alt={app.applicant_name} className="w-12 h-12 rounded-xl object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-base">
                    {app.applicant_name[0]}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{app.applicant_name}</h3>
                    <Badge
                      variant={
                        app.status === 'ACCEPTED'
                          ? 'green'
                          : app.status === 'PENDING'
                          ? 'amber'
                          : 'red'
                      }
                      size="sm"
                    >
                      {app.status === 'ACCEPTED' ? 'Đã chấp nhận' : app.status === 'PENDING' ? 'Chờ duyệt' : 'Đã từ chối'}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {app.applicant_major || 'Sinh viên'} {app.applicant_year ? `• Năm ${app.applicant_year}` : ''}
                  </p>
                  <p className="text-xs text-slate-700 mt-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 max-w-lg">
                    "{app.intro_note}"
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap sm:flex-col items-end gap-2 shrink-0">
                {!isMySubmissionsView && app.status === 'PENDING' && (
                  <div className="flex gap-2">
                    <Button variant="success" size="sm" onClick={() => handleResolve(app.id, 'ACCEPT')}>
                      <CheckCircle2 className="w-4 h-4 mr-1" /> Chấp nhận
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleResolve(app.id, 'DECLINE')}>
                      <XCircle className="w-4 h-4 mr-1" /> Từ chối
                    </Button>
                  </div>
                )}

                {app.status === 'ACCEPTED' && (
                  <Link to="/chat">
                    <Button variant="primary" size="sm">
                      <MessageSquare className="w-4 h-4 mr-1.5" /> Nhắn tin trực tiếp
                    </Button>
                  </Link>
                )}

                <Link to={`/profile/${app.applicant_id}`}>
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
