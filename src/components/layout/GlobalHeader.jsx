import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSidebar } from '../../context/SidebarContext';
import ThemeToggle from '../ui/ThemeToggle';
import logo from '/public/logo.png';

export default function GlobalHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { mobileOpen, toggleMobile } = useSidebar();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const isLoginPage = location.pathname === '/';
  const isDashboardPage = !isLoginPage && !location.pathname.startsWith('/doctor');

  return (
    <header className="app-header p-2 shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center gap-4">

        <div className="flex items-center gap-3 min-w-0">
          {isDashboardPage && (
            <button
              type="button"
              className="sidebar-hamburger inline-flex lg:hidden"
              aria-label={mobileOpen ? 'إغلاق قائمة التنقل' : 'فتح قائمة التنقل'}
              aria-expanded={mobileOpen}
              onClick={toggleMobile}
            >
              <span className="text-xl leading-none" aria-hidden="true">☰</span>
            </button>
          )}

          <img src={logo} className="w-10 lg:w-14 shrink-0" alt="logo" />
          <h1 className="text-sm lg:text-xl font-bold tracking-wide truncate">
            <span className="hidden lg:inline">أبرشية حمص وتوابعها للروم الأرثوذكس - </span>
            صندوق القديس إيليان الحمصي الطبي
          </h1>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <ThemeToggle />

          {!isLoginPage && (
            <button 
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 lg:px-5 py-2 rounded-lg font-bold text-xs lg:text-sm transition-all shadow-sm border border-red-400 cursor-pointer"
            >
              تسجيل الخروج
            </button>
          )}
        </div>
        
      </div>
    </header>
  );
}