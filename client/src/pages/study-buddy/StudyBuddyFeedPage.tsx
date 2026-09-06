// StudyBuddyFeedPage.tsx (SCR-12)
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Search, PlusCircle, Calendar } from 'lucide-react';
import { studyService } from '../../services/studyService';
import { StudyRequest, StudyMode } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Pagination } from '../../components/ui/Pagination';

export const StudyBuddyFeedPage: React.FC = () => {
  const [requests, setRequests] = useState<StudyRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedMode, setSelectedMode] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchStudyRequests = async () => {
    try {
      setIsLoading(true);
      const res = await studyService.getStudyRequests({
        page,
        limit: 12,
        search: search.trim() || undefined,
        study_mode: selectedMode === 'ALL' ? undefined : (selectedMode as StudyMode),
      });
      if (res.data) setRequests(res.data);
      if (res.meta?.total_pages) setTotalPages(res.meta.total_pages);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudyRequests();
  }, [page, selectedMode]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchStudyRequests();
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tìm Bạn Cùng Học (Study Buddy)</h1>
          <p className="text-sm text-slate-500 mt-0.5">Kết nối bạn học ôn thi, giải bài tập và luyện đề theo từng môn học</p>
        </div>
        <Link to="/study-buddy/create">
          <Button variant="success">
            <PlusCircle className="w-4 h-4 mr-1.5" /> Tạo yêu cầu học
          </Button>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm space-y-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Nhập mã môn học, tên môn hoặc chủ đề cần học..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <Button type="submit" variant="secondary" size="md">Tìm kiếm</Button>
        </form>

        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">Hình thức:</span>
          {['ALL', 'ONLINE', 'OFFLINE', 'HYBRID'].map((m) => (
            <button
              key={m}
              onClick={() => { setSelectedMode(m); setPage(1); }}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                selectedMode === m
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {m === 'ALL' ? 'Tất cả' : m === 'ONLINE' ? 'Trực tuyến' : m === 'OFFLINE' ? 'Trực tiếp' : 'Kết hợp (Hybrid)'}
            </button>
          ))}
        </div>
      </div>

      {/* Card Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      ) : requests.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Không tìm thấy yêu cầu bạn học phù hợp"
          description="Hãy thử tìm kiếm với mã môn khác hoặc tạo ngay yêu cầu tìm bạn cùng tiến của bạn!"
          actionText="Tạo yêu cầu học ngay"
          onAction={() => window.location.href = '/study-buddy/create'}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {requests.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between hover:border-emerald-300 hover:shadow-md transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <Badge variant="green">{r.course_code}</Badge>
                  <Badge variant={r.study_mode === 'ONLINE' ? 'blue' : 'slate'} size="sm">
                    {r.study_mode === 'ONLINE' ? 'Trực tuyến' : r.study_mode === 'OFFLINE' ? 'Trực tiếp' : 'Kết hợp'}
                  </Badge>
                </div>

                <Link to={`/study-buddy/${r.id}`} className="text-base font-bold text-slate-900 hover:text-emerald-600 block line-clamp-1">
                  {r.topic}
                </Link>
                <span className="text-xs text-slate-500 font-medium block mt-0.5">{r.course_name}</span>

                <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                  {r.description}
                </p>

                <div className="mt-3 p-2 rounded-lg bg-slate-50 text-[11px] text-slate-600 font-medium flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Lịch rảnh: {r.availability}</span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="font-medium text-slate-700">{r.author_name}</span>
                <Link to={`/study-buddy/${r.id}`}>
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
