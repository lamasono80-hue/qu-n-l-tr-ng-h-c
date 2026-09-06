import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, MessageSquare, Menu, User as UserIcon, LogOut, Shield, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-indigo-200">
                U
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-slate-800 bg-clip-text text-transparent">
                UniConnect
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/chat"
              className="p-2 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-slate-100 relative transition-colors"
              title="Tin nhắn"
            >
              <MessageSquare className="w-5 h-5" />
            </Link>

            <Link
              to="/notifications"
              className="p-2 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-slate-100 relative transition-colors"
              title="Thông báo"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] text-[10px] font-bold text-white bg-red-500 rounded-full px-1">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>

            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.full_name || 'User'}
                    className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm border border-indigo-200">
                    {(user?.full_name || user?.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <span className="hidden md:inline-block text-sm font-medium text-slate-700 max-w-[120px] truncate">
                  {user?.full_name || user?.email}
                </span>
              </button>

              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-20">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {user?.full_name || 'Sinh viên'}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                      {user?.is_profile_complete ? (
                        <span className="inline-flex items-center gap-1 mt-1 text-[11px] text-emerald-600 font-medium">
                          <CheckCircle2 className="w-3 h-3" /> Hồ sơ hoàn thiện
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 mt-1 text-[11px] text-amber-600 font-medium">
                          ⚠️ Chưa hoàn thiện hồ sơ
                        </span>
                      )}
                    </div>

                    <Link
                      to="/profile/me"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      Hồ sơ cá nhân
                    </Link>

                    {user?.role === 'ADMIN' && (
                      <Link
                        to="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-indigo-600 font-medium hover:bg-indigo-50"
                      >
                        <Shield className="w-4 h-4" />
                        Trang quản trị (Admin)
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Đăng xuất
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
