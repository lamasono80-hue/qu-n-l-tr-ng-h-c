// LandingPage.tsx (SCR-01)
import React from 'react';
import { Link } from 'react-router-dom';
import { Users, BookOpen, Sparkles, ArrowRight, ShieldCheck, CheckCircle2, Zap } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const LandingPage: React.FC = () => {
  return (
    <div className="bg-slate-50 min-h-[calc(100vh-4rem)] flex flex-col justify-between">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="w-4 h-4" /> Nền tảng Hợp tác Sinh viên Thế hệ Mới
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
            Kết nối Kỹ năng & Hợp tác Học tập{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
              Chuyên biệt cho Sinh viên
            </span>
          </h1>

          <p className="mt-6 max-w-2xl mx-auto text-lg text-slate-600">
            Tìm đồng đội làm đồ án môn học, thi hackathon, tìm bạn học cùng tiến và trao đổi kỹ năng 1-1 hoàn toàn miễn phí trong môi trường đại học an toàn.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto shadow-lg shadow-indigo-200">
                Bắt đầu ngay hôm nay <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Đăng nhập tài khoản
              </Button>
            </Link>
          </div>

          <div className="mt-12 flex items-center justify-center gap-6 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Xác thực email trường (.edu.vn)
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-500" /> Không quảng cáo / An toàn tuyệt đối
            </span>
          </div>
        </div>
      </section>

      {/* 3 Core Modules Showcase */}
      <section className="py-16 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Ba Trụ Cột Hợp Tác Học Thuật
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Giải pháp toàn diện hỗ trợ sinh viên hoàn thành xuất sắc các mục tiêu học tập và phát triển nghề nghiệp.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: Project Match */}
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/80 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-5">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">1. Tìm nhóm Dự án (Project Match)</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Đăng tin tuyển thành viên theo đúng vị trí và kỹ năng (Frontend, Backend, AI, UI/UX). Nhận đơn ứng tuyển và duyệt thành viên tự động.
              </p>
            </div>

            {/* Card 2: Study Buddy */}
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/80 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-5">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">2. Bạn cùng tiến (Study Buddy)</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Tìm bạn ôn thi, luyện giải bài tập lớn theo từng mã môn học cụ thể. Khớp lịch rảnh linh hoạt theo hình thức Online hoặc Thư viện.
              </p>
            </div>

            {/* Card 3: Skill Exchange */}
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/80 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-5">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">3. Trao đổi Kỹ năng (Skill Exchange)</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Học hỏi lẫn nhau theo mô hình trao đổi tri thức 1-1. Bạn dạy mình Figma, mình hỗ trợ bạn lập trình React hoặc ôn thi IELTS.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
