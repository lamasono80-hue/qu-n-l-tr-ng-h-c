import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Users, BookOpen, Sparkles, MessageSquare } from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import { useNotifications } from '../../context/NotificationContext';
import { NotificationItem } from '../../types';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Pagination } from '../../components/ui/Pagination';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [unreadOnly, setUnreadOnly] = useState(false);

  const { refreshNotifications } = useNotifications();
  const navigate = useNavigate();

  const fetchNotifs = async () => {
    try {
      setIsLoading(true);
      const res = await notificationService.getNotifications({
        page,
        limit: 15,
        unread_only: unreadOnly,
      });
      if (res.data) setNotifications(res.data);
      if (res.meta?.total_pages) setTotalPages(res.meta.total_pages);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, [page, unreadOnly]);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      await refreshNotifications();
      fetchNotifs();
    } catch {
      // ignore
    }
  };

  const handleNotificationClick = async (notif: NotificationItem) => {
    if (!notif.is_read) {
      await notificationService.markAsRead(notif.id);
      await refreshNotifications();
    }
    if (notif.target_url) {
      navigate(notif.target_url);
    }
  };

  const getIcon = (type: string) => {
    if (type.startsWith('PROJECT')) return <Users className="w-5 h-5 text-blue-600" />;
    if (type.startsWith('STUDY')) return <BookOpen className="w-5 h-5 text-emerald-600" />;
    if (type.startsWith('SKILL')) return <Sparkles className="w-5 h-5 text-purple-600" />;
    return <MessageSquare className="w-5 h-5 text-indigo-600" />;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Trung Tâm Thông Báo</h1>
          <p className="text-xs text-slate-500 mt-0.5">Theo dõi các cập nhật về ứng tuyển, kết nối và tin nhắn mới</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setUnreadOnly(!unreadOnly); setPage(1); }}
            className={unreadOnly ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : ''}
          >
            {unreadOnly ? 'Hiển thị tất cả' : 'Chỉ tin chưa đọc'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
            <CheckCheck className="w-4 h-4 mr-1.5" /> Đánh dấu tất cả đã đọc
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden divide-y divide-slate-100">
        {isLoading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={Bell}
              title="Không có thông báo nào"
              description="Bạn đã xem hết tất cả thông báo hệ thống."
            />
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleNotificationClick(n)}
              className={`p-4 sm:p-5 flex items-start gap-4 cursor-pointer transition-colors ${
                n.is_read ? 'hover:bg-slate-50/80 opacity-85' : 'bg-indigo-50/40 hover:bg-indigo-50/70 font-semibold'
              }`}
            >
              <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-xs shrink-0">
                {getIcon(n.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">{n.title}</h4>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {new Date(n.created_at).toLocaleDateString('vi-VN')} {new Date(n.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.content}</p>
              </div>
              {!n.is_read && (
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0 mt-2" />
              )}
            </div>
          ))
        )}
      </div>

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
};
