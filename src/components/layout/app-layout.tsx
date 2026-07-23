'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from './sidebar-updated';
import { Header } from './header-new';
import { useRole } from '@/providers/role-provider';
import { UserRole } from '@/lib/navigation';

interface AppLayoutProps {
  children: React.ReactNode;
  userRole?: UserRole;
  userName?: string;
  hidePadding?: boolean;
}

export function AppLayout({ children, userRole: _propRole, userName: _propName, hidePadding }: AppLayoutProps) {
  const { userRole, userName, mounted, activeInstitution } = useRole();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const handleToggle = () => setIsMobileOpen(prev => !prev);
    const handleClose = () => setIsMobileOpen(false);

    window.addEventListener('toggle-mobile-sidebar', handleToggle);
    window.addEventListener('close-mobile-sidebar', handleClose);
    
    return () => {
      window.removeEventListener('toggle-mobile-sidebar', handleToggle);
      window.removeEventListener('close-mobile-sidebar', handleClose);
    };
  }, []);

  if (!mounted || !userRole) {
    return (
      <div className="flex h-screen bg-slate-50 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-slate-500 font-medium text-sm">Iniciando AulaCore...</div>
        </div>
      </div>
    );
  }

  const primaryColor = activeInstitution?.primary_color || '#6366f1';

  return (
    <div key={userRole} className="flex h-screen bg-white overflow-hidden">
      <style>{`
        :root {
          --primary: ${primaryColor};
        }
      `}</style>

      {/* Mobile Sidebar Overlay (Sliding Drawer) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden animate-fade-in">
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity cursor-pointer" 
            onClick={() => setIsMobileOpen(false)}
          />
          {/* Sidebar Drawer container */}
          <div className="relative w-60 h-full flex flex-col bg-slate-900 shadow-2xl animate-slide-in">
            {/* Close button float */}
            <div className="absolute right-4 top-4 z-50">
              <button 
                onClick={() => setIsMobileOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer border-none shadow-sm font-bold text-xs"
              >
                ✕
              </button>
            </div>
            {/* Render school sidebar inside drawer */}
            <Sidebar userRole={userRole} />
          </div>
        </div>
      )}

      {/* Desktop Sidebar (hidden on mobile, visible on lg+) */}
      <div className="hidden lg:flex shrink-0">
        <Sidebar userRole={userRole} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Header */}
        <Header userName={userName} userRole={userRole} />

        {/* Page Content */}
        <main className={hidePadding ? "flex-1 overflow-y-auto w-full" : "flex-1 overflow-y-auto bg-gradient-to-b from-slate-50 to-slate-100 p-4 md:p-6 w-full"}>
          <div className={hidePadding ? "w-full h-full" : "mx-auto max-w-[1600px] w-full px-1 md:px-6"}>{children}</div>
        </main>
      </div>
    </div>
  );
}
