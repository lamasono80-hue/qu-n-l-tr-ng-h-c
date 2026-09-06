import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { projectService } from '../../services/projectService';
import { studyService } from '../../services/studyService';
import { skillExchangeService } from '../../services/skillExchangeService';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';

export const AdminModerationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'PROJECT_POST' | 'STUDY_REQUEST' | 'SKILL_LISTING'>('PROJECT_POST');
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedEntity, setSelectedEntity] = useState<{ id: string; title: string } | null>(null);
  const [reason, setReason] = useState('Nội dung vi phạm quy tắc chuẩn mực cộng đồng sinh viên.');
  const [isRemoving, setIsRemoving] = useState(false);

  const fetchListings = async () => {
    try {
      setIsLoading(true);
      if (activeTab === 'PROJECT_POST') {
        const res = await projectService.getProjects({ limit: 20 });
        if (res.data) setItems(res.data);
      } else if (activeTab === 'STUDY_REQUEST') {
        const res = await studyService.getStudyRequests({ limit: 20 });
        if (res.data) setItems(res.data);
      } else {
        const res = await skillExchangeService.getSkillListings({ limit: 20 });
        if (res.data) setItems(res.data);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [activeTab]);

  const handleRemove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEntity || !reason.trim()) return;
    try {
      setIsRemoving(true);
      await adminService.removeListing(activeTab, selectedEntity.id, reason.trim());
      setSelectedEntity(null);
      fetchListings();
    } catch {
      alert('Không thể gỡ bài đăng lúc này.');
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Kiểm Duyệt Bài Đăng Vi Phạm</h1>
        <p className="text-xs text-slate-400 mt-1">
          Gỡ bài đăng vi phạm sang trạng thái REMOVED_BY_ADMIN và lưu vết nhật ký kiểm duyệt (BR-009)
        </p>
      </div>

      <div className="flex gap-3 border-b border-slate-700 pb-3">
        {[
          { id: 'PROJECT_POST', label: 'Tuyển nhóm dự án' },
          { id: 'STUDY_REQUEST', label: 'Tìm bạn cùng học' },
          { id: 'SKILL_LISTING', label: 'Trao đổi kỹ năng' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl bg-slate-800/80 border border-slate-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-700">
              <tr>
                <th className="px-6 py-3.5">Tiêu đề / Nội dung</th>
                <th className="px-6 py-3.5">Tác giả</th>
                <th className="px-6 py-3.5">Trạng thái</th>
                <th className="px-6 py-3.5 text-right">Kiểm duyệt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-slate-400">Đang tải danh sách bài đăng...</td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-slate-400">Không có bài đăng nào trong mục này.</td>
                </tr>
              ) : (
                items.map((item) => {
                  const title = item.title || item.topic || item.skill_name;
                  return (
                    <tr key={item.id} className="hover:bg-slate-700/40">
                      <td className="px-6 py-4">
                        <span className="font-bold text-white block">{title}</span>
                        <span className="text-[11px] text-slate-400 line-clamp-1">{item.description}</span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-300">{item.author_name}</td>
                      <td className="px-6 py-4">
                        <Badge variant={item.status === 'OPEN' ? 'green' : 'slate'} size="sm">
                          {item.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {item.status !== 'REMOVED_BY_ADMIN' ? (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setSelectedEntity({ id: item.id, title })}
                            className="text-[11px] py-1 px-2.5"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1" /> Gỡ bài
                          </Button>
                        ) : (
                          <span className="text-xs text-red-400 font-semibold">Đã gỡ</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={!!selectedEntity}
        onClose={() => setSelectedEntity(null)}
        title={`Gỡ bài đăng vi phạm (BR-009)`}
      >
        <form onSubmit={handleRemove} className="space-y-4">
          <p className="text-xs text-slate-600">
            Bài đăng "{selectedEntity?.title}" sẽ chuyển trạng thái sang REMOVED_BY_ADMIN và lưu vết nhật ký kiểm duyệt bất biến.
          </p>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Lý do gỡ bài (bắt buộc)</label>
            <textarea
              rows={3}
              required
              minLength={5}
              maxLength={500}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setSelectedEntity(null)}>Hủy</Button>
            <Button variant="danger" type="submit" isLoading={isRemoving}>Gỡ bài đăng</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
