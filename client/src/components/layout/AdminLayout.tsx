import React from 'react';
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, ShieldAlert, LogOut, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { clsx } from 'clsx';

export const AdminLayout: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/admin', end: true, label: 'Tổng quan hệ thống', icon: LayoutDashboard },
    { to: '/admin/users', label: 'Quản lý người dùng', icon: Users },
    { to: '/admin/moderation', label: 'Kiểm duyệt bài đăng', icon: ShieldAlert },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100">
      <header className="sticky top-0 z-40 w-full bg-slate-950/90 backdrop-blur-sm border-b border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md">
            🛡️
          </div>
          <div>
            <h1 className="text-base font-bold text-white leading-tight">UniConnect Admin Console</h1>
            <p className="text-xs text-indigo-400 font-medium">Bảng điều khiển & Kiểm duyệt hệ thống</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Về giao diện sinh viên
          </Link>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800"
            title="Đăng xuất"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <aside className="hidden md:block w-64 p-4 border-r border-slate-800 shrink-0">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-900/40'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    )
                  }
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </NavLink>
              );
            })}
          </div>
        </aside>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
