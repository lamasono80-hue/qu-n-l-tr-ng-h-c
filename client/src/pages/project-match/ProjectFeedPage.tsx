import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Search, PlusCircle, Calendar } from 'lucide-react';
import { projectService } from '../../services/projectService';
import { ProjectPost, ProjectCategory } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Pagination } from '../../components/ui/Pagination';

export const ProjectFeedPage: React.FC = () => {
  const [projects, setProjects] = useState<ProjectPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const res = await projectService.getProjects({
        page,
        limit: 12,
        search: search.trim() || undefined,
        category: selectedCategory === 'ALL' ? undefined : (selectedCategory as ProjectCategory),
      });
      if (res.data) setProjects(res.data);
      if (res.meta?.total_pages) setTotalPages(res.meta.total_pages);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [page, selectedCategory]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProjects();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tìm nhóm Dự án</h1>
          <p className="text-sm text-slate-500 mt-0.5">Khám phá các vị trí tuyển thành viên đồ án, cuộc thi & nghiên cứu</p>
        </div>
        <Link to="/projects/create">
          <Button variant="primary">
            <PlusCircle className="w-4 h-4 mr-1.5" /> Đăng tin tuyển
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm space-y-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Tìm theo tiêu đề, kỹ năng hoặc mô tả dự án..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <Button type="submit" variant="secondary" size="md">Tìm kiếm</Button>
        </form>

        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">Thể loại:</span>
          {['ALL', 'COURSEWORK', 'HACKATHON', 'RESEARCH', 'PERSONAL'].map((cat) => (
            <button
              key={cat}
              onClick={() => { setSelectedCategory(cat); setPage(1); }}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'ALL'
                ? 'Tất cả'
                : cat === 'COURSEWORK'
                ? 'Môn học'
                : cat === 'HACKATHON'
                ? 'Hackathon'
                : cat === 'RESEARCH'
                ? 'Nghiên cứu'
                : 'Cá nhân'}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Không tìm thấy bài đăng dự án phù hợp"
          description="Hãy thử tìm kiếm với từ khóa khác hoặc là người đầu tiên đăng tin tuyển thành viên!"
          actionText="Đăng tin tuyển ngay"
          onAction={() => window.location.href = '/projects/create'}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between hover:border-indigo-300 hover:shadow-md transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <Badge variant="blue">
                    {p.category === 'COURSEWORK'
                      ? 'Đồ án môn học'
                      : p.category === 'HACKATHON'
                      ? 'Hackathon'
                      : p.category === 'RESEARCH'
                      ? 'Nghiên cứu'
                      : 'Dự án cá nhân'}
                  </Badge>
                  <Badge variant={p.status === 'OPEN' ? 'green' : 'slate'} size="sm">
                    {p.status === 'OPEN' ? 'Đang tuyển' : p.status === 'FULL' ? 'Đã đủ người' : 'Đã đóng'}
                  </Badge>
                </div>

                <Link to={`/projects/${p.id}`} className="text-base font-bold text-slate-900 hover:text-indigo-600 block line-clamp-1">
                  {p.title}
                </Link>

                <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                  {p.description}
                </p>

                <div className="flex flex-wrap gap-1.5 mt-3">
                  {p.skills.map((sk) => (
                    <span key={sk.id} className="px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-medium text-slate-700">
                      {sk.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-indigo-600">
                    👥 Còn {p.total_slots - p.accepted_slots}/{p.total_slots} chỗ
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Hạn: {new Date(p.deadline).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <Link to={`/projects/${p.id}`}>
                  <Button variant="outline" size="sm">Xem chi tiết</Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
};
