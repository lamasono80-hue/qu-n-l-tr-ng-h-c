import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Sparkles,
  MessageSquare,
  User,
  BookmarkCheck,
} from 'lucide-react';
import { clsx } from 'clsx';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const navItems = [
    { to: '/dashboard', label: 'Trang chủ', icon: LayoutDashboard },
    { to: '/projects', label: 'Tìm nhóm dự án', icon: Users },
    { to: '/study-buddy', label: 'Tìm bạn học', icon: BookOpen },
    { to: '/skill-exchange', label: 'Trao đổi kỹ năng', icon: Sparkles },
    { to: '/chat', label: 'Tin nhắn trực tiếp', icon: MessageSquare },
    { to: '/profile/me', label: 'Hồ sơ cá nhân', icon: User },
  ];

  const subItems = [
    { to: '/my-applications/projects', label: 'Đơn dự án đã nộp', icon: BookmarkCheck },
    { to: '/my-connections/study', label: 'Lời mời học đã gửi', icon: BookmarkCheck },
    { to: '/my-proposals/skills', label: 'Đề xuất kỹ năng đã gửi', icon: BookmarkCheck },
  ];

  const content = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 w-64 p-4">
      <div className="space-y-1">
        <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Phân hệ chính
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-indigo-50 text-indigo-600 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )
              }
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          );
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-slate-100 space-y-1">
        <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Hoạt động của tôi
        </p>
        {subItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-indigo-50 text-indigo-600 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )
              }
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block shrink-0 sticky top-16 h-[calc(100vh-4rem)]">
        {content}
      </aside>

      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-xl z-10">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
