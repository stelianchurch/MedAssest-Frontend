import React from 'react';
import Sidebar from './Sidebar';

export default function DashboardLayout({ children }) {
  return (
    <div className="flex bg-gray-50 min-h-screen relative" dir="rtl">
      <Sidebar />
      {children}
    </div>
  );
}
