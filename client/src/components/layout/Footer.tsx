// Footer.tsx
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4">
        <p className="font-medium text-slate-600">
          UniConnect – Nền Tảng Kết Nối Kỹ Năng & Hợp Tác Học Tập Sinh Viên
        </p>
        <p className="mt-1">
          Dự án Tốt nghiệp Đại học • Tuân thủ Zero Plaintext Credential Policy & Strict Waterfall Methodology
        </p>
        <p className="mt-1 text-slate-400">© 2026 UniConnect. Bản quyền thuộc về Nhóm Dự án Sinh viên.</p>
      </div>
    </footer>
  );
};
