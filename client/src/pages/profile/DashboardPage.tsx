import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, BookOpen, Sparkles, AlertTriangle, PlusCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { projectService } from '../../services/projectService';
import { studyService } from '../../services/studyService';
import { skillExchangeService } from '../../services/skillExchangeService';
import { ProjectPost, StudyRequest, SkillListing } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [myProjects, setMyProjects] = useState<ProjectPost[]>([]);
  const [myStudyRequests, setMyStudyRequests] = useState<StudyRequest[]>([]);
  const [mySkillListings, setMySkillListings] = useState<SkillListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const [projRes, studyRes, skillRes] = await Promise.all([
          projectService.getProjects({ is_mine: true, limit: 3 }),
          studyService.getStudyRequests({ is_mine: true, limit: 3 }),
          skillExchangeService.getSkillListings({ is_mine: true, limit: 3 }),
        ]);
        if (projRes.data) setMyProjects(projRes.data);
        if (studyRes.data) setMyStudyRequests(studyRes.data);
        if (skillRes.data) setMySkillListings(skillRes.data);
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-indigo-100 mb-3 border border-white/10">
            {user?.major || 'Sinh viên đại học'} {user?.year_of_study ? `• Năm ${user.year_of_study}` : ''}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">
            Xin chào, {user?.full_name || 'bạn'}! 👋
          </h1>
          <p className="mt-2 text-sm text-indigo-100 max-w-xl">
            Chào mừng bạn quay lại UniConnect. Khám phá các cơ hội ghép nhóm dự án, tìm bạn học cùng tiến hoặc trao đổi kỹ năng hôm nay.
          </p>
        </div>
      </div>

      {!user?.is_profile_complete && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900">
                Hồ sơ của bạn chưa hoàn thiện (BR-001)
              </h4>
              <p className="text-xs text-amber-700 mt-0.5">
                Vui lòng cập nhật thông tin giới thiệu, ít nhất 1 kỹ năng và 1 môn học để mở khóa tính năng đăng tin tìm nhóm, bạn học hoặc trao đổi kỹ năng.
              </p>
            </div>
          </div>
          <Link to="/profile/me" className="shrink-0 w-full sm:w-auto">
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white w-full sm:w-auto">
              Cập nhật hồ sơ ngay
            </Button>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between hover:border-indigo-200 transition-colors">
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Tìm nhóm Dự án</h3>
            <p className="text-xs text-slate-500 mt-1">
              Đăng tin tuyển thành viên hoặc ứng tuyển vào nhóm đồ án, cuộc thi.
            </p>
          </div>
          <div className="mt-6 flex flex-col gap-2">
            <Link to="/projects/create">
              <Button variant="primary" size="sm" className="w-full justify-center">
                <PlusCircle className="w-4 h-4 mr-1.5" /> Đăng tin tuyển
              </Button>
            </Link>
            <Link to="/projects">
              <Button variant="outline" size="sm" className="w-full justify-center">
                Khám phá dự án <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between hover:border-indigo-200 transition-colors">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Bạn cùng tiến</h3>
            <p className="text-xs text-slate-500 mt-1">
              Tìm bạn học chung theo môn học, ôn tập đề thi và khớp lịch rảnh.
            </p>
          </div>
          <div className="mt-6 flex flex-col gap-2">
            <Link to="/study-buddy/create">
              <Button variant="success" size="sm" className="w-full justify-center">
                <PlusCircle className="w-4 h-4 mr-1.5" /> Tạo yêu cầu học
              </Button>
            </Link>
            <Link to="/study-buddy">
              <Button variant="outline" size="sm" className="w-full justify-center">
                Tìm bạn cùng học <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between hover:border-indigo-200 transition-colors">
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Trao đổi Kỹ năng</h3>
            <p className="text-xs text-slate-500 mt-1">
              Chia sẻ kiến thức hoặc tìm người hướng dẫn 1-1 không mất phí.
            </p>
          </div>
          <div className="mt-6 flex flex-col gap-2">
            <Link to="/skill-exchange/create">
              <Button variant="secondary" size="sm" className="w-full justify-center">
                <PlusCircle className="w-4 h-4 mr-1.5" /> Đăng tin kỹ năng
              </Button>
            </Link>
            <Link to="/skill-exchange">
              <Button variant="outline" size="sm" className="w-full justify-center">
                Khám phá kỹ năng <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900">Bài đăng đang mở của bạn</h3>
          <span className="text-xs text-slate-400 font-medium">Tối đa 5 bài đăng cùng lúc (BR-002)</span>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : myProjects.length === 0 && myStudyRequests.length === 0 && mySkillListings.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            Bạn chưa có bài đăng nào đang mở. Hãy bắt đầu kết nối bằng cách tạo bài đăng mới ở trên!
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {myProjects.map((p) => (
              <div key={p.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Badge variant="blue">Dự án</Badge>
                  <div>
                    <Link to={`/projects/${p.id}`} className="text-sm font-semibold text-slate-800 hover:text-indigo-600">
                      {p.title}
                    </Link>
                    <p className="text-xs text-slate-500">Đã tuyển: {p.accepted_slots}/{p.total_slots} thành viên</p>
                  </div>
                </div>
                <Link to={`/projects/${p.id}/applications`}>
                  <Button variant="outline" size="sm">Ứng viên</Button>
                </Link>
              </div>
            ))}

            {myStudyRequests.map((s) => (
              <div key={s.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Badge variant="green">Bạn học</Badge>
                  <div>
                    <Link to={`/study-buddy/${s.id}`} className="text-sm font-semibold text-slate-800 hover:text-indigo-600">
                      {s.course_code}: {s.topic}
                    </Link>
                    <p className="text-xs text-slate-500">{s.study_mode} • {s.availability}</p>
                  </div>
                </div>
                <Link to={`/study-buddy/${s.id}/connections`}>
                  <Button variant="outline" size="sm">Kết nối</Button>
                </Link>
              </div>
            ))}

            {mySkillListings.map((k) => (
              <div key={k.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Badge variant="purple">{k.type === 'OFFER' ? 'Chia sẻ' : 'Cần học'}</Badge>
                  <div>
                    <Link to={`/skill-exchange/${k.id}`} className="text-sm font-semibold text-slate-800 hover:text-indigo-600">
                      {k.skill_name} ({k.proficiency_level})
                    </Link>
                    <p className="text-xs text-slate-500">{k.format}</p>
                  </div>
                </div>
                <Link to={`/skill-exchange/${k.id}/proposals`}>
                  <Button variant="outline" size="sm">Đề xuất</Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
