// StudentLayout.tsx
import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { LayoutDashboard, Users, BookOpen, Sparkles, MessageSquare } from 'lucide-react';
import { clsx } from 'clsx';

export const StudentLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const mobileNavItems = [
    { to: '/dashboard', label: 'Trang chủ', icon: LayoutDashboard },
    { to: '/projects', label: 'Dự án', icon: Users },
    { to: '/study-buddy', label: 'Bạn học', icon: BookOpen },
    { to: '/skill-exchange', label: 'Kỹ năng', icon: Sparkles },
    { to: '/chat', label: 'Tin nhắn', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar onToggleSidebar={() => setSidebarOpen(true)} />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto pb-20 lg:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Fixed Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-2 py-1.5 flex justify-around items-center">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  'flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-medium transition-colors',
                  isActive ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-900'
                )
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      <Footer />
    </div>
  );
};
