import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { AdminUserItem, UserStatus } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Pagination } from '../../components/ui/Pagination';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedUser, setSelectedUser] = useState<AdminUserItem | null>(null);
  const [targetStatus, setTargetStatus] = useState<'ACTIVE' | 'SUSPENDED'>('SUSPENDED');
  const [reason, setReason] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await adminService.getUsers({
        page,
        limit: 15,
        search: search.trim() || undefined,
        status: selectedStatus === 'ALL' ? undefined : (selectedStatus as UserStatus),
      });
      if (res.data) setUsers(res.data);
      if (res.meta?.total_pages) setTotalPages(res.meta.total_pages);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, selectedStatus]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const openStatusModal = (u: AdminUserItem, status: 'ACTIVE' | 'SUSPENDED') => {
    setSelectedUser(u);
    setTargetStatus(status);
    setReason(status === 'SUSPENDED' ? 'Vi phạm quy tắc cộng đồng' : 'Đã hoàn tất xác minh mở khóa');
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !reason.trim()) return;
    try {
      setIsUpdating(true);
      await adminService.updateUserStatus(selectedUser.id, targetStatus, reason.trim());
      setSelectedUser(null);
      fetchUsers();
    } catch {
      alert('Không thể cập nhật trạng thái người dùng lúc này.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Quản Lý Người Dùng</h1>
        <p className="text-xs text-slate-400 mt-1">Danh sách tài khoản sinh viên và công cụ quản trị trạng thái (BR-007)</p>
      </div>

      <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Tìm kiếm theo email trường hoặc tên sinh viên..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-600 bg-slate-900 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <Button type="submit" variant="primary" size="md">Tìm kiếm</Button>
        </form>

        <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-700">
          {['ALL', 'ACTIVE', 'PENDING_VERIFICATION', 'SUSPENDED'].map((st) => (
            <button
              key={st}
              onClick={() => { setSelectedStatus(st); setPage(1); }}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                selectedStatus === st
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {st === 'ALL' ? 'Tất cả' : st === 'ACTIVE' ? 'Đang hoạt động' : st === 'SUSPENDED' ? 'Đã khóa' : 'Chờ xác thực'}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-slate-800/80 border border-slate-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-700">
              <tr>
                <th className="px-6 py-3.5">Sinh viên</th>
                <th className="px-6 py-3.5">Email trường</th>
                <th className="px-6 py-3.5">Khoa / Ngành</th>
                <th className="px-6 py-3.5">Trạng thái</th>
                <th className="px-6 py-3.5 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-400">Đang tải dữ liệu người dùng...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-400">Không tìm thấy người dùng phù hợp.</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-700/40">
                    <td className="px-6 py-4 font-semibold text-white">{u.full_name || 'Chưa cập nhật tên'}</td>
                    <td className="px-6 py-4">{u.email}</td>
                    <td className="px-6 py-4 text-slate-400">{u.major || 'Chưa cập nhật'}</td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={u.status === 'ACTIVE' ? 'green' : u.status === 'SUSPENDED' ? 'red' : 'amber'}
                        size="sm"
                      >
                        {u.status === 'ACTIVE' ? 'Hoạt động' : u.status === 'SUSPENDED' ? 'Đã khóa' : 'Chờ xác thực'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {u.status === 'ACTIVE' ? (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => openStatusModal(u, 'SUSPENDED')}
                          className="text-[11px] py-1 px-2.5"
                        >
                          Khóa
                        </Button>
                      ) : (
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => openStatusModal(u, 'ACTIVE')}
                          className="text-[11px] py-1 px-2.5"
                        >
                          Mở khóa
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title={targetStatus === 'SUSPENDED' ? `Khóa tài khoản: ${selectedUser?.email}` : `Mở khóa tài khoản: ${selectedUser?.email}`}
      >
        <form onSubmit={handleUpdateStatus} className="space-y-4">
          <p className="text-xs text-slate-600">
            {targetStatus === 'SUSPENDED'
              ? 'Tài khoản sau khi khóa sẽ lập tức bị hủy phiên làm việc và không thể thực hiện bất kỳ thao tác nào (BR-007).'
              : 'Tài khoản sẽ được khôi phục trạng thái hoạt động.'}
          </p>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Lý do kiểm duyệt (bắt buộc)</label>
            <textarea
              rows={3}
              required
              minLength={5}
              maxLength={500}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setSelectedUser(null)}>Hủy</Button>
            <Button variant={targetStatus === 'SUSPENDED' ? 'danger' : 'success'} type="submit" isLoading={isUpdating}>
              Xác nhận
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
