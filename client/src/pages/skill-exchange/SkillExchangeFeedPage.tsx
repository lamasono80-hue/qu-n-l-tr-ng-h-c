// SkillExchangeFeedPage.tsx (SCR-16)
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Search, PlusCircle } from 'lucide-react';
import { skillExchangeService } from '../../services/skillExchangeService';
import { SkillListing, SkillListingType } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Pagination } from '../../components/ui/Pagination';

export const SkillExchangeFeedPage: React.FC = () => {
  const [listings, setListings] = useState<SkillListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchSkillListings = async () => {
    try {
      setIsLoading(true);
      const res = await skillExchangeService.getSkillListings({
        page,
        limit: 12,
        search: search.trim() || undefined,
        type: selectedType === 'ALL' ? undefined : (selectedType as SkillListingType),
      });
      if (res.data) setListings(res.data);
      if (res.meta?.total_pages) setTotalPages(res.meta.total_pages);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSkillListings();
  }, [page, selectedType]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchSkillListings();
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sàn Trao Đổi Kỹ Năng (Skill Exchange)</h1>
          <p className="text-sm text-slate-500 mt-0.5">Học hỏi và chia sẻ kỹ năng peer-to-peer 1-1 giữa sinh viên</p>
        </div>
        <Link to="/skill-exchange/create">
          <Button variant="secondary">
            <PlusCircle className="w-4 h-4 mr-1.5" /> Đăng tin kỹ năng
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
              placeholder="Tìm theo tên kỹ năng (React, Figma, Photoshop, Python, IELTS...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <Button type="submit" variant="secondary" size="md">Tìm kiếm</Button>
        </form>

        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">Phân loại:</span>
          {[
            { id: 'ALL', label: 'Tất cả' },
            { id: 'OFFER', label: '🎓 Chia sẻ kỹ năng (Offers)' },
            { id: 'REQUEST', label: '🙋 Cần học kỹ năng (Requests)' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => { setSelectedType(t.id); setPage(1); }}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                selectedType === t.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t.label}
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
      ) : listings.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="Không tìm thấy bài đăng kỹ năng phù hợp"
          description="Hãy thử tìm kỹ năng khác hoặc là người đầu tiên đăng bài chia sẻ kiến thức!"
          actionText="Đăng tin kỹ năng ngay"
          onAction={() => window.location.href = '/skill-exchange/create'}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {listings.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between hover:border-purple-300 hover:shadow-md transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <Badge variant={item.type === 'OFFER' ? 'green' : 'purple'}>
                    {item.type === 'OFFER' ? '🎓 CHIA SẺ KỸ NĂNG' : '🙋 CẦN HỌC KỸ NĂNG'}
                  </Badge>
                  <Badge variant="blue" size="sm">
                    {item.proficiency_level === 'ADVANCED' ? 'Thành thạo' : item.proficiency_level === 'INTERMEDIATE' ? 'Khá' : 'Mới bắt đầu'}
                  </Badge>
                </div>

                <Link to={`/skill-exchange/${item.id}`} className="text-base font-bold text-slate-900 hover:text-purple-600 block line-clamp-1">
                  {item.skill_name}
                </Link>

                <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>

                <div className="mt-3 text-[11px] text-slate-500 font-medium">
                  Hình thức: {item.format === 'ONE_ON_ONE_ONLINE' ? '1-kèm-1 Online' : item.format === 'ONE_ON_ONE_OFFLINE' ? '1-kèm-1 Trực tiếp' : 'Nhóm nhỏ'}
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="font-medium text-slate-700">{item.author_name}</span>
                <Link to={`/skill-exchange/${item.id}`}>
                  <Button variant="outline" size="sm">Xem chi tiết & Đề xuất</Button>
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
